export function parseGalleryDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatGalleryDate(value) {
    const date = parseGalleryDate(value);
    return date ? date.toLocaleString('vi-VN') : 'Chưa có thông tin';
}

export function getDateGroup(value, now = new Date()) {
    const date = parseGalleryDate(value);
    if (!date) return 'Chưa có ngày';
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (date >= today && date < new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)) return 'Hôm nay';
    if (date >= yesterday && date < today) return 'Hôm qua';
    return 'Trước đó';
}

const cvStatuses = {
    DRAFT: 'Bản nháp', COMPLETED: 'Hoàn thành', OPTIMIZED: 'AI Optimized',
    ANALYZING: 'Đang phân tích', OPTIMIZING: 'Đang tối ưu',
};

export function mapCV(cv) {
    const state = cv.optimizationState;
    const status = ['OPTIMIZED', 'ANALYZING', 'OPTIMIZING'].includes(state)
        ? state : (cv.status || 'DRAFT');
    return { ...cv, title: cv.name?.trim() || 'CV chưa đặt tên', status,
        statusLabel: cvStatuses[status] || status,
        updatedLabel: formatGalleryDate(cv.updatedAt || cv.createdAt) };
}

export function buildHistory(cvs = [], sessions = [], now = new Date()) {
    const cvNames = new Map(cvs.map(cv => [cv.id, cv.name]));
    const logs = [
        ...cvs.map(cv => ({ id: `cv-${cv.id}`, type: 'tao_cv', typeLabel: 'Tạo CV',
            title: cv.name?.trim() || 'CV chưa đặt tên', date: cv.createdAt,
            details: 'CV đã được tạo và lưu trong tài khoản.', statusLabel: mapCV(cv).statusLabel })),
        ...sessions.map(session => ({ id: `interview-${session.id}`, sessionId: session.id,
            type: 'phong_van', typeLabel: 'Phỏng vấn',
            title: `Phỏng vấn${session.interviewType ? ` · ${session.interviewType}` : ''}`,
            date: session.sessionDate || session.completedAt, score: session.overallScore,
            statusLabel: session.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang thực hiện',
            details: [cvNames.get(session.cvId), session.durationMinutes != null ? `${session.durationMinutes} phút` : null]
                .filter(Boolean).join(' · '),
        })),
    ];
    return logs.map(log => ({ ...log, time: formatGalleryDate(log.date), dateLabel: getDateGroup(log.date, now) }))
        .sort((a, b) => (parseGalleryDate(b.date)?.getTime() || 0) - (parseGalleryDate(a.date)?.getTime() || 0));
}
