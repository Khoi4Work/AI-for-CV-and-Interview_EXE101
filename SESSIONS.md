# Project Session Logs

This file tracks the progress of the project across different sessions to ensure a seamless handover.

## [2026-06-09] Session 1: Project Initialization & Security Page Fix
... (giữ nguyên các session trước) ...

## [2026-09-23] Session: Backend Architecture Standardization & Recovery
... (giữ nguyên) ...

## [2026-09-27] Session: Auth Refactoring & Asset Gallery Implementation
### 🎯 Goals
- Chuẩn hóa Coding Standard cho Module Auth theo chuẩn của Module Gallery.
- Triển khai toàn bộ các lớp (Repository -> Service -> Controller) cho Asset Gallery Module.
- Xây dựng hệ thống quản lý Template và Feedback.
- Fix lỗi redirect 302 sang Google khi chưa authorize trên Swagger.

### ✅ Completed
- [x] **Auth Module Refactor**: Đổi tên DTOs (thêm hậu tố `DTO`), tách Interface/Impl cho `AuthService` và `AccountService`, cập nhật `ApiException` và `ErrorCode`.
- [x] **Asset Gallery Module**: 
    - Triển khai `GalleryService` và `GalleryController` cho quản lý tài sản (CVs, JDs).
    - Triển khai logic tự động khởi tạo Gallery cho user.
    - Triển khai hệ thống Lịch sử phỏng vấn (Interview History).
    - Triển khai `TemplateService` và `TemplateController` cho quản lý mẫu CV và hệ thống feedback.
- [x] **Security Fix**: Implement `CustomAuthenticationEntryPoint` để trả về 401 Unauthorized thay vì redirect sang Google khi chưa đăng nhập.
- [x] **Verification**: Hoàn thành bộ Integration Test cho `GalleryController` và được Agent Reviewer **APPROVED**.

### 🚩 Current State & Checkpoint
- **Current Branch**: `dev`
- **Auth Status**: Hoàn thiện chuẩn hóa coding style và bảo mật.
- **Gallery Status**: Hoàn thiện 100% tính năng (Assets, JDs, History, Templates, Feedback).
- **Build Status**: Đã fix lỗi MapStruct/Lombok thông qua cập nhật `pom.xml` và rebuild.

### 🚀 Next Steps
1. Triển khai **Payment & Billing Module**: 
    - Implement Checkout flow.
    - Tích hợp Payment Gateway Webhooks.
    - Quản lý Orders và Invoices.
    - Quản lý hệ thống hạn mức người dùng (User Usage Quota).
