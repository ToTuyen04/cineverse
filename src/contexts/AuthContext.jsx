import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Kiểm tra trạng thái đăng nhập ngay khi component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Hàm kiểm tra trạng thái đăng nhập
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const userFullName = localStorage.getItem('userFullName');

    if (token && userEmail) {
      // Có thể bạn cần phân tách họ và tên
      const nameParts = userFullName ? userFullName.split(' ') : [];
      const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (nameParts[0] || '');
      const lastName = nameParts.length > 1 ? nameParts[0] : '';

      setUser({
        email: userEmail,
        firstName: firstName,
        lastName: lastName,
        fullName: userFullName
      });
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Login function
  const login = (userData) => {
    // Đảm bảo xóa dữ liệu cũ trước khi lưu dữ liệu mới
    logout();
    
    // Lưu thông tin đăng nhập vào localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userEmail', userData.userEmail);
    localStorage.setItem('userFullName', userData.userFullName);
    
    // Lưu role và isStaff nếu có
    if (userData.role) localStorage.setItem('role', userData.role);
    if (userData.isStaff !== undefined) localStorage.setItem('isStaff', userData.isStaff.toString());

    // Đặt thời gian hết hạn phiên đăng nhập
    const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem('expirationTime', expirationTime.toString());

    // Phân tách họ và tên từ userFullName
    const nameParts = userData.userFullName ? userData.userFullName.split(' ') : [];
    const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (nameParts[0] || '');
    const lastName = nameParts.length > 1 ? nameParts[0] : '';

    // Cập nhật state
    setUser({
      email: userData.userEmail,
      firstName: firstName,
      lastName: lastName,
      fullName: userData.userFullName
    });
    setIsLoggedIn(true);
    
   
  };

  // Hàm cập nhật thông tin người dùng
  const updateUserInfo = (updatedUserData) => {
    // Cập nhật localStorage với thông tin mới
    if (updatedUserData.email) {
      localStorage.setItem('userEmail', updatedUserData.email);
    }
    
    // Cập nhật họ tên nếu có
    if (updatedUserData.firstName || updatedUserData.lastName) {
      const fullName = `${updatedUserData.lastName || ''} ${updatedUserData.firstName || ''}`.trim();
      localStorage.setItem('userFullName', fullName);
    } else if (updatedUserData.fullName) {
      localStorage.setItem('userFullName', updatedUserData.fullName);
    }
    
    // Cập nhật state user
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData,
      // Đảm bảo các trường cần thiết được giữ nguyên nếu không có trong dữ liệu cập nhật
      email: updatedUserData.email || prevUser?.email,
      firstName: updatedUserData.firstName || prevUser?.firstName,
      lastName: updatedUserData.lastName || prevUser?.lastName,
      fullName: updatedUserData.fullName || 
               `${updatedUserData.lastName || prevUser?.lastName || ''} ${updatedUserData.firstName || prevUser?.firstName || ''}`.trim()
    }));
    
    console.log('User info updated:', {
      ...updatedUserData,
      fullName: updatedUserData.fullName || 
               `${updatedUserData.lastName || ''} ${updatedUserData.firstName || ''}`.trim()
    });
  };

  // Logout function
  const logout = () => {
    // Xóa thông tin đăng nhập khỏi localStorage
    localStorage.clear();

    // Cập nhật state
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, checkLoginStatus, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);