import React, {useState, useMemo} from 'react';
import {Search, ChevronDown, ChevronLeft, ChevronRight, Upload, X, FileText, Star, Download, Eye} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import TemplateCard from '../components/TemplateCard.jsx';
import Sidebar from "../components/Sidebar.jsx";
import {Header} from "../../../components/layout/PublicHeader.jsx";
import GuestHeader from "../../../components/layout/GuestHeader.jsx";
import {Footer} from '../../../components/layout/Footer.jsx';
import {useAuth} from "../../auth/contexts/AuthContext.jsx";
import {TEMPLATES_DATA, TEMPLATE_CATEGORIES, TEMPLATE_STYLES} from '../constants/templates.js';

export default function TemplateList() {
    const {isLoggedIn, profile} = useAuth();
    const navigate = useNavigate();

    // States for filtering and sorting
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeStyle, setActiveStyle] = useState(null);
    const [activeTab, setActiveTab] = useState('Phổ biến');
    const [sortOrder, setSortOrder] = useState('Mới nhất');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [previewTemplate, setPreviewTemplate] = useState(null);

    // Upload States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Filter and Sort Logic
    const filteredTemplates = useMemo(() => {
        let result = [...TEMPLATES_DATA];

        // Search filter
        if (searchQuery) {
            result = result.filter(t =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (activeCategory !== 'all') {
            result = result.filter(t => t.categoryId === activeCategory);
        }

        // Style filter
        if (activeStyle) {
            result = result.filter(t => t.style === activeStyle);
        }

        // Tab filter (Phổ biến, Mới nhất, Yêu thích)
        if (activeTab === 'Phổ biến') {
            result = result.filter(t => t.type === 'Popular');
        } else if (activeTab === 'Mới nhất') {
            result = result.filter(t => t.type === 'Newest');
        } else if (activeTab === 'Yêu thích') {
            result = result.filter(t => profile.favorites?.includes(t.id));
        }

        // Sorting
        if (sortOrder === 'Mới nhất') {
            result = [...result].reverse();
        } else if (sortOrder === 'Phổ biến nhất') {
            result = [...result].sort((a, b) => b.downloads - a.downloads);
        } else if (sortOrder === 'Đánh giá cao') {
            result = [...result].sort((a, b) => b.rating - a.rating);
        }

        return result;
    }, [searchQuery, activeCategory, activeStyle, activeTab, sortOrder, profile.favorites]);

    // Pagination
    const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
    const paginatedTemplates = filteredTemplates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            {isLoggedIn ? <Header/> : <GuestHeader/>}
            <main className="flex-grow max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Sidebar */}
                    <Sidebar
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        activeStyle={activeStyle}
                        setActiveStyle={setActiveStyle}
                    />

                    {/* Main Display */}
                    <section className="flex-grow">
                        {/* Top Toolbar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                    Mẫu CV chuyên nghiệp </h1>
                                <p className="text-sm text-gray-400">Khám phá hàng ngàn mẫu CV chuẩn ATS được tối ưu hóa
                                    bởi AI</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-green-600 text-green-600 font-semibold rounded-2xl hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                                >
                                    <Upload className="w-4 h-4"/>
                                    Tải lên template CV
                                </button>
                                <div className="relative w-full md:w-80">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm mẫu CV..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-200 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm transition-all"
                                    />
                                    <Search
                                        className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2"/>
                                </div>
                            </div>
                        </div>

                        {/* Filter and Sort Tabs */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {['Phổ biến', 'Mới nhất', 'Yêu thích'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                            activeTab === tab
                                                ? 'bg-white text-green-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}

                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Sắp xếp theo:</span>
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            const orders = ['Mới nhất', 'Phổ biến nhất', 'Đánh giá cao'];
                                            const nextIndex = (orders.indexOf(sortOrder) + 1) % orders.length;
                                            setSortOrder(orders[nextIndex]);
                                        }}
                                        className="flex items-center gap-2 px-4 py-1.5 border border-green-700 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-gray-50 transition"
                                    >
                                        {sortOrder}
                                        <ChevronDown className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upload Modal */}
                        {isUploadModalOpen && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                                <div
                                    className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                        <h3 className="text-xl font-bold text-gray-900">Tải lên template CV của bạn</h3>
                                        <button
                                            onClick={() => {
                                                setIsUploadModalOpen(false);
                                                setSelectedFile(null);
                                            }}
                                            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                                        >
                                            <X className="w-5 h-5"/>
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div
                                            className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${
                                                selectedFile
                                                    ? 'border-green-700 bg-green-50/50'
                                                    : 'border-gray-300 hover:border-green-700 hover:bg-gray-50'
                                            }`}
                                            onClick={() => document.getElementById('file-upload').click()}
                                        >
                                            <div
                                                className={`w-14 h-14 rounded-full flex items-center justify-center ${selectedFile ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500 group-hover:text-green-700'} transition-colors`}>
                                                <Upload className="w-6 h-6"/>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {selectedFile ? selectedFile.name : 'Kéo thả tệp hoặc chọn tệp'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Hỗ trợ định dạng PDF, DOCX (Tối đa 5MB)
                                                </p>
                                            </div>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.docx"
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => {
                                                    setIsUploadModalOpen(false);
                                                    setSelectedFile(null);
                                                }}
                                                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                                            >
                                                Hủy bỏ
                                            </button>
                                            <button
                                                disabled={!selectedFile}
                                                onClick={() => navigate('/builder')}
                                                className="flex-1 py-3 rounded-xl font-semibold text-white bg-green-700 hover:bg-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md"
                                            >
                                                Xác nhận
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Preview Modal */}
                        {previewTemplate && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                                <div
                                    className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in relative flex flex-col">
                                    <div
                                        className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-gray-900">{previewTemplate.title}</h3>
                                            <span
                                                className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                                                {previewTemplate.style}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setPreviewTemplate(null)}
                                            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                                        >
                                            <X className="w-5 h-5"/>
                                        </button>
                                    </div>

                                    <div
                                        className="p-10 flex items-start justify-center bg-gray-100 overflow-y-auto max-h-[70vh]">
                                        <img
                                            src={previewTemplate.image}
                                            alt={previewTemplate.title}
                                            className="h-auto w-auto max-w-full rounded-lg shadow-2xl object-contain"
                                        />
                                    </div>

                                    <div
                                        className="p-6 border-t border-gray-100 flex justify-between items-center bg-white">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
                                                {previewTemplate.rating}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Download className="w-4 h-4"/>
                                                {previewTemplate.downloads} lượt tải
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setPreviewTemplate(null);
                                                navigate(`/template/${previewTemplate.id}`);
                                            }}
                                            className="px-6 py-2 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-all flex items-center gap-2 shadow-md"
                                        >
                                            <Eye className="w-4 h-4"/>
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Template Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {paginatedTemplates.length > 0 ? (
                                paginatedTemplates.map(template => (
                                    <div key={template.id} className="group relative">
                                        <TemplateCard
                                            id={template.id}
                                            badgeText={template.badgeText}
                                            badgeTheme={template.badgeTheme}
                                            categoryText={template.categoryText}
                                            title={template.title}
                                            subtitle={template.subtitle}
                                            image={template.image}
                                            rating={template.rating}
                                            downloads={template.downloads}
                                        />
                                        <button
                                            onClick={() => setPreviewTemplate(template)}
                                            className="absolute bottom-25 right-0 p-2 bg-white/90 backdrop-blur-sm text-green-700 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-white border border-green-200 z-20"
                                            title="Xem nhanh"
                                        >
                                            <Eye className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-4">
                                        <FileText className="w-16 h-16 text-gray-300"/>
                                        <p className="text-lg font-medium">Không tìm thấy template nào phù hợp.</p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setActiveCategory('all');
                                                setActiveStyle(null);
                                            }}
                                            className="text-green-700 font-semibold hover:underline"
                                        >
                                            Xóa tất cả bộ lọc
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16 mb-12">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 transition disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4"/>
                                </button>
                                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition ${
                                            currentPage === page
                                                ? 'bg-green-700 text-white shadow-md'
                                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 transition disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4"/>
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <Footer/>
        </>
    )
}