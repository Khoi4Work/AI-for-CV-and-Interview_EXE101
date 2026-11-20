import { useEffect, useRef, useState } from 'react';
import { adminService } from '../services/adminService.js';
import { getApiErrorMessage } from '../../../services/apiClient.js';

const CACHE_TTL_MS = 30_000;
const CACHE_MAX_ENTRIES = 50;
const USERS_CACHE_VERSION = 'users-v2';
const responseCache = new Map();
const requestVersions = new Map();

function cacheResponse(key, value) {
    if (!responseCache.has(key) && responseCache.size >= CACHE_MAX_ENTRIES) {
        const staleKey = [...responseCache].find(([, entry]) => !entry.pending)?.[0];
        if (staleKey !== undefined) responseCache.delete(staleKey);
    }
    responseCache.set(key, value);
}

export function useAdminData(path, params = {}) {
    const key = JSON.stringify(params);
    const [retry, setRetry] = useState(0);
    const [state, setState] = useState({ loading: true, data: null, error: '' });
    const previousRetry = useRef(retry);
    const cacheKey = `${path === 'users' ? USERS_CACHE_VERSION : path}:${key}`;
    useEffect(() => {
        let active = true;
        if (!path) return;
        const retryRequested = retry !== previousRetry.current;
        previousRetry.current = retry;
        let cached = responseCache.get(cacheKey);
        if (retryRequested) {
            requestVersions.set(cacheKey, (requestVersions.get(cacheKey) || 0) + 1);
            responseCache.delete(cacheKey);
            cached = undefined;
        }
        if (cached?.data !== undefined) {
            setState({ loading: retryRequested, data: cached.data, error: '' });
            if (!retryRequested && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
                return () => { active = false; };
            }
        } else {
            setState({ loading: true, data: null, error: '' });
        }

        let pending = cached?.pending;
        let requestVersion = cached?.requestVersion;
        if (!pending) {
            requestVersion = (requestVersions.get(cacheKey) || 0) + 1;
            requestVersions.set(cacheKey, requestVersion);
            pending = adminService.get(path, JSON.parse(key));
            cacheResponse(cacheKey, { ...cached, pending, requestVersion });
        }
        pending
            .then(data => {
                if (requestVersions.get(cacheKey) !== requestVersion) return;
                cacheResponse(cacheKey, { data, updatedAt: Date.now(), pending: null, requestVersion });
                if (active) setState({ loading: false, data, error: '' });
            })
            .catch(error => {
                if (requestVersions.get(cacheKey) !== requestVersion) return;
                const previous = responseCache.get(cacheKey);
                cacheResponse(cacheKey, { ...previous, pending: null });
                if (active) setState({ loading: false, data: previous?.data ?? null, error: getApiErrorMessage(error) });
            });
        return () => { active = false; };
    }, [path, key, cacheKey, retry]);
    return { ...state, retry: () => setRetry(value => value + 1) };
}
