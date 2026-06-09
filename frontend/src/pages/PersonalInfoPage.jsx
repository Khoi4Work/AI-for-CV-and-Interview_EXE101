import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Link, Globe, Code, Sparkles, Shield, User, FileText, ChevronRight } from 'lucide-react';

const PersonalInfoPage = ({ profile, is2faEnabled, cvs, onProfileUpdate, on2faToggle, onShowNotification }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...profile });
  const [local2fa, setLocal2fa] = useState(is2faEnabled);

  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  useEffect(() => {
    setLocal2fa(is2faEnabled);
  }, [is2faEnabled]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onProfileUpdate(formData);
    on2faToggle(local2fa);
    onShowNotification('Đã lưu các thay đổi thông tin cá nhân thành công!', 'success');
  };

  const handleReset = () => {
    setFormData({ ...profile });
    setLocal2fa(is2faEnabled);
    onShowNotification('Đã khôi phục thông tin ban đầu.', 'info');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16 animate-fade-in text-slate-800">
      {/* Page Title & Desc */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cài đặt tài khoản</h2>
        <p className="text-sm text-slate-500">Quản lý các thông tin cá nhân cốt lõi và các quyền hạn mật thiết của tài khoản bạn.</p>
      </div>

      {/* Profile Photo and Member Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-5 text-center md:text-left">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-[#0b3c8f]/10 text-[#0b3c8f] border-2 border-[#0b3c8f]/20 shadow-inner flex items-center justify-center font-bold text-2xl select-none">
              {getInitials(formData.fullName)}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-slate-200 text-[#0b3c8f] hover:bg-slate-50 shadow transition-all active:scale-90">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mt-3 md:mt-0">
            <div>
              <h3 className="text-xl font-bold text-slate-800 leading-none">{formData.fullName || 'Người dùng'}</h3>
              <p className="text-sm text-slate-400 mt-1">{formData.email}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="text-[10px] uppercase tracking-wider font-semibold font-mono bg-[#0b3c8f]/10 text-[#0b3c8f] px-2 py-0.5 rounded-md">
                {formData.membershipType}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                {formData.memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-[#0b3c8f]" />
          <h3 className="font-bold text-slate-800">Thông tin cá nhân</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-slate-500">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white focus:border-[#0b3c8f] focus:outline-none transition-all"
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-slate-500">Địa chỉ Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white focus:border-[#0b3c8f] focus:outline-none transition-all"
              placeholder="Nhập địa chỉ email..."
            />
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-slate-500">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white focus:border-[#0b3c8f] focus:outline-none transition-all"
              placeholder="Nhập số điện thoại..."
            />
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-slate-500">Vị trí</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white focus:border-[#0b3c8f] focus:outline-none transition-all"
              placeholder="Thành phố, Quốc gia..."
            />
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-bold text-slate-500">Nghề nghiệp</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white focus:border-[#0b3c8f] focus:outline-none transition-all"
              placeholder="Nhập ngành nghề của bạn..."
            />
          </div>
        </div>
      </div>

      {/* Social Links Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Globe className="w-5 h-5 text-[#0b3c8f]" />
          <h3 className="font-bold text-slate-800">Liên kết sự nghiệp</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 bg-slate-50/50 p-1.5 rounded-xl border border-slate-150">
            <div className="w-9 h-9 rounded-lg bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5]">
              <Link className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 block ml-1">URL LinkedIn</span>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full text-sm bg-transparent border-none outline-none py-0.5 px-1 focus:ring-0"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50/50 p-1.5 rounded-xl border border-slate-150">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 block ml-1">URL Portfolio</span>
              <input
                type="text"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                className="w-full text-sm bg-transparent border-none outline-none py-0.5 px-1 focus:ring-0"
                placeholder="https://myportfolio.com"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50/50 p-1.5 rounded-xl border border-slate-150">
            <div className="w-9 h-9 rounded-lg bg-slate-900/10 flex items-center justify-center text-slate-800 border border-slate-200">
              <Code className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 block ml-1">URL GitHub</span>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full text-sm bg-transparent border-none outline-none py-0.5 px-1 focus:ring-0"
                placeholder="https://github.com/username"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings grid block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
          <div>
            <span className="text-[10px] text-[#0b3c8f] font-bold uppercase tracking-wider">Quản lý mật khẩu</span>
            <p className="text-xs text-slate-400 mt-1">Cập nhật lần cuối 3 tháng trước.</p>
          </div>
          <button
            id="pi-change-password-link"
            onClick={() => navigate('/security')}
            className="text-xs font-bold text-[#0b3c8f] hover:underline flex items-center self-start space-x-0.5 mt-3"
          >
            <span>Đổi mật khẩu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm min-h-[140px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-[#0b3c8f] font-bold uppercase tracking-wider">Xác thực hai yếu tố</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={local2fa}
                  onChange={(e) => {
                    setLocal2fa(e.target.checked);
                    onShowNotification(
                      e.target.checked ? 'Đã kích hoạt 2FA tạm thời. Hãy nhấp Lưu thay đổi!' : 'Đã ấn tắt 2FA tạm thời. Hãy nhấp Lưu thay đổi!',
                      'info'
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#0b3c8f]"></div>
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-1">Tăng cường bảo vệ tài khoản của bạn khỏi truy cập trái phép.</p>
          </div>
        </div>
      </div>

      {/* CV của tôi quick preview section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#0b3c8f]" />
            <h3 className="font-bold text-slate-800">CV của tôi</h3>
          </div>
          <button
            id="pi-view-all-cvs"
            onClick={() => navigate('/my-cvs')}
            className="text-xs text-slate-400 font-bold hover:text-[#0b3c8f] transition-colors"
          >
            Xem tất cả
          </button>
        </div>

        <div className="space-y-3">
          {cvs.slice(0, 2).map((cv) => (
            <div key={cv.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0b3c8f]">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cv.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cập nhật: {cv.updatedAt}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                  cv.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                  cv.status === 'AI Optimized' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {cv.status}
                </span>
                <button
                  id={`pi-edit-cv-${cv.id}`}
                  onClick={() => navigate('/my-cvs')}
                  className="text-[10px] font-bold text-[#0b3c8f] hover:bg-blue-50 border border-[#0b3c8f]/20 px-3 py-1 rounded-lg transition-colors"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active package information */}
      <div className="bg-[#0b3c8f]/5 text-[#0b3c8f] rounded-2xl border border-[#0b3c8f]/10 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#0b3c8f] text-white flex items-center justify-center font-bold">
            ★
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0b3c8f]">Đang sử dụng gói {profile.membershipType}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Thanh toán hàng năm • Gia hạn vào 12 thg 12, 2026</p>
          </div>
        </div>
        <button
          id="pi-manage-pkg-btn"
          onClick={() => navigate('/pricing')}
          className="bg-[#0b3c8f] hover:bg-[#093278] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Quản lý gói dịch vụ
        </button>
      </div>

      {/* AI Suggestions wrapper */}
      <div className="bg-indigo-50 border border-indigo-100/80 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200/20 rounded-full -mr-4 -mt-4"></div>
        <div className="flex items-center space-x-2 text-indigo-700">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <h4 className="text-xs font-bold tracking-wide uppercase">Gợi ý từ AI từ Smartfolio</h4>
        </div>
        <p className="text-xs text-indigo-600 leading-relaxed max-w-2xl">
          "Hồ sơ của bạn đã tối ưu đạt 92%. Hãy bổ sung các dự án về ReactJS/TypeScript bản mới nhất để thu hút hơn 45% các lời mời phỏng vấn tự động từ nhà tuyển dụng."
        </p>
      </div>

      {/* Save Action Buttons */}
      <div className="flex items-center justify-end space-x-4 border-t border-slate-200 pt-6">
        <button
          id="pi-discard-btn"
          onClick={handleReset}
          className="px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors cursor-pointer"
        >
          Hủy
        </button>
        <button
          id="pi-save-btn"
          onClick={handleSave}
          className="bg-[#0b3c8f] hover:bg-[#093278] hover:shadow-lg text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoPage;
