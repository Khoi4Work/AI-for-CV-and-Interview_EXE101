-- 20 curated IT internship JDs based on FPTJobs listings, primarily FPT Telecom SVCNTS 2026.
-- Reviewed 2026-10-10. FPTJobs indicates the program registration period has ended.
-- These records are for CV evaluation/interview practice and do not imply current openings.
-- active=true means visible in this practice catalog; it does not mean the employer is hiring now.
-- Prerequisite: migrations/20261005_merge_system_jds_into_job_descriptions.sql.
-- Stable catalog keys make repeat execution safe and preserve JD IDs.
BEGIN;

INSERT INTO job_descriptions (
    id, created_at, updated_at, gallery_id, source, catalog_key,
    title, company_name, industry, experience_level, content, active, extraction_status
)
VALUES
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-wireless-it',
    'Thực tập sinh Công nghệ Thông tin Vô tuyến', 'FPT Telecom', 'IT / Wireless Systems', 'Intern',
    E'Vị trí: Thực tập sinh Công nghệ Thông tin Vô tuyến — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Mô phỏng, phân tích tín hiệu Wi-Fi/5G/6G và dữ liệu RSSI/CSI, thử nghiệm wireless sensing, AI-native trong vô tuyến, xây dựng demo/prototype.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Điện tử Viễn thông, Mạng máy tính hoặc liên quan, có kiến thức Network IP/truyền dẫn quang, tư duy phân tích, chủ động học hỏi.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-network-operations',
    'Thực tập sinh Vận hành Hệ thống Mạng', 'FPT Telecom', 'IT / Network Engineering', 'Intern',
    E'Vị trí: Vận hành Hệ thống Mạng — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Hỗ trợ thiết kế/quy hoạch Core IP và truyền dẫn theo hướng tự động hóa, xử lý sự cố, đề xuất tối ưu hạ tầng và cập nhật báo cáo vận hành.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Điện tử Viễn thông, Mạng máy tính hoặc liên quan, nắm Network IP, CCNA/CCNP/JNCIA/JNCIP, truyền dẫn quang, lập trình hoặc automation là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-voip-engineering',
    'Thực tập sinh VoIP Engineering', 'FPT Telecom', 'IT / VoIP & Systems', 'Intern',
    E'Vị trí: VoIP Engineering — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Hỗ trợ vận hành CloudPBX/Core Voice, cấu hình, đối soát dữ liệu, giám sát hệ thống, xử lý sự cố cơ bản, kiểm thử chất lượng dịch vụ và lập báo cáo SLA.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Điện tử Viễn thông, Mạng máy tính hoặc liên quan, kiến thức cơ bản TCP/IP, DNS, Linux, cẩn thận, có tư duy xử lý vấn đề và phối hợp nhóm.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-wireless-network-rd',
    'Wireless Network R&D Intern', 'FPT Telecom', 'IT / Wireless Network R&D', 'Intern',
    E'Vị trí: Wireless Network R&D Intern — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Nghiên cứu chuẩn IEEE 802.11 và 3GPP, tìm hiểu ISAC, RIS, Massive MIMO, đánh giá chipset và tối ưu roaming, band steering.\nYêu cầu: Sinh viên năm 3–4 ngành Điện tử Viễn thông, Kỹ thuật máy tính, Mạng máy tính hoặc tương đương, đọc hiểu tài liệu kỹ thuật tiếng Anh, sử dụng MATLAB, NS-3 hoặc Wireshark.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-network-analysis',
    'Thực tập sinh Phân tích & Đánh giá Hệ thống Network', 'FPT Telecom', 'IT / Network Analytics', 'Intern',
    E'Vị trí: Thực tập sinh Phân tích & Đánh giá Hệ thống Network — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Hỗ trợ giám sát, phân tích dữ liệu vận hành Core IP/truyền dẫn, đánh giá QoS/QoE, phân tích log/cảnh báo NOC, lập báo cáo hiệu năng và phối hợp tìm nguyên nhân sự cố, đề xuất tối ưu.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Điện tử Viễn thông, Mạng máy tính hoặc liên quan, có kiến thức Network IP, truyền dẫn/quang, tư duy phân tích dữ liệu, có thể thực tập tối thiểu 4 ngày/tuần.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-backend-java-python-node-cpp',
    'Backend Intern (Java, Python, NodeJS, C++)', 'FPT Telecom', 'IT / Backend Development', 'Intern',
    E'Vị trí: Backend Intern — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Hỗ trợ phát triển backend và REST API, tham gia PoC, xử lý logic nghiệp vụ, làm việc với database, viết unit test, debug, tối ưu cơ bản và review code.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Khoa học máy tính hoặc liên quan, nắm OOP, có kiến thức Python/Node.js/C++ và SQL, có đồ án cá nhân là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-fullstack',
    'Fullstack Intern', 'FPT Telecom', 'IT / Full-stack Development', 'Intern',
    E'Vị trí: Fullstack Intern — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Hỗ trợ xây dựng giao diện React/Vue, backend API bằng Python/Node.js/C++, làm việc với MongoDB/PostgreSQL/MySQL, sửa lỗi và viết test.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT/Kỹ thuật phần mềm, nắm JavaScript/ES6+, HTML, CSS, biết một ngôn ngữ backend, REST API và SQL/NoSQL, GitHub/Portfolio là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-business-analyst',
    'Business Analyst Intern', 'FPT Telecom', 'IT / Business Analysis', 'Intern',
    E'Vị trí: Business Analyst — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Thu thập và hệ thống hóa yêu cầu, phân tích điểm nghẽn, đề xuất cải tiến quy trình, viết BRD/User Story và phối hợp đội kỹ thuật triển khai, UAT.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Hệ thống thông tin quản lý, Quản trị kinh doanh hoặc liên quan, tư duy phân tích, sử dụng Excel/Google Sheets và công cụ mô hình hóa quy trình, giao tiếp, viết tài liệu rõ ràng.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-application-security',
    'Application Security Intern', 'FPT Telecom', 'IT / Application Security', 'Intern',
    E'Vị trí: Kỹ sư bảo mật ứng dụng — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Hỗ trợ dò tìm, xác minh lỗ hổng web/app, kiểm thử bảo mật cơ bản, phân tích log, nghiên cứu OWASP Top 10 và theo dõi khắc phục lỗ hổng.\nYêu cầu: Sinh viên năm 3–4 (hoặc năm 2–3 học kỳ cuối) ngành An toàn thông tin, An ninh mạng, CNTT hoặc liên quan, hiểu HTTP/HTTPS, API, XSS, SQL Injection, Authentication/Authorization, Burp Suite hoặc OWASP ZAP là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-security-operations',
    'Security Operations Intern', 'FPT Telecom', 'IT / Security Operations', 'Intern',
    E'Vị trí: Vận hành dịch vụ bảo mật — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Hỗ trợ giám sát hệ thống an ninh qua SIEM, phân tích cảnh báo IDS/IPS, firewall và endpoint, tạo ticket, phối hợp xử lý sự cố và lập báo cáo theo quy trình.\nYêu cầu: Sinh viên năm 3–4 ngành An ninh mạng, An toàn thông tin hoặc CNTT, hiểu cơ bản mạng, Linux/Windows, IDS/IPS, SIEM và firewall, đọc hiểu tài liệu tiếng Anh, sẵn sàng làm việc theo ca.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-ai-engineer-agent',
    'AI Engineer Intern (Algorithm & Agent)', 'FPT Telecom', 'IT / AI Engineering', 'Intern',
    E'Vị trí: AI Engineer Intern (Algorithm & Agent) — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Làm sạch dữ liệu, huấn luyện/đánh giá mô hình ML/CV cơ bản, xây dựng AI Agent, RAG với vector database và thử nghiệm LangChain/LangGraph.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Khoa học dữ liệu, Toán tin hoặc liên quan, lập trình Python tốt, biết SQL và một framework Scikit-learn/PyTorch/TensorFlow, hiểu cơ bản LLM, prompt engineering, có chatbot/RAG project là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-fullstack-ai-integration',
    'Full-stack AI Integration Intern (System & App)', 'FPT Telecom', 'IT / AI Integration', 'Intern',
    E'Vị trí: Full-stack AI Integration Intern (System & App) — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Xây dựng API để tích hợp mô hình AI, phát triển web/miniapp có chatbot hoặc dashboard, kết nối REST API, WebSocket và Kafka/RabbitMQ.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Kỹ thuật phần mềm, Hệ thống thông tin, có nền tảng Web/App, Python/Java/Node.js, REST API và SQL/NoSQL, không yêu cầu kinh nghiệm AI chuyên sâu.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-dba',
    'Database Administrator Intern', 'FPT Telecom', 'IT / Database Administration', 'Intern',
    E'Vị trí: DBA (Database Administrator) — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Hỗ trợ quản trị Oracle/MySQL/PostgreSQL, theo dõi hiệu năng, tối ưu truy vấn/index, hỗ trợ backup/restore và phối hợp Dev/Data xử lý sự cố database.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Khoa học máy tính, Hệ thống thông tin, vững SQL (JOIN, GROUP BY, Subquery), hiểu index, transaction, ACID, tỉ mỉ và có trách nhiệm.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-data-analyst',
    'Data Analyst Intern', 'FPT Telecom', 'IT / Data Analytics', 'Intern',
    E'Vị trí: Data Analyst — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Truy vấn dữ liệu, xây dựng báo cáo/dashboard KPI, phân tích dữ liệu mạng và hành vi người dùng, hỗ trợ pipeline, kiểm tra dữ liệu và phát hiện bất thường.\nYêu cầu: Sinh viên năm 3–4, có SQL cơ bản, Excel Pivot/Lookup, Python Pandas/NumPy và kiến thức ML cơ bản, Power BI/Tableau hoặc project trực quan hóa dữ liệu là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-data-engineering',
    'Data Engineering Intern', 'FPT Telecom', 'IT / Data Engineering', 'Intern',
    E'Vị trí: Data Engineering — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Nghiên cứu công nghệ lưu trữ/xử lý Big Data, xây dựng luồng ETL/ELT và làm việc với Data Warehouse/Data Lake.\nYêu cầu: Sinh viên năm 3–4 khối kỹ thuật, tư duy hệ thống, vững SQL và cấu trúc database, biết Python hoặc Scala/Java, Hadoop, Spark, Kafka hoặc Airflow là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-data-scientist',
    'Data Scientist Intern', 'FPT Telecom', 'IT / Data Science', 'Intern',
    E'Vị trí: Data Scientist — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Nghiên cứu Digital Twin/Decision Intelligence, xây dựng, triển khai, đánh giá và tối ưu mô hình ML/GenAI, áp dụng kỹ thuật XAI như SHAP/LIME.\nYêu cầu: Sinh viên năm 3–4 ngành AI, Machine Learning, Khoa học dữ liệu, Toán hoặc liên quan, lập trình Python tốt, biết Scikit-learn/PyTorch/TensorFlow và có nền tảng xác suất, thống kê.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-network-data-automation',
    'Thực tập sinh Dữ liệu và Tự động hóa Mạng', 'FPT Telecom', 'IT / Network Automation & Data', 'Intern',
    E'Vị trí: Dữ liệu và Tự động hóa Mạng — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Tham gia R&D nền tảng NOC, chuẩn hóa mô hình dữ liệu, xây dựng workflow Python tự động xử lý sự cố và tích hợp AI/LLM cho cảnh báo, hỗ trợ quyết định.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT, Hệ thống thông tin, Mạng máy tính, biết Python, thiết kế database/UML/ERD, hiểu OSS/BSS, Airflow/n8n hoặc API AI là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptjobs-23262-backend-python-django-intern',
    'Thực tập sinh Developer (Backend - Python, Django, HCM)', 'Ban FPT Life – FPT Telecom', 'IT / Backend Development', 'Intern',
    E'Vị trí: Thực tập sinh Developer (Backend - Python, Django, HCM) — Ban FPT Life, TP. Hồ Chí Minh.\nNhiệm vụ: Làm việc với dữ liệu lớn, phát triển và duy trì API bằng Django/FastAPI, phối hợp thiết kế, tối ưu SQL/NoSQL, tham gia review code, kiểm thử và debug.\nYêu cầu: Có thể lập trình Python, hiểu dữ liệu lớn và phân tích thống kê, quen thuộc Django, FastAPI hoặc tương đương, có kinh nghiệm SQL/NoSQL, chủ động học hỏi và làm việc nhóm.\nTrạng thái nguồn: Tin FPTJobs hiển thị đã hết hạn tại thời điểm rà soát, bản ghi dành cho luyện tập, không đại diện cho vị trí đang tuyển.\nNguồn: https://fptjobs.com/thuc-tap-sinh-developer-backend-python-django-hcm-23262\nTham khảo ngày 10/10/2026.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'fptjobs-22939-web-php-laravel-intern',
    'Thực tập sinh Developer (Web Developer - PHP, Laravel, MySQL)', 'Trung tâm Hệ thống Thông tin – FPT Telecom', 'IT / Web Development', 'Intern',
    E'Vị trí: Thực tập sinh Developer (Web Developer - PHP, Laravel, MySQL) — Trung tâm Hệ thống Thông tin, TP. Hồ Chí Minh.\nNhiệm vụ: Hỗ trợ xây dựng website bằng PHP/Laravel, phát triển giao diện HTML/CSS/JavaScript, bảo trì, sửa lỗi và kết nối REST API, tham gia training và nghiên cứu công nghệ web.\nYêu cầu: Sinh viên năm 3–4 ngành CNTT/Khoa học máy tính hoặc liên quan, có kiến thức PHP/Laravel, MySQL, HTML5/CSS3/JavaScript và Git cơ bản, đọc hiểu tài liệu tiếng Anh.\nTrạng thái nguồn: Tin FPTJobs hiển thị đã hết hạn tại thời điểm rà soát, bản ghi dành cho luyện tập, không đại diện cho vị trí đang tuyển.\nNguồn: https://fptjobs.com/thuc-tap-sinh-developer-web-developer-php-laravel-mysql-22939\nTham khảo ngày 10/10/2026.', true, 'IDLE'
),
(
    gen_random_uuid(), NOW(), NOW(), NULL, 'SYSTEM', 'svcnts2026-intern-embedded-software',
    'Embedded Software Intern', 'FPT Telecom', 'IT / Embedded Software', 'Intern',
    E'Vị trí: Embedded Software Intern — Chương trình SVCNTS 2026, FPT Telecom.\nNhiệm vụ: Phát triển firmware/BSP cho ARM/RISC-V, lập trình C/C++ cho thanh ghi, bộ nhớ và I2C/SPI/UART/GPIO, hỗ trợ bring-up board, kiểm thử IP và tìm hiểu RTOS/Embedded Linux.\nYêu cầu: Sinh viên năm 3–4 ngành Kỹ thuật máy tính, Điện tử Viễn thông, Tự động hóa hoặc liên quan, C/C++ tốt, hiểu vi điều khiển và giao tiếp phần cứng, STM32/ESP32/Raspberry Pi là lợi thế.\nNguồn: https://fptjobs.com/SVCNTS2026\nTham khảo ngày 10/10/2026. Chương trình đã đóng đăng ký tại thời điểm rà soát.', true, 'IDLE'
)
ON CONFLICT (catalog_key) DO UPDATE SET
    title = EXCLUDED.title,
    company_name = EXCLUDED.company_name,
    industry = EXCLUDED.industry,
    experience_level = EXCLUDED.experience_level,
    content = EXCLUDED.content,
    active = EXCLUDED.active,
    extraction_status = EXCLUDED.extraction_status,
    updated_at = NOW()
WHERE job_descriptions.source = 'SYSTEM' AND job_descriptions.gallery_id IS NULL;

COMMIT;
