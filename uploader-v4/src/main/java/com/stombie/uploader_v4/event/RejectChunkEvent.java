package com.stombie.uploader_v4.event;

import lombok.Getter;

@Getter
public class RejectChunkEvent {
    private final String correlationId;
    private final String errorMessage;

    public RejectChunkEvent(String correlationId, String errorMessage) {
        this.correlationId = correlationId;
        this.errorMessage = errorMessage;
    }
}
