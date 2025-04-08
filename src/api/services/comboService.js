/**
 * Service để xử lý các gọi API liên quan đến combo
 */

import apiClient from "./apiClient";

/**
 * Lấy danh sách tất cả combo từ API
 * @returns {Promise} Promise trả về danh sách tất cả combo
 */
export const getAllCombos = async () => {
  try {
    const response = await apiClient.get("/Combos");
    console.log("getAllCombos response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching combos:", error);
    throw error;
  }
};

/**
 * Lấy danh sách combo với phân trang
 * @param {number} pageIndex - Số trang hiện tại
 * @param {number} pageSize - Số combo mỗi trang
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string} sortBy - Sắp xếp theo (CreateAt=0, Name=1)
 * @param {string} sortOrder - Thứ tự sắp xếp (Ascending=0, Descending=1)
 * @returns {Promise} Promise trả về danh sách combo phân trang
 */
export const getCombosPaginated = async (
  pageIndex = 1,
  pageSize = 10,
  searchTerm = null,
  sortBy = null,
  sortOrder = null
) => {
  try {
    // Thử gọi API với endpoint /Combos (với s ở cuối)
    console.log("Trying to fetch from /Combos endpoint"); 
    const response = await apiClient.get("/Combos");
    console.log("Response from /Combos:", response.data);
    
    // Kiểm tra cấu trúc dữ liệu trả về từ API
    if (response.data && response.data.length > 0) {
      console.log("First combo from API:", response.data[0]);
      // Kiểm tra xem combo có chứa comboDetails không
      if (response.data[0].comboDetails) {
        console.log("First combo contains comboDetails:", response.data[0].comboDetails);
      } else {
        console.log("comboDetails not found in first combo");
      }
    }
    
    const allData = response.data || [];
    
    // Xử lý tìm kiếm nếu có
    let filteredData = allData;
    if (searchTerm) {
      filteredData = allData.filter(item => 
        (item.comboName && item.comboName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.comboDescription && item.comboDescription.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Xử lý sắp xếp nếu có - Improved to handle string field names
    if (sortBy !== null && sortBy !== undefined) {
      console.log(`Sorting by field: ${sortBy} in order: ${sortOrder}`);
      
      filteredData.sort((a, b) => {
        let compareResult = 0;
        
        // Handle sorting based on field name string (not numeric codes)
        if (typeof sortBy === 'string') {
          // Get values to compare, handling property names with different case
          const aValue = a[sortBy] ?? a[sortBy.charAt(0).toLowerCase() + sortBy.slice(1)];
          const bValue = b[sortBy] ?? b[sortBy.charAt(0).toLowerCase() + sortBy.slice(1)];
          
          // Log the values for debugging
          console.log(`Comparing: ${aValue} vs ${bValue} for field ${sortBy}`);
          
          if (aValue !== undefined && bValue !== undefined) {
            // Handle different data types
            if (typeof aValue === 'number' && typeof bValue === 'number') {
              compareResult = aValue - bValue;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
              compareResult = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
              compareResult = aValue === bValue ? 0 : aValue ? 1 : -1;
            } else if (aValue instanceof Date && bValue instanceof Date) {
              compareResult = aValue - bValue;
            } else {
              // Convert to string as fallback
              compareResult = String(aValue).localeCompare(String(bValue));
            }
          }
        } else {
          // Keep the original numeric code logic as fallback
          switch(Number(sortBy)) {
            case 0: // Sort by CreateAt
              compareResult = new Date(a.comboCreateAt || 0) - new Date(b.comboCreateAt || 0);
              break;
            case 1: // Sort by Name
              compareResult = (a.comboName || '').localeCompare(b.comboName || '');
              break;
            default:
              compareResult = 0;
          }
        }
        
        // Determine sort direction (asc or desc)
        return sortOrder === "desc" ? -compareResult : compareResult;
      });
      
      console.log("Sorted data result:", filteredData.map(item => item.comboName || item.comboId));
    }
    
    // Thực hiện phân trang tại client
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (pageIndex - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Trả về kết quả phân trang có cấu trúc tương tự như API
    return {
      items: paginatedData,
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItems: totalItems,
      totalPages: totalPages
    };
    
  } catch (error) {
    console.error("Error fetching from /Combos endpoint:", error);
    
    // Nếu API gọi lỗi, thử gọi với endpoint /combos (không có s ở cuối)
    try {
      console.log("Falling back to /combos endpoint");
      const response = await apiClient.get("/combos");
      console.log("Response from /combos:", response.data);
      
      const allData = response.data || [];
      
      // Xử lý tìm kiếm và phân trang tương tự như trên
      let filteredData = allData;
      if (searchTerm) {
        filteredData = allData.filter(item => 
          (item.comboName && item.comboName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.comboDescription && item.comboDescription.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Xử lý sắp xếp - Apply the same fix to the fallback code path
      if (sortBy !== null && sortBy !== undefined) {
        console.log(`Fallback sorting by field: ${sortBy} in order: ${sortOrder}`);
        
        filteredData.sort((a, b) => {
          let compareResult = 0;
          
          // Handle sorting based on field name string
          if (typeof sortBy === 'string') {
            // Get values to compare, handling property names with different case
            const aValue = a[sortBy] ?? a[sortBy.charAt(0).toLowerCase() + sortBy.slice(1)];
            const bValue = b[sortBy] ?? b[sortBy.charAt(0).toLowerCase() + sortBy.slice(1)];
            
            if (aValue !== undefined && bValue !== undefined) {
              // Handle different data types
              if (typeof aValue === 'number' && typeof bValue === 'number') {
                compareResult = aValue - bValue;
              } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                compareResult = aValue.localeCompare(bValue);
              } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                compareResult = aValue === bValue ? 0 : aValue ? 1 : -1;
              } else if (aValue instanceof Date && bValue instanceof Date) {
                compareResult = aValue - bValue;
              } else {
                // Convert to string as fallback
                compareResult = String(aValue).localeCompare(String(bValue));
              }
            }
          } else {
            // Keep the original numeric code logic as fallback
            switch(Number(sortBy)) {
              case 0: // Sort by CreateAt
                compareResult = new Date(a.comboCreateAt || 0) - new Date(b.comboCreateAt || 0);
                break;
              case 1: // Sort by Name
                compareResult = (a.comboName || '').localeCompare(b.comboName || '');
                break;
              default:
                compareResult = 0;
            }
          }
          
          // Determine sort direction
          return sortOrder === "desc" ? -compareResult : compareResult;
        });
      }
      
      // Thực hiện phân trang tại client
      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (pageIndex - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        items: paginatedData,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalItems: totalItems,
        totalPages: totalPages
      };
    } catch (fallbackError) {
      console.error("All API attempts failed:", fallbackError);
      
      // Trả về mảng rỗng nếu tất cả các lần thử đều thất bại
      return {
        items: [],
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalItems: 0,
        totalPages: 0
      };
    }
  }
};

/**
 * Lấy thông tin chi tiết của một combo theo ID
 * @param {number|string} id - ID của combo cần lấy thông tin
 * @returns {Promise} Promise trả về thông tin chi tiết combo
 */
export const getComboById = async (id) => {
  try {
    // Thử gọi API với endpoint /Combos/{id}
    const response = await apiClient.get(`/Combos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching combo with ID ${id} from /Combos endpoint:`, error);
    
    // Nếu lỗi, thử lại với endpoint /combos/{id}
    try {
      const response = await apiClient.get(`/combos/${id}`);
      return response.data;
    } catch (fallbackError) {
      console.error(`Error fetching combo with ID ${id} from /combos endpoint:`, fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Lấy danh sách combo có hiệu lực
 * @returns {Promise} Promise trả về danh sách combo có hiệu lực
 */
export const getAvailableCombos = async () => {
  try {
    // Thử gọi API với endpoint /Combos/available
    const response = await apiClient.get("/Combos/available");
    return response.data;
  } catch (error) {
    console.error("Error fetching available combos from /Combos endpoint:", error);
    
    // Nếu lỗi, thử lại với endpoint /combos/available
    try {
      const response = await apiClient.get("/combos/available");
      return response.data;
    } catch (fallbackError) {
      console.error("Error fetching available combos from /combos endpoint:", fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Tạo combo mới
 * @param {Object} comboData - Dữ liệu combo cần tạo
 * @returns {Promise} Promise trả về thông tin combo đã tạo
 */
export const createCombo = async (comboData) => {
  try {
    // Log FormData content for debugging
    console.log("Creating combo with data:");
    if (comboData instanceof FormData) {
      for (let [key, value] of comboData.entries()) {
        console.log(`${key}: ${typeof value === 'object' ? 'File: ' + (value.name || 'unnamed') : value}`);
      }
    }
    
    // Use the same approach as in movieService.js
    const response = await apiClient.post("/combos", comboData, {
      headers: {
        // Important: Set Content-Type to undefined to let the browser set it correctly
        'Content-Type': undefined
      }
    });

    console.log("Create combo response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating combo with /combos endpoint:", error);
    
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    
    // Try fallback endpoint with same header approach
    try {
      console.log("Falling back to /Combos endpoint");
      const response = await apiClient.post("/Combos", comboData, {
        headers: {
          'Content-Type': undefined
        }
      });
      
      console.log("Create combo fallback response:", response.data);
      return response.data;
    } catch (fallbackError) {
      console.error("Error creating combo with fallback endpoint:", fallbackError);
      
      if (fallbackError.response) {
        console.error("Fallback error response:", fallbackError.response.data);
        console.error("Fallback error status:", fallbackError.response.status);
      }
      
      throw fallbackError;
    }
  }
};

/**
 * Cập nhật thông tin combo
 * @param {number|string} id - ID của combo cần cập nhật
 * @param {Object} comboData - Dữ liệu combo cần cập nhật
 * @returns {Promise} Promise trả về thông tin combo đã cập nhật
 */
export const updateCombo = async (id, comboData) => {
  console.log("*******************************************************");
  console.log(`CALLING UPDATE COMBO API FOR ID ${id} - DIRECT IMPLEMENTATION`);
  console.log("*******************************************************");
  
  // Make sure we have FormData
  if (!(comboData instanceof FormData)) {
    console.error("updateCombo requires FormData but received:", typeof comboData);
    throw new Error("Expected FormData for updating combo");
  }
  
  // Check if we have an image file in the FormData
  let hasImageFile = false;
  let hasUndefinedFnbIds = false;
  let undefinedFnbIdDetails = [];
  
  for (let [key, value] of comboData.entries()) {
    if (key === 'ComboImage' && value instanceof File) {
      hasImageFile = true;
      console.log(`FormData contains image file: ${value.name}, size: ${value.size}, type: ${value.type}`);
    }
    
    // Check for undefined FnbId values and track them for fixing
    if (key.includes('ComboDetails[') && key.includes('].FnbId') && 
        (value === 'undefined' || value === undefined || value === 'null' || value === null || value === '')) {
      hasUndefinedFnbIds = true;
      console.error(`ERROR: ${key} is undefined/null/empty. This will cause API issues.`);
      
      // Try to extract the index
      const match = key.match(/ComboDetails\[(\d+)\]/);
      if (match && match[1]) {
        const index = match[1];
        const detailIdKey = `ComboDetails[${index}].ComboDetailId`;
        const detailId = comboData.get(detailIdKey);
        
        if (detailId) {
          console.log(`Detail ID ${detailId} with index ${index} has undefined FnbId. Will fix this.`);
          undefinedFnbIdDetails.push({
            index: index,
            detailId: detailId,
            fnbIdKey: key
          });
        }
      }
    }
  }
  
  if (!hasImageFile) {
    console.log("No image file found in FormData - existing image will be preserved by backend");
  }
  
  // Pre-fetch the original combo data if we have undefined FnbIds
  if (hasUndefinedFnbIds && undefinedFnbIdDetails.length > 0) {
    console.log(`Found ${undefinedFnbIdDetails.length} details with undefined FnbIds. Fetching original combo data...`);
    
    try {
      // Get original combo data to find the missing FnbIds
      const originalCombo = await getComboById(id);
      
      if (originalCombo && originalCombo.comboDetails && originalCombo.comboDetails.length > 0) {
        console.log("Retrieved original combo with details:", originalCombo);
        
        // Fix each undefined FnbId
        for (const detail of undefinedFnbIdDetails) {
          // Find the matching detail in the original combo
          const originalDetail = originalCombo.comboDetails.find(d => 
            d.comboDetailId == detail.detailId || d.ComboDetailId == detail.detailId
          );
          
          if (originalDetail) {
            // Get the original FnbId (handling different property name cases)
            const originalFnbId = originalDetail.fnbId || originalDetail.FnbId;
            
            if (originalFnbId) {
              console.log(`Found original FnbId=${originalFnbId} for detail ID ${detail.detailId}`);
              
              // Update the FormData
              comboData.delete(detail.fnbIdKey);
              comboData.append(detail.fnbIdKey, originalFnbId);
              console.log(`✅ Fixed ${detail.fnbIdKey} by setting value to ${originalFnbId}`);
            } else {
              console.error(`❌ Could not find FnbId in original detail:`, originalDetail);
            }
          } else {
            console.error(`❌ Could not find original detail with ID ${detail.detailId}`);
          }
        }
      } else {
        console.error("Original combo doesn't have comboDetails array or it's empty");
      }
    } catch (fetchError) {
      console.error("Error fetching original combo:", fetchError);
    }
  }
  
  // Final check to ensure all FormData is valid
  console.log("Final FormData check before sending:");
  let stillHasUndefinedValues = false;
  for (let [key, value] of comboData.entries()) {
    if (value === undefined || value === 'undefined' || value === null || value === 'null' || value === '') {
      console.error(`⚠️ ${key} still has invalid value: "${value}"`);
      stillHasUndefinedValues = true;
    } else {
      console.log(`✓ ${key}: ${typeof value === 'object' ? 'File or object' : value}`);
    }
  }
  
  if (stillHasUndefinedValues) {
    console.warn("WARNING: FormData still contains undefined/null values which may cause API errors");
  }
  
  // Check and fix ComboAvailable value
  if (comboData.has('ComboAvailable')) {
    const availableValue = comboData.get('ComboAvailable');
    console.log(`ComboAvailable original value: ${availableValue}`);
    
    // Ensure boolean values are properly formatted as lowercase strings
    if (availableValue === 'True' || availableValue === 'true' || availableValue === true) {
      comboData.delete('ComboAvailable');
      comboData.append('ComboAvailable', 'true');
      console.log('ComboAvailable set to "true"');
    } else if (availableValue === 'False' || availableValue === 'false' || availableValue === false) {
      comboData.delete('ComboAvailable');
      comboData.append('ComboAvailable', 'false');
      console.log('ComboAvailable set to "false"');
    }
  } else {
    // Default to true if missing
    comboData.append('ComboAvailable', 'true');
    console.log('ComboAvailable missing, defaulted to "true"');
  }
  
  // Log FormData contents
  console.log("FormData contents after fixes:");
  for (let [key, value] of comboData.entries()) {
    console.log(`- ${key}: ${typeof value === 'object' ? 'File or object' : value}`);
  }
  
  try {
    // DIRECT IMPLEMENTATION: Using XMLHttpRequest for maximum control
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // First, check if we need to fetch the original combo to get missing fnbIds
      let needsOriginalCombo = false;
      const detailsWithMissingFnbId = [];
      
      for (let [key, value] of comboData.entries()) {
        if (key.includes('ComboDetails[') && key.includes('].FnbId') && 
            (value === 'undefined' || value === undefined)) {
          needsOriginalCombo = true;
          
          // Extract index and detailId
          const match = key.match(/ComboDetails\[(\d+)\]/);
          if (match && match[1]) {
            const index = match[1];
            const detailIdKey = `ComboDetails[${index}].ComboDetailId`;
            const detailId = comboData.get(detailIdKey);
            
            if (detailId) {
              detailsWithMissingFnbId.push({
                index,
                detailId,
                fnbIdKey: key
              });
            }
          }
        }
      }
      
      // If we have missing FnbIds, fetch the original combo first
      if (needsOriginalCombo && detailsWithMissingFnbId.length > 0) {
        console.log(`Need to fetch original combo to fix ${detailsWithMissingFnbId.length} missing FnbIds`);
        
        // Get the original combo using Fetch API
        const baseUrl = apiClient.defaults.baseURL || 'https://localhost:7212/api';
        fetch(`${baseUrl}/combos/${id}`, {
          method: 'GET',
          credentials: 'include'
        })
        .then(response => response.json())
        .then(originalCombo => {
          console.log("Retrieved original combo to fix missing FnbIds:", originalCombo);
          
          // Fix the missing FnbIds using the original combo data
          if (originalCombo && originalCombo.comboDetails) {
            detailsWithMissingFnbId.forEach(item => {
              const originalDetail = originalCombo.comboDetails.find(
                d => d.comboDetailId == item.detailId || d.ComboDetailId == item.detailId
              );
              
              if (originalDetail) {
                const originalFnbId = originalDetail.fnbId || originalDetail.FnbId;
                console.log(`Found original FnbId=${originalFnbId} for detail with ID ${item.detailId}`);
                
                // Update the FormData with the correct FnbId
                comboData.delete(item.fnbIdKey);
                comboData.append(item.fnbIdKey, originalFnbId);
                console.log(`Fixed ${item.fnbIdKey} by setting value to ${originalFnbId}`);
              }
            });
            
            // Now proceed with the update XHR
            proceedWithXhr();
          } else {
            console.error("Original combo doesn't have comboDetails array");
            proceedWithXhr();
          }
        })
        .catch(fetchError => {
          console.error("Error fetching original combo:", fetchError);
          proceedWithXhr();
        });
      } else {
        // If no fixing needed, proceed directly
        proceedWithXhr();
      }
      
      function proceedWithXhr() {
        // Log all XHR state changes
        xhr.onreadystatechange = function() {
          console.log(`XHR state changed: ${xhr.readyState}, status: ${xhr.status}`);
          
          // Additional debug for image file
          if (xhr.readyState === 1) { // OPENED
            console.log("XHR request opened - checking if ComboImage is in FormData:");
            for (let [key, value] of comboData.entries()) {
              if (key === 'ComboImage') {
                console.log(`Found ComboImage in FormData: ${typeof value === 'object' ? 'File object' : value}`);
                if (typeof value === 'object' && value instanceof File) {
                  console.log(`File details - Name: ${value.name}, Type: ${value.type}, Size: ${value.size} bytes`);
                }
              }
            }
          }
        };
        
        // Setup completion handler
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("XHR Success! Response:", xhr.responseText);
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              console.error("Error parsing response JSON:", e);
              resolve(xhr.responseText);
            }
          } else {
            console.error(`XHR Error! Status: ${xhr.status}, Response:`, xhr.responseText);
            reject(new Error(`Server returned ${xhr.status}: ${xhr.responseText}`));
          }
        };
        
        // Setup error handler
        xhr.onerror = function() {
          console.error("XHR network error occurred");
          reject(new Error("Network error occurred while updating combo"));
        };
        
        // Open the request - direct URL to match backend exactly
        const baseUrl = apiClient.defaults.baseURL || 'https://localhost:7212/api';
        const url = `${baseUrl}/combos/${id}`;
        console.log(`XHR Opening PUT request to: ${url}`);
        
        xhr.open("PUT", url, true);
        
        // Send the FormData directly
        console.log("XHR Sending FormData...");
        xhr.send(comboData);
      }
    });
  } catch (xhrError) {
    console.error("Error in XHR implementation:", xhrError);
    
    // FALLBACK: If XHR fails, try fetch API
    try {
      console.log("Trying fetch API as fallback");
      const baseUrl = apiClient.defaults.baseURL || 'https://localhost:7212/api';
      const response = await fetch(`${baseUrl}/combos/${id}`, {
        method: 'PUT',
        body: comboData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (fetchError) {
      console.error("Error in fetch fallback:", fetchError);
      
      // LAST RESORT: Try axios with explicit options
      console.log("Trying axios as last resort");
      const response = await apiClient.put(`/combos/${id}`, comboData, {
        headers: {
          'Content-Type': undefined,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      return response.data;
    }
  }
};

/**
 * Xóa combo
 * @param {number|string} id - ID của combo cần xóa
 * @returns {Promise} Promise trả về kết quả xóa
 */
export const deleteCombo = async (id) => {
  try {
    // Thử gọi API với endpoint /Combos/{id}
    const response = await apiClient.delete(`/combos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting combo with ID ${id} using /combos endpoint:`, error);
    
    // Nếu lỗi, thử lại với endpoint /combos/{id}
    try {
      const response = await apiClient.delete(`/combos/${id}`);
      return response.data;
    } catch (fallbackError) {
      console.error(`Error deleting combo with ID ${id} using /combos endpoint:`, fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Lấy danh sách chi tiết combo theo ID
 * @param {number|string} id - ID của combo
 * @returns {Promise} Promise trả về danh sách chi tiết combo
 */
export const getComboDetails = async (id) => {
  try {
    // Thử gọi API với endpoint /Combos/{id}/details
    console.log(`===== Fetching combo details for ID: ${id} from /combos/${id}/details =====`);
    const response = await apiClient.get(`/combos/${id}/details`);
    console.log(`===== Response from /combos/${id}/details:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`===== Error fetching from /combos/${id}/details:`, error);
    
    // Nếu lỗi, thử lại với endpoint /combos/{id}/details
    try {
      console.log(`===== Trying fallback to /combos/${id}/details =====`);
      const response = await apiClient.get(`/combos/${id}/details`);
      console.log(`===== Response from /combos/${id}/details:`, response.data);
      return response.data;
    } catch (fallbackError) {
      console.error(`===== Error fetching from /combos/${id}/details:`, fallbackError);
      throw fallbackError; // Ném lỗi ra để xử lý ở phía trên
    }
  }
};

/**
 * Thêm chi tiết combo mới
 * @param {number|string} comboId - ID của combo 
 * @param {Object} detailData - Dữ liệu chi tiết cần thêm (fnbId, quantity)
 * @returns {Promise} Promise trả về thông tin chi tiết đã thêm
 */
export const addComboDetail = async (comboId, detailData) => {
  try {
    // Thử gọi API với endpoint /Combos/{comboId}/details
    const response = await apiClient.post(`/Combos/${comboId}/details`, detailData);
    console.log("Add combo detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error adding combo detail for combo ID ${comboId} using /Combos endpoint:`, error);
    
    // Nếu lỗi, thử lại với endpoint /combos/{comboId}/details
    try {
      const response = await apiClient.post(`/combos/${comboId}/details`, detailData);
      console.log("Add combo detail fallback response:", response.data);
      return response.data;
    } catch (fallbackError) {
      console.error(`Error adding combo detail for combo ID ${comboId} using /combos endpoint:`, fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Cập nhật chi tiết combo
 * @param {number|string} comboId - ID của combo 
 * @param {number|string} detailId - ID của chi tiết cần cập nhật
 * @param {Object} detailData - Dữ liệu chi tiết cần cập nhật (fnbId, quantity)
 * @returns {Promise} Promise trả về thông tin chi tiết đã cập nhật
 */
export const updateComboDetail = async (comboId, detailId, detailData) => {
  try {
    // Thử gọi API với endpoint /Combos/{comboId}/details/{detailId}
    const response = await apiClient.put(`/combos/${comboId}/details/${detailId}`, detailData);
    console.log("Update combo detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating combo detail ID ${detailId} using /combos endpoint:`, error);
    
    // Nếu lỗi, thử lại với endpoint /combos/{comboId}/details/{detailId}
    try {
      const response = await apiClient.put(`/combos/${comboId}/details/${detailId}`, detailData);
      console.log("Update combo detail fallback response:", response.data);
      return response.data;
    } catch (fallbackError) {
      console.error(`Error updating combo detail ID ${detailId} using /combos endpoint:`, fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Xóa chi tiết combo
 * @param {number|string} comboId - ID của combo 
 * @param {number|string} detailId - ID của chi tiết cần xóa
 * @returns {Promise} Promise trả về kết quả xóa
 */
export const deleteComboDetail = async (comboId, detailId) => {
  try {
    // Thử gọi API với endpoint /Combos/{comboId}/details/{detailId}
    const response = await apiClient.delete(`/Combos/${comboId}/details/${detailId}`);
    console.log("Delete combo detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting combo detail ID ${detailId} using /Combos endpoint:`, error);
    
    // Nếu lỗi, thử lại với endpoint /combos/{comboId}/details/{detailId}
    try {
      const response = await apiClient.delete(`/combos/${comboId}/details/${detailId}`);
      console.log("Delete combo detail fallback response:", response.data);
      return response.data;
    } catch (fallbackError) {
      console.error(`Error deleting combo detail ID ${detailId} using /combos endpoint:`, fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Lấy thông tin combo kèm chi tiết
 * @param {number|string} id - ID của combo cần lấy
 * @returns {Promise} Promise trả về thông tin combo kèm chi tiết
 */
export const getComboWithDetails = async (id) => {
  try {
    console.log(`Fetching combo with ID ${id} and including details`);
    
    // Lấy thông tin cơ bản của combo
    const combo = await getComboById(id);
    console.log(`Basic combo info for ID ${id}:`, combo);
    
    if (!combo) {
      throw new Error(`Combo with ID ${id} not found`);
    }
    
    // Kiểm tra nếu combo đã có comboDetails
    if (combo.comboDetails) {
      console.log(`Combo already includes details:`, combo.comboDetails);
    } else {
      // Nếu không có comboDetails hoặc là mảng rỗng, thử lấy chi tiết từ API riêng
      try {
        console.log(`Combo doesn't include details, fetching from API`);
        const details = await getComboDetails(id);
        console.log(`Fetched combo details for ID ${id}:`, details);
        
        // Gán chi tiết vào đối tượng combo
        combo.comboDetails = details || [];
      } catch (detailsError) {
        console.error(`Error fetching combo details for ID ${id}:`, detailsError);
        // Nếu không lấy được chi tiết, gán mảng rỗng
        combo.comboDetails = [];
      }
    }
    
    // Đảm bảo comboDetails luôn là một mảng, không phải null
    if (!combo.comboDetails) {
      combo.comboDetails = [];
    }
    
    return combo;
  } catch (error) {
    console.error(`Error fetching combo with details for ID ${id}:`, error);
    throw error;
  }
};

// Export các hàm API
export default {
  getAllCombos,
  getCombosPaginated,
  getComboById,
  getAvailableCombos,
  createCombo,
  updateCombo,
  deleteCombo,
  getComboDetails,
  addComboDetail,
  updateComboDetail,
  deleteComboDetail,
  getComboWithDetails
};
