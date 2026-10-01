INSERT INTO payment_services (id, name, category, package_code, price, billing_units, created_at)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Middle', 'CV', 'MIDDLE', 39000, 5, NOW());

INSERT INTO cv_benefit (id, service_id, max_templates, allow_semantic_sugg, allow_skill_sugg, show_pass_rate, created_at)
VALUES ('a1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 5, true, true, false, NOW());

INSERT INTO interview_benefit (id, service_id, max_duration_min, allow_recording, allow_deep_feedbk, allow_comp_culture, created_at)
VALUES ('b1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 15, false, true, false, NOW());