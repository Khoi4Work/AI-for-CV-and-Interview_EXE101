package fpt.su26.exe101.backend.modules.admin.controller;

import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.modules.admin.repository.AdminRepository;
import fpt.su26.exe101.backend.modules.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService service;
    @GetMapping("/users")
    public ApiResponse<AdminRepository.Page> users(@RequestParam(defaultValue="") String search,@RequestParam(defaultValue="") String status,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) { return ApiResponse.success(service.users(search,status,page,size)); }
    @GetMapping("/users/{id}")
    public ApiResponse<Map<String,Object>> user(@PathVariable UUID id) { return ApiResponse.success(service.user(id)); }
    @GetMapping("/payments")
    public ApiResponse<AdminRepository.Page> payments(@RequestParam(defaultValue="") String search,@RequestParam(defaultValue="") String status,
            @RequestParam(defaultValue="") String category,@RequestParam(defaultValue="false") boolean includeTest,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) {
        return ApiResponse.success(service.payments(search,status,category,includeTest,from,to,page,size));
    }
    @GetMapping("/payments/{id}")
    public ApiResponse<Map<String,Object>> payment(@PathVariable UUID id) { return ApiResponse.success(service.payment(id)); }
    @GetMapping("/statistics")
    public ApiResponse<Map<String,Object>> statistics(@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) { return ApiResponse.success(service.statistics(from,to)); }
}
