package com.stombie.uploader_v4.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FFlowCoordinatorService {
    private final Logger logger = LoggerFactory.getLogger(FFlowCoordinatorService.class);

    private final FFlowCacheService fflowCache;

    @Autowired
    public FFlowCoordinatorService(FFlowCacheService fflowCache) {
        this.fflowCache = fflowCache;
    }

    public String ensureFlowUrl(String uploadSessionId) {
        String flowUrl = fflowCache.getFFlowUrl(uploadSessionId);
        logger.info("Flow url {} {}", uploadSessionId, flowUrl);
        if (flowUrl == null) {
            // TODO: добавить логику работы с fflow api вместо заглушки
            flowUrl = "stub-url";
            logger.info("Updating flowUrl {} at {}", flowUrl, uploadSessionId);
            fflowCache.addFFlowUrl(uploadSessionId, flowUrl);
        }
        return flowUrl;
    }
}
