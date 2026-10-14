import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';

export default function AdminEntryLink() {
    const { isLoggedIn, profile } = useAuth();
    if (!isLoggedIn || profile?.role !== 'ADMIN') return null;
    return <Link to="/admin" aria-label="Chuyển sang trang quản trị"
        className="flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
        <Shield size={18} aria-hidden="true" /><span>Quản trị</span>
    </Link>;
}
