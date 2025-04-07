import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Dropdown, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaSignOutAlt, FaUserCog } from "react-icons/fa";
import styled from "styled-components";
import SearchBar from "../forms/SearchBar";
import Button from "../common/Button";
import { BiBorderRadius } from "react-icons/bi";
import { useAuth } from '../../contexts/AuthContext';





// Navbar với màu nền tùy chỉnh
const StyledNavbar = styled(Navbar)`
  background-color: #1a1a2e; /* Màu tối hơn giống màu footer */
`;

// Thêm styled component mới cho logo text
const LogoText = styled.span`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(to right, #FF4D4D, #F9376E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  padding: 0.5rem 0;
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



const Header = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Thêm hàm navigateToProfile
  const navigateToProfile = () => {
    navigate('/profile'); // Điều hướng đến trang profile
  };

  const [language, setLanguage] = useState("EN");
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy chữ cái đầu từ tên người dùng làm avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

 

  const toggleLanguage = (langCode) => {
    setLanguage(langCode);
  };

  // Hàm xử lý khi người dùng thay đổi chuỗi tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
              padding: "0 5rem"
            }}
          >
            <div className="d-flex w-100 align-items-center justify-content-between">
              {/* Logo text thay vì image */}
              <Navbar.Brand as={Link} to="/" style={{ marginRight: "2.5vw" }}>
                <LogoText>CineVerse</LogoText>
              </Navbar.Brand>

              {/* Các phần còn lại giữ nguyên */}
              <div className="d-flex gap-2">
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
              </div>

              {/* Thêm khối flex-grow để đẩy các thành phần còn lại sang phải */}
              <div className="flex-grow-1"></div>

              {/* Đăng nhập, Tìm kiếm & Ngôn ngữ - căn phải */}
              <div className="d-flex align-items-center gap-2">
                {/* Tìm kiếm - đặt sát nút đăng nhập */}
                <div className="d-none d-md-flex" style={{ width: "250px", }}>
                  <SearchBar
                    placeholder="Tìm kiếm phim..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ height: "36px", fontSize: "0.85rem" }}
                  />
                </div>

                {/* Hiển thị nút đăng nhập hoặc dropdown người dùng tùy thuộc vào trạng thái đăng nhập */}
                {isLoggedIn && user ? (
                  <Dropdown align="end">
                    {/* Sử dụng CustomToggle thay vì Dropdown.Toggle */}
                    <Dropdown.Toggle as={CustomToggle} id="user-dropdown">
                      <UserAvatar>
                        {getInitials(user.lastName || user.firstName)}
                      </UserAvatar>
                      <span>{user.firstName || 'Người dùng'}</span>
                      <CaretIcon>▼</CaretIcon> {/* Thêm mũi tên riêng */}
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
                ) : (
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
                )}

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

            
          </Container>
        </StyledNavbar>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;
