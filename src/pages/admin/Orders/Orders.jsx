import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import OrderList from "./OrderList";
import OrderDetail from "./OrderDetail";
import OrderFilters from "./OrderFilters";

// Chỉ import fetchOrdersMock
// import { fetchOrders, fetchOrdersMock } from "../../../api/services/orderService";
import { fetchOrders } from "../../../api/services/orderService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: null,
    dateTo: null,
    searchTerm: "",
  });

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);

        // Sử dụng mock data
        // const data = await fetchOrdersMock();

        // Sử dụng API thật
        const data = await fetchOrders();

        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...orders];

    // Filter by status
    if (filters.status) {
      result = result.filter((order) => order.orderStatus === filters.status);
    }

    // Filter by date range
    if (filters.dateFrom && filters.dateTo) {
      result = result.filter((order) => {
        const orderDate = new Date(order.orderCreateAt);
        return orderDate >= filters.dateFrom && orderDate <= filters.dateTo;
      });
    }

    // Filter by search term (order ID, email or phone)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderId.toString().includes(term) ||
          order.orderEmail?.toLowerCase().includes(term) ||
          order.orderPhone?.includes(term) ||
          order.orderName?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(result);
  }, [filters, orders]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
  };

  return (
    <Box>
      {/* Page Title - với căn lề trái */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="left"
        sx={{ mb: 3 }}
      >
        Quản lý đơn hàng
      </Typography>

      {/* Filter Section */}
      <OrderFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Content Section - đã bỏ Paper bao ngoài */}
      <Box sx={{ mt: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <OrderList
            orders={filteredOrders}
            onSelectOrder={handleSelectOrder}
          />
        )}
      </Box>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <OrderDetail order={selectedOrder} onClose={handleCloseDetail} />
      )}
    </Box>
  );
};

export default Orders;
