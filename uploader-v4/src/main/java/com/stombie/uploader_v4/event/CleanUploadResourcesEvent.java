package com.stombie.uploader_v4.event;

import lombok.Getter;

@Getter
public class CleanUploadResourcesEvent {
    private final int videoTtl;

    public CleanUploadResourcesEvent(int videoTtl) {
        this.videoTtl = videoTtl;
    }
}
