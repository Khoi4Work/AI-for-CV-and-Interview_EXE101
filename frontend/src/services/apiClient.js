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
            // A guest request has no session to expire. Keep its 401 local to the caller.
            if (!requestToken) return Promise.reject(error);
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

const TECHNICAL_ERROR_TERMS = /\b(?:api|http|cors|json|backend|frontend|server|token|exception|stack\s*trace|analysisid|dto|sql|endpoint|request|response|jwt|oauth|uuid|internal|unexpected|unable to|failed to|schema|payload|database|connection refused|timed out|timeout)\b|\bde-?seriali[sz](?:ation|e|ing)?\b|\bseriali[sz](?:ation|e|ing)?\b|\bfield evidence\b|\bvalidation\b|\bstatus code\b|\bđộ đầy đủ\b|\btrích xuất\b|\bxác minh\b/i;

export const getUserFriendlyMessage = (message, fallback = 'Đã xảy ra sự cố. Vui lòng thử lại.') => {
    if (typeof message !== 'string' || !message.trim()) return fallback;
    const cleanMessage = message.trim();

    if (/không đủ minh chứng hợp lệ để chấm điểm/i.test(cleanMessage)) {
        return 'Chưa thể đánh giá CV vì thông tin trong CV hoặc mô tả công việc chưa đủ rõ. Hãy kiểm tra lại nội dung rồi thử lại.';
    }
    if (/chưa thể xác minh đầy đủ nội dung được trích xuất từ CV/i.test(cleanMessage)) {
        return 'Chưa đọc rõ một số thông tin trong CV. Hãy kiểm tra lại tệp hoặc thử tải lên lần nữa.';
    }
    if (/không thể kiểm tra độ đầy đủ của CV đã lưu/i.test(cleanMessage)) {
        return 'Chưa kiểm tra được CV đã lưu lúc này. Vui lòng thử lại sau.';
    }
    if (/không thể kiểm tra độ đầy đủ của cv/i.test(cleanMessage)) {
        return 'Chưa kiểm tra được CV lúc này. Vui lòng thử lại sau.';
    }
    if (/cv đọc chưa đầy đủ/i.test(cleanMessage)) {
        return 'Chưa đọc được toàn bộ nội dung CV. Hãy tải lên bản rõ hơn rồi thử lại.';
    }
    if (/bad credentials|invalid credentials|incorrect password|invalid username or password/i.test(cleanMessage)) {
        return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
    }
    if (/unauthorized|unauthenticated|authentication required/i.test(cleanMessage)) {
        return 'Vui lòng đăng nhập để tiếp tục.';
    }
    if (TECHNICAL_ERROR_TERMS.test(cleanMessage)) return fallback;

    return cleanMessage.replace(/\bJD\b/g, 'mô tả công việc');
};

export const getApiErrorMessage = (error, fallback = 'Yêu cầu chưa thực hiện được.') => {
    if (error?.sessionExpired) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.';
    const response = error?.response;
    if (response) {
        const body = response.data;
        const message = body?.message || body?.error?.message;
        const details = body?.errors && Object.values(body.errors).filter(Boolean).join(' ');
        if (message) {
            const friendlyMessage = getUserFriendlyMessage(details ? `${message} ${details}` : message, '');
            if (friendlyMessage) return friendlyMessage;
        }
        if (response.status === 413) return 'Tệp tải lên vượt quá giới hạn dung lượng cho phép (5 MB).';
        if (response.status === 400 || response.status === 422) return 'Thông tin chưa đúng hoặc chưa đủ. Vui lòng kiểm tra lại.';
        if (response.status === 401) return 'Vui lòng đăng nhập để tiếp tục.';
        if (response.status === 403) return 'Bạn chưa được phép thực hiện thao tác này.';
        if (response.status === 404) return 'Không tìm thấy thông tin cần thiết. Vui lòng tải lại trang.';
        if (response.status === 409) return 'Thông tin vừa thay đổi hoặc đã tồn tại. Vui lòng tải lại trang rồi thử lại.';
        if (response.status === 429) return 'Bạn thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.';
        if (response.status >= 500) return 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
        return fallback;
    }

    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
        return 'Thao tác mất nhiều thời gian hơn dự kiến. Vui lòng thử lại.';
    }
    if (error?.code === 'ERR_NETWORK' || error?.request) {
        return 'Không thể kết nối để hoàn tất thao tác. Hãy kiểm tra kết nối mạng rồi thử lại.';
    }
    return getUserFriendlyMessage(error?.message, fallback);
};
