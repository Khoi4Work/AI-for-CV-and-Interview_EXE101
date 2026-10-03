-- PostgreSQL: run manually against your development database.
-- 1. Target account: babykizzed@gmail.com (must already exist and be ACTIVE).
-- 2. Run this entire script, then sign in with that account and refresh /my-cvs and /history.
-- Creates 4 CVs, 8 interview sessions and 16 answers. Re-running does not duplicate records.
-- Fills missing template_id on existing fixture CVs; preserves existing template links and other fields.
-- Does not change account status, subscription or quotas.
-- Question text lives in the session snapshot; these fixtures are for history/detail display.

BEGIN;

DO $seed$
DECLARE
    target_email text := 'babykizzed@gmail.com';
    account_uuid uuid;
    gallery_uuid uuid;
    cv_uuid uuid;
    session_uuid uuid;
    question_one uuid;
    question_two uuid;
    event_time timestamp;
    local_now timestamp := CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh';
    cv_names text[] := ARRAY[
        '[TEST] Frontend Developer — Bản nháp',
        '[TEST] Backend Java — Hoàn thành',
        '[TEST] Fullstack Developer — AI Optimized',
        '[TEST] UI/UX Designer — Đang tối ưu'
    ];
    cv_states text[] := ARRAY['DRAFT', 'DRAFT', 'OPTIMIZED', 'OPTIMIZING'];
    template_ids text[] := ARRAY['portfolio-hybrid', 'cloud-expert', 'security-analyst', 'data-scientist'];
    cv_statuses text[] := ARRAY['DRAFT', 'COMPLETED', 'DRAFT', 'DRAFT'];
    cv_scores integer[] := ARRAY[NULL, 76, 92, 0];
    session_score integer;
    i integer;
