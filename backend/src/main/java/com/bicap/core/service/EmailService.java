package com.bicap.core.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username:}")
    private String fromAddress;

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendEmail(@NonNull String to, @NonNull String subject, @NonNull String content) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("SMTP chưa được cấu hình, bỏ qua email gửi tới {}", to);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            log.info("Đã gửi email '{}' tới {}", subject, to);
        } catch (Exception ex) {
            log.error("Không thể gửi email '{}' tới {}", subject, to, ex);
            throw new IllegalStateException("Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP.", ex);
        }
    }

    public void sendPasswordResetEmail(@NonNull String to, @NonNull String resetLink) {
        String content = String.format("""
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Khôi phục mật khẩu</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Chào bạn,</p>
                    <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản BICAP của bạn. Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của mình:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Đặt lại mật khẩu</a>
                    </div>
                    <p>Đường link này sẽ hết hạn sau 30 phút. Nếu bạn không yêu cầu việc này, vui lòng bỏ qua email này.</p>
                </div>
                <div style="background-color: #f8f9fa; color: #777; padding: 10px; text-align: center; font-size: 12px;">
                    © 2026 BICAP Platform. All rights reserved.
                </div>
            </div>
            """, resetLink);
        
        sendEmail(to, "[BICAP] Đặt lại mật khẩu", content);
    }
}
