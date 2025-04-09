import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  @media (max-width: 992px) {
    padding: 6rem 0 2rem;
  }
  
  @media (max-width: 768px) {
    padding: 5rem 0 1.5rem;
  }
  
  @media (max-width: 576px) {
    padding: 4.5rem 0 1rem;
  }
`;

const ProfileCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    border-radius: 8px;
  }
`;

const ProfileHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #3f425a;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  color: #f3f4f6;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.2rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 0 0.75rem;
    
    .nav-link {
      padding: 0.75rem;
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0 0.5rem;
    
    .nav-link {
      padding: 0.6rem 0.5rem;
      font-size: 0.85rem;
    }
  }
`;

const TabContent = styled(Tab.Content)`
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
  }
`;

// Thêm các components mới vào trang ProfilePage.jsx

// Thêm styled components cho tab thông tin cá nhân
const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 576px) {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
  }
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
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    border-width: 2px;
  }
  
  @media (max-width: 576px) {
    font-size: 2rem;
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
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
  
  @media (max-width: 576px) {
    width: 28px;
    height: 28px;
  }
`;

const UserName = styled.h2`
  color: #f3f4f6;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }
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
    switch (props.status) {
      case 'active': return 'rgba(46, 213, 115, 0.2)';
      case 'suspended': return 'rgba(255, 71, 87, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
    color: ${props => {
    switch (props.status) {
      case 'active': return '#2ed573';
      case 'suspended': return '#ff4757';
      default: return '#9ca3af';
    }
  }};
    margin-left: 0.5rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 1.25rem;
    
    .status-badge {
      padding: 0.2rem 0.6rem;
    }
  }
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
    margin-bottom: 1rem;
    
    .status-badge {
      padding: 0.15rem 0.5rem;
    }
  }
`;

const InfoSection = styled.div`
  margin-bottom: 2rem;
  
  small {
    text-align: left;
    display: block;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.25rem;
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
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const InfoGroup = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
  
  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1rem;
  }
`;

const InfoLabel = styled.p`
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.3rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }
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
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    
    svg {
      margin-right: 0.4rem;
      font-size: 0.9em;
    }
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
  
  @media (max-width: 768px) {
    padding: 0.45rem 0.7rem;
    font-size: 0.95rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.4rem 0.65rem;
    font-size: 0.9rem;
    border-radius: 0.2rem;
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
  
  @media (max-width: 768px) {
    padding: 0.45rem 0.7rem;
    font-size: 0.95rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.4rem 0.65rem;
    font-size: 0.9rem;
    border-radius: 0.2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.4rem;
  }
`;

const RankInfo = styled.div`
  background-color: #1e1e30;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
    border-radius: 6px;
  }
`;

