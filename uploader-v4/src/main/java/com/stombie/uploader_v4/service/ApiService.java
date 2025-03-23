package com.stombie.uploader_v4.service;

import com.stombie.uploader_v4.model.api.FFlowBaseResponse;
import com.stombie.uploader_v4.model.api.FFlowCreateResponse;
import com.stombie.uploader_v4.model.api.FFlowFinishParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ApiService {
    private final WebClient webClient;
    private final WebClient baseWebClient;

    @Autowired
    public ApiService(@Value("${api.baseFFlowUrl}") String baseFFlowUrl,
                      WebClient.Builder webClientBuilder) {
        webClient = webClientBuilder.build();
        baseWebClient = webClientBuilder.baseUrl(baseFFlowUrl).build();
    }

    /**
     * Создание нового потока.
     * @param uploadSessionId идентификатор сессии загрузки
     */
    public FFlowCreateResponse createFlow(String uploadSessionId) {
        String url = "/" + uploadSessionId;
        try {
            return baseWebClient.post()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(FFlowCreateResponse.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Error creating flow: " + e.getMessage(), e);
        }
    }

    /**
     * Удаление потока видео
     * @param deleteUrl - урл, по которому происходит удаление
     */
    public FFlowBaseResponse deleteFlow(String deleteUrl) {
        try {
            return webClient.delete()
                    .uri(deleteUrl)
                    .retrieve()
                    .bodyToMono(FFlowBaseResponse.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Error deleting flow: " + e.getMessage(), e);
        }
    }

    /**
     * Завершение потока.
     * @param finishUrl URL для завершения потока
     * @param params параметры запроса для завершения потока
     */
    public FFlowBaseResponse finishFlow(String finishUrl, FFlowFinishParams params) {
        try {
            return webClient.post()
                    .uri(finishUrl)
                    .bodyValue(params)
                    .retrieve()
                    .bodyToMono(FFlowBaseResponse.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Error finishing flow: " + e.getMessage(), e);
        }
    }

    /**
     * Отправка данных в поток.
     * @param pushUrl URL для отправки данных
     * @param data фактический чанк видео
     */
    public FFlowBaseResponse pushToFlow(String pushUrl, byte[] data) {
        try {
            return webClient.post()
                    .uri(pushUrl)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .bodyValue(data)
                    .retrieve()
                    .bodyToMono(FFlowBaseResponse.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Error pushing data to flow: " + e.getMessage(), e);
        }
    }
}
