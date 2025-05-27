import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Modal, Select, message } from 'antd';
import './RoomCard.less';
import type { Room, Service, History } from '@/models/Type';
import RoomHistoryModal from './RoomCardModal';

const { Option } = Select;

interface Props {
  room: Room;
  onStatusChange: (roomid: number, newStatus: Room['status']) => void;
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'Đang trống':
      return 'room-card available';
    case 'Đã cho thuê':
      return 'room-card rented';
    case 'Đang dọn dẹp':
      return 'room-card cleaning';
    default:
      return 'room-card';
  }
};

const RoomCard: React.FC<Props> = ({ room, onStatusChange}) => {
  const cardClass = getStatusClass(room.status);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [services, setServices] = useState<Service[]>([]);


  const handleStatusChange = (value: Room['status']) => {
    onStatusChange(room.roomid, value);
    message.success(`Phòng ${room.roomid} chuyển sang "${value}"`);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  
  useEffect(() => {
    setServices(JSON.parse(localStorage.getItem('hotel_services') || '[]'));
  }, [isModalVisible]);

  return (
    <>
      <div onClick={showModal}>
        <Card className={cardClass} title={`${room.roomname}`}>
          <p><b>Loại:</b> {room.roomtype}</p>
          <p><b>Giá:</b> {room.price.toLocaleString()}₫/Buổi</p>
          <p>
            <b>Trạng thái:</b>{' '}
            <Select
              value={room.status}
              onChange={handleStatusChange}
              style={{ width: 160 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Option value="Đang trống">Đang trống</Option>
              <Option value="Đã cho thuê">Đã cho thuê</Option>
              <Option value="Đang dọn dẹp">Đang dọn dẹp</Option>
            </Select>
          </p>
          {room.description && <p><b>Mô tả:</b> {room.description}</p>}
        </Card>
      </div>
      <RoomHistoryModal
        room={room}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

    </>
  );
};

export default RoomCard;
