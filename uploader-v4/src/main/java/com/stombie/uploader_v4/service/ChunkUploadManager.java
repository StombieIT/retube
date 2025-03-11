package com.stombie.uploader_v4.service;

import com.stombie.uploader_v4.entity.UploadSession;
import com.stombie.uploader_v4.event.AcceptChunkEvent;
import com.stombie.uploader_v4.event.ChunkReceivedEvent;
import com.stombie.uploader_v4.event.RejectChunkEvent;
import com.stombie.uploader_v4.model.VideoChunk;
import com.stombie.uploader_v4.repository.UploadSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class ChunkUploadManager {
    private static final Logger logger = LoggerFactory.getLogger(ChunkUploadManager.class);

    private final ApplicationEventPublisher eventPublisher;
    private final UploadSessionRepository uploadSessionRepository;

    @Autowired
    public ChunkUploadManager(ApplicationEventPublisher eventPublisher,
                              UploadSessionRepository uploadSessionRepository) {
        this.eventPublisher = eventPublisher;
        this.uploadSessionRepository = uploadSessionRepository;
    }

    @EventListener
    public void handleVideoChunk(ChunkReceivedEvent chunkReceivedEvent) {
        String correlationId = chunkReceivedEvent.getCorrelationId();
        VideoChunk chunk = chunkReceivedEvent.getChunk();
        String sessionId = chunk.getSessionId();
        int size = chunk.getSize();
        int startByte = chunk.getStartByte();
        byte[] content = chunk.getContent();

        logger.info("Handling video chunk {}:{}", correlationId, sessionId);

        Optional<UploadSession> uploadSessionCandidate = uploadSessionRepository.findById(UUID.fromString(sessionId));
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

        // TODO: добавить логику работы с fflow
        uploadSession.setUploadedBytes(updatedUploadedBytes);
        uploadSessionRepository.save(uploadSession);

        AcceptChunkEvent acceptEvent = new AcceptChunkEvent(correlationId);
        eventPublisher.publishEvent(acceptEvent);
    }
}
