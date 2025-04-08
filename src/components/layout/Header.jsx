import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Dropdown, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaSignOutAlt, FaUserCog, FaBars, FaTimes } from "react-icons/fa";
import styled from "styled-components";
import SearchBar from "../forms/SearchBar";
import Button from "../common/Button";
import { BiBorderRadius } from "react-icons/bi";
import { useAuth } from '../../contexts/AuthContext';

// Cập nhật StyledNavbar để đảm bảo Header luôn hiển thị đẹp ở mọi kích thước màn hình
const StyledNavbar = styled(Navbar)`
  background-color: #1a1a2e;
  padding: 0.5rem 1rem;

  @media (max-width: 991px) {
    padding: 0.5rem 0.75rem;
  }

  @media (max-width: 576px) {
    padding: 0.4rem 0.5rem;
  }
`;

// Cập nhật LogoText để điều chỉnh kích thước phù hợp trên màn hình nhỏ
const LogoText = styled.span`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(to right, #FF4D4D, #F9376E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 576px) {
    font-size: 1.2rem;
  }
`;

// Thêm styled component mới cho avatar người dùng
const UserAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #F9376E;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  margin-right: 8px;
`;

const UserDropdownToggle = styled.div`
  display: flex;
  align-items: center;
  color: white;
  background-color: transparent;
  border-radius: 50px;
  padding: 0.3rem 0.7rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255,255,255,0.2);
  }
  
  /* Thêm style để xử lý caret dropdown */
  .dropdown-toggle::after {
    display: none !important; /* Ẩn mũi tên mặc định */
  }
`;

// Thêm icon mũi tên riêng
const CaretIcon = styled.span`
  margin-left: 8px;
  font-size: 0.7rem;
  display: inline-flex;
`;

// Thêm custom dropdown toggle component để loại bỏ hoàn toàn mũi tên mặc định
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <UserDropdownToggle
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </UserDropdownToggle>
));

const UserDropdownMenu = styled(Dropdown.Menu)`
  background-color: #2a2d3e;
  border: 1px solid #3f425a;
  margin-top: 0.5rem;
  padding: 0;
  min-width: 200px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  
  .dropdown-item {
    color: #f3f4f6;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #3f425a;
    display: flex;
    align-items: center;
    
    &:last-child {
      border-bottom: none;
    }
    
    svg {
      margin-right: 10px;
      color: #F9376E;
    }
    
    &:hover {
      background-color: #3f425a;
    }
  }
  
  .user-info {
    padding: 1rem;
    text-align: center;
    border-bottom: 1px solid #3f425a;
    
    .user-name {
      font-weight: 600;
      color: #f3f4f6;
      margin-bottom: 0.25rem;
    }
    
    .user-email {
      font-size: 0.8rem;
      color: #9ca3af;
    }
  }
`;

const HeaderWrapper = styled.header`
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: #1a1a2e;
`;

const HeaderContainer = styled.div`
  max-width: 1200px; // Giống với PageContainer
  margin: 0 auto;
  padding: 0 1rem;
`;

// Thêm styled component cho menu di động
const MobileMenuButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 576px) {
    font-size: 1.3rem;
  }
`;

// Thêm styled component cho container di động
const MobileMenuContainer = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #1a1a2e;
  z-index: 1100;
  flex-direction: column;
  padding: 1.5rem;

  &.open {
    display: flex;
  }

  .mobile-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .mobile-menu-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .mobile-menu-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .mobile-menu-user {
    margin-top: auto;
    border-top: 1px solid #3f425a;
    padding-top: 1rem;
  }
`;

// Thêm media queries cho các thành phần trong header
const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  width: 250px;
  
  @media (max-width: 1200px) {
    width: 200px;
  }
  
  @media (max-width: 991px) {
    display: none;
  }
`;

