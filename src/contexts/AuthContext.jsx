import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../api/services/userService';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Kiểm tra trạng thái đăng nhập ngay khi component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Hàm kiểm tra trạng thái đăng nhập
  const checkLoginStatus = async () => {
    setIsCheckingAuth(true);
    const token = localStorage.getItem('token');
  
    if (token) {
      try {
        const profile = await getUserProfile(token);
  
        if (profile) {
          setUser({
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            fullName: `${profile.lastName} ${profile.firstName}`.trim(),
            rankDiscount: parseFloat(profile.rankDiscount) || 0,
            avatar: profile.avatar,
            phoneNumber: profile.phoneNumber,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            userPoint: profile.userPoint,
            rankName: profile.rankName,
            userCreateAt: profile.userCreateAt
          });
  
          setIsLoggedIn(true);
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        logout();
      } finally {
        setIsCheckingAuth(false);
      }
    } else {
      logout();
      setIsCheckingAuth(false);
    }
  };

  // Login function
  const login = async (userData) => {
    // Đảm bảo xóa dữ liệu cũ trước khi lưu dữ liệu mới
    logout();
    localStorage.setItem('token', userData.token);
    
    // Lưu thông tin đăng nhập vào localStorage
    console.log('userData', userData);
    // // Lưu role và isStaff nếu có
    // if (userData.role) localStorage.setItem('role', userData.role);
    // if (userData.isStaff !== undefined) localStorage.setItem('isStaff', userData.isStaff.toString());

    // // Đặt thời gian hết hạn phiên đăng nhập
    // const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    // localStorage.setItem('expirationTime', expirationTime.toString());

    // // Phân tách họ và tên từ userFullName
    // const nameParts = userData.userFullName ? userData.userFullName.split(' ') : [];
    // const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (nameParts[0] || '');
    // const lastName = nameParts.length > 1 ? nameParts[0] : '';

    // // Cập nhật state
    // setUser({
    //   email: userData.userEmail,
    //   firstName: firstName,
    //   lastName: lastName,
    //   fullName: userData.userFullName,
    //   rankDiscount: userData.rankDiscount || 0,
    // });
    // setIsLoggedIn(true);
    try {
      const profile = await getUserProfile(userData.token);
      if (profile) {
        // Cập nhật state user
        setUser({
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: `${profile.lastName} ${profile.firstName}`.trim(),
          rankDiscount: parseFloat(profile.rankDiscount) || 0,
          avatar: profile.avatar,
          phoneNumber: profile.phoneNumber,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          userPoint: profile.userPoint,
          rankName: profile.rankName,
          creatAt : profile.createdAt,
        });
  
        setIsLoggedIn(true);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Đăng nhập thất bại. Vui lòng thử lại.');
    }
   
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
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, checkLoginStatus, updateUserInfo, isCheckingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);