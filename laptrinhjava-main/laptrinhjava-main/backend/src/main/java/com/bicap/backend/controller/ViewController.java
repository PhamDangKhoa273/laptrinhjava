package com.bicap.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@Controller
public class ViewController {

    private final String API = "http://localhost:8080/api";
    private RestTemplate rest = new RestTemplate();

    // 1. Marketplace
    @GetMapping("/")
    public String marketplace(Model model) {
        Object products = rest.getForObject(API + "/products", Object.class);
        model.addAttribute("products", products);
        return "marketplace";
    }

    // 2. Search
    @GetMapping("/search")
    public String search(@RequestParam String keyword, Model model) {
        Object products = rest.getForObject(API + "/products/search?q=" + keyword, Object.class);
        model.addAttribute("products", products);
        return "marketplace";
    }

    // 3. Product Detail
    @GetMapping("/product/{id}")
    public String detail(@PathVariable int id, Model model) {
        Object product = rest.getForObject(API + "/products/" + id, Object.class);
        model.addAttribute("product", product);
        return "product-detail";
    }

    // 4. Order Page
    @GetMapping("/order")
    public String orderPage() {
        return "order";
    }

    // 5. Create Order
    @PostMapping("/order")
    public String createOrder(@RequestParam int productId) {
        rest.postForObject(API + "/orders", productId, Object.class);
        return "redirect:/tracking";
    }

    // 6. Tracking
    @GetMapping("/tracking")
    public String tracking(Model model) {
        Object orders = rest.getForObject(API + "/orders", Object.class);
        model.addAttribute("orders", orders);
        return "tracking";
    }
}