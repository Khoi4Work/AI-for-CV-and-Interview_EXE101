-- Curated IT-only summaries from FPT Jobs, reviewed 2026-10-08.
-- Prerequisite: 20261005_merge_system_jds_into_job_descriptions.sql.
-- active marks availability in the practice catalog, not a live recruiting status.
-- Stable catalog keys make repeat execution safe and preserve JD IDs.
BEGIN;

INSERT INTO job_descriptions (
    id, created_at, updated_at, gallery_id, source, catalog_key,
    title, company_name, industry, experience_level, content, active
)
VALUES
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptjobs-26358-frontend-react',
    'Front–End Developer (React)', 'FPT Telecom', 'IT / Frontend', 'Trên 2 năm',
    $jd$Vị trí: Front–End Developer (React) — FPT Telecom, Hồ Chí Minh; toàn thời gian.
Nhiệm vụ: Phát triển dashboard dữ liệu thiết bị CPE, Wi-Fi, mạng và QoE. Xử lý dữ liệu từ cơ sở dữ liệu, biểu diễn bằng biểu đồ và xây dựng API hoặc script phục vụ hệ thống nội bộ.
Yêu cầu: Trên 2 năm sử dụng React và TypeScript; đã xây dựng dashboard hoặc ứng dụng có khối lượng dữ liệu lớn, phức tạp.
Nguồn: https://fptjobs.com/frontend-developer-react-26358
Tham khảo ngày 08/10/2026. Bản tóm tắt dùng để đánh giá CV và luyện phỏng vấn; xem nguồn để kiểm tra thông tin tuyển dụng.$jd$, true
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptjobs-26359-backend-iot',
    'Backend Engineer (IoT)', 'FPT Telecom – FPT Life', 'IT / Backend / IoT', 'Từ 2 năm',
    $jd$Vị trí: Backend Engineer (IoT) — FPT Life thuộc FPT Telecom, Hồ Chí Minh; toàn thời gian.
Nhiệm vụ: Xây dựng backend Camera AI, kết nối camera/IoT và dịch vụ AI; thiết kế API, kiểm thử và tối ưu hiệu năng.
Yêu cầu: Tốt nghiệp CNTT hoặc ngành liên quan; từ 2 năm backend, ưu tiên Python/Go. Nắm REST, WebSocket, JWT/OAuth2, PostgreSQL/MySQL, Redis, Clean Architecture và Git. Sử dụng công cụ lập trình AI; có kinh nghiệm LLM API, streaming, retry, function calling, structured output và kiểm tra đầu ra.
Ưu tiên: RTSP/WebRTC/HLS, MQTT, agent/MCP, Docker, CI/CD, Kubernetes và monorepo.
Nguồn: https://fptjobs.com/backend-engineer-iot-26359
Tham khảo ngày 08/10/2026. Bản tóm tắt phục vụ đánh giá CV/luyện phỏng vấn; trạng thái tuyển dụng xem tại nguồn.$jd$, true
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptplay-19729-frontend-middle',
    'Front–End Developer (Middle)', 'FPT Play – Công ty TNHH Truyền hình FPT', 'IT / Frontend', 'Middle / 2–4 năm',
    $jd$Vị trí: Front–End Developer (Middle) — FPT Play, Hồ Chí Minh; toàn thời gian.
Nhiệm vụ: Làm công cụ web nội bộ bằng React 19, TypeScript, Vite, TailwindCSS. Xây dựng wizard, rule builder, dashboard và phân quyền; phối hợp API với backend, tối ưu bảng lớn và cải tiến UX.
Yêu cầu: 2–4 năm frontend React; TypeScript trong production. Vững JavaScript, CSS, HTTP; quản lý state/data fetching, form nhiều bước và validation. Biết component library, visualization hoặc drag-and-drop, cùng kiểm thử bằng Vitest, React Testing Library, Playwright.
Nguồn: https://fptplay.fptjobs.com/front-end-developer-middle-19729
Tham khảo ngày 08/10/2026. Bản tóm tắt phục vụ đánh giá CV/luyện phỏng vấn; trạng thái tuyển dụng xem tại nguồn.$jd$, true
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptplay-19730-data-engineer-middle',
    'Data Engineer (Middle)', 'FPT Play – Công ty TNHH Truyền hình FPT', 'IT / Data Engineering', 'Middle / 2–4 năm',
    $jd$Vị trí: Data Engineer (Middle) — FPT Play, Hồ Chí Minh; toàn thời gian.
Nhiệm vụ: Đưa dữ liệu Kafka/batch vào warehouse; tối ưu mô hình ClickHouse. Vận hành Airflow DAG, xuất dữ liệu có bảo vệ PII; kiểm thử, giám sát pipeline và viết tài liệu thiết kế.
Yêu cầu: 2–4 năm data engineering. Vững SQL, execution plan; đã dùng analytical database và PostgreSQL/MySQL. Hiểu orchestration, backfill, idempotency; có Kubernetes, CI/CD, Infrastructure as Code, Spark/Flink hoặc xử lý dữ liệu lớn. Có kinh nghiệm sản phẩm B2C và bảo vệ dữ liệu cá nhân.
Nguồn: https://fptplay.fptjobs.com/data-engineer-middle-19730
Tham khảo ngày 08/10/2026. Bản tóm tắt phục vụ đánh giá CV/luyện phỏng vấn; trạng thái tuyển dụng xem tại nguồn.$jd$, true
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptplay-19704-qc-engineer',
    'Chuyên viên Kiểm thử phần mềm (QC Engineer)', 'FPT Play – Công ty TNHH Truyền hình FPT', 'IT / Software Testing', 'Có kinh nghiệm kiểm thử',
    $jd$Vị trí: Chuyên viên Kiểm thử phần mềm (QC Engineer) — FPT Play, Hồ Chí Minh; toàn thời gian.
Nhiệm vụ: Phân tích yêu cầu, thiết kế kế hoạch và ca kiểm thử; kiểm thử chức năng website, API qua Postman. Viết SQL/script hỗ trợ kiểm thử, báo cáo và theo dõi lỗi; đóng góp tài liệu chức năng, phát triển và hướng dẫn sử dụng.
Yêu cầu: Tốt nghiệp đại học CNTT; ứng viên ngành khác có kiến thức và kinh nghiệm kiểm thử cũng được xem xét. Hiểu kiểm soát chất lượng và quy trình phát triển phần mềm; làm việc độc lập và phối hợp nhóm.
Nguồn: https://fptplay.fptjobs.com/chuyen-vien-kiem-thu-phan-mem-qc-engineer-19704
Tham khảo ngày 08/10/2026. Bản tóm tắt phục vụ đánh giá CV/luyện phỏng vấn; trạng thái tuyển dụng xem tại nguồn.$jd$, true
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
