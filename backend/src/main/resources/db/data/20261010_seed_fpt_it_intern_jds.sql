-- Curated IT internship JDs from FPT Jobs, reviewed 2026-10-10.
-- This is seed data for the practice catalog, not a statement that applications are open.
-- The referenced listings showed expired deadlines during review; check the source before applying.
-- Prerequisite: migrations/20261005_merge_system_jds_into_job_descriptions.sql.
-- Stable catalog keys make repeat execution safe and preserve JD IDs.
BEGIN;

INSERT INTO job_descriptions (
    id, created_at, updated_at, gallery_id, source, catalog_key,
    title, company_name, industry, experience_level, content, active, extraction_status
)
VALUES
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptjobs-25312-backend-intern-hi-fpt',
    'Back-End Developer (Intern)', 'Ban Hi FPT – FPT Telecom', 'IT / Backend', 'Intern',
    $jd$Vị trí: Back-End Developer (Intern) — Ban Hi FPT, Hồ Chí Minh; hình thức thực tập.
Nhiệm vụ: Hỗ trợ phát triển sản phẩm và các công việc liên quan đến hệ thống backend; học quy trình làm việc và công nghệ trong quá trình thực tập.
Yêu cầu: Sinh viên năm cuối chưa tốt nghiệp ngành CNTT, Kỹ thuật phần mềm hoặc ngành liên quan. Có kiến thức Python hoặc Golang; biết PHP/C++ là lợi thế. Có trải nghiệm với MySQL hoặc MongoDB.
Trạng thái nguồn: Tin FPTJobs hiển thị đã hết hạn tại thời điểm rà soát; bản ghi được giữ để luyện đánh giá CV, không đại diện cho vị trí đang tuyển.
Nguồn: https://fptjobs.com/back-end-developer-intern-25312
Tham khảo ngày 10/10/2026.$jd$, true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptjobs-26137-backend-intern-fpt-life',
    'Back-End Developer (Intern)', 'Ban FPT Life – FPT Telecom', 'IT / Backend / AI', 'Intern',
    $jd$Vị trí: Back-End Developer (Intern) — Ban FPT Life, TP. Hồ Chí Minh; chương trình thực tập.
Nhiệm vụ: Phát triển backend service, monitoring platform, dashboard, hệ thống cảnh báo và công cụ nội bộ cho hệ sinh thái AI Camera. Tham gia phân tích bài toán, coding, testing, viết tài liệu và demo; có thể ứng dụng LLM/AI Agent để hỗ trợ phân tích log và tự động hóa báo cáo.
Yêu cầu: Sinh viên năm 3–4 ngành CNTT, Khoa học máy tính, Kỹ thuật máy tính, Mạng máy tính hoặc liên quan; GPA từ 7.0/10 hoặc 2.8/4.0. Biết ít nhất một ngôn ngữ backend như Python, Node.js, Go hoặc Java; có kiến thức Git, REST API, Linux/Command Line và đọc hiểu tài liệu tiếng Anh.
Trạng thái nguồn: Tin FPTJobs hiển thị đã hết hạn tại thời điểm rà soát; bản ghi được giữ để luyện đánh giá CV, không đại diện cho vị trí đang tuyển.
Nguồn: https://fptjobs.com/back-end-developer-intern-26137
Tham khảo ngày 10/10/2026.$jd$, true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptjobs-15080-it-helpdesk-intern',
    'Thực tập sinh Kỹ thuật (IT Helpdesk)', 'Công ty TNHH Truyền hình FPT – FPT Television', 'IT / IT Support', 'Intern',
    $jd$Vị trí: Thực tập sinh Kỹ thuật (IT Helpdesk) — FPT Television, TP. Hồ Chí Minh; thực tập/toàn thời gian theo tin đăng.
Nhiệm vụ: Hỗ trợ người dùng với các yêu cầu CNTT; quản trị mạng LAN, Internet và điện thoại IP; cài đặt hệ điều hành, phần mềm; hỗ trợ phần cứng máy tính và thiết bị ngoại vi.
Yêu cầu: Có kiến thức Windows, kiến thức mạng TCP/IP và bấm cáp UTP CAT 5/6; hiểu phần cứng máy tính, máy in và thiết bị ngoại vi.
Trạng thái nguồn: Tin FPTJobs hiển thị đã hết hạn tại thời điểm rà soát; bản ghi được giữ để luyện đánh giá CV, không đại diện cho vị trí đang tuyển.
Nguồn: https://fptjobs.com/thuc-tap-sinh-ky-thuat-it-helpdesk-15080
Tham khảo ngày 10/10/2026.$jd$, true, 'IDLE'
)
ON CONFLICT (catalog_key) DO UPDATE SET
    title = EXCLUDED.title,
    company_name = EXCLUDED.company_name,
    industry = EXCLUDED.industry,
    experience_level = EXCLUDED.experience_level,
    content = EXCLUDED.content,
    active = EXCLUDED.active,
    updated_at = NOW()
WHERE job_descriptions.source = 'SYSTEM' AND job_descriptions.gallery_id IS NULL;

COMMIT;
