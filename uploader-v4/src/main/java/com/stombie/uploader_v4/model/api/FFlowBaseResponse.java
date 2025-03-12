package com.stombie.uploader_v4.model;

import lombok.Getter;
import org.springframework.lang.Nullable;

@Getter
public class FFlowBaseResponse {
    private String status;
    @Nullable
    private String message;
}
