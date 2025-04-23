package com.stombie.uploader_v4.config;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChunkQueueConfiguration {
    private String connectionString;
    private long connectionPollingTime;

    @Autowired
    public ChunkQueueConfiguration(@Value("${chunkQueue.amqp.connectionString}") String connectionString,
                                   @Value("${chunkQueue.amqp.connectionPollingTime}") long connectionPollingTime) {
        this.connectionString = connectionString;
        this.connectionPollingTime = connectionPollingTime;
    }

    @SneakyThrows
    @Bean
    public Connection connectionFactory()  {
        return createConnection();
    }

    @SneakyThrows
    @Bean
    public Channel channel() {
        return connectionFactory().createChannel();
    }

    @SneakyThrows
    private Connection createConnection() {
        while (true) {
            try {
                ConnectionFactory connectionFactory = new ConnectionFactory();
                connectionFactory.setUri(connectionString);
                return connectionFactory.newConnection();
            } catch (Throwable e) {
                System.err.println("Error connecting: " + e.getMessage());
                // Пауза перед следующей попыткой
                Thread.sleep(connectionPollingTime);
            }
        }
    }
}
