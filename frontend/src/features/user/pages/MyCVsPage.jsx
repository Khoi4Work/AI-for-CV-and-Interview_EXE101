import React, {useState, useEffect} from 'react';
import {Plus, Sparkles, Trash2, ArrowUpRight} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {Card, Badge, Button} from '../components/Layout.jsx';
import { TEMPLATES_DATA } from '../../cv/constants/templates';
import galleryService from '../../../service/galleryService';
import { getApiErrorMessage } from '../../../service/apiClient';
const MyCVsPage = () => {
    const navigate = useNavigate();
    const {showToast} = useApp();
    const [cvs, setCvs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTabFilter, setActiveTabFilter] = useState('All');

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        setIsLoading(true);
        try {
            console.log('[MyCVsPage] Fetching assets from galleryService...');
            const data = await galleryService.getGalleryAssets();
            console.log('[MyCVsPage] API Response:', data);

            const cvList = data?.cvs || [];
            if (cvList.length === 0) {
                console.log('[MyCVsPage] No CVs found in gallery.');
            }
            setCvs(cvList);
        } catch (error) {
            console.error('[MyCVsPage] Error loading assets:', error);
            showToast(getApiErrorMessage(error), 'error');
            setCvs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAdd = () => {
        const occupations = [
            'Frontend Developer 2026',
            'UI/UX Designer Portfolio',
            'Business Analyst Resume',
            'Solution Architect CV',
        ];
        const selectOccName = occupations[Math.floor(Math.random() * occupations.length)];

        // Chọn ngẫu nhiên một template để lấy ảnh minh họa
        const randomTemplate = TEMPLATES_DATA[Math.floor(Math.random() * TEMPLATES_DATA.length)];

        const newCV = {
            id: `cv-${Date.now()}`,
            title: selectOccName,
            status: 'AI Optimized',
            updatedAt: 'Vừa xong',
            score: 95,
            image: randomTemplate.image,
        };
        // Logic handleAddCV moved to server or mock if needed,
        // for now let's just simulate local update since we don't have a create API yet in the plan
        setCvs((prev) => [newCV, ...prev]);
        showToast(`Bản mẫu AI đã tự động tạo CV: "${newCV.title}"`, 'success');
    };

    const handleRemoveCV = async (id) => {
        const target = cvs.find((cv) => cv.id === id);

        // Optimistic Update
        const previousCvs = [...cvs];
        setCvs((prev) => prev.filter((cv) => cv.id !== id));

        try {
            await galleryService.deleteCV(id);
            showToast(`Đã xoá hồ sơ: "${target?.title || 'CV'}"`, 'info');
        } catch (error) {
            setCvs(previousCvs);
            showToast(getApiErrorMessage(error), 'error');
        }
    };

    const filteredCvs = cvs.filter(cv => {
        if (activeTabFilter === 'All') return true;
        return cv.status === activeTabFilter;
    });

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-[#10B981]">Danh sách CV của tôi</h1>
                <Button
                    variant="primary"
                    onClick={() => navigate("/templates")}
                    className="flex items-center gap-2 rounded-full px-6"
                >
                    <Plus size={18}/>
                    Tạo CV mới
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-[#E2E8F0] p-1.5 rounded-xl w-fit mb-8">
                <span className="text-sm text-[#0F172A] font-medium ml-3">Lọc theo:</span>
                <div className="flex flex-wrap gap-2">
                    {['All', 'Hoàn thành', 'AI Optimized', 'Bản nháp'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveTabFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                activeTabFilter === filter
                                    ? 'bg-[#10B981] text-white shadow-sm'
                                    : 'bg-white text-[#475569] hover:bg-gray-50'
                            }`}
                        >
                            {filter === 'All' ? 'Tất cả' : filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeTabFilter === 'All' && (
                    <div
                        onClick={handleQuickAdd}
                        className="h-[400px] rounded-xl border-2 border-dashed border-[#1E2E42] hover:border-[#10B981] bg-[#0A1118] flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-colors group"
                    >
                        <div
                            className="w-14 h-14 rounded-full bg-[#1E2E42] group-hover:bg-[#10B981]/20 flex items-center justify-center mb-4 transition-colors">
                            <Plus size={24} className="text-[#94A3B8] group-hover:text-[#10B981]"/>
                        </div>
                        <h3 className="text-white font-bold mb-2">Bắt đầu bản mới</h3>
                        <p className="text-[#64748B] text-sm">Sử dụng AI để khởi tạo nội dung chuyên nghiệp</p>
                    </div>
                )}

                {filteredCvs.map((cv) => (
                    <Card key={cv.id}
                          className="h-[400px] flex flex-col relative overflow-hidden group border-none bg-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">

                        <div className={`relative h-64 m-3 rounded-lg overflow-hidden border border-slate-200 ${
                            cv.status === 'Bản nháp' ? 'bg-slate-200' : 'bg-white'
                        }`}>
                            <img
                                src={cv.image }
                                alt="CV Preview"
                                className="absolute inset-0 w-full h-full object-cover object-top"
                            />

                            <div className="relative z-10 flex items-start justify-between p-3">
                                <Badge
                                    variant={cv.status === 'Bản nháp' ? 'default' : 'success'}
                                    className={`${cv.status === 'Bản nháp' ? 'bg-slate-300 text-slate-700' : 'bg-emerald-500/20 text-emerald-600'} text-[10px] flex items-center gap-1`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${cv.status === 'Bản nháp' ? 'bg-slate-500' : 'bg-emerald-500'}`}></span>
                                    {cv.status}
                                </Badge>

                                <button
                                    onClick={() => handleRemoveCV(cv.id)}
                                    className="p-1 rounded-lg bg-white/80 backdrop-blur-sm text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                                    title="Xóa CV này"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>

                        </div>

                        <div className="p-5 pt-2">
                            <h3 className={`text-lg font-bold mb-1 ${cv.status === 'Bản nháp' ? 'text-slate-500' : 'text-[#0F172A]'}`}>
                                {cv.title}
                            </h3>
                            <p className="text-[#475569] text-xs mb-3">Cập nhật: {cv.updatedAt}</p>



                            <button
                                onClick={() => navigate('/editor')}
                                className="w-full flex items-center justify-center gap-1 text-xs font-bold text-[#64748B] group-hover:text-[#10B981] transition-colors pt-2 border-t border-slate-200"
                            >
                                <span>Chỉnh sửa nội dung</span>
                                <ArrowUpRight size={12}/>
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            <div
                className="bg-[#E2E8F0] border border-emerald-200 rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-start justify-between gap-4 mt-8">
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-100 rounded-full opacity-50"></div>
                <div className="flex items-start space-x-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm animate-pulse">
                        💡
                    </div>
                    <div className="space-y-1.5 max-w-2xl">
                        <h4 className="text-xs font-bold text-[#10B981] tracking-wider uppercase">Mẹo từ Smartfolio</h4>
                        <p className="text-xs text-[#475569] leading-relaxed">
                            Mẹo: Sử dụng nút "AI Optimized" giúp tăng độ vượt tối ưu chuẩn ATS cho CV của bạn từ 60% lên
                            trên 90%, đồng thời tăng tỷ lệ vượt qua vòng duyệt tự động lên đến gấp 3 lần.
                        </p>
                    </div>
                </div>
                <div className="flex space-x-1.5 pt-2 self-end sm:self-center select-none shrink-0">
                    <span className="w-2.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                </div>
            </div>
        </div>
    );
};

export default MyCVsPage;
