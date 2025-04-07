import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import styled from 'styled-components';
import { FaLanguage } from 'react-icons/fa';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import MovieCard from '../components/movie/MovieCard';
import Seat from '../components/seating/Seat';
import Input from '../components/forms/Input';
import SearchBar from '../components/forms/SearchBar';
import Select from '../components/forms/Select';
import { useTranslation, getTranslatedMovie } from '../utils/translations';

const ShowcaseContainer = styled(Container)`
  background-color: #1a1c26;
  color: #f3f4f6;
  min-height: 100vh;
  padding: 2rem 1rem;
`;

const Heading = styled.h1`
  background: linear-gradient(to right, #FF4D4D, #F9376E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  font-weight: bold;
`;

const ComponentSection = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: #f9fafb;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ComponentItem = styled.div`
  background-color: #2A2D3E;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const ComponentTitle = styled.h4`
  color: #F9376E;
  margin-bottom: 1rem;
`;

const StyledTabs = styled(Tabs)`
  margin-bottom: 2rem;
  
  .nav-link {
    color: #9ca3af;
    background-color: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    
    &:hover {
      color: #f9fafb;
      border-bottom: 2px solid rgba(249, 55, 110, 0.3);
    }
    
    &.active {
      color: #F9376E;
      background-color: transparent;
      border-bottom: 2px solid #F9376E;
    }
  }
`;

const ColorPalette = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ColorSwatch = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  span {
    color: white;
    text-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5);
    font-size: 0.8rem;
    font-weight: 500;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const ControlButton = styled.button`
  background-color: #2A2D3E;
  color: #f3f4f6;
  border: 1px solid #3f425a;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #3f425a;
  }
