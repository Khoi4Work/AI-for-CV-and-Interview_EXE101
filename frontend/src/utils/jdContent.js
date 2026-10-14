const labels = { title: 'Vị trí', company: 'Công ty', companyName: 'Công ty', description: 'Mô tả công việc',
    overview: 'Tổng quan', details: 'Chi tiết công việc', bullets: 'Nội dung', responsibilities: 'Trách nhiệm',
    requirements: 'Yêu cầu', qualifications: 'Trình độ', skills: 'Kỹ năng', benefits: 'Quyền lợi',
    experience: 'Kinh nghiệm', experienceLevel: 'Cấp độ kinh nghiệm', education: 'Học vấn', location: 'Địa điểm',
    employmentType: 'Hình thức làm việc', source: 'Nguồn tham khảo', sourceUrl: 'Nguồn tham khảo' };

function format(value, depth = 0) {
    const indent = '  '.repeat(depth);
    if (Array.isArray(value)) return value.map(item => typeof item === 'object' && item !== null
        ? format(item, depth) : `${indent}- ${String(item)}`).join('\n');
    if (value && typeof value === 'object') return Object.entries(value).filter(([, v]) => v != null && v !== '')
        .map(([key, v]) => `${indent}${labels[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ')}:${typeof v === 'object' ? '\n' : ' '}${format(v, depth + 1)}`).join('\n\n');
    return value == null ? '' : String(value);
}
export function formatJD(content) {
    if (!content) return '';
    try { return format(JSON.parse(content)); } catch { return content; }
}
export function jdSourceLabel(source) {
    return source === 'SYSTEM' ? 'JD tham khảo' : 'JD do bạn cung cấp · Chưa xác minh nguồn';
}
