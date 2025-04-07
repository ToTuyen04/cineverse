import React from 'react';
import styled from 'styled-components';
import { FaClock, FaCalendarAlt } from 'react-icons/fa';

const Card = styled.div`
  background-color: #2A2D3E;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    
    .poster-overlay {
      opacity: 1;
    }
  }
`;

const PosterContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const Poster = styled.img`
  width: 100%;
  height: 360px;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const PosterOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.4) 60%,
    rgba(0, 0, 0, 0) 100%
  );
  display: flex;
  align-items: flex-end;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 1.25rem;
  
  &.poster-overlay {
    opacity: 0;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #F9376E;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ContentArea = styled.div`
  padding: 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #f3f4f6;
  transition: color 0.2s;
  
  ${Card}:hover & {
    color: #F9376E;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Genres = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const GenreTag = styled.span`
  background-color: #1a1c26;
  color: #9ca3af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const Description = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const MovieCard = ({
  movie,
  onClick
}) => {
  const {
    id,
    title,
    posterUrl,
    duration,
    releaseDate,
    genres,
    description,
    isNew
  } = movie;

  const handleClick = () => {
    if (onClick) onClick(id);
  };

  return (
    <Card onClick={handleClick}>
      <PosterContainer>
        <Poster src={posterUrl} alt={title} />
        <PosterOverlay className="poster-overlay">
          {/* You could add action buttons here */}
        </PosterOverlay>
        {isNew && <Badge>NEW</Badge>}
      </PosterContainer>
      <ContentArea>
        <Title>{title}</Title>
        <MetaInfo>
          <MetaItem>
            <FaClock size={12} />
            {duration} min
          </MetaItem>
          <MetaItem>
            <FaCalendarAlt size={12} />
            {releaseDate}
          </MetaItem>
        </MetaInfo>
        <Genres>
          {genres.map((genre, index) => (
            <GenreTag key={index}>{genre}</GenreTag>
          ))}
        </Genres>
        <Description>{description}</Description>
      </ContentArea>
    </Card>
  );
};

export default MovieCard;