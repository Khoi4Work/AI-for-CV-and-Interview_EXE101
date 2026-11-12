import apiClient from '../../../services/apiClient.js';

export const adminService = {
    async get(path, params = {}) {
        const response = await apiClient.get(`/admin/${path}`, { params });
        return response.data?.result;
    },
};
