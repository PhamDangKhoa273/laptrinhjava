package com.bicap.core.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class ResponseSecurityHeadersFilterTests {

    @Test
    void shouldSetSecurityHeadersOnEveryResponse() throws Exception {
        ResponseSecurityHeadersFilter filter = new ResponseSecurityHeadersFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setSecure(true);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> {});

        assertThat(response.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(response.getHeader("Referrer-Policy")).isEqualTo("strict-origin-when-cross-origin");
        assertThat(response.getHeader("Permissions-Policy")).contains("geolocation=()");
        assertThat(response.getHeader("Strict-Transport-Security")).contains("max-age=31536000");
    }
}
