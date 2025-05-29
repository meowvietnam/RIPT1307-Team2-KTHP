import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Modal, Select, message } from 'antd';
import './RoomCard.less';
import type { Room, Service, History } from '@/services/typing';
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
          <p><b>Loại:</b> {room.baseroomtype}</p>
          <p>
            <b>Loại phòng: </b>
            {room.RoomType?.TypeName || room.RoomTypeID || 'Chưa xác định'} ({room.RoomType?.HourThreshold} giờ)
          </p>
          <p><b>Note: </b>{room.RoomType?.OverchargePerHour.toLocaleString()}đ/giờ nếu quá giờ</p>
          <p><b>Giá:</b> {room.price.toLocaleString()}₫</p>
          <p>
            <b>Trạng thái:</b>{' '}
            <span>
              {room.status}
              {room.status === 'Đang dọn dẹp' && (
                <Button
                  type="primary"
                  size="small"
                  style={{
                    marginLeft: 8,
                    background: '#52c41a',
                    border: 'none',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    onStatusChange(room.roomid, 'Đang trống');
                    message.success(`Phòng ${room.roomid} đã chuyển sang "Đang trống"!`);
                  }}
                >
                  Đã dọn dẹp
                </Button>
              )}
            </span>
          </p>
          {room.description && <p><b>Mô tả:</b> {room.description}</p>}
        </Card>
      </div>
      <RoomHistoryModal
        room={room}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onStatusChange={onStatusChange}
      />

    </>
  );
};

export default RoomCard;
