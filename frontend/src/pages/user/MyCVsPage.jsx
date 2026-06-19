import React, { useState } from 'react';
import { Plus, FileText, Sparkles, AlertCircle, Edit3, Trash2, ArrowUpRight, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext.jsx';

const MyCVsPage = () => {
  const navigate = useNavigate();
  const { cvs, handleAddCV, handleRemoveCV, showToast } = useApp();
  const [newCvTitle, setNewCvTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState('All');

  const handleCreateCVSubmit = (e) => {
    e.preventDefault();
    if (!newCvTitle.trim()) {
      showToast('Vui lòng nhập tên tiêu đề CV!', 'info');
      return;
    }

    const newCV = {
      id: `cv-${Date.now()}`,
      title: newCvTitle,
      status: 'Bản nháp',
      updatedAt: 'Vừa xong',
    };

    handleAddCV(newCV);
    setNewCvTitle('');
    setShowAddForm(false);
    showToast(`Đã tạo bản nháp CV mới: "${newCV.title}"`, 'success');
  };

  const handleQuickAdd = () => {
    const occupations = [
      'Frontend Developer 2026',
      'UI/UX Designer Portfolio',
      'Business Analyst Resume',
      'Solution Architect CV',
    ];
    const selectOccName = occupations[Math.floor(Math.random() * occupations.length)];

    const newCV = {
      id: `cv-${Date.now()}`,
      title: selectOccName,
      status: 'AI Optimized',
      updatedAt: 'Vừa xong',
      score: 95,
    };
    handleAddCV(newCV);
    showToast(`Bản mẫu AI đã tự động tạo CV: "${newCV.title}"`, 'success');
  };

  const filteredCvs = cvs.filter(cv => {
    if (activeTabFilter === 'All') return true;
    return cv.status === activeTabFilter;
  });

  return (
    <div className="space-y-8 pb-16 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách của tôi</h2>
          <p className="text-sm text-slate-500">Quản lý và tối ưu hóa hồ sơ nghề nghiệp của bạn với AI.</p>
        </div>
        <button
          id="cvs-add-new-btn"
          // onClick={() => setShowAddForm(!showAddForm)}
          onClick={() => navigate("/templates")}
          className="bg-[#0b3c8f] hover:bg-[#093278] hover:shadow-md text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo CV mới</span>
        </button>
      </div>

      {/*{showAddForm && (*/}
      {/*  <form onSubmit={handleCreateCVSubmit} className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-4 animate-slide-up">*/}
      {/*    <h4 className="text-xs font-bold text-slate-700">Tạo mới bản CV khởi nghiệp</h4>*/}
      {/*    <div className="flex flex-col sm:flex-row gap-3">*/}
      {/*      <input*/}
      {/*        type="text"*/}
      {/*        value={newCvTitle}*/}
      {/*        onChange={(e) => setNewCvTitle(e.target.value)}*/}
      {/*        placeholder="e.g. Software Engineer Senior 2026..."*/}
      {/*        className="flex-1 text-sm border border-slate-200 bg-white rounded-xl px-4 py-2 hover:border-slate-350 focus:border-[#0b3c8f] focus:outline-none transition-all"*/}
      {/*      />*/}
      {/*      <div className="flex gap-2">*/}
      {/*        <button*/}
      {/*          type="button"*/}
      {/*          onClick={() => setShowAddForm(false)}*/}
      {/*          className="text-xs border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-150 transition-colors"*/}
      {/*        >*/}
      {/*          Hủy*/}
      {/*        </button>*/}
      {/*        <button*/}
      {/*          type="submit"*/}
      {/*          className="text-xs text-white bg-[#0b3c8f] hover:bg-[#093278] px-4 py-2 rounded-xl font-bold transition-colors"*/}
      {/*        >*/}
      {/*          Tạo nhanh*/}
      {/*        </button>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*    <p className="text-[10px] text-slate-400">Gợi ý: Smartfolio tự dệt cấu trúc CV chuẩn ATS ngay tức thì sau khi điền tiêu đề.</p>*/}
      {/*  </form>*/}
      {/*)}*/}

      <div className="flex flex-wrap gap-2 items-center">
        {['All', 'Hoàn thành', 'AI Optimized', 'Bản nháp'].map((filter) => (
          <button
            key={filter}
            id={`filter-cv-${filter}`}
            onClick={() => setActiveTabFilter(filter)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
              activeTabFilter === filter
                ? 'bg-[#0b3c8f] text-white border-transparent shadow shadow-blue-500/10'
                : 'bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            {filter === 'All' ? 'Tất cả' : filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {activeTabFilter === 'All' && (
          <div
            onClick={handleQuickAdd}
            className="group cursor-pointer border-2 border-dashed border-slate-200 hover:border-slate-350 rounded-2xl p-5 flex flex-col justify-center items-center text-center aspect-[3/4] hover:bg-slate-50/50 transition-all shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-150 shadow-inner mb-4 transition-all group-hover:scale-105 group-hover:text-[#0b3c8f] group-hover:bg-blue-50">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700 block">Bắt đầu bản mới</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1.5 max-w-[150px] leading-relaxed">
              Sử dụng AI để khởi tạo nội dung chuyên nghiệp
            </span>
          </div>
        )}

        {filteredCvs.map((cv) => (
          <div
            key={cv.id}
            className="group bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between aspect-[3/4] hover:shadow-lg hover:border-slate-350 transition-all relative"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  cv.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                  cv.status === 'AI Optimized' ? 'bg-blue-50 text-blue-700 border-blue-150' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {cv.status}
                </span>
                <button
                  onClick={() => handleRemoveCV(cv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Xóa CV này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 pt-2">
                <h3 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-[#0b3c8f] transition-colors">
                  {cv.title}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Cập nhật: {cv.updatedAt}</p>
              </div>
            </div>

            <div className="space-y-3.5 mt-auto">
              {/*{cv.score && (*/}
              {/*  <div className="flex items-center space-x-1.5 bg-blue-50/50 p-2 rounded-xl text-[10px] font-bold text-[#0b3c8f] border border-blue-100/55 select-none">*/}
              {/*    <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />*/}
              {/*    <span>Độ tối ưu: {cv.score}%</span>*/}
              {/*  </div>*/}
              {/*)}*/}

              {/*{cv.matchPercentage && (*/}
              {/*  <div className="flex items-center space-x-1.5 bg-indigo-50/50 p-1.5 rounded-xl text-[9px] text-[#0b3c8f] border border-[#0b3c8f]/10">*/}
              {/*    <CheckCircle2 className="w-3.5 h-3.5 text-[#0b3c8f] shrink-0" />*/}
              {/*    <span className="leading-normal">Phù hợp: {cv.matchPercentage}% với mô tả công việc</span>*/}
              {/*  </div>*/}
              {/*)}*/}

              <button
                id={`cv-goto-editor-${cv.id}`}
                onClick={() => navigate('/editor')}
                className="w-full text-center text-[10px] font-bold text-slate-400 group-hover:text-[#0b3c8f] flex items-center justify-center space-x-1 pt-1.5 border-t border-slate-50 transition-colors"
              >
                <span>Chỉnh sửa nội dung</span>
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-200/20 rounded-full"></div>
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm animate-pulse">
            💡
          </div>
          <div className="space-y-1.5 max-w-2xl">
            <h4 className="text-xs font-bold text-indigo-900 tracking-wider uppercase">Mẹo từ Smartfolio</h4>
            <p className="text-xs text-indigo-600 leading-relaxed">
              Mẹo: Sử dụng nút "AI Optimized" giúp tăng độ vượt tối ưu chuẩn ATS cho CV của bạn từ 60% lên trên 90%, đồng thời tăng tỷ lệ vượt qua vòng duyệt tự động lên đến gấp 3 lần.
            </p>
          </div>
        </div>
        <div className="flex space-x-1.5 pt-2 self-end sm:self-center select-none shrink-0">
          <span className="w-2.5 h-1.5 rounded-full bg-[#0b3c8f]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        </div>
      </div>
    </div>
  );
};

export default MyCVsPage;
