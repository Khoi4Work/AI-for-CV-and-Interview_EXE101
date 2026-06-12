package fpt.su26.exe101.backend.base.security;

import fpt.su26.exe101.backend.base.config.CorsConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class DevSecurityConfig {
    private final CorsConfig corsConfig;
        @Bean
        public SecurityFilterChain securityFilterChain (HttpSecurity http) throws Exception {
            http
                    .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                    .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for API testing
                    .authorizeHttpRequests(auth -> auth
                            // Allow access to Swagger UI and API Docs
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                            // Allow access to all API endpoints for testing purposes
                            .requestMatchers("/api/**").permitAll()
                            // All other requests must be authenticated (default behavior)
                            .anyRequest().authenticated()
                    )
                    .formLogin(AbstractHttpConfigurer::disable) // Disable the default login form
                    .httpBasic(AbstractHttpConfigurer::disable); // Disable Basic Auth prompt

            return http.build();
        }
    }

