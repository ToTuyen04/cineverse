import React, { useState, useContext } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MovieIcon from "@mui/icons-material/Movie";
import TheatersIcon from "@mui/icons-material/Theaters";
import DateRangeIcon from "@mui/icons-material/DateRange";
import FastfoodIcon from '@mui/icons-material/Fastfood';  // Icon cho thức ăn và đồ uống
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';  // Icon cho combos
import LocalOfferIcon from '@mui/icons-material/LocalOffer';  // Icon cho vouchers
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailIcon from "@mui/icons-material/Mail";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useNavigate, useLocation } from "react-router-dom";
import { ColorModeContext } from "../../../context/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { AdminPanelSettings, AdminPanelSettingsOutlined, AdminPanelSettingsRounded, AdminPanelSettingsSharp, AdminPanelSettingsTwoTone, BackHandOutlined, Security, SecurityOutlined } from "@mui/icons-material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EventSeatIcon from '@mui/icons-material/EventSeat';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const LogoText = styled(Typography)(() => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  background: "linear-gradient(to right, #FF4D4D, #F9376E)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  letterSpacing: 1,
  padding: "0.5rem 0",
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  color: theme.palette.text.primary,
}));

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "Bộ Phim", icon: <MovieIcon />, path: "/admin/movies" },
  { text: "Chi nhánh rạp", icon: <TheatersIcon />, path: "/admin/theaters" },
  { text: 'Quản lý ghế', icon: <EventSeatIcon />, path: '/admin/seats' },
  { text: "Suất chiếu", icon: <DateRangeIcon />, path: "/admin/showtimes" },
  { text: "Đơn hàng", icon: <ShoppingCartIcon />, path: "/admin/orders" },
  { text: "Thức ăn và đồ uống", icon: <FastfoodIcon />, path: "/admin/fnbs" },
  { text: "Combos", icon: <ShoppingBasketIcon />, path: "/admin/combos" },
  { text: "Vouchers", icon: <LocalOfferIcon />, path: "/admin/vouchers" },
  { text: "Khách hàng", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "Nhân viên & Quản trị", icon: <Security />, path: "/admin/staffs" },
  { text: "Quản lý tác vụ ngầm", icon: <BackHandOutlined />, path: "/admin/backgroundjob" },
  { text: "Cấu hình", icon: <SettingsIcon />, path: "/admin/configs" },
  { text: "Excel", icon: <FileDownloadIcon />, path: "/admin/excels" },
];

export default function AdminLayout({ children }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/admin/profile");
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  const isMenuOpen = Boolean(anchorEl);

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id="primary-search-account-menu"
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <LogoText variant="h6" noWrap component="div">
            CINEVERSE
          </LogoText>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            sx={{ mr: 1 }}
            onClick={colorMode.toggleColorMode}
            color="inherit"
          >
            {theme.palette.mode === "dark" ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </IconButton>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
      <Drawer variant="permanent" open={open}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 8px",
            minHeight: 64,
          }}
        >
          <IconButton onClick={handleDrawerClose} color="inherit">
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  backgroundColor:
                    location.pathname.replace(/\/$/, '') === item.path.replace(/\/$/, '')
                      ? "rgba(249, 55, 110, 0.2)"
                      : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(249, 55, 110, 0.1)",
                  },
                }}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    color:
                      location.pathname.replace(/\/$/, '') === item.path.replace(/\/$/, '')
                        ? "#F9376E"
                        : theme.palette.text.primary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    color:
                      location.pathname.replace(/\/$/, '') === item.path.replace(/\/$/, '')
                        ? "#F9376E"
                        : theme.palette.text.primary,
                    "& .MuiTypography-root": {
                      fontWeight: location.pathname.replace(/\/$/, '') === item.path.replace(/\/$/, '') ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <ContentWrapper component="main">
        <Toolbar />
        {children}
      </ContentWrapper>
    </Box>
  );
}
