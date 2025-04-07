import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaDownload, FaQrcode, FaEnvelope, FaCheck } from 'react-icons/fa';
import Button from '../components/common/Button';
import { QRCodeSVG as QRCode } from "qrcode.react";

const PageTitle = styled.h1`
  font-weight: 700;
  margin-bottom: 1.5rem;
`;

const StepIndicator = styled.div`
  display: flex;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  flex: 1;
  text-align: center;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 14px;
    right: 0;
    width: calc(100% - 30px);
    height: 2px;
    background-color: ${props => props.completed ? '#F9376E' : '#3f425a'};
    z-index: 1;
  }
`;

const StepNumber = styled.div`
  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 50%;
  background-color: ${props => props.completed ? '#F9376E' : '#3f425a'};
  color: #fff;
  margin: 0 auto 8px;
  font-weight: 600;
  position: relative;
  z-index: 2;
`;

const StepLabel = styled.div`
  color: ${props => props.completed ? '#F9376E' : '#9ca3af'};
  font-size: 0.9rem;
  font-weight: ${props => props.completed ? '600' : '400'};
`;

const SuccessMessage = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const CheckCircle = styled.div`
  width: 80px;
  height: 80px;
  background-color: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    color: #10b981;
    font-size: 2.5rem;
  }
`;

const TicketCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  position: relative;
`;

const TicketHeader = styled(Card.Header)`
  background-color: #3f425a;
  color: #f3f4f6;
  font-weight: 600;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TicketBody = styled(Card.Body)`
  padding: 1.5rem;
`;

const TicketFooter = styled(Card.Footer)`
  background-color: rgba(63, 66, 90, 0.5);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
`;

const MovieTitle = styled.h3`
  color: #f3f4f6;
  margin-bottom: 1rem;
`;

const TicketInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  flex: 1;
  min-width: 120px;
`;

const InfoLabel = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #F9376E;
  }
`;

const InfoValue = styled.div`
  color: #f3f4f6;
  font-weight: 500;
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  width: fit-content;
  margin: 0 auto;
`;

const BookingReference = styled.div`
  margin-top: 0.5rem;
  font-weight: 600;
  font-family: monospace;
  color: black;
  font-size: 0.9rem;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const ThankYouPage = () => {
  const navigate = useNavigate();
  const [ticketDetails, setTicketDetails] = useState(null);
  const [bookingReference, setBookingReference] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get ticket details from sessionStorage
    const storedTicketDetails = sessionStorage.getItem('ticketDetails');
    const storedBookingReference = sessionStorage.getItem('bookingReference');
    
    if (!storedTicketDetails || !storedBookingReference) {
      // If no booking details, redirect to home
      navigate('/');
      return;
    }
    
    setTicketDetails(JSON.parse(storedTicketDetails));
    setBookingReference(storedBookingReference);
    setLoading(false);
  }, [navigate]);
  
  const handleDownloadTicket = () => {
    // In a real application, this would trigger a PDF download
    alert('Ticket download would start here.');
  };
  
  const handleEmailTicket = () => {
    // In a real application, this would open an email modal
    alert('Email ticket functionality would open here.');
  };
  
  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <PageTitle>Booking Confirmation</PageTitle>
          
          <StepIndicator>
            <Step completed>
              <StepNumber completed>1</StepNumber>
              <StepLabel completed>Seats</StepLabel>
            </Step>
            <Step completed>
              <StepNumber completed>2</StepNumber>
              <StepLabel completed>Payment</StepLabel>
            </Step>
            <Step completed>
              <StepNumber completed>3</StepNumber>
              <StepLabel completed>Confirmation</StepLabel>
            </Step>
          </StepIndicator>
        </Col>
      </Row>
      
      <SuccessMessage>
        <CheckCircle>
          <FaCheck />
        </CheckCircle>
        <h2>Thank You for Your Purchase!</h2>
        <p>Your tickets have been booked successfully. You can find your ticket details below.</p>
      </SuccessMessage>
      
      <Row>
        <Col lg={8} className="mx-auto">
          <TicketCard>
            <TicketHeader>
              <span>E-Ticket</span>
              <FaTicketAlt />
            </TicketHeader>
            
            <TicketBody>
              <MovieTitle>{ticketDetails.movie}</MovieTitle>
              
              <TicketInfo>
                <InfoItem>
                  <InfoLabel>
                    <FaMapMarkerAlt />
                    Theater
                  </InfoLabel>
                  <InfoValue>{ticketDetails.theater}</InfoValue>
                </InfoItem>
                
                <InfoItem>
                  <InfoLabel>
                    <FaCalendarAlt />
                    Date & Time
                  </InfoLabel>
                  <InfoValue>{new Date(ticketDetails.showtime).toLocaleString()}</InfoValue>
                </InfoItem>
                
                <InfoItem>
                  <InfoLabel>
                    <FaTicketAlt />
                    Seats
                  </InfoLabel>
                  <InfoValue>{ticketDetails.seats}</InfoValue>
                </InfoItem>
              </TicketInfo>
              
              <QRCodeContainer>
                <QRCode value={bookingReference} size={150} />
                <BookingReference>{bookingReference}</BookingReference>
              </QRCodeContainer>
            </TicketBody>
            
            <TicketFooter>
              <div>Total Paid: <strong>${ticketDetails.total.toFixed(2)}</strong></div>
              <div>
                <FaQrcode className="me-2" />
                <span>Show this QR code at the cinema entrance</span>
              </div>
            </TicketFooter>
          </TicketCard>
          
          <ButtonRow>
            <Button 
              variant="primary"
              icon={<FaDownload />}
              onClick={handleDownloadTicket}
            >
              Download Ticket
            </Button>
            
            <Button 
              variant="outline"
              icon={<FaEnvelope />}
              onClick={handleEmailTicket}
            >
              Email Ticket
            </Button>
          </ButtonRow>
          
          <div className="text-center mt-4">
            <Button 
              variant="text"
              onClick={() => navigate('/')}
              style={{ color: '#f3f4f6' }}
            >
              Return to Home
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ThankYouPage;