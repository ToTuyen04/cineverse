import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Alert, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaUser, FaHistory, FaLock, FaCamera, FaPen,
  FaUserCircle, FaCalendarAlt, FaPhone, FaEnvelope,
  FaTransgender, FaMedal, FaStar, FaClock, FaTicketAlt,
  FaFilm, FaMapMarkerAlt, FaChair, FaMoneyBillWave, FaSearch,
  FaFileInvoice, FaDownload, FaQrcode, FaKey, FaCheckCircle,
  FaExclamationTriangle, FaEye, FaEyeSlash
} from 'react-icons/fa';
import Button from '../components/common/Button';

// Import các service
import { getUserProfile, updateUserProfile, updateUserAvatar } from '../api/services/userService';
import { resetPassword } from '../api/services/authService'; // Thêm dòng này
import { getTicketHistory, downloadTicketInvoice } from '../api/services/ticketService';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  padding: 7rem 0 2rem;
`;

const ProfileCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ProfileHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #3f425a;
  display: flex;
  align-items: center;
`;

const PageTitle = styled.h1`
  color: #f3f4f6;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0;
`;

const StyledNav = styled(Nav)`
  border-bottom: 1px solid #3f425a;
  padding: 0 1rem;
  
  .nav-link {
    color: #9ca3af;
    padding: 1rem;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
    
    &:hover {
      color: #f3f4f6;
    }
    
    &.active {
      color: #F9376E;
      background: transparent;
      border-bottom: 2px solid #F9376E;
    }
  }
`;

const TabContent = styled(Tab.Content)`
  padding: 1.5rem;
`;

// Thêm các components mới vào trang ProfilePage.jsx

// Thêm styled components cho tab thông tin cá nhân
const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
`;

const AvatarImage = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #3f425a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #f3f4f6;
  overflow: hidden;
  border: 3px solid #F9376E;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const UploadButton = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background-color: #F9376E;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  border: 2px solid #2a2d3e;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const UserName = styled.h2`
  color: #f3f4f6;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const UserStatus = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    background-color: ${props => {
      switch(props.status) {
        case 'active': return 'rgba(46, 213, 115, 0.2)';
        case 'suspended': return 'rgba(255, 71, 87, 0.2)';
        default: return 'rgba(156, 163, 175, 0.2)';
      }
    }};
    color: ${props => {
      switch(props.status) {
        case 'active': return '#2ed573';
        case 'suspended': return '#ff4757';
        default: return '#9ca3af';
      }
    }};
    margin-left: 0.5rem;
  }
`;

const InfoSection = styled.div`
  margin-bottom: 2rem;
  
  small {
    text-align: left;
    display: block;
  }
`;

const SectionTitle = styled.h3`
  color: #f3f4f6;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  text-align: left;
  
  svg {
    margin-right: 0.5rem;
    color: #F9376E;
  }
`;

const InfoGroup = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
`;

const InfoLabel = styled.p`
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  text-align: left;
`;

const InfoValue = styled.p`
  color: #f3f4f6;
  font-size: 1rem;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  text-align: left;
  
  svg {
    margin-right: 0.5rem;
    color: #F9376E;
  }
`;

const FormControl = styled.input`
  background-color: #1e1e30;
  border: 1px solid #3f425a;
  color: #f3f4f6;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  width: 100%;
  text-align: left;
  
  &:focus {
    outline: none;
    border-color: #F9376E;
    box-shadow: 0 0 0 0.2rem rgba(249, 55, 110, 0.25);
  }
`;

const FormSelect = styled.select`
  background-color: #1e1e30;
  border: 1px solid #3f425a;
  color: #f3f4f6;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  width: 100%;
  text-align: left;
  cursor: pointer;
  appearance: auto; /* Quan trọng - đảm bảo dropdown hiển thị đúng */
  z-index: 5; /* Đảm bảo select hiện lên trên các phần tử khác */
  
  &:focus {
    outline: none;
    border-color: #F9376E;
    box-shadow: 0 0 0 0.2rem rgba(249, 55, 110, 0.25);
  }
  
  option {
    background-color: #1e1e30;
    color: #f3f4f6;
    text-align: left;
    padding: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const RankInfo = styled.div`
  background-color: #1e1e30;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RankBadge = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${props => {
    switch(props.rank) {
      case 1: return '#6c757d'; // New Member
      case 2: return '#a0b2c6'; // Silver
      case 3: return '#ffd700'; // Gold
      case 4: return '#ff4757'; // VIP
      default: return '#6c757d';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const RankName = styled.h4`
  color: ${props => {
    switch(props.rank) {
      case 1: return '#6c757d'; // New Member
      case 2: return '#a0b2c6'; // Silver
      case 3: return '#ffd700'; // Gold
      case 4: return '#ff4757'; // VIP
      default: return '#6c757d';
    }
  }};
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const PointInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PointValue = styled.div`
  color: #F9376E;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.5rem 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #3f425a;
  border-radius: 4px;
  margin: 0.5rem 0 1rem;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: #F9376E;
    border-radius: 4px;
  }
