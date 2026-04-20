package com.bicap.core.security;

import com.bicap.core.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final int maxRequests;
    private final Duration windowDuration;

    public RateLimitService(
            @Value("${app.rate-limit.max-requests:30}") int maxRequests,
            @Value("${app.rate-limit.window-seconds:60}") long windowSeconds) {
        this.maxRequests = maxRequests;
        this.windowDuration = Duration.ofSeconds(windowSeconds);
    }

    public void check(String key) {
        Instant now = Instant.now();
        Window window = windows.compute(key, (ignored, existing) -> {
            if (existing == null || now.isAfter(existing.startedAt.plus(windowDuration))) {
                return new Window(now, 1);
            }
            existing.count++;
            return existing;
        });

        if (window.count > maxRequests) {
            throw new BusinessException("Yêu cầu quá nhiều, vui lòng thử lại sau");
        }
    }

    private static class Window {
        private final Instant startedAt;
        private int count;

        private Window(Instant startedAt, int count) {
            this.startedAt = startedAt;
            this.count = count;
        }
    }
}
