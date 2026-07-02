import React, { createContext, useState, useContext } from 'react';
import { TEMPLATES_DATA } from '../../cv/constants/templates';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [notificationsCount, setNotificationsCount] = useState(2);
  const [toast, setToast] = useState(null);
  const [cvs, setCvs] = useState([
    { id: 'cv-1', title: 'Software Engineer 2024', status: 'Hoàn thành', updatedAt: '2 giờ trước', score: 92, image: TEMPLATES_DATA[0]?.image },
    { id: 'cv-2', title: 'Product Manager Senior', status: 'AI Optimized', updatedAt: 'Hôm qua', matchPercentage: 85, image: TEMPLATES_DATA[1]?.image },
    { id: 'cv-3', title: 'Marketing Specialist', status: 'Bản nháp', updatedAt: '3 ngày trước', image: TEMPLATES_DATA[2]?.image },
    { id: 'cv-4', title: 'Data Analyst Resume', status: 'Hoàn thành', updatedAt: '1 tuần trước', image: TEMPLATES_DATA[3]?.image },
  ]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleNotificationRead = () => {
    setNotificationsCount(0);
    showToast('Đã đánh dấu đọc tất cả thông báo.', 'success');
  };

  const handleAddCV = (newCV) => {
    setCvs((prev) => [newCV, ...prev]);
  };

  const handleRemoveCV = (id) => {
    const target = cvs.find((c) => c.id === id);
    setCvs((prev) => prev.filter((cv) => cv.id !== id));
    if (target) {
      showToast(`Đã xoá hồ sơ: "${target.title}"`, 'info');
    }
  };

  return (
    <AppContext.Provider value={{
      notificationsCount,
      setNotificationsCount,
      toast,
      setToast,
      cvs,
      setCvs,
      showToast,
      handleNotificationRead,
      handleAddCV,
      handleRemoveCV
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}


