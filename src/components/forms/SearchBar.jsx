import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { searchMoviesInFe } from "../../api/services/movieService";

// Giữ nguyên style ban đầu
const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border-radius: 50px;
  border: 1px solid #3f425a;
  background-color: #2a2d3e;
  color: #f3f4f6;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #F9376E;
    box-shadow: 0 0 0 2px rgba(249, 55, 110, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #F9376E;
  font-size: 0.9rem;
  z-index: 1;
`;

// Dropdown kết quả tìm kiếm
const ResultsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #2a2d3e;
  border: 1px solid #3f425a;
  border-radius: 10px;
  margin-top: 0.25rem;
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  display: ${props => props.show ? "block" : "none"};
`;

const ResultItem = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #3f425a;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #3f425a;
  }
`;

const MoviePoster = styled.img`
  width: 40px;
  height: 60px;
  border-radius: 3px;
  object-fit: cover;
  margin-right: 0.75rem;
`;

const MovieInfo = styled.div`
  flex: 1;
`;

const MovieTitle = styled.div`
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MovieDetails = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const EmptyResult = styled.div`
  padding: 1rem;
  color: #9ca3af;
  text-align: center;
`;

const SearchBar = ({ placeholder, value, onChange, style }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Đồng bộ với props
  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value);
    }
  }, [value]);

  // Tìm kiếm khi searchTerm thay đổi
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const movieResults = await searchMoviesInFe(searchTerm);
        setResults(movieResults);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching movies:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  // Xử lý click bên ngoài
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (onChange) {
      onChange(e);
    }
  };

  // Xử lý khi chọn phim
  const handleSelectMovie = (movie) => {
    navigate(`/movie/${movie.id}`);
    setShowResults(false);
    
    // Reset search sau khi chọn
    setSearchTerm("");
    if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  // Format năm từ ngày
  const formatYear = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear();
  };

  return (
    <SearchContainer ref={searchRef} style={style}>
      <InputWrapper>
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder={placeholder || "Tìm kiếm..."}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchTerm.trim().length >= 2 && results.length > 0) {
              setShowResults(true);
            }
          }}
        />
      </InputWrapper>

      {/* Dropdown kết quả tìm kiếm */}
      <ResultsDropdown show={showResults}>
        {isSearching ? (
          <EmptyResult>Đang tìm kiếm...</EmptyResult>
        ) : results.length > 0 ? (
          results.map((movie) => (
            <ResultItem key={movie.id} onClick={() => handleSelectMovie(movie)}>
              <MoviePoster
                src={movie.poster || 'https://via.placeholder.com/40x60?text=No+Image'}
                alt={movie.title}
              />
              <MovieInfo>
                <MovieTitle>{movie.title}</MovieTitle>
                <MovieDetails>
                  {formatYear(movie.startDate)} • {movie.duration} phút
                </MovieDetails>
              </MovieInfo>
            </ResultItem>
          ))
        ) : searchTerm.trim().length >= 2 ? (
          <EmptyResult>Không tìm thấy phim nào phù hợp</EmptyResult>
        ) : null}
      </ResultsDropdown>
    </SearchContainer>
  );
};

export default SearchBar;