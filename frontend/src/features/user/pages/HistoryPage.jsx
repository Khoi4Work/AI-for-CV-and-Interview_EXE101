import React, {useState} from 'react';
import {
    Clock,
    Sparkles,
    Video,
    FileEdit,
    Download,
    PlusCircle,
    LogIn,
    ChevronDown,
    CheckCheck,
    BarChart2
} from 'lucide-react';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import {Card, Badge, Button} from '../components/Layout.jsx';
import {Footer} from "../../../components/layout/Footer.jsx";

const HistoryPage = () => {
    const {showToast} = useApp();
    const {activityLogs, addActivityLog} = useAuth();
    const [filterActive, setFilterActive] = useState('all');
    const [detailModal, setDetailModal] = useState({open: false, log: null});

    const handleLoadMore = () => {
        const extraLogs = [
            {
                id: `h-extra-${Date.now() + 1}`,
                type: 'tai_xuong',
                title: 'Tải xuống PDF',
                time: '10:00',
                dateLabel: 'TRƯỚC ĐÓ',
                details: 'Đã xuất file PDF thành công cho CV Sản phẩm.',
                meta: '2.1 MB • Hoàn tất',
            }
        ];

        extraLogs.forEach(log => addActivityLog(log));
        showToast('Đã tải thêm hoạt động bảo mật cũ hơn.', 'info');
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'phong_van':
                return <Video size={18}/>;
            case 'ai_toi_uu':
                return <Sparkles size={18}/>;
            case 'tai_xuong':
                return <Download size={18}/>;
            case 'chinh_sua_cv':
                return <FileEdit size={18}/>;
            case 'tao_cv':
                return <PlusCircle size={18}/>;
            case 'dang_nhap':
                return <LogIn size={18}/>;
            default:
                return <Clock size={18}/>;
        }
    };

    const getIconStyle = (type) => {
        switch (type) {
            case 'phong_van':
                return 'bg-[#D1FAE5] text-[#10B981]';
            case 'ai_toi_uu':
                return 'bg-[#4F46E5] text-white';
            case 'tai_xuong':
                return 'bg-[#10B981] text-white';
            default:
                return 'bg-white text-[#64748B]';
        }
    };

    const renderSectionLogs = (title, sectionLogs) => {
        if (sectionLogs.length === 0) return null;
        return (
            <div className="mb-8">
                <div
                    className="text-center text-[#475569] font-semibold text-sm my-4 uppercase tracking-wide relative z-10">
                    {title}
                </div>

                <div className="relative pt-2">
                    <div className="absolute top-0 bottom-0 left-[19px] w-[2px] bg-white z-0 hidden sm:block"></div>

                    <div className="space-y-6 relative z-10">
                        {sectionLogs.map((log) => (
                            <div key={log.id} className="flex flex-col sm:flex-row items-start gap-4">
                                <div
                                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm ${getIconStyle(log.type)}`}>
                                    {getIconForType(log.type)}
                                </div>

                                <Card className="flex-1 p-4 bg-[#F1F5F9] border-none shadow-sm rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-[#10B981]">{log.title}</h3>
                                        <span className="text-[#64748B] text-sm font-medium">{log.time}</span>
                                    </div>

                                    {log.score && (
                                        <div
                                            className="bg-white rounded-lg p-3 mt-2 mb-4 border border-gray-100 shadow-sm">
                                            <p className="text-sm text-[#0F172A]">
                                                <span className="font-bold text-[#10B981]">Điểm: {log.score}</span> - AI
                                                nhận xét: {log.aiComment}
                                            </p>
                                        </div>
                                    )}

                                    {log.details && (
                                        <p className="text-[#475569] text-sm mb-4">{log.details}</p>
                                    )}

                                    {log.meta && (
                                        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-4">
                                            <FileEdit size={14}/> <span>{log.meta}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={`text-xs px-2 py-1 rounded-full border-none ${
                                                log.type === 'phong_van'
                                                    ? 'bg-[#10B981] text-white'
                                                    : log.type === 'ai_toi_uu'
                                                        ? 'bg-[#F3E8FF] text-[#9333EA]'
                                                        : 'bg-slate-200 text-slate-600'
                                            }`}
                                        >
                                            {log.type.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        <button
                                            onClick={() => setDetailModal({open: true, log})}
                                            className="text-xs text-[#10B981] hover:underline transition-colors"
                                        >
                                            Xem chi tiết ›
                                        </button>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const filterChips = [
        {label: 'Tất cả', id: 'all'},
        {label: 'Tạo CV', id: 'tao_cv'},
        {label: 'Tải xuống', id: 'tai_xuong'},
        {label: 'Phỏng vấn', id: 'phong_van'},
    ];

    const filteredLogs = activityLogs.filter((log) => {
        if (filterActive === 'all') return true;
        if (filterActive === 'tao_cv') return log.type === 'tao_cv' || log.type === 'chinh_sua_cv';
        return log.type === filterActive;
    });

    const todayLogs = filteredLogs.filter(log => log.dateLabel === 'HÔM NAY');
    const yesterdayLogs = filteredLogs.filter(log => log.dateLabel === 'HÔM QUA');
    const olderLogs = filteredLogs.filter(log => log.dateLabel === 'TRƯỚC ĐÓ');

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-[#10B981]">Lịch sử hoạt động</h1>
            </div>

            <div className="flex items-center justify-between gap-4 mb-8">
                <div
                    className="flex items-center gap-2 bg-white p-2 px-4 rounded-xl shadow-sm border border-slate-100 w-fit">
                    <span className="text-sm text-[#0F172A] font-medium ml-1">Lọc theo:</span>
                    <div className="flex flex-wrap gap-2">
                        {filterChips.map((chip) => (
                            <button
                                key={chip.id}
                                onClick={() => setFilterActive(chip.id)}
                                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filterActive === chip.id
                                        ? 'bg-[#10B981] text-white shadow-sm'
                                        : 'text-[#475569] hover:bg-slate-100'
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    className="bg-white p-2 px-4 rounded-xl flex items-center justify-between gap-8 h-12 shadow-sm border border-slate-100">
                    <span className="text-xs text-[#475569]">Tổng hoạt động</span>
                    <div
                        className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#10B981] border border-slate-100">
                        <BarChart2 size={16}/>
                    </div>
                </div>
            </div>

            <div className="bg-[#9BA9AF] rounded-2xl p-6 sm:p-8 relative">
                {renderSectionLogs('HÔM NAY', todayLogs)}
                {renderSectionLogs('HÔM QUA', yesterdayLogs)}
                {renderSectionLogs('TRƯỚC ĐÓ', olderLogs)}

                {filteredLogs.length === 0 && (
                    <div
                        className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-[#64748B] space-y-2">
                        <Clock className="w-8 h-8 mx-auto text-[#64748B] shrink-0"/>
                        <p className="text-sm">Không tìm thấy hoạt động nào phù hợp với bộ lọc đã chọn.</p>
                    </div>
                )}

                <div className="mt-8 flex justify-center pb-4">
                    <button
                        onClick={handleLoadMore}
                        className="flex items-center justify-center gap-2 bg-white text-[#10B981] font-medium px-6 py-2.5 rounded-full shadow-sm border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer"
                    >
                        <span>Tải thêm hoạt động</span>
                        <ChevronDown size={18} className="text-[#10B981]"/>
                    </button>
                </div>
            </div>

            <Modal
                isOpen={detailModal.open}
                onClose={() => setDetailModal({open: false, log: null})}
                title={`Chi tiết hoạt động: ${detailModal.log?.title}`}
            >
                <div className="space-y-6">
                    <div
                        className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                        <div className="text-sm">
                            <span
                                className="text-[10px] font-bold text-on-surface-variant uppercase block">Thời gian</span>
                            <span className="text-sm font-semibold text-on-surface">{detailModal.log?.time}</span>
                        </div>
                        <div className="text-sm">
                            <span
                                className="text-[10px] font-bold text-on-surface-variant uppercase block">Loại sự kiện</span>
                            <span className="text-sm font-semibold text-on-surface">{detailModal.log?.type}</span>
                        </div>
                    </div>

                    <div className="text-sm">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-2">Nội dung chi tiết</span>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            {detailModal.log?.details || "Không có thông tin chi tiết cho sự kiện này."}
                        </p>
                    </div>

                    {detailModal.log?.score && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#10B981]">Kết quả đánh giá AI</span>
                                <span className="text-sm font-extrabold text-[#10B981]">{detailModal.log.score}</span>
                            </div>
                            <p className="text-xs text-[#10B981] leading-relaxed italic">
                                "{detailModal.log.aiComment}"
                            </p>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={() => setDetailModal({open: false, log: null})}
                            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:opacity-90 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default HistoryPage;
