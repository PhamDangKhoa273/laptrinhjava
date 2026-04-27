package com.bicap.modules.media.controller;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.CustomUserPrincipal;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.logistics.repository.DriverRepository;
import com.bicap.modules.media.entity.MediaFile;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MediaControllerAuthorizationTests {

    @Mock MediaStorageService mediaStorageService;
    @Mock UserRepository userRepository;
    @Mock FarmRepository farmRepository;
    @Mock OrderRepository orderRepository;
    @Mock RetailerRepository retailerRepository;
    @Mock ShipmentRepository shipmentRepository;
    @Mock DriverRepository driverRepository;

    @InjectMocks MediaController controller;

    @Test
    void download_shouldAllowAdminToAccessPrivateFarmLicense() throws Exception {
        User owner = user(2L, "owner@example.com");
        User admin = user(1L, "admin@example.com");
        MediaFile mediaFile = privateMedia(owner, "FARM_LICENSE", 10L);
        setPrincipal(1L, "admin@example.com", "ROLE_ADMIN");
        when(mediaStorageService.getMedia(99L)).thenReturn(new MediaStorageService.StoredMedia(mediaFile, Path.of("missing-test-file")));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> controller.download(99L, new jakarta.servlet.http.HttpServletResponseWrapper(new org.springframework.mock.web.MockHttpServletResponse())))
                .isInstanceOf(java.nio.file.NoSuchFileException.class);
    }

    @Test
    void download_shouldAllowFarmOwnerToAccessPrivateFarmLicense() throws Exception {
        User owner = user(2L, "owner@example.com");
        Farm farm = new Farm();
        farm.setFarmId(10L);
        farm.setOwnerUser(owner);
        MediaFile mediaFile = privateMedia(user(9L, "uploader@example.com"), "FARM_LICENSE", 10L);
        setPrincipal(2L, "owner@example.com", "ROLE_FARM");
        when(mediaStorageService.getMedia(99L)).thenReturn(new MediaStorageService.StoredMedia(mediaFile, Path.of("missing-test-file")));
        when(userRepository.findById(2L)).thenReturn(Optional.of(owner));
        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));

        assertThatThrownBy(() -> controller.download(99L, new jakarta.servlet.http.HttpServletResponseWrapper(new org.springframework.mock.web.MockHttpServletResponse())))
                .isInstanceOf(java.nio.file.NoSuchFileException.class);
    }

    @Test
    void download_shouldRejectUnrelatedUserForPrivateFarmLicense() {
        User owner = user(2L, "owner@example.com");
        User stranger = user(8L, "stranger@example.com");
        Farm farm = new Farm();
        farm.setFarmId(10L);
        farm.setOwnerUser(owner);
        MediaFile mediaFile = privateMedia(owner, "FARM_LICENSE", 10L);
        setPrincipal(8L, "stranger@example.com", "ROLE_RETAILER");
        when(mediaStorageService.getMedia(99L)).thenReturn(new MediaStorageService.StoredMedia(mediaFile, Path.of("missing-test-file")));
        when(userRepository.findById(8L)).thenReturn(Optional.of(stranger));
        when(farmRepository.findById(10L)).thenReturn(Optional.of(farm));

        assertThatThrownBy(() -> controller.download(99L, new jakarta.servlet.http.HttpServletResponseWrapper(new org.springframework.mock.web.MockHttpServletResponse())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Không có quyền");
    }

    private MediaFile privateMedia(User owner, String entityType, Long entityId) {
        MediaFile mediaFile = new MediaFile();
        mediaFile.setMediaFileId(99L);
        mediaFile.setOwnerUser(owner);
        mediaFile.setEntityType(entityType);
        mediaFile.setEntityId(entityId);
        mediaFile.setVisibility("PRIVATE");
        mediaFile.setOriginalFilename("license.png");
        mediaFile.setContentType("image/png");
        mediaFile.setFileSize(100L);
        return mediaFile;
    }

    private User user(Long id, String email) {
        User user = new User();
        user.setUserId(id);
        user.setEmail(email);
        user.setFullName("User " + id);
        return user;
    }

    private void setPrincipal(Long userId, String email, String role) {
        var principal = new CustomUserPrincipal(userId, email, "N/A", "User", List.of(new SimpleGrantedAuthority(role)));
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
