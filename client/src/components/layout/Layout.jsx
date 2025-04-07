import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styled from 'styled-components';

const MainContent = styled.main`
   background: linear-gradient(to bottom,rgb(48, 53, 87),rgb(42, 57, 60), transparent 50%),linear-gradient(to top,rgb(48, 53, 87),rgb(42, 57, 60), transparent 50%);
     
  color: #f3f4f6;
  min-height: calc(100vh - 150px); 
  padding-top: 120px; 
  padding-bottom: 2rem;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
  color: #f3f4f6;
  min-height: calc(100vh - 150px); 
  padding-top: 120px; 
  padding-bottom: 2rem;
`;

function Layout({ children }) {
  const location = useLocation();
  
  const topRef = useRef(null);

useEffect(() => {
  if (topRef.current) {
    topRef.current.scrollIntoView();
  }
}, [location.pathname]);
  
  return (
    <>
    <div ref={topRef}></div>
      <Header />
      <MainContent>
        {children}
      </MainContent>
      <Footer />
    </>
  );
}

export default Layout;