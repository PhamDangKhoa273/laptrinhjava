package com.bicap.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.internet.MimeMessage;

@Configuration
public class MailFallbackConfig {

    @Bean
    public JavaMailSender noopJavaMailSender() {
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
                // no-op fallback for local/test environments
            }

            @Override
            public void send(MimeMessage... mimeMessages) {
                // no-op fallback for local/test environments
            }

            @Override
            public void send(org.springframework.mail.SimpleMailMessage simpleMessage) {
                // no-op fallback for local/test environments
            }

            @Override
            public void send(org.springframework.mail.SimpleMailMessage... simpleMessages) {
                // no-op fallback for local/test environments
            }
        };
    }
}
