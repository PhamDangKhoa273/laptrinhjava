package com.bicap.modules.media.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebResourceConfig implements WebMvcConfigurer {

    private final MediaStorageProperties mediaStorageProperties;

    public WebResourceConfig(MediaStorageProperties mediaStorageProperties) {
        this.mediaStorageProperties = mediaStorageProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(mediaStorageProperties.getUploadDir(), "public").toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/uploads/public/**")
                .addResourceLocations(location);
    }
}
