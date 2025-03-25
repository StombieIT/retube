package com.stombie.uploader_v4;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UploaderV4Application {

	public static void main(String[] args) {
		SpringApplication.run(UploaderV4Application.class, args);
	}

}
