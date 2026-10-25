import test from 'node:test';
import assert from 'node:assert/strict';
import { mapCV, buildHistory, getDateGroup, formatGalleryDate } from '../src/features/user/utils/galleryData.js';

test('CV cards use backend names, dates and optimization state without inventing scores', () => {
    const cv = mapCV({ id: '1', name: 'Developer', status: 'DRAFT', optimizationState: 'OPTIMIZED', score: 0, updatedAt: '2026-10-03T10:00:00' });
    assert.equal(cv.title, 'Developer');
    assert.equal(cv.status, 'OPTIMIZED');
    assert.equal(cv.statusLabel, 'AI Optimized');
    assert.equal(cv.score, 0);
    assert.notEqual(cv.updatedLabel, 'Chưa có thông tin');
    assert.equal(mapCV({ status: 'DRAFT' }).statusLabel, 'Bản nháp');
    assert.equal(mapCV({ status: 'COMPLETED' }).statusLabel, 'Hoàn thành');
    assert.equal(mapCV({ optimizationState: 'OPTIMIZING' }).statusLabel, 'Đang tối ưu');
    assert.equal(mapCV({}).title, 'CV chưa đặt tên');
    assert.equal(mapCV({}).score, undefined);
});

test('history combines real CV creation and interview records, orders dates, retains zero scores', () => {
    const logs = buildHistory([{ id: 'cv1', name: 'Developer', createdAt: '2026-10-02T08:00:00' }], [
        { id: 's1', cvId: 'cv1', overallScore: 0, status: 'COMPLETED', sessionDate: '2026-10-03T08:00:00', durationMinutes: 15 },
    ], new Date(2026, 9, 3, 12));
    assert.equal(logs.length, 2);
    assert.equal(logs[0].sessionId, 's1');
    assert.equal(logs[0].dateLabel, 'Hôm nay');
    assert.equal(logs[0].score, 0);
    assert.equal(logs[0].details, 'Developer · 15 phút');
    assert.equal(logs[1].type, 'tao_cv');
    assert.equal(logs[1].cvId, 'cv1');
    assert.equal(logs[1].dateLabel, 'Hôm qua');
    assert.notEqual(logs[0].id, logs[1].id);
});

test('date grouping uses calendar days across month boundaries and keeps missing dates visible', () => {
    const now = new Date(2026, 9, 1, 0, 5);
    assert.equal(getDateGroup('2026-09-30T23:59:00', now), 'Hôm qua');
    assert.equal(getDateGroup('2026-09-29T23:59:00', now), 'Trước đó');
    assert.equal(getDateGroup('invalid', now), 'Chưa có ngày');
    assert.equal(formatGalleryDate(null), 'Chưa có thông tin');
    assert.equal(buildHistory([{ id: '1' }], [], now)[0].dateLabel, 'Chưa có ngày');
});

test('empty history and feedback restricted sessions do not fabricate activities or comments', () => {
    assert.deepEqual(buildHistory(), []);
    const [log] = buildHistory([], [{ id: '1', feedbackJson: null, completedAt: '2026-10-01T12:00:00' }]);
    assert.equal(log.type, 'phong_van');
    assert.equal(log.aiComment, undefined);
    assert.equal(log.score, undefined);
    assert.equal(log.time, formatGalleryDate('2026-10-01T12:00:00'));
});

test('AI history keeps separate evaluations, snapshot names, dates and zero scores', () => {
    const logs = buildHistory([{ id: 'cv', name: 'Renamed CV', createdAt: '2026-10-01T08:00:00' }], [],
        new Date(2026, 9, 25, 14), [
            { analysisId: 'a1', cvId: 'cv', cvName: 'Original CV', jdTitle: 'Backend', companyName: 'Example', score: 0,
                status: 'COMPLETED', createdAt: '2026-10-25T10:00:00' },
            { analysisId: 'a2', cvId: 'cv', status: 'INSUFFICIENT_EVIDENCE', score: null, createdAt: '2026-10-24T10:00:00' },
        ]);
    assert.equal(logs.length, 3);
    assert.equal(logs[0].analysisId, 'a1');
    assert.equal(logs[0].title, 'Original CV');
    assert.equal(logs[0].score, 0);
    assert.equal(logs[0].details, 'Backend · Example');
    assert.equal(logs[0].scoreLabel, 'Điểm đánh giá CV');
    assert.equal(logs[0].dateLabel, 'Hôm nay');
    assert.equal(logs[1].type, 'danh_gia_cv');
    assert.equal(logs[1].score, null);
    assert.equal(logs[1].statusLabel, 'Chưa đủ thông tin đánh giá');
    assert.equal(new Set(logs.map(log => log.id)).size, 3);
});
