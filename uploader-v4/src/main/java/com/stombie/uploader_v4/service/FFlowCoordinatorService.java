package com.stombie.uploader_v4.service;

import com.stombie.uploader_v4.model.api.FFlowCreateResponse;
import com.stombie.uploader_v4.model.api.FFlowFinishParams;
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FFlowCoordinatorService {
    private final Logger logger = LoggerFactory.getLogger(FFlowCoordinatorService.class);

    private final FFlowCacheService fflowCache;
    private final ApiService api;

    @Autowired
    public FFlowCoordinatorService(FFlowCacheService fflowCache, ApiService api) {
        this.fflowCache = fflowCache;
        this.api = api;
    }

    public String ensureFlow(String uploadSessionId) {
        String flowUrl = fflowCache.getFFlowUrl(uploadSessionId);
        if (flowUrl == null || flowUrl.isEmpty()) {
            FFlowCreateResponse response = api.createFlow(uploadSessionId);
            String createdFlowUrl = response.getFlowUrl();
            fflowCache.addFFlowUrl(uploadSessionId, createdFlowUrl);
            flowUrl = createdFlowUrl;
        }
        return flowUrl;
    }

    /**
     * Отправляет данные в поток.
     *
     * @param uploadSessionId идентификатор сессии загрузки
     * @param content         массив байт с данными
     */
    public void pushToFlow(String uploadSessionId, byte[] content) {
        String flowUrl = getFlowUrl(uploadSessionId);
        api.pushToFlow(flowUrl + "/push", content);
    }

    /**
     * Удаляет поток.
     *
     * @param uploadSessionId идентификатор сессии загрузки
     */
    public void deleteFlow(String uploadSessionId) {
        logger.debug("deleteFlow: attempt {}", uploadSessionId);
        try {
            String flowUrl = fflowCache.getFFlowUrl(uploadSessionId);
            if (flowUrl == null || flowUrl.isEmpty()) {
                return;
            }
            api.deleteFlow(flowUrl + "/delete");
            fflowCache.deleteFFlowUrl(uploadSessionId);
        } catch (Exception e) {
            logger.error("Unable to delete flow", e);
        } finally {
            logger.info("deleteFlow: {}", uploadSessionId);
        }
    }

    /**
     * Завершает поток, отправляя соответствующие параметры и удаляя запись из кэша.
     *
     * @param uploadSessionId идентификатор сессии загрузки
     * @param finishParams    параметры завершения потока
     */
    public void finishFlow(String uploadSessionId, FFlowFinishParams finishParams) {
        String flowUrl = getFlowUrl(uploadSessionId);
        api.finishFlow(flowUrl + "/finish", finishParams);
        fflowCache.deleteFFlowUrl(uploadSessionId);
    }

    @NonNull
    private String getFlowUrl(String uploadSessionId) {
        String flowUrl = fflowCache.getFFlowUrl(uploadSessionId);
        if (flowUrl == null || flowUrl.isEmpty()) {
            throw new IllegalArgumentException("No flow associated with session " + uploadSessionId + " found");
        }
        return flowUrl;
    }
}
