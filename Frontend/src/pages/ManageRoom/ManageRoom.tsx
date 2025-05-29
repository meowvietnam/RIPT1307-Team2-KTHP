import React, { useEffect, useState } from 'react';
import { Input, Select, Row, Col, Space } from 'antd';
import RoomCard from '@/pages/ManageRoom/components/RoomCard';
import { Room } from '@/services/typing';

const { Search } = Input;
const { Option } = Select;

const STORAGE_KEY = 'hotel_rooms';

const RoomStaffView: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  useEffect(() => {
    setRooms(JSON.parse(localStorage.getItem('hotel_rooms') || '[]'));
  }, []);

  const filteredRooms = rooms.filter(room =>
    (!filterStatus || room.status === filterStatus) &&
    (room.roomid.toString().includes(searchText) || room.roomname.includes(searchText))
  );

  const handleStatusChange = (roomid: number, newStatus: Room['status']) => {
  const updated = rooms.map(r => r.roomid === roomid ? { ...r, status: newStatus } : r);
  setRooms(updated);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

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
          <Option value="Đang trống">Đang trống</Option>
          <Option value="Đã cho thuê">Đã cho thuê</Option>
          <Option value="Đang dọn dẹp">Đang dọn dẹp</Option>
        </Select>
      </Space>

      <Row gutter={[16, 16]}>
        {filteredRooms.map(room => (
          <Col key={room.roomid} xs={24} sm={12} md={8} lg={6}>
            <RoomCard room={room} onStatusChange={handleStatusChange}/>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RoomStaffView;
