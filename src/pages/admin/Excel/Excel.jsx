import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { exportRevenueAllTheaters, exportRevenueByTheater, getAllTheaters } from '../../../api/services/excelService';
import styled from 'styled-components';
import { FaFileExcel, FaCalendarAlt, FaBuilding, FaChartBar } from 'react-icons/fa';

const PageContainer = styled(Container)`
  padding: 2rem;
  max-width: 1000px;
`;

const StyledCard = styled(Card)`
  background-color: #2A2D3E;
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  background-color: rgba(25, 28, 41, 0.5);
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const StyledDatePickerContainer = styled.div`
  position: relative;
  
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .calendar-icon {
    position: absolute;
    right: 15px;
    top: 12px;
    color: #6c757d;
    pointer-events: none;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  background-color: #202332;
  color: #fff;
  border: 1px solid #3F4254;
  border-radius: 8px;
  padding: 10px 15px;
  width: 100%;
  transition: all 0.2s;
  
  &:focus {
    background-color: #202332;
    color: #fff;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
  }
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 1.8rem;
`;

const StyledFormLabel = styled(Form.Label)`
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #6366f1;
  }
`;

const StyledSelect = styled(Form.Select)`
  background-color: #202332;
  color: #fff;
  border: 1px solid #3F4254;
  border-radius: 8px;
  padding: 10px 15px;
  transition: all 0.2s;
  
  &:focus {
    background-color: #202332;
    color: #fff;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
  }
`;

const ExportButton = styled(Button)`
  background-color: #6366f1;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover {
    background-color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
`;

export default function Excel() {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('all');
  const [reportPeriod, setReportPeriod] = useState('Month');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const theatersList = await getAllTheaters();
        setTheaters(theatersList);
      } catch (error) {
        console.error('Failed to fetch theaters:', error);
      }
    };

    fetchTheaters();
  }, []);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      let response;
      
      if (selectedTheater === 'all') {
        response = await exportRevenueAllTheaters(
          reportPeriod,
          startDate.toISOString(),
          endDate.toISOString()
        );
      } else {
        response = await exportRevenueByTheater(
          reportPeriod,
          startDate.toISOString(),
          endDate.toISOString(),
          parseInt(selectedTheater)
        );
      }
      
      // Log the entire response headers for debugging
      console.log('Full response headers:', response.headers);
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      console.log('Content-Disposition raw:', contentDisposition);
      
      let filename = 'revenue-report.xlsx'; // Default fallback
      
      if (contentDisposition) {
        // More precise regex pattern that matches the exact format from your header
        const filenameRegex = /filename=(.*?)(?=;|$)/i;
        const matches = filenameRegex.exec(contentDisposition);
        
        if (matches && matches[1]) {
          // Clean up the filename (remove quotes if present)
          filename = matches[1].trim().replace(/^"|"$/g, '');
          console.log('Extracted filename:', filename);
        }
      }
      
      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      // Create a new URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Debug information
      console.log('Download filename set to:', filename);
      console.log('Download URL:', url);
      
      // Append to the document, click, and then remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <StyledCard className="text-light">
        <CardHeader>
          <h2 className="mb-0 d-flex align-items-center justify-content-center">
            <FaFileExcel style={{ marginRight: '12px', color: '#1D6F42' }} size={28} />
            Export Revenue Report
          </h2>
        </CardHeader>
        
        <CardBody>
          <Form>
            <Row className="mb-4">
              <Col md={6}>
                <StyledFormGroup>
                  <StyledFormLabel>
                    <FaBuilding /> Theater
                  </StyledFormLabel>
                  <StyledSelect 
                    value={selectedTheater}
                    onChange={(e) => setSelectedTheater(e.target.value)}
                  >
                    <option value="all">All Theaters</option>
                    {theaters.map(theater => (
                      <option key={theater.theaterId} value={theater.theaterId}>
                        {theater.theaterName}
                      </option>
                    ))}
                  </StyledSelect>
                </StyledFormGroup>
              </Col>
              
              <Col md={6}>
                <StyledFormGroup>
                  <StyledFormLabel>
                    <FaChartBar /> Report Period
                  </StyledFormLabel>
                  <StyledSelect 
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                  >
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                    <option value="Quarter">Quarter</option>
                    <option value="Year">Year</option>
                  </StyledSelect>
                </StyledFormGroup>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <StyledFormGroup>
                  <StyledFormLabel>
                    <FaCalendarAlt /> Start Date
                  </StyledFormLabel>
                  <StyledDatePickerContainer>
                    <StyledDatePicker
                      selected={startDate}
                      onChange={date => setStartDate(date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                    />
                    <div className="calendar-icon">
                      <FaCalendarAlt />
                    </div>
                  </StyledDatePickerContainer>
                </StyledFormGroup>
              </Col>
              
              <Col md={6}>
                <StyledFormGroup>
                  <StyledFormLabel>
                    <FaCalendarAlt /> End Date
                  </StyledFormLabel>
                  <StyledDatePickerContainer>
                    <StyledDatePicker
                      selected={endDate}
                      onChange={date => setEndDate(date)}
                      className="form-control"
                      minDate={startDate}
                      dateFormat="yyyy-MM-dd"
                    />
                    <div className="calendar-icon">
                      <FaCalendarAlt />
                    </div>
                  </StyledDatePickerContainer>
                </StyledFormGroup>
              </Col>
            </Row>
            
            <ButtonContainer>
              <ExportButton 
                onClick={handleExport} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FaFileExcel />
                    <span>Export to Excel</span>
                  </>
                )}
              </ExportButton>
            </ButtonContainer>
          </Form>
        </CardBody>
      </StyledCard>
    </PageContainer>
  );
}
