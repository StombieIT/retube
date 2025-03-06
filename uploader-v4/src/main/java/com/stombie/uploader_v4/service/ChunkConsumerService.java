package com.stombie.uploader_v4.service;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Delivery;
import com.rabbitmq.client.LongString;
import com.stombie.uploader_v4.event.AcceptChunkEvent;
import com.stombie.uploader_v4.event.ChunkReceivedEvent;
import com.stombie.uploader_v4.event.RejectChunkEvent;
import com.stombie.uploader_v4.model.VideoChunk;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class ChunkConsumerService {
    private static final Logger logger = LoggerFactory.getLogger(ChunkConsumerService.class);

    private static final String toString(LongString longString) {
        return new String(longString.getBytes(), StandardCharsets.UTF_8);
    }

    private final Channel amqpChannel;
    private final Set<String> hangingChunkCorrelationIds;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Value("${chunkQueue.amqp.uploadQueue}")
    private String uploadQueue;
    @Value("${chunkQueue.amqp.replyQueue}")
    private String replyQueue;
    @Value("${chunkQueue.amqp.exchange}")
    private String exchange;

    @Autowired
    public ChunkConsumerService(Channel amqpChannel, ApplicationEventPublisher applicationEventPublisher) {
        this.amqpChannel = amqpChannel;
        this.hangingChunkCorrelationIds = new HashSet<>();
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @PostConstruct
    public void init() throws IOException {
        /* Декларируем очереди именно через passive, так как их инициализацией занимается
           головной сервис gateway */
        amqpChannel.queueDeclarePassive(uploadQueue);
        amqpChannel.queueDeclarePassive(replyQueue);

        amqpChannel.exchangeDeclare(this.exchange, "topic");
        amqpChannel.queueBind(this.replyQueue, this.exchange, "reply.*");
        amqpChannel.basicConsume(this.uploadQueue, false, this::handleDelivery, this::handleCancelDelivery);
    }

    @EventListener
    public void acceptChunk(AcceptChunkEvent event) {
        this.reply(event.getCorrelationId(), "ack", null);
    }

    @EventListener
    public void rejectChunk(RejectChunkEvent event) {
        this.reply(event.getCorrelationId(), "nack", event.getErrorMessage());
    }

    private void reply(String correlationId, String status, String errorMessage) {
        if (!hangingChunkCorrelationIds.contains(correlationId)) {
            return;
        }

        Map<String, Object> headers = new HashMap<>();
        headers.put("x-correlation-id", correlationId);
        headers.put("x-status", status);
        if (errorMessage != null) {
            headers.put("x-error", errorMessage);
        }
        AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
                .headers(headers)
                .build();

        String routingKey = "reply." + correlationId;
        try {
            /* Указываем в качестве первого параметра пустую строку, так как очереди не привязаны к какому-либо обменнику.
               В качестве body нагрузки передаем пустой массив, так как сообщение не содержит как таковой полезной нагрузки */
            amqpChannel.basicPublish(this.exchange, routingKey, props, new byte[0]);
            hangingChunkCorrelationIds.remove(correlationId);
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
    }

    private void handleDelivery(String consumerTag, Delivery delivery) {
        if (delivery == null) {
            return;
        }
        try {
            AMQP.BasicProperties props = delivery.getProperties();
            Map<String, Object> headers = props.getHeaders();
            if (headers == null ||
                    !(headers.get("x-session-id") instanceof LongString) ||
                    !(headers.get("x-correlation-id") instanceof LongString) ||
                    !(headers.get("x-start-byte") instanceof Number) ||
                    !(headers.get("x-size") instanceof Number)) {
                amqpChannel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
                return;
            }

            amqpChannel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

            LongString sessionIdLong = (LongString) headers.get("x-session-id");
            LongString correlationIdLong = (LongString) headers.get("x-correlation-id");
            String sessionId = toString(sessionIdLong);
            String correlationId = toString(correlationIdLong);
            long startByte = ((Number) headers.get("x-start-byte")).longValue();
            long size = ((Number) headers.get("x-size")).longValue();
            byte[] content = delivery.getBody();

            // Добавляем correlationId в список "висящих" (ожидающих) чанков
            hangingChunkCorrelationIds.add(correlationId);

            // Создаем объект чанка
            VideoChunk chunk = new VideoChunk(sessionId, startByte, size, content);
            applicationEventPublisher.publishEvent(new ChunkReceivedEvent(correlationId, chunk));
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
    }

    private void handleCancelDelivery(String consumerTag) {
        logger.error("Cancelled delivery with consumer tag {}", consumerTag);
    }
}