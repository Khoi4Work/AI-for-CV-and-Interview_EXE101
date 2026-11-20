import apiClient from '../../../services/apiClient.js';

export const adminService = {
    async get(path, params = {}) {
        const response = await apiClient.get(`/admin/${path}`, { params });
        return response.data?.result;
    },
    async setTesterRole(accountId, enabled) {
        const method = enabled ? 'put' : 'delete';
        const response = await apiClient[method](`/admin/users/${accountId}/tester`);
        return response.data?.result;
    },
};
