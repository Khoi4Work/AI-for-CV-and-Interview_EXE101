-- Monthly subscriptions are separate catalog products for CV and Interview.
INSERT INTO payment_services (id, name, category, package_code, price, billing_units, created_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'CV Middle', 'CV', 'MIDDLE', 39000, 5, NOW()),
    ('660f9501-f30c-52e5-b827-557766551111', 'CV Enhance', 'CV', 'ENHANCE', 59000, 10, NOW()),
    ('770f9501-f30c-52e5-b827-557766552222', 'Interview Middle', 'INTERVIEW', 'MIDDLE', 69000, 30, NOW()),
    ('880f9501-f30c-52e5-b827-557766553333', 'Interview Enhance', 'INTERVIEW', 'ENHANCE', 129000, 120, NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    package_code = EXCLUDED.package_code,
    price = EXCLUDED.price,
    billing_units = EXCLUDED.billing_units;

DELETE FROM cv_benefit WHERE service_id IN (
    '550e8400-e29b-41d4-a716-446655440000',
    '660f9501-f30c-52e5-b827-557766551111'
);
INSERT INTO cv_benefit (id, service_id, max_templates, allow_semantic_sugg, allow_skill_sugg, show_pass_rate, created_at)
VALUES
    ('a1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 5, true, true, false, NOW()),
    ('a2222222-2222-2222-2222-222222222222', '660f9501-f30c-52e5-b827-557766551111', 10, true, true, true, NOW());

DELETE FROM interview_benefit WHERE service_id IN (
    '550e8400-e29b-41d4-a716-446655440000',
    '770f9501-f30c-52e5-b827-557766552222',
    '880f9501-f30c-52e5-b827-557766553333'
);
INSERT INTO interview_benefit (id, service_id, max_duration_min, allow_recording, allow_deep_feedbk, allow_comp_culture, created_at)
VALUES
    ('b2222222-2222-2222-2222-222222222222', '770f9501-f30c-52e5-b827-557766552222', 10, true, false, false, NOW()),
    ('b3333333-3333-3333-3333-333333333333', '880f9501-f30c-52e5-b827-557766553333', 15, true, true, true, NOW());
