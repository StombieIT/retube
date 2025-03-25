package com.stombie.uploader_v4.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConfiguration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

@Configuration
public class FFlowCacheConfiguration {
    private final String host;
    private final int port;
    private final int db;

    @Autowired
    public FFlowCacheConfiguration(@Value("${cache.redis.host}") String host,
                                   @Value("${cache.redis.port}") int port,
                                   @Value("${cache.redis.fflowDB}") int db) {
        this.host = host;
        this.port = port;
        this.db = db;
    }

    @Bean
    public RedisConfiguration redisConfiguration() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(this.host);
        redisConfig.setPort(this.port);
        redisConfig.setDatabase(this.db);
        return redisConfig;
    }

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(redisConfiguration());
    }
}
