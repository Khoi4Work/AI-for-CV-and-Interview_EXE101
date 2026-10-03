import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

const server = await createServer({ cacheDir: 'node_modules/.vite-editor-toolbar-tests',
    optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
after(() => server.close());
const { default: Toolbar } = await server.ssrLoadModule('/src/features/cv/components/TopNagivationToolBar.jsx');
const { AppProvider } = await server.ssrLoadModule('/src/features/auth/contexts/AppContext.jsx');
const { CVPreviewProvider } = await server.ssrLoadModule('/src/features/cv/contexts/CVContext.jsx');
const render = props => renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(AppProvider, null, createElement(CVPreviewProvider, { cvData: {} }, createElement(Toolbar, {
        cvName: 'My CV', onNameChange() {}, onTemplateChange() {},
        templateOptions: [{ id: 'free', name: 'Free', locked: false }, { id: 'paid', name: 'Premium', locked: true }],
        selectedTemplateId: 'free', ...props,
    })))));

test('toolbar shows save action and keeps paid templates disabled', () => {
    const html = render({});
    assert.match(html, /Lưu CV/);
    assert.match(html, /aria-label="Tên CV"/);
    assert.match(html, /<option value="paid" disabled="">Premium/);
    assert.doesNotMatch(html, /<option value="free" disabled/);
});

test('save and print actions are disabled while saving or access is unresolved', () => {
    for (const props of [{ saving: true }, { actionsDisabled: true, templatesLoading: true }]) {
        const html = render(props);
        const actionButtons = [...html.matchAll(/<button[^>]*>.*?<\/button>/g)]
            .map(match => match[0]).filter(button => /Lưu CV|Đang lưu|Lưu PDF/.test(button));
        assert.equal(actionButtons.length, 2);
        assert.ok(actionButtons.every(button => button.includes('disabled=""')));
    }
});