const RankBadge = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${props => {
    const points = props.points || 0;
    if (points >= 15000) return '#e84118'; // Lá - Đỏ cam
    if (points >= 10000) return '#fbc531'; // Chồi - Vàng
    if (points >= 5000) return '#fbc531'; // Mầm - Xanh lá
    return 'gray'; // chưa có hạng - màu xám
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 576px) {
    width: 60px;
    height: 60px;
    margin-bottom: 0.6rem;
    
    svg {
      font-size: 1.8rem !important;
    }
  }
`;

const RankName = styled.h4`
  color: ${props => {
    const points = props.points || 0;
    if (points >= 15000) return '#e84118'; // Lá - Đỏ cam
    if (points >= 10000) return '#fbc531'; // Chồi - Vàng
    if (points >= 5000) return '#4cd137'; // Mầm - Xanh lá
    return 'gray'; // Chưa có hạng - màu xám
  }};
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }
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
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin: 0.4rem 0;
  }
  
  @media (max-width: 576px) {
    font-size: 1.1rem;
    margin: 0.3rem 0;
  }
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
  
  @media (max-width: 768px) {
    height: 6px;
    margin: 0.4rem 0 0.8rem;
  }
  
  @media (max-width: 576px) {
    height: 5px;
    margin: 0.3rem 0 0.6rem;
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
  
  @media (max-width: 768px) {
    margin-bottom: 0.75rem;
    border-radius: 6px;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 0.6rem;
  }
`;

const TicketHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: rgba(249, 55, 110, 0.1);
  border-bottom: 1px solid #3f425a;
  
  @media (max-width: 768px) {
    padding: 0.65rem 0.9rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.6rem 0.8rem;
  }
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
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    
    svg {
      margin-right: 0.4rem;
    }
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    
    svg {
      margin-right: 0.3rem;
    }
  }
`;

const TicketStatus = styled.div`
  padding: 0.2rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return 'rgba(46, 213, 115, 0.2)';
      case 'cancelled': return 'rgba(255, 71, 87, 0.2)';
      case 'pending': return 'rgba(254, 202, 87, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#2ed573';
      case 'cancelled': return '#ff4757';
      case 'pending': return '#fedb5c';
      default: return '#9ca3af';
    }
  }};
  
  @media (max-width: 768px) {
    padding: 0.15rem 0.65rem;
    font-size: 0.7rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.1rem 0.5rem;
    font-size: 0.65rem;
  }
`;

const TicketDate = styled.div`
  color: #9ca3af;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.25rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.7rem;
    
    svg {
      margin-right: 0.2rem;
    }
  }
`;

const TicketBody = styled.div`
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.9rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.8rem;
  }
`;

const TicketInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.4rem;
    margin-bottom: 0.9rem;
  }
  
  @media (max-width: 576px) {
    gap: 0.35rem;
    margin-bottom: 0.8rem;
  }
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
  
  @media (max-width: 768px) {
    svg {
      margin-right: 0.4rem;
      min-width: 14px;
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 576px) {
    svg {
      margin-right: 0.3rem;
      min-width: 12px;
      font-size: 0.8rem;
      margin-top: 2px;
    }
  }
`;

const TicketLabel = styled.span`
  color: #9ca3af;
  font-size: 0.85rem;
  margin-right: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-right: 0.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    margin-right: 0.3rem;
  }
`;

const TicketValue = styled.span`
  color: #f3f4f6;
  font-size: 0.85rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
  }
`;

const TicketFooter = styled.div`
  padding: 0.75rem 1rem;
  background-color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #3f425a;
  
  @media (max-width: 768px) {
    padding: 0.65rem 0.9rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.6rem 0.8rem;
    flex-direction: column;
    gap: 0.6rem;
    align-items: flex-start;
  }
`;

const TicketPrice = styled.div`
  display: flex;
  flex-direction: column;
