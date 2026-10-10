import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';

export function useAdminData(path, params = {}) {
    const key = JSON.stringify(params);
    const [retry, setRetry] = useState(0);
    const [state, setState] = useState({ loading: true, data: null, error: '' });
    useEffect(() => {
        let active = true;
        if (!path) return;
        Promise.resolve().then(async () => {
            if (!active) return;
            setState({ loading: true, data: null, error: '' });
            try {
                const data = await adminService.get(path, JSON.parse(key));
                if (active) setState({ loading: false, data, error: '' });
            } catch (error) {
                if (active) setState({ loading: false, data: null, error: getApiErrorMessage(error) });
            }
        });
        return () => { active = false; };
    }, [path, key, retry]);
    return { ...state, retry: () => setRetry(value => value + 1) };
}
