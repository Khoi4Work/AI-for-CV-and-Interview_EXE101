import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { getSavedCVPreviewData } from '../src/features/user/utils/savedCVPreview.js';

const server = await createServer({ cacheDir: 'node_modules/.vite-saved-cv-tests', optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false }, appType: 'custom' });
after(() => server.close());
const { default: SavedCVPreview } = await server.ssrLoadModule('/src/features/user/components/SavedCVPreview.jsx');
const { AppProvider } = await server.ssrLoadModule('/src/features/auth/contexts/AppContext.jsx');
const { CVPreviewProvider } = await server.ssrLoadModule('/src/features/cv/contexts/CVContext.jsx');
const { default: EditableText } = await server.ssrLoadModule('/src/features/cv/components/EditableText.jsx');

const cv = (templateId, name = 'Saved Candidate') => ({ id: name, template: { id: templateId }, content: {
    personalInfo: { name, email: `${name}@example.test` }, summary: 'Saved summary from database',
    experiences: [{ company: 'Saved Company', role: 'Engineer', details: ['Real achievement'] }],
    education: [{ school: 'Saved School' }], skills: [{ name: 'React', category: 'Frontend', level: 'ADVANCED' }],
} });
const render = child => renderToStaticMarkup(createElement(AppProvider, null, child));

test('all six templates render saved content as read-only text without editor controls', () => {
    for (const id of ['portfolio-hybrid', 'cloud-expert', 'security-analyst', 'data-scientist', 'the-standard', 'boardroom-ready']) {
        const html = render(createElement(SavedCVPreview, { cv: cv(id), compact: true }));
        assert.ok(html.includes('Saved Candidate'), id);
        assert.ok(html.includes('Saved summary from database'), id);
        assert.ok(html.includes('Saved Company'), id);
        if (id !== 'boardroom-ready') assert.ok(html.includes('Saved School'), id);
        assert.doesNotMatch(html, /<textarea|<input|<button|contenteditable=/i);
    }
});

test('previews isolate each CV from siblings and the surrounding editor context', () => {
    const html = render(createElement(CVPreviewProvider, { cvData: { personalInfo: { name: 'Editor draft' } } },
        createElement(Fragment, null,
            createElement(SavedCVPreview, { cv: cv('portfolio-hybrid', 'Alice') }),
            createElement(SavedCVPreview, { cv: cv('cloud-expert', 'Bob') }))));
    assert.ok(html.includes('Alice'));
    assert.ok(html.includes('Bob'));
    assert.ok(!html.includes('Editor draft'));
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

test('regular EditableText still renders an editable textarea outside preview mode', () => {
    const html = renderToStaticMarkup(createElement(EditableText, { value: 'Editor text', onChange: () => {} }));
    assert.match(html, /<textarea/);
    assert.ok(html.includes('Editor text'));
});