`;

const ComponentShowcase = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTabKey, setSelectedTabKey] = useState('colors');
  const [language, setLanguage] = useState('en');
  
  const { t } = useTranslation(language);
  
  const sampleMovie = {
    id: 1,
    title: "The Dark Knight",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    releaseDate: "2008-07-18",
    genres: ["Action", "Crime", "Drama"],
    duration: 152
  };

  // Get translated movie data
  const translatedMovie = getTranslatedMovie(sampleMovie, language);

  const colorPalette = [
    { color: "#1a1c26", name: t('showcase.background') },
    { color: "#2A2D3E", name: t('showcase.cardBg') },
    { color: "#F9376E", name: t('showcase.primary') },
    { color: "#FF4D4D", name: t('showcase.secondary') },
    { color: "#f3f4f6", name: t('showcase.textLight') },
    { color: "#9ca3af", name: t('showcase.textMuted') }
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  return (
    <ShowcaseContainer fluid>
      <ControlsContainer>
        <ControlButton onClick={toggleLanguage}>
          <FaLanguage size={18} />
          {t('common.language')}
        </ControlButton>
      </ControlsContainer>
      
      <Heading>{t('showcase.title')}</Heading>
      
      <StyledTabs
        id="component-showcase-tabs"
        activeKey={selectedTabKey}
        onSelect={(k) => setSelectedTabKey(k)}
        className="mb-4"
      >
        <Tab eventKey="colors" title={t('showcase.colorPalette')}>
          <ComponentSection>
            <SectionTitle>{t('showcase.colorPalette')}</SectionTitle>
            <ColorPalette>
              {colorPalette.map(item => (
                <ColorSwatch key={item.name} style={{ backgroundColor: item.color }}>
                  <span>{item.name}</span>
                  <span>{item.color}</span>
                </ColorSwatch>
              ))}
            </ColorPalette>
          </ComponentSection>
        </Tab>
        
        <Tab eventKey="common" title={t('showcase.commonUI')}>
          <ComponentSection>
            <SectionTitle>{t('showcase.buttons')}</SectionTitle>
            <Row>
              <Col md={3}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.primaryButton')}</ComponentTitle>
                  <Button>{t('showcase.bookNow')}</Button>
                </ComponentItem>
              </Col>
              <Col md={3}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.secondaryButton')}</ComponentTitle>
                  <Button variant="secondary">{t('showcase.viewDetails')}</Button>
                </ComponentItem>
              </Col>
              <Col md={3}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.outlineButton')}</ComponentTitle>
                  <Button variant="outline">{t('showcase.cancel')}</Button>
                </ComponentItem>
              </Col>
              <Col md={3}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.smallButton')}</ComponentTitle>
                  <Button size="small">{t('showcase.buyTicket')}</Button>
                </ComponentItem>
              </Col>
            </Row>
          </ComponentSection>

          <ComponentSection>
            <SectionTitle>{t('showcase.cardsLoading')}</SectionTitle>
            <Row>
              <Col md={6}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.card')}</ComponentTitle>
                  <Card title={t('showcase.informationCard')}>
                    <p>{t('showcase.sampleCardContent')}</p>
                  </Card>
                </ComponentItem>
              </Col>
              <Col md={6}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.loadingIndicator')}</ComponentTitle>
                  <Loading />
                </ComponentItem>
              </Col>
            </Row>
          </ComponentSection>

          <ComponentSection>
            <SectionTitle>{t('showcase.modal')}</SectionTitle>
            <Row>
              <Col>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.modalDialog')}</ComponentTitle>
                  <Button onClick={() => setShowModal(true)}>{t('showcase.openModal')}</Button>
                  <Modal 
                    show={showModal} 
                    onClose={() => setShowModal(false)} 
                    title={t('showcase.sampleModal')}
                  >
                    <p>{t('showcase.sampleModalContent')}</p>
                    <Button onClick={() => setShowModal(false)}>{t('showcase.close')}</Button>
                  </Modal>
                </ComponentItem>
              </Col>
            </Row>
          </ComponentSection>
        </Tab>

        <Tab eventKey="forms" title={t('showcase.formComponents')}>
          <ComponentSection>
            <SectionTitle>{t('showcase.formElements')}</SectionTitle>
            <Row>
              <Col md={6}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.textInput')}</ComponentTitle>
                  <Input 
                    label={t('showcase.fullName')}
                    placeholder={t('showcase.enterFullName')}
                  />
                </ComponentItem>
              </Col>
              <Col md={6}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.selectComponent')}</ComponentTitle>
                  <Select
                    label={t('showcase.theaterLocation')}
                    options={[
                      { value: 'hcm', label: t('showcase.hoChiMinhCity') },
                      { value: 'hn', label: t('showcase.hanoi') },
                      { value: 'dn', label: t('showcase.daNang') }
                    ]}
                  />
                </ComponentItem>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.searchBar')}</ComponentTitle>
                  <SearchBar placeholder={t('showcase.searchPlaceholder')} />
                </ComponentItem>
              </Col>
            </Row>
          </ComponentSection>
        </Tab>

        <Tab eventKey="movies" title={t('showcase.movieComponents')}>
          <ComponentSection>
            <SectionTitle>{t('showcase.movieUIComponents')}</SectionTitle>
            <Row>
              <Col md={12}>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.movieCard')}</ComponentTitle>
                  <MovieCard movie={translatedMovie} />
                </ComponentItem>
              </Col>
            </Row>
          </ComponentSection>
        </Tab>

        <Tab eventKey="seating" title={t('showcase.seating')}>
          <ComponentSection>
            <SectionTitle>{t('showcase.theaterSeatingComponents')}</SectionTitle>
            <Row>
              <Col>
                <ComponentItem>
                  <ComponentTitle>{t('showcase.seatTypes')}</ComponentTitle>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <Seat 
                        seat={{ id: 1, type: 'REGULAR' }} 
                        isSelected={false} 
                      />
                      <p>{t('showcase.regular')}</p>
                    </div>
                    <div>
                      <Seat 
                        seat={{ id: 2, type: 'VIP' }} 
                        isSelected={false} 
                      />
                      <p>{t('showcase.vip')}</p>
                    </div>
                    <div>
                      <Seat 
                        seat={{ id: 3, type: 'COUPLE' }} 
                        isSelected={false} 
                      />
                      <p>{t('showcase.couple')}</p>
                    </div>
                    <div>
                      <Seat 
                        seat={{ id: 4, type: 'REGULAR' }} 
                        isSelected={true} 
                      />
                      <p>{t('showcase.selected')}</p>
                    </div>
                    <div>
                      <Seat 
                        seat={{ id: 5, type: 'REGULAR', isBooked: true }} 
                        isSelected={false} 
                      />
                      <p>{t('showcase.booked')}</p>
                    </div>
                  </div>
                </ComponentItem>
              </Col>
            </Row>
          </ComponentSection>
        </Tab>
      </StyledTabs>
    </ShowcaseContainer>
  );
};

export default ComponentShowcase;