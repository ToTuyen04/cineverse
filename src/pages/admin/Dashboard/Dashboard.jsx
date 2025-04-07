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
import BarChart from '../../../components/chart/BarChart';
import PieChart from '../../../components/chart/PieChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Import dashboard service functions
import { 
  getBasicDashboardData,
  getDetailedDashboardData,
  getTotalMovies,
  getTotalTheaters,
  getTheaterNames,
  getTicketsSoldToday,
  formatDashboardError
} from '../../../api/services/dashboardService';

// Thêm đoạn code này vào đầu file
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

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
  const [selectedTheater, setSelectedTheater] = useState('All');
  
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

  // Add a new state variable for monthly ticket sales data
  const [monthlyTicketData, setMonthlyTicketData] = useState({
    regularTickets: Array(12).fill(0),
    vipTickets: Array(12).fill(0),
    revenue: Array(12).fill(0)
  });

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
        data: monthlyTicketData.regularTickets,
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
      },
      {
        type: 'bar',
        label: 'Vé VIP',
        data: monthlyTicketData.vipTickets,
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        type: 'line',
        label: 'Doanh thu (triệu VND)',
        data: monthlyTicketData.revenue,
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

  // Handle time filter selection - pass new value directly instead of relying on state
  const handleTimeFilterSelect = (type) => {
    setTimeFilterType(type);
    handleTimeFilterClose();
    
    // Calculate the time filter immediately with the new type
    let formattedTime;
    switch (type) {
      case 'month':
        const monthValue = String(selectedMonth + 1).padStart(2, '0');
        formattedTime = `${monthValue}_${selectedYear}`;
        break;
      case 'quarter':
        formattedTime = `Q${selectedQuarter}_${selectedYear}`;
        break;
      case 'year':
        formattedTime = selectedYear.toString();
        break;
      case 'all':
      default:
        formattedTime = 'All';
        break;
    }
    
    // Pass the calculated time directly
    fetchDataBasedOnFilters(formattedTime, selectedTheater);
  };

  // Handle theater selection
  const handleTheaterChange = (event) => {
    const newTheater = event.target.value;
    setSelectedTheater(newTheater);
    
    // Use the current time filter with the new theater value
    const formattedTime = getFormattedTimeFilter();
    fetchDataBasedOnFilters(formattedTime, newTheater);
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
      default:
        // Always use 'All' for 'all' timeframe
        return 'All';
    }
  };

  // Add a function to handle data fetching when filters change
  const fetchDataBasedOnFilters = async (timeFilter, theaterFilter) => {
    try {
      // Set both loading states
      setIsLoading(true);
      setChartsLoading(true);
      
      console.log(`Fetching data with filters - Time: ${timeFilter}, Theater: ${theaterFilter}`);
      
      // Clear previous data to avoid showing stale data
      setTopMovies([]);
      setTopGenres([]);
      setTopCombos([]);
      setMonthlyTicketData({
        regularTickets: Array(12).fill(0),
        vipTickets: Array(12).fill(0),
        revenue: Array(12).fill(0)
      });
      
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
      
      // Update top rankings
      setTopMovies(dashboardData.topMovies || []);
      setTopGenres(dashboardData.topGenres || []);
      setTopCombos(dashboardData.topCombos || []);
      
      // Format data for pie charts
      // Use totalTicket and totalCombo from the API response
      const ticketRevenue = dashboardData.totalTicket || 0;
      const comboRevenue = dashboardData.totalCombo || 0;
      
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

      // Process monthly ticket sales
      const monthlyData = processMonthlyTicketSales(dashboardData.orderData);
      setMonthlyTicketData(monthlyData);
      
    } catch (error) {
      setError(formatDashboardError(error));
    } finally {
      setIsLoading(false);
      setChartsLoading(false);
    }
  };

  // Also update the select handlers to call fetchDataBasedOnFilters
  // Handle month change - pass new value directly
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    
    // Use the new month value directly
    const monthValue = String(newMonth + 1).padStart(2, '0');
    const formattedTime = `${monthValue}_${selectedYear}`;
    fetchDataBasedOnFilters(formattedTime, selectedTheater);
  };

  // Handle quarter change - pass new value directly
  const handleQuarterChange = (e) => {
    const newQuarter = e.target.value;
    setSelectedQuarter(newQuarter);
    
    // Use the new quarter value directly
    const formattedTime = `Q${newQuarter}_${selectedYear}`;
    fetchDataBasedOnFilters(formattedTime, selectedTheater);
  };

  // Handle year change - pass new value directly
  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    
    // Use the new year value directly with the current filter type
    let formattedTime;
    switch (timeFilterType) {
      case 'month':
        const monthValue = String(selectedMonth + 1).padStart(2, '0');
        formattedTime = `${monthValue}_${newYear}`;
        break;
      case 'quarter':
        formattedTime = `Q${selectedQuarter}_${newYear}`;
        break;
      case 'year':
        formattedTime = newYear.toString();
        break;
      case 'all':
      default:
        formattedTime = 'All';
        break;
    }
    
    fetchDataBasedOnFilters(formattedTime, selectedTheater);
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
    console.log('Initial data load using All parameters and 2025');
    // Explicitly set filter type to 'year' as default instead of 'all'
    setTimeFilterType('year');
    // Use 'All' for theater and '2025' for year as defaults
    setSelectedYear(2025);
    fetchDataBasedOnFilters('2025', 'All');
  }, []);

  // Add loading indicator for charts and data
  const [chartsLoading, setChartsLoading] = useState(false);

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
            value={movieCount} 
            bgColor={colors.movies}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <StatCard 
            icon={<TheatersIcon sx={{ color: '#F9376E' }} />} 
            title="Theaters" 
            value={theaterCount} 
            bgColor={colors.theaters}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <StatCard 
            icon={<ConfirmationNumberIcon sx={{ color: '#00C896' }} />} 
            title="Tickets Sold Today" 
            value={ticketsToday} 
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
                {/* Removed the 'All' button */}

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
              <Box sx={{ height: 300, mt: 2, position: 'relative' }}>
                {chartsLoading && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    zIndex: 1
                  }}>
                    <Typography>Loading data...</Typography>
                  </Box>
                )}
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
              <Box sx={{ height: 300, mt: 2, position: 'relative' }}>
                {chartsLoading && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    zIndex: 1
                  }}>
                    <Typography>Loading data...</Typography>
                  </Box>
                )}
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
                {topMovies.length > 0 ? topMovies.map((movie, index) => (
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
                )) : (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Không có dữ liệu phim
                  </Typography>
                )}
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
                {topGenres.length > 0 ? topGenres.map((item, index) => (
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
                )) : (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Không có dữ liệu thể loại
                  </Typography>
                )}
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
                {topCombos.length > 0 ? topCombos.map((item, index) => (
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
                )) : (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Không có dữ liệu combo
                  </Typography>
                )}
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
 * @param {string} timeFilter - Time period filter (MM_YYYY, Q1_YYYY, YYYY, or 'All')
 * @param {string} theaterFilter - Theater ID or 'All' for all theaters
 * @returns {Promise<Object>} - Object containing all dashboard data
 */
