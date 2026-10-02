import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const server = await createServer({
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false }, appType: 'custom',
});
const { default: apiClient } = await server.ssrLoadModule('/src/service/apiClient.js');
const { resendVerificationEmail, getResendWaitSeconds } = await server.ssrLoadModule('/src/service/emailVerificationService.js');
const oldStorage = globalThis.localStorage;
const oldWindow = globalThis.window;
after(async () => {
    await server.close();
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
});

test('resend trims email and omits stale credentials on public auth requests', async () => {
    globalThis.localStorage = { getItem: () => { throw new Error('Must not read auth credentials'); } };
    apiClient.defaults.adapter = async config => {
        assert.equal(config.url, '/auth/resend-verification');
        assert.deepEqual(JSON.parse(config.data), { email: 'user@example.com' });
        assert.equal(config.publicRequest, true);
        assert.equal(config.headers.Authorization, undefined);
        return { status: 200, headers: {}, data: {}, config };
    };
    await resendVerificationEmail(' user@example.com ');
});

test('resend preserves server throttling without redirecting or refreshing login', async () => {
    globalThis.window = { location: { set href(value) { throw new Error(`Unexpected redirect ${value}`); } } };
    const error = new Error('Rate limited');
    apiClient.defaults.adapter = async config => {
        error.config = config;
        error.response = { status: 429, headers: { 'retry-after': '120' } };
        throw error;
    };
    await assert.rejects(resendVerificationEmail('user@example.com'), failure => failure === error);
    assert.equal(getResendWaitSeconds(error), 120);
});

test('resend countdown handles HTTP dates and missing or malformed retry headers', () => {
    const now = Date.parse('2026-10-03T01:00:00Z');
    assert.equal(getResendWaitSeconds({ response: { headers: { 'retry-after': 'Sat, 03 Oct 2026 01:02:00 GMT' } } }, now), 120);
    assert.equal(getResendWaitSeconds({ response: { headers: { 'retry-after': 'invalid' } } }), 60);
    assert.equal(getResendWaitSeconds({}), 60);
});

test('check-email page renders publicly and retains email plus registration cooldown', async () => {
    const { default: CheckEmail } = await server.ssrLoadModule('/src/features/auth/pages/CheckEmail.jsx');
    const html = renderToStaticMarkup(createElement(MemoryRouter, {
        initialEntries: [{ pathname: '/check-email', state: { email: 'guest@example.com', registeredAt: Date.now() } }],
    }, createElement(CheckEmail)));
    assert.match(html, /Kiểm tra email của bạn/);
    assert.match(html, /value="guest@example.com"/);
    assert.match(html, /Gửi lại sau 60s/);
    assert.match(html, /disabled=""/);
    assert.match(html, /href="\/login"/);
});
