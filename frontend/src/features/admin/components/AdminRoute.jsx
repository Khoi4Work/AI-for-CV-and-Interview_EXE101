import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { useApp } from '../../auth/contexts/AppContext.jsx';

export default function AdminRoute({ children }) {
    const { isLoggedIn, isLoading, authStatus, authorizationRole, retryAuth, sessionExpired } = useAuth();
    const { showToast } = useApp();
    const location = useLocation();
    const role = authorizationRole;
    const notified = useRef(false);
    useEffect(() => {
        if (isLoggedIn && role && !['ADMIN', 'TESTER'].includes(role) && !notified.current) {
            notified.current = true;
            showToast('Tài khoản không có quyền quản trị.', 'info');
        }
    }, [isLoggedIn, role, showToast]);
    if (isLoading) return <p className="p-8">Đang tải thông tin tài khoản…</p>;
    if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location, sessionExpired }} />;
    if (!role && authStatus === 'profile-loading') return <p role="status" className="p-8">Đang xác minh quyền quản trị…</p>;
    if (!role && authStatus === 'profile-error') return <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center">
        <p>Chưa tải được thông tin để xác minh quyền quản trị.</p>
        <button onClick={retryAuth} className="rounded-xl bg-primary px-5 py-2 text-on-primary">Thử lại</button>
    </div>;
    if (!['ADMIN', 'TESTER'].includes(role)) return <Navigate to="/home" replace />;
    return children;
}
