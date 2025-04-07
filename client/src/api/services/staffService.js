import apiClient from './apiClient';

// Lấy danh sách tất cả nhân viên
export const getAllStaffs = async () => {
  try {
    const response = await apiClient.get('/Staff/GetAll');
    return response.data;
  } catch (error) {
    console.error('Error fetching staffs:', error);
    throw error;
  }
};

// Lấy thông tin 1 nhân viên theo ID
export const getStaffById = async (id) => {
  try {
    const response = await apiClient.get(`/Staff/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff with id ${id}:`, error);
    throw error;
  }
};

// Lấy thông tin nhân viên theo email
export const getStaffByEmail = async (email) => {
  try {
    const response = await apiClient.get(`/Staff/email/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff with email ${email}:`, error);
    throw error;
  }
};

// Tạo nhân viên mới
export const createStaff = async (staffData) => {
  try {
    const response = await apiClient.post('/Staff', staffData);
    return response.data;
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
};

// Cập nhật thông tin nhân viên
export const updateStaff = async (staffData) => {
  try {
    const response = await apiClient.put(`/Staff/${id}`, staffData);
    return response.data;
  } catch (error) {
    console.error(`Error updating staff with id ${id}:`, error);
    throw error;
  }
};

// Cập nhật thông tin staff không cần staffId (sử dụng cho trang Profile)
export const updateStaffProfile = async (profileData) => {
  try {
    console.log("Gửi yêu cầu cập nhật profile:", profileData);
    const response = await apiClient.put(`/Staff/update-staff`, profileData);
    return response.data;
  } catch (error) {
    console.error(`Error updating staff profile for email ${profileData.email}:`, error);
    throw error;
  }
};

// Xóa nhân viên
export const deleteStaff = async (id) => {
  try {
    const response = await apiClient.delete(`/Staff/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting staff with id ${id}:`, error);
    throw error;
  }
};

// Lấy danh sách các vai trò
export const getRoles = async () => {
  try {
    const response = await apiClient.get('/Role/GetAll');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Lấy danh sách các chi nhánh
export const getTheaters = async () => {
  try {
    const response = await apiClient.get('/Theater/GetAll');
    return response.data;
  } catch (error) {
    console.error('Error fetching theaters:', error);
    throw error;
  }
};

// Cập nhật trạng thái nhân viên
export const updateStaffStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/Staff/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating staff status with id ${id}:`, error);
    throw error;
  }
};