BEGIN
    IF target_email = 'CHANGE_ME@example.com' THEN
        RAISE EXCEPTION 'Replace target_email with your registered email before running this script.';
    END IF;

    SELECT id INTO STRICT account_uuid FROM account
    WHERE lower(email) = lower(trim(target_email)) AND status = 'ACTIVE';

    FOR i IN 1..4 LOOP
        IF NOT EXISTS (SELECT 1 FROM cv_templates WHERE id = template_ids[i]) THEN
            RAISE EXCEPTION 'Missing CV template: %. Import the template catalog first.', template_ids[i];
        END IF;
    END LOOP;

    gallery_uuid := md5(account_uuid::text || ':gallery-fixture-v1')::uuid;
    INSERT INTO gallery (id, account_id, created_at, updated_at, created_by)
    VALUES (gallery_uuid, account_uuid, local_now, local_now, account_uuid)
    ON CONFLICT (account_id) DO NOTHING;
    SELECT id INTO STRICT gallery_uuid FROM gallery WHERE account_id = account_uuid;

    FOR i IN 1..4 LOOP
        cv_uuid := md5(account_uuid::text || ':gallery-fixture-v1:cv:' || i)::uuid;
        event_time := date_trunc('day', local_now) - (i - 1) * interval '1 day' + interval '8 hours';
        INSERT INTO cvs (id, gallery_id, template_id, name, content, status, optimization_state,
                         score, ats_score, image, created_at, updated_at, created_by)
        VALUES (
            cv_uuid, gallery_uuid, template_ids[i], cv_names[i],
            jsonb_build_object(
                'personalInfo', jsonb_build_object('name', 'Nguyễn Minh Anh', 'email', target_email,
                    'phone', '0900000000', 'address', 'TP. Hồ Chí Minh'),
                'summary', 'Dữ liệu mẫu để kiểm tra danh sách CV và lịch sử hoạt động.',
                'experiences', jsonb_build_array(jsonb_build_object('id', 1, 'company', 'Demo Studio',
                    'role', 'Software Developer', 'period', '2024 - 2026',
                    'details', jsonb_build_array('Xây dựng ứng dụng React và Spring Boot.'))),
                'education', jsonb_build_array(jsonb_build_object('degree', 'Kỹ thuật phần mềm',
                    'school', 'Đại học mẫu', 'year', '2026')),
                'skills', jsonb_build_array(
                    jsonb_build_object('name', 'React', 'level', 'ADVANCED', 'category', 'Frontend'),
                    jsonb_build_object('name', 'Java', 'level', 'INTERMEDIATE', 'category', 'Backend')),
                'projects', '[]'::jsonb, 'certificates', '[]'::jsonb,
                'languages', '[]'::jsonb, 'awards', '[]'::jsonb
            ),
            cv_statuses[i], cv_states[i], cv_scores[i], cv_scores[i], NULL,
            event_time, event_time + interval '15 minutes', account_uuid
        ) ON CONFLICT (id) DO UPDATE SET template_id = EXCLUDED.template_id
          WHERE cvs.template_id IS NULL AND cvs.gallery_id = EXCLUDED.gallery_id;
    END LOOP;

    FOR i IN 1..8 LOOP
        session_uuid := md5(account_uuid::text || ':gallery-fixture-v1:session:' || i)::uuid;
        cv_uuid := md5(account_uuid::text || ':gallery-fixture-v1:cv:' || (1 + (i - 1) % 4))::uuid;
        question_one := md5(session_uuid::text || ':question:1')::uuid;
        question_two := md5(session_uuid::text || ':question:2')::uuid;
        -- Two sessions today, two yesterday, then older sessions.
        event_time := date_trunc('day', local_now) - ((i - 1) / 2) * interval '1 day'
            + interval '9 hours' + ((i - 1) % 2) * interval '1 hour';
        session_score := CASE WHEN i = 8 THEN NULL WHEN i = 3 THEN 0 ELSE 70 + i * 3 END;

        INSERT INTO interview_sessions (
            id, gallery_id, cv_ref_id, interview_type, duration_minutes, candidate_experience_level,
            context_snapshot, overall_score, feedback_json, session_date, status, completed_at,
            reserved_interview_minutes, interview_quota_settled, created_at, updated_at, created_by
        ) VALUES (
            session_uuid, gallery_uuid, cv_uuid,
            CASE WHEN i % 2 = 0 THEN 'HR' ELSE 'TECHNICAL' END,
            15, 'JUNIOR',
            jsonb_build_object('language', 'vi', 'adaptiveMode', false,
                'questions', jsonb_build_array(
                    jsonb_build_object('id', question_one::text, 'text', 'Hãy giới thiệu bản thân và dự án bạn tự hào nhất.',
                        'category', 'Introduction', 'competency', 'Communication'),
                    jsonb_build_object('id', question_two::text, 'text', 'Bạn xử lý lỗi khi gọi API từ React như thế nào?',
                        'category', 'Technical', 'competency', 'Problem solving'))),
            session_score,
            CASE WHEN i = 8 THEN NULL ELSE jsonb_build_object(
                'sessionId', session_uuid::text, 'overallScore', session_score,
                'summary', '[TEST] Trình bày rõ ràng; cần bổ sung ví dụ thực tế và kết quả đo lường.',
                'strengths', jsonb_build_array('Giao tiếp rõ ràng'),
                'improvementAreas', jsonb_build_array('Bổ sung số liệu cho ví dụ'),
                'recommendations', jsonb_build_array('Luyện trả lời theo STAR'),
                'criteria', jsonb_build_array(jsonb_build_object('criterion', 'Communication',
                    'score', session_score, 'feedback', 'Trình bày có cấu trúc.')),
                'questionFeedback', jsonb_build_array(jsonb_build_object('questionId', question_one::text,
                    'score', session_score, 'assessment', 'Ví dụ dễ hiểu.',
                    'improvementSuggestion', 'Nêu thêm tác động của dự án.'))
            ) END,
            event_time, CASE WHEN i = 8 THEN 'IN_PROGRESS' ELSE 'COMPLETED' END,
            CASE WHEN i = 8 THEN NULL ELSE event_time + interval '15 minutes' END,
            0, true, event_time, event_time + interval '15 minutes', account_uuid
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO interview_answers (id, session_id, question_id, answer_text, is_skipped,
                                       created_at, updated_at, created_by)
        VALUES
            (md5(session_uuid::text || ':answer:1')::uuid, session_uuid, question_one,
             'Tôi đã xây dựng ứng dụng quản lý CV bằng React và Spring Boot, phụ trách giao diện và tích hợp API.',
             false, event_time + interval '2 minutes', event_time + interval '2 minutes', account_uuid),
            (md5(session_uuid::text || ':answer:2')::uuid, session_uuid, question_two,
             CASE WHEN i = 2 THEN NULL ELSE 'Tôi kiểm tra HTTP status, hiển thị thông báo lỗi, cho phép thử lại và tránh cập nhật state từ request cũ.' END,
             i = 2, event_time + interval '5 minutes', event_time + interval '5 minutes', account_uuid)
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
    RAISE NOTICE 'Sample data ready for %: 4 CVs, 8 sessions, 16 answers. Existing fixture rows were preserved.', target_email;
END
$seed$;

COMMIT;
