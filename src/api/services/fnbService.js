import apiClient from "./apiClient";

/**
 * Get all F&B items
 * @returns {Promise} Promise that returns all F&B items
 */
export const getAllFnbs = async () => {
  try {
    const response = await apiClient.get("/fnbs");
    return response.data;
  } catch (error) {
    console.error("Error fetching F&B items:", error);
    throw error;
  }
};

/**
 * Get paginated list of F&B items
 * @param {number} pageIndex - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {string} searchTerm - Search keyword
 * @param {number} fnbType - Filter by type (Food=0, Beverage=1)
 * @param {string} fnbSortBy - Sort by (Name=0, Type=1, Price=2)
 * @param {string} sortOrder - Sort order (Ascending=0, Descending=1)
 * @returns {Promise} Promise that returns paginated F&B list
 */
export const getFnbsPaginated = async (
  pageIndex = 1,
  pageSize = 5,
  searchTerm = null,
  fnbType = null,
  fnbSortBy = null,
  sortOrder = null
) => {
  try {
    // Gọi API lấy toàn bộ danh sách F&B thay vì sử dụng endpoint phân trang
    const response = await apiClient.get("/fnbs");
    const allData = response.data;

    // Xử lý tìm kiếm nếu có
    let filteredData = allData;
    if (searchTerm) {
      filteredData = allData.filter(
        (item) =>
          item.fnbName &&
          item.fnbName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Xử lý lọc theo loại nếu có
    if (fnbType !== null && fnbType !== undefined) {
      filteredData = filteredData.filter(
        (item) => item.fnbType === Number(fnbType)
      );
    }

    // Xử lý sắp xếp nếu có
    if (fnbSortBy !== null && fnbSortBy !== undefined) {
      filteredData.sort((a, b) => {
        let compareResult = 0;
        switch (Number(fnbSortBy)) {
          case 0: // Sort by Name
            compareResult = (a.fnbName || "").localeCompare(b.fnbName || "");
            break;
          case 1: // Sort by Type
            compareResult = (a.fnbType || 0) - (b.fnbType || 0);
            break;
          case 2: // Sort by Price
            compareResult = (a.fnbListPrice || 0) - (b.fnbListPrice || 0);
            break;
          default:
            compareResult = 0;
        }
        return Number(sortOrder) === 1 ? -compareResult : compareResult; // 1 is descending
      });
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
      totalPages: totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated F&B items:", error);
    throw error;
  }
};

/**
 * Get F&B item details by ID
 * @param {number|string} id - F&B item ID
 * @returns {Promise} Promise that returns F&B item details
 */
export const getFnbById = async (id) => {
  try {
    const response = await apiClient.get(`/fnbs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching F&B item with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get available F&B items
 * @returns {Promise} Promise that returns list of available F&B items
 */
export const getAvailableFnbs = async () => {
  try {
    const response = await apiClient.get("/fnbs/available");
    return response.data;
  } catch (error) {
    console.error("Error fetching available F&B items:", error);
    throw error;
  }
};

/**
 * Get F&B items by type
 * @param {number} type - F&B type (Food=0, Beverage=1)
 * @returns {Promise} Promise that returns F&B items of specified type
 */
export const getFnbsByType = async (type) => {
  try {
    const response = await apiClient.get(`/fnbs/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching F&B items of type ${type}:`, error);
    throw error;
  }
};

/**
 * Search F&B items
 * @param {string} query - Search keyword
 * @param {number} pageIndex - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {string} additionalParams - Additional parameters
 * @returns {Promise} Promise that returns matching F&B items
 */
export const searchFnbs = async (
  query,
  pageIndex = 1,
  pageSize = 10,
  additionalParams = ""
) => {
  try {
    const url = `/fnbs/${pageIndex}/${pageSize}?searchTerm=${encodeURIComponent(
      query
    )}${additionalParams ? `&${additionalParams}` : ""}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error searching F&B items with query "${query}":`, error);
    throw error;
  }
};

/**
 * Create new F&B item
 * @param {FormData} fnbData - F&B item data to create
 * @returns {Promise} Promise that returns created F&B item
 */
export const createFnb = async (fnbData) => {
  try {
    const response = await apiClient.post("/fnbs", fnbData, {
      headers: {
        "Content-Type": undefined, // Let browser set correct content type for FormData
      },
    });

    console.log("Create F&B response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating F&B item:", error);

    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }

    throw error;
  }
};

/**
 * Update F&B item
 * @param {number|string} id - ID of F&B item to update
 * @param {FormData} fnbData - Updated F&B item data
 * @returns {Promise} Promise that returns updated F&B item
 */
export const updateFnb = async (id, fnbData) => {
  try {
    // Create a new FormData instance if fnbData isn't already FormData
    const formData = fnbData instanceof FormData ? fnbData : new FormData();

    const response = await apiClient.put(`/fnbs/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Set correct content type
      },
    });

    console.log("Update F&B response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating F&B item:", error);

    // Enhanced error extraction for better messaging
    if (error.response && error.response.data) {
      // If the API returns a structured error with a message field
      if (error.response.data.message) {
        throw {
          ...error,
          specificMessage: error.response.data.message,
          errorCode: error.response.data.errorCode || 'UNKNOWN_ERROR'
        };
      }
    }

    throw error;
  }
};

/**
 * Delete F&B item
 * @param {number|string} id - ID of F&B item to delete
 * @returns {Promise} Promise that returns deletion result
 */
export const deleteFnb = async (id) => {
  try {
    const response = await apiClient.delete(`/fnbs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting F&B item with ID ${id}:`, error);
    throw error;
  }
};

// Export all functions
export default {
  getAllFnbs,
  getFnbsPaginated,
  getFnbById,
  getAvailableFnbs,
  getFnbsByType,
  searchFnbs,
  createFnb,
  updateFnb,
  deleteFnb,
};
