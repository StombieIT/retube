package com.stombie.uploader_v4.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VideoChunk {
    private final String sessionId;
    private final long startByte;
    private final long size;
    private final byte[] content;

    public VideoChunk(String sessionId, long startByte, long size, byte[] content) {
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