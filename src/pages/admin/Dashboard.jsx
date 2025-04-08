import React, { useState, useEffect } from 'react';
import { 
  Grid, Typography, Box, Card, CardContent, Button, Menu, MenuItem,
  FormControl, InputLabel, Select, TextField, Chip, OutlinedInput,
  Popover, Paper
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import MovieIcon from '@mui/icons-material/Movie';
import TheatersIcon from '@mui/icons-material/Theaters';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PeopleIcon from '@mui/icons-material/People';
import BarChart from '../../components/chart/BarChart';
import PieChart from '../../components/chart/PieChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Import dashboard service functions
import { 
  getDashboardData,
  getTotalMovies,
  getTotalTheaters,
  getTheaterNames,
  getTicketsSoldToday,
  getTotalTickets,
  getTotalCombos,
  getOrderDashboardData,
  getGenreDashboardData,
  getMovieDashboardData,
  getComboDashboardData,
  formatDashboardError
} from '../../api/services/dashboardService';

const StyledCard = styled(Card)(({ theme, bgColor }) => ({
  backgroundColor: bgColor ? bgColor : theme.palette.mode === 'light'
    ? alpha(theme.palette.primary.main, 0.05) // Light soft background
    : '#2a2d3e', // Original dark background
  color: theme.palette.mode === 'light'
    ? theme.palette.text.primary
    : theme.palette.common.white,
  borderRadius: theme.spacing(1),
  height: '100%',
  boxShadow: theme.palette.mode === 'light'
    ? '0 2px 8px rgba(0,0,0,0.08)'
    : 'none',
}));

const StatCard = ({ icon, title, value, bgColor }) => {
  const theme = useTheme();
  
  // Determine background color based on theme mode
  const cardBgColor = theme.palette.mode === 'light'
    ? bgColor || alpha(theme.palette.primary.main, 0.08)
    : bgColor || '#2a2d3e';
    
  // Icon background color
  const iconBgColor = theme.palette.mode === 'light'
    ? alpha(theme.palette.primary.main, 0.15)
    : 'rgba(255,255,255,0.1)';
  
  return (
    <StyledCard bgColor={cardBgColor}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '50%', 
            bgcolor: iconBgColor, 
            mr: 2 
          }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" sx={{ 
              opacity: 0.7,
              color: theme.palette.mode === 'light'
                ? theme.palette.text.secondary
                : 'inherit'
            }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  
  // Custom card colors for light mode
  const lightModeColors = {
    movies: alpha('#FF4D4D', 0.08),
    theaters: alpha('#F9376E', 0.08),
    tickets: alpha('#00C896', 0.08),
    users: alpha('#1E88E5', 0.08)
  };
  
  // Custom card colors for dark mode (original colors)
  const darkModeColors = {
    movies: '#2a2d3e',
    theaters: '#2a2d3e',
    tickets: '#2a2d3e',
    users: '#2a2d3e'
  };
  
  // Select the right color scheme based on theme
  const colors = theme.palette.mode === 'light' ? lightModeColors : darkModeColors;
  
  // Border styles based on theme
  const borderStyle = `1px solid ${
    theme.palette.mode === 'light' 
      ? 'rgba(0,0,0,0.08)' 
      : 'rgba(255,255,255,0.1)'
  }`;

  // Move all state variables to the top of component
  // Filter state
  const [timeFilterType, setTimeFilterType] = useState('all');
  const [timeAnchorEl, setTimeAnchorEl] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTheater, setSelectedTheater] = useState('');
  
  // Add missing state variables for revenue data
  const [totalTicketRevenue, setTotalTicketRevenue] = useState(0);
  const [totalComboRevenue, setTotalComboRevenue] = useState(0);
  const [ticketPercent, setTicketPercent] = useState(75);
  const [comboPercent, setComboPercent] = useState(25);
  const [revenueDistributionData, setRevenueDistributionData] = useState(null);
  
  // Stats state
  const [movieCount, setMovieCount] = useState("--");
  const [theaterCount, setTheaterCount] = useState("--");
  const [ticketsToday, setTicketsToday] = useState("--");
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalCombos, setTotalCombos] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [topCombos, setTopCombos] = useState([]);
  // Add theater names state
  const [theaterNames, setTheaterNames] = useState([]);

  // Create chart data using state variables instead of direct references
  const genreDistributionData = {
    labels: [`Doanh thu bán vé (${ticketPercent}%)`, `Doanh thu combo (${comboPercent}%)`],
    datasets: [{
      label: 'Phân bố doanh thu',
      data: [totalTicketRevenue, totalComboRevenue],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',  // Blue for tickets
        'rgba(255, 99, 132, 0.7)'   // Red for combos
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Dữ liệu cho BarChart
  const ticketSalesData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    datasets: [
      {
        type: 'bar',
        label: 'Vé thường',
        data: [1200, 1500, 1300, 1700, 1850, 2100, 2500, 2300, 1900, 1750, 2000, 2200],
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
      },
      {
        type: 'bar',
        label: 'Vé VIP',
        data: [800, 950, 870, 1100, 1250, 1450, 1650, 1500, 1200, 1150, 1300, 1400],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        type: 'line',
        label: 'Doanh thu (triệu VND)',
        data: [240, 294, 259, 336, 372, 426, 498, 456, 372, 348, 396, 432],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      }
    ]
  };

  // Theater options
  const theaters = [
    { id: 1, name: 'Rạp 1 - Hà Nội' },
    { id: 2, name: 'Rạp 2 - TP HCM' },
    { id: 3, name: 'Rạp 3 - Đà Nẵng' },
    { id: 4, name: 'Rạp 4 - Cần Thơ' },
    { id: 5, name: 'Rạp 5 - Hải Phòng' },
  ];

  // Handle time filter menu
  const handleTimeFilterClick = (event) => {
    setTimeAnchorEl(event.currentTarget);
  };

  const handleTimeFilterClose = () => {
    setTimeAnchorEl(null);
  };

  const handleTimeFilterSelect = (type) => {
    setTimeFilterType(type);
    handleTimeFilterClose();
    
    // When filter type changes, you may want to fetch new data
    const formattedTime = getFormattedTimeFilter();
    fetchDataBasedOnFilters(formattedTime, selectedTheater);
  };

  // Handle theater selection
  const handleTheaterChange = (event) => {
    const theaterValue = event.target.value;
    setSelectedTheater(theaterValue);
    
    // After theater selection changes, fetch new data
    const formattedTime = getFormattedTimeFilter();
    fetchDataBasedOnFilters(formattedTime, theaterValue);
  };

  // Format time filter for database queries
  const getFormattedTimeFilter = () => {
    switch (timeFilterType) {
      case 'month':
        // Format: MM_YYYY (e.g., 01_2024)
        const monthValue = String(selectedMonth + 1).padStart(2, '0');
        return `${monthValue}_${selectedYear}`;
      
      case 'quarter':
        // Format: Q1_YYYY (e.g., Q1_2024)
        return `Q${selectedQuarter}_${selectedYear}`;
      
      case 'year':
        // Just the year when only year is selected
        return selectedYear.toString();
      
      case 'all':
        // Return empty or a default value for 'all' timeframe
        return 'all';
        
      default:
        return '';
    }
  };

  // Add a function to handle data fetching when filters change
  const fetchDataBasedOnFilters = async (timeFilter, theaterFilter) => {
    try {
      setIsLoading(true);
      
      // Fetch all data
      const dashboardData = await fetchAllDashboardData(timeFilter, theaterFilter);
      
      // Update state with the fetched data
      setMovieCount(dashboardData.stats.movieCount?.toString() || "0");
      setTheaterCount(dashboardData.stats.theaterCount?.toString() || "0");
      setTicketsToday(dashboardData.stats.ticketsToday?.toString() || "0");
      setTotalTickets(dashboardData.stats.totalTickets || 0);
      setTotalCombos(dashboardData.stats.totalCombos || 0);
      
      // Store theater names from API
      if (dashboardData.theaterNames && dashboardData.theaterNames.length > 0) {
        setTheaterNames(dashboardData.theaterNames);
      }
      
      // Format data for pie charts
      // Use ticketTotal and comboTotal from the API response
      const ticketRevenue = dashboardData.orderData.reduce((sum, order) => sum + (order.ticketTotal || 0), 0);
      const comboRevenue = dashboardData.orderData.reduce((sum, order) => sum + (order.comboTotal || 0), 0);
      
      // Update state with revenue data
      setTotalTicketRevenue(ticketRevenue);
      setTotalComboRevenue(comboRevenue);
      
      // Calculate percentages
      if (ticketRevenue + comboRevenue > 0) {
        const calculatedTicketPercent = Math.round((ticketRevenue / (ticketRevenue + comboRevenue)) * 100);
        setTicketPercent(calculatedTicketPercent);
        setComboPercent(100 - calculatedTicketPercent);
      }
      
      // Set revenue distribution data
      const revenueChartData = formatRevenueDistributionData(ticketRevenue, comboRevenue);
      setRevenueDistributionData(revenueChartData);
      
    } catch (error) {
      setError(formatDashboardError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Also update the select handlers to call fetchDataBasedOnFilters
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    // After a short delay to ensure state is updated
    setTimeout(() => {
      const formattedTime = getFormattedTimeFilter();
      fetchDataBasedOnFilters(formattedTime, selectedTheater);
    }, 0);
  };

  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value);
    setTimeout(() => {
      const formattedTime = getFormattedTimeFilter();
      fetchDataBasedOnFilters(formattedTime, selectedTheater);
    }, 0);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setTimeout(() => {
      const formattedTime = getFormattedTimeFilter();
      fetchDataBasedOnFilters(formattedTime, selectedTheater);
    }, 0);
  };

  // Generate years for dropdown
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  
  // Generate months for dropdown
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Generate quarters for dropdown
  const quarters = ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'];

  // Style for filter section
  const filterSectionStyle = {
    p: 2, 
    my: 3, 
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.mode === 'light' 
      ? alpha(theme.palette.primary.main, 0.05)
      : '#1F2231',
    boxShadow: theme.palette.mode === 'light'
      ? '0 2px 8px rgba(0,0,0,0.05)'
      : 'none',
  };

  // Filter button style
  const filterButtonStyle = {
    mr: 1,
    textTransform: 'none',
    bgcolor: (selected) => selected ? 
      (theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.25)) : 
      'transparent',
    '&:hover': {
      bgcolor: (selected) => selected ? 
        (theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.35)) : 
        (theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.15))
    }
  };

  // Add an effect to fetch data on component mount
  useEffect(() => {
    const formattedTime = getFormattedTimeFilter();
    fetchDataBasedOnFilters(formattedTime, selectedTheater);
  }, []);

  return (
    <Box>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 4,
          color: theme.palette.text.primary
        }}
      >
        Dashboard
      </Typography>
      
      {/* Hàng 1: Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4} md={4}>
          <StatCard 
            icon={<MovieIcon sx={{ color: '#FF4D4D' }} />} 
            title="Total Movies" 
            value="124" 
            bgColor={colors.movies}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <StatCard 
            icon={<TheatersIcon sx={{ color: '#F9376E' }} />} 
            title="Theaters" 
            value="18" 
            bgColor={colors.theaters}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <StatCard 
            icon={<ConfirmationNumberIcon sx={{ color: '#00C896' }} />} 
            title="Tickets Sold Today" 
            value="256" 
            bgColor={colors.tickets}
          />
        </Grid>
      </Grid>
      
      {/* Hàng 2: Filter Section */}
      <Box sx={filterSectionStyle}>
        <Grid container spacing={2} alignItems="center">
          {/* Time Filter */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Thời gian
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="outlined" 
                  sx={{ ...filterButtonStyle, bgcolor: timeFilterType === 'month' ? 
                    (theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.25)) : 
                    'transparent' 
                  }}
                  onClick={() => handleTimeFilterSelect('month')}
                >
                  Tháng
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ ...filterButtonStyle, bgcolor: timeFilterType === 'quarter' ? 
                    (theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.25)) : 
                    'transparent' 
                  }}
                  onClick={() => handleTimeFilterSelect('quarter')}
                >
                  Quý
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ ...filterButtonStyle, bgcolor: timeFilterType === 'year' ? 
                    (theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.25)) : 
                    'transparent' 
                  }}
                  onClick={() => handleTimeFilterSelect('year')}
                >
                  Năm
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ ...filterButtonStyle, bgcolor: timeFilterType === 'all' ? 
                    (theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.25)) : 
                    'transparent' 
                  }}
                  onClick={() => handleTimeFilterSelect('all')}
                >
                  Tất cả
                </Button>

                {/* Time selection fields */}
                <Box sx={{ mt: 1.5, ml: 1, display: 'flex', gap: 2 }}>
                  {timeFilterType === 'month' && (
                    <>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Tháng</InputLabel>
                        <Select
                          value={selectedMonth}
                          label="Tháng"
                          onChange={handleMonthChange} // Use the new handler
                        >
                          {months.map((month, index) => (
                            <MenuItem key={index} value={index}>{month}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Năm</InputLabel>
                        <Select
                          value={selectedYear}
                          label="Năm"
                          onChange={handleYearChange} // Use the new handler
                        >
                          {years.map((year) => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}
                  {timeFilterType === 'quarter' && (
                    <>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Quý</InputLabel>
                        <Select
                          value={selectedQuarter}
                          label="Quý"
                          onChange={handleQuarterChange} // Use the new handler
                        >
                          {quarters.map((quarter, index) => (
                            <MenuItem key={index} value={index + 1}>{quarter}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Năm</InputLabel>
                        <Select
                          value={selectedYear}
                          label="Năm"
                          onChange={handleYearChange} // Use the new handler
                        >
                          {years.map((year) => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}
                  {timeFilterType === 'year' && (
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Năm</InputLabel>
                      <Select
                        value={selectedYear}
                        label="Năm"
                        onChange={handleYearChange} // Use the new handler
                      >
                        {years.map((year) => (
                          <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          
          {/* Location Filter */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Địa điểm
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Rạp chiếu</InputLabel>
                <Select
                  value={selectedTheater}
                  onChange={handleTheaterChange}
                  input={<OutlinedInput label="Rạp chiếu" />}
                >
                  <MenuItem value="All">
                    <em>Tất cả rạp</em>
                  </MenuItem>
                  {theaterNames.map((theaterName, index) => (
                    <MenuItem key={index} value={theaterName}>
                      {theaterName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Hàng 3 (mới): Charts */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Ticket Sales
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <BarChart 
                  title="Ticket Sales by Month" 
                  chartData={ticketSalesData} // Pass your custom data here
                />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Genre Distribution
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <PieChart title="Movie Genre Distribution" chartData={genreDistributionData} />
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      
      {/* Hàng 4: Top Rankings */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Top 5 Most Viewed Movies */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 Phim Được Xem Nhiều Nhất
              </Typography>
              <Box sx={{ mt: 2 }}>
                {[
                  { title: 'Avengers: Endgame', views: '12,458' },
                  { title: 'Spider-Man: No Way Home', views: '10,245' },
                  { title: 'The Batman', views: '8,763' },
                  { title: 'Doctor Strange in the Multiverse of Madness', views: '7,845' },
                  { title: 'Fast & Furious 9', views: '6,932' }
                ].map((movie, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 1, 
                      borderBottom: borderStyle,
                      '&:last-child': { borderBottom: 'none' },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: index < 3 ? 
                            ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 
                            'rgba(0,0,0,0.1)', 
                          color: index < 3 ? '#fff' : 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          mr: 1
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Typography variant="body2">{movie.title}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 'bold',
                      color: theme.palette.primary.main 
                    }}>
                      {movie.views}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Top 5 Most Popular Genres */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 Thể Loại Được Xem Nhiều Nhất
              </Typography>
              <Box sx={{ mt: 2 }}>
                {[
                  { genre: 'Hành động', percentage: '32%' },
                  { genre: 'Khoa học viễn tưởng', percentage: '24%' },
                  { genre: 'Phiêu lưu', percentage: '18%' },
                  { genre: 'Hoạt hình', percentage: '15%' },
                  { genre: 'Kinh dị', percentage: '11%' }
                ].map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 1, 
                      borderBottom: borderStyle,
                      '&:last-child': { borderBottom: 'none' },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: index < 3 ? 
                            ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 
                            'rgba(0,0,0,0.1)', 
                          color: index < 3 ? '#fff' : 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          mr: 1
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Typography variant="body2">{item.genre}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 'bold',
                      color: theme.palette.primary.main 
                    }}>
                      {item.percentage}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Top 5 Most Popular Combos */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 Combo Được Mua Nhiều Nhất
              </Typography>
              <Box sx={{ mt: 2 }}>
                {[
                  { name: 'Combo Đôi (2 Bắp + 2 Nước)', count: '2,435' },
                  { name: 'Combo Gia Đình (4 Bắp + 4 Nước)', count: '1,867' },
                  { name: 'Combo Đơn (1 Bắp + 1 Nước)', count: '1,532' },
                  { name: 'Combo Bạn Bè (3 Bắp + 3 Nước)', count: '1,238' },
                  { name: 'Combo Snack Đặc Biệt', count: '987' }
                ].map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 1, 
                      borderBottom: borderStyle,
                      '&:last-child': { borderBottom: 'none' },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: index < 3 ? 
                            ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 
                            'rgba(0,0,0,0.1)', 
                          color: index < 3 ? '#fff' : 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          mr: 1
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 'bold',
                      color: theme.palette.primary.main 
                    }}>
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Fetches all dashboard data from the API
 * @param {string} timeFilter - Time period filter (MM_YYYY, Q1_YYYY, YYYY, or 'all')
 * @param {string} theaterFilter - Theater ID or 'All' for all theaters
 * @returns {Promise<Object>} - Object containing all dashboard data
 */
const fetchAllDashboardData = async (timeFilter, theaterFilter) => {
  try {
    // Always use 'All' for empty or falsy values
    const theater = theaterFilter || 'All';
    const time = timeFilter || 'all';
    
    console.log(`Fetching dashboard data with time: ${time}, theater: ${theater}`);
    
    // Get dashboard data from API
    const dashboardData = await getDashboardData(theater, time);
    
    // Return consolidated data object mapped to expected structure
    return {
      stats: {
        movieCount: dashboardData.totalMoive,
        theaterCount: dashboardData.totalTheater,
        ticketsToday: dashboardData.ticketToday,
        totalTickets: dashboardData.totalTicket,
        totalCombos: dashboardData.totalCombo
      },
      theaterNames: dashboardData.theaterNames || [],
      orderData: dashboardData.orderDashboards || [],
      genreData: dashboardData.genresDashboards || [],
      movieData: dashboardData.movieDashboards || [],
      comboData: dashboardData.comboDashboards || []
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};

/**
 * Formats data for revenue distribution pie chart
 * @param {number} totalTicketRevenue - Total ticket revenue
 * @param {number} totalComboRevenue - Total combo revenue
 * @returns {Object} - Formatted data for Chart.js pie chart
 */
const formatRevenueDistributionData = (totalTicketRevenue, totalComboRevenue) => {
  if (totalTicketRevenue <= 0 && totalComboRevenue <= 0) {
    return null;
  }
  
  // Calculate total revenue
  const totalRevenue = totalTicketRevenue + totalComboRevenue;
  
  // Calculate percentages for labels
  const ticketPercent = Math.round((totalTicketRevenue / totalRevenue) * 100);
  const comboPercent = Math.round((totalComboRevenue / totalRevenue) * 100);
  
  // Return the formatted data
  return {
    labels: [`Doanh thu bán vé (${ticketPercent}%)`, `Doanh thu combo (${comboPercent}%)`],
    datasets: [{
      label: 'Phân bố doanh thu',
      data: [totalTicketRevenue, totalComboRevenue],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',  // Blue for tickets
        'rgba(255, 99, 132, 0.7)'   // Red for combos
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };
};

export default Dashboard;