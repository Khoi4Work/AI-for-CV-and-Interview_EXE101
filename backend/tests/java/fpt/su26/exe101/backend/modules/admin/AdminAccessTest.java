package fpt.su26.exe101.backend.modules.admin;

import fpt.su26.exe101.backend.modules.admin.controller.AdminController;
import fpt.su26.exe101.backend.modules.admin.repository.AdminRepository;
import fpt.su26.exe101.backend.modules.admin.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@ContextConfiguration(classes={AdminController.class,AdminAccessTest.Config.class})
class AdminAccessTest {
    @Configuration @EnableMethodSecurity
    static class Config {
        @Bean SecurityFilterChain filter(HttpSecurity http) throws Exception {
            return http.authorizeHttpRequests(auth->auth.requestMatchers("/api/admin/**").hasRole("ADMIN").anyRequest().permitAll())
                    .exceptionHandling(ex->ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))).build();
        }
    }
    @Autowired MockMvc mvc;
    @MockBean AdminService service;
    @Test void anonymousCannotReadAdminData() throws Exception {
        mvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized()); verifyNoInteractions(service);
    }
    @Test @WithMockUser(roles="ATTENDANCE") void userCannotReadAdminData() throws Exception {
        mvc.perform(get("/api/admin/users")).andExpect(status().isForbidden()); verifyNoInteractions(service);
    }
    @Test @WithMockUser(roles="ADMIN") void adminCanReadPaginatedData() throws Exception {
        when(service.users("","",0,20)).thenReturn(new AdminRepository.Page(List.of(),0,0,20));
        mvc.perform(get("/api/admin/users")).andExpect(status().isOk()).andExpect(jsonPath("$.result.totalElements").value(0));
    }
}
