const STORAGE_PREFIX = 'admin-session-state:';

export function readAdminSessionState(key, fallback) {
    try {
        const stored = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
        return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
    } catch {
        return fallback;
    }
}

export function writeAdminSessionState(key, state) {
    try {
        window.sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(state));
    } catch {
        // Keep the admin page usable if session storage is unavailable.
    }
}
