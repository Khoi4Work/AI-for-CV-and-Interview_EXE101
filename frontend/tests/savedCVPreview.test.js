import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { getSavedCVPreviewData } from '../src/features/user/utils/savedCVPreview.js';
import { mapCvDataForPdf } from '../src/features/cv/pdf-renderer/mapCvDataForPdf.js';
import { PDF_TEMPLATE_LOADERS } from '../src/features/cv/pdf-renderer/templateRegistry.js';

const server = await createServer({ envDir: 'node_modules/.vite-test-env', cacheDir: 'node_modules/.vite-saved-cv-tests', optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false }, appType: 'custom' });
after(() => server.close());
const { default: SavedCVPreview } = await server.ssrLoadModule('/src/features/user/components/SavedCVPreview.jsx');

const cv = (templateId, name = 'Saved Candidate') => ({ id: name, template: { id: templateId }, content: {
    personalInfo: { name, email: `${name}@example.test` }, summary: 'Saved summary from database',
    experiences: [{ company: 'Saved Company', role: 'Engineer', details: ['Real achievement'] }],
    education: [{ school: 'Saved School' }], skills: [{ name: 'React', category: 'Frontend', level: 'ADVANCED' }],
} });
const render = child => renderToStaticMarkup(child);

test('saved previews render stored content for every supported template without edit controls', () => {
    for (const id of ['portfolio-hybrid', 'cloud-expert', 'security-analyst', 'data-scientist', 'the-standard', 'boardroom-ready']) {
        assert.equal(typeof PDF_TEMPLATE_LOADERS[id], 'function', id);
        const html = render(createElement(SavedCVPreview, { cv: cv(id), compact: true }));
        assert.ok(html.includes(`cv-template-${id}`), id);
        assert.ok(html.includes('Saved Candidate'), id);
        assert.ok(html.includes('Saved summary from database'), id);
        assert.ok(html.includes('Saved Company'), id);
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

test('reference templates preserve education achievements and emphasize executive project labels', () => {
    for (const id of ['data-scientist', 'security-analyst', 'boardroom-ready']) {
        const saved = cv(id);
        saved.content.education[0].details = ['First-place graduation'];
        saved.content.projects = [{name: 'Authentication', details: ['Project description: Secure login', 'Responsibilities: Build APIs']}];
        const before = JSON.stringify(saved);
        const html = render(createElement(SavedCVPreview, {cv: saved}));
        assert.ok(html.includes('First-place graduation'), id);
        assert.ok(html.includes('Secure login'), id);
        assert.ok(html.includes('Build APIs'), id);
        if (id !== 'data-scientist') {
            assert.ok(html.includes('<strong>Project description:</strong>'), id);
            assert.ok(html.includes('<strong>Responsibilities:</strong>'), id);
        }
        assert.equal(JSON.stringify(saved), before);
    }
});

test('certificate links in all six previews are clickable only for web URLs', () => {
    for (const id of Object.keys(PDF_TEMPLATE_LOADERS)) {
        const saved = cv(id);
        saved.content.certificates = [{name: 'Certificate', url: 'https://example.test/certificate'}];
        let html = render(createElement(SavedCVPreview, {cv: saved}));
        assert.ok(html.includes('href="https://example.test/certificate"'), id);
        assert.ok(html.includes('View certificate'), id);
        saved.content.certificates[0].url = 'javascript:alert(1)';
        html = render(createElement(SavedCVPreview, {cv: saved}));
        assert.ok(!html.includes('href="javascript:'), id);
    }
});

test('missing template, missing content and unsupported template show useful fallbacks', () => {
    for (const [data, message] of [[{ content: {} }, 'CV chưa có nội dung'], [{ template: { id: 'cloud-expert' } }, 'CV chưa có nội dung'], [cv('unsupported'), 'Mẫu CV này chưa hỗ trợ']]) {
        assert.ok(render(createElement(SavedCVPreview, { cv: data })).includes(message));
    }
});

test('uploaded CVs preview extracted content without assigning a template or mutating saved data', () => {
    const uploaded = cv(null, 'Imported Candidate');
    uploaded.content.professionalTitle = 'Frontend Developer';
    uploaded.content.projects = [{name: 'Portfolio project', details: ['Project outcome']}];
    uploaded.content.certificates = [{name: 'Certificate A', issuer: 'Issuer A'}];
    uploaded.content.languages = [{name: 'Vietnamese', level: 'Native'}];
    uploaded.content.awards = [{name: 'Award A'}];
    const before = JSON.stringify(uploaded);
    const compact = render(createElement(SavedCVPreview, {cv: uploaded, compact: true}));
    const full = render(createElement(SavedCVPreview, {cv: uploaded}));
    for (const html of [compact, full]) {
        assert.ok(html.includes('CV tải lên'));
        assert.ok(html.includes('Imported Candidate'));
        assert.ok(html.includes('Frontend Developer'));
        assert.ok(html.includes('React'));
        assert.doesNotMatch(html, /CV chưa chọn mẫu|cv-template-|contenteditable=|<input|<button/i);
    }
    for (const content of ['Saved summary from database', 'Saved Company', 'Real achievement', 'Saved School', 'Portfolio project', 'Project outcome', 'Certificate A', 'Vietnamese', 'Award A']) {
        assert.ok(full.includes(content), content);
    }
    assert.ok(!compact.includes('Project outcome'));
    assert.equal(JSON.stringify(uploaded), before);
});

test('uploaded previews handle partial content and escape extracted text', () => {
    const partial = {content: {personalInfo: null, experiences: [null, {details: null}], skills: [{name: {invalid: true}}],
        sourceText: '<script>alert("unsafe")</script>', education: null}};
    for (const compact of [false, true]) {
        const html = render(createElement(SavedCVPreview, {cv: partial, compact}));
        assert.ok(html.includes('CV tải lên'));
        assert.ok(html.includes('&lt;script&gt;'));
        assert.doesNotMatch(html, /<script>/);
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