`;

// Thêm các styled components cho tab lịch sử mua vé
const TicketItem = styled.div`
  background-color: #1e1e30;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: rgba(249, 55, 110, 0.1);
  border-bottom: 1px solid #3f425a;
`;

const TicketTitle = styled.h5`
  color: #f3f4f6;
  font-size: 1rem;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  
  svg {
    color: #F9376E;
    margin-right: 0.5rem;
  }
`;

const TicketStatus = styled.div`
  padding: 0.2rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch(props.status) {
      case 'completed': return 'rgba(46, 213, 115, 0.2)';
      case 'cancelled': return 'rgba(255, 71, 87, 0.2)';
      case 'pending': return 'rgba(254, 202, 87, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'completed': return '#2ed573';
      case 'cancelled': return '#ff4757';
      case 'pending': return '#fedb5c';
      default: return '#9ca3af';
    }
  }};
`;

const TicketDate = styled.div`
  color: #9ca3af;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.25rem;
  }
`;

const TicketBody = styled.div`
  padding: 1rem;
`;

const TicketInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const TicketInfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  
  svg {
    color: #F9376E;
    margin-right: 0.5rem;
    min-width: 16px;
    margin-top: 3px;
  }
`;

const TicketLabel = styled.span`
  color: #9ca3af;
  font-size: 0.85rem;
  margin-right: 0.5rem;
`;

const TicketValue = styled.span`
  color: #f3f4f6;
  font-size: 0.85rem;
  font-weight: 500;
`;

const TicketFooter = styled.div`
  padding: 0.75rem 1rem;
  background-color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #3f425a;
`;

const TicketPrice = styled.div`
  display: flex;
  flex-direction: column;
`;

const TicketActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterBar = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  position: relative; /* Thêm vào */
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  position: relative; /* Thêm vào */
  z-index: 10; /* Thêm vào để đảm bảo dropdown hiển thị đúng */
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  
  svg {
    color: #3f425a;
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    color: #f3f4f6;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #b8c2cc;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  
  .pagination {
    margin-bottom: 0;
    
    .page-item {
      .page-link {
        background-color: #1e1e30;
        border-color: #3f425a;
        color: #f3f4f6;
        
        &:hover {
          background-color: #3f425a;
        }
      }
      
      &.active .page-link {
        background-color: #F9376E;
        border-color: #F9376E;
      }
      
      &.disabled .page-link {
        color: #6c757d;
        background-color: #1a1a2e;
      }
    }
  }
`;

// Thêm các styled components cho tab Bảo mật

// Styled components cho tab bảo mật
const SecuritySection = styled.div`
  background-color: #1e1e30;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const PasswordStrength = styled.div`
  margin: 1rem 0;
`;

const StrengthBar = styled.div`
  height: 6px;
  background-color: #3f425a;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.strength}%;
    background-color: ${props => {
      if (props.strength < 40) return '#ff4757';
      if (props.strength < 70) return '#feca57';
      return '#2ed573';
    }};
    border-radius: 3px;
    transition: all 0.3s ease;
  }
`;

const PasswordRequirements = styled.ul`
  list-style: none;
  padding-left: 0.5rem;
  margin: 1rem 0;
  
  li {
    color: #9ca3af;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    
    &.valid {
      color: #2ed573;
    }
    
    &.invalid {
      color: #ff4757;
    }
    
    svg {
      margin-right: 0.5rem;
    }
  }
`;

const LoginHistoryItem = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid #3f425a;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  
  &:last-child {
    border-bottom: none;
  }
`;

const LoginDevice = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    color: #F9376E;
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }
`;

const LoginInfo = styled.div`
  flex-grow: 1;
`;

const LoginMeta = styled.div`
  font-size: 0.85rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

const LoginStatus = styled.span`
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  background-color: ${props => props.current ? 'rgba(46, 213, 115, 0.2)' : 'transparent'};
  color: ${props => props.current ? '#2ed573' : '#9ca3af'};
  margin-left: auto;
`;

const ToggleSwitch = styled.div`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #3f425a;
    transition: 0.4s;
    border-radius: 34px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 4px;
      bottom: 4px;
      background-color: #f3f4f6;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
  
  input:checked + .slider {
    background-color: #F9376E;
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
`;

const NotificationOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #3f425a;
  
  &:last-child {
    border-bottom: none;
  }
`;

const OptInfo = styled.div`
  flex-grow: 1;
`;

const OptTitle = styled.div`
  color: #f3f4f6;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
`;

const OptDesc = styled.div`
  color: #9ca3af;
  font-size: 0.8rem;
`;

import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { updateUserInfo } = useAuth();
  
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Các state cho chỉnh sửa thông tin
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = React.useRef(null);
  const [successMessage, setSuccessMessage] = useState('');

  // State cho tab lịch sử mua vé
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const ticketsPerPage = 3; // Số lượng vé hiển thị trên mỗi trang

  // Hàm để tải dữ liệu vé sử dụng service
  const loadTickets = async () => {
    try {
      setIsLoadingTickets(true);
      setTicketError(null);
      
      // Gọi service để lấy lịch sử mua vé
      const ticketData = await getTicketHistory();
      
      setTickets(ticketData);
      setFilteredTickets(ticketData);
      setIsLoadingTickets(false);
      
    } catch (error) {
      setTicketError('Không thể tải lịch sử mua vé. Vui lòng thử lại sau.');
      setIsLoadingTickets(false);
    }
  };

  // Các hàm lọc và tìm kiếm vé (giữ nguyên)
  // ...

  // Tải dữ liệu vé khi chọn tab lịch sử
  const handleTabSelect = (key) => {
    if (key === 'history' && tickets.length === 0) {
      loadTickets();
    }
  };

  // Hàm xử lý khi người dùng muốn chỉnh sửa thông tin
  const handleEditClick = () => {
    setEditData({
      firstName: userData.firstName || userData.user_first_name,
      lastName: userData.lastName || userData.user_last_name,
      phoneNumber: userData.phoneNumber || userData.user_phone_number,
      dateOfBirth: userData.user_date_of_birth,
      gender: userData.user_gender
    });
    setIsEditing(true);
  };

  // Hàm xử lý khi người dùng hủy chỉnh sửa
  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  // Hàm xử lý khi người dùng thay đổi thông tin
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  // Hàm xử lý khi người dùng chọn ảnh đại diện mới
const handleAvatarChange = (e) => {
  const fileInput = e.target;
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    
    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
      fileInput.value = ''; // Reset input
      return;
    }
    
    // Kiểm tra loại file
    if (!file.type.match('image.*')) {
      setError('Vui lòng chọn tệp hình ảnh.');
      fileInput.value = ''; // Reset input
      return;
    }
    
    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setAvatarPreview(event.target.result);
      }
    };
    reader.onerror = () => {
      setError('Không thể đọc tệp. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  }
};

  // Hàm xử lý khi người dùng lưu thông tin đã chỉnh sửa - sử dụng service
  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      
      // Gọi service để cập nhật thông tin người dùng
      const updatedUserData = await updateUserProfile({
        email: userData?.email,
        firstName: editData.firstName,
        lastName: editData.lastName,
        phoneNumber: editData.phoneNumber,
        dateOfBirth: editData.dateOfBirth,
        gender: editData.gender
      });
      
      // Xử lý upload avatar nếu có
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await updateUserAvatar(avatarFile);
      }
      
      // Cập nhật userData state
      setUserData({
        ...userData,
        firstName: editData.firstName,
        lastName: editData.lastName,
        phoneNumber: editData.phoneNumber,
        user_date_of_birth: editData.dateOfBirth,
        user_gender: editData.gender,
        user_avatar: avatarUrl || userData?.user_avatar
      });
      
      // Cập nhật thông tin trong AuthContext
      updateUserInfo({
        firstName: editData.firstName,
        lastName: editData.lastName,
        // Không cần cập nhật email vì email thường không thay đổi
      });
      
      // Hiển thị thông báo thành công
      setSuccessMessage('Cập nhật thông tin thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      
    } catch (error) {
      setError('Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // State cho form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: null,
    confirmPassword: null
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState(null);

  // Kiểm tra các yêu cầu về mật khẩu
  const passwordRequirements = {
    length: passwordForm.newPassword.length >= 8
  };

 

  // Lấy text hiển thị cho độ mạnh mật khẩu
  

  // Xử lý thay đổi input cho form đổi mật khẩu
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng thay đổi input
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: null
      });
    }
    
    // Xóa thông báo thành công hoặc lỗi khi người dùng bắt đầu nhập lại
    if (changePasswordSuccess || changePasswordError) {
      setChangePasswordSuccess(false);
      setChangePasswordError(null);
    }
  };

  // Xử lý đổi mật khẩu - sử dụng service
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Kiểm tra form - bỏ phần kiểm tra currentPassword
    let formErrors = {};
    let hasError = false;
    

    
    if (!passwordForm.confirmPassword) {
      formErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
      hasError = true;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      formErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      hasError = true;
    }
    
    if (hasError) {
      setPasswordErrors(formErrors);
      return;
    }
    
    // Sử dụng resetPassword với token từ localStorage
    try {
      setChangePasswordLoading(true);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      const isStaff = localStorage.getItem('isStaff');
      if (!token) {
        throw new Error('Bạn cần đăng nhập lại để thực hiện hành động này');
      }
      
      // Chuẩn bị dữ liệu để đổi mật khẩu
      const resetPasswordData = {
        token: token,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
        isStaff: isStaff === 'true'
      };
      
      // Gọi API resetPassword
      await resetPassword(resetPasswordData);
      
      // Xử lý thành công
      setChangePasswordSuccess(true);
      setPasswordForm({
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setChangePasswordError(error.message || 'Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Xử lý chức năng ngày sinh
  const [birthDate, setBirthDate] = useState({
    day: '',
    month: '',
    year: ''
  });

  // Thêm useEffect để phân tách ngày sinh thành ngày, tháng, năm khi bắt đầu chỉnh sửa
  useEffect(() => {
    if (isEditing && editData.dateOfBirth) {
      const [year, month, day] = editData.dateOfBirth.split('-');
      setBirthDate({
        day: parseInt(day, 10).toString(),
        month: parseInt(month, 10).toString(),
        year
      });
    }
  }, [isEditing, editData.dateOfBirth]);

  // Thêm kiểm tra trong useEffect khi xử lý ngày sinh
useEffect(() => {
  if (isEditing && editData?.dateOfBirth) {
    const [year, month, day] = editData.dateOfBirth.split('-');
    setBirthDate({
      day: parseInt(day, 10).toString(),
      month: parseInt(month, 10).toString(),
      year
    });
  }
}, [isEditing, editData?.dateOfBirth]);

  // Thêm hàm xử lý thay đổi ngày sinh
  const handleBirthDateChange = (field, value) => {
    const newBirthDate = { ...birthDate, [field]: value };
    setBirthDate(newBirthDate);
    
    // Cập nhật giá trị dateOfBirth trong editData
    if (newBirthDate.day && newBirthDate.month && newBirthDate.year) {
      const formattedMonth = newBirthDate.month.padStart(2, '0');
      const formattedDay = newBirthDate.day.padStart(2, '0');
      const dateOfBirth = `${newBirthDate.year}-${formattedMonth}-${formattedDay}`;
      
      setEditData({
        ...editData,
        dateOfBirth
      });
    }
  };

  // Tạo danh sách các năm từ năm hiện tại trở về 100 năm trước
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  // Tạo danh sách các tháng (1-12)
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Tạo danh sách các ngày (1-31)
  const getDaysInMonth = (month, year) => {
    if (!month || !year) return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  };

  // Hàm hiển thị tên cấp bậc
  const getRankName = (rankId) => {
    switch(rankId) {
      case 1: return 'Thành viên mới';
      case 2: return 'Thành viên Bạc';
      case 3: return 'Thành viên Vàng';
      case 4: return 'VIP';
      default: return 'Thành viên mới';
    }
  };

  // Các helper function
  const getNextRankProgress = (rankId, points) => {
    switch(rankId) {
      case 1: return Math.min(points / 1000 * 100, 100);
      case 2: return Math.min((points - 1000) / 1000 * 100, 100);
      case 3: return Math.min((points - 2000) / 3000 * 100, 100);
      case 4: return 100;
      default: return 0;
    }
  };

  const getPointsToNextRank = (rankId, points) => {
    switch(rankId) {
      case 1: return 1000 - points;
      case 2: return 2000 - points;
      case 3: return 5000 - points;
      case 4: return 0;
      default: return 1000;
    }
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Định dạng trạng thái vé
  const getTicketStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Đã hoàn thành';
      case 'pending': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  // Kiểm tra đăng nhập và lấy thông tin người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gọi service để lấy thông tin người dùng
        const userData = await getUserProfile();
        setUserData(userData);
      } catch (err) {
        // Nếu không lấy được dữ liệu người dùng, chuyển hướng đến trang đăng nhập
        navigate('/login', { 
          state: { 
            from: '/profile',
            message: 'Vui lòng đăng nhập để xem thông tin cá nhân.'
          } 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Các hàm lọc và tìm kiếm (giữ nguyên)
  const filterTickets = (statusValue, dateValue, query) => {
    let filtered = [...tickets];
    
    // Lọc theo trạng thái
    if (statusValue !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusValue);
    }
    
    // Lọc theo thời gian
    if (dateValue !== 'all') {
      filtered = applyDateFilter(filtered, dateValue);
    }
    
    // Tìm kiếm
    if (query && query.trim() !== '') {
      filtered = filtered.filter(ticket => 
        ticket.movieName.toLowerCase().includes(query.toLowerCase()) ||
        ticket.theater.toLowerCase().includes(query.toLowerCase()) ||
        ticket.id.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredTickets(filtered);
    setCurrentPage(1); // Reset về trang đầu tiên
  };
  
  const handleFilterChange = (type, value) => {
    if (type === 'status') {
      setStatusFilter(value);
    } else if (type === 'date') {
      setDateFilter(value);
    }
    
    // Áp dụng bộ lọc
    filterTickets(type === 'status' ? value : statusFilter, type === 'date' ? value : dateFilter, searchQuery);
  };
  
  const applyDateFilter = (tickets, dateFilterValue) => {
    const now = new Date();
    let filterDate;
    
    switch (dateFilterValue) {
      case 'month':
        filterDate = new Date();
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'three-months':
        filterDate = new Date();
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate = new Date();
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return tickets;
    }
    
    return tickets.filter(ticket => new Date(ticket.date) >= filterDate);
  };
  
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterTickets(statusFilter, dateFilter, query);
  };

  // Xử lý phân trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Tính toán vé hiện tại để hiển thị
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Render UI
  if (isLoading) {
    return (
      <PageContainer>
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p style={{ color: '#b8c2cc' }} className="mt-3">Đang tải thông tin...</p>
          </div>
        </Container>
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer>
        <Container>
          <Alert variant="danger">{error}</Alert>
        </Container>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Container>
        <ProfileCard>
          <ProfileHeader>
            <PageTitle>Thông tin cá nhân</PageTitle>
          </ProfileHeader>
          
          <Tab.Container defaultActiveKey="personal" onSelect={handleTabSelect}>
            <StyledNav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="personal">
                  <FaUser className="me-2" /> Thông tin cá nhân
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="history">
                  <FaHistory className="me-2" /> Lịch sử mua vé
                </Nav.Link>
              </Nav.Item>
            </StyledNav>
            
            <TabContent>
              <Tab.Pane eventKey="personal">
  <Row>
    <Col lg={4} className="mb-4">
      <div className="text-center mb-4">
        <AvatarContainer>
          <AvatarImage>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile Preview" />
            ) : userData?.user_avatar ? (
              <img src={userData.user_avatar} alt="Profile" />
            ) : (
              <FaUserCircle />
            )}
          </AvatarImage>
          {isEditing && (
            <>
              <UploadButton 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                type="button"
              >
                <FaCamera size={16} />
              </UploadButton>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
            </>
          )}
        </AvatarContainer>
        <UserName>
          {userData?.firstName || userData?.user_first_name || ''} {userData?.lastName || userData?.user_last_name || ''}
        </UserName>
        <UserStatus status={userData?.user_status || 'inactive'}>
          Trạng thái: 
          <span className="status-badge">
            {userData?.user_status === 'active' ? 'Đang hoạt động' : 
             userData?.user_status === 'suspended' ? 'Tạm khóa' : 'Không hoạt động'}
          </span>
        </UserStatus>
      </div>

      <RankInfo>
        <RankBadge rank={userData?.rank_id || 1}>
          <FaMedal size={40} color="#fff" />
        </RankBadge>
        <RankName>
          {userData?.userRank || 'Mầm'}
        </RankName>
        
        <PointInfo>
          <InfoLabel>Điểm thưởng</InfoLabel>
          <PointValue>{(userData?.userPoint || 0).toLocaleString()}</PointValue>
        
          
          <div className="text-center mt-2">
            <InfoLabel>Tổng số vé đã mua</InfoLabel>
            <div style={{ color: '#f3f4f6', fontSize: '1.2rem' }}>
              <FaTicketAlt className="me-1" color="#F9376E" />
              {userData?.ticket_count || 0}
            </div>
          </div>
        </PointInfo>
      </RankInfo>
    </Col>
    
    <Col lg={8}>
      {!isEditing ? (
        <>
          {/* Phần hiển thị thông tin cá nhân */}
          <InfoSection>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <SectionTitle>
                <FaUser /> Thông tin cá nhân
              </SectionTitle>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleEditClick}
              >
                <FaPen className="me-1" /> Chỉnh sửa
              </Button>
            </div>
            
            <Row>
              <Col md={6}>
                <InfoGroup>
                  <InfoLabel>Họ</InfoLabel>
                  <InfoValue>
                    {userData?.firstName || userData?.user_first_name || 'Chưa cập nhật'}
                  </InfoValue>
                </InfoGroup>
              </Col>
              <Col md={6}>
                <InfoGroup>
                  <InfoLabel>Tên</InfoLabel>
                  <InfoValue>
                    {userData?.lastName || userData?.user_last_name || 'Chưa cập nhật'}
                  </InfoValue>
                </InfoGroup>
              </Col>
              <Col md={6}>
                <InfoGroup>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>
                    <FaEnvelope /> {userData?.email || 'Chưa cập nhật'}
                  </InfoValue>
                </InfoGroup>
              </Col>
              <Col md={6}>
                <InfoGroup>
                  <InfoLabel>Số điện thoại</InfoLabel>
                  <InfoValue>
                    <FaPhone /> {userData?.phoneNumber || userData?.user_phone_number || 'Chưa cập nhật'}
                  </InfoValue>
                </InfoGroup>
              </Col>
              <Col md={6}>
                <InfoGroup>
                  <InfoValue>Ngày sinh</InfoValue>
                  <InfoValue>
                    <FaCalendarAlt /> {formatDate(userData?.user_date_of_birth) || 'Chưa cập nhật'}
                  </InfoValue>
                </InfoGroup>
              </Col>
              <Col md={6}>
                <InfoGroup>
                  <InfoLabel>Giới tính</InfoLabel>
                  <InfoValue>
                    <FaTransgender /> 
                    {userData?.user_gender === 'M' ? 'Nam' : 
                     userData?.user_gender === 'F' ? 'Nữ' : 
                     userData?.user_gender === 'O' ? 'Khác' : 'Chưa cập nhật'}
                  </InfoValue>
                </InfoGroup>
              </Col>
              <Col md={6}>
                <InfoGroup>
                  <InfoLabel>Ngày tham gia</InfoLabel>
                  <InfoValue>
                    <FaClock /> {formatDateTime(userData?.user_createAt) || 'Không xác định'}
                  </InfoValue>
                </InfoGroup>
              </Col>
            </Row>
          </InfoSection>

          {/* Phần đổi mật khẩu - đã được thêm vào tab thông tin cá nhân */}
          <InfoSection>
            <SectionTitle>
              <FaKey /> Đổi mật khẩu
            </SectionTitle>
            
            {changePasswordSuccess && (
              <Alert variant="success" className="mb-3">
                <FaCheckCircle className="me-2" />
                Đổi mật khẩu thành công!
              </Alert>
            )}
            
            {changePasswordError && (
              <Alert variant="danger" className="mb-3">
                <FaExclamationTriangle className="me-2" />
                {changePasswordError}
              </Alert>
            )}
            
            <Form onSubmit={handleChangePassword}>
              <Row>
                <Col md={6}>
                  <InfoGroup>
                    <InfoLabel>Mật khẩu mới</InfoLabel>
                    <div className="position-relative">
                      <FormControl 
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        isInvalid={!!passwordErrors.newPassword}
                      />
                      <div 
                        onClick={() => setShowNewPassword(!showNewPassword)} 
                        style={{ 
                          position: 'absolute', 
                          right: '10px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          color: '#9ca3af'
                        }}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </div>
                    </div>
                    {passwordErrors.newPassword && (
                      <div className="invalid-feedback d-block">{passwordErrors.newPassword}</div>
                    )}
                  </InfoGroup>
                </Col>
                
                <Col md={6}>
                  <InfoGroup>
                    <InfoLabel>Xác nhận mật khẩu mới</InfoLabel>
                    <div className="position-relative">
                      <FormControl 
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        isInvalid={!!passwordErrors.confirmPassword}
                      />
                      <div 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        style={{ 
                          position: 'absolute', 
                          right: '10px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          color: '#9ca3af'
                        }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </div>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <div className="invalid-feedback d-block">{passwordErrors.confirmPassword}</div>
                    )}
                  </InfoGroup>
                </Col>
              </Row>
              
              {passwordForm.newPassword && (
                <div className="mb-3">

                  <PasswordRequirements>
                    <li className={passwordRequirements.length ? 'valid' : 'invalid'}>
                      {passwordRequirements.length ? <FaCheckCircle /> : <FaExclamationTriangle />}
                      Ít nhất 8 ký tự
                    </li>
                  </PasswordRequirements>
                </div>
              )}
              
              <div className="mt-3">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={changePasswordLoading}
                >
                  {changePasswordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </Button>
              </div>
            </Form>
          </InfoSection>
        </>
      ) : (
        // Form chỉnh sửa thông tin người dùng - giữ nguyên không đổi
        <InfoSection>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <SectionTitle>
              <FaPen /> Chỉnh sửa thông tin
            </SectionTitle>
          </div>
          
          <Row>
            <Col md={6}>
              <InfoGroup>
                <InfoLabel>Họ</InfoLabel>
                <FormControl
                  type="text"
                  name="firstName"
                  value={editData.firstName || ''}
                  onChange={handleInputChange}
                />
              </InfoGroup>
            </Col>
            <Col md={6}>
              <InfoGroup>
                <InfoLabel>Tên</InfoLabel>
                <FormControl
                  type="text"
                  name="lastName"
                  value={editData.lastName || ''}
                  onChange={handleInputChange}
                />
              </InfoGroup>
            </Col>
            <Col md={6}>
              <InfoGroup>
                <InfoLabel>Email</InfoLabel>
                <FormControl
                  type="email"
                  value={userData.email || ''}
                  disabled
                  style={{ opacity: 0.7 }}
                />
                <small style={{ color: '#b8c2cc' }}>Email không thể thay đổi</small>
              </InfoGroup>
            </Col>
            <Col md={6}>
              <InfoGroup>
                <InfoLabel>Số điện thoại</InfoLabel>
                <FormControl
                  type="tel"
                  name="phoneNumber"
                  value={editData.phoneNumber || ''}
                  onChange={handleInputChange}
                />
              </InfoGroup>
            </Col>
            <Col md={6}>
              <InfoGroup>
                <InfoLabel>Ngày sinh</InfoLabel>
                <Row>
                  <Col xs={4}>
                    <FormSelect
                      name="day"
                      value={birthDate.day}
                      onChange={(e) => handleBirthDateChange('day', e.target.value)}
                      className="mb-2"
                    >
                      <option value="">Ngày</option>
                      {getDaysInMonth(birthDate.month, birthDate.year).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </FormSelect>
                  </Col>
                  
                  <Col xs={4}>
                    <FormSelect
                      name="month"
                      value={birthDate.month}
                      onChange={(e) => handleBirthDateChange('month', e.target.value)}
                      className="mb-2"
                    >
                      <option value="">Tháng</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </FormSelect>
                  </Col>
                  
                  <Col xs={4}>
                    <FormSelect
                      name="year"
                      value={birthDate.year}
                      onChange={(e) => handleBirthDateChange('year', e.target.value)}
                      className="mb-2"
                    >
                      <option value="">Năm</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </FormSelect>
                  </Col>
                </Row>
              </InfoGroup>
            </Col>
            <Col md={6}>
              <InfoGroup>
                <InfoLabel>Giới tính</InfoLabel>
                <FormSelect
                  name="gender"
                  value={editData.gender || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="M">Nam</option>
                  <option value="F">Nữ</option>
                  <option value="O">Khác</option>
                </FormSelect>
              </InfoGroup>
            </Col>
          </Row>
          
          <ButtonGroup className="mt-3">
            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              Hủy
            </Button>
          </ButtonGroup>
        </InfoSection>
      )}
      {successMessage && (
        <Alert 
          variant="success" 
          className="m-3" 
          style={{
            backgroundColor: 'rgba(46, 213, 115, 0.2)',
            color: '#2ed573',
            border: 'none'
          }}
        >
          <FaCheckCircle className="me-2" />
          {successMessage}
        </Alert>
      )}
    </Col>
  </Row>
</Tab.Pane>
              
              <Tab.Pane eventKey="history">
                <SectionTitle>
                  <FaHistory /> Lịch sử mua vé
                </SectionTitle>
                
                {isLoadingTickets ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p style={{ color: '#b8c2cc' }} className="mt-2">Đang tải lịch sử mua vé...</p>
                  </div>
                ) : ticketError ? (
                  <Alert variant="danger">{ticketError}</Alert>
                ) : (
                  <>
                    <FilterBar>
                      <FilterGroup>
                        <FormSelect 
                          style={{ maxWidth: '150px' }}
                          value={statusFilter} 
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                          <option value="all">Tất cả</option>
                          <option value="completed">Đã hoàn thành</option>
                          <option value="pending">Đang xử lý</option>
                          <option value="cancelled">Đã hủy</option>
                        </FormSelect>
                        
                        <FormSelect 
                          style={{ maxWidth: '150px' }}
                          value={dateFilter} 
                          onChange={(e) => handleFilterChange('date', e.target.value)}
                        >
                          <option value="all">Mọi thời gian</option>
                          <option value="month">1 tháng qua</option>
                          <option value="three-months">3 tháng qua</option>
                          <option value="year">1 năm qua</option>
                        </FormSelect>
                      </FilterGroup>
                      
                      <FormControl
                        type="text"
                        placeholder="Tìm kiếm vé..."
                        style={{ maxWidth: '300px' }}
                        value={searchQuery}
                        onChange={handleSearch}
                        prefix={<FaSearch />}
                      />
                    </FilterBar>
                  
                    {filteredTickets.length === 0 ? (
                      <EmptyState>
                        <FaTicketAlt />
                        <h4>Không tìm thấy vé nào</h4>
                        <p style={{ color: '#b8c2cc' }}>Bạn chưa mua vé hoặc không có vé nào phù hợp với bộ lọc.</p>
                      </EmptyState>
                    ) : (
                      <>
                        {currentTickets.map((ticket) => (
                          <TicketItem key={ticket.id}>
                            <TicketHeader>
                              <TicketTitle>
                                <FaFilm /> {ticket.movieName}
                              </TicketTitle>
                              <TicketStatus status={ticket.status}>
                                {getTicketStatusText(ticket.status)}
                              </TicketStatus>
                            </TicketHeader>
                            
                            <TicketBody>
                              <TicketDate>
                                <FaCalendarAlt size={12} /> 
                                Đặt vé lúc: {formatDateTime(ticket.bookingDate)}
                              </TicketDate>
                              
                              <TicketInfo className="mt-2">
                                <TicketInfoItem>
                                  <FaMapMarkerAlt />
                                  <div>
                                    <TicketLabel>Rạp chiếu:</TicketLabel>
                                    <TicketValue>{ticket.theater}</TicketValue>
                                  </div>
                                </TicketInfoItem>
                                
                                <TicketInfoItem>
                                  <FaCalendarAlt />
                                  <div>
                                    <TicketLabel>Ngày chiếu:</TicketLabel>
                                    <TicketValue>{formatDate(ticket.date)}</TicketValue>
                                  </div>
                                </TicketInfoItem>
                                
                                <TicketInfoItem>
                                  <FaClock />
                                  <div>
                                    <TicketLabel>Giờ chiếu:</TicketLabel>
                                    <TicketValue>{ticket.time}</TicketValue>
                                  </div>
                                </TicketInfoItem>
                                
                                <TicketInfoItem>
                                  <FaChair />
                                  <div>
                                    <TicketLabel>Ghế:</TicketLabel>
                                    <TicketValue>{ticket.seats.join(', ')}</TicketValue>
                                  </div>
                                </TicketInfoItem>
                                
                                <TicketInfoItem>
                                  <FaFileInvoice />
                                  <div>
                                    <TicketLabel>Mã vé:</TicketLabel>
                                    <TicketValue>{ticket.id}</TicketValue>
                                  </div>
                                </TicketInfoItem>
                                
                                <TicketInfoItem>
                                  <FaMoneyBillWave />
                                  <div>
                                    <TicketLabel>Phương thức thanh toán:</TicketLabel>
                                    <TicketValue>{ticket.paymentMethod}</TicketValue>
                                  </div>
                                </TicketInfoItem>
                              </TicketInfo>
                            </TicketBody>
                            
                            <TicketFooter>
                              <TicketPrice>
                                <TicketLabel>Tổng tiền</TicketLabel>
                                <TicketValue style={{ color: '#F9376E', fontSize: '1rem' }}>
                                  {(ticket.price || 0).toLocaleString()}đ
                                </TicketValue>
                              </TicketPrice>
                              
                              <TicketActions>
                                {ticket.status === 'completed' && (
                                  <>
                                    <Button variant="outline-secondary" size="sm">
                                      <FaDownload size={12} className="me-1" /> Hóa đơn
                                    </Button>
                                    <Button variant="primary" size="sm">
                                      <FaQrcode size={12} className="me-1" /> Mã QR
                                    </Button>
                                  </>
                                )}
                              </TicketActions>
                            </TicketFooter>
                          </TicketItem>
                        ))}
                        
                        {/* Phân trang */}
                        <PaginationContainer>
                          <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                &laquo;
                              </button>
                            </li>
                            
                            {Array.from({ length: Math.ceil(filteredTickets.length / ticketsPerPage) }).map((_, i) => (
                              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <button 
                                  className="page-link" 
                                  onClick={() => paginate(i + 1)}
                                >
                                  {i + 1}
                                </button>
                              </li>
                            ))}
                            
                            <li className={`page-item ${currentPage === Math.ceil(filteredTickets.length / ticketsPerPage) ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(filteredTickets.length / ticketsPerPage)}
                              >
                                &raquo;
                              </button>
                            </li>
                          </ul>
                        </PaginationContainer>
                      </>
                    )}
                  </>
                )}
              </Tab.Pane>
            </TabContent>
          </Tab.Container>
        </ProfileCard>
      </Container>
    </PageContainer>
  );
};

export default ProfilePage;

