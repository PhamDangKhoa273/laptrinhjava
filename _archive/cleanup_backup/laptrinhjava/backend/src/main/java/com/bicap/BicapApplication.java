package com.bicap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BicapApplication {

	public static void main(String[] args) {
		SpringApplication.run(BicapApplication.class, args);
	}

}

