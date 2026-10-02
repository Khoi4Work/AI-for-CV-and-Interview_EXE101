import { X, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfilePhotoPicker from './ProfilePhotoPicker.jsx';

export default function TopNagivationToolBar({ onExport, zoom = 100, onZoomIn, onZoomOut, templateName, templateOptions = [], selectedTemplateId, onTemplateChange }) {
    const navigate = useNavigate();

    return (
        <>
            <header className="cv-editor-toolbar glass-panel border-b border-white/10 px-6 py-3 flex items-center justify-between z-10 w-full shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        <X className="h-6 w-6"/>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-on-primary font-bold text-xs select-none">
                            S
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-primary leading-tight">{templateName || 'Trình chỉnh sửa CV'}</h1>
                            <p className="text-xs text-on-surface-variant italic">Chỉnh sửa nội dung theo mẫu đã chọn</p>
                        </div>
                    </div>
                </div>

                {/* Zoom Controls */}
                {templateOptions.length > 0 && onTemplateChange && (
                    <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="hidden sm:inline">Mẫu CV</span>
                        <select
                            aria-label="Chọn mẫu CV"
                            value={selectedTemplateId || ''}
                            onChange={(event) => onTemplateChange(event.target.value)}
                            className="max-w-52 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface"
                        >
                            {templateOptions.map((template) => (
                                <option key={template.id} value={template.id}>{template.title}</option>
                            ))}
                        </select>
                    </label>
                )}

                {/* Zoom Controls */}
                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-1 gap-4 border border-white/10">
                    <button
                        onClick={onZoomOut}
                        className="text-on-surface-variant font-bold hover:text-on-surface transition-colors">−</button>
                    <span className="text-sm font-medium text-primary">{zoom}%</span>
                    <button
                        onClick={onZoomIn}
                        className="text-on-surface-variant font-bold hover:text-on-surface transition-colors">+</button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <ProfilePhotoPicker variant="compact" />
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-sm">
                        <FileDown className="h-5 w-5"/>
                        <span className="font-medium text-sm">In / Lưu PDF</span>
                    </button>
                </div>
            </header>
        </>
    );;
}
