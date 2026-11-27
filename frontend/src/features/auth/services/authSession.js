const ROLES = new Set(['ADMIN', 'ATTENDANCE', 'PARTNER', 'TESTER']);

export function createAuthSession(client, storage) {
    let state = { status: 'checking', profile: null, error: '', sessionExpired: false };
    let revision = 0;
    let loginEventId = 0;
    let pending;
    let logoutRequest;
    const listeners = new Set();
    const publish = value => { state = value; listeners.forEach(listener => listener()); };
    const clear = () => ['accessToken', 'refreshToken', 'userProfile'].forEach(key => storage.removeItem(key));
    const expire = (sessionExpired = false) => {
        revision++;
        pending = undefined;
        clear();
        publish({ status: 'guest', profile: null, error: '', sessionExpired });
    };
    const verify = () => {
        if (pending) return pending;
        const token = storage.getItem('accessToken');
        if (!token || token === 'undefined' || token === 'null') {
            expire();
            return Promise.resolve(null);
        }
        const attempt = revision;
        const background = state.status === 'profile-loading' || state.status === 'profile-error';
        const loginEvent = state.loginEvent;
        publish({ status: background ? 'profile-loading' : 'checking', profile: null, error: '', sessionExpired: false, loginEvent });
        const request = Promise.resolve().then(async () => {
            try {
                const response = await client.get('/auth/me');
                const profile = response.data?.result || response.data?.data || response.data;
                if (!profile?.email || !ROLES.has(profile.role)) throw new Error('Thông tin tài khoản chưa hợp lệ. Vui lòng thử lại.');
                if (attempt !== revision) return null;
                storage.setItem('userProfile', JSON.stringify(profile));
                publish({ status: 'authenticated', profile, error: '', sessionExpired: false, loginEvent });
                return profile;
            } catch (error) {
                if (attempt !== revision) return null;
                if (error.sessionExpired) {
                    expire(true);
                    return null;
                }
                publish({
                    status: background ? 'profile-error' : 'error',
                    profile: null,
                    error: 'Không tải được thông tin tài khoản. Vui lòng thử lại.',
                    sessionExpired: false,
                    loginEvent,
                });
                throw error;
            } finally {
                if (attempt === revision) pending = undefined;
            }
        });
        pending = request;
        return request;
    };
    return {
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        getSnapshot: () => state,
        verify,
        expire,
        logout(onComplete = () => {}) {
            if (logoutRequest) return logoutRequest;
            const refreshToken = storage.getItem('refreshToken');
            revision++;
            pending = undefined;
            const attempt = revision;
            clear();
            publish({ status: 'logging-out', profile: state.profile, error: '' });
            const revoke = refreshToken ? Promise.resolve().then(() => client.delete('/auth/tokens', {
                data: { refreshToken }, publicRequest: true, anonymousRequest: true, timeout: 5000
            })).catch(() => {}) : Promise.resolve();
            // Keep feedback visible even when revocation completes immediately.
            logoutRequest = Promise.all([revoke, new Promise(resolve => setTimeout(resolve, 2000))]).then(() => {
                if (revision === attempt) {
                    onComplete();
                    publish({ status: 'guest', profile: null, error: '' });
                }
            }).finally(() => { logoutRequest = undefined; });
            return logoutRequest;
        },
        login(tokens, method = 'email') {
            revision++;
            pending = undefined;
            storage.removeItem('userProfile');
            storage.setItem('accessToken', tokens.accessToken);
            if (tokens.refreshToken) storage.setItem('refreshToken', tokens.refreshToken);
            else storage.removeItem('refreshToken');
            publish({
                status: 'profile-loading',
                profile: null,
                error: '',
                sessionExpired: false,
                loginEvent: { id: ++loginEventId, method },
            });
            verify().catch(() => {});
            return Promise.resolve(null);
        },
        updateProfile(update) {
            if (state.status !== 'authenticated') return;
            const profile = typeof update === 'function' ? update(state.profile) : update;
            storage.setItem('userProfile', JSON.stringify(profile));
            publish({ ...state, profile });
        },
    };
}
