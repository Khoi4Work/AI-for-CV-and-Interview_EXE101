import AuthProgress from './AuthProgress.jsx';

export default function LoginLoading({ success = false }) {
  return (
    <AuthProgress
      success={success}
      title={success ? 'Đăng nhập thành công' : 'Đang đăng nhập'}
      message={success
        ? 'Đang chuẩn bị tài khoản và chuyển bạn đến trang tiếp theo…'
        : 'Vui lòng chờ trong giây lát để xác thực tài khoản của bạn.'}
    />
  );
}
