package com.bicap.core.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.ZSetOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RedisRateLimitServiceTests {

    @Mock StringRedisTemplate redisTemplate;
    @Mock ValueOperations<String, String> valueOperations;
    @Mock ZSetOperations<String, String> zSetOperations;

    @Test
    void shouldRejectWhenBurstLimitExceeded() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(redisTemplate.opsForZSet()).thenReturn(zSetOperations);
        when(valueOperations.increment("rate-limit:ip:1.2.3.4:burst")).thenReturn(31L);

        RedisRateLimitService service = new RedisRateLimitService(redisTemplate);

        assertThatThrownBy(() -> service.check("ip", "1.2.3.4", 30, 100, Duration.ofSeconds(60), Duration.ofMinutes(10)))
                .isInstanceOf(com.bicap.core.exception.BusinessException.class);
    }
}
