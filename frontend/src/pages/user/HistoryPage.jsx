import React, { useState } from 'react';
import { Clock, Filter, Sparkles, Video, FileEdit, Download, PlusCircle, LogIn, ChevronDown, CheckCheck, BarChart2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Modal from '../../components/ui/Modal.jsx';

const HistoryPage = () => {
  const { showToast } = useApp();
  const { activityLogs, addActivityLog } = useAuth();
  const [filterActive, setFilterActive] = useState('all');
  const [detailModal, setDetailModal] = useState({ open: false, log: null });

  const handleLoadMore = () => {
    const extraLogs = [
      // {
      //   id: `h-extra-${Date.now()}`,
      //   type: 'ai_toi_uu',
      //   title: 'AI tối ưu hóa hồ sơ',
      //   time: '11:15',
      //   dateLabel: 'TRƯỚC ĐÓ',
      //   details: 'Đã hoàn thành sửa lỗi dấu câu và văn phong tiếng Anh chuẩn mực cho hồ sơ của bạn.',
      // },
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

    // In a real app, we would fetch from API. For now, we use the context handler.
    extraLogs.forEach(log => addActivityLog(log));
    showToast('Đã tải thêm hoạt động bảo mật cũ hơn.', 'info');
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'phong_van':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'ai_toi_uu':
        return <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />;
      case 'chinh_sua_cv':
        return <FileEdit className="w-4 h-4 text-slate-500" />;
      case 'tai_xuong':
        return <Download className="w-4 h-4 text-emerald-600" />;
      case 'tao_cv':
        return <PlusCircle className="w-4 h-4 text-teal-600" />;
      case 'dang_nhap':
        return <LogIn className="w-4 h-4 text-[#0b3c8f]" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'phong_van':
        return 'bg-blue-50 border-blue-150';
      case 'ai_toi_uu':
        return 'bg-violet-50 border-violet-150';
      case 'chinh_sua_cv':
        return 'bg-slate-100 border-slate-200';
      case 'tai_xuong':
        return 'bg-emerald-50 border-emerald-150';
      case 'tao_cv':
        return 'bg-teal-50 border-teal-150';
      case 'dang_nhap':
        return 'bg-blue-50 border-blue-150';
      default:
        return 'bg-slate-50 border-slate-150';
    }
  };

  const renderSectionLogs = (title, sectionLogs) => {
    if (sectionLogs.length === 0) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 select-none">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{title}</span>
          <div className="flex-1 h-px bg-slate-150"></div>
        </div>

        <div className="space-y-6 relative pl-8 border-l border-slate-200/80 ml-4 pb-2">
          {sectionLogs.map((log) => (
            <div key={log.id} className="relative group">
              <span className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm shrink-0 z-10 bg-white ${getIconBg(log.type)}`}>
                {getIconForType(log.type)}
              </span>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 relative hover:border-slate-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-slate-800 leading-snug">{log.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium font-mono whitespace-nowrap pt-0.5">{log.time}</span>
                </div>

                {log.score && (
                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/40 space-y-2">
                    <p className="text-xs font-bold text-slate-800">
                      Điểm: <span className="text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md font-extrabold">{log.score}</span>
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {log.aiComment}
                    </p>
                  </div>
                )}

                {log.details && (
                  <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-2xl">{log.details}</p>
                )}

                {log.meta && (
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 border-t border-slate-50 pt-3 select-none">
                    <span>{log.meta}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 hover:border-slate-200 pt-3.5 text-[10px] font-bold text-[#0b3c8f]">
                  <span className="uppercase tracking-wide font-mono text-[8px] text-slate-400">Smartfolio trace</span>
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
    // { label: 'AI Tối ưu', id: 'ai_toi_uu' },
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
    <div className="space-y-8 pb-16 text-slate-800">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-400 block mr-2 uppercase tracking-wide">Lọc theo:</span>
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              id={`history-filter-${chip.id}`}
              onClick={() => setFilterActive(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors border ${
                filterActive === chip.id
                  ? 'bg-[#0b3c8f] text-white border-transparent shadow shadow-blue-500/10'
                  : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl self-start md:self-auto text-slate-600">
          <BarChart2 className="w-4.5 h-4.5 text-[#0b3c8f]" />
          <span className="text-[10px] font-extrabold uppercase tracking-wide">Tổng hoạt động</span>
        </div>
      </div>

      <div className="space-y-10">
        {renderSectionLogs('HÔM NAY', todayLogs)}
        {renderSectionLogs('HÔM QUA', yesterdayLogs)}
        {renderSectionLogs('TRƯỚC ĐÓ', olderLogs)}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300 shrink-0" />
            <p className="text-xs">Không tìm thấy hoạt động nào phù hợp với bộ lọc đã chọn.</p>
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-center">
        <button
          id="history-load-more"
          onClick={handleLoadMore}
          className="bg-slate-100 hover:bg-slate-200 border border-slate-200/80 hover:border-slate-350 text-slate-600 text-xs font-bold px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
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
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Thời gian</span>
              <span className="text-sm font-semibold text-slate-800">{detailModal.log?.time}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Loại sự kiện</span>
              <span className="text-sm font-semibold text-slate-800">{detailModal.log?.type}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Nội dung chi tiết</span>
            <p className="text-sm text-slate-600 leading-relaxed">
              {detailModal.log?.details || "Không có thông tin chi tiết cho sự kiện này."}
            </p>
          </div>

          {detailModal.log?.score && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-800">Kết quả đánh giá AI</span>
                <span className="text-sm font-extrabold text-blue-700">{detailModal.log.score}</span>
              </div>
              <p className="text-xs text-blue-600 leading-relaxed italic">
                "{detailModal.log.aiComment}"
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setDetailModal({ open: false, log: null })}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
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
