import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import TheStandardHtmlTemplate, {standardTemplateFontCss} from './templates/TheStandardHtmlTemplate.jsx';
import templateCss from './templates/TheStandardHtmlTemplate.css?inline';

async function inlineProfilePhoto(source) {
    if (!source) return '';
    if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(source)) return source;
    if (!/^https?:\/\//i.test(source)) return '';
    try {
        const response = await fetch(source, {mode: 'cors'});
        if (!response.ok) return '';
        const image = await response.blob();
        if (!image.type.startsWith('image/')) return '';
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = reject;
            reader.readAsDataURL(image);
        });
    } catch {
        return '';
    }
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
}

export async function buildStandardCvHtml(source = {}) {
    const data = {...source, personalInfo: {...(source.personalInfo || {})}};
    data.profilePhoto = await inlineProfilePhoto(data.profilePhoto);
    const content = renderToStaticMarkup(createElement(TheStandardHtmlTemplate, {data, includeStyles: false}));
    const styles = `${standardTemplateFontCss}\n${templateCss}`;
    if (!content.includes('cv-standard') || !styles.trim()) {
        throw new Error('Không thể xuất PDF vì HTML/CSS của CV Standard chưa đầy đủ.');
    }
    return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CV ' +
        escapeHtml(data.personalInfo.name) + '</title><style>' + styles + '</style></head><body class="cv-standard-pdf">' + content + '</body></html>';
}
