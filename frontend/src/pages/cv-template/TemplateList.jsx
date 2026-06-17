import React, { useState, useMemo } from 'react';
import {Search, ChevronDown, ChevronLeft, ChevronRight, Upload, X, FileText} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import TemplateCard from '../../components/template/TemplateCard';
import Sidebar from "../../components/template/Sidebar.jsx";
import {Header} from "../../components/layout/PublicHeader.jsx";
import GuestHeader from "../../components/layout/GuestHeader.jsx";
import {useAuth} from "../../contexts/AuthContext.jsx";
import { TEMPLATES_DATA } from '../../constants/templates.js';

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
            result = result.filter(t => t.categoryText.toLowerCase() === activeCategory.toLowerCase());
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
            // In a real app, we would use dates. Here we just keep the data order or reverse it.
            result = [...result].reverse();
        }

        return result;
    }, [searchQuery, activeCategory, activeStyle, activeTab, sortOrder]);

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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Professional CV Templates</h1>
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                                >
                                    <Upload className="w-4 h-4"/>
                                    Tải lên template CV đã có
                                </button>
                                <div className="relative w-full md:w-80">
                                    <input
                                        type="text"
                                        placeholder="Search templates..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"/>
                                </div>
                            </div>
                        </div>

                        {/* Filter and Sort Tabs */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['Phổ biến', 'Mới nhất', 'Yêu thích'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-6 py-1.5 rounded-md text-sm font-medium transition ${
                                            activeTab === tab
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-sm text-gray-400">Sắp xếp:</span>
                                <div className="relative">
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'Mới nhất' ? 'Cũ nhất' : 'Mới nhất')}
                                        className="flex items-center gap-2 px-4 py-1.5 border border-blue-800 rounded-md text-sm font-medium text-blue-800 bg-white hover:bg-gray-50 transition"
                                    >
                                        {sortOrder}
                                        <ChevronDown className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upload Modal */}
                        {isUploadModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                                <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                        <h3 className="text-xl font-bold text-gray-900">Tải lên CV của bạn</h3>
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
                                                ? 'border-blue-400 bg-blue-50/50'
                                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                            }`}
                                            onClick={() => document.getElementById('file-upload').click()}
                                        >
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${selectedFile ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:text-blue-600'} transition-colors`}>
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
                                                className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#0b3c8f] hover:bg-[#093278] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md"
                                            >
                                                Xác nhận
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Template Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {paginatedTemplates.length > 0 ? (
                                paginatedTemplates.map(template => (
                                    <TemplateCard
                                        key={template.id}
                                        id={template.id}
                                        badgeText={template.badgeText}
                                        badgeTheme={template.badgeTheme}
                                        categoryText={template.categoryText}
                                        title={template.title}
                                        subtitle={template.subtitle}
                                        image={template.image}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-gray-500">
                                    Không tìm thấy template nào phù hợp.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16 mb-12">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-400 transition disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4"/>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 flex items-center justify-center rounded text-sm font-medium transition ${
                                            currentPage === page
                                            ? 'bg-blue-900 text-white'
                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-400 transition disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4"/>
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    )
}
