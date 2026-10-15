const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;

export function isValidEmail(value) {
    return EMAIL_PATTERN.test(String(value || '').trim());
}

export function isValidOptionalPhone(value) {
    const phone = String(value || '').trim();
    if (!phone) return true;
    const digits = phone.replace(/\D/g, '');
    return PHONE_PATTERN.test(phone) && digits.length >= 7 && digits.length <= 15;
}

export function isValidOptionalUrl(value) {
    const url = String(value || '').trim();
    if (!url) return true;
    try {
        const parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(url) ? url : `https://${url}`);
        return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname.includes('.'));
    } catch {
        return false;
    }
}

export function validateProfile(formData) {
    const errors = {};
    if (!String(formData.fullName || '').trim()) errors.fullName = 'Vui lòng nhập họ và tên.';
    else if (String(formData.fullName).trim().length > 255) errors.fullName = 'Họ và tên không được vượt quá 255 ký tự.';

    if (!isValidOptionalPhone(formData.phone)) errors.phone = 'Số điện thoại cần có 7–15 chữ số.';

    for (const field of ['location', 'profession', 'linkedin', 'portfolio', 'github']) {
        if (String(formData[field] || '').length > 255) errors[field] = 'Không được vượt quá 255 ký tự.';
    }
    for (const field of ['linkedin', 'portfolio', 'github']) {
        if (formData[field] && !isValidOptionalUrl(formData[field])) errors[field] = 'Vui lòng nhập URL hợp lệ.';
    }
    return errors;
}

function collectTextErrors(cvData) {
    const errors = [];
    const check = (label, value, max = 5000) => {
        if (typeof value === 'string' && value.length > max) errors.push(`${label}: tối đa ${max} ký tự.`);
    };
    const personal = cvData.personalInfo || {};
    if (String(personal.email || '').trim() && !isValidEmail(personal.email)) errors.push('Email CV không đúng định dạng.');
    if (String(personal.email || '').trim() && personal.email.length > 254) errors.push('Email CV không được vượt quá 254 ký tự.');
    if (!isValidOptionalPhone(personal.phone)) errors.push('Số điện thoại CV cần có 7–15 chữ số.');
    if (personal.linkedin && !isValidOptionalUrl(personal.linkedin)) errors.push('Liên kết LinkedIn cần là URL hợp lệ.');
    if (String(personal.dob || '').trim()) {
        const date = parseDate(personal.dob);
        if (!date) errors.push('Ngày sinh cần đúng định dạng ngày hợp lệ.');
        else if (date > new Date()) errors.push('Ngày sinh không thể ở tương lai.');
    }
    for (const [key, label] of [['name', 'Họ và tên'], ['professionalTitle', 'Chức danh'], ['summary', 'Tóm tắt']]) {
        check(label, key === 'name' ? personal.name : cvData[key], key === 'summary' ? 5000 : 255);
    }
    check('Địa chỉ', personal.address, 500);
    check('Số điện thoại', personal.phone, 24);
    check('Ngày sinh', personal.dob, 32);
    check('Liên kết LinkedIn', personal.linkedin, 2048);
    for (const [key, label] of [['experiences', 'Kinh nghiệm'], ['education', 'Học vấn'], ['projects', 'Dự án'], ['skills', 'Kỹ năng'], ['certificates', 'Chứng chỉ'], ['languages', 'Ngoại ngữ'], ['awards', 'Giải thưởng']]) {
        (cvData[key] || []).forEach((record, index) => {
            for (const [field, value] of Object.entries(record || {})) {
                if (field === 'id' || field === 'level') continue;
                const labelField = field === 'details' ? 'Mô tả' : field;
                const printable = Array.isArray(value) ? value.join(' ') : value;
                check(`${label} ${index + 1} (${labelField})`, printable, 5000);
            }
            if (record?.url && !isValidOptionalUrl(record.url)) errors.push(`${label} ${index + 1}: liên kết không hợp lệ.`);
        });
    }
    return errors;
}

function parseDate(value) {
    const text = String(value).trim();
    const dayFirst = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/.exec(text);
    if (dayFirst) {
        const [, dayText, monthText, yearText] = dayFirst;
        const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
        if (date.getFullYear() !== Number(yearText) || date.getMonth() !== Number(monthText) - 1 || date.getDate() !== Number(dayText)) return null;
        return date;
    }
    const timestamp = Date.parse(text);
    return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

export function validateCVData(cvData, { requireBuilderContacts = false } = {}) {
    const errors = collectTextErrors(cvData || {});
    const personal = cvData?.personalInfo || {};
    if (requireBuilderContacts) {
        if (!String(personal.name || '').trim()) errors.unshift('Vui lòng nhập họ và tên.');
        if (!String(personal.email || '').trim()) errors.unshift('Vui lòng nhập email liên lạc.');
    }
    return [...new Set(errors)];
}
