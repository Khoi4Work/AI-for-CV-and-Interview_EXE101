import { X, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopNagivationToolBar({ onExport, zoom = 100, onZoomIn, onZoomOut }) {
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
                    <button
                        onClick={onZoomOut}
                        className="text-gray-500 font-bold hover:text-black transition-colors">−</button>
                    <span className="text-sm font-medium text-cv-sidebar-blue">{zoom}%</span>
                    <button
                        onClick={onZoomIn}
                        className="text-gray-500 font-bold hover:text-black transition-colors">+</button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 border border-cv-sidebar-blue text-cv-sidebar-blue px-6 py-2.5 rounded-md hover:bg-blue-50 transition-colors">
                        <FileDown className="h-5 w-5"/>
                        <span className="font-medium text-sm">Xuất PDF</span>
                    </button>
                </div>
            </header>
        </>
    );
}
