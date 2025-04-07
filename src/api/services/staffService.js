import apiClient from './apiClient';

// Lấy danh sách tất cả nhân viên
export const getAllStaffs = async () => {
  try {
    const response = await apiClient.get('/Staff/get-all');
    return response.data.staffs; // Trả về mảng staffs từ response
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
    console.log("API response for getStaffByEmail:", response.data);
    
    // Check if response has expected structure with staff object
    if (response.data && response.data.isSuccessful && response.data.staff) {
      return response.data.staff; // Return just the staff object
    } else {
      // If API response doesn't have expected structure, throw error
      throw new Error(response.data?.message || 'Không thể lấy thông tin nhân viên');
    }
  } catch (error) {
    console.error(`Error fetching staff with email ${email}:`, error);
    throw error;
  }
};

// Tạo nhân viên mới
export const createStaff = async (staffData) => {
  try {
    const response = await apiClient.post('/Staff', staffData);
    
    // Return the full API response including success message
    return {
      isSuccessful: response.data.isSuccessful,
      message: response.data.message,
      staff: {
        email: staffData.email,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        fullName: `${staffData.firstName} ${staffData.lastName}`,
        phoneNumber: staffData.phoneNumber,
        dateOfBirth: staffData.dateOfBirth,
        gender: staffData.gender,
        status: 1, // Mặc định là active
        roleId: staffData.roleId,
        roleName: staffData.roleId === 1 ? "Admin" : "Staff", // Add roleName based on roleId
        theaterId: staffData.theaterId
      },
      userEmail: response.data.userEmail,
      userFullName: response.data.userFullName,
      isStaff: response.data.isStaff,
      role: response.data.role
    };
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
};

// Cập nhật thông tin nhân viên
export const updateStaff = async (staffData) => {
  try {
    const response = await apiClient.put('/Staff/update-staff', staffData);
    console.log('Update staff response:', response.data);
    return response.data; // Trả về response với staff đã được cập nhật
  } catch (error) {
    console.error(`Error updating staff with email ${staffData.email}:`, error);
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

// Xóa nhân viên - giữ lại để tương thích trong tương lai
export const deleteStaff = async (email) => {
  try {
    // Giả sử API xóa nhân viên theo email (hoặc có thể là endpoint khác)
    // const response = await apiClient.delete(`/Staff/email/${encodeURIComponent(email)}`);
    // return response.data;
    
    // Tạm thời sử dụng cách này để giả lập xóa nhân viên (vì API chưa có endpoint xóa)
    console.warn('Delete staff API not implemented yet');
    return { isSuccessful: true, message: "Xóa nhân viên thành công" };
  } catch (error) {
    console.error(`Error deleting staff with email ${email}:`, error);
    throw error;
  }
};

// Lấy danh sách các vai trò - giữ lại để tương thích trong tương lai
export const getRoles = async () => {
  try {
    // Giả sử API lấy danh sách vai trò
    // const response = await apiClient.get('/Role/GetAll');
    // return response.data;
    
    // Tạm thời trả về danh sách vai trò cứng
    return [
      { id: 1, name: "Admin" },
      { id: 2, name: "Staff" }
    ];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Lấy danh sách các chi nhánh - giữ lại để tương thích trong tương lai
export const getTheaters = async () => {
  try {
    // Giả sử API lấy danh sách chi nhánh
    // const response = await apiClient.get('/Theater/GetAll');
    // return response.data;
    
    // Tạm thời trả về danh sách chi nhánh cứng
    return [
      { id: 1, name: "Cinema Đà Nẵng" },
      { id: 2, name: "Cinema Hà Nội" },
      { id: 3, name: "Cinema TP. Hồ Chí Minh" },
      { id: 4, name: "Cinema Huế" },
      { id: 5, name: "Cinema Nha Trang" }
    ];
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
