import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Smartphone, Shield, ShieldCheck, ShieldAlert, Cpu, Globe, AlertCircle, Laptop, LogOut, RefreshCw, KeyRound, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { useApp } from '../../auth/contexts/AppContext.jsx';

const SecurityPage = () => {
  const navigate = useNavigate();
  const { is2faEnabled, handle2faToggle, devices, removeDevice, logoutAllDevices, securityLogs, addSecurityLog } = useAuth();
  const { showToast } = useApp();
  const [state, setState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = state;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Vui lòng điền đầy đủ các thông tin mật khẩu!', 'info');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'info');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Mật khẩu mới phải dài từ 8 ký tự trở lên!', 'info');
      return;
    }

    showToast('Cập nhật mật khẩu thành công!', 'success');

    addSecurityLog({
      id: `log-${Date.now()}`,
      action: 'thay_doi_mat_khau',
      title: 'Thay đổi mật khẩu',
      details: 'Mật khẩu tài khoản vừa mới được cập nhật trên thiết bị này.',
      timeLabel: 'Hôm nay, vừa mới đây',
    });

    setState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleLogoutDevice = (id, deviceName) => {
    removeDevice(id);
    showToast(`Đã thu hồi phiên đăng nhập trên: ${deviceName}`, 'info');
  };

  const handleLogoutAll = () => {
    logoutAllDevices();
    showToast('Đã đăng xuất khỏi tất cả các thiết bị phụ khác thành công!', 'success');
  };

  const getLogDetails = (action) => {
    switch (action) {
      case 'dang_nhap_thanh_cong':
        return { icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-primary-container/20 text-primary border-primary-container/30' };
      case 'thay_doi_mat_khau':
        return { icon: <Key className="w-4 h-4" />, color: 'bg-secondary-container/20 text-secondary border-secondary-container/30' };
      case 'co_gang_dang_nhap_that_bai':
        return { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-error-container/20 text-error border-error-container/30' };
      default:
        return { icon: <Shield className="w-4 h-4" />, color: 'bg-surface-container-low text-on-surface-variant border-outline-variant' };
    }
  };

  return (
    <div className="space-y-8 pb-16 text-on-surface">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3.5 pb-3 border-b border-outline-variant">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <KeyRound className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Đổi mật khẩu</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={state.currentPassword}
                onChange={(e) => setState({ ...state, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full text-sm border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-container focus:bg-surface-container-high focus:border-primary focus:outline-none transition-all placeholder:text-outline-variant"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Mật khẩu mới</label>
                <input
                  type="password"
                  value={state.newPassword}
                  onChange={(e) => setState({ ...state, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full text-sm border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-container focus:bg-surface-container-high focus:border-primary focus:outline-none transition-all placeholder:text-outline-variant"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={state.confirmPassword}
                  onChange={(e) => setState({ ...state, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full text-sm border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-container focus:bg-surface-container-high focus:border-primary focus:outline-none transition-all placeholder:text-outline-variant"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="sec-update-password-btn"
                type="submit"
                className="bg-primary hover:bg-primary-container hover:shadow-md text-on-primary text-xs font-bold px-6 py-3 rounded-lg transition-all active:scale-[0.98] select-none cursor-pointer"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center space-x-3 pb-3 border-b border-outline-variant">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-bold text-primary">Xác thực 2 lớp (2FA)</h3>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Thêm một lớp bảo mật cho tài khoản của bạn để ngăn chặn truy cập trái phép khi bị lộ mật khẩu.
          </p>

          <div className="space-y-3 pt-1.5">
            <div
              onClick={() => {
                handle2faToggle(!is2faEnabled);
                showToast(!is2faEnabled ? 'Đã bật Authenticator 2FA!' : 'Đã tắt Authenticator 2FA!', 'success');
              }}
              className={`bg-surface-container p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                is2faEnabled ? 'border-primary shadow-md shadow-primary/5' : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-on-surface block">Authenticator App</span>
                  <span className="text-[10px] text-on-surface-variant font-medium block mt-0.5">Khuyên dùng</span>
                </div>
              </div>
              <span className="text-outline-variant text-xs font-semibold">▶</span>
            </div>

            <div
              onClick={() => {
                handle2faToggle(!is2faEnabled);
                showToast(!is2faEnabled ? 'Đã cấu hình xác minh mã qua SMS!' : 'Đã tắt SMS OTP!', 'success');
              }}
              className={`bg-surface-container p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                is2faEnabled ? 'border-primary/80 shadow-sm' : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-5 h-5 flex items-center justify-center text-primary mt-0.5">
                  ✉
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">Tin nhắn SMS</span>
                  <span className="text-[10px] text-on-surface-variant font-medium block mt-0.5">Qua số điện thoại</span>
                </div>
              </div>
              <span className="text-outline-variant text-xs font-semibold">▶</span>
            </div>
          </div>

          <div className="pt-2">
            {is2faEnabled ? (
              <div className="flex items-start space-x-2 bg-primary/10 text-primary border border-primary/30 p-3 rounded-lg text-xs leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>2FA hiện đang <b>Bật</b>. Tài khoản đang được bảo vệ tuyệt đối bằng mật khẩu cộng mã bảo vệ thiết bị.</span>
              </div>
            ) : (
              <div className="flex items-start space-x-2 bg-surface-container text-on-surface-variant border border-outline-variant p-3 rounded-lg text-xs leading-relaxed">
                <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span>2FA hiện đang <b>Tắt</b>. Chúng tôi khuyên bạn nên kích hoạt ngay để bảo vệ dữ liệu CV an toàn.</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 glass-panel rounded-2xl border border-outline-variant p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <div className="flex items-center space-x-2">
              <Laptop className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold text-on-surface">Thiết bị đã đăng nhập</h3>
                <p className="text-[10px] text-on-surface-variant">Quản lý các trình duyệt và thiết bị đang truy cập tài khoản của bạn.</p>
              </div>
            </div>
            {devices.length > 1 && (
              <button
                id="sec-logout-all-btn"
                onClick={handleLogoutAll}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Đăng xuất tất cả
              </button>
            )}
          </div>

          <div className="divide-y divide-outline-variant">
            {devices.map((dev) => (
              <div key={dev.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface-variant shadow-sm">
                    {dev.device.toLowerCase().includes('mac') || dev.device.toLowerCase().includes('pc') ? (
                      <Laptop className="w-5 h-5" />
                    ) : (
                      <Smartphone className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface">{dev.device} - {dev.browser}</span>
                      {dev.isCurrent && (
                        <span className="text-[9px] font-bold font-mono bg-primary/10 text-primary border border-primary/30 px-1.5 py-0.5 rounded-md">
                          THIẾT BỊ NÀY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-on-surface-variant">
                      <span>{dev.location}</span>
                      <span>•</span>
                      <span className={dev.isCurrent ? "text-primary font-medium" : "text-on-surface-variant"}>
                        {dev.status}
                      </span>
                    </div>
                  </div>
                </div>
                {!dev.isCurrent && (
                  <button
                    id={`sec-logout-dev-${dev.id}`}
                    onClick={() => handleLogoutDevice(dev.id, dev.device)}
                    className="p-2 text-on-surface-variant hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Thoát thiết bị này"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {devices.length === 0 && (
              <p className="text-center text-xs text-on-surface-variant py-4">Không có hoạt động nào gần đây.</p>
            )}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              id="sec-view-all-logs-btn"
              onClick={() => navigate('/history')}
              className="w-full text-center border border-outline-variant bg-surface-container/50 hover:bg-surface-container hover:border-primary py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant"
            >
              Xem tất cả hoạt động
            </button>
          </div>
        </div>

        {/* Security Activity Section */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-outline-variant p-6 space-y-5 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-outline-variant">
            <RefreshCw className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-on-surface">Hoạt động bảo mật gần đây</h3>
          </div>
          <div className="space-y-4">
            {securityLogs.map((log) => {
              const style = getLogDetails(log.action);
              return (
                <div key={log.id} className="flex items-start space-x-4 p-3 rounded-lg border border-outline-variant hover:bg-surface-container/50 transition-colors group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.color} border`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{log.title}</h4>
                      <span className="text-[10px] text-on-surface-variant font-mono">{log.timeLabel}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">{log.details}</p>
                  </div>
                </div>
              );
            })}
            {securityLogs.length === 0 && (
              <p className="text-center text-xs text-on-surface-variant py-4">Không có hoạt động nào gần đây.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
