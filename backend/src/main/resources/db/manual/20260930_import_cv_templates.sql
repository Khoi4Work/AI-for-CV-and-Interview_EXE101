-- 1. Xóa bảng và tất cả các ràng buộc liên quan (CASCADE)
DROP TABLE IF EXISTS cv_templates CASCADE;

-- 2. Tạo lại bảng với kiểu ID là VARCHAR (để chấp nhận 'the-standard', 'data-scientist', v.v.)
CREATE TABLE cv_templates (
                              id VARCHAR(50) PRIMARY KEY,
                              name VARCHAR(100) NOT NULL,
                              category VARCHAR(50),
                              subtitle VARCHAR(255),
                              preview_image TEXT,
                              minimum_plan VARCHAR(20) NOT NULL,
                              style VARCHAR(50),
                              type VARCHAR(50),
                              badge_text VARCHAR(50),
                              badge_theme VARCHAR(50),
                              description TEXT,
                              rating DECIMAL(3,2),
                              downloads INTEGER,
                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP,
                              created_by UUID
);

-- 3. Import dữ liệu mẫu chuẩn
INSERT INTO cv_templates (id, name, subtitle, preview_image, rating, downloads, category, style, type, badge_text, badge_theme, description, minimum_plan)
VALUES
    ('the-standard', 'The Standard', 'Backend Engineer / System Admin', 'https://i.postimg.cc/g25jJFvk/vintage.png', 4.8, 3100, 'technology', 'Modern', 'Popular', 'Pro',
     'pro', 'Mẫu CV chuẩn mực, chuyên nghiệp, phù hợp cho mọi vị trí kỹ thuật đòi hỏi sự nghiêm túc và chính xác.', 'FREE'),
    ('data-scientist', 'Data Scientist', 'Kỹ sư Dữ liệu / AI', 'https://i.postimg.cc/zX4YHJPg/classic.png', 4.9, 1200, 'technology', 'Modern', 'Newest', 'Premium',
     'premium', 'Thiết kế đặc thù cho dân Tech, tối ưu hóa việc hiển thị các kỹ năng lập trình, mô hình AI và dự án thực tế.', 'PREMIUM'),
    ('portfolio-hybrid', 'Portfolio Hybrid', 'Fullstack Developer / UI/UX', 'https://i.postimg.cc/GtchNc1m/polished.png', 4.6, 4200, 'technology', 'Creative', 'Popular',
     'Free', 'free', 'Mẫu lai giữa CV truyền thống và Portfolio, giúp bạn phô diễn các project code và giao diện một cách ấn tượng.', 'FREE'),
    ('boardroom-ready', 'Boardroom Ready', 'IT Director / Product Head', 'https://i.postimg.cc/j2VyJnS9/formal.png', 4.8, 900, 'technology', 'Executive', 'Popular',
     'Pro', 'pro', 'Vượt xa một bản CV, đây là một bản tuyên ngôn về năng lực quản trị công nghệ và tầm nhìn chiến lược.', 'PRO'),
    ('cloud-expert', 'Cloud Specialist', 'DevOps / Cloud Architect', 'https://i.postimg.cc/tJTGW7jP/modern.png', 4.7, 1100, 'technology', 'Modern', 'Newest', 'Free',
     'free', 'Thiết kế sạch sẽ, tin cậy, tập trung vào các chứng chỉ AWS/Azure/GCP và hạ tầng hệ thống.', 'FREE'),
    ('security-analyst', 'Security Analyst', 'Cybersecurity Expert', 'https://i.postimg.cc/W4gN1DNg/minimal.png', 4.5, 1500, 'technology', 'Minimalist', 'Popular',
     'Pro', 'pro', 'Phù hợp cho các chuyên gia bảo mật, nhấn mạnh vào kỹ năng pentest, audit và quản lý rủi ro.', 'PRO');

-- 4. Kiểm tra lại kết quả
SELECT * FROM cv_templates;

UPDATE cv_templates SET minimum_plan = 'ENHANCE' WHERE minimum_plan = 'PREMIUM';

-- Đổi PRO thành MIDDLE để khớp với Enum Java
UPDATE cv_templates SET minimum_plan = 'MIDDLE' WHERE minimum_plan = 'PRO';

UPDATE cv_templates SET minimum_plan = 'FREE'
WHERE id IN ('the-standard', 'portfolio-hybrid', 'cloud-expert');
UPDATE cv_templates SET minimum_plan = 'MIDDLE'
WHERE id IN ('boardroom-ready', 'security-analyst');
UPDATE cv_templates SET minimum_plan = 'ENHANCE'
WHERE id = 'data-scientist';