const fetchAllDashboardData = async (timeFilter, theaterFilter) => {
  try {
    // Ensure 'All' (uppercase A) is used for default and empty values
    const theater = theaterFilter === undefined || theaterFilter === '' ? 'All' : theaterFilter;
    const time = timeFilter === undefined || timeFilter === '' ? 'All' : timeFilter;
    
    console.log(`Fetching dashboard data with time: ${time}, theater: ${theater}`);
    
    // First get basic data (totalMovie, totalTheater, ticketToday, theaterNames)
    const basicData = await getBasicDashboardData();
    
    // Then get detailed data with filters (revenue, orders, genres, movies, combos)
    const detailedData = await getDetailedDashboardData(theater, time);
    
    // Process top movies from movieDashboards
    const topMovies = processTopMovies(detailedData.movieDashboards || []);
    
    // Process top genres from genresDashboards
    const topGenres = processTopGenres(detailedData.genresDashboards || []);
    
    // Process top combos from comboDashboards
    const topCombos = processTopCombos(detailedData.comboDashboards || []);
    
    // Return consolidated data object mapped to expected structure
    return {
      stats: {
        movieCount: basicData.totalMovie || 0,
        theaterCount: basicData.totalTheater || 0,
        ticketsToday: basicData.ticketToday || 0,
        totalTickets: detailedData.totalTicket || 0,
        totalCombos: detailedData.totalCombo || 0
      },
      theaterNames: basicData.theaterNames || [],
      orderData: detailedData.orderDashboards || [],
      genreData: detailedData.genresDashboards || [],
      movieData: detailedData.movieDashboards || [],
      comboData: detailedData.comboDashboards || [],
      topMovies,
      topGenres,
      topCombos,
      totalTicket: detailedData.totalTicket || 0,
      totalCombo: detailedData.totalCombo || 0
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};

/**
 * Counts unique movies from movieDashboards
 * @param {Array} movieDashboards - Array of movie dashboard items
 * @returns {number} - Count of unique movies
 */
const countUniqueMovies = (movieDashboards) => {
  if (!movieDashboards || movieDashboards.length === 0) return 0;
  const uniqueMovieIds = new Set(movieDashboards.map(movie => movie.movieId));
  return uniqueMovieIds.size;
};

/**
 * Processes movie dashboard data to get top 5 movies
 * @param {Array} movieDashboards - Array of movie dashboard items
 * @returns {Array} - Top 5 movies with view counts
 */
const processTopMovies = (movieDashboards) => {
  if (!movieDashboards || movieDashboards.length === 0) return [];
  
  // Group by movieId and sum totalOrders
  const movieMap = movieDashboards.reduce((acc, item) => {
    const { movieId, movieName, totalOrders } = item;
    if (!acc[movieId]) {
      acc[movieId] = { movieId, movieName, totalOrders: 0 };
    }
    acc[movieId].totalOrders += totalOrders || 0;
    return acc;
  }, {});
  
  // Convert to array and sort by totalOrders
  const sortedMovies = Object.values(movieMap)
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 5)
    .map(movie => ({
      title: movie.movieName,
      views: movie.totalOrders.toLocaleString()
    }));
  
  return sortedMovies;
};

/**
 * Processes genre dashboard data to get top 5 genres
 * @param {Array} genresDashboards - Array of genre dashboard items
 * @returns {Array} - Top 5 genres with percentages
 */
const processTopGenres = (genresDashboards) => {
  if (!genresDashboards || genresDashboards.length === 0) return [];
  
  // Group by genresId and sum totalOrders
  const genreMap = genresDashboards.reduce((acc, item) => {
    const { genresId, genresName, totalOrders } = item;
    if (!acc[genresId]) {
      acc[genresId] = { genresId, genresName, totalOrders: 0 };
    }
    acc[genresId].totalOrders += totalOrders || 0;
    return acc;
  }, {});
  
  // Calculate total orders across all genres
  const totalOrders = Object.values(genreMap).reduce((sum, genre) => sum + genre.totalOrders, 0);
  
  // Convert to array, calculate percentages, sort and take top 5
  const sortedGenres = Object.values(genreMap)
    .map(genre => ({
      genresId: genre.genresId,
      genre: genre.genresName,
      totalOrders: genre.totalOrders,
      percentage: totalOrders > 0 ? Math.round((genre.totalOrders / totalOrders) * 100) + '%' : '0%'
    }))
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 5);
  
  return sortedGenres;
};

