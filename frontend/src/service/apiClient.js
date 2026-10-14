import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BE_URL || 'http://localhost:8080/api',
    timeout: 100000,
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});

// Request interceptor: thêm token vào header
apiClient.interceptors.request.use((config) => {
    if (config.anonymousRequest) {
        delete config.headers.Authorization;
        return config;
    }
    const token = localStorage.getItem('accessToken');
    if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

let refreshPromise;
function expireSession(error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    error.sessionExpired = true;
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') window.dispatchEvent(new Event('auth:expired'));
    return error;
}

// Response interceptor: refresh 401 once; permission and temporary failures keep the session.
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Catalog failures should stay on the public page, without refreshing or redirecting.
        if (originalRequest?.publicRequest) return Promise.reject(error);
        if (error.response?.status === 401 && originalRequest) {
            const currentToken = localStorage.getItem('accessToken');
            const requestToken = originalRequest.headers?.Authorization;
            if (requestToken && requestToken !== `Bearer ${currentToken}`) {
                // This response belongs to an older session; do not revoke a newer login.
                return Promise.reject(error);
            }
            if (originalRequest._retry) return Promise.reject(expireSession(error));
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return Promise.reject(expireSession(error));
            try {
                if (!refreshPromise) {
                    refreshPromise = apiClient.put('/auth/tokens/refresh', {
                        refreshToken
                    }, { publicRequest: true, anonymousRequest: true }).then(response => {
                        const result = response.data?.result || response.data?.data;
                        if (!result?.accessToken) throw new Error('Không nhận được phiên đăng nhập mới. Vui lòng thử lại.');
                        // A late refresh must never overwrite a newer login or restore a logged-out session.
                        if (localStorage.getItem('refreshToken') !== refreshToken) throw new Error('Phiên đăng nhập đã thay đổi.');
                        localStorage.setItem('accessToken', result.accessToken);
                        if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken);
                        return result.accessToken;
                    }).finally(() => { refreshPromise = undefined; });
                }
                const accessToken = await refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                const status = refreshError.response?.status;
                const invalidRefresh = status === 400 && refreshError.response?.data?.code === 4002;
                if ((status === 401 || status === 403 || invalidRefresh) && localStorage.getItem('refreshToken') === refreshToken) expireSession(refreshError);
                return Promise.reject(refreshError);
            }
        }
        if (error.response?.status === 403) return Promise.reject(error);
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;

export const getApiErrorMessage = (error, fallback = 'Yêu cầu chưa thực hiện được.') => {
    const response = error?.response;
    if (response) {
        const body = response.data;
        const message = body?.message || body?.error?.message;
        const details = body?.errors && Object.values(body.errors).filter(Boolean).join(' ');
        if (message) return details ? `${message} ${details}` : message;
        if (response.status === 413) return 'Tệp tải lên vượt quá giới hạn dung lượng cho phép (5 MB).';
        return `Máy chủ trả về lỗi HTTP ${response.status}. ${fallback}`;
    }

    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
        return 'Máy chủ xử lý quá lâu và hết thời gian chờ. Hãy kiểm tra backend và thử lại.';
    }
    if (error?.code === 'ERR_NETWORK' || error?.request) {
        const apiUrl = error?.config?.baseURL || apiClient.defaults.baseURL;
        return `Không nhận được phản hồi từ API (${apiUrl}). Kiểm tra backend có đang chạy không; nếu backend đang chạy, kiểm tra cấu hình CORS.`;
    }
    return error?.message || fallback;
};
