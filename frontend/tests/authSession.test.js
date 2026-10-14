import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthSession } from '../src/features/auth/services/authSession.js';

function storage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const member = { email: 'member@example.test', role: 'ATTENDANCE' };
const response = profile => ({ data: { result: profile } });

test('profile verification is shared and ignores cached ADMIN role', async () => {
    const saved = storage({ accessToken: 'access', userProfile: JSON.stringify({ ...member, role: 'ADMIN' }) });
    let resolve, calls = 0;
    const session = createAuthSession({ get: () => { calls++; return new Promise(done => { resolve = done; }); } }, saved);
    const first = session.verify();
    const second = session.verify();
    assert.equal(first, second);
    assert.equal(session.getSnapshot().status, 'checking');
    assert.equal(session.getSnapshot().profile, null);
    await Promise.resolve();
    resolve(response(member));
    await first;
    assert.equal(calls, 1);
    assert.equal(session.getSnapshot().status, 'authenticated');
    assert.equal(session.getSnapshot().profile.role, 'ATTENDANCE');
});

test('login trusts verified role rather than token response or supplied profile', async () => {
    const saved = storage();
    const session = createAuthSession({ get: async () => response(member) }, saved);
    const profile = await session.login({ accessToken: 'access', refreshToken: 'refresh', role: 'ADMIN' });
    assert.equal(profile.role, 'ATTENDANCE');
    assert.equal(saved.getItem('refreshToken'), 'refresh');
});

test('temporary profile failure keeps credentials and recovers through retry', async () => {
    const saved = storage({ accessToken: 'access', refreshToken: 'refresh' });
    let attempts = 0;
    const session = createAuthSession({ get: async () => {
        if (!attempts++) throw new Error('network unavailable');
        return response(member);
    } }, saved);
    await assert.rejects(session.verify());
    assert.equal(session.getSnapshot().status, 'error');
    assert.equal(saved.getItem('refreshToken'), 'refresh');
    assert.equal(session.getSnapshot().profile, null);
    await session.verify();
    assert.equal(session.getSnapshot().status, 'authenticated');
});

test('forbidden profile response does not log out or reuse cached privilege', async () => {
    const saved = storage({ accessToken: 'access', refreshToken: 'refresh', userProfile: JSON.stringify(member) });
    const session = createAuthSession({ get: async () => { throw { response: { status: 403 } }; } }, saved);
    await assert.rejects(session.verify());
    assert.equal(saved.getItem('accessToken'), 'access');
    assert.equal(session.getSnapshot().status, 'error');
});

test('confirmed expiration clears credentials and becomes guest', async () => {
    const saved = storage({ accessToken: 'expired', refreshToken: 'expired', userProfile: '{}' });
    const session = createAuthSession({ get: async () => { throw { sessionExpired: true }; } }, saved);
    await session.verify();
    assert.equal(session.getSnapshot().status, 'guest');
    assert.equal(saved.getItem('refreshToken'), null);
    assert.equal(saved.getItem('userProfile'), null);
});

test('late profile responses cannot restore logged-out or overwritten sessions', async () => {
    const saved = storage({ accessToken: 'access' });
    let resolve;
    const session = createAuthSession({ get: () => new Promise(done => { resolve = done; }) }, saved);
    const pending = session.verify();
    await Promise.resolve();
    session.expire();
    resolve(response({ ...member, role: 'ADMIN' }));
    await pending;
    assert.equal(session.getSnapshot().status, 'guest');
    assert.equal(saved.getItem('userProfile'), null);
});

test('logout exposes a loading state, deduplicates clicks and finishes after revocation', async () => {
    const saved = storage({ accessToken: 'access', refreshToken: 'refresh', userProfile: '{}' });
    let resolve, revocations = 0;
    const session = createAuthSession({ delete: async (url, config) => {
        revocations++;
        assert.equal(url, '/auth/tokens');
        assert.equal(config.data.refreshToken, 'refresh');
        assert.equal(config.timeout, 5000);
        await new Promise(done => { resolve = done; });
    } }, saved);
    let transitions = 0;
    const started = Date.now();
    const first = session.logout(() => {
        transitions++;
        assert.equal(session.getSnapshot().status, 'logging-out');
    });
    assert.equal(session.logout(), first);
    assert.equal(session.getSnapshot().status, 'logging-out');
    assert.equal(saved.getItem('accessToken'), null);
    await Promise.resolve();
    assert.equal(revocations, 1);
    resolve();
    assert.equal(session.getSnapshot().status, 'logging-out');
    await first;
    assert.ok(Date.now() - started >= 1900, 'logout feedback stays visible for roughly two seconds');
    assert.equal(transitions, 1);
    assert.equal(session.getSnapshot().status, 'guest');
});

test('failed server revocation still completes local logout and removes stored profile', async () => {
    const saved = storage({ accessToken: 'access', refreshToken: 'refresh', userProfile: '{}' });
    const session = createAuthSession({ delete: async () => { throw new Error('offline'); } }, saved);
    await session.logout();
    assert.equal(session.getSnapshot().status, 'guest');
    assert.equal(saved.getItem('refreshToken'), null);
    assert.equal(saved.getItem('userProfile'), null);
});
