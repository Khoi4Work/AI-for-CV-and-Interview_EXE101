package com.ndnk.exe.pdfservice.modules.health.service.impl;

import com.ndnk.exe.pdfservice.base.exception.ApiException;
import com.ndnk.exe.pdfservice.base.exception.ErrorCode;
import com.ndnk.exe.pdfservice.modules.health.dto.response.HealthResponse;
import com.ndnk.exe.pdfservice.modules.health.service.HealthService;
import com.ndnk.exe.pdfservice.modules.health.service.SystemHealthProbe;
import org.springframework.stereotype.Service;

@Service
public class HealthServiceImpl implements HealthService {
    private final SystemHealthProbe healthProbe;

    public HealthServiceImpl(SystemHealthProbe healthProbe) {
        this.healthProbe = healthProbe;
    }

    @Override
    public HealthResponse getStatus() {
        if (!healthProbe.isHealthy()) {
            throw new ApiException(ErrorCode.SERVICE_UNAVAILABLE, "PDF service is not healthy");
        }
        return new HealthResponse("UP", "pdf-service");
    }
}
