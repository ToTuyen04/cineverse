import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaArrowLeft, FaBirthdayCake, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/common/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import service đăng ký
import { register, checkIsLoggedIn } from '../api/services/authService';

// Styled components - tái sử dụng từ LoginPage
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem 2rem;
`;

const RegisterCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  max-width: 550px;
  width: 100%;
`;

const CardHeader = styled(Card.Header)`
  background: transparent;
  border-bottom: 1px solid #3f425a;
  padding: 1.5rem 1.5rem 1rem;
`;

const CardBody = styled(Card.Body)`
  padding: 1.5rem;
`;

const PageTitle = styled.h1`
  color: #f3f4f6;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: #9ca3af;
  font-size: 0.9rem;
`;

const FormControl = styled(Form.Control)`
  background-color: #1e1e30;
  border: 1px solid #3f425a;
  color: #f3f4f6;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.9rem;
  height: calc(1.5em + 1.5rem); // Đặt chiều cao cố định
  
  &:focus {
    background-color: #1e1e30;
    box-shadow: 0 0 0 0.25rem rgba(249, 55, 110, 0.25);
    border-color: #F9376E;
    color: #f3f4f6;
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

// Cập nhật InputGroup và FieldFeedback để tránh icon bị lệch khi hiển thị lỗi

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 2.25rem; // Tăng margin-bottom để dành chỗ cho thông báo lỗi
`;

const FieldFeedback = styled.div`
  color: ${props => props.valid ? '#4caf50' : '#f44336'};
  font-size: 0.8rem;
  position: absolute; // Đặt vị trí tuyệt đối
  bottom: -1.5rem; // Đưa thông báo lỗi xuống dưới input
  left: 0;
  width: 100%;
`;

// Cập nhật InputIcon để đảm bảo nó luôn căn giữa với input
const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #F9376E;
  z-index: 2;
  height: 16px; // Đặt chiều cao cố định
  display: flex;
  align-items: center;
`;

// Cập nhật TogglePasswordIcon để đảm bảo nó luôn căn giữa với input
const TogglePasswordIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  z-index: 2;
  cursor: pointer;
  height: 16px; // Đặt chiều cao cố định
  display: flex;
  align-items: center;
  
  &:hover {
    color: #f3f4f6;
  }
`;

