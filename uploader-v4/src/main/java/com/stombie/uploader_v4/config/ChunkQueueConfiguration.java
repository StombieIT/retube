package com.stombie.uploader_v4.config;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChunkQueueConfiguration {
    @Value("${chunkQueue.amqp.connectionString}")
    private String connectionString;

    @SneakyThrows
    @Bean
    public Connection connectionFactory()  {
        ConnectionFactory connectionFactory = new ConnectionFactory();
        connectionFactory.setUri(connectionString);
        return connectionFactory.newConnection();
    }

    @SneakyThrows
    @Bean
    public Channel channel() {
        return connectionFactory().createChannel();
    }
}
