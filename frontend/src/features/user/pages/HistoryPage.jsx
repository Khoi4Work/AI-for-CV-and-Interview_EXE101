import React, { useState } from 'react';
import { Clock, Filter, Sparkles, Video, FileEdit, Download, PlusCircle, LogIn, ChevronDown, CheckCheck, BarChart2 } from 'lucide-react';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';

const HistoryPage = () => {
  const { showToast } = useApp();
  const { activityLogs, addActivityLog } = useAuth();
  const [filterActive, setFilterActive] = useState('all');
  const [detailModal, setDetailModal] = useState({ open: false, log: null });

  const handleLoadMore = () => {
    const extraLogs = [
      {
        id: `h-extra-${Date.now()+1}`,
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
        return <Video className="w-4 h-4 text-primary" />;
      case 'ai_toi_uu':
        return <Sparkles className="w-4 h-4 text-primary animate-pulse" />;
      case 'chinh_sua_cv':
        return <FileEdit className="w-4 h-4 text-on-surface-variant" />;
      case 'tai_xuong':
        return <Download className="w-4 h-4 text-primary" />;
      case 'tao_cv':
        return <PlusCircle className="w-4 h-4 text-primary" />;
      case 'dang_nhap':
        return <LogIn className="w-4 h-4 text-primary" />;
      default:
        return <Clock className="w-4 h-4 text-on-surface-variant" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'phong_van':
      case 'dang_nhap':
        return 'bg-primary-container border-primary-container';
      case 'ai_toi_uu':
        return 'bg-primary-container border-primary-container';
      case 'chinh_sua_cv':
        return 'bg-surface-container border-outline-variant';
      case 'tai_xuong':
        return 'bg-primary-container border-primary-container';
      case 'tao_cv':
        return 'bg-primary-container border-primary-container';
      default:
        return 'bg-surface-container-low border-outline-variant';
    }
  };

  const renderSectionLogs = (title, sectionLogs) => {
    if (sectionLogs.length === 0) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 select-none">
          <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">{title}</span>
          <div className="flex-1 h-px bg-outline-variant"></div>
        </div>

        <div className="space-y-6 relative pl-8 border-l border-outline-variant/80 ml-4 pb-2">
          {sectionLogs.map((log) => (
            <div key={log.id} className="relative group">
              <span className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm shrink-0 z-10 bg-surface-container ${getIconBg(log.type)}`}>
                {getIconForType(log.type)}
              </span>

              <div className="glass-panel rounded-2xl border border-outline-variant p-5 shadow-sm space-y-4 relative hover:border-primary hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-on-surface leading-snug">{log.title}</h3>
                  <span className="text-[10px] text-on-surface-variant font-medium font-mono whitespace-nowrap pt-0.5">{log.time}</span>
                </div>

                {log.score && (
                  <div className="bg-primary-container/50 rounded-xl p-4 border border-primary-container/40 space-y-2">
                    <p className="text-xs font-bold text-on-surface">
                      Điểm: <span className="text-primary bg-primary-container/60 px-2 py-0.5 rounded-md font-extrabold">{log.score}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                      {log.aiComment}
                    </p>
                  </div>
                )}

                {log.details && (
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium max-w-2xl">{log.details}</p>
                )}

                {log.meta && (
                  <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant border-t border-outline-variant pt-3 select-none">
                    <span>{log.meta}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-outline-variant hover:border-primary pt-3.5 text-[10px] font-bold text-primary">
                  <span className="uppercase tracking-wide font-mono text-[8px] text-on-surface-variant">Smartfolio trace</span>
                  <button
                    id={`hist-view-detail-${log.id}`}
                    onClick={() => setDetailModal({ open: true, log })}
                    className="hover:underline flex items-center space-x-0.5 cursor-pointer pb-0.5"
                  >
                    <span>Xem chi tiết</span>
                    <span className="text-[8px]">▶</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const filterChips = [
    { label: 'Tất cả', id: 'all' },
    { label: 'Tạo CV', id: 'tao_cv' },
    { label: 'Tải xuống', id: 'tai_xuong' },
    { label: 'Phỏng vấn', id: 'phong_van' },
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
    <div className="space-y-8 pb-16 text-on-surface">
      <div className="glass-panel rounded-2xl border border-outline-variant p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-on-surface-variant block mr-2 uppercase tracking-wide">Lọc theo:</span>
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              id={`history-filter-${chip.id}`}
              onClick={() => setFilterActive(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors border ${
                filterActive === chip.id
                  ? 'bg-primary text-on-primary border-transparent shadow shadow-primary/10'
                  : 'bg-surface-container hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface border-outline-variant'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl self-start md:self-auto text-on-surface-variant">
          <BarChart2 className="w-4.5 h-4.5 text-primary" />
          <span className="text-[10px] font-extrabold uppercase tracking-wide">Tổng hoạt động</span>
        </div>
      </div>

      <div className="space-y-10">
        {renderSectionLogs('HÔM NAY', todayLogs)}
        {renderSectionLogs('HÔM QUA', yesterdayLogs)}
        {renderSectionLogs('TRƯỚC ĐÓ', olderLogs)}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl border border-outline-variant shadow-sm text-on-surface-variant space-y-2">
            <Clock className="w-8 h-8 mx-auto text-on-surface-variant shrink-0" />
            <p className="text-xs">Không tìm thấy hoạt động nào phù hợp với bộ lọc đã chọn.</p>
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-center">
        <button
          id="history-load-more"
          onClick={handleLoadMore}
          className="bg-surface-container hover:bg-surface-container-low border border-outline-variant hover:border-primary text-on-surface-variant text-xs font-bold px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Tải thêm hoạt động</span>
          <ChevronDown className="w-4 h-4 shrink-0" />
        </button>
      </div>

      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, log: null })}
        title={`Chi tiết hoạt động: ${detailModal.log?.title}`}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Thời gian</span>
              <span className="text-sm font-semibold text-on-surface">{detailModal.log?.time}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Loại sự kiện</span>
              <span className="text-sm font-semibold text-on-surface">{detailModal.log?.type}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-2">Nội dung chi tiết</span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {detailModal.log?.details || "Không có thông tin chi tiết cho sự kiện này."}
            </p>
          </div>

          {detailModal.log?.score && (
            <div className="p-4 rounded-xl bg-primary-container border border-primary-container space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary">Kết quả đánh giá AI</span>
                <span className="text-sm font-extrabold text-primary">{detailModal.log.score}</span>
              </div>
              <p className="text-xs text-primary leading-relaxed italic">
                "{detailModal.log.aiComment}"
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setDetailModal({ open: false, log: null })}
              className="px-4 py-2 rounded-lg bg-on-surface text-on-primary text-xs font-bold hover:opacity-90 transition-colors"
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
