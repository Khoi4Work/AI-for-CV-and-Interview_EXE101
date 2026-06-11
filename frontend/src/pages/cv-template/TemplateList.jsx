import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import TemplateCard from '../../components/template/TemplateCard';
import Sidebar from "../../components/template/Sidebar.jsx";

export default function TemplateList() {
    return (
        <main className="flex-grow max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left Sidebar */}
                <Sidebar/>

                {/* Main Display */}
                <section className="flex-grow">
                    {/* Top Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Professional CV Templates</h1>
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Search templates..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    {/* Filter and Sort Tabs */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button className="px-6 py-1.5 rounded-md text-sm font-medium bg-white text-blue-700 shadow-sm transition">Phổ biến</button>
                            <button className="px-6 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 transition">Mới nhất</button>
                            <button className="px-6 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 transition">Yêu thích</button>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm text-gray-400">Sắp xếp:</span>
                            <button className="flex items-center gap-2 px-4 py-1.5 border border-blue-800 rounded-md text-sm font-medium text-blue-800 bg-white hover:bg-gray-50 transition">
                                Mới nhất
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Template Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <TemplateCard
                            id="modern-executive"
                            badgeText="Premium"
                            badgeTheme="premium"
                            categoryText="IT / Tech"
                            title="Modern Executive"
                            subtitle="Kiến trúc sư giải pháp & IT"
                        />
                        <TemplateCard
                            id="creative-minimalist"
                            badgeText="Free"
                            badgeTheme="free"
                            categoryText="Marketing"
                            title="Creative Minimalist"
                            subtitle="Content & Brand Manager"
                        />
                        <TemplateCard
                            id="the-standard"
                            badgeText="Pro"
                            badgeTheme="pro"
                            categoryText="Finance"
                            title="The Standard"
                            subtitle="Quản lý Tài chính"
                        />
                        <TemplateCard
                            id="data-scientist"
                            badgeText="Premium"
                            badgeTheme="premium"
                            categoryText="Kỹ thuật"
                            title="Data Scientist"
                            subtitle="Kỹ sư Dữ liệu / AI"
                        />
                        <TemplateCard
                            id="portfolio-hybrid"
                            badgeText="Free"
                            badgeTheme="free"
                            categoryText="Sáng tạo"
                            title="Portfolio Hybrid"
                            subtitle="UI/UX Designer"
                        />
                        <TemplateCard
                            id="boardroom-ready"
                            badgeText="Pro"
                            badgeTheme="pro"
                            categoryText="Điều hành"
                            title="Boardroom Ready"
                            subtitle="CEO / Director"
                        />
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-2 mt-16 mb-12">
                        <button className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-400 transition">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded bg-blue-900 text-white font-medium text-sm transition">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition">2</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition">3</button>
                        <span className="px-2 text-gray-400">...</span>
                        <button className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition">12</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-400 transition">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                </section>
            </div>
        </main>
    );
}