/**
 * Processes combo dashboard data to get top 5 combos
 * @param {Array} comboDashboards - Array of combo dashboard items
 * @returns {Array} - Top 5 combos with counts
 */
const processTopCombos = (comboDashboards) => {
  if (!comboDashboards || comboDashboards.length === 0) return [];
  
  // Group by comboId and sum totalOrders
  const comboMap = comboDashboards.reduce((acc, item) => {
    const { comboId, comboName, totalOrders } = item;
    if (!acc[comboId]) {
      acc[comboId] = { comboId, comboName, totalOrders: 0 };
    }
    acc[comboId].totalOrders += totalOrders || 0;
    return acc;
  }, {});
  
  // Convert to array, sort and take top 5
  const sortedCombos = Object.values(comboMap)
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 5)
    .map(combo => ({
      name: combo.comboName,
      count: combo.totalOrders.toLocaleString()
    }));
  
  return sortedCombos;
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

/**
 * Processes order data into monthly ticket sales
 * @param {Array} orderData - Array of order items
 * @returns {Object} - Processed data for monthly ticket sales
 */
const processMonthlyTicketSales = (orderData) => {
  // Initialize arrays for each month (0-11)
  const regularTickets = Array(12).fill(0);
  const vipTickets = Array(12).fill(0);
  const revenue = Array(12).fill(0);

  if (!orderData || orderData.length === 0) return { regularTickets, vipTickets, revenue };

  // Process each order
  orderData.forEach(order => {
    // Extract month from order date (orderCreateAt)
    const orderDate = new Date(order.orderCreateAt);
    const month = orderDate.getMonth(); // 0-based (0 for January)
    
    // For this example, let's assume 30% of tickets are VIP and 70% are regular
    // You may need to adjust this based on your actual data structure
    const ticketCount = Math.round(order.ticketTotal / 100000); // Assuming average ticket price of 100,000
    const regularTicketCount = Math.round(ticketCount * 0.7);
    const vipTicketCount = ticketCount - regularTicketCount;
    
    // Add to the appropriate month
    regularTickets[month] += regularTicketCount;
    vipTickets[month] += vipTicketCount;
    
    // Revenue in millions
    revenue[month] += (order.orderTotal / 1000000);
  });

  return { regularTickets, vipTickets, revenue };
};

export default Dashboard;