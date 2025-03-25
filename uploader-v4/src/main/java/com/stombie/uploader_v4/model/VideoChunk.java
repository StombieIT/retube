package com.stombie.uploader_v4.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VideoChunk {
    private final String sessionId;
    private final int startByte;
    private final int size;
    private final byte[] content;

    public VideoChunk(String sessionId, int startByte, int size, byte[] content) {
        this.sessionId = sessionId;
        this.startByte = startByte;
        this.size = size;
        this.content = content;
    }

    @Override
    public String toString() {
        return "VideoChunk{" +
                "sessionId='" + sessionId + '\'' +
                ", startByte=" + startByte +
                ", size=" + size +
                ", contentLength=" + (content != null ? content.length : 0) +
                '}';
    }
}