`;

const TicketActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    width: 100%;
    gap: 0.4rem;
    
    button {
      flex: 1;
    }
  }
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
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 576px) {
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  position: relative; /* Thêm vào */
  z-index: 10; /* Thêm vào để đảm bảo dropdown hiển thị đúng */
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  
  @media (max-width: 576px) {
    gap: 0.3rem;
    
    select {
      flex: 1;
    }
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
  
  @media (max-width: 768px) {
    padding: 2.5rem 0;
    
    svg {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    
    h4 {
      font-size: 1.2rem;
      margin-bottom: 0.4rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 2rem 0;
    
    svg {
      font-size: 2rem;
      margin-bottom: 0.6rem;
    }
    
    h4 {
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
    }
    
    p {
      font-size: 0.85rem;
    }
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
  
  @media (max-width: 768px) {
    margin-top: 1.25rem;
    
    .pagination {
      .page-item {
        .page-link {
          padding: 0.4rem 0.75rem;
          font-size: 0.9rem;
        }
      }
    }
  }
  
  @media (max-width: 576px) {
    margin-top: 1rem;
    
    .pagination {
      .page-item {
        .page-link {
          padding: 0.3rem 0.6rem;
          font-size: 0.8rem;
        }
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
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 8px;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }
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
  
  @media (max-width: 768px) {
    margin: 0.9rem 0;
    
    li {
      font-size: 0.8rem;
      margin-bottom: 0.2rem;
      
      svg {
        margin-right: 0.4rem;
      }
    }
  }
  
  @media (max-width: 576px) {
    margin: 0.8rem 0;
    
    li {
      font-size: 0.75rem;
      margin-bottom: 0.15rem;
      
      svg {
        margin-right: 0.3rem;
        font-size: 0.9em;
      }
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

function ProfilePage() {
  // Thêm isLoggedIn và isCheckingAuth từ AuthContext
  const { user, updateUserInfo, isLoggedIn, isCheckingAuth } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Các state cho chỉnh sửa thông tin
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
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

  const ticketsPerPage = 3;

  // Kiểm tra đăng nhập và lấy thông tin người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Chỉ tiếp tục nếu đã xác định trạng thái đăng nhập
        if (!isCheckingAuth) {
          if (isLoggedIn && user) {
            // Map dữ liệu từ AuthContext vào userData để phù hợp với format hiện tại
            const mappedUserData = {
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              phoneNumber: user.phoneNumber || '',
              user_date_of_birth: user.dateOfBirth || '',
              user_gender: user.gender || '',
              user_avatar: user.avatar || '',
              user_createAt: user.userCreateAt || '',
              userPoint: user.userPoint || 0,
              rankName: user.rankName || '',
              rankDiscount: user.rankDiscount || 0
            };

            setUserData(mappedUserData);
          } else if (isLoggedIn) {
            // Nếu đã đăng nhập nhưng chưa có thông tin user đầy đủ, lấy từ API
            const userData = await getUserProfile();
            setUserData(userData);
          } else {
            // Nếu chưa đăng nhập, chuyển hướng về trang login
            navigate('/login', {
              state: {
                from: '/profile',
                message: 'Vui lòng đăng nhập để xem thông tin cá nhân.'
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Chỉ chuyển hướng khi có lỗi API, không phải vì user null
        if (!isCheckingAuth && isLoggedIn) {
          navigate('/login', {
            state: {
              from: '/profile',
              message: 'Vui lòng đăng nhập để xem thông tin cá nhân.'
            }
          });
        }
      } finally {
        if (!isCheckingAuth) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user, navigate, isLoggedIn, isCheckingAuth]);

  // Tải dữ liệu vé khi chọn tab lịch sử
  const handleTabSelect = (key) => {
    if (key === 'history' && tickets.length === 0) {
      loadTickets();
    }
  };

  // Hàm để tải dữ liệu vé
  const loadTickets = async () => {
    try {
      setIsLoadingTickets(true);
      setTicketError(null);

      const ticketData = await getTicketHistory();

      // Chuyển đổi dữ liệu từ API sang định dạng phù hợp với UI
      const formattedTickets = ticketData.map(ticket => ({
        id: ticket.orderId.toString(),
        movieName: ticket.movieName,
        theater: `${ticket.theaterName} - ${ticket.roomName}`,
        date: ticket.showtimeStartAt,
        time: new Date(ticket.showtimeStartAt).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        seats: ticket.bookedChairs.map(chair => chair.chairName),
        price: ticket.totalPrice,
        status: 'completed', // API không trả về trạng thái
        bookingDate: ticket.orderCreateAt,
        paymentMethod: 'VNPay', // API không trả về phương thức thanh toán
        combos: ticket.bookedCombos ? ticket.bookedCombos.map(combo => ({
          name: combo.comboName,
          quantity: combo.quantity,
          price: combo.comboPrice
        })) : []
      }));

      // Sắp xếp vé mới nhất lên trên cùng
      formattedTickets.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

      setTickets(formattedTickets);
      setFilteredTickets(formattedTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTicketError('Không thể tải lịch sử mua vé. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Cải tiến hàm lọc vé để tối ưu hiệu suất
  const filterTickets = useCallback((statusValue, dateValue, query) => {
    if (!tickets || tickets.length === 0) return;

    let filtered = [...tickets];

    // Lọc theo trạng thái
    if (statusValue !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusValue);
    }

    // Lọc theo thời gian
    if (dateValue !== 'all') {
      const now = new Date();
      let filterDate;

      switch (dateValue) {
        case 'month':
          filterDate = new Date(now);
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'three-months':
          filterDate = new Date(now);
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate = new Date(now);
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        filtered = filtered.filter(ticket => new Date(ticket.date) >= filterDate);
      }
    }

    // Tìm kiếm
    if (query && query.trim() !== '') {
      const normalizedQuery = query.toLowerCase().trim();
      filtered = filtered.filter(ticket =>
        ticket.movieName.toLowerCase().includes(normalizedQuery) ||
        ticket.theater.toLowerCase().includes(normalizedQuery) ||
        ticket.id.toLowerCase().includes(normalizedQuery)
      );
    }

    setFilteredTickets(filtered);
    setCurrentPage(1); // Reset về trang đầu tiên
  }, [tickets]);

  // Kết hợp các state filter với useEffect để cải thiện hiệu suất
  useEffect(() => {
    filterTickets(statusFilter, dateFilter, searchQuery);
  }, [statusFilter, dateFilter, searchQuery, filterTickets]);

  // Các hàm xử lý thay đổi filter
  const handleFilterChange = (type, value) => {
    if (type === 'status') {
      setStatusFilter(value);
    } else if (type === 'date') {
      setDateFilter(value);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Xử lý phân trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Tính toán vé hiện tại để hiển thị
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Cải tiến hàm xử lý chỉnh sửa thông tin
  const handleEditClick = () => {
    setEditData({
      firstName: userData.firstName || userData.user_first_name || '',
      lastName: userData.lastName || userData.user_last_name || '',
      phoneNumber: userData.phoneNumber || userData.user_phone_number || '',
      dateOfBirth: userData.user_date_of_birth || '',
      gender: userData.user_gender || ''
    });
    setIsEditing(true);

    // Phân tách ngày sinh thành ngày, tháng, năm
    if (userData.user_date_of_birth) {
      const [year, month, day] = userData.user_date_of_birth.split('-');
      setBirthDate({
        day: parseInt(day, 10).toString(),
        month: parseInt(month, 10).toString(),
        year
      });
    } else {
      setBirthDate({ day: '', month: '', year: '' });
    }
  };

  // Hàm xử lý khi người dùng thay đổi thông tin
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý chức năng ngày sinh
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });

  // Tối ưu hàm xử lý thay đổi ngày sinh
  const handleBirthDateChange = (field, value) => {
    const newBirthDate = { ...birthDate, [field]: value };
    setBirthDate(newBirthDate);

    // Cập nhật giá trị dateOfBirth trong editData nếu đủ thông tin
    if (newBirthDate.day && newBirthDate.month && newBirthDate.year) {
      const formattedMonth = newBirthDate.month.padStart(2, '0');
      const formattedDay = newBirthDate.day.padStart(2, '0');
      const dateOfBirth = `${newBirthDate.year}-${formattedMonth}-${formattedDay}`;

      setEditData(prev => ({
        ...prev,
        dateOfBirth
      }));
    }
  };

  // Hàm xử lý khi người dùng hủy chỉnh sửa
  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  // Hàm xử lý khi người dùng chọn ảnh đại diện mới
  const handleAvatarChange = (e) => {
    const fileInput = e.target;
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;

    const file = fileInput.files[0];

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
      fileInput.value = '';
      return;
    }

    // Kiểm tra loại file
    if (!file.type.match('image.*')) {
      setError('Vui lòng chọn tệp hình ảnh.');
      fileInput.value = '';
      return;
    }

    setAvatarFile(file);

    // Đọc và hiển thị preview
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
  };

  // Hàm xử lý khi người dùng lưu thông tin đã chỉnh sửa
  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);

      // Cập nhật thông tin người dùng
      await updateUserProfile({
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
      setUserData(prev => ({
        ...prev,
        firstName: editData.firstName,
        lastName: editData.lastName,
        phoneNumber: editData.phoneNumber,
        user_date_of_birth: editData.dateOfBirth,
        user_gender: editData.gender,
        user_avatar: avatarUrl || prev?.user_avatar
      }));

      // Cập nhật thông tin trong AuthContext
      updateUserInfo({
        firstName: editData.firstName,
        lastName: editData.lastName,
        phoneNumber: editData.phoneNumber,
        dateOfBirth: editData.dateOfBirth,
        gender: editData.gender,
        avatar: avatarUrl || userData?.user_avatar
      });

      // Hiển thị thông báo thành công
      setSuccessMessage('Cập nhật thông tin thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.');
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

  // Xử lý thay đổi input cho form đổi mật khẩu
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Xóa lỗi khi người dùng thay đổi input
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Xóa thông báo thành công hoặc lỗi khi người dùng bắt đầu nhập lại
    if (changePasswordSuccess || changePasswordError) {
      setChangePasswordSuccess(false);
      setChangePasswordError(null);
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Kiểm tra form
    let formErrors = {};
    let hasError = false;

    if (!passwordForm.newPassword) {
      formErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      hasError = true;
    } else if (passwordForm.newPassword.length < 8) {
      formErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
      hasError = true;
    }

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

    try {
      setChangePasswordLoading(true);

      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      const isStaff = localStorage.getItem('isStaff');
      if (!token) {
        throw new Error('Bạn cần đăng nhập lại để thực hiện hành động này');
      }

      // Gọi API resetPassword
      await resetPassword({
        token,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
        isStaff: isStaff === 'true'
      });

      // Xử lý thành công
      setChangePasswordSuccess(true);
      setPasswordForm({
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setChangePasswordError(error.message || 'Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Helper functions
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

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return '';
    }
  };

  // Định dạng trạng thái vé
  const getTicketStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Đã hoàn thành';
      case 'pending': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  // Loading state - cập nhật để hiển thị đúng trạng thái
  if (isCheckingAuth || isLoading) {
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

  // Error state
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
              {/* Tab Thông tin cá nhân */}
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
                      <RankBadge points={userData?.userPoint || 0}>
                        <FaMedal size={window.innerWidth <= 576 ? 30 : 40} color="#fff" />
                      </RankBadge>
                      <RankName points={userData?.userPoint || 0}>
                        {(() => {
                          const points = userData?.userPoint || 0;
                          if (points >= 15000) return 'Lá';
                          if (points >= 10000) return 'Chồi';
                          if (points >= 5000) return 'Mầm';
                          return 'Chưa có hạng';
                        })()}
                      </RankName>

                      <PointInfo>
                        <InfoLabel>Điểm thưởng</InfoLabel>
                        <PointValue>{(userData?.userPoint || 0).toLocaleString()}</PointValue>
                      </PointInfo>
                    </RankInfo>
                  </Col>

                  <Col lg={8}>
                    {!isEditing ? (
                      <>
                        {/* Hiển thị thông tin người dùng */}
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
                                <InfoLabel>Ngày sinh</InfoLabel>
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
                                  {userData?.user_gender === 'M' || userData?.user_gender === 'Nam' ? 'Nam' :
                                    userData?.user_gender === 'F' || userData?.user_gender === 'Nữ' ? 'Nữ' :
                                      userData?.user_gender === 'O' || userData?.user_gender === 'Khác' ? 'Khác' : 'Chưa cập nhật'}
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

                        {/* Phần đổi mật khẩu */}
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
                                {ticket.combos && ticket.combos.length > 0 && (
                                  <TicketInfoItem>
                                    <FaFileInvoice />
                                    <div>
                                      <TicketLabel>Combo:</TicketLabel>
                                      <TicketValue>
                                        {ticket.combos.map(combo =>
                                          `${combo.name} x${combo.quantity}`
                                        ).join(', ')}
                                      </TicketValue>
                                    </div>
                                  </TicketInfoItem>
                                )}
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