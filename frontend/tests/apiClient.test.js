import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
});
const { default: apiClient } = await server.ssrLoadModule('/src/service/apiClient.js');
let refreshAdapter;
apiClient.interceptors.request.use(config => {
    if (config.url === '/auth/tokens/refresh') config.adapter = refreshAdapter;
    return config;
});
const { default: galleryService } = await server.ssrLoadModule('/src/service/galleryService.js');
const { adminService } = await server.ssrLoadModule('/src/features/admin/services/adminService.js');
const { paymentService } = await server.ssrLoadModule('/src/features/payment/services/paymentService.js');
const savedStorage = globalThis.localStorage;
const savedWindow = globalThis.window;

test('admin requests use authenticated endpoints and preserve pagination filters', async () => {
    globalThis.localStorage = { getItem: () => 'admin-token' };
    apiClient.defaults.adapter = async config => {
        assert.equal(config.url, '/admin/payments');
        assert.equal(config.headers.Authorization, 'Bearer admin-token');
        assert.deepEqual(config.params, { page: 2, status: 'PAID', includeTest: false });
        return { data: { result: { content: [], totalElements: 0 } }, status: 200, headers: {}, config };
    };
    assert.deepEqual(await adminService.get('payments', { page: 2, status: 'PAID', includeTest: false }), { content: [], totalElements: 0 });
});
after(async () => {
    await server.close();
    if (savedStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = savedStorage;
    if (savedWindow === undefined) delete globalThis.window;
    else globalThis.window = savedWindow;
});

function sessionStorage() {
    const values = new Map([['accessToken', 'old-access'], ['refreshToken', 'refresh'], ['userProfile', '{}']]);
    return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
function apiFailure(status, config) {
    const error = new Error(`HTTP ${status}`);
    error.config = config;
    error.response = { status };
    return error;
}

test('403 preserves credentials without refresh or redirect', async () => {
    globalThis.localStorage = sessionStorage();
    let refreshCalls = 0;
    refreshAdapter = async () => { refreshCalls++; throw new Error('unexpected refresh'); };
    apiClient.defaults.adapter = async config => { throw apiFailure(403, config); };
    await assert.rejects(apiClient.get('/admin/users'));
    assert.equal(refreshCalls, 0);
    assert.equal(localStorage.getItem('accessToken'), 'old-access');
});

test('temporary refresh network failure preserves the session for retry', async () => {
    globalThis.localStorage = sessionStorage();
    refreshAdapter = async () => { throw new Error('network unavailable'); };
    apiClient.defaults.adapter = async config => { throw apiFailure(401, config); };
    await assert.rejects(apiClient.get('/auth/me'));
    assert.equal(localStorage.getItem('refreshToken'), 'refresh');
    assert.equal(localStorage.getItem('accessToken'), 'old-access');
});

test('refresh server failure preserves credentials rather than signing out', async () => {
    globalThis.localStorage = sessionStorage();
    refreshAdapter = async config => { throw apiFailure(500, config); };
    apiClient.defaults.adapter = async config => { throw apiFailure(401, config); };
    await assert.rejects(apiClient.get('/auth/me'));
    assert.equal(localStorage.getItem('refreshToken'), 'refresh');
});

test('backend INVALID_INPUT refresh rejection is treated as expired authentication', async () => {
    globalThis.localStorage = sessionStorage();
    globalThis.window = { dispatchEvent: () => {} };
    refreshAdapter = async config => {
        const error = apiFailure(400, config);
        error.response.data = { code: 4002, message: 'Invalid or expired refresh token' };
        throw error;
    };
    apiClient.defaults.adapter = async config => { throw apiFailure(401, config); };
    await assert.rejects(apiClient.get('/auth/me'), error => error.sessionExpired === true);
    assert.equal(localStorage.getItem('refreshToken'), null);
});

test('rejected refresh clears credentials and notifies auth context without hard navigation', async () => {
    globalThis.localStorage = sessionStorage();
    let events = 0;
    globalThis.window = { dispatchEvent: event => { assert.equal(event.type, 'auth:expired'); events++; } };
    refreshAdapter = async config => { throw apiFailure(401, config); };
    apiClient.defaults.adapter = async config => { throw apiFailure(401, config); };
    await assert.rejects(apiClient.get('/auth/me'), error => error.sessionExpired === true);
    assert.equal(events, 1);
    assert.equal(localStorage.getItem('refreshToken'), null);
    assert.equal(localStorage.getItem('userProfile'), null);
});

test('concurrent 401 requests share one refresh and retry with the new token', async () => {
    globalThis.localStorage = sessionStorage();
    let refreshCalls = 0;
    refreshAdapter = async config => {
        refreshCalls++;
        await new Promise(resolve => setTimeout(resolve, 5));
        return { data: { result: { accessToken: 'new-access' } }, status: 200, headers: {}, config };
    };
    apiClient.defaults.adapter = async config => {
        if (config.headers.Authorization !== 'Bearer new-access') throw apiFailure(401, config);
        return { data: {}, status: 200, headers: {}, config };
    };
    await Promise.all([apiClient.get('/auth/me'), apiClient.get('/gallery/assets')]);
    assert.equal(refreshCalls, 1);
    assert.equal(localStorage.getItem('accessToken'), 'new-access');
});

test('a second 401 after refresh ends the session instead of looping', async () => {
    globalThis.localStorage = sessionStorage();
    globalThis.window = { dispatchEvent: () => {} };
    let refreshCalls = 0;
    refreshAdapter = async config => {
        refreshCalls++;
        return { data: { result: { accessToken: 'new-access' } }, status: 200, headers: {}, config };
    };
    apiClient.defaults.adapter = async config => { throw apiFailure(401, config); };
    await assert.rejects(apiClient.get('/auth/me'), error => error.sessionExpired === true);
    assert.equal(refreshCalls, 1);
    assert.equal(localStorage.getItem('accessToken'), null);
});

test('late unauthorized response from an older login cannot clear new credentials', async () => {
    globalThis.localStorage = sessionStorage();
    let events = 0;
    globalThis.window = { dispatchEvent: () => { events++; } };
    apiClient.defaults.adapter = async config => {
        localStorage.setItem('accessToken', 'new-login');
        localStorage.setItem('refreshToken', 'new-refresh');
        throw apiFailure(401, config);
    };
    await assert.rejects(apiClient.get('/auth/me'));
    assert.equal(localStorage.getItem('accessToken'), 'new-login');
    assert.equal(localStorage.getItem('refreshToken'), 'new-refresh');
    assert.equal(events, 0);
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
