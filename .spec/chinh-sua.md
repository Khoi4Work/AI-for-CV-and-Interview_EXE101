# Kế hoạch chỉnh sửa PR vừa pull

## Mục tiêu

Hoàn thiện các thay đổi đang staged để BE compile được, FE gọi đúng API auth/quota, và tránh cấu hình profile/schema khiến bản deploy lỗi. Đây là kế hoạch sửa PR hiện có; không thay đổi các file backend quota/health đã commit trước đó.

## Vấn đề và hướng xử lý

### 1. Hoàn tất chuyển module quota

- Cập nhật `UsageQuotaServiceImpl` dùng `UserUsageQuota` và `UserUsageQuotaRepository` từ `modules.quota`.
- Cài đặt đủ các phương thức mới trên `UsageQuotaService`: đọc quota, kích hoạt plan, cộng quota; giữ thao tác cập nhật có transaction và dùng row lock.
- Gỡ `consumeCvQuota` khỏi `GalleryServiceImpl` để khớp với interface đã chuyển trách nhiệm quota sang module quota.
- Thay lỗi `RuntimeException` trong `QuotaController` bằng lỗi API theo chuẩn backend.
- Khởi tạo quota và gallery qua `AccountCreatedEvent` sau commit, không gọi service của module khác trực tiếp trong `AccountServiceImpl`.

**Tiêu chí xong:** không còn tham chiếu quota entity/repository qua package gallery; class implementation khớp interface.

### 2. Đồng bộ refresh-token FE/BE

- FE dùng `PUT /auth/tokens/refresh` như `AuthController`.
- Đọc access token từ `ApiResponse.result`; DTO hiện chỉ trả access token nên giữ refresh token cũ nếu response không cấp refresh token mới.
- Chỉ retry request gốc sau khi nhận được access token hợp lệ; nếu refresh thất bại thì xóa session và chuyển về login.
- FE đổi mật khẩu gửi `currentPassword`/`confirmPassword`, trong khi BE nhận `oldPassword`/`newPassword`; chuyển payload đúng contract và bỏ trường xác nhận không có trong DTO.
- FE đăng ký gửi `fullName`, trong khi BE nhận `displayName`; ánh xạ tên form sang đúng field.

### 3. Cấu hình chuyển hướng xác thực email

- Bỏ URL `localhost:5173` hardcode trong controller.
- Đọc base URL FE từ cấu hình `app.frontend.url`, mặc định local cho môi trường phát triển.
- Redirect tới `/login?verified=true` sau khi xác thực thành công.
- Loại import không dùng khỏi `AuthController`.

### 4. Đồng bộ entity mới với schema

- PR thêm các cột hồ sơ nhưng tắt `spring.jpa.hibernate.ddl-auto` và repository hiện chưa có cơ chế migration tự chạy.
- Giữ `ddl-auto=none`; bổ sung SQL migration an toàn, có thể chạy lặp, cho các cột mới trong `attendance_info` và `partner_info`. Ghi rõ cần áp dụng migration trước khi deploy.

### 5. Giữ độ tin cậy của hồ sơ và test

- `/auth/me` không trả dữ liệu gói và ngày tham gia hardcode; lấy plan từ quota hiện tại và ngày tham gia từ account.
- PR xóa `CVPipelineServiceImplTest`. Đây vẫn là mục cần xử lý riêng: khôi phục/cập nhật test theo `UsageQuotaService`; lượt sửa này không chỉnh hoặc chạy test.

## Ngoài phạm vi sửa tự quyết

- Giữ giới hạn tạo CV đã định hướng: FREE 1, MIDDLE 5, ENHANCE 10. Không tự thay số lượt AI CV hoặc quota phút Interview chưa được chốt.
- Không đổi luồng thanh toán hoặc chính sách cộng dồn/gia hạn plan; phần đó cần nghiệp vụ payment đã được chốt.

## Trạng thái

- [x] Rà soát diff PR và ghi nhận lỗi compile/API/schema.
- [x] Hoàn thiện module quota và controller; giữ khởi tạo account qua event sau commit.
- [x] Sửa refresh token FE và payload đăng ký/đổi mật khẩu.
- [x] Cấu hình redirect xác thực email và thông báo FE.
- [x] Bổ sung migration SQL thủ công và lấy plan/ngày tham gia từ dữ liệu thật.
- [ ] Khôi phục/cập nhật `CVPipelineServiceImplTest` (mục còn lại; không chạy test).
- [x] BE compile với `-Dmaven.test.skip=true`; FE production build thành công.

## Kết quả sửa

- `UsageQuotaServiceImpl` dùng package mới, triển khai đọc quota/kích hoạt plan/cộng quota; `GalleryServiceImpl` không còn nhận trách nhiệm trừ CV quota.
- `QuotaController` tạo quota FREE idempotently khi cần và trả lỗi theo `ApiException`.
- CV creation cap trong `QuotaBenefitConfig` đặt ENHANCE về 10 theo nghiệp vụ đã chốt. Số lượt AI và quota phút Interview giữ nguyên trong PR, cần xác nhận riêng.
- FE refresh dùng PUT, đọc `result.accessToken`, giữ refresh token hiện tại khi BE không xoay token. Form đăng ký/đổi mật khẩu đã khớp DTO BE; `toggleFavorite` được giữ trong AuthContext.
- Account publish `AccountCreatedEvent`; Gallery và Quota listeners khởi tạo resource sau commit.
- `.spec/can-thay-doi.md` chỉ giữ vai trò yêu cầu đồng bộ service; nhật ký sửa PR nằm ở file này.
- SQL profile migration là thủ công vì project chưa cấu hình Flyway/Liquibase. Phải chạy script trước khi deploy với `ddl-auto=none`.
- Chưa commit. Các thay đổi từ PR ban đầu vẫn đang staged; phần chỉnh sửa hiện tại ở working tree.
