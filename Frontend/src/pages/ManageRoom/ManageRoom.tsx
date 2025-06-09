import React, { useEffect, useState, useCallback } from 'react';
import { Input, Select, Row, Col, Space, message } from 'antd';
import RoomCard from '@/pages/ManageRoom/components/RoomCard';
import { Room, RoomType, Service, History } from '@/services/typing'; // Import History và Service
import { API_BASE_URL } from '@/config/api';

const { Search } = Input;
const { Option } = Select;

const RoomStaffView: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [services, setServices] = useState<Service[]>([]); // THÊM STATE CHO SERVICES

  const fetchAllData = useCallback(async () => {
    try {
      const [roomsResponse, roomTypesResponse, servicesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/staff/rooms`),
        fetch(`${API_BASE_URL}/staff/roomTypes`),
        fetch(`${API_BASE_URL}/staff/services`), // FETCH SERVICES TẠI ĐÂY
      ]);

      if (!roomsResponse.ok) {
        const errorData = await roomsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch rooms');
      }
      const roomsData: Room[] = await roomsResponse.json();
      setRooms(roomsData);

      if (!roomTypesResponse.ok) {
        const errorData = await roomTypesResponse.json();
        throw new Error(errorData.message || 'Failed to fetch room types');
      }
      const roomTypesData: RoomType[] = await roomTypesResponse.json();
      setRoomTypes(roomTypesData);

      if (!servicesResponse.ok) {
        const errorData = await servicesResponse.json();
        throw new Error(errorData.message || 'Failed to fetch services');
      }
      const servicesData: Service[] = await servicesResponse.json();
      setServices(servicesData); // CẬP NHẬT STATE SERVICES

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error(`Lỗi khi tải dữ liệu: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredRooms = rooms.filter(room => {
    const roomIDStr = room.roomID?.toString() || '';
    const roomNameStr = room.roomName || '';

    const statusMatch = !filterStatus || room.status === filterStatus;
    const searchMatch = roomIDStr.includes(searchText) || roomNameStr.toLowerCase().includes(searchText.toLowerCase());

    return statusMatch && searchMatch;
  });

  // HÀM TÍNH TỔNG TIỀN ĐƯỢC ĐỊNH NGHĨA Ở ĐÂY VÀ TRUYỀN XUỐNG CÁC CON
  const calculateDisplayTotalPrice = useCallback((history: History | null, currentRoom: Room, allServices: Service[]): number => {
    if (!history) return 0;

    let total = 0;

    // Giá phòng cơ bản
    total += currentRoom.price || 0;

    // Giá loại phòng cơ bản
    // Tìm roomType tương ứng trong danh sách roomTypes đã fetch
    const roomType = roomTypes.find(rt => rt.roomTypeID === currentRoom.roomTypeID);
    total += roomType?.basePrice || 0;

    // Tổng tiền dịch vụ
    if (history.roomServices && history.roomServices.length > 0) {
      total += history.roomServices.reduce((sum, rs) => {
        // Sử dụng allServices được truyền vào để tìm giá dịch vụ
        const servicePrice = rs.service?.price || allServices.find(s => s.serviceID === rs.serviceID)?.price || 0;
        return sum + (servicePrice * (rs.quantity || 1));
      }, 0);
    }

    // Tính phụ phí nếu có (chỉ khi đã check-out và có endTime)
    if (history.startTime && history.endTime && roomType?.hourThreshold && roomType.overchargePerHour) {
        const start = new Date(history.startTime);
        const end = new Date(history.endTime);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        if (durationHours > roomType.hourThreshold) {
            const overchargeHours = durationHours - roomType.hourThreshold;
            const surcharge = overchargeHours * roomType.overchargePerHour;
            total += surcharge;
        }
    }

    return total;
  }, [roomTypes]); // Dependency là roomTypes vì nó dùng thông tin loại phòng

  const handleStatusChange = useCallback(async (roomid: number, newStatus: Room['status']) => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/rooms/${roomid}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room status');
      }

      const updatedRoom: Room = await response.json();
      setRooms(prevRooms => prevRooms.map(r => r.roomID === roomid ? updatedRoom : r));
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái phòng:", error);
      message.error(`Lỗi cập nhật trạng thái phòng: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  const handleRoomTypeChange = useCallback(async (roomid: number, newRoomTypeID: number | null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/rooms/${roomid}/roomType`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomTypeID: newRoomTypeID }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room type');
      }

      const updatedRoom: Room = await response.json();
      setRooms(prevRooms => prevRooms.map(r => r.roomID === roomid ? updatedRoom : r));
      message.success(`Cập nhật loại phòng "${updatedRoom.roomName}" thành công!`);
    } catch (error) {
      console.error("Lỗi cập nhật loại phòng:", error);
      message.error(`Lỗi cập nhật loại phòng: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  return (
    <div>
      <h2>Quản lý phòng khách sạn</h2>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm theo mã/tên phòng"
          allowClear
          onSearch={setSearchText}
          style={{ width: 200 }}
        />
        <Select
          allowClear
          placeholder="Lọc theo trạng thái"
          style={{ width: 160 }}
          onChange={setFilterStatus}
        >
          <Option value="Available">Đang trống</Option>
          <Option value="In Use">Đã cho thuê</Option>
          <Option value="Being Cleaned">Đang dọn dẹp</Option>
          <Option value="Under Maintenance">Đang bảo trì</Option>
          <Option value="Reserved">Đã đặt trước</Option>
        </Select>
      </Space>

      <Row gutter={[16, 16]}>
        {filteredRooms.map(room => (
          <Col key={room.roomID} xs={24} sm={12} md={8} lg={6}>
            <RoomCard
              room={room}
              onStatusChange={handleStatusChange}
              onRoomTypeChange={handleRoomTypeChange}
              // TRUYỀN CÁC PROPS MỚI XUỐNG ROOMCARD
              calculateDisplayTotalPrice={calculateDisplayTotalPrice}
              services={services}
              roomTypes={roomTypes}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RoomStaffView;