import {useState} from 'react';
import {
    Briefcase,
    Zap,
    Bookmark,
    MonitorPlay,
    FileText,
    CheckCircle2,
    LoaderCircle
} from 'lucide-react';
import {Link, useParams, useNavigate} from 'react-router-dom';
import TopAction from "../components/TopAction.jsx";
import {TEMPLATES_DATA} from '../constants/templates.js';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {useCV} from '../contexts/CVContext.jsx';
import {Header} from "../../../components/layout/PublicHeader.jsx";
import GuestHeader from "../../../components/layout/GuestHeader.jsx";
import {Footer} from "../../../components/layout/Footer.jsx";
import {paymentService} from '../../../services/paymentService.js';
import {getApiErrorMessage} from '../../../service/apiClient.js';
import {checkBuilderQuota} from '../services/builderQuota.js';

export default function TemplateDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {profile, isLoggedIn, toggleFavorite} = useAuth();
    const {showToast} = useApp();
    const {setTemplate} = useCV();
    const [checkingQuota, setCheckingQuota] = useState(false);
    const [quotaError, setQuotaError] = useState(null);

    // Tìm thông tin template từ constants dựa trên id từ URL
    const template = TEMPLATES_DATA.find(t => t.id === id);

    if (!template) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy mẫu CV</h1>
                <p className="text-gray-500 mb-8">Mẫu bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
                <Link to="/templates" className="px-6 py-2 bg-green-700 text-white rounded-xl font-medium">
                    Quay lại kho mẫu
                </Link>
            </div>
        );
    }

    const isFavorite = profile.favorites?.includes(id);

    const handleUseTemplate = async () => {
        if (checkingQuota) return;
        if (!isLoggedIn) {
            showToast('Vui lòng đăng nhập để sử dụng mẫu CV này!', 'info');
            navigate('/login');
            return;
        }
        setCheckingQuota(true);
        setQuotaError(null);
        try {
            await checkBuilderQuota(() => paymentService.getCurrentQuota());
            setTemplate(id);
            navigate('/builder');
        } catch (error) {
            const message = getApiErrorMessage(error, 'Không kiểm tra được lượt tạo CV. Vui lòng thử lại.');
            setQuotaError({ templateId: id, message, exhausted: error.code === 'CV_CREATION_QUOTA_EXCEEDED' });
            showToast(message, 'error');
        } finally {
            setCheckingQuota(false);
        }
    };

    const handleToggleFavorite = () => {
        if (!isLoggedIn) {
            showToast('Vui lòng đăng nhập để lưu mẫu CV này!', 'info');
            navigate('/login');
            return;
        }

        toggleFavorite(id);

        const actionText = isFavorite ? 'đã xóa khỏi' : 'đã thêm vào';
        showToast(`Mẫu "${template.title}" ${actionText} danh sách yêu thích!`, 'success');
    };

    return (
        <>
            {isLoggedIn ? <Header/> : <GuestHeader/>}
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
                <TopAction/>

                {/* Template Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left Column: Preview (Image Only) */}
                    <div className="flex flex-col">
                        <div className="relative group">
                            <div
                                className="bg-white rounded-2xl overflow-hidden border border-gray-200 custom-shadow transition-all duration-300 group-hover:shadow-xl">
                                <img
                                    src={template.image}
                                    alt={template.title}
                                    className="w-full h-auto block"
                                />
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 mt-6">
                            <div
                                className="w-24 h-32 border-2 border-green-600 rounded-xl bg-white cursor-pointer overflow-hidden shadow-sm">
                                {template.image &&
                                    <img src={template.image} className="w-full h-full object-cover" alt="preview 1"/>}
                            </div>
                            <div
                                className="w-24 h-32 border border-gray-200 rounded-xl bg-white cursor-pointer hover:border-gray-400 transition-all overflow-hidden shadow-sm hover:shadow-md">
                                <div
                                    className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] p-2 text-center">Trang
                                    2 Preview
                                </div>
                            </div>
                            <div
                                className="w-24 h-32 border border-gray-200 rounded-xl bg-white cursor-pointer hover:border-gray-400 transition-all overflow-hidden shadow-sm hover:shadow-md">
                                <div
                                    className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] p-2 text-center">Trang
                                    3 Preview
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & CTA */}
                    <div className="flex flex-col gap-8">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <span
                                    className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-sm">AI-Optimized</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                                    template.badgeTheme === 'premium' ? 'bg-green-900 text-white' :
                                        template.badgeTheme === 'pro' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {template.badgeText}
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold text-white-500 tracking-tight">{template.title}</h1>
                            <div className="flex gap-6 text-white-500">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Briefcase className="h-5 w-5 text-green-600"/>
                                    {template.categoryText}
                                </span>
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <MonitorPlay className="h-5 w-5 text-green-600"/>
                                    {template.style}
                                </span>
                            </div>
                        </div>

                        {/* Why this template works - Enhanced as Cards */}
                        <div
                            className="bg-green-50/50 rounded-2xl p-8 border border-green-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className="w-20 h-20 text-green-600"/>
                            </div>
                            <div className="flex items-center gap-2 text-green-800 font-bold mb-4 relative z-10">
                                <Zap className="h-5 w-5 fill-green-600"/>
                                Tại sao mẫu này hiệu quả?
                            </div>
                            <p className="text-gray-700 leading-relaxed relative z-10">
                                {template.description || `Mẫu ${template.title} được tối ưu hóa cho phong cách ${template.style}, kết hợp giữa tính thẩm mỹ hiện đại và cấu trúc chuẩn ATS. Điều này giúp hồ sơ của bạn không chỉ thu hút nhà tuyển dụng mà còn dễ dàng vượt qua các hệ thống lọc tự động.`}
                            </p>
                        </div>

                        {/* Components Included - Improved Grid */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white-500 px-1">Các thành phần
                                bao gồm</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(template.features || [
                                    "Tóm tắt chuyên môn",
                                    "Kinh nghiệm làm việc",
                                    "Ma trận kỹ năng",
                                    "Dự án nổi bật",
                                    "Học vấn & Chứng chỉ",
                                    "Thành tựu AI"
                                ]).map((item, index) => (
                                    <div key={index}
                                         className="bg-gray-50 hover:bg-green-50 transition-colors px-4 py-3 rounded-xl flex items-center gap-3 border border-gray-100 hover:border-green-200 group">
                                        <div
                                            className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                            <CheckCircle2
                                                className="h-3 w-3 text-green-600 group-hover:text-white transition-colors"/>
                                        </div>
                                        <span
                                            className="text-sm font-medium text-gray-700 group-hover:text-green-800 transition-colors">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Call to Actions */}
                        <div className="flex flex-col gap-4 mt-4">
                            <button
                                onClick={handleUseTemplate}
                                disabled={checkingQuota}
                                className="w-full py-4 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-900/20 group disabled:opacity-50">
                                {checkingQuota ? <LoaderCircle className="h-6 w-6 animate-spin"/> : <FileText className="h-6 w-6 group-hover:scale-110 transition-transform"/>}
                                {checkingQuota ? 'Đang kiểm tra lượt tạo CV…' : 'Sử dụng mẫu này'}
                            </button>
                            {quotaError?.templateId === id && (
                                <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    <p>{quotaError.message}</p>
                                    {quotaError.exhausted && <Link to="/pricing" className="mt-2 inline-block font-semibold underline">Nâng cấp gói CV</Link>}
                                </div>
                            )}
                            <button
                                onClick={handleToggleFavorite}
                                className={`w-full py-4 border font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${
                                    isFavorite
                                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                                }`}
                            >
                                <Bookmark className={`h-6 w-6 ${isFavorite ? 'fill-red-600' : ''}`}/>
                                {isFavorite ? 'Đã lưu trong yêu thích' : 'Lưu vào danh sách yêu thích'}
                            </button>
                        </div>
                    </div>

                    {/* Similar Templates - Using new card logic (simplified) */}
                    <section className="mt-20">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Mẫu tương tự</h2>
                                <p className="text-green-700">Khám phá các lựa chọn khác trong phong
                                    cách {template.style}</p>
                            </div>
                            <Link to="/templates"
                                  className="text-green-700 font-bold hover:underline flex items-center gap-1">
                                Xem tất cả
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {TEMPLATES_DATA
                                .filter(t => t.style === template.style && t.id !== template.id)
                                .slice(0, 4)
                                .map(similar => (
                                    <div key={similar.id} className="group cursor-pointer">
                                        <Link to={`/template/${similar.id}`}>
                                            <div
                                                className="relative aspect-[1/1.4] rounded-2xl overflow-hidden shadow-md border border-slate-200 mb-4 transition-all group-hover:-translate-y-2 group-hover:shadow-xl">
                                                <img src={similar.image} className="w-full h-full object-cover"
                                                     alt={similar.title}/>
                                                <div
                                                    className="absolute inset-0 bg-green-700/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span
                                                        className="bg-white text-green-700 px-4 py-2 rounded-xl font-bold text-sm shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform">
                                                        Sử dụng mẫu này
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{similar.title}</h4>
                                                <p className="text-xs text-gray-500">{similar.style} • {similar.badgeText}</p>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            }
                        </div>
                    </section>
                </div>
            </main>
            <Footer/>

        </>
    )
}
