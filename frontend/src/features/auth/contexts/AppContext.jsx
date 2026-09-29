import React, { createContext, useState, useContext } from 'react';
import { TEMPLATES_DATA } from '../../cv/constants/templates';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [cvs, setCvs] = useState([]);

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


