import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { adminService } from '../services/adminService.js';

export default function AdminRoute({ children }) {
    const { isLoggedIn, isLoading } = useAuth();
    const location = useLocation();
    const [state, setState] = useState({ loading: true, allowed: false, error: '' });
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        if (isLoading || !isLoggedIn) return;
        adminService.identity().then(profile => {
            if (active) setState({ loading: false, allowed: profile?.role === 'ADMIN', error: '' });
        }).catch(() => {
            if (active) setState({ loading: false, allowed: false, error: 'Không xác minh được quyền quản trị.' });
        });
        return () => { active = false; };
    }, [isLoggedIn, isLoading, retry]);
    if (isLoading) return <p className="p-8">Đang xác minh tài khoản…</p>;
    if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;
    if (state.loading) return <p className="p-8">Đang kiểm tra quyền quản trị…</p>;
    if (state.error) return <div role="alert" className="p-8">{state.error} <button onClick={() => { setState({ loading: true, allowed: false, error: '' }); setRetry(v => v + 1); }} className="underline">Thử lại</button></div>;
    if (!state.allowed) return <div className="p-8"><h1 className="text-xl font-bold">403 — Bạn không có quyền quản trị</h1><Link to="/home" className="underline">Về trang chủ</Link></div>;
    return children;
}
