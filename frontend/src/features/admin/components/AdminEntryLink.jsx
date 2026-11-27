import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';

export default function AdminEntryLink() {
    const { isLoggedIn, profile } = useAuth();
    if (!isLoggedIn || !['ADMIN', 'TESTER'].includes(profile?.role)) return null;
    return <Link to="/admin" aria-label="Chuyển sang trang quản trị"
        className="flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
        <Shield size={18} aria-hidden="true" /><span>{profile.role === 'TESTER' ? 'Tổng quan quản trị' : 'Quản trị'}</span>
    </Link>;
}
