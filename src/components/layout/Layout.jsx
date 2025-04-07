import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styled from 'styled-components';

// Điều chỉnh MainContent với các media queries
const MainContent = styled.main`
  background: linear-gradient(to bottom, rgb(48, 53, 87), rgb(42, 57, 60), transparent 50%),
              linear-gradient(to top, rgb(48, 53, 87), rgb(42, 57, 60), transparent 50%);
  color: #f3f4f6;
  min-height: calc(100vh - 150px);
  padding-top: 120px;
  padding-bottom: 2rem;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
  
  /* Điều chỉnh padding cho màn hình vừa */
  @media (max-width: 991px) {
    padding-top: 100px;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Điều chỉnh padding cho màn hình nhỏ */
  @media (max-width: 768px) {
    padding-top: 80px;
    min-height: calc(100vh - 120px);
  }
  
  /* Điều chỉnh padding cho màn hình rất nhỏ */
  @media (max-width: 576px) {
    padding-top: 70px;
    padding-bottom: 1rem;
    min-height: calc(100vh - 100px);
  }
`;

// Thêm container giới hạn chiều rộng tối đa cho nội dung
const ContentContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  
  /* Thêm padding bên cho màn hình nhỏ */
  @media (max-width: 1460px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Tăng padding bên cho màn hình rất nhỏ */
  @media (max-width: 576px) {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
`;

// Thêm ScrollToTop component để đảm bảo trang mới luôn bắt đầu từ đầu
const ScrollToTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 1px;
  width: 1px;
  opacity: 0;
`;

function Layout({ children }) {
  const location = useLocation();
  const topRef = useRef(null);

  useEffect(() => {
    // Cuộn về đầu trang khi chuyển trang
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'auto' });
    }
    
    // Thêm xử lý cho màn hình di động - ẩn địa chỉ URL khi cuộn xuống
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <>
      <ScrollToTop ref={topRef} aria-hidden="true" />
      <Header />
      <MainContent>
        <ContentContainer>
          {children}
        </ContentContainer>
      </MainContent>
      <Footer />
    </>
  );
}

export default Layout;