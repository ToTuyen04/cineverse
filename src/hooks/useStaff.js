import { useState, useEffect, useCallback } from 'react';
import { 
  getAllStaffs, 
  getStaffByEmail, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  getRoles,
  getTheaters
} from '../api/services/staffService';

export const useStaff = () => {
  const [staffs, setStaffs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Lấy danh sách nhân viên
  const fetchStaffs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllStaffs();
      setStaffs(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu nhân viên. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách vai trò và chi nhánh
  const fetchRolesAndTheaters = useCallback(async () => {
    try {
      const [rolesData, theatersData] = await Promise.all([
        getRoles(),
        getTheaters()
      ]);
      setRoles(rolesData);
      setTheaters(theatersData);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu vai trò và chi nhánh. Vui lòng thử lại sau.');
      console.error(err);
    }
  }, []);

  // Lấy thông tin chi tiết của một nhân viên
  const getStaffDetails = async (email) => {
    try {
      setLoading(true);
      const staffData = await getStaffByEmail(email);
      setSelectedStaff(staffData);
      return staffData;
    } catch (err) {
      setError(`Không thể tải thông tin nhân viên với email ${email}. Vui lòng thử lại sau.`);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Tạo nhân viên mới
  const addStaff = async (staffData) => {
    try {
      setLoading(true);
      const response = await createStaff(staffData);
      
      if (response.isSuccessful) {
        // Thêm nhân viên mới vào danh sách
        const newStaff = {
          email: staffData.email,
          firstName: staffData.firstName,
          lastName: staffData.lastName,
          fullName: `${staffData.firstName} ${staffData.lastName}`,
          phoneNumber: staffData.phoneNumber,
          dateOfBirth: staffData.dateOfBirth,
          // Fix gender - store as numeric value
          gender: parseInt(staffData.gender),
          status: 1, // Mặc định là active
          roleId: staffData.roleId,
          theaterId: staffData.theaterId,
          // Add roleName based on roleId
          roleName: staffData.roleId === 1 ? "Admin" : "Staff"
        };
        
        setStaffs(prevStaffs => [...prevStaffs, newStaff]);
        return {
          success: true,
          staff: newStaff,
          message: response.message || 'Tạo tài khoản nhân viên thành công.'
        };
      } else {
        throw new Error(response.message || 'Tạo nhân viên thất bại');
      }
    } catch (err) {
      setError('Không thể tạo nhân viên mới. Vui lòng thử lại sau.');
      console.error(err);
      
      // Return the error message from the API if available
      if (err.response && err.response.data) {
        return {
          success: false,
          message: err.response.data.message || 'Không thể tạo nhân viên mới.'
        };
      }
      
      // Otherwise return a generic error message
      return {
        success: false,
        message: err.message || 'Không thể tạo nhân viên mới. Vui lòng thử lại sau.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin nhân viên
  const editStaff = async (staffData) => {
    try {
      setLoading(true);
      const response = await updateStaff(staffData);
      
      if (response.isSuccessful) {
        // Cập nhật nhân viên trong danh sách
        const updatedStaff = response.staff;
        setStaffs(prevStaffs => 
          prevStaffs.map(staff => staff.email === updatedStaff.email ? {
            ...updatedStaff,
            // Keep these fields if not included in response
            roleId: staff.roleId,
            theaterId: staff.theaterId
          } : staff)
        );
        return {
          success: true,
          staff: updatedStaff,
          message: response.message || 'Cập nhật thông tin nhân viên thành công.'
        };
      } else {
        throw new Error(response.message || 'Cập nhật nhân viên thất bại');
      }
    } catch (err) {
      setError('Không thể cập nhật thông tin nhân viên. Vui lòng thử lại sau.');
      console.error(err);
      
      // Return the error message from the API if available
      if (err.response && err.response.data) {
        return {
          success: false,
          message: err.response.data.message || 'Không thể cập nhật thông tin nhân viên.'
        };
      }
      
      // Otherwise return a generic error message
      return {
        success: false,
        message: err.message || 'Không thể cập nhật thông tin nhân viên. Vui lòng thử lại sau.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Xóa nhân viên
  const removeStaff = async (email) => {
    try {
      setLoading(true);
      const response = await deleteStaff(email);
      
      if (response.isSuccessful) {
        // Xóa nhân viên khỏi danh sách
        setStaffs(prevStaffs => prevStaffs.filter(staff => staff.email !== email));
        return true;
      } else {
        throw new Error(response.message || 'Xóa nhân viên thất bại');
      }
    } catch (err) {
      setError('Không thể xóa nhân viên. Vui lòng thử lại sau.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchStaffs();
    fetchRolesAndTheaters();
  }, [fetchStaffs, fetchRolesAndTheaters]);

  return {
    staffs,
    roles,
    theaters,
    loading,
    error,
    selectedStaff,
    fetchStaffs,
    getStaffDetails,
    addStaff,
    editStaff,
    removeStaff
  };
};
