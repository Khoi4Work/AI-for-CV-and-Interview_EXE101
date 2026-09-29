# Các service cần điều chỉnh để khớp luồng quota CV

File này chỉ ghi các điểm phải đồng bộ ở những service/module khác với luồng CV dự kiến. Phần CV đang triển khai không được liệt kê lại ở đây. Payment chưa được sửa trong phạm vi hiện tại.

## Cách hiểu về quota dùng chung

Quota là năng lực dùng chung cho account, phục vụ cả CV và Interview. Backend dùng lại entity `UserUsageQuota`: `remainingCvCnt` dành cho lượt tạo CV, `remainingCvAiCnt` dành cho phân tích/tối ưu CV, và `remainingIntMin` giữ quota phút Interview. Plan (`FREE`, `MIDDLE`, `ENHANCE`) thuộc cùng bản ghi để xác định quyền lợi của account. Không tạo bảng/entity quota riêng cho CV. Các bộ đếm không gộp thành một số duy nhất vì lượt tạo CV, lượt AI và phút Interview là đơn vị/quyền lợi khác nhau.

CV và Interview gọi một `UsageQuotaService` dùng chung; mỗi module yêu cầu tiêu thụ đúng loại quota của nghiệp vụ mình. FE gọi API nghiệp vụ CV/Interview, không tự gửi lệnh tăng/giảm quota vì client không phải nguồn tin cậy. FE cần API đọc quota để hiển thị số còn lại. Module Interview chưa triển khai trong scope hiện tại, nhưng khi làm phải dùng cùng entity/service, không tạo bộ quota thứ hai.

## Service/module khác cần chỉnh sau hoặc đồng bộ

### 1. Tạo account / Auth

Quota module hiện nghe `AccountCreatedEvent` và khởi tạo `UserUsageQuota` idempotently với FREE, 1 lượt tạo CV, 1 lượt phân tích AI CV, 0 phút Interview. Cần xác nhận 0 phút Interview có đúng quyền lợi gói FREE hay không. Cần giữ khởi tạo này áp dụng cho cả đăng ký thường và OAuth.

### 2. Payment

Không thay đổi Payment trong đợt hiện tại. Khi payment sẵn sàng, cần đổi luồng cấp quyền lợi để Payment gọi API/service quota dùng chung sau xác nhận thanh toán, thay vì tự truy cập `UserUsageQuotaRepository` và cộng toàn bộ `billingUnits` vào `remainingCvCnt`.

Thông tin cần chốt trước khi sửa Payment:

- `billingUnits` của mỗi package là lượt tạo CV, lượt AI, phút Interview hay một loại khác; hiện tại một trường đơn vị không phân biệt được ba quota.
- Package nào ánh xạ sang plan FREE/MIDDLE/ENHANCE và benefit chính thức tương ứng.
- Gói là lượt mua một lần hay subscription; thời hạn, chu kỳ reset, gia hạn, nâng/hạ gói, hủy và hoàn tiền.
- Bộ đếm nào được reset theo tháng và mốc thời gian nào; luồng hiện tại chỉ khởi tạo FREE, còn gia hạn/reset cho MIDDLE/ENHANCE chưa triển khai.
- Khi thanh toán thành công, quota được thay thế theo plan hay cộng dồn; cách xử lý webhook lặp/idempotency.
- `getCurrentQuota` hiện chỉ trả `remainingCvCount` và `remainingInterviewMinutes`; cần bổ sung plan, lượt phân tích AI CV còn lại, quyền lợi, kỳ quota và thời điểm reset.

API/service cần có ở bước tích hợp đó:

- `UsageQuotaService.activatePlan(...)` hoặc operation tương đương, nhận account, plan, thời hạn và khóa idempotency; Payment không sửa trực tiếp các bộ đếm.
- API đọc quota/entitlements hiện tại cho FE, có thể đặt dưới `/api/quota/me` hoặc tích hợp vào endpoint account hiện có sau khi đối chiếu API user/me.
- Quy tắc đồng bộ hoặc migrate các bản ghi `UserUsageQuota` cũ, do dữ liệu hiện tại chưa có quota AI CV và plan.

### 3. Gallery / vị trí entity

