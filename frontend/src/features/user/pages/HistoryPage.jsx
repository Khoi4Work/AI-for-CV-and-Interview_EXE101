import React, { useState } from 'react';
import { Clock, Sparkles, Video, FileEdit, Download, PlusCircle, LogIn, ChevronDown, CheckCheck, BarChart2 } from 'lucide-react';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { Card, Badge, Button } from './Pattern/core';

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
        return <Video size={18} className="text-[#10B981]" />;
      case 'ai_toi_uu':
        return <Sparkles size={18} className="text-white" />;
      case 'chinh_sua_cv':
        return <FileEdit size={18} className="text-[#64748B]" />;
      case 'tai_xuong':
        return <Download size={18} className="text-white" />;
      case 'tao_cv':
        return <PlusCircle size={18} className="text-[#10B981]" />;
      case 'dang_nhap':
        return <LogIn size={18} className="text-[#64748B]" />;
      default:
        return <Clock size={18} className="text-[#64748B]" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'phong_van':
      case 'tao_cv':
        return 'bg-white border-4 border-[#E2E8F0]';
      case 'ai_toi_uu':
        return 'bg-[#7D5BE2] border-4 border-[#E2E8F0]';
      case 'chinh_sua_cv':
        return 'bg-white border-4 border-[#E2E8F0]';
      case 'tai_xuong':
        return 'bg-[#10B981] border-4 border-[#E2E8F0]';
      case 'dang_nhap':
        return 'bg-white border-4 border-[#E2E8F0]';
      default:
        return 'bg-white border-4 border-[#E2E8F0]';
    }
  };

  const renderSectionLogs = (title, sectionLogs) => {
    if (sectionLogs.length === 0) return null;
    return (
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-10 sm:w-12 h-0 border-t-2 border-white"></div>
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider bg-[#E2E8F0] px-2">{title}</span>
            <div className="flex-1 border-t-2 border-white"></div>
        </div>

        <div className="space-y-6 pl-4 sm:pl-6">
          {sectionLogs.map((log) => (
            <div key={log.id} className="relative flex gap-6 group">
              <div className={`absolute -left-[45px] sm:-left-[53px] mt-1 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm ${getIconBg(log.type)}`}>
                {getIconForType(log.type)}
              </div>

              <Card className="flex-1 p-5 bg-white border-none shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-[#0F172A]">{log.title}</h3>
                  <span className="text-[#64748B] text-sm font-medium">{log.time}</span>
                </div>

                {log.score && (
                  <div className="bg-[#F1F5F9] rounded-lg p-3 mb-4">
                    <p className="text-sm text-[#0F172A]">
                      <span className="font-bold text-[#10B981]">Điểm: {log.score}</span> - AI nhận xét: {log.aiComment}
                    </p>
                  </div>
                )}

                {log.details && (
                  <p className="text-[#475569] text-sm mb-4">{log.details}</p>
                )}

                {log.meta && (
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mb-4">
                    <FileEdit size={14} /> <span>{log.meta}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Badge
                    variant={log.type === 'ai_toi_uu' ? 'purple' : 'success'}
                    className={log.type === 'ai_toi_uu' ? 'bg-[#EDE9FE] text-[#7D5BE2]' : 'bg-[#10B981] text-white'}
                  >
                    {log.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <button
                    onClick={() => setDetailModal({ open: true, log })}
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
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#10B981]">Lịch sử hoạt động</h1>
      </div>

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 bg-[#E2E8F0] p-1.5 rounded-xl flex-1">
          <span className="text-sm text-[#0F172A] font-medium ml-3">Lọc theo:</span>
          <div className="flex flex-wrap gap-2">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilterActive(chip.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterActive === chip.id
                    ? 'bg-[#10B981] text-white shadow-sm'
                    : 'bg-white text-[#475569] hover:bg-gray-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#E2E8F0] p-2 px-4 rounded-xl flex items-center justify-between gap-8 h-12">
          <span className="text-xs text-[#475569]">Tổng hoạt động</span>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#10B981]">
            <BarChart2 size={16} />
          </div>
        </div>
      </div>

      <div className="bg-[#E2E8F0] rounded-2xl p-6 sm:p-8 relative">
        <div className="absolute left-12 sm:left-14 top-12 bottom-12 w-[2px] bg-white"></div>

        {renderSectionLogs('HÔM NAY', todayLogs)}
        {renderSectionLogs('HÔM QUA', yesterdayLogs)}
        {renderSectionLogs('TRƯỚC ĐÓ', olderLogs)}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-[#64748B] space-y-2">
            <Clock className="w-8 h-8 mx-auto text-[#64748B] shrink-0" />
            <p className="text-sm">Không tìm thấy hoạt động nào phù hợp với bộ lọc đã chọn.</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="rounded-full px-6 flex items-center gap-2 bg-white text-[#0F172A] border-none shadow-sm"
          >
            Tải thêm hoạt động <ChevronDown size={16} />
          </Button>
        </div>
      </div>

      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, log: null })}
        title={`Chi tiết hoạt động: ${detailModal.log?.title}`}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
            <div className="text-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Thời gian</span>
              <span className="text-sm font-semibold text-on-surface">{detailModal.log?.time}</span>
            </div>
            <div className="text-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Loại sự kiện</span>
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
              onClick={() => setDetailModal({ open: false, log: null })}
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
