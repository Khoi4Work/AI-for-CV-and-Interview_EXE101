import { useRef, useState } from 'react';
import { Briefcase, Building2, CalendarDays, Check, Eye, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import { Card, Button } from '../components/Layout.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import galleryService from '../../../service/galleryService';
import { getApiErrorMessage } from '../../../service/apiClient';
import { useGalleryData } from '../hooks/useGalleryData';

function formatCreatedAt(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
}

const JD_FIELD_LABELS = {
    description: 'Mô tả công việc',
    overview: 'Tổng quan',
    details: 'Chi tiết công việc',
    bullets: 'Nội dung',
    responsibilities: 'Trách nhiệm',
    requirements: 'Yêu cầu',
    qualifications: 'Trình độ',
    skills: 'Kỹ năng',
    benefits: 'Quyền lợi',
    experience: 'Kinh nghiệm',
    experienceLevel: 'Cấp độ kinh nghiệm',
    education: 'Học vấn',
    location: 'Địa điểm',
    employmentType: 'Hình thức làm việc',
    source: 'Nguồn tham khảo',
};

function fieldLabel(key) {
    if (JD_FIELD_LABELS[key]) return JD_FIELD_LABELS[key];
    return key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/^./, character => character.toUpperCase());
}

function formatStructuredValue(value, level = 0) {
    const indent = '  '.repeat(level);
    if (Array.isArray(value)) {
        return value.map(item => {
            if (item && typeof item === 'object') return formatStructuredValue(item, level);
            return `${indent}- ${String(item)}`;
        }).filter(Boolean).join('\n');
    }
    if (value && typeof value === 'object') {
        return Object.entries(value).map(([key, nestedValue]) => {
            if (nestedValue == null || nestedValue === '') return '';
            if (key.toLowerCase() === 'title') {
                return `${indent}${String(nestedValue).toLocaleUpperCase('vi-VN')}`;
            }
            if (key.toLowerCase() === 'bullets') {
                return formatStructuredValue(nestedValue, level);
            }
            if (Array.isArray(nestedValue)) {
                return `${indent}${fieldLabel(key)}:\n${formatStructuredValue(nestedValue, level + 1)}`;
            }
            if (nestedValue && typeof nestedValue === 'object') {
                return `${indent}${fieldLabel(key)}:\n${formatStructuredValue(nestedValue, level + 1)}`;
            }
            return `${indent}${fieldLabel(key)}: ${String(nestedValue)}`;
        }).filter(Boolean).join('\n\n');
    }
    return value == null ? '' : `${indent}${String(value)}`;
}

function contentForEditor(content) {
    if (!content) return '';
    try {
        const parsed = JSON.parse(content);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return content;
        return Object.entries(parsed)
            .filter(([key, value]) => !['title', 'company'].includes(key.toLowerCase()) && value != null && value !== '')
            .map(([key, value]) => `${fieldLabel(key)}\n${formatStructuredValue(value)}`)
            .join('\n\n') || content;
    } catch {
        return content;
    }
}

function structuredMetadata(content) {
    try {
        const parsed = JSON.parse(content);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
        return {
            title: typeof parsed.title === 'string' ? parsed.title : '',
            companyName: typeof parsed.company === 'string' ? parsed.company : '',
        };
    } catch {
        return {};
    }
}

