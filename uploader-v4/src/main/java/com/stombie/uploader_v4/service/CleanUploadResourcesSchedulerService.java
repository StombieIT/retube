package com.stombie.uploader_v4.service;

import com.stombie.uploader_v4.event.CleanUploadResourcesEvent;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "scheduler.cleanUploadResources.enabled", havingValue = "true")
public class CleanUploadResourcesSchedulerService {
    private static final Logger logger = LoggerFactory.getLogger(CleanUploadResourcesSchedulerService.class);

    private final ApplicationEventPublisher eventPublisher;
    private final int videoTtl;

    @Autowired
    public CleanUploadResourcesSchedulerService(ApplicationEventPublisher eventPublisher,
                                                @Value("${video.ttl}") int videoTtl) {
        this.eventPublisher = eventPublisher;
        this.videoTtl = videoTtl;
    }

    @Scheduled(fixedDelayString = "${scheduler.cleanUploadResources.sleepTime}")
    public void scheduleClean() {
        logger.info("Scheduler tick");
        eventPublisher.publishEvent(new CleanUploadResourcesEvent(videoTtl));
    }
}
