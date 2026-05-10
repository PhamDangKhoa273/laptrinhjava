package com.bicap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
<<<<<<< Updated upstream

@SpringBootApplication
=======
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.bicap")
@EnableJpaRepositories(basePackages = {"com.bicap.modules", "com.bicap.core"})
@EntityScan(basePackages = {"com.bicap.modules", "com.bicap.core"})
>>>>>>> Stashed changes
public class BicapApplication {

    public static void main(String[] args) {
        SpringApplication.run(BicapApplication.class, args);
    }
}