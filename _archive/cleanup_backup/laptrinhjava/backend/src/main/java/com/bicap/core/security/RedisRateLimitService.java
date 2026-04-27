package com.bicap.core.security;

import com.bicap.core.exception.BusinessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
public class RedisRateLimitService {

    private static final int DEFAULT_BURST_LIMIT = 10;
    private static final int DEFAULT_SLIDING_LIMIT = 30;
    private static final Duration DEFAULT_WINDOW = Duration.ofSeconds(60);
    private static final Duration DEFAULT_SLIDING_WINDOW = Duration.ofMinutes(10);

    private final StringRedisTemplate redisTemplate;

    public RedisRateLimitService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void check(String scope, String identity) {
        check(scope, identity, DEFAULT_BURST_LIMIT, DEFAULT_SLIDING_LIMIT, DEFAULT_WINDOW, DEFAULT_SLIDING_WINDOW);
    }

    public void check(String scope, String identity, int burstLimit, int slidingLimit, Duration window, Duration slidingWindow) {
        String normalizedIdentity = identity == null || identity.isBlank() ? "anonymous" : identity.trim();
        String burstKey = key(scope, normalizedIdentity, "burst");
        String slidingKey = key(scope, normalizedIdentity, "sliding");
        String slidingTsKey = key(scope, normalizedIdentity, "sliding-ts");

        long nowMs = Instant.now().toEpochMilli();
        long slidingWindowMs = slidingWindow.toMillis();

        Long burstCount = redisTemplate.opsForValue().increment(burstKey);
        if (burstCount != null && burstCount == 1L) {
            redisTemplate.expire(burstKey, window);
        }
        if (burstCount != null && burstCount > burstLimit) {
            throw new BusinessException("Yêu cầu quá nhanh, vui lòng thử lại sau");
        }

        redisTemplate.opsForZSet().add(slidingKey, String.valueOf(nowMs), (double) nowMs);
        redisTemplate.expire(slidingKey, slidingWindow);
        redisTemplate.opsForZSet().removeRangeByScore(slidingKey, 0.0, (double) (nowMs - slidingWindowMs));
        Long slidingCount = redisTemplate.opsForZSet().zCard(slidingKey);
        if (slidingCount != null && slidingCount > slidingLimit) {
            throw new BusinessException("Yêu cầu quá nhiều trong khoảng thời gian ngắn, vui lòng thử lại sau");
        }

        redisTemplate.opsForValue().set(slidingTsKey, String.valueOf(nowMs), slidingWindow.toMillis(), TimeUnit.MILLISECONDS);
    }

    public void checkPerUser(String userId) {
        check("user", userId);
    }

    public void checkPerIp(String ip) {
        check("ip", ip);
    }

    public void checkPerRouteClass(String routeClass, String identity) {
        check("route:" + routeClass, identity);
    }

    private String key(String scope, String identity, String suffix) {
        return "rate-limit:" + scope + ":" + identity + ":" + suffix;
    }
}
