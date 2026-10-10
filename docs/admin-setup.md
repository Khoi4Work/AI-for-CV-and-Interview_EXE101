# Thiết lập trang admin

Trang quản trị: `/admin`, `/admin/users`, `/admin/payments`. Dùng trang `/login` hiện có. API `/api/admin/**` yêu cầu tài khoản ACTIVE có role ADMIN; đăng ký và lời mời không được tạo role ADMIN.

## Cấp quyền cho tài khoản thật

1. Chạy `backend/src/main/resources/db/manual/20261010_admin_reporting.sql` trên PostgreSQL trước khi khởi động backend. Script bổ sung cột thống kê thanh toán, cập nhật ràng buộc role và giới hạn một tài khoản ADMIN. Backend dùng `ddl-auto=none` nên không tự cập nhật cấu trúc này.
2. Tài khoản được chọn phải có status ACTIVE. Sửa email trong `backend/src/main/resources/db/manual/20261010_grant_single_admin.sql` rồi chạy script. Script không đặt lại mật khẩu và từ chối cấp thêm ADMIN khi đã có ADMIN khác.
3. Đăng xuất rồi đăng nhập lại ở `/login`. Tài khoản Google dùng nút đăng nhập Google với đúng email; tài khoản email/mật khẩu dùng thông tin hiện tại. Đăng nhập có role ADMIN chuyển đến `/admin`.

Không có tài khoản mặc định hoặc bí danh đăng nhập. Quyền ADMIN được lưu trong DB, tiếp tục sử dụng khi deploy kết nối cùng DB. Nếu trước đây đã bật profile demo trong IntelliJ hoặc môi trường triển khai, bỏ profile đó khỏi cấu hình chạy.

## Quy tắc báo cáo

- Người dùng: tài khoản, tên, email, trạng thái, vai trò và số lượt/phút còn lại. Không trả mật khẩu hoặc token.
- Thanh toán: phân trang, tìm kiếm, lọc ngày/trạng thái/loại dịch vụ, xem chi tiết; đơn test mặc định bị loại khỏi danh sách và luôn bị loại khỏi thống kê doanh thu.
- Doanh thu dùng `paid_at`; hoàn tiền dùng `refunded_at`; múi giờ hiển thị Asia/Ho_Chi_Minh. Đơn cũ thiếu các mốc này được cảnh báo riêng, không tự đoán ngày thanh toán/hoàn tiền từ ngày tạo đơn.
- Webhook PayOS thành công ghi `paid_at` một lần. Đây là trang xem và thống kê; chưa có chức năng thực hiện hoàn tiền. Khi có luồng hoàn tiền, cần ghi `refunded_at` cùng trạng thái REFUNDED.

Các script này được cung cấp để chạy thủ công; kiểm thử tự động dùng DB H2 riêng, không thay đổi DB thật.
