export const INITIAL_ACTIVITY_LOGS = [
    { id: 'h1', type: 'phong_van', title: 'Phỏng vấn giả lập: UI/UX Designer', time: '15:45', dateLabel: 'HÔM NAY', score: '8.5/10', aiComment: 'AI nhận xét: Giao tiếp tốt, cần cải thiện ngôn ngữ cơ thể và cách giải thích quy trình thiết kế.' },
    { id: 'h2', type: 'ai_toi_uu', title: 'AI tối ưu hóa hồ sơ', time: '14:30', dateLabel: 'HÔM NAY', details: 'Hệ thống AI đã tự động tối ưu hóa phần "Kỹ năng chuyên môn" cho CV "Frontend Developer_2024".' },
    { id: 'h3', type: 'chinh_sua_cv', title: 'Chỉnh sửa CV', time: '10:15', dateLabel: 'HÔM NAY', details: 'Bạn đã cập nhật thông tin tại mục "Kinh nghiệm làm việc" trong hồ sơ "Marketing Manager".' },
    { id: 'h4', type: 'phong_van', title: 'Phỏng vấn giả lập: Frontend Developer', time: '14:20', dateLabel: 'HÔM QUA', score: '7.8/10', aiComment: 'AI nhận xét: Kiến thức kỹ thuật vững, tuy nhiên cần tự tin hơn khi trả lời các câu hỏi về xử lý tình huống.' },
    { id: 'h5', type: 'tai_xuong', title: 'Tải xuống PDF', time: '16:45', dateLabel: 'HÔM QUA', details: 'Đã xuất file PDF thành công cho CV.', meta: '2.4 MB • Hoàn tất' },
    { id: 'h6', type: 'tao_cv', title: 'Tạo CV mới', time: '09:00', dateLabel: 'HÔM QUA', details: 'Bắt đầu khởi tạo CV mới với template.' },
    { id: 'h7', type: 'dang_nhap', title: 'Smartfolio', time: '08:55', dateLabel: 'HÔM QUA', details: 'Đăng nhập từ trình duyệt Chrome trên thiết bị macOS (IP: 113.161.xx.xx).' },
];

export const INITIAL_DEVICES = [
    { id: '1', device: 'MacBook Pro', browser: 'Chrome', isCurrent: true, location: 'TP. Hồ Chí Minh, Viêt Nam', status: 'Đang hoạt động' },
    { id: '2', device: 'iPhone 15 Pro', browser: 'Safari', isCurrent: false, location: 'Hà Nội, Việt Nam', status: '2 giờ trước' },
    { id: '3', device: 'Windows PC', browser: 'Edge', isCurrent: false, location: 'Đà Nẵng, Việt Nam', status: '3 ngày trước' },
];

export const INITIAL_SECURITY_LOGS = [
    { id: 'log-1', action: 'dang_nhap_thanh_cong', title: 'Đăng nhập thành công', details: 'Trình duyệt Chrome trên macOS (IP: 113.161.xx.xx)', timeLabel: 'Hôm nay, 08:45' },
    { id: 'log-2', action: 'thay_doi_mat_khau', title: 'Thay đổi mật khẩu', details: 'Mật khẩu tài khoản đã được cập nhật thành công.', timeLabel: '15 thg 10, 2026' },
    { id: 'log-3', action: 'co_gang_dang_nhap_that_bai', title: 'Cố gắng đăng nhập thất bại', details: 'Có 3 lần thử đăng nhập sai từ một vị trí lạ (Campuchia).', timeLabel: '12 thg 10, 2026' },
];