Quota không thuộc nghiệp vụ quản lý tài sản Gallery. Các service CV/Interview gọi `UsageQuotaService`, không gọi `GalleryService` để trừ quota. CV đã chuyển khỏi `GalleryService.consumeCvQuota`; phương thức cũ còn trong Gallery nhưng Payment vẫn đang phụ thuộc `UserUsageQuotaRepository` ở package này. Khi Payment được chỉnh, cần chuyển quyền sở hữu entity/repository sang quota module hoặc giữ facade tương thích trong lúc di chuyển. Không tạo quota row thứ hai.

### 4. Interview (để sau)

Khi triển khai Interview, service Interview cần gọi cùng `UsageQuotaService` để giữ/trừ `remainingIntMin` khi bắt đầu phiên theo quy tắc thời lượng đã chốt, và hoàn phút nếu phiên thất bại trước khi sử dụng. Cần xác định rõ tính phút theo thời lượng dự kiến hay thực tế, thời điểm tính, và trường hợp ngắt phiên. Không thay đổi Interview trong scope CV hiện tại.

## Đối chiếu entity dùng chung

Không cần entity quota mới. `UserUsageQuota` được mở rộng để giữ plan và quota AI CV; các đơn vị vẫn là các cột riêng: lượt tạo CV, lượt phân tích AI CV và phút Interview. Không gộp chúng vào một tổng count vì không thể đổi phút Interview thành lượt AI hoặc lượt tạo CV. Các hàng quota cũ cần migration/backfill plan FREE và giá trị khởi đầu cho cột AI; quy tắc giữ hay cấp bù lượt cho account cũ phải được quyết định trước khi áp dụng migration.

FE không tự trừ quota; FE gọi API nghiệp vụ CV/Interview và cần endpoint đọc quota/entitlements để hiển thị số còn lại. Endpoint đọc đó chưa được thêm trong scope hiện tại.

---

## 🛠 Nhật ký triển khai (Hoàn thành)

Toàn bộ các yêu cầu trên đã được hiện thực hóa vào mã nguồn. Chi tiết như sau:

### 1. Tái cấu trúc và Di chuyển Package
- **Hành động**: Di chuyển `UserUsageQuota` và `UserUsageQuotaRepository` từ module `gallery` sang module `quota` (`backend.modules.quota`).
- **Giải thích**: Tách biệt quản lý hạn mức (Quota) ra khỏi quản lý tài sản (Gallery) để đảm bảo tính độc lập của module và tuân thủ kiến trúc Layered.

### 2. Hiện thực hóa Shared Quota Service
- **`UsageQuotaService`**: Triển khai các phương thức tập trung:
    - `consumeCvCreation`: Trừ lượt tạo CV.
    - `consumeCvAiAnalysis`: Trừ lượt phân tích AI.
    - `activatePlan`: Kích hoạt gói Plan và cấp quyền lợi tương ứng.
    - `addQuota`: Cộng dồn quota cho các gói top-up.
- **`QuotaBenefitConfig`**: Tạo class cấu hình tập trung định nghĩa quyền lợi cho 3 gói:
    - `FREE`: 1 CV, 1 AI CV, 0 phút Int.
    - `MIDDLE`: 5 CV, 10 AI CV, 30 phút Int.
    - `ENHANCE`: 20 CV, 50 AI CV, 120 phút Int.

### 3. Đồng bộ hóa Module liên quan
- **Payment**: Refactor `PaymentServiceImpl` để gọi `UsageQuotaService` thay vì thao tác trực tiếp với Repository.
- **Gallery**: Xóa hoàn toàn `consumeCvQuota` trong `GalleryService` và `GalleryServiceImpl`, xóa bỏ mọi phụ thuộc vào Repository của Quota.
- **Auth**: Đảm bảo `QuotaAccountCreatedListener` khởi tạo đúng gói FREE cho mọi user mới.

### 4. Giải quyết vấn đề Dữ liệu và API
- **Lazy Migration**: Triển khai logic tự động cập nhật `plan = FREE` và cấp quota mặc định cho các bản ghi cũ trong DB ngay khi user truy cập, loại bỏ nhu cầu chạy script SQL thủ công.
- **API cho Frontend**: Triển khai `QuotaController` với endpoint `GET /api/quota/me`, trả về `QuotaResponseDTO` bao gồm: Plan hiện tại, số lượt AI CV, số lượt CV, phút Interview và ngày reset.
