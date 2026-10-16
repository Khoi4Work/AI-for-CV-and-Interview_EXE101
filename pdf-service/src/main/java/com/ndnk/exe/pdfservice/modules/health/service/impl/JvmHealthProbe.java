package com.ndnk.exe.pdfservice.modules.health.service.impl;

import com.ndnk.exe.pdfservice.modules.health.service.SystemHealthProbe;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;

@Component
public class JvmHealthProbe implements SystemHealthProbe {
    @Override
    public boolean isHealthy() {
        return ManagementFactory.getRuntimeMXBean().getUptime() > 0;
    }
}
