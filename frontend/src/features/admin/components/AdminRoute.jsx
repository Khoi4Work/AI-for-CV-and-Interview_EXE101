import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { useApp } from '../../auth/contexts/AppContext.jsx';

export default function AdminRoute({ children }) {
    const { isLoggedIn, isLoading, profile, sessionExpired } = useAuth();
    const { showToast } = useApp();
    const location = useLocation();
    const notified = useRef(false);
    useEffect(() => {
        if (!isLoading && isLoggedIn && profile?.role !== 'ADMIN' && !notified.current) {
            notified.current = true;
            showToast('Tài khoản không có quyền quản trị.', 'info');
        }
    }, [isLoading, isLoggedIn, profile?.role, showToast]);
    if (isLoading) return <p className="p-8">Đang xác minh tài khoản…</p>;
    if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location, sessionExpired }} />;
    if (profile?.role !== 'ADMIN') return <Navigate to="/home" replace />;
    return children;
}
