import { useState, useCallback } from 'react';
import axios from 'axios';

const useVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  // Get all vouchers without pagination
  const getAllVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://localhost:7212/api/Voucher');
      
      // Process the API response (which returns an array directly)
      const processedVouchers = response.data.map(voucher => ({
        ...voucher,
        // Multiply by 100 to display as percentage (API returns decimal values like 0.1 for 10%)
        voucherDiscount: voucher.voucherDiscount * 100 
      }));
      
      setVouchers(processedVouchers);
      
      // Update pagination info based on total items
      setPagination({
        currentPage: 1,
        pageSize: processedVouchers.length,
        totalCount: processedVouchers.length,
        totalPages: 1
      });
      
      return processedVouchers;
    } catch (err) {
      console.error('Error fetching all vouchers:', err);
      setError('Failed to load vouchers. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch vouchers with pagination and search
  const refreshVouchers = useCallback(async (page = 1, pageSize = 10, searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://localhost:7212/api/Voucher', {
        params: {
          pageNumber: page,
          pageSize,
          search: searchTerm
        }
      });

      // Check if the response is an array (non-paginated) or object (paginated)
      let vouchersData;
      if (Array.isArray(response.data)) {
        // Direct array response - process it
        vouchersData = response.data.map(voucher => ({
          ...voucher,
          // Convert decimal to percentage
          voucherDiscount: voucher.voucherDiscount * 100
        }));
        
        setPagination({
          currentPage: 1,
          pageSize: vouchersData.length,
          totalCount: vouchersData.length,
          totalPages: 1
        });
      } else {
        // Paginated response with data property
        vouchersData = (response.data.data || []).map(voucher => ({
          ...voucher,
          // Convert decimal to percentage
          voucherDiscount: voucher.voucherDiscount * 100
        }));
        
        setPagination({
          currentPage: response.data.currentPage || page,
          pageSize: response.data.pageSize || pageSize,
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 0
        });
      }

      setVouchers(vouchersData);
      return vouchersData;
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError('Failed to load vouchers. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get voucher by ID
  const getVoucher = useCallback(async (voucherId) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://localhost:7212/api/Voucher/${voucherId}`);
      const voucherData = response.data.data || response.data;
      
      // Convert discount from decimal to percentage
      if (voucherData && voucherData.voucherDiscount !== undefined) {
        voucherData.voucherDiscount *= 100;
      }
      
      return voucherData;
    } catch (err) {
      console.error(`Error fetching voucher ${voucherId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new voucher
  const addVoucher = useCallback(async (voucherData) => {
    setLoading(true);
    try {
      // Convert percentage back to decimal for API
      const apiData = {
        ...voucherData,
        voucherDiscount: voucherData.voucherDiscount / 100
      };
      
      const response = await axios.post('https://localhost:7212/api/Voucher', apiData);
      await refreshVouchers();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error adding voucher:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  }, [refreshVouchers]);

  // Edit voucher
  const editVoucher = useCallback(async (voucherId, voucherData) => {
    setLoading(true);
    try {
      // Convert percentage back to decimal for API
      const apiData = {
        ...voucherData,
        voucherDiscount: voucherData.voucherDiscount / 100
      };
      
      const response = await axios.put(`https://localhost:7212/api/Voucher/${voucherId}`, apiData);
      await refreshVouchers();
      return { success: true, data: response.data };
    } catch (err) {
      console.error(`Error updating voucher ${voucherId}:`, err);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  }, [refreshVouchers]);

  // Remove voucher
  const removeVoucher = useCallback(async (voucherId) => {
    setLoading(true);
    try {
      await axios.delete(`https://localhost:7212/api/Voucher/${voucherId}`);
      await refreshVouchers();
      return { success: true };
    } catch (err) {
      console.error(`Error deleting voucher ${voucherId}:`, err);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  }, [refreshVouchers]);

  // Search vouchers with pagination
  const searchVouchers = useCallback(async (searchTerm, page = 1, pageSize = 10) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return await refreshVouchers(page, pageSize, '');
    }
    
    setLoading(true);
    setError(null);
    try {
      // Use the search endpoint with pagination parameters
      const response = await axios.get(`https://localhost:7212/api/Voucher/search`, {
        params: {
          name: searchTerm,
          pageNumber: page,
          pageSize
        }
      });
      
      // Process the API response
      let processedVouchers;
      let paginationInfo;
      
      if (Array.isArray(response.data)) {
        // Handle array response (no pagination info)
        processedVouchers = response.data.map(voucher => ({
          ...voucher,
          voucherDiscount: voucher.voucherDiscount * 100 
        }));
        
        paginationInfo = {
          currentPage: 1,
          pageSize: processedVouchers.length,
          totalCount: processedVouchers.length,
          totalPages: 1
        };
      } else {
        // Handle paginated response
        processedVouchers = (response.data.data || []).map(voucher => ({
          ...voucher,
          voucherDiscount: voucher.voucherDiscount * 100
        }));
        
        paginationInfo = {
          currentPage: response.data.currentPage || page,
          pageSize: response.data.pageSize || pageSize,
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 0
        };
      }
      
      setVouchers(processedVouchers);
      setPagination(paginationInfo);
      
      return processedVouchers;
    } catch (err) {
      console.error('Error searching vouchers:', err);
      setError('Failed to search vouchers. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [refreshVouchers]);

  return {
    vouchers,
    loading,
    error,
    pagination,
    refreshVouchers,
    getAllVouchers,
    getVoucher,
    addVoucher,
    editVoucher,
    removeVoucher,
    searchVouchers // Export the search function
  };
};

export default useVouchers;