package com.bicap.backend.controller;

import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.auth.LoginRequest;
import com.bicap.backend.dto.auth.RegisterRequest;
import com.bicap.backend.dto.request.UpdateProfileRequest;
import com.bicap.backend.service.AuthService;
import com.bicap.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
@RequestMapping
public class WebController {

    private final AuthService authService;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @GetMapping({"/", "/login"})
    public String loginPage(Model model) {
        if (!model.containsAttribute("loginRequest")) {
            model.addAttribute("loginRequest", new LoginRequest());
        }
        return "login";
    }

    @PostMapping("/login")
    public String login(@Valid @ModelAttribute("loginRequest") LoginRequest loginRequest,
                        BindingResult bindingResult,
                        HttpSession session,
                        RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.loginRequest", bindingResult);
            redirectAttributes.addFlashAttribute("loginRequest", loginRequest);
            return "redirect:/login";
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail().trim().toLowerCase(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            session.setAttribute("SPRING_SECURITY_CONTEXT", context);

            return "redirect:/dashboard";
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("loginError", "Sai email hoặc mật khẩu");
            redirectAttributes.addFlashAttribute("loginRequest", loginRequest);
            return "redirect:/login";
        }
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        if (!model.containsAttribute("registerRequest")) {
            model.addAttribute("registerRequest", new RegisterRequest());
        }
        return "register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("registerRequest") RegisterRequest registerRequest,
                           BindingResult bindingResult,
                           RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.registerRequest", bindingResult);
            redirectAttributes.addFlashAttribute("registerRequest", registerRequest);
            return "redirect:/register";
        }

        try {
            authService.register(registerRequest);
            redirectAttributes.addFlashAttribute("successMessage", "Đăng ký thành công. Hãy đăng nhập.");
            return "redirect:/login";
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("registerError", ex.getMessage());
            redirectAttributes.addFlashAttribute("registerRequest", registerRequest);
            return "redirect:/register";
        }
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        UserResponse user = userService.getCurrentUserProfile();
        model.addAttribute("user", user);
        model.addAttribute("pageTitle", "Dashboard");
        return "dashboard";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        UserResponse user = userService.getCurrentUserProfile();
        UpdateProfileRequest form = new UpdateProfileRequest();
        form.setFullName(user.getFullName());
        form.setPhone(user.getPhone());
        form.setAvatarUrl(user.getAvatarUrl());

        if (!model.containsAttribute("profileForm")) {
            model.addAttribute("profileForm", form);
        }
        model.addAttribute("user", user);
        model.addAttribute("pageTitle", "Profile");
        return "profile";
    }

    @PostMapping("/profile")
    public String updateProfile(@Valid @ModelAttribute("profileForm") UpdateProfileRequest profileForm,
                                BindingResult bindingResult,
                                RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.profileForm", bindingResult);
            redirectAttributes.addFlashAttribute("profileForm", profileForm);
            return "redirect:/profile";
        }

        try {
            userService.updateCurrentUserProfile(profileForm);
            redirectAttributes.addFlashAttribute("successMessage", "Cập nhật hồ sơ thành công");
        } catch (Exception ex) {
            redirectAttributes.addFlashAttribute("profileError", ex.getMessage());
            redirectAttributes.addFlashAttribute("profileForm", profileForm);
        }

        return "redirect:/profile";
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        SecurityContextHolder.clearContext();
        session.invalidate();
        return "redirect:/login";
    }

    @ModelAttribute("roleLabel")
    public String roleLabel() {
        return "BICAP";
    }
}
