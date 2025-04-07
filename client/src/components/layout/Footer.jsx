import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const FooterWrapper = styled.footer`
  background: #1b1b2f;
  color: #f3f4f6;
  padding: 3rem 0 2rem;
  position: relative;
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #F9376E;
  margin-bottom: 1rem;
`;

const FooterSection = styled.div`
  margin-bottom: 2rem;
  height: 100%;
`;

const FooterTitle = styled.h5`
  color: #f3f4f6;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
  
  &:after {
    content: '';
    position: absolute;
    width: 300px;
    height: 2px;
    left: 0;
    bottom: 0;
    background: #F9376E;
  }
`;

const FooterLink = styled(Link)`
  color: #9ca3af;
  text-decoration: none;
  display: block;
  margin-bottom: 0.8rem;
  transition: color 0.3s ease;
  text-align: left; /* Đảm bảo căn lề trái */
  
  &:hover {
    color: #F9376E;
  }
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2a2d3e;
  color: #f3f4f6;
  margin-right: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #F9376E;
    transform: translateY(-3px);
    color: #fff;
  }
`;

const ContactItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const ContactIcon = styled.div`
  margin-right: 1rem;
  color: #F9376E;
  font-size: 1.2rem;
`;

const ContactText = styled.div`
  color: #9ca3af;
  text-align: left; /* Đảm bảo căn lề trái */
`;

const NewsletterForm = styled(Form)`
  margin-top: 1.5rem;
`;

const NewsletterInput = styled(Form.Control)`
  background-color: #2a2d3e;
  border: 1px solid #3f425a;
  color: #f3f4f6;
  padding: 0.75rem;
  
  &::placeholder {
    color: #9ca3af;
    opacity: 0.7;
  }
  
  &:focus {
    background-color: #2a2d3e;
    box-shadow: 0 0 0 0.25rem rgba(249, 55, 110, 0.25);
    border-color: #F9376E;
    color: #f3f4f6;
  }
`;

const SubmitButton = styled(Button)`
  background: #F9376E;
  border: none;
  font-weight: 500;
  width: 100%;
  padding: 0.75rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    background: #e62e61;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: #9ca3af;
  font-size: 0.9rem;
`;

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic
    console.log('Newsletter subscription for:', email);
    setEmail('');
  };
  
  return (
    <FooterWrapper>
      <Container>
        <Row className="gy-4">
          <Col lg={3} md={6}>
            <FooterSection>
              <Logo>CineVerse</Logo>
              <p className="mb-4">Trải nghiệm điện ảnh đỉnh cao với công nghệ hiện đại và dịch vụ chất lượng.</p>
              <div className="social-links">
                <SocialLink href="#" aria-label="Facebook">
                  <FaFacebookF />
                </SocialLink>
                <SocialLink href="#" aria-label="Twitter">
                  <FaTwitter />
                </SocialLink>
                <SocialLink href="#" aria-label="Instagram">
                  <FaInstagram />
                </SocialLink>
                <SocialLink href="#" aria-label="YouTube">
                  <FaYoutube />
                </SocialLink>
              </div>
            </FooterSection>
          </Col>
          <Col lg={3} md={6}>
            <FooterSection>
              <FooterTitle>Links</FooterTitle>
              <div style={{ textAlign: 'left' }}>
                <FooterLink to="/">Trang chủ</FooterLink>
                <FooterLink to="/movies">Phim</FooterLink>
                <FooterLink to="/theaters">Rạp chiếu</FooterLink>
                <FooterLink to="/promotions">Khuyến mãi</FooterLink>
                <FooterLink to="/about">Về chúng tôi</FooterLink>
              </div>
            </FooterSection>
          </Col>
          <Col lg={3} md={6}>
            <FooterSection>
              <FooterTitle>Contact</FooterTitle>
              <div style={{ textAlign: 'left' }}>
                <ContactItem>
                  <ContactIcon>
                    <FaMapMarkerAlt />
                  </ContactIcon>
                  <ContactText>
                    123 Nguyễn Du, Quận 1
                    <br />
                    Thành phố Hồ Chí Minh, Việt Nam
                  </ContactText>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>
                    <FaPhone />
                  </ContactIcon>
                  <ContactText>+84 28 1234 5678</ContactText>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>
                    <FaEnvelope />
                  </ContactIcon>
                  <ContactText>contact@cineverse.vn</ContactText>
                </ContactItem>
              </div>
            </FooterSection>
          </Col>
          <Col lg={3} md={6}>
            <FooterSection>
              <FooterTitle>Newsletter</FooterTitle>
              <p>Nhận thông tin về phim mới, sự kiện và ưu đãi đặc biệt từ CineVerse.</p>
              <NewsletterForm onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <NewsletterInput
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <SubmitButton type="submit">
                  <FaEnvelope className="me-2" />
                  Đăng ký
                </SubmitButton>
              </NewsletterForm>
            </FooterSection>
          </Col>
        </Row>
        <Copyright>
          © {new Date().getFullYear()} CineVerse. Tất cả các quyền được bảo lưu.
        </Copyright>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;