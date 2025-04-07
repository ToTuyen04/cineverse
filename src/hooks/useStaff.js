import { useState, useEffect, useCallback } from 'react';
// Import các service nhưng tạm thời comment để tránh lỗi eslint do chưa sử dụng
// import { 
//   getAllStaffs, 
//   getStaffById, 
//   createStaff, 
//   updateStaff, 
//   deleteStaff, 
//   getRoles,
//   getTheaters
// } from '../api/services/staffService';

export const useStaff = () => {
  // eslint-disable-next-line
  const [staffs, setStaffs] = useState([]);
  // eslint-disable-next-line
  const [roles, setRoles] = useState([]);
  // eslint-disable-next-line
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách nhân viên
  const fetchStaffs = useCallback(async () => {
    try {
      setLoading(true);
      // Bỏ gọi API khi chưa kết nối backend, sử dụng dữ liệu mẫu
      // const data = await getAllStaffs();
      // setStaffs(data);
      
      // Để tạm thời trống, component Staff.jsx đã có dữ liệu mẫu
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
      // Bỏ gọi API khi chưa kết nối backend, sử dụng dữ liệu mẫu
      // const [rolesData, theatersData] = await Promise.all([
      //   getRoles(),
      //   getTheaters()
      // ]);
      // setRoles(rolesData);
      // setTheaters(theatersData);
      
      // Sử dụng dữ liệu mẫu trong component Staff.jsx
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu vai trò và chi nhánh. Vui lòng thử lại sau.');
      console.error(err);
    }
  }, []);

  // Tạo nhân viên mới
  const addStaff = async (staffData) => {
    try {
      setLoading(true);
      // Bỏ gọi API, sử dụng hàm callback trả về dữ liệu tạo mới
      // const newStaff = await createStaff(staffData);
      // setStaffs(prevStaffs => [...prevStaffs, newStaff]);
      
      // Trả về dữ liệu giả định cho component xử lý
      return {
        ...staffData,
        staffId: Math.floor(Math.random() * 1000) + 100, // Random ID
        staffCreateAt: new Date().toISOString()
      };
    } catch (err) {
      setError('Không thể tạo nhân viên mới. Vui lòng thử lại sau.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin nhân viên
  const editStaff = async (id, staffData) => {
    try {
      setLoading(true);
      // Bỏ gọi API, sử dụng hàm callback trả về dữ liệu đã cập nhật
      // const updatedStaff = await updateStaff(id, staffData);
      // setStaffs(prevStaffs => 
      //   prevStaffs.map(staff => staff.staffId === id ? updatedStaff : staff)
      // );
      
      // Trả về dữ liệu giả định cho component xử lý
      return {
        ...staffData,
        staffId: id
      };
    } catch (err) {
      setError('Không thể cập nhật thông tin nhân viên. Vui lòng thử lại sau.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa nhân viên
  const removeStaff = async (id) => {
    try {
      setLoading(true);
      // Bỏ gọi API
      // await deleteStaff(id);
      // setStaffs(prevStaffs => prevStaffs.filter(staff => staff.staffId !== id));
      
      // Sử dụng id trong comment để tránh eslint warning
      // eslint-disable-next-line no-unused-vars
      const staffId = id;
      
      // Trả về thành công mà không gọi API
      return true;
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
    fetchStaffs,
    addStaff,
    editStaff,
    removeStaff
  };
};
