# Project Session Logs

This file tracks the progress of the project across different sessions to ensure a seamless handover.

## [2026-06-09] Session 1: Project Initialization & Security Page Fix
... (giữ nguyên các session trước) ...

## [2026-09-23] Session: Backend Architecture Standardization & Recovery
... (giữ nguyên) ...

## [2026-09-26] Session: Auth Security Upgrade & Gallery Foundation
### 🎯 Goals
- Nâng cấp bảo mật Social Login (Google) bằng cách xác thực `id_token`.
- Hoàn thiện logic 3 API quan trọng: `updateProfile`, `changePassword`, `invitePartner`.
- Cài đặt nút Authorize cho Swagger UI để test JWT.
- Thiết lập toàn bộ Entity cho Asset Gallery Module.

### ✅ Completed
- [x] **Social Login Security**: Implement `verifyGoogleToken` trong `AuthService`, xóa trường `email` trong `OAuthRequest`.
- [x] **Profile & Security APIs**: Kết nối `AuthController` $\rightarrow$ `AccountService` cho update profile, change pass và invite partner.
- [x] **Swagger Enhancement**: Tạo `OpenApiConfig` để hiển hiện nút Authorize (Bearer Token) trên UI.
- [x] **System Fixes**: Sửa lỗi `NullPointerException` (userDetails null), lỗi CORS và xung đột JDK 25/Lombok.
- [x] **Asset Gallery Foundation**: Triển khai 9 Entities (`Gallery`, `CVs`, `JobDescriptions`, `InterviewSessions`, `InterviewAnswers`, `CVTemplates`, `TemplateFeedback`, `CVFeedback`, `CVOptimizationLogs`) kế thừa từ `BaseEntity` và sử dụng JSONB cho dữ liệu AI.
- [x] **Verification**: Chạy Unit Test (`AuthFeatureTest`) và review code cho Module Auth.

### 🚩 Current State & Checkpoint
- **Current Branch**: `dev`
- **Architecture**: Module-based Architecture.
- **Auth Status**: Module Auth đã hoàn thiện 100% logic và bảo mật.
- **Gallery Status**: Đã xong tầng Entity.

### 🚀 Next Steps
1. Triển khai `Repository` $\rightarrow$ `Service` $\rightarrow$ `Controller` cho Asset Gallery Module.
2. Triển khai Module Payment & Billing (Checkout, Webhooks, Quota).
