import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function TemplateCard({ id, badgeText, badgeTheme, categoryText, title, subtitle, image }) {
    const { profile, toggleFavorite, isLoggedIn } = useAuth();
    const isFavorite = profile.favorites?.includes(id);

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            // We could show a toast here, but maybe that's handled by the context or a utility
            return;
        }
        toggleFavorite(id);
    };

    const getBadgeStyle = () => {
        switch (badgeTheme) {
            case 'premium':
                return 'bg-blue-900 text-white';
            case 'free':
                return 'bg-blue-100 text-blue-800';
            case 'pro':
                return 'bg-blue-600 text-white';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <Link to={`/template/${id}`} className="block">
            <div className="bg-white rounded-xl overflow-hidden card-shadow group transition-all hover:-translate-y-1">
                <div className="relative bg-gray-200 aspect-[3/4] p-4 flex items-center justify-center">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover rounded-sm shadow-sm"
                        />
                    ) : (
                        <div className="absolute inset-4 border border-gray-300 bg-white/50 rounded-sm"></div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className={`${getBadgeStyle()} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide`}>
              {badgeText}
            </span>
                        <span className="bg-gray-200/80 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              {categoryText}
            </span>
                    </div>

                    {/* Heart/Favorite */}
                    <button
                        onClick={handleToggleFavorite}
                        className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} />
                    </button>
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-between items-end bg-white">
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    </div>
                    {title === 'Modern Executive' && (
                        <div className="flex gap-1 pb-1">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span className="w-2 h-2 rounded-full bg-blue-200"></span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}