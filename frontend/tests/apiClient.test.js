import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
});
const { default: apiClient } = await server.ssrLoadModule('/src/service/apiClient.js');
const { default: galleryService } = await server.ssrLoadModule('/src/service/galleryService.js');
const { paymentService } = await server.ssrLoadModule('/src/services/paymentService.js');
const savedStorage = globalThis.localStorage;
const savedWindow = globalThis.window;
after(async () => {
    await server.close();
    if (savedStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = savedStorage;
    if (savedWindow === undefined) delete globalThis.window;
    else globalThis.window = savedWindow;
});

test('public catalog supports guests and preserves existing user credentials', async () => {
    for (const token of [null, 'expired-token']) {
        globalThis.localStorage = { getItem: () => token };
        apiClient.defaults.adapter = async config => {
            assert.equal(config.url, '/templates');
            assert.equal(config.publicRequest, true);
            assert.equal(config.headers.Authorization, token ? `Bearer ${token}` : undefined);
            return { data: { result: [{ id: 'sample', name: 'Sample CV' }] }, status: 200, headers: {}, config };
        };
        const templates = await galleryService.getTemplates();
        assert.equal(templates[0].id, 'sample');
    }
});

test('a public catalog 401 neither refreshes tokens nor redirects to login', async () => {
    let storageReads = 0;
    let redirects = 0;
    globalThis.localStorage = { getItem: () => { storageReads++; return 'expired-token'; } };
    globalThis.window = { location: { set href(value) { redirects++; throw new Error(value); } } };
    const error = new Error('Catalog unavailable');
    apiClient.defaults.adapter = async config => {
        error.config = config;
        error.response = { status: 401 };
        throw error;
    };
    await assert.rejects(apiClient.get('/templates', { publicRequest: true }), failure => failure === error);
    assert.equal(storageReads, 1);
    assert.equal(redirects, 0);
});

test('protected API requests still receive the current access token', async () => {
    globalThis.localStorage = { getItem: () => 'valid-token' };
    apiClient.defaults.adapter = async config => {
        assert.equal(config.headers.Authorization, 'Bearer valid-token');
        return { data: {}, status: 200, headers: {}, config };
    };
    await apiClient.get('/gallery/assets');
});

test('payment history calls the protected endpoint and returns orders from the API envelope', async () => {
    globalThis.localStorage = { getItem: () => 'payment-token' };
    const orders = [{ id: 'order-1', serviceName: 'CV Middle', amount: 39000 }];
    apiClient.defaults.adapter = async config => {
        assert.equal(config.url, '/v1/payments/history');
        assert.equal(config.headers.Authorization, 'Bearer payment-token');
        return { data: { result: orders }, status: 200, headers: {}, config };
    };
    assert.deepEqual(await paymentService.getPaymentHistory(), orders);
    apiClient.defaults.adapter = async config => ({ data: { result: [] }, status: 200, headers: {}, config });
    assert.deepEqual(await paymentService.getPaymentHistory(), []);
});
