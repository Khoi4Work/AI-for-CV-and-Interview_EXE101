import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { getSavedCVPreviewData } from '../src/features/user/utils/savedCVPreview.js';
import { mapCvDataForPdf } from '../src/features/cv/pdf-renderer/mapCvDataForPdf.js';
import { PDF_TEMPLATE_LOADERS } from '../src/features/cv/pdf-renderer/templateRegistry.js';

const server = await createServer({ cacheDir: 'node_modules/.vite-saved-cv-tests', optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false }, appType: 'custom' });
after(() => server.close());
const { default: SavedCVPreview } = await server.ssrLoadModule('/src/features/user/components/SavedCVPreview.jsx');

const cv = (templateId, name = 'Saved Candidate') => ({ id: name, template: { id: templateId }, content: {
    personalInfo: { name, email: `${name}@example.test` }, summary: 'Saved summary from database',
    experiences: [{ company: 'Saved Company', role: 'Engineer', details: ['Real achievement'] }],
    education: [{ school: 'Saved School' }], skills: [{ name: 'React', category: 'Frontend', level: 'ADVANCED' }],
} });
const render = child => renderToStaticMarkup(child);

test('saved previews route every supported template to the PDF renderer', () => {
    for (const id of ['portfolio-hybrid', 'cloud-expert', 'security-analyst', 'data-scientist', 'the-standard', 'boardroom-ready']) {
        assert.equal(typeof PDF_TEMPLATE_LOADERS[id], 'function', id);
        const html = render(createElement(SavedCVPreview, { cv: cv(id), compact: true }));
        assert.ok(html.includes('Đang tạo bản xem trước PDF'), id);
        assert.doesNotMatch(html, /<textarea|<input|<button|contenteditable=/i);
    }
});

test('saved preview renderer inputs isolate CVs and preserve their stored content', () => {
    const alice = mapCvDataForPdf(getSavedCVPreviewData(cv('portfolio-hybrid', 'Alice')));
    const bob = mapCvDataForPdf(getSavedCVPreviewData(cv('cloud-expert', 'Bob')));
    assert.equal(alice.personalInfo.name, 'Alice');
    assert.equal(alice.summary, 'Saved summary from database');
    assert.equal(alice.experiences[0].company, 'Saved Company');
    assert.equal(bob.personalInfo.name, 'Bob');
    assert.equal(bob.personalInfo.email, 'Bob@example.test');
});

test('missing template, missing content and unsupported template show useful fallbacks', () => {
    for (const [data, message] of [[{ content: {} }, 'CV chưa chọn mẫu.'], [{ template: { id: 'cloud-expert' } }, 'CV chưa có nội dung'], [cv('unsupported'), 'Mẫu CV này chưa hỗ trợ']]) {
        assert.ok(render(createElement(SavedCVPreview, { cv: data })).includes(message));
    }
});

test('normalization preserves stored content, supplies safe arrays and prefers the saved template relation', () => {
    const original = { template: { id: 'cloud-expert' }, content: { selectedTemplateId: 'portfolio-hybrid', experiences: [{ company: 'Example', details: null }], projects: null } };
    const before = JSON.stringify(original);
    const data = getSavedCVPreviewData(original);
    assert.equal(data.selectedTemplateId, 'cloud-expert');
    assert.deepEqual(data.experiences[0].details, []);
    assert.deepEqual(data.projects, []);
    assert.deepEqual(data.awards, []);
    assert.equal(JSON.stringify(original), before);
});