const BackButton = styled(Button)`
  color: #9ca3af;
  background: transparent;
  border: none;
  padding: 0.6rem;
  margin-right: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    color: #F9376E;
    background-color: rgba(249, 55, 110, 0.1);
    transform: translateX(-2px);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const LoginText = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #9ca3af;
  font-size: 0.9rem;
  
  a {
    color: #F9376E;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;


const RequirementsList = styled.ul`
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.2rem;
  }
  
  .valid {
    color: #4caf50;
  }
  
  .invalid {
    color: #9ca3af;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  background-color: #1e1e30;
  border: 1px solid #3f425a;
  color: #f3f4f6;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.9rem;
  height: calc(1.5em + 1.5rem);
  border-radius: 0.25rem;
  cursor: pointer;
  
  &:focus {
    background-color: #1e1e30;
    box-shadow: 0 0 0 0.25rem rgba(249, 55, 110, 0.25);
    border-color: #F9376E;
    color: #f3f4f6;
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

// Định nghĩa CSS global để tùy chỉnh theme của date picker
const DatePickerWrapperStyles = createGlobalStyle`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker-popper {
    z-index: 999 !important; /* Tăng z-index để hiển thị trên các icon */
  }

  .react-datepicker {
    background-color: #2a2d3e;
    border-color: #3f425a;
    font-family: inherit;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  }
  
  .react-datepicker__header {
    background-color: #1e1e30;
    border-color: #3f425a;
  }
  
  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker-time__header {
    color: #f3f4f6;
  }
  
  .react-datepicker__day {
    color: #f3f4f6;
  }
  
  .react-datepicker__day:hover {
    background-color: #3f425a;
  }
  
  .react-datepicker__day--selected {
    background-color: #F9376E;
  }
  
  .react-datepicker__day--keyboard-selected {
    background-color: rgba(249, 55, 110, 0.5);
  }
  
  .react-datepicker__day--disabled {
    color: #6c757d;
  }
  
  .react-datepicker__navigation-icon::before {
    border-color: #f3f4f6;
  }
  
  /* Sửa lỗi hiển thị dropdown năm */
  .react-datepicker__year-dropdown-container {
    color: #f3f4f6;
    font-weight: normal;
  }
  
  .react-datepicker__year-dropdown {
    background-color: #2a2d3e;
    border-color: #3f425a;
    max-height: 250px;
    overflow-y: auto;
  }
  
  .react-datepicker__year-option {
    color: #f3f4f6;
    padding: 0.4rem;
  }
  
  .react-datepicker__year-option:hover {
    background-color: #3f425a;
  }
  
  .react-datepicker__year-option--selected {
    background-color: #F9376E;
  }
  
  .react-datepicker__year-read-view--down-arrow,
  .react-datepicker__month-read-view--down-arrow,
  .react-datepicker__month-year-read-view--down-arrow {
    border-color: #f3f4f6;
  }
  
  .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before,
  .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
    border-bottom-color: #1e1e30;
  }
  
  /* Cải thiện giao diện select tháng */
  .react-datepicker__month-select,
  .react-datepicker__year-select {
    background-color: #1e1e30 !important;
    color: #f3f4f6 !important;
    border: 1px solid #3f425a !important;
    border-radius: 4px !important;
    padding: 2px 8px !important;
  }
  
  /* Tùy chỉnh giao diện tháng */
  .react-datepicker__month-container {
    background-color: #2a2d3e;
  }
  
  /* Làm nổi bật ngày được chọn */
  .react-datepicker__day--selected {
    background-color: #F9376E !important;
    border-radius: 50% !important;
  }
  
  /* Hiệu ứng hover cho ngày */
  .react-datepicker__day:hover {
    background-color: rgba(249, 55, 110, 0.2) !important;
    border-radius: 50% !important;
  }
`;

// Thêm vào Register.jsx
const SuccessPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const PopupContent = styled.div`
  background-color: #1A1A2E;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
`;

const PopupTitle = styled.h2`
  margin-bottom: 1rem;
  color: #F9376E;
`;

const PopupMessage = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: #f3f4f6;
`;

const PopupButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #F9376E;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e71a5a;
    transform: translateY(-2px);
  }
`;

// Cập nhật style cho RadioGroup và RadioGroupLabel
const RadioGroup = styled.div`
  margin-bottom: 2.25rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #f3f4f6;
  margin-right: 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
`;

const RadioInput = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
  accent-color: #F9376E;
  width: 16px;
  height: 16px;
`;

// Cập nhật RadioGroupLabel để hiển thị inline với các radio buttons
const RadioGroupLabel = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
`;

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 1 // Male = 1
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  // Thêm state cho modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  const navigate = useNavigate();

  // Thêm useEffect để kiểm tra người dùng đã đăng nhập chưa khi vừa vào trang
  useEffect(() => {
    const checkIfLoggedIn = () => {
      if (checkIsLoggedIn()) {
        // Người dùng đã đăng nhập, chuyển về trang chủ
        navigate('/');
      }
    };

    checkIfLoggedIn();
  }, [navigate]);

  // Đơn giản hóa kiểm tra yêu cầu mật khẩu
const passwordRequirements = {
  length: formData.password.length >= 8
};
  // Các hàm validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const validatePhoneNumber = (phone) => {
    const regex = /^(0|84|\+84)([0-9]{9})$/;
    return regex.test(phone);
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validatePassword = (password) => {
    // Yêu cầu ít nhất 8 ký tự 
    return password.length >= 8 ;
  };

  const validateDateOfBirth = (date) => {
    if (!date) return false;

    const today = new Date();
    const birthDate = new Date(date);

    // Chỉ kiểm tra ngày sinh không được trong tương lai
    return birthDate <= today;
  };

  // Xử lý thay đổi trường input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Xóa thông báo lỗi khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  // Điều chỉnh hàm handleChange để hỗ trợ date picker
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date ? date.toISOString().split('T')[0] : ''
    });
    // Xóa thông báo lỗi khi người dùng thay đổi giá trị
    if (errors.dateOfBirth) {
      setErrors({
        ...errors,
        dateOfBirth: null
      });
    }
  };

  // Hàm xử lý thay đổi gender
  const handleGenderChange = (e) => {
    // Chuyển đổi giá trị gender từ chuỗi sang số
    let genderValue;
    switch (e.target.value) {
      case 'Male': genderValue = 0; break;
      case 'Female': genderValue = 1; break;
      case 'Other': genderValue = 2; break;
      default: genderValue = 0;
    }
    
    setFormData({
      ...formData,
      gender: genderValue
    });
  };

  // Kiểm tra form hợp lệ
  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Vui lòng nhập email hợp lệ';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Mật khẩu không đáp ứng yêu cầu';
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!validateName(formData.firstName)) {
      newErrors.firstName = 'Vui lòng nhập họ hợp lệ';
    }

    if (!validateName(formData.lastName)) {
      newErrors.lastName = 'Vui lòng nhập tên hợp lệ';
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại hợp lệ';
    }

    if (!validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Vui lòng nhập ngày sinh hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Xác thực form
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setServerError(null); // Xóa lỗi server trước đó
      
      // Gọi API đăng ký
      const result = await register(formData);
      
      // Hiển thị popup thành công
      setShowSuccessPopup(true);
      setSuccessMessage("Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản trước khi đăng nhập.");
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        gender: 1 // Reset gender về giá trị mặc định số (1 = Male)
      });
      
    } catch (error) {
      console.error("Registration failed:", error);
      
      if (error.message) {
        // Hiển thị lỗi từ server
        setServerError(error.message);
      } else {
        setServerError("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm hàm xử lý đóng modal
  const handleCloseVerifyModal = () => {
    setShowVerifyModal(false);
    // Chuyển hướng đến trang đăng nhập
    navigate('/login', {
      state: {
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        type: 'success'
      }
    });
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Thêm hàm này vào trong component RegisterPage
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 1900;

    // Tạo mảng năm theo các nhóm
    const years = [];

    // Thêm 20 năm gần đây
    for (let year = currentYear; year > currentYear - 20; year--) {
      years.push(year);
    }
    // Thêm các năm theo thập kỷ
    for (let decade = Math.floor((currentYear - 20) / 10) * 10; decade >= 1900; decade -= 10) {
      years.push(decade);
    }

    return years.sort((a, b) => b - a); // Sắp xếp giảm dần
  };

  return (
    <PageContainer>
      <DatePickerWrapperStyles /> {/* Thêm global styles cho date picker */}
      <ContentContainer>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <RegisterCard>
                <CardHeader>
                  <div className="d-flex align-items-center mb-3">
                    <BackButton
                      variant="text"
                      onClick={handleBackToLogin}
                    >
                      <FaArrowLeft size={18} />
                    </BackButton>
                    <div>
                      <PageTitle>Đăng ký tài khoản</PageTitle>
                      <PageSubtitle>Tham gia cùng CineVerse để đặt vé xem phim dễ dàng</PageSubtitle>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  {serverError && (
                    <Alert variant="danger" className="mb-4">
                      {serverError}
                    </Alert>
                  )}
                  <Form noValidate onSubmit={handleSubmit}>
                    <Row>
                      {/* Email */}
                      <Col xs={12}>
                        <InputGroup>
                          <InputIcon>
                            <FaEnvelope />
                          </InputIcon>
                          <FormControl
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            required
                          />
                          {errors.email && <FieldFeedback>{errors.email}</FieldFeedback>}
                        </InputGroup>
                      </Col>
                      {/* Password */}
                      <Col xs={12} md={6}>
                        <InputGroup>
                          <InputIcon>
                            <FaLock />
                          </InputIcon>
                          <FormControl
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            required
                          />
                          <TogglePasswordIcon onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </TogglePasswordIcon>
                          {errors.password && <FieldFeedback>{errors.password}</FieldFeedback>}
                        </InputGroup>
                        {/* Password requirements */}
                        {formData.password && (
                          <RequirementsList>
                            <li className={passwordRequirements.length ? 'valid' : 'invalid'}>
                              Ít nhất 8 ký tự
                            </li>
                          </RequirementsList>
                        )}
                      </Col>
                      {/* Confirm Password */}
                      <Col xs={12} md={6}>
                        <InputGroup>
                          <InputIcon>
                            <FaLock />
                          </InputIcon>
                          <FormControl
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isInvalid={!!errors.confirmPassword}
                            required
                          />
                          <TogglePasswordIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </TogglePasswordIcon>
                          {errors.confirmPassword && <FieldFeedback>{errors.confirmPassword}</FieldFeedback>}
                        </InputGroup>
                      </Col>
                      {/* First Name */}
                      <Col xs={12} md={6}>
                        <InputGroup>
                          <InputIcon>
                            <FaUser />
                          </InputIcon>
                          <FormControl
                            type="text"
                            name="firstName"
                            placeholder="Họ"
                            value={formData.firstName}
                            onChange={handleChange}
                            isInvalid={!!errors.firstName}
                            required
                          />
                          {errors.firstName && <FieldFeedback>{errors.firstName}</FieldFeedback>}
                        </InputGroup>
                      </Col>
                      {/* Last Name */}
                      <Col xs={12} md={6}>
                        <InputGroup>
                          <InputIcon>
                            <FaUser />
                          </InputIcon>
                          <FormControl
                            type="text"
                            name="lastName"
                            placeholder="Tên"
                            value={formData.lastName}
                            onChange={handleChange}
                            isInvalid={!!errors.lastName}
                            required
                          />
                          {errors.lastName && <FieldFeedback>{errors.lastName}</FieldFeedback>}
                        </InputGroup>
                      </Col>
                      {/* Phone Number */}
                      <Col xs={12} md={6}>
                        <InputGroup>
                          <InputIcon>
                            <FaPhone />
                          </InputIcon>
                          <FormControl
                            type="tel"
                            name="phoneNumber"
                            placeholder="Số điện thoại"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            isInvalid={!!errors.phoneNumber}
                            required
                          />
                          {errors.phoneNumber && <FieldFeedback>{errors.phoneNumber}</FieldFeedback>}
                        </InputGroup>
                      </Col>

                      {/* Date of Birth & Gender - Đặt chúng vào cùng một hàng */}
                      <Col xs={12} md={6}>
                        <InputGroup>
                          <InputIcon>
                            <FaBirthdayCake />
                          </InputIcon>
                          <StyledDatePicker
                            selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Ngày sinh"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={15}
                            maxDate={new Date()}
                            minDate={new Date(1900, 0, 1)}
                            className={errors.dateOfBirth ? "is-invalid" : ""}
                            popperProps={{
                              positionFixed: true
                            }}
                            renderCustomHeader={({
                              date,
                              changeYear,
                              changeMonth,
                              decreaseMonth,
                              increaseMonth,
                              prevMonthButtonDisabled,
                              nextMonthButtonDisabled,
                            }) => (
                              <div
                                style={{
                                  margin: 10,
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={decreaseMonth}
                                  disabled={prevMonthButtonDisabled}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#f3f4f6',
                                    cursor: prevMonthButtonDisabled ? 'not-allowed' : 'pointer',
                                    padding: '0 8px'
                                  }}
                                >
                                  {"<"}
                                </button>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <select
                                    value={date.getMonth()}
                                    onChange={({ target: { value } }) => changeMonth(Number(value))}
                                    style={{
                                      backgroundColor: "#1e1e30",
                                      color: "#f3f4f6",
                                      border: "1px solid #3f425a",
                                      padding: "2px 5px",
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {[
                                      "Tháng 1",
                                      "Tháng 2",
                                      "Tháng 3",
                                      "Tháng 4",
                                      "Tháng 5",
                                      "Tháng 6",
                                      "Tháng 7",
                                      "Tháng 8",
                                      "Tháng 9",
                                      "Tháng 10",
                                      "Tháng 11",
                                      "Tháng 12",
                                    ].map((month, i) => (
                                      <option key={month} value={i}>
                                        {month}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={date.getFullYear()}
                                    onChange={({ target: { value } }) => changeYear(Number(value))}
                                    style={{
                                      backgroundColor: "#1e1e30",
                                      color: "#f3f4f6",
                                      border: "1px solid #3f425a",
                                      padding: "2px 5px",
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {/* Sử dụng cách render năm khác, nhóm theo thập kỷ */}
                                    {generateYearOptions().map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={increaseMonth}
                                  disabled={nextMonthButtonDisabled}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#f3f4f6',
                                    cursor: nextMonthButtonDisabled ? 'not-allowed' : 'pointer',
                                    padding: '0 8px'
                                  }}
                                >
                                  {">"}
                                </button>
                              </div>
                            )}
                          />
                          {errors.dateOfBirth && <FieldFeedback>
                            {errors.dateOfBirth === 'Vui lòng nhập ngày sinh hợp lệ (Phải từ 13 tuổi trở lên)'
                              ? 'Vui lòng nhập ngày sinh hợp lệ'
                              : errors.dateOfBirth}
                          </FieldFeedback>}
                        </InputGroup>
                      </Col>

                      {/* Gender */}
                      <Col xs={12} md={6}>
                        <RadioGroup>
                          <div className="d-flex align-items-center">
                            <RadioGroupLabel>Giới tính</RadioGroupLabel>
                            <div className="d-flex">
                              <RadioLabel>
                                <RadioInput
                                  type="radio"
                                  name="gender"
                                  value="Male"
                                  checked={formData.gender === 1}
                                  onChange={handleGenderChange}
                                />
                                Nam
                              </RadioLabel>
                              <RadioLabel>
                                <RadioInput
                                  type="radio"
                                  name="gender"
                                  value="Female"
                                  checked={formData.gender === 2}
                                  onChange={handleGenderChange}
                                />
                                Nữ
                              </RadioLabel>
                              <RadioLabel>
                                <RadioInput
                                  type="radio"
                                  name="gender"
                                  value="Other"
                                  checked={formData.gender === 3}
                                  onChange={handleGenderChange}
                                />
                                Khác
                              </RadioLabel>
                            </div>
                          </div>
                        </RadioGroup>
                      </Col>
                    </Row>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      style={{ width: '100%', padding: '0.75rem', fontWeight: '500', marginTop: '1rem' }}
                    >
                      {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                    </Button>
                    <LoginText>
                      Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                    </LoginText>
                  </Form>
                </CardBody>
              </RegisterCard>
            </Col>
          </Row>
        </Container>
      </ContentContainer>
      <Modal
        show={showVerifyModal}
        onHide={handleCloseVerifyModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <RegisterCard style={{ margin: 0, boxShadow: 'none' }}>
          <CardHeader>
            <PageTitle style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              Xác thực tài khoản
            </PageTitle>
          </CardHeader>

          <CardBody>
            <PageSubtitle style={{
              textAlign: 'center',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              color: '#f3f4f6'
            }}>
              Chúng tôi đã gửi một email xác thực đến <strong>{formData.email}</strong>.
              Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để hoàn tất đăng ký.
              <br/><br/>
              <strong>Lưu ý:</strong> Nếu bạn không thấy email trong hộp thư đến, hãy kiểm tra thư mục spam hoặc thùng rác.
            </PageSubtitle>

            <Button
              variant="primary"
              onClick={handleCloseVerifyModal}
              style={{ width: '100%', padding: '0.75rem', fontWeight: '500' }}
            >
              Đã hiểu
            </Button>
          </CardBody>
        </RegisterCard>
      </Modal>
      <SuccessPopup show={showSuccessPopup}>
        <PopupContent>
          <PopupTitle>Đăng ký thành công!</PopupTitle>
          <PopupMessage>{successMessage}</PopupMessage>
          <PopupButton onClick={() => {
            setShowSuccessPopup(false);
            navigate('/login');
          }}>
            Đi đến đăng nhập
          </PopupButton>
        </PopupContent>
      </SuccessPopup>
    </PageContainer>
  );
};

export default RegisterPage;