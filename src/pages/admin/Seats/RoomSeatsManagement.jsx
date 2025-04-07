import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Modal, Dropdown, Badge, Table, Nav } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaChair, FaArrowLeft, FaEdit, FaSync, FaInfoCircle, FaLock, FaLockOpen,
  FaPlus, FaTrash, FaSave, FaTimes, FaCheck, FaEye, FaSearch, FaList 
} from 'react-icons/fa';
import {
  getChairsByRoom, updateChairStatus, updateChairType,
  createChairs, updateChairs, deleteChairs
} from '../../../api/services/seatService';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// Styled Components
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
  
  // Thêm media query cho khi drawer đóng
  @media (max-width: 992px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0;
  color: ${props => props.theme === 'dark' ? '#fff' : '#333'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: #F9376E; // Màu chính của AdminLayout
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const BackButton = styled(Button)`
  padding: 0.4rem 0.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  .search-input {
    position: relative;
    flex-grow: 1;
    max-width: 400px;
    
    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }
    
    input {
      padding-left: 35px;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    
    .search-input {
      max-width: 100%;
      margin-bottom: 0.5rem;
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-left: auto;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
`;

const TabContainer = styled.div`
  margin-bottom: 1rem;
  
  .nav-tabs {
    border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#dee2e6'};
    
    .nav-item {
      margin-bottom: -1px;
    }
    
    .nav-link {
      border: 1px solid transparent;
      border-top-left-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
      color: ${props => props.theme === 'dark' ? '#ccc' : '#495057'};
      cursor: pointer;
      
      &.active {
        color: #F9376E;
        background-color: ${props => props.theme === 'dark' ? '#333' : '#fff'};
        border-color: ${props => props.theme === 'dark' ? '#444' : '#dee2e6'} 
                       ${props => props.theme === 'dark' ? '#444' : '#dee2e6'} 
                       ${props => props.theme === 'dark' ? '#333' : '#fff'};
      }
      
      &:hover:not(.active) {
        border-color: ${props => props.theme === 'dark' ? '#555' : '#e9ecef'} 
                       ${props => props.theme === 'dark' ? '#555' : '#e9ecef'} 
                       ${props => props.theme === 'dark' ? '#444' : '#dee2e6'};
      }
    }
  }
`;

const TabContent = styled.div`
  padding: 1rem 0;
`;

// Styled Components cho view sơ đồ
const ScreenArea = styled.div`
  height: 10px;
  background: linear-gradient(to right, #ccc, #eee, #ccc);
  border-radius: 50%;
  margin: 0 auto 40px;
  width: 70%;
  position: relative;
  
  &:after {
    content: 'Màn hình';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.9rem;
    color: #777;
  }
`;

const SeatsContainer = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 900px;
`;

const SeatRow = styled.div`
  display: flex;
  margin-bottom: 10px;
  align-items: center;
  
  .row-label {
    width: 30px;
    text-align: center;
    font-weight: bold;
    color: #666;
  }
`;

const SeatWrapper = styled.div`
  margin: 0 5px;
  position: relative;
`;

const Seat = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  transition: all 0.2s;
  
  &.standard {
    background-color: ${props => props.disabled ? '#ccc' : '#64b5f6'};
    color: ${props => props.disabled ? '#999' : 'white'};
  }
  
  &.vip {
    background-color: ${props => props.disabled ? '#ccc' : '#9c27b0'};
    color: ${props => props.disabled ? '#999' : 'white'};
  }
  
  &.couple {
    background-color: ${props => props.disabled ? '#ccc' : '#e91e63'};
    color: ${props => props.disabled ? '#999' : 'white'};
    width: 85px;
  }
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 8px rgba(0,0,0,0.2)'};
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 5px;
    background-color: ${props => props.disabled ? '#aaa' : '#555'};
    border-radius: 0 0 2px 2px;
  }
`;

const StatusBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#4caf50' : '#f44336'};
  border: 2px solid white;
  z-index: 1;
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 0 10px 10px;
  
  .box {
    width: 24px;
    height: 24px;
    border-radius: 4px 4px 0 0;
    margin-right: 8px;
  }
  
  .label {
    font-size: 0.9rem;
    color: #555;
  }
`;

const TableActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  button {
    padding: 0.25rem 0.5rem;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

function RoomSeatsManagement() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [chairs, setChairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [chairTypeFilter, setChairTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'visual'
  
  // State for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChair, setEditingChair] = useState(null);
  
  // State for creating
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChairs, setNewChairs] = useState([{ 
    chairTypeId: 1, 
    chairName: '', 
    chairPosition: '', 
    chairStatus: true 
  }]);
  
  // State for bulk actions
  const [selectedChairs, setSelectedChairs] = useState([]);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(''); // 'status', 'type', 'delete'
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chairToDelete, setChairToDelete] = useState(null);
  
  // Fetch chairs
  useEffect(() => {
    const fetchChairs = async () => {
      try {
        setLoading(true);
        const response = await getChairsByRoom(roomId);
        if (response.success) {
          setChairs(response.data);
        } else {
          setError(response.message || 'Không thể lấy danh sách ghế');
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi lấy danh sách ghế');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChairs();
  }, [roomId, refreshTrigger]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Filter and sort chairs
  const filteredChairs = useMemo(() => {
    return chairs.filter(chair => {
      // Search term filter
      if (searchTerm && !chair.chairName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Chair type filter
      if (chairTypeFilter !== 'all' && chair.chairTypeId !== parseInt(chairTypeFilter)) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active';
        if (chair.chairStatus !== isActive) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by row (A, B, C...) then by number
      const rowA = a.chairPosition.charAt(0);
      const rowB = b.chairPosition.charAt(0);
      
      if (rowA !== rowB) {
        return rowA.localeCompare(rowB);
      }
      
      const numA = parseInt(a.chairPosition.substring(1));
      const numB = parseInt(b.chairPosition.substring(1));
      return numA - numB;
    });
  }, [chairs, searchTerm, chairTypeFilter, statusFilter]);
  
  // Organize chairs by row for visual view
  const organizedSeats = useMemo(() => {
    const seatsByRow = {};
    
    filteredChairs.forEach(chair => {
      const rowName = chair.chairPosition.charAt(0);
      
      if (!seatsByRow[rowName]) {
        seatsByRow[rowName] = [];
      }
      
      seatsByRow[rowName].push(chair);
    });
    
    // Sort chairs within each row
    Object.keys(seatsByRow).forEach(row => {
      seatsByRow[row].sort((a, b) => {
        const aNum = parseInt(a.chairPosition.substring(1));
        const bNum = parseInt(b.chairPosition.substring(1));
        return aNum - bNum;
      });
    });
    
    return seatsByRow;
  }, [filteredChairs]);
  
  // Handle functions
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setChairTypeFilter('all');
    setStatusFilter('all');
  };
  
  // Edit functions
  const handleEditChair = (chair) => {
    setEditingChair({...chair});
    setShowEditModal(true);
  };
  
  const handleEditChange = (field, value) => {
    setEditingChair(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveEdit = async () => {
    try {
      const response = await updateChairs(roomId, [editingChair]);
      if (response.success) {
        setSuccessMessage('Cập nhật ghế thành công!');
        setShowEditModal(false);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(response.message || 'Không thể cập nhật ghế.');
      }
    } catch (error) {
      console.error('Error updating chair:', error);
      alert('Đã xảy ra lỗi khi cập nhật ghế.');
    }
  };
  
  // Create functions
  const handleAddNewChair = () => {
    setNewChairs(prev => [...prev, { 
      chairTypeId: 1, 
      chairName: '', 
      chairPosition: '', 
      chairStatus: true 
    }]);
  };
  
  const handleRemoveNewChair = (index) => {
    setNewChairs(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleNewChairChange = (index, field, value) => {
    setNewChairs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  
  const handleCreateChairs = async () => {
    try {
      // Validate input
      const hasEmptyFields = newChairs.some(
        chair => !chair.chairName.trim() || !chair.chairPosition.trim()
      );
      
      if (hasEmptyFields) {
        alert('Vui lòng điền đầy đủ thông tin cho tất cả các ghế.');
        return;
      }
      
      // Set chairRoomId for all new chairs
      const chairsWithRoomId = newChairs.map(chair => ({
        ...chair,
        chairRoomId: parseInt(roomId)
      }));
      
      const response = await createChairs(roomId, chairsWithRoomId);
      
      if (response.success) {
        setSuccessMessage(`Đã tạo thành công ${newChairs.length} ghế mới!`);
        setShowCreateModal(false);
        setNewChairs([{ chairTypeId: 1, chairName: '', chairPosition: '', chairStatus: true }]);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(response.message || 'Không thể tạo ghế mới.');
      }
    } catch (error) {
      console.error('Error creating chairs:', error);
      alert('Đã xảy ra lỗi khi tạo ghế mới.');
    }
  };
  
  // Delete functions
  const handleDeleteClick = (chair) => {
    setChairToDelete(chair);
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      const response = await deleteChairs(roomId, [chairToDelete.chairId]);
      
      if (response.success) {
        setSuccessMessage('Xóa ghế thành công!');
        setShowDeleteModal(false);
        setChairToDelete(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(response.message || 'Không thể xóa ghế.');
      }
    } catch (error) {
      console.error('Error deleting chair:', error);
      alert('Đã xảy ra lỗi khi xóa ghế.');
    }
  };
  
  // Bulk actions
  const handleSelectChair = (chairId) => {
    setSelectedChairs(prev => {
      const isSelected = prev.includes(chairId);
      if (isSelected) {
        return prev.filter(id => id !== chairId);
      } else {
        return [...prev, chairId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedChairs.length === filteredChairs.length) {
      setSelectedChairs([]);
    } else {
      setSelectedChairs(filteredChairs.map(chair => chair.chairId));
    }
  };
  
  const openBulkActionModal = (actionType) => {
    if (selectedChairs.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế để thực hiện thao tác hàng loạt.');
      return;
    }
    
    setBulkActionType(actionType);
    setShowBulkActionModal(true);
  };
  
  const handleBulkAction = async (value) => {
    try {
      if (bulkActionType === 'delete') {
        // Delete selected chairs
        const response = await deleteChairs(roomId, selectedChairs);
        
        if (response.success) {
          setSuccessMessage(`Đã xóa ${selectedChairs.length} ghế thành công!`);
          setSelectedChairs([]);
          setRefreshTrigger(prev => prev + 1);
        } else {
          alert(response.message || 'Không thể xóa ghế.');
        }
      } else if (bulkActionType === 'status') {
        // Update status of selected chairs
        const updatedChairs = chairs
          .filter(chair => selectedChairs.includes(chair.chairId))
          .map(chair => ({
            ...chair,
            chairStatus: value
          }));
        
        const response = await updateChairs(roomId, updatedChairs);
        
        if (response.success) {
          setSuccessMessage(`Đã cập nhật trạng thái cho ${selectedChairs.length} ghế thành công!`);
          setSelectedChairs([]);
          setRefreshTrigger(prev => prev + 1);
        } else {
          alert(response.message || 'Không thể cập nhật trạng thái ghế.');
        }
      } else if (bulkActionType === 'type') {
        // Update type of selected chairs
        const updatedChairs = chairs
          .filter(chair => selectedChairs.includes(chair.chairId))
          .map(chair => ({
            ...chair,
            chairTypeId: value
          }));
        
        const response = await updateChairs(roomId, updatedChairs);
        
        if (response.success) {
          setSuccessMessage(`Đã cập nhật loại ghế cho ${selectedChairs.length} ghế thành công!`);
          setSelectedChairs([]);
          setRefreshTrigger(prev => prev + 1);
        } else {
          alert(response.message || 'Không thể cập nhật loại ghế.');
        }
      }
      
      setShowBulkActionModal(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Đã xảy ra lỗi khi thực hiện thao tác hàng loạt.');
    }
  };
  
  // Helper functions
  const getChairTypeText = (typeId) => {
    switch(typeId) {
      case 1: return 'Ghế thường';
      case 2: return 'Ghế VIP';
      case 3: return 'Ghế đôi';
      default: return 'Không xác định';
    }
  };
  
  const getChairTypeClass = (typeId) => {
    switch(typeId) {
      case 1: return 'standard';
      case 2: return 'vip';
      case 3: return 'couple';
      default: return 'standard';
    }
  };
  
  // Render functions
  const renderChairTypeOption = (value, label) => (
    <option key={value} value={value}>{label}</option>
  );
  
  const renderChairTypeOptions = () => [
    renderChairTypeOption('all', 'Tất cả loại ghế'),
    renderChairTypeOption('1', 'Ghế thường'),
    renderChairTypeOption('2', 'Ghế VIP'),
    renderChairTypeOption('3', 'Ghế đôi')
  ];
  
  const renderStatusOptions = () => [
    <option key="all" value="all">Tất cả trạng thái</option>,
    <option key="active" value="active">Đang hoạt động</option>,
    <option key="inactive" value="inactive">Ngừng hoạt động</option>
  ];
  
  const renderStatusBadge = (active) => (
    <Badge bg={active ? 'success' : 'danger'}>
      {active ? 'Hoạt động' : 'Ngừng hoạt động'}
    </Badge>
  );
  
  const renderTypeBadge = (typeId) => {
    let bgColor = 'primary';
    if (typeId === 2) bgColor = 'purple';
    if (typeId === 3) bgColor = 'pink';
    
    return (
      <Badge bg={bgColor} style={{ 
        backgroundColor: typeId === 2 ? '#9c27b0' : typeId === 3 ? '#e91e63' : undefined 
      }}>
        {getChairTypeText(typeId)}
      </Badge>
    );
  };
  
  const renderTableView = () => (
    <>
      <div className="d-flex justify-content-between mb-3">
        <div>
          <Badge bg="secondary">{filteredChairs.length} ghế</Badge>
          {selectedChairs.length > 0 && (
            <Badge bg="primary" className="ms-2">Đã chọn: {selectedChairs.length}</Badge>
          )}
        </div>
        
        {selectedChairs.length > 0 && (
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" size="sm">
                Đổi loại ghế
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => openBulkActionModal('type', 1)}>Ghế thường</Dropdown.Item>
                <Dropdown.Item onClick={() => openBulkActionModal('type', 2)}>Ghế VIP</Dropdown.Item>
                <Dropdown.Item onClick={() => openBulkActionModal('type', 3)}>Ghế đôi</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" size="sm">
                Đổi trạng thái
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => openBulkActionModal('status', true)}>Kích hoạt</Dropdown.Item>
                <Dropdown.Item onClick={() => openBulkActionModal('status', false)}>Vô hiệu hóa</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => openBulkActionModal('delete')}
            >
              <FaTrash /> Xóa
            </Button>
          </div>
        )}
      </div>
    
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th width="50">
              <Form.Check
                type="checkbox"
                checked={selectedChairs.length === filteredChairs.length && filteredChairs.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th width="80">ID</th>
            <th width="100">Tên ghế</th>
            <th width="100">Vị trí</th>
            <th width="120">Loại ghế</th>
            <th width="120">Trạng thái</th>
            <th width="150">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredChairs.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-3">
                Không tìm thấy ghế nào phù hợp với bộ lọc đã chọn
              </td>
            </tr>
          ) : (
            filteredChairs.map(chair => (
              <tr key={chair.chairId}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedChairs.includes(chair.chairId)}
                    onChange={() => handleSelectChair(chair.chairId)}
                  />
                </td>
                <td>{chair.chairId}</td>
                <td>{chair.chairName}</td>
                <td>{chair.chairPosition}</td>
                <td>{renderTypeBadge(chair.chairTypeId)}</td>
                <td>{renderStatusBadge(chair.chairStatus)}</td>
                <td>
                  <TableActions>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEditChair(chair)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(chair)}
                    >
                      <FaTrash />
                    </Button>
                  </TableActions>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
  
  const renderVisualView = () => (
    <>
      <LegendContainer>
        <LegendItem>
          <div className="box standard"></div>
          <div className="label">Ghế thường</div>
        </LegendItem>
        <LegendItem>
          <div className="box vip"></div>
          <div className="label">Ghế VIP</div>
        </LegendItem>
        <LegendItem>
          <div className="box couple"></div>
          <div className="label">Ghế đôi</div>
        </LegendItem>
        <LegendItem>
          <div style={{ position: 'relative', width: '24px', height: '24px' }}>
            <StatusBadge active={true} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
          <div className="label ml-2">Hoạt động</div>
        </LegendItem>
        <LegendItem>
          <div style={{ position: 'relative', width: '24px', height: '24px' }}>
            <StatusBadge active={false} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
          <div className="label ml-2">Ngừng hoạt động</div>
        </LegendItem>
      </LegendContainer>

      <div>
        <ScreenArea />
        <SeatsContainer>
          {Object.keys(organizedSeats).sort().map(row => (
            <SeatRow key={row}>
              <div className="row-label">{row}</div>
              {organizedSeats[row].map(chair => (
                <SeatWrapper key={chair.chairId}>
                  <StatusBadge active={chair.chairStatus} />
                  <Seat 
                    className={getChairTypeClass(chair.chairTypeId)}
                    disabled={!chair.chairStatus}
                    onClick={() => handleEditChair(chair)}
                  >
                    {chair.chairName}
                  </Seat>
                </SeatWrapper>
              ))}
            </SeatRow>
          ))}
        </SeatsContainer>
        
        {Object.keys(organizedSeats).length === 0 && (
          <Alert variant="info" className="text-center mt-4">
            Không tìm thấy ghế nào phù hợp với bộ lọc đã chọn
          </Alert>
        )}
      </div>
    </>
  );
  
  // Thêm hook để lấy theme từ MUI
  const muiTheme = useMuiTheme();
  
  // Các state và logic hiện tại của component
  
  // Tạo các biến màu dựa trên theme của MUI
  const themeColors = {
    background: muiTheme.palette.background.default,
    text: muiTheme.palette.text.primary,
    border: muiTheme.palette.divider,
    // Có thể thêm các màu khác dựa trên nhu cầu
  };
  
  return (
    // Bỏ padding-y vì AdminLayout đã có padding
    <Box>
      <Card>
        <Card.Body>
          <PageHeader>
            <div className="d-flex align-items-center">
              <BackButton 
                variant="outline-secondary" 
                className="me-2"
                // Điều chỉnh điều hướng để phù hợp với cấu trúc admin
                onClick={() => navigate('/admin/theaters')}
              >
                <FaArrowLeft />
              </BackButton>
              <PageTitle theme={muiTheme.palette.mode}>
                <FaChair className="me-2" /> Quản lý ghế - Phòng {roomId}
              </PageTitle>
            </div>
            
            <ActionButtonsGroup>
              <Button 
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus className="me-1" /> Thêm ghế
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={handleRefresh}
              >
                <FaSync className="me-1" /> Làm mới
              </Button>
            </ActionButtonsGroup>
          </PageHeader>
          
          {successMessage && (
            <Alert variant="success" className="d-flex align-items-center">
              <FaCheckCircle className="me-2" />
              {successMessage}
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              <FaInfoCircle className="me-2" />
              {error}
            </Alert>
          )}
          
          <SearchContainer>
            <div className="search-input">
              <FaSearch className="search-icon" />
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên ghế..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <FilterGroup>
              <Form.Select
                value={chairTypeFilter}
                onChange={(e) => setChairTypeFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                {renderChairTypeOptions()}
              </Form.Select>
              
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                {renderStatusOptions()}
              </Form.Select>
              
              <Button 
                variant="outline-secondary"
                onClick={clearFilters}
                disabled={!searchTerm && chairTypeFilter === 'all' && statusFilter === 'all'}
              >
                <FaTimes className="me-1" /> Xóa bộ lọc
              </Button>
            </FilterGroup>
          </SearchContainer>
          
          <TabContainer theme={muiTheme.palette.mode}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link 
                  className={activeTab === 'list' ? 'active' : ''}
                  onClick={() => setActiveTab('list')}
                >
                  <FaList className="me-1" /> Danh sách
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  className={activeTab === 'visual' ? 'active' : ''}
                  onClick={() => setActiveTab('visual')}
                >
                  <FaEye className="me-1" /> Sơ đồ ghế
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </TabContainer>
          
          <TabContent>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải dữ liệu ghế...</p>
              </div>
            ) : activeTab === 'list' ? (
              renderTableView()
            ) : (
              renderVisualView()
            )}
          </TabContent>
        </Card.Body>
      </Card>
    </Box>
  );
}

export default RoomSeatsManagement;