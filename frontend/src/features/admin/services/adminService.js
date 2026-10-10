import apiClient from '../../../service/apiClient.js';

export const adminService = {
    async get(path, params = {}) {
        const response = await apiClient.get(`/admin/${path}`, { params });
        return response.data?.result;
    },
    async identity() {
        const response = await apiClient.get('/auth/me');
        return response.data?.result;
    },
};
