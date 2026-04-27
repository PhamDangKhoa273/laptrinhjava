package com.bicap.core.config;

import jakarta.mail.internet.MimeMessage;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Configuration
public class JavaMailSenderConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        return new JavaMailSender() {
            @Override
            public MimeMessage createMimeMessage() {
                return null;
            }

            @Override
            public MimeMessage createMimeMessage(java.io.InputStream contentStream) {
                return null;
            }

            @Override
            public void send(MimeMessage mimeMessage) {
                // no-op
            }

            @Override
            public void send(MimeMessage... mimeMessages) {
                // no-op
            }

            @Override
            public void send(SimpleMailMessage simpleMessage) {
                // no-op
            }

            @Override
            public void send(SimpleMailMessage... simpleMessages) {
                // no-op
            }
        };
    }
}
