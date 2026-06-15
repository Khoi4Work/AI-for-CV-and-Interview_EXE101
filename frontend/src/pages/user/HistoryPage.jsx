import React, { useState } from 'react';
import { Clock, Filter, Sparkles, Video, FileEdit, Download, PlusCircle, LogIn, ChevronDown, CheckCheck, BarChart2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext.jsx';

const HistoryPage = () => {
  const { showToast } = useApp();
  const [filterActive, setFilterActive] = useState('all');
  const [logs, setLogs] = useState([
    {
      id: 'h1',
      type: 'phong_van',
      title: 'Phỏng vấn giả lập: UI/UX Designer',
      time: '15:45',
      dateLabel: 'HÔM NAY',
      score: '8.5/10',
      aiComment: 'AI nhận xét: Giao tiếp tốt, cần cải thiện ngôn ngữ cơ thể và cách giải thích quy trình thiết kế.',
    },
    {
      id: 'h2',
      type: 'ai_toi_uu',
      title: 'AI tối ưu hóa hồ sơ',
      time: '14:30',
      dateLabel: 'HÔM NAY',
      details: 'Hệ thống AI đã tự động tối ưu hóa phần "Kỹ năng chuyên môn" cho CV "Frontend Developer_2024".',
    },
    {
      id: 'h3',
      type: 'chinh_sua_cv',
      title: 'Chỉnh sửa CV',
      time: '10:15',
      dateLabel: 'HÔM NAY',
      details: 'Bạn đã cập nhật thông tin tại mục "Kinh nghiệm làm việc" trong hồ sơ "Marketing Manager".',
    },
    {
      id: 'h4',
      type: 'phong_van',
      title: 'Phỏng vấn giả lập: Frontend Developer',
      time: '14:20',
      dateLabel: 'HÔM QUA',
      score: '7.8/10',
      aiComment: 'AI nhận xét: Kiến thức kỹ thuật vững, tuy nhiên cần tự tin hơn khi trả lời các câu hỏi về xử lý tình huống.',
    },
    {
      id: 'h5',
      type: 'tai_xuong',
      title: 'Tải xuống PDF',
      time: '16:45',
      dateLabel: 'HÔM QUA',
      details: 'Đã xuất file PDF thành công cho CV.',
      meta: '2.4 MB • Hoàn tất',
    },
    {
      id: 'h6',
      type: 'tao_cv',
      title: 'Tạo CV mới',
      time: '09:00',
      dateLabel: 'HÔM QUA',
      details: 'Bắt đầu khởi tạo CV mới với template.',
    },
    {
      id: 'h7',
      type: 'dang_nhap',
      title: 'Smartfolio',
      time: '08:55',
      dateLabel: 'HÔM QUA',
      details: 'Đăng nhập từ trình duyệt Chrome trên thiết bị macOS (IP: 113.161.xx.xx).',
    },
  ]);

  const handleLoadMore = () => {
    const extraLogs = [
      {
        id: 'h8',
        type: 'ai_toi_uu',
        title: 'AI tối ưu hóa hồ sơ',
        time: '11:15',
        dateLabel: 'TRƯỚC ĐÓ',
        details: 'Đã hoàn thành sửa lỗi dấu câu và văn phong tiếng Anh chuẩn mực cho hồ sơ của bạn.',
      },
      {
        id: 'h9',
        type: 'tai_xuong',
        title: 'Tải xuống PDF',
        time: '10:00',
        dateLabel: 'TRƯỚC ĐÓ',
        details: 'Đã xuất file PDF thành công cho CV Sản phẩm.',
        meta: '2.1 MB • Hoàn tất',
      }
    ];

    setLogs((prevLogs) => [...prevLogs, ...extraLogs]);
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
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">{title}</span>
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
                    onClick={() => showToast(`Đang hiển thị dữ liệu chi tiết cho: ${log.title}`, 'info')}
                    className="hover:underline flex items-center space-x-0.5 cursor-pointer pb-0.5"
                  >
                    <span>Xem chi tiết</span>
                    <span>▶</span>
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
    { label: 'AI Tối ưu', id: 'ai_toi_uu' },
    { label: 'Tải xuống', id: 'tai_xuong' },
    { label: 'Phỏng vấn', id: 'phong_van' },
  ];

  const filteredLogs = logs.filter((log) => {
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
    </div>
  );
};

export default HistoryPage;
