package com.stombie.uploader_v4.service;

import com.stombie.uploader_v4.event.AcceptChunkEvent;
import com.stombie.uploader_v4.event.ChunkReceivedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class ChunkUploadManager {
    private static final Logger logger = LoggerFactory.getLogger(ChunkUploadManager.class);

    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public ChunkUploadManager(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @EventListener
    public void handleVideoChunk(ChunkReceivedEvent chunkReceivedEvent) {
        String correlationId = chunkReceivedEvent.getCorrelationId();
        // TODO: расширить логику обработки видео чанка
        logger.info("Handling chunk {}", correlationId);
        AcceptChunkEvent acceptEvent = new AcceptChunkEvent(correlationId);
        eventPublisher.publishEvent(acceptEvent);
    }
}