export default function MyJDsPage() {
    const navigate = useNavigate();
    const { showToast } = useApp();
    const { jds, loading, errors, reload, removeJD, updateJD } = useGalleryData();
    const [deleting, setDeleting] = useState([]);
    const [editingJD, setEditingJD] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', companyName: '', content: '' });
    const [savingJD, setSavingJD] = useState(false);
    const [selectedJD, setSelectedJD] = useState(null);
    const deletingRef = useRef(new Set());

    const handleDelete = async jd => {
        const title = jd.title || 'JD này';
        if (!window.confirm(`Ẩn “${title}” khỏi danh sách và gợi ý mới? Kết quả đánh giá và phỏng vấn cũ vẫn được giữ.`)) return;
        if (deletingRef.current.has(jd.id)) return;
        deletingRef.current.add(jd.id);
        setDeleting([...deletingRef.current]);
        try {
            await galleryService.deleteJD(jd.id);
            removeJD(jd.id);
            showToast(`Đã ẩn JD: ${title}`, 'success');
        } catch (error) {
            showToast(getApiErrorMessage(error), 'error');
        } finally {
            deletingRef.current.delete(jd.id);
            setDeleting([...deletingRef.current]);
        }
    };

    const openEditJD = jd => {
        const metadata = structuredMetadata(jd.content);
        setEditingJD(jd);
        setEditForm({
            title: jd.title && jd.title !== 'JD chưa có tiêu đề' ? jd.title : metadata.title,
            companyName: jd.companyName || metadata.companyName,
            content: contentForEditor(jd.content),
        });
    };

    const handleSaveJD = async event => {
        event.preventDefault();
        const title = editForm.title.trim();
        const content = editForm.content.trim();
        if (!title || !content) {
            showToast('Hãy nhập tiêu đề và nội dung JD.', 'error');
            return;
        }
        setSavingJD(true);
        try {
            const updated = await galleryService.updateJD(editingJD.id, {
                title,
                content,
                companyName: editForm.companyName.trim(),
            });
            updateJD(updated);
            setSelectedJD(current => current?.id === updated.id ? updated : current);
            setEditingJD(null);
            showToast('Đã cập nhật JD.', 'success');
        } catch (error) {
            showToast(getApiErrorMessage(error), 'error');
        } finally {
            setSavingJD(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl pb-12">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#10B981]">JD của tôi</h1>
                    <p className="mt-1 text-sm text-slate-600">Các JD bạn đã cung cấp và lưu trong tài khoản.</p>
                </div>
                <Button onClick={() => navigate('/cv-evaluation')} className="gap-2 rounded-full">
                    <Briefcase size={18} />
                    Thêm JD khi đánh giá CV
                </Button>
            </div>

            {loading ? (
                <div role="status" className="py-16 text-center text-slate-500">Đang tải JD của bạn...</div>
            ) : errors.length > 0 ? (
                <div role="alert" className="rounded-2xl bg-white p-6 text-center text-red-600">
                    <p>{errors.join(' · ')}</p>
                    <Button onClick={reload} className="mt-4">Thử lại</Button>
                </div>
            ) : jds.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                    <Briefcase className="mx-auto mb-3 text-slate-400" size={28} />
                    <p>Bạn chưa có JD nào được lưu.</p>
                    <p className="mt-1 text-sm">Dán JD khi đánh giá CV hoặc thiết lập phỏng vấn để lưu vào đây.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {jds.map(jd => {
                        const createdAt = formatCreatedAt(jd.createdAt);
                        return (
                            <Card key={jd.id} className="bg-white p-4 text-slate-700 sm:p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <h2 className="break-words text-lg font-bold text-slate-900">
                                            {jd.title || 'JD chưa có tiêu đề'}
                                        </h2>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                            {jd.companyName && <span className="inline-flex items-center gap-1"><Building2 size={14} />{jd.companyName}</span>}
                                            {createdAt && <span className="inline-flex items-center gap-1"><CalendarDays size={14} />{createdAt}</span>}
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                                            {jd.content || 'JD này chưa có nội dung.'}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        <Button
                                            onClick={() => setSelectedJD(jd)}
                                            variant="light-outline"
                                            className="gap-2 rounded-lg"
                                        ><Eye size={16} />Xem JD</Button>
                                        <button
                                            type="button"
                                            onClick={() => openEditJD(jd)}
                                            title="Chỉnh sửa JD"
                                            aria-label={`Chỉnh sửa JD ${jd.title || ''}`}
                                            className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                                        ><Pencil size={16} /></button>
                                        <button
                                            type="button"
                                            disabled={deleting.includes(jd.id)}
                                            onClick={() => handleDelete(jd)}
                                            title="Ẩn JD"
                                            aria-label={`Ẩn JD ${jd.title || ''}`}
                                            className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-40"
                                        ><Trash2 size={17} /></button>
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-slate-500">JD do bạn cung cấp · Chưa xác minh nguồn</p>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={Boolean(selectedJD)}
                onClose={() => setSelectedJD(null)}
                title={selectedJD?.title || 'Chi tiết JD'}
            >
                {selectedJD && (
                    <div className="flex max-h-[70vh] min-h-0 flex-col">
                        <div className="mb-4 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 pb-4 text-sm text-slate-600">
                            {selectedJD.companyName && <span className="inline-flex items-center gap-2"><Building2 size={16} />{selectedJD.companyName}</span>}
                            {selectedJD.createdAt && <span className="inline-flex items-center gap-2"><CalendarDays size={16} />{formatCreatedAt(selectedJD.createdAt)}</span>}
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">JD do bạn cung cấp · Chưa xác minh nguồn</span>
                        </div>
                        <div className="min-h-0 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-800 sm:p-6">
                            {selectedJD.content || 'JD này chưa có nội dung.'}
                        </div>
                        <div className="mt-4 flex shrink-0 justify-end">
                            <Button onClick={() => setSelectedJD(null)} className="rounded-lg px-5">Đóng</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={Boolean(editingJD)}
                onClose={() => setEditingJD(null)}
                title="Chỉnh sửa JD"
                solid
            >
                {editingJD && (
                    <form onSubmit={handleSaveJD} className="space-y-4">
                        <div>
                            <label htmlFor="jd-title" className="mb-1.5 block text-sm font-semibold text-slate-700">Tiêu đề vị trí <span className="text-red-600">*</span></label>
                            <input
                                id="jd-title"
                                autoFocus
                                required
                                maxLength={255}
                                value={editForm.title}
                                onChange={event => setEditForm(current => ({ ...current, title: event.target.value }))}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                placeholder="Ví dụ: Backend Developer"
                            />
                        </div>
                        <div>
                            <label htmlFor="jd-company" className="mb-1.5 block text-sm font-semibold text-slate-700">Công ty</label>
                            <input
                                id="jd-company"
                                maxLength={255}
                                value={editForm.companyName}
                                onChange={event => setEditForm(current => ({ ...current, companyName: event.target.value }))}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                placeholder="Tên công ty (không bắt buộc)"
                            />
                        </div>
                        <div>
                            <label htmlFor="jd-content" className="mb-1.5 block text-sm font-semibold text-slate-700">Nội dung JD <span className="text-red-600">*</span></label>
                            <textarea
                                id="jd-content"
                                required
                                rows={14}
                                value={editForm.content}
                                onChange={event => setEditForm(current => ({ ...current, content: event.target.value }))}
                                className="max-h-[50vh] min-h-64 w-full resize-y overflow-y-auto rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                placeholder="Dán hoặc chỉnh sửa nội dung mô tả công việc..."
                            />
                        </div>
                        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
                            <Button
                                type="button"
                                variant="light-outline"
                                onClick={() => setEditingJD(null)}
                                className="rounded-lg border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                            >Hủy</Button>
                            <Button type="submit" disabled={savingJD} className="gap-2 rounded-lg disabled:cursor-wait disabled:opacity-60">
                                <Check size={16} />{savingJD ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
