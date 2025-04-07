import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Layouts
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/admin/AdminLayout";

// Regular pages
import ComponentShowcase from "./pages/ComponentShowcase";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MoviesPage from "./pages/MoviesPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import PaymentPage from "./pages/PaymentPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import BookingPage from "./pages/BookingPage";
import VerifyAccountPage from "./pages/VerifyAccountPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TicketInfo from "./pages/TicketInfo";

// Admin pages
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Movies from "./pages/admin/Movies/Movies";
import Theaters from "./pages/admin/Theaters/Theaters";
import Showtimes from "./pages/admin/Showtimes/Showtimes";
import Orders from "./pages/admin/Orders/Orders";
import Vouchers from "./pages/admin/Vouchers/Vouchers";
import Fnbs from "./pages/admin/Fnbs/Fnbs";
import Staff from "./pages/admin/Staff/Staff";
import HumanResource from "./pages/admin/HumanResource/HumanResource";
import Configuration from "./pages/admin/Configurations/Configuration";
import RoomSeatsManagement from "./pages/admin/Seats/RoomSeatsManagement";
import SeatManagement from "./pages/admin/Seats/SeatManagement";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProviderWrapper } from "./context/ThemeContext";

// Styles
import GlobalStyles from "./styles/globalStyles";
import Combos from "./pages/admin/Combos/Combos";
import Profile from "./pages/admin/Profile/Profile";
import Excel from "./pages/admin/Excel/Excel";

// Fallback pages
const NotFoundPage = () => (
  <div className="container py-5">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for doesn't exist.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProviderWrapper>
        <Router>
          <GlobalStyles />
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/login"
              element={
                <Layout>
                  <LoginPage />
                </Layout>
              }
            />
            <Route
              path="/register"
              element={
                <Layout>
                  <RegisterPage />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <ProfilePage />
                </Layout>
              }
            />
            <Route
              path="/movies"
              element={
                <Layout>
                  <MoviesPage />
                </Layout>
              }
            />
            <Route
              path="/movie/:id/booking"
              element={
                <Layout>
                  <BookingPage />
                </Layout>
              }
            />
            <Route
              path="/booking/:showtimeId/seats"
              element={
                <Layout>
                  <SeatSelectionPage />
                </Layout>
              }
            />
            <Route
              path="/booking/:showtimeId/payment"
              element={
                <Layout>
                  <PaymentPage />
                </Layout>
              }
            />
            <Route
              path="/components"
              element={
                <Layout>
                  <ComponentShowcase />
                </Layout>
              }
            />
            <Route
              path="/payment"
              element={
                <Layout>
                  <PaymentPage />
                </Layout>
              }
            />
            {/* <Route path="/booking-success" element={<Layout><BookingSuccessPage /></Layout>} /> */}
            <Route
              path="/verify-account"
              element={
                <Layout>
                  <VerifyAccountPage />
                </Layout>
              }
            />
            <Route
              path="/Auth/confirm-email"
              element={
                <Layout>
                  <ConfirmEmailPage />
                </Layout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <Layout>
                  <ForgotPasswordPage />
                </Layout>
              }
            />
            <Route
              path="/Auth/reset-password"
              element={
                <Layout>
                  <ResetPasswordPage />
                </Layout>
              }
            />
            <Route
              path="/movie/:id"
              element={
                <Layout>
                  <MovieDetailPage />
                </Layout>
              }
            />
            <Route
              path="/ticket-info"
              element={
                <Layout>
                  <TicketInfo />
                </Layout>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/movies"
              element={
                <AdminLayout>
                  <Movies />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/theaters"
              element={
                <AdminLayout>
                  <Theaters />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/vouchers"
              element={
                <AdminLayout>
                  <Vouchers />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/fnbs"
              element={
                <AdminLayout>
                  <Fnbs />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/showtimes"
              element={
                <AdminLayout>
                  <Showtimes />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/combos"
              element={
                <AdminLayout>
                  <Combos />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminLayout>
                  <HumanResource />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/staffs"
              element={
                <AdminLayout>
                  <Staff />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/configs"
              element={
                <AdminLayout>
                  <Configuration />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/excels"
              element={
                <AdminLayout>
                  <Excel />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/seats"
              element={
                <AdminLayout>
                  <SeatManagement />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/rooms/:roomId/seats"
              element={
                <AdminLayout>
                  <RoomSeatsManagement />
                </AdminLayout>
              }
            />

            {/* 404 page */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              }
            />
          </Routes>
        </Router>
      </ThemeProviderWrapper>
    </AuthProvider>
  );
}

export default App;
