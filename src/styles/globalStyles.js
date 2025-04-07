import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Reset CSS */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
 
  
  body {
    height: 100%;
    font-family: 'Roboto', sans-serif;
    color: #f3f4f6;
    background-color: #0f0f1a;
    overflow-y: auto; /* Cho phép cuộn trên body */
    overscroll-behavior: none; /* Ngăn overscroll trên các trình duyệt hiện đại */
    -webkit-overflow-scrolling: touch; /* Cho iOS scrolling mượt */
    
  }
  
  /* Container chính */
  #root {
    min-height: 100%;
    background-color: #0f0f1a;
  }
  
  /* Tùy chỉnh scrollbar cho toàn bộ ứng dụng */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #1e1e30;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #3f425a;
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #F9376E;
  }
  
  /* Hỗ trợ Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #3f425a #1e1e30;
  }
`;

export default GlobalStyles;