// Cập nhật Header component
const Header = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("EN");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Các hàm xử lý hiện tại
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };
  
  const navigateToProfile = () => {
    navigate('/profile');
    setMobileMenuOpen(false);
  };
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };
  
  const toggleLanguage = (langCode) => {
    setLanguage(langCode);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Xử lý đóng/mở menu di động
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Đóng menu khi chuyển trang
  const navigateAndCloseMenu = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };
  
  return (
    <HeaderWrapper>
      <HeaderContainer>
        <StyledNavbar expand="lg" variant="dark" className="w-100" fixed="top">
          <Container
            fluid
            className="flex-column"
            style={{
              maxWidth: "calc(100% - 100px)",
              margin: "0 auto",
              padding: "0 1rem" // Giảm padding cho màn hình nhỏ
            }}
          >
            <div className="d-flex w-100 align-items-center justify-content-between">
              {/* Logo text */}
              <Navbar.Brand as={Link} to="/" style={{ marginRight: "1rem" }}>
                <LogoText>CineVerse</LogoText>
              </Navbar.Brand>

              {/* Nút menu di động */}
              <MobileMenuButton onClick={toggleMobileMenu} className="d-lg-none">
                <FaBars />
              </MobileMenuButton>

              {/* Các nút đặt vé/bắp nước - ẩn trên màn hình nhỏ */}
              <ActionButtonsContainer className="d-none d-lg-flex">
                <Button
                  variant="primary"
                  className="fw-bold"
                  style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", textDecoration: "none" }}
                  onClick={() => navigate('/movies')}
                  as={Link}
                  to="/movies"
                >
                  ĐẶT VÉ NGAY
                </Button>
                <Button
                  variant="secondary"
                  className="fw-bold"
                  style={{ backgroundColor: "#800080", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                >
                  ĐẶT BẮP NƯỚC
                </Button>
              </ActionButtonsContainer>

              {/* Khoảng trống đẩy các phần tử sang phải */}
              <div className="d-none d-lg-block flex-grow-1"></div>

              {/* Tìm kiếm và đăng nhập */}
              <div className="d-flex align-items-center gap-2">
                {/* Tìm kiếm - ẩn trên màn hình nhỏ */}
                <SearchContainer className="d-none d-lg-block">
                  <SearchBar
                    placeholder="Tìm kiếm phim..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ height: "36px", fontSize: "0.85rem" }}
                  />
                </SearchContainer>

                {/* Dropdown user - hiển thị trên màn hình lớn */}
                {isLoggedIn && user ? (
                  <div className="d-none d-lg-block">
                    <Dropdown align="end">
                      <Dropdown.Toggle as={CustomToggle} id="user-dropdown">
                        <UserAvatar>
                          {getInitials(user.lastName || user.firstName)}
                        </UserAvatar>
                        <span className="d-none d-md-inline">{user.firstName || 'Người dùng'}</span>
                        <CaretIcon>▼</CaretIcon>
                      </Dropdown.Toggle>

                      <UserDropdownMenu>
                        <div className="user-info">
                          <div className="user-name">{user.firstName} {user.lastName}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                        <Dropdown.Item onClick={navigateToProfile}>
                          <FaUserCog /> Thông tin cá nhân
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>
                          <FaSignOutAlt /> Đăng xuất
                        </Dropdown.Item>
                      </UserDropdownMenu>
                    </Dropdown>
                  </div>
                ) : (
                  <div className="d-none d-lg-block">
                    <Button
                      variant="text"
                      as={Link}
                      to="/login"
                      icon={<FaUserCircle size={15} className="me-1" />}
                      style={{
                        color: "white",
                        backgroundColor: "transparent",
                        borderRadius: "50px",
                        fontSize: "1rem",
                        padding: "0.3rem 0.7rem",
                        textDecoration: "none"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      Đăng nhập
                    </Button>
                  </div>
                )}

                {/* Dropdown ngôn ngữ - hiển thị trên màn hình lớn */}
                <div className="d-none d-lg-block">
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      as={Button}
                      variant="text"
                      id="language-dropdown"
                      style={{
                        color: "white",
                        backgroundColor: "transparent",
                        borderRadius: "50px",
                        fontSize: "0.85rem",
                        padding: "0.3rem 0.7rem",
                        border: "none",
                        boxShadow: "none"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      {language === "EN" ? "🇺🇸 EN" : "🇻🇳 VN"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ fontSize: "0.85rem" }}>
                      <Dropdown.Item onClick={() => toggleLanguage("VN")}>
                        🇻🇳 Tiếng Việt
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => toggleLanguage("EN")}>
                        🇺🇸 English
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </div>
          </Container>
        </StyledNavbar>
      </HeaderContainer>
      
      {/* Menu di động */}
      <MobileMenuContainer className={mobileMenuOpen ? 'open' : ''}>
        <div className="mobile-menu-header">
          <LogoText>CineVerse</LogoText>
          <button 
            onClick={toggleMobileMenu} 
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem' }}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="mobile-menu-search">
          <SearchBar
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ height: "40px", width: "100%" }}
          />
        </div>
        
        <div className="mobile-menu-body">
          <div className="mobile-menu-actions">
            <Button
              variant="primary"
              className="fw-bold"
              style={{ width: "100%", padding: "0.7rem" }}
              onClick={() => navigateAndCloseMenu('/movies')}
            >
              ĐẶT VÉ NGAY
            </Button>
            <Button
              variant="secondary"
              className="fw-bold"
              style={{ backgroundColor: "#800080", width: "100%", padding: "0.7rem" }}
            >
              ĐẶT BẮP NƯỚC
            </Button>
          </div>
          
          <div className="mobile-menu-language">
            <div style={{ color: 'white', marginBottom: '0.5rem' }}>Ngôn ngữ</div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant={language === "VN" ? "primary" : "outline-secondary"}
                onClick={() => toggleLanguage("VN")}
                style={{ padding: '0.5rem 1rem' }}
              >
                🇻🇳 Tiếng Việt
              </Button>
              <Button
                variant={language === "EN" ? "primary" : "outline-secondary"}
                onClick={() => toggleLanguage("EN")}
                style={{ padding: '0.5rem 1rem' }}
              >
                🇺🇸 English
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mobile-menu-user">
          {isLoggedIn && user ? (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: 'white', 
                marginBottom: '1rem' 
              }}>
                <UserAvatar style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                  {getInitials(user.lastName || user.firstName)}
                </UserAvatar>
                <div style={{ marginLeft: '1rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{user.firstName} {user.lastName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{user.email}</div>
                </div>
              </div>
              <Button
                variant="outline-secondary"
                style={{ marginBottom: '0.5rem', width: '100%' }}
                onClick={navigateToProfile}
              >
                <FaUserCog className="me-2" /> Thông tin cá nhân
              </Button>
              <Button
                variant="danger"
                style={{ width: '100%' }}
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-2" /> Đăng xuất
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              style={{ width: '100%' }}
              as={Link}
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUserCircle className="me-2" /> Đăng nhập
            </Button>
          )}
        </div>
      </MobileMenuContainer>
    </HeaderWrapper>
  );
};

export default Header;
