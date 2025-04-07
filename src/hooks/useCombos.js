import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getCombosPaginated, 
  createCombo, 
  updateCombo, 
  deleteCombo, 
  getComboById,
  getComboDetails, 
  addComboDetail,
  updateComboDetail,
  deleteComboDetail,
  getComboWithDetails
} from '../api/services/comboService';

const useCombos = (options = {}) => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Use refs to store previous options and track initial mount
  const prevOptionsRef = useRef(null);
  const isInitialMount = useRef(true);

  // Fetch combos based on current options
  const fetchCombos = useCallback(async (forceRefresh = false) => {
    // Convert options to string for comparison
    const optionsString = JSON.stringify(options);

    // Skip if options haven't changed and not forcing refresh
    if (!forceRefresh && prevOptionsRef.current === optionsString) {
      return;
    }

    // Update the previous options ref
    prevOptionsRef.current = optionsString;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching combos with options:", options);

      const data = await getCombosPaginated(
        options.page || 1,
        options.limit || 10,
        options.search || '',
        options.sortBy,
        options.sortOrder
      );

      // Log để xem cấu trúc dữ liệu
      if (data && data.items && data.items.length > 0) {
        console.log("First combo structure:", data.items[0]);
        console.log("First combo details:", data.items[0].comboDetails);
      }

      // Set combos from the response
      setCombos(data.items || []);

      // Update pagination info
      setPagination({
        currentPage: options.page || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0
      });

    } catch (err) {
      setError(err.message || 'Failed to fetch combos');
      console.error('Error fetching combos:', err);
      setCombos([]);
    } finally {
      setLoading(false);
    }
  }, [options]);

  // Only fetch on mount and when options change
  useEffect(() => {
    // Skip on initial mount - we'll manually trigger the first fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchCombos(true); // Force initial fetch
      return;
    }

    // On subsequent renders, only fetch if options changed
    fetchCombos();
  }, [fetchCombos]);

  // Add a combo
  const addCombo = async (comboData) => {
    try {
      console.log("addCombo called with FormData:", comboData);
      // Check if comboData is not empty
      if (comboData instanceof FormData) {
        let isEmpty = true;
        for (let [key, value] of comboData.entries()) {
          isEmpty = false;
          console.log(`${key}: ${value}`);
        }
        
        if (isEmpty) {
          throw new Error("FormData is empty");
        }
        
        // Ensure ComboType is included with exact property name matching
        if (!comboData.has('ComboType')) {
          comboData.append('ComboType', 'Regular'); // Default value
        }
        
        // Set ComboAvailable to false if it's null or not provided
        if (!comboData.has('ComboAvailable') || comboData.get('ComboAvailable') === 'null') {
          comboData.delete('ComboAvailable'); // Remove if exists
          comboData.append('ComboAvailable', 'false');
        }
      } else {
        throw new Error("Expected FormData object but received something else");
      }
      
      // Log all FormData entries before sending
      console.log("Final FormData entries for create:");
      for (let [key, value] of comboData.entries()) {
        console.log(`${key}: ${typeof value === 'object' ? 'File or object' : value}`);
      }
      
      const result = await createCombo(comboData);
      console.log("Created new combo:", result);
      
      // Refresh the list after adding
      fetchCombos(true);
      return { success: true, data: result };
    } catch (err) {
      console.error('Error adding combo:', err);
      
      // Provide detailed error information
      let errorMessage = err.message || 'Failed to add combo';
      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
        console.error('Error response:', err.response.data);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Update a combo
  const editCombo = async (id, comboData) => {
    try {
      console.log(`editCombo called for ID ${id} with FormData:`, comboData);
      
      // Check if comboData is not empty
      if (comboData instanceof FormData) {
        let isEmpty = true;
        let hasMissingFnbIds = false;
        const missingFnbIdIndices = [];
        
        // First scan: Check for any undefined values in ComboDetails and track them
        for (let [key, value] of comboData.entries()) {
          isEmpty = false;
          console.log(`${key}: ${value}`);
          
          // Check for undefined FnbId values
          if (key.includes('ComboDetails[') && key.includes('].FnbId') && 
             (value === 'undefined' || value === undefined || value === null || value === 'null' || value === '')) {
            hasMissingFnbIds = true;
            
            const match = key.match(/ComboDetails\[(\d+)\]/);
            if (match && match[1]) {
              missingFnbIdIndices.push({
                index: match[1],
                key: key
              });
              console.error(`Found missing FnbId at ${key}. Will try to fix this.`);
            }
          }
        }
        
        if (isEmpty) {
          throw new Error("FormData is empty");
        }
        
        // Fix missing FnbIds by directly fetching the combo first
        if (hasMissingFnbIds && missingFnbIdIndices.length > 0) {
          console.log(`Need to fix ${missingFnbIdIndices.length} missing FnbId values`);
          
          try {
            // Get the complete combo data with details
            console.log(`Fetching complete combo data for ID ${id} to fix missing FnbIds`);
            const originalCombo = await getComboWithDetails(id);
            
            if (originalCombo && originalCombo.comboDetails && originalCombo.comboDetails.length > 0) {
              console.log("Retrieved original combo with details:", originalCombo.comboDetails);
              
              // Find the ComboDetailId for each index with missing FnbId
              for (const item of missingFnbIdIndices) {
                const detailIdKey = `ComboDetails[${item.index}].ComboDetailId`;
                const detailId = comboData.get(detailIdKey);
                
                if (detailId) {
                  console.log(`Looking for original FnbId for detail ID ${detailId}`);
                  
                  // Find the matching detail in the original combo
                  const originalDetail = originalCombo.comboDetails.find(d => 
                    d.comboDetailId == detailId || d.ComboDetailId == detailId
                  );
                  
                  if (originalDetail) {
                    // Get the FnbId from the original detail
                    const originalFnbId = originalDetail.fnbId || originalDetail.FnbId;
                    
                    if (originalFnbId) {
                      console.log(`Found original FnbId=${originalFnbId} for detail ID ${detailId}`);
                      
                      // Update the FormData
                      comboData.delete(item.key);
                      comboData.append(item.key, originalFnbId);
                      console.log(`Fixed ${item.key} with value ${originalFnbId}`);
                    } else {
                      console.error(`Could not find FnbId in original detail:`, originalDetail);
                      // Use a default value that won't break the API
                      comboData.delete(item.key);
                      comboData.append(item.key, '1');
                      console.warn(`Using default FnbId=1 as fallback for ${item.key}`);
                    }
                  } else {
                    console.error(`Could not find original detail with ID ${detailId} in:`, originalCombo.comboDetails);
                    // Use a default value that won't break the API
                    comboData.delete(item.key);
                    comboData.append(item.key, '1');
                    console.warn(`Using default FnbId=1 as fallback for ${item.key}`);
                  }
                }
              }
            } else {
              console.error("Original combo doesn't have comboDetails array");
            }
          } catch (fetchError) {
            console.error("Error fetching original combo data:", fetchError);
          }
        }
        
        // Final check: Make sure no undefined values remain
        let stillHasMissingValues = false;
        for (let [key, value] of comboData.entries()) {
          if (value === undefined || value === 'undefined' || value === null || value === 'null' || value === '') {
            console.error(`WARNING: ${key} still has invalid value: "${value}"`);
            stillHasMissingValues = true;
            
            // Last resort fix for FnbId fields
            if (key.includes('ComboDetails[') && key.includes('].FnbId')) {
              comboData.delete(key);
              comboData.append(key, '1');  // Use a default value as fallback
              console.warn(`Emergency fix: Set ${key} to default value 1`);
            }
          }
        }
        
        // IMPORTANT: Ensure ComboId is included
        if (!comboData.has('ComboId')) {
          comboData.append('ComboId', id);
          console.log(`Added ComboId=${id} to FormData`);
        }
        
        // Ensure ComboType is included with exact property name matching
        if (!comboData.has('ComboType')) {
          comboData.append('ComboType', 'Regular');
          console.log(`Added default ComboType=Regular to FormData`);
        }
        
        // Fix for ComboAvailable boolean issue
        if (comboData.has('ComboAvailable')) {
          const availableValue = comboData.get('ComboAvailable');
          console.log(`Original ComboAvailable value: ${availableValue}`);
          
          // Convert to lowercase string to ensure proper boolean handling
          comboData.delete('ComboAvailable');
          if (availableValue === 'True' || availableValue === 'true' || availableValue === true) {
            comboData.append('ComboAvailable', 'true');
            console.log('ComboAvailable explicitly set to "true"');
          } else {
            comboData.append('ComboAvailable', 'false');
            console.log('ComboAvailable explicitly set to "false"');
          }
        } else {
          comboData.append('ComboAvailable', 'true');
          console.log('ComboAvailable missing, defaulted to "true"');
        }
      } else {
        throw new Error("Expected FormData object but received something else");
      }
      
      // Log all FormData entries for debugging
      console.log("Final FormData entries for update:");
      for (let [key, value] of comboData.entries()) {
        console.log(`${key}: ${typeof value === 'object' ? 'File or object' : value}`);
      }
      
      console.log(`Calling updateCombo API with ID=${id}`);
      const result = await updateCombo(id, comboData);
      console.log("Update API call successful. Result:", result);
      
      // Refresh the list after updating
      fetchCombos(true);
      return { success: true, data: result };
    } catch (err) {
      console.error('Error updating combo:', err);
      
      // Provide detailed error information
      let errorMessage = err.message || 'Failed to update combo';
      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
        console.error('Error response:', err.response.data);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Delete a combo
  const removeCombo = async (id) => {
    try {
      await deleteCombo(id);
      // Refresh the list after deleting
      fetchCombos(true);
      return { success: true };
    } catch (err) {
      console.error('Error deleting combo:', err.response?.data?.message);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete combo' 
      };
    }
  };

  // Get a combo by ID
  const getCombo = async (id) => {
    try {
      const combo = await getComboById(id);
      return combo;
    } catch (err) {
      console.error('Error getting combo:', err);
      return null;
    }
  };

  // Get combo details
  const getComboDetailsById = async (id) => {
    try {
      console.log(`Fetching combo details for ID: ${id}`);
      const details = await getComboDetails(id);
      console.log(`Received combo details for ID ${id}:`, details);
      return details;
    } catch (err) {
      console.error(`Error fetching combo details for ID ${id}:`, err);
      // Nếu API lỗi 404, trả về mảng rỗng (không có chi tiết)
      // thay vì ném lỗi để UI vẫn hiển thị được combo
      if (err.response && err.response.status === 404) {
        console.log("API endpoint not found, returning empty details array");
        return [];
      }
      setError(`Failed to fetch combo details: ${err.message}`);
      throw err;
    }
  };

  // Get a combo by ID with details
  const getComboWithDetailsById = async (id) => {
    try {
      console.log(`Fetching combo with details for ID: ${id}`);
      const combo = await getComboWithDetails(id);
      console.log(`Received combo with details for ID ${id}:`, combo);
      return combo;
    } catch (err) {
      console.error(`Error fetching combo with details for ID ${id}:`, err);
      setError(`Failed to fetch combo with details: ${err.message}`);
      throw err;
    }
  };

  // Add a combo detail
  const addComboDetailItem = async (comboId, detailData) => {
    try {
      const result = await addComboDetail(comboId, detailData);
      return { success: true, data: result };
    } catch (err) {
      console.error('Error adding combo detail:', err);
      return { success: false, error: err.message || 'Failed to add combo detail' };
    }
  };

  // Update a combo detail
  const updateComboDetailItem = async (comboId, detailId, detailData) => {
    try {
      const result = await updateComboDetail(comboId, detailId, detailData);
      return { success: true, data: result };
    } catch (err) {
      console.error('Error updating combo detail:', err);
      return { success: false, error: err.message || 'Failed to update combo detail' };
    }
  };

  // Delete a combo detail
  const removeComboDetail = async (comboId, detailId) => {
    try {
      await deleteComboDetail(comboId, detailId);
      return { success: true };
    } catch (err) {
      console.error('Error deleting combo detail:', err);
      return { success: false, error: err.message || 'Failed to delete combo detail' };
    }
  };

  return {
    combos,
    loading,
    error,
    pagination,
    addCombo,
    editCombo,
    removeCombo,
    getCombo,
    getComboDetails: getComboDetailsById,
    getComboWithDetails: getComboWithDetailsById,
    addComboDetail: addComboDetailItem,
    updateComboDetail: updateComboDetailItem,
    removeComboDetail,
    refreshCombos: () => fetchCombos(true) // Force refresh when called explicitly
  };
};

export default useCombos;