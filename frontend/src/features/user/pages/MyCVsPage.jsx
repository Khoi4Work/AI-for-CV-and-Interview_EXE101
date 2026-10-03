import { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import { Card, Badge, Button } from '../components/Layout.jsx';
import galleryService from '../../../service/galleryService';
import { getApiErrorMessage } from '../../../service/apiClient';
import { useGalleryData } from '../hooks/useGalleryData';
import { mapCV } from '../utils/galleryData';
import SavedCVPreview from '../components/SavedCVPreview.jsx';
import Modal from '../../../components/ui/Modal.jsx';

const filters = [['All', 'Tất cả'], ['COMPLETED', 'Hoàn thành'], ['OPTIMIZED', 'AI Optimized'], ['DRAFT', 'Bản nháp']];

export default function MyCVsPage() {
    const navigate = useNavigate();
    const { showToast } = useApp();
    const { cvs, loading, errors, reload, removeCV } = useGalleryData();
    const [filter, setFilter] = useState('All');
    const [deleting, setDeleting] = useState([]);
    const [previewCV, setPreviewCV] = useState(null);
    const deletingRef = useRef(new Set());
    const visibleCVs = cvs.map(mapCV).filter(cv => filter === 'All' || cv.status === filter);

    const handleDelete = async cv => {
        if (deletingRef.current.has(cv.id)) return;
        deletingRef.current.add(cv.id);
        setDeleting([...deletingRef.current]);
        try {
            await galleryService.deleteCV(cv.id);
            removeCV(cv.id);
            showToast(`Đã xóa CV: ${cv.title}`, 'success');
        } catch (error) {
            showToast(getApiErrorMessage(error), 'error');
        } finally {
            deletingRef.current.delete(cv.id);
            setDeleting([...deletingRef.current]);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-[#10B981]">Danh sách CV của tôi</h1>
                <Button onClick={() => navigate('/templates')} className="gap-2 rounded-full"><Plus size={18} />Tạo CV mới</Button>
            </div>
            <div className="flex flex-wrap gap-2 bg-[#E2E8F0] p-2 rounded-xl w-fit mb-8">
                {filters.map(([id, label]) => <button key={id} onClick={() => setFilter(id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${filter === id ? 'bg-[#10B981] text-white' : 'bg-white text-slate-600'}`}>{label}</button>)}
            </div>
            {loading ? <div role="status" className="text-center py-16 text-slate-400">Đang tải CV của bạn...</div> : errors.length > 0 ? (
                <div role="alert" className="bg-white rounded-2xl p-6 text-center text-red-600">
                    <p>{errors.join(' · ')}</p><Button onClick={reload} className="mt-4">Thử lại</Button>
                </div>
            ) : (
                <>
                    {visibleCVs.length === 0 && <p className="bg-white rounded-2xl p-8 mb-6 text-center text-slate-600">
                        {cvs.length === 0 ? 'Bạn chưa có CV nào được lưu. Hãy tạo CV mới để bắt đầu.' : 'Không có CV phù hợp với bộ lọc.'}
                    </p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filter === 'All' && <button onClick={() => navigate('/templates')}
                            className="min-h-80 rounded-2xl border-2 border-dashed border-slate-600 hover:border-emerald-500 flex flex-col items-center justify-center gap-3 text-slate-300 p-6">
                            <Plus size={28} /><span className="font-bold">Bắt đầu bản mới</span><span className="text-sm">Chọn mẫu CV phù hợp với bạn</span>
                        </button>}
                        {visibleCVs.map(cv => <Card key={cv.id} className="flex flex-col bg-[#E2E8F0] rounded-2xl">
                            <div className="h-60 m-3 rounded-xl bg-white overflow-hidden relative flex items-center justify-center">
                                <SavedCVPreview cv={cv} compact />
                                <button onClick={() => setPreviewCV(cv)} aria-label={`Xem trước ${cv.title}`}
                                    className="absolute inset-0 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600" />
                                <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 pointer-events-none">
                                    <Badge variant={cv.status === 'DRAFT' ? 'default' : 'success'}>{cv.statusLabel}</Badge>
                                    <button disabled={deleting.includes(cv.id)} onClick={() => handleDelete(cv)} title="Xóa CV" aria-label={`Xóa ${cv.title}`}
                                        className="pointer-events-auto p-2 rounded-lg bg-white text-slate-500 hover:text-red-600 disabled:opacity-40"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-5 pt-2 space-y-2 text-slate-700">
                                <h2 className="text-lg font-bold text-slate-900 break-words">{cv.title}</h2>
                                {cv.template?.name && <p className="text-xs text-slate-500">Mẫu: {cv.template.name}</p>}
                                <p className="text-xs">Cập nhật: {cv.updatedLabel}</p>
                                {cv.score != null && <p className="text-sm">Điểm CV: {cv.score}</p>}
                                {cv.atsScore != null && <p className="text-sm">Điểm ATS: {cv.atsScore}</p>}
                                <button disabled title="Chức năng mở lại CV để chỉnh sửa đang được hoàn thiện"
                                    className="w-full pt-3 border-t border-slate-300 text-xs text-slate-500 cursor-not-allowed">Chỉnh sửa nội dung (sắp có)</button>
                            </div>
                        </Card>)}
                    </div>
                </>
            )}
            <Modal isOpen={Boolean(previewCV)} onClose={() => setPreviewCV(null)} title={previewCV?.title || 'Xem trước CV'}>
                {previewCV && <SavedCVPreview key={previewCV.id} cv={previewCV} />}
            </Modal>
        </div>
    );
}
