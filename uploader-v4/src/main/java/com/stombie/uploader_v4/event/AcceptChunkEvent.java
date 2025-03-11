package com.stombie.uploader_v4.event;

import lombok.Getter;

@Getter
public class AcceptChunkEvent {
    private final String correlationId;

    public AcceptChunkEvent(String correlationId) {
        this.correlationId = correlationId;
    }
}
