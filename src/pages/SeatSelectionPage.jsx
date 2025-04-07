import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import { FaClock, FaTicketAlt, FaInfoCircle } from 'react-icons/fa';

// Fix imports to match your actual folder structure
import Card from '../components/common/Card';  // Adjust path if needed
import Button from '../components/common/Button';  // Adjust path if needed

// Replace PageTitle with a styled component directly
const PageTitle = styled.h1`
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #f3f4f6;
`;

// Inline Loading component if it doesn't exist
const Loading = ({ fullPage, text = "Loading..." }) => (
  <div className={`text-center py-5 ${fullPage ? 'vh-100 d-flex align-items-center justify-content-center' : ''}`}>
    <div className="spinner-border" role="status" style={{ color: '#F9376E' }}>
      <span className="visually-hidden">{text}</span>
    </div>
    <div className="mt-2" style={{ color: '#9ca3af' }}>{text}</div>
  </div>
);

// Import API services
import { getShowtimeById } from '../api/services/showtimeService';
import { getTheaterById } from '../api/services/theaterService';
import { getMovieById } from '../api/services/movieService';

// Import booking components
import SeatingChart from '../components/booking/SeatingChart';
import ReservationTimer from '../components/booking/ReservationTimer';

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
    background-color: ${props => props.active || props.completed ? '#F9376E' : '#3f425a'};
    z-index: 1;
  }
`;

const StepNumber = styled.div`
  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 50%;
  background-color: ${props => props.completed ? '#F9376E' : props.active ? '#2a2d3e' : '#3f425a'};
  color: #fff;
  margin: 0 auto 8px;
  font-weight: 600;
  position: relative;
  z-index: 2;
  border: ${props => props.active ? '2px solid #F9376E' : 'none'};
`;

const StepLabel = styled.div`
  color: ${props => props.active ? '#F9376E' : '#9ca3af'};
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
`;

const ScreenArea = styled.div`
  height: 8px;
  background: linear-gradient(to right, rgba(255, 77, 77, 0.5), rgba(249, 55, 110, 0.5));
  border-radius: 50%;
  margin-bottom: 2rem;
  position: relative;
  box-shadow: 0 3px 15px rgba(249, 55, 110, 0.3);
  
  &::before {
    content: 'Screen';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    color: #9ca3af;
    font-size: 0.9rem;
  }
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:not(:last-child) {
    border-bottom: 1px solid #3f425a;
    padding-bottom: 0.5rem;
  }
`;

const Label = styled.span`
  color: #9ca3af;
`;

const Value = styled.span`
  color: #f3f4f6;
  font-weight: 500;
`;

const Total = styled(SummaryItem)`
  margin-top: 1rem;
  font-weight: 700;
  font-size: 1.1rem;
  
  ${Label} {
    color: #f3f4f6;
  }
  
  ${Value} {
    color: #F9376E;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.color};
`;

const TimerWrapper = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${props => props.expiring ? '#ef4444' : '#f3f4f6'};
  font-weight: 600;
  
  svg {
    color: ${props => props.expiring ? '#ef4444' : '#F9376E'};
  }
`;

// Main component
const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState(null);
  const [theater, setTheater] = useState(null);
  const [movie, setMovie] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes = 600 seconds
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const showtimeData = await getShowtimeById(showtimeId);
        setShowtime(showtimeData);
        
        const theaterData = await getTheaterById(showtimeData.theaterId);
        setTheater(theaterData);
        
        const movieData = await getMovieById(showtimeData.movieId);
        setMovie(movieData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [showtimeId]);
  
  // Handle seat selection
  const handleSeatSelect = (seat) => {
    // Check if seat is already selected
    if (selectedSeats.some(s => s.id === seat.id)) {
      // Remove seat
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      // Add seat (max 10)
      if (selectedSeats.length < 10) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        alert('You can only select up to 10 seats');
      }
    }
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };
  
  // Handle reservation timeout
  const handleTimeout = () => {
    alert('Your reservation time has expired. Returning to movie selection.');
    navigate('/movies');
  };
  
  // Continue to payment
  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    
    // Save selected seats to sessionStorage or state management
    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    sessionStorage.setItem('showtimeId', showtimeId);
    
    navigate(`/booking/${showtimeId}/payment`);
  };
  
  if (loading) {
    return (
      <Container>
        <Loading fullPage />
      </Container>
    );
  }
  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <PageTitle>Select Your Seats</PageTitle>
          
          <StepIndicator>
            <Step active>
              <StepNumber active>1</StepNumber>
              <StepLabel active>Seats</StepLabel>
            </Step>
            <Step>
              <StepNumber>2</StepNumber>
              <StepLabel>Payment</StepLabel>
            </Step>
            <Step>
              <StepNumber>3</StepNumber>
              <StepLabel>Confirmation</StepLabel>
            </Step>
          </StepIndicator>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <TimerWrapper expiring={timeRemaining < 120}>
            <FaClock />
            <ReservationTimer 
              initialTime={600} 
              onTimeout={handleTimeout}
              onTimeUpdate={setTimeRemaining}
            />
            <span>remaining to complete your booking</span>
          </TimerWrapper>
          
          <LegendContainer>
            <LegendItem>
              <LegendColor color="#3f425a" />
              <span>Available</span>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#F9376E" />
              <span>Selected</span>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#64748b" />
              <span>Taken</span>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#9333ea" />
              <span>VIP</span>
            </LegendItem>
          </LegendContainer>
          
          <ScreenArea />
          
          <SeatingChart 
            showtimeId={showtimeId}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
          />
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>Booking Summary</span>
                <FaTicketAlt />
              </div>
            </Card.Header>
            <Card.Body>
              {movie && (
                <SummaryItem>
                  <Label>Movie</Label>
                  <Value>{movie.title}</Value>
                </SummaryItem>
              )}
              
              {theater && (
                <SummaryItem>
                  <Label>Theater</Label>
                  <Value>{theater.name}</Value>
                </SummaryItem>
              )}
              
              {showtime && (
                <SummaryItem>
                  <Label>Date & Time</Label>
                  <Value>{new Date(showtime.startTime).toLocaleString()}</Value>
                </SummaryItem>
              )}
              
              <SummaryItem>
                <Label>Selected Seats</Label>
                <Value>
                  {selectedSeats.length > 0 
                    ? selectedSeats.map(seat => seat.row + seat.number).join(', ') 
                    : 'None'}
                </Value>
              </SummaryItem>
              
              <Total>
                <Label>Total</Label>
                <Value>${calculateTotal().toFixed(2)}</Value>
              </Total>
              
              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleContinue}
                  disabled={selectedSeats.length === 0}
                >
                  Continue to Payment
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
              </div>
              
              <div className="mt-3 d-flex align-items-center">
                <FaInfoCircle className="me-2" style={{ color: '#F9376E' }} />
                <small style={{ color: '#9ca3af' }}>
                  Seats are reserved for 10 minutes. Complete payment before time expires.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SeatSelectionPage;