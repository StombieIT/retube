package com.stombie.uploader_v4.event;

import com.stombie.uploader_v4.model.VideoChunk;
import lombok.Getter;

@Getter
public class ChunkReceivedEvent {
    private final String correlationId;
    private final VideoChunk chunk;

    public ChunkReceivedEvent(String correlationId, VideoChunk chunk) {
        this.correlationId = correlationId;
        this.chunk = chunk;
    }
}
