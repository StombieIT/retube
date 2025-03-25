package com.stombie.uploader_v4.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class FFlowCacheService {
    private static final Logger logger = LoggerFactory.getLogger(FFlowCacheService.class);

    private final StringRedisTemplate redisTemplate;

    @Autowired
    public FFlowCacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    void addFFlowUrl(String uploadSessionId, String fflowUrl) {
        try {
            redisTemplate.opsForValue().set(uploadSessionId, fflowUrl);
        } catch (Throwable e) {
            logger.error(e.getMessage(), e);
            throw e;
        }
    }

    String getFFlowUrl(String uploadSessionId) {
        try {
            return redisTemplate.opsForValue().get(uploadSessionId);
        } catch (Throwable e) {
            logger.error(e.getMessage(), e);
            throw e;
        }
    }

    String deleteFFlowUrl(String uploadSessionId) {
        try {
            return redisTemplate.opsForValue().getAndDelete(uploadSessionId);
        } catch (Throwable e) {
            logger.error(e.getMessage(), e);
            throw e;
        }
    }
}
