import { useState, useEffect, useCallback, useRef } from "react";
import {
  getFnbsPaginated,
  createFnb,
  updateFnb,
  deleteFnb,
  getFnbById,
} from "../api/services/fnbService";

const useFnbs = (options = {}) => {
  const [fnbs, setFnbs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Use a ref to store the previous options to compare and prevent unnecessary fetches
  const prevOptionsRef = useRef(null);
  const isInitialMount = useRef(true);

  // Fetch fnbs based on current options
  const fetchFnbs = useCallback(
    async (forceRefresh = false) => {
      // Convert options to a string for comparison
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
        console.log("Fetching F&B items with options:", options);

        const data = await getFnbsPaginated(
          options.page || 1,
          options.limit || 10,
          options.search || "",
          options.fnbType,
          options.fnbSortBy,
          options.sortOrder
        );

        // Set fnbs from the response
        setFnbs(data.items || []);

        // Update pagination info
        setPagination({
          currentPage: options.page || 1,
          totalPages: data.totalPages || 1,
          totalItems: data.totalItems || 0,
        });
      } catch (err) {
        setError(err.message || "Failed to fetch F&B items");
        console.error("Error fetching F&B items:", err);
        setFnbs([]);
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  // Only fetch on mount and when options change
  useEffect(() => {
    // Skip on initial mount - we'll manually trigger the first fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchFnbs(true); // Force initial fetch
      return;
    }

    // On subsequent renders, only fetch if options changed
    fetchFnbs();
  }, [fetchFnbs]);

  // Add an F&B item
  const addFnb = async (fnbData) => {
    try {
      await createFnb(fnbData);
      // Refresh the list after adding
      fetchFnbs(true);
      return { success: true };
    } catch (err) {
      console.error("Error adding F&B item:", err);
      return {
        success: false,
        error: err.response?.data?.message || "Failed to add F&B item",
      };
    }
  };

  // Update an F&B item
  const editFnb = async (id, fnbData) => {
    try {
      await updateFnb(id, fnbData);

      // Refresh the list after updating
      fetchFnbs(true);
      return { success: true };
    } catch (err) {
      console.error("Error updating F&B item:", err);
      
      // Extract the most descriptive error message possible
      let errorMessage = "Failed to update F&B item";
      
      if (err.specificMessage) {
        // Use our enhanced error object with specific message
        errorMessage = err.specificMessage;
      } else if (err.response?.data?.message) {
        // Direct access to response data message
        errorMessage = err.response.data.message;
      } else if (err.message) {
        // Fallback to general error message
        errorMessage = err.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: err.response?.data?.errorCode || err.errorCode || "UNKNOWN_ERROR"
      };
    }
  };

  // Delete an F&B item
  const removeFnb = async (id) => {
    try {
      await deleteFnb(id);
      // Refresh the list after deleting
      fetchFnbs(true);
      return { success: true };
    } catch (err) {
      console.error("Error deleting F&B item:", err);
      return {
        success: false,
        error: err.response.data.message || "Failed to delete F&B item",
      };
    }
  };

  // Get an F&B item by ID
  const getFnb = async (id) => {
    try {
      const fnb = await getFnbById(id);
      return fnb;
    } catch (err) {
      console.error("Error getting F&B item:", err);
      return null;
    }
  };

  return {
    fnbs,
    loading,
    error,
    pagination,
    addFnb,
    editFnb,
    removeFnb,
    getFnb,
    refreshFnbs: () => fetchFnbs(true), // Force refresh when called explicitly
  };
};

export default useFnbs;
