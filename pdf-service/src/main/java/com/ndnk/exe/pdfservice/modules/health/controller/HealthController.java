package com.ndnk.exe.pdfservice.modules.health.controller;

import com.ndnk.exe.pdfservice.base.response.ApiResponse;
import com.ndnk.exe.pdfservice.modules.health.dto.response.HealthResponse;
import com.ndnk.exe.pdfservice.modules.health.service.HealthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {
    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<HealthResponse>> health() {
        return ResponseEntity.ok(ApiResponse.success(healthService.getStatus()));
    }
}
