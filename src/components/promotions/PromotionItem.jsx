import React from 'react';
import styled from 'styled-components';
import { FaPercent, FaCalendarAlt, FaTicketAlt, FaStar, FaGift } from 'react-icons/fa';

const PromotionCard = styled.div`
  background-color: #2A2D3E;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const PromotionContent = styled.div`
  display: flex;
  padding: 1.5rem;
`;

const PromotionIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(to right, #FF4D4D, #F9376E);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  flex-shrink: 0;
  
  svg {
    color: white;
    font-size: 1.25rem;
  }
`;

const PromotionInfo = styled.div`
  flex: 1;
`;

const PromotionTitle = styled.h5`
  color: #f3f4f6;
  margin-bottom: 0.5rem;
`;

const PromotionDescription = styled.p`
  color: #9ca3af;
  margin-bottom: 1rem;
`;

const PromotionDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #F9376E;
  font-size: 0.9rem;
`;

const PromotionItem = ({ promotion }) => {
  // Choose icon based on promotion type
  const getIcon = () => {
    switch (promotion.iconType) {
      case 'ticket':
        return <FaTicketAlt />;
      case 'star':
        return <FaStar />;
      case 'gift':
        return <FaGift />;
      case 'percent':
      default:
        return <FaPercent />;
    }
  };

  return (
    <PromotionCard>
      <PromotionContent>
        <PromotionIcon>
          {getIcon()}
        </PromotionIcon>
        <PromotionInfo>
          <PromotionTitle>{promotion.title}</PromotionTitle>
          <PromotionDescription>{promotion.description}</PromotionDescription>
          <PromotionDate>
            <FaCalendarAlt />
            <span>Valid until {promotion.validUntil}</span>
          </PromotionDate>
        </PromotionInfo>
      </PromotionContent>
    </PromotionCard>
  );
};

export default PromotionItem;