package com.stombie.uploader_v4.service;

import com.stombie.uploader_v4.entity.Flow;
import com.stombie.uploader_v4.entity.UploadSession;
import com.stombie.uploader_v4.entity.Video;
import com.stombie.uploader_v4.event.AcceptChunkEvent;
import com.stombie.uploader_v4.event.ChunkReceivedEvent;
import com.stombie.uploader_v4.event.CleanUploadResourcesEvent;
import com.stombie.uploader_v4.event.RejectChunkEvent;
import com.stombie.uploader_v4.model.FlowStatus;
import com.stombie.uploader_v4.model.VideoChunk;
import com.stombie.uploader_v4.model.VideoStatus;
import com.stombie.uploader_v4.model.api.FFlowFinishParams;
import com.stombie.uploader_v4.repository.FlowRepository;
import com.stombie.uploader_v4.repository.UploadSessionRepository;
import com.stombie.uploader_v4.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@Service
public class ChunkUploadManager {
    private static final Logger logger = LoggerFactory.getLogger(ChunkUploadManager.class);

    private final ReentrantLock lock = new ReentrantLock();
    private final ApplicationEventPublisher eventPublisher;
    private final FlowRepository flowRepository;
    private final UploadSessionRepository uploadSessionRepository;
    private final VideoRepository videoRepository;
    private final FFlowCoordinatorService fflowCoordinator;

    @Autowired
    public ChunkUploadManager(ApplicationEventPublisher eventPublisher,
                              UploadSessionRepository uploadSessionRepository,
                              FlowRepository flowRepository,
                              VideoRepository videoRepository,
                              FFlowCoordinatorService fflowCoordinator) {
        this.eventPublisher = eventPublisher;
        this.flowRepository = flowRepository;
        this.videoRepository = videoRepository;
        this.uploadSessionRepository = uploadSessionRepository;
        this.fflowCoordinator = fflowCoordinator;
    }

    @EventListener
    @Transactional
    public void handleVideoChunk(ChunkReceivedEvent chunkReceivedEvent) {
        String correlationId = chunkReceivedEvent.getCorrelationId();
        VideoChunk chunk = chunkReceivedEvent.getChunk();
        String sessionId = chunk.getSessionId();
        int size = chunk.getSize();
        int startByte = chunk.getStartByte();
        byte[] content = chunk.getContent();

        logger.info("Handling video chunk {}:{}", correlationId, sessionId);

        lock.lock();
        try {
            Optional<UploadSession> uploadSessionCandidate = uploadSessionRepository.findById(UUID.fromString(sessionId));
            logger.info("Do session search");
            if (uploadSessionCandidate.isEmpty()) {
                eventPublisher.publishEvent(new RejectChunkEvent(correlationId, String.format(
                        "No upload session found with id %s",
                        sessionId
                )));
                return;
            }

            int updatedUploadedBytes = startByte + size;
            UploadSession uploadSession = uploadSessionCandidate.get();
            if (startByte != uploadSession.getUploadedBytes() ||
                    updatedUploadedBytes > uploadSession.getTotalBytes()) {
                eventPublisher.publishEvent(new RejectChunkEvent(
                        correlationId,
                        "Bytes position mismatches"
                ));
                return;
            }
            logger.info("Successfully validated chunk {}", correlationId);

            fflowCoordinator.ensureFlow(sessionId);
            fflowCoordinator.pushToFlow(sessionId, content);

            uploadSession.setUploadedBytes(updatedUploadedBytes);
            uploadSessionRepository.save(uploadSession);
            if (updatedUploadedBytes == uploadSession.getTotalBytes()) {
                Flow flow = uploadSession.getFlow();
                Video video = flow.getVideo();
                fflowCoordinator.finishFlow(
                        sessionId,
                        new FFlowFinishParams.Builder()
                                .setSavingPath("/" + video.getId() + "/" + flow.getId())
                                .build()
                );
                flow.setStatus(FlowStatus.DISTRIBUTED);
                flowRepository.save(flow);
                List<Flow> flows = flowRepository.findByVideo_Id(video.getId());
                boolean allDistributed = flows.stream().allMatch(f -> f.getStatus() == FlowStatus.DISTRIBUTED);
                if (allDistributed) {
                    video.setStatus(VideoStatus.DISTRIBUTED);
                    videoRepository.save(video);
                }
                uploadSessionRepository.delete(uploadSession);
            }

            AcceptChunkEvent acceptEvent = new AcceptChunkEvent(correlationId);
            eventPublisher.publishEvent(acceptEvent);
        } catch (Exception err) {
            logger.error("Error during handling chunk: {}", err.getMessage());
            eventPublisher.publishEvent(new RejectChunkEvent(correlationId, err.getMessage()));
        } finally {
            lock.unlock();
        }
    }

    @EventListener
    @Transactional
    public void handleCleanEvent(CleanUploadResourcesEvent cleanEvent) {
        int videoTtl = cleanEvent.getVideoTtl();
        logger.info("Cleaning videos with ttl {}", videoTtl);
        lock.lock();
        try {
            Instant expiredThreshold = Instant.now().minusMillis(videoTtl);

            // Ищем видео, удовлетворяющие условию: созданные до пороговой даты и со статусом CREATED или UPLOADING.
            List<Video> videos = videoRepository.findByCreatedAtLessThanEqualAndStatusIn(
                    expiredThreshold, List.of(VideoStatus.CREATED, VideoStatus.UPLOADING));

            if (!videos.isEmpty()) {
                Set<UUID> uploadSessionIds = videos.stream()
                        .flatMap(video -> video.getFlows().stream())
                        .map(Flow::getUploadSession)
                        .filter(Objects::nonNull)
                        .map(UploadSession::getId)
                        .collect(Collectors.toSet());
                logger.debug("Need to delete: {}", uploadSessionIds);

                for (UUID uploadSessionId : uploadSessionIds) {
                    fflowCoordinator.deleteFlow(uploadSessionId.toString());
                }

                videoRepository.deleteAll(videos);
                logger.debug("Cleaned flows: {}", uploadSessionIds);
            }
        } catch (Exception err) {
            logger.error("Error during cleaning: {}", err.getMessage());
        } finally {
            lock.unlock();
        }
    }
}
