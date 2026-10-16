package com.ndnk.exe.pdfservice.modules.health.service;

import com.ndnk.exe.pdfservice.modules.health.dto.response.HealthResponse;

public interface HealthService {
    HealthResponse getStatus();
}
