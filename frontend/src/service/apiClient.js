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
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle lỗi auth
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc invalid -> clear và redirect login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
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
