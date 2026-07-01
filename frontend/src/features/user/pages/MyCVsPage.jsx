import React, { useState } from 'react';
import { Plus, FileText, Sparkles, AlertCircle, Edit3, Trash2, ArrowUpRight, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../auth/contexts/AppContext.jsx';

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
    <div className="space-y-8 pb-16 text-on-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Danh sách của tôi</h2>
          <p className="text-sm text-on-surface-variant">Quản lý và tối ưu hóa hồ sơ nghề nghiệp của bạn với AI.</p>
        </div>
        <button
          id="cvs-add-new-btn"
          onClick={() => navigate("/templates")}
          className="bg-primary hover:bg-primary-container hover:shadow-md text-on-primary text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo CV mới</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {['All', 'Hoàn thành', 'AI Optimized', 'Bản nháp'].map((filter) => (
          <button
            key={filter}
            id={`filter-cv-${filter}`}
            onClick={() => setActiveTabFilter(filter)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
              activeTabFilter === filter
                ? 'bg-primary text-on-primary border-transparent shadow shadow-primary/10'
                : 'bg-surface-container hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface border-outline-variant'
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
            className="group cursor-pointer border-2 border-dashed border-outline-variant hover:border-primary rounded-2xl p-5 flex flex-col justify-center items-center text-center aspect-[3/4] hover:bg-surface-container-low transition-all shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant border border-outline-variant shadow-inner mb-4 transition-all group-hover:scale-105 group-hover:text-primary group-hover:bg-primary-container">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-on-surface block">Bắt đầu bản mới</span>
            <span className="text-[10px] text-on-surface-variant font-medium block mt-1.5 max-w-[150px] leading-relaxed">
              Sử dụng AI để khởi tạo nội dung chuyên nghiệp
            </span>
          </div>
        )}

        {filteredCvs.map((cv) => (
          <div
            key={cv.id}
            className="group glass-panel rounded-2xl border border-outline-variant p-5 flex flex-col justify-between aspect-[3/4] hover:shadow-lg hover:border-primary transition-all relative"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  cv.status === 'Hoàn thành' ? 'bg-primary-container text-primary border-primary-container' :
                  cv.status === 'AI Optimized' ? 'bg-primary-container text-primary border-primary-container' :
                  'bg-surface-container text-on-surface-variant border-outline-variant'
                }`}>
                  {cv.status}
                </span>
                <button
                  onClick={() => handleRemoveCV(cv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Xóa CV này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 pt-2">
                <h3 className="text-sm font-extrabold text-on-surface leading-snug group-hover:text-primary transition-colors">
                  {cv.title}
                </h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Cập nhật: {cv.updatedAt}</p>
              </div>
            </div>

            <div className="space-y-3.5 mt-auto">
              <button
                id={`cv-goto-editor-${cv.id}`}
                onClick={() => navigate('/editor')}
                className="w-full text-center text-[10px] font-bold text-on-surface-variant group-hover:text-primary flex items-center justify-center space-x-1 pt-1.5 border-t border-outline-variant transition-colors"
              >
                <span>Chỉnh sửa nội dung</span>
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary-container/40 border border-primary-container rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary/20 rounded-full"></div>
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-primary-container border border-primary-container flex items-center justify-center text-primary shrink-0 shadow-sm animate-pulse">
            💡
          </div>
          <div className="space-y-1.5 max-w-2xl">
            <h4 className="text-xs font-bold text-primary tracking-wider uppercase">Mẹo từ Smartfolio</h4>
            <p className="text-xs text-primary leading-relaxed">
              Mẹo: Sử dụng nút "AI Optimized" giúp tăng độ vượt tối ưu chuẩn ATS cho CV của bạn từ 60% lên trên 90%, đồng thời tăng tỷ lệ vượt qua vòng duyệt tự động lên đến gấp 3 lần.
            </p>
          </div>
        </div>
        <div className="flex space-x-1.5 pt-2 self-end sm:self-center select-none shrink-0">
          <span className="w-2.5 h-1.5 rounded-full bg-primary"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
        </div>
      </div>
    </div>
  );
};

export default MyCVsPage;
