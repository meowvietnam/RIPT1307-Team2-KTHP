// src/pages/ManageRoom/components/RoomCard.tsx

import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Space, message, Spin, Popconfirm } from 'antd'; // Import Popconfirm
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Room, History, Service, RoomType } from '@/services/typing';
import RoomHistoryModal from './RoomCardModal';
import { API_BASE_URL } from '@/config/api';

interface Props {
  room: Room;
  onStatusChange: (roomid: number, newStatus: Room['status']) => void;
  onRoomTypeChange: (roomid: number, newRoomTypeID: number | null) => void;
  calculateDisplayTotalPrice: (history: History | null, currentRoom: Room, allServices: Service[]) => number;
  services: Service[];
  roomTypes: RoomType[];
}

const RoomCard: React.FC<Props> = ({ room, onStatusChange, onRoomTypeChange, calculateDisplayTotalPrice, services, roomTypes }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeHistory, setActiveHistory] = useState<History | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingStatusChange, setLoadingStatusChange] = useState(false); // Thêm state loading cho đổi trạng thái

  // Chỉ fetch lịch sử hoạt động cho phòng này
  useEffect(() => {
    const fetchActiveHistory = async () => {
      setLoadingHistory(true);
      try {
        const historyResponse = await fetch(`${API_BASE_URL}/staff/histories/room/${room.roomID}`);

        if (!historyResponse.ok) {
          const errorData = await historyResponse.json().catch(() => ({}));
          throw new Error(errorData?.message || `HTTP error! status: ${historyResponse.status} for histories`);
        }
        const historiesData: History[] = await historyResponse.json();

        const foundActiveHistory = historiesData.find(h => !h.endTime);
        setActiveHistory(foundActiveHistory || null);

      } catch (error) {
        console.error(`Error fetching active history for Room ${room.roomName}:`, error);
        message.error(`Lỗi khi tải lịch sử phòng ${room.roomName}: ${error instanceof Error ? error.message : String(error)}`);
        setActiveHistory(null);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchActiveHistory();
  }, [room.roomID, room.roomName, room.status]); // Re-fetch nếu ID phòng hoặc trạng thái thay đổi

  const handleStatusTagClick = async () => {
    if (room.status === 'Being Cleaned') {
      try {
        setLoadingStatusChange(true);
        const response = await fetch(`${API_BASE_URL}/staff/rooms/${room.roomID}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Available' }), // Gửi trạng thái mới
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.message || `HTTP error! status: ${response.status} when updating room status`);
        }

        // Cập nhật trạng thái phòng trong state cha
        onStatusChange(room.roomID, 'Available');
        message.success(`Phòng ${room.roomName} đã được chuyển sang trạng thái "Available".`);
      } catch (error) {
        console.error("Error updating room status:", error);
        message.error(`Lỗi khi cập nhật trạng thái phòng: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoadingStatusChange(false);
      }
    }
  };

  const getStatusClass = (status: Room['status']) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'In Use':
        return 'error';
      case 'Being Cleaned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Room['status']) => {
    switch (status) {
      case 'Available':
        return <CheckCircleOutlined />;
      case 'In Use':
        return <ExclamationCircleOutlined />;
      case 'Being Cleaned':
        return <LoadingOutlined />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card
        title={`Phòng ${room.roomName}`}
        extra={
          // Sử dụng Popconfirm để xác nhận khi click vào tag "Being Cleaned"
          room.status === 'Being Cleaned' ? (
            <Popconfirm
              title={`Bạn có chắc muốn chuyển phòng ${room.roomName} sang trạng thái "Available"?`}
              onConfirm={handleStatusTagClick}
              okText="Có"
              cancelText="Không"
              disabled={loadingStatusChange} // Disable confirm khi đang load
            >
              <Tag color={getStatusClass(room.status)} style={{ cursor: 'pointer' }}>
                {loadingStatusChange ? <Spin size="small" /> : getStatusIcon(room.status)} {room.status}
              </Tag>
            </Popconfirm>
          ) : (
            <Tag color={getStatusClass(room.status)}>
              {getStatusIcon(room.status)} {room.status}
            </Tag>
          )
        }
        style={{ marginBottom: 16 }}
      >
        <p>Mã phòng: {room.roomID}</p>
        <p>Kiểu phòng: {room.roomType?.typeName || 'Chưa xác định'}</p>
        {loadingHistory ? (
          <p><Spin size="small" /> Đang tải giá...</p>
        ) : (
          <p>
            Tổng tiền hiện tại:{' '}
            <strong>
              {calculateDisplayTotalPrice(activeHistory, room, services)?.toLocaleString() || '0'}₫
            </strong>
          </p>
        )}
        <p>Mô tả: {room.description || 'N/A'}</p>
        <Space>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Xem chi tiết
          </Button>
          {/* Add more actions if needed */}
        </Space>
      </Card>
      <RoomHistoryModal
        room={room}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          // Khi modal đóng, fetch lại dữ liệu lịch sử để cập nhật giá trên card
          setLoadingHistory(true);
          const fetchUpdatedActiveHistory = async () => {
            try {
              const historyResponse = await fetch(`${API_BASE_URL}/staff/histories/room/${room.roomID}`);
              const historiesData: History[] = await historyResponse.json();
              const foundActiveHistory = historiesData.find(h => !h.endTime);
              setActiveHistory(foundActiveHistory || null);
            } catch (error) {
              console.error("Lỗi khi tải lại lịch sử hoạt động:", error);
            } finally {
              setLoadingHistory(false);
            }
          };
          fetchUpdatedActiveHistory();
        }}
        onStatusChange={onStatusChange}
        onRoomTypeChange={onRoomTypeChange}
        calculateDisplayTotalPrice={calculateDisplayTotalPrice}
        services={services}
        roomTypes={roomTypes}
      />
    </>
  );
};

export default RoomCard;