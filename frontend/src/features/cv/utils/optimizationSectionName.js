const SECTION_LABELS = {
    overall: 'Tổng quan',
    personalInfo: 'Thông tin cá nhân',
    professionalTitle: 'Chức danh nghề nghiệp',
    summary: 'Tóm tắt chuyên môn',
    experiences: 'Kinh nghiệm làm việc',
    education: 'Học vấn',
    skills: 'Kỹ năng',
    projects: 'Dự án',
    certificates: 'Chứng chỉ',
    languages: 'Ngoại ngữ',
    awards: 'Giải thưởng',
    details: 'Mô tả',
    company: 'Công ty',
    role: 'Vị trí',
    period: 'Thời gian',
    school: 'Trường học',
    degree: 'Bằng cấp',
    name: 'Tên',
    issuer: 'Đơn vị cấp',
    date: 'Ngày',
    url: 'Liên kết',
    email: 'Email',
    phone: 'Điện thoại',
    address: 'Địa chỉ',
    linkedin: 'LinkedIn',
};

function humanize(segment) {
    const normalized = segment.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
    return SECTION_LABELS[segment] || normalized.charAt(0).toLocaleUpperCase('vi-VN') + normalized.slice(1);
}

export function formatOptimizationSectionName(value, fallbackIndex = 0) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return `Nội dung CV ${fallbackIndex + 1}`;
    if (/^overall$/i.test(raw)) return SECTION_LABELS.overall;
    if (SECTION_LABELS[raw]) return SECTION_LABELS[raw];
    const pathPattern = /^[A-Za-z_$][\w$]*(?:\[\d+\])?(?:\.[A-Za-z_$][\w$]*(?:\[\d+\])?)*$/;
    if (!pathPattern.test(raw)) return raw;

    const labels = [];
    for (const segment of raw.split('.')) {
        const match = segment.match(/^([A-Za-z_$][\w$]*)(?:\[(\d+)\])?$/);
        if (!match) continue;
        const label = humanize(match[1]);
        labels.push(match[2] === undefined ? label : `${label} ${Number(match[2]) + 1}`);
    }
    return labels.length ? labels.join(' · ') : `Nội dung CV ${fallbackIndex + 1}`;
}
