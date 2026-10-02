import {Heart, Star, Download, Lock} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';

export default function TemplateCard({
                                         id,
                                         badgeText,
                                         badgeTheme,
                                         categoryText,
                                         title,
                                         subtitle,
                                         image,
                                         rating,
                                         downloads,
                                         onRate,
                                         isLocked,
                                         onLockedClick
                                     }) {
    const {profile, toggleFavorite, isLoggedIn} = useAuth();
    const navigate = useNavigate();
    const requireLogin = () => navigate('/login', { state: { from: { pathname: `/template/${id}` } } });
    const isFavorite = profile.favorites?.includes(id);

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            requireLogin();
            return;
        }
        toggleFavorite(id);
    };

    const handleRateClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            requireLogin();
            return;
        }
        if (onRate) onRate(id);
    };

    const getBadgeStyle = () => {
        switch (badgeTheme) {
            case 'premium':
                return 'bg-green-800  text-white';
            case 'free':
                return 'bg-blue-100 text-blue-800';
            case 'pro':
                return 'bg-green-800 text-white';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <Link
            to={!isLoggedIn ? '/login' : isLocked ? '#' : `/template/${id}`}
            state={!isLoggedIn ? { from: { pathname: `/template/${id}` } } : undefined}
            className={`block ${isLocked ? 'cursor-pointer' : ''}`}
            onClick={(e) => {
                if (isLoggedIn && isLocked) {
                    e.preventDefault();
                    if (onLockedClick) onLockedClick();
                }
            }}
        >
            <div
                className={`bg-white rounded-2xl overflow-hidden card-shadow group transition-all ${isLocked ? 'opacity-80' : 'hover:-translate-y-2'} duration-300 border border-gray-100 ${isLocked ? 'grayscale-[0.5]' : ''}`}>
                <div className="relative bg-gray-200 aspect-[3/4] p-4 flex items-center justify-center">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className={`w-full h-full object-cover rounded-xl shadow-sm ${isLocked ? 'blur-[1px]' : ''}`}
                        />
                    ) : (
                        <div className="absolute inset-4 border border-gray-300 bg-white/50 rounded-xl"></div>
                    )}

                    {isLocked && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-[1px] z-10">
                            <div className="bg-white/90 p-3 rounded-full shadow-xl animate-bounce">
                                <Lock className="w-6 h-6 text-green-700"/>
                            </div>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <span
                            className={`${getBadgeStyle()} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm`}>
                            {badgeText}
                        </span>
                        <span
                            className="bg-white/80 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm border border-gray-200">
                            {categoryText}
                        </span>
                    </div>

                    {/* Heart/Favorite */}
                    <button
                        onClick={handleToggleFavorite}
                        className={`absolute top-6 right-6 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md transition-all ${isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500 hover:scale-110'}`}
                    >
                        <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor"
                               strokeWidth={2}/>
                    </button>
                </div>

                <div className="p-5 border-t border-gray-100 bg-white">
                    <div className="flex justify-between items-start mb-2">
                        <div className="max-w-[80%]">
                            <h4 className={`font-bold text-sm truncate ${isLocked ? 'text-gray-500' : 'text-gray-900 group-hover:text-green-700 transition-colors'}`}>{title}</h4>
                            <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1 text-gray-500">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                            <span className="text-[11px] font-bold text-gray-700">{rating || '4.5'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-1 text-gray-500">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                                <span className="text-[11px] font-bold text-gray-700">{rating || '4.5'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <Download className="w-3 h-3"/>
                                <span
                                    className="text-[11px] font-medium">{downloads ? `${downloads} lượt` : '0 lượt'}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleRateClick}
                        className={`w-full py-2 text-xs font-semibold transition-colors border-t border-gray-100 ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'}`}
                    >
                        {isLocked ? 'Nâng cấp để đánh giá' : 'Đánh giá mẫu'}
                    </button>
                </div>
            </div>
        </Link>
    );
}
