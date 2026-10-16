package fpt.su26.exe101.backend.base.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

/** Enables declarative clients for the application's external services. */
@Configuration
@EnableFeignClients(basePackages = "fpt.su26.exe101.backend")
public class ExternalServicesFeignConfig {
}
