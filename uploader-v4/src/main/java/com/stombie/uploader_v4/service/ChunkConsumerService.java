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

    private static String toString(LongString longString) {
        return new String(longString.getBytes(), StandardCharsets.UTF_8);
    }

    private final Channel amqpChannel;
    private final Set<String> hangingChunkCorrelationIds;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final String uploadQueue;
    private final String replyQueue;
    private final String exchange;

    @Autowired
    public ChunkConsumerService(Channel amqpChannel, ApplicationEventPublisher applicationEventPublisher,
                                @Value("${chunkQueue.amqp.uploadQueue}") String uploadQueue,
                                @Value("${chunkQueue.amqp.replyQueue}") String replyQueue,
                                @Value("${chunkQueue.amqp.exchange}") String exchange) {
        this.amqpChannel = amqpChannel;
        this.hangingChunkCorrelationIds = new HashSet<>();
        this.applicationEventPublisher = applicationEventPublisher;
        this.uploadQueue = uploadQueue;
        this.replyQueue = replyQueue;
        this.exchange = exchange;
    }

    @PostConstruct
    public void init() throws IOException {
        /* Декларируем очереди именно через passive, так как их инициализацией занимается
           головной сервис gateway */
        amqpChannel.queueDeclarePassive(uploadQueue);
        amqpChannel.queueDeclarePassive(replyQueue);

        amqpChannel.exchangeDeclarePassive(this.exchange);
        amqpChannel.queueBind(this.replyQueue, this.exchange, "reply.*");
        amqpChannel.basicConsume(this.uploadQueue, false, this::handleDelivery, this::handleCancelDelivery);
    }

    @EventListener
    public void acceptChunk(AcceptChunkEvent event) {
        String correlationId = event.getCorrelationId();
        logger.info("Successfully accepted chunk {}", correlationId);
        this.reply(event.getCorrelationId(), "ack", null);
    }

    @EventListener
    public void rejectChunk(RejectChunkEvent event) {
        String correlationId = event.getCorrelationId();
        logger.warn("Rejecting chunk {}", correlationId);
        this.reply(correlationId, "nack", event.getErrorMessage());
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
            logger.info("Published reply: {}", correlationId);
            hangingChunkCorrelationIds.remove(correlationId);
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
    }

    private void handleDelivery(String consumerTag, Delivery delivery) {
        logger.info("Consuming some chunk");
        if (delivery == null) {
            return;
        }
        try {
            AMQP.BasicProperties props = delivery.getProperties();
            Map<String, Object> headers = props.getHeaders();
            if (headers == null ||
                    !(headers.get("x-session-id") instanceof LongString sessionIdLong) ||
                    !(headers.get("x-correlation-id") instanceof LongString correlationIdLong) ||
                    !(headers.get("x-start-byte") instanceof Number) ||
                    !(headers.get("x-size") instanceof Number)) {
                amqpChannel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
                return;
            }

            amqpChannel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

            String sessionId = toString(sessionIdLong);
            String correlationId = toString(correlationIdLong);
            logger.info("Got chunk with cid {}", correlationId);
            int startByte = ((Number) headers.get("x-start-byte")).intValue();
            int size = ((Number) headers.get("x-size")).intValue();
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