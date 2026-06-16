import { X, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function TopNagivationToolBar({ onExport }) {
    return (
        <>
            <header className="bg-white border-b px-6 py-3 flex items-center justify-between z-10 w-full shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6"/>
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg text-cv-text-dark leading-tight">Executive Pro</h1>
                        <p className="text-xs text-gray-500 italic">Mẫu CV chuyên nghiệp cho quản lý cấp cao</p>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-1 gap-4">
                    <button className="text-gray-500 font-bold hover:text-black">−</button>
                    <span className="text-sm font-medium text-cv-sidebar-blue">100%</span>
                    <button className="text-gray-500 font-bold hover:text-black">+</button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 border border-cv-sidebar-blue text-cv-sidebar-blue px-6 py-2.5 rounded-md hover:bg-blue-50 transition-colors">
                        <FileDown className="h-5 w-5"/>
                        <span className="font-medium text-sm">Xuất PDF</span>
                    </button>
                    <button
                        className="flex items-center gap-2 bg-cv-sidebar-blue text-white px-6 py-2.5 rounded-md hover:bg-blue-900 transition-colors shadow-md shadow-blue-900/20">
                        <LightningSvg/>
                        <span className="font-bold text-sm tracking-wide">Sử dụng ngay</span>
                    </button>
                </div>
            </header>
        </>
    )
    // Custom SVG Icons matched from HTML
    function LightningSvg() {
        return (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth="2"></path>
            </svg>
        );
    }
}