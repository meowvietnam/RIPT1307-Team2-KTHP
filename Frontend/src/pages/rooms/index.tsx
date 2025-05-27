// src/pages/rooms/index.tsx
import React, { useEffect, useState } from 'react';
import { Button, Table, Popconfirm, message, Input, Select, Space } from 'antd';
import * as roomService from '@/services/rooms';
import RoomForm from '@/components/RoomForm';
import { Room } from '@/models/Type';

const { Option } = Select;

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  const fetchRooms = () => {
    setLoading(true);
    const data = roomService.getRooms();
    setRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAdd = () => {
    setEditingRoom(null);
    setFormVisible(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormVisible(true);
  };

  const handleDelete = (roomid: number) => {
    roomService.deleteRoom(roomid);
    message.success('Xóa phòng thành công');
    fetchRooms();
  };

  const handleSubmit = (room: Room) => {
    // Kiểm tra trùng mã phòng khi thêm mới
    if (!editingRoom && rooms.some(r => r.roomid === room.roomid)) {
      message.error('Mã phòng đã tồn tại!');
      return;
    }
    if (editingRoom) {
      roomService.updateRoom(room);
      message.success('Cập nhật phòng thành công');
    } else {
      roomService.addRoom(room);
      message.success('Thêm phòng thành công');
    }
    setFormVisible(false);
    fetchRooms();
  };

  // Lọc và tìm kiếm
  const filteredRooms = rooms.filter(room => {
    return (
      (!filterStatus || room.status === filterStatus) &&
      (room.roomid.toString().includes(searchText) || room.roomname.includes(searchText))
    );
  });

  const columns = [
    { title: 'Mã phòng', dataIndex: 'roomid', key: 'roomid' },
    { title: 'Tên phòng', dataIndex: 'roomname', key: 'roomname' },
    { title: 'Loại phòng', dataIndex: 'roomtype', key: 'roomtype' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (price: number) => price.toLocaleString() + '₫/Buổi' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Room) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.roomid)} okText="Có" cancelText="Không">
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
        <h2>Danh sách phòng khách sạn</h2>
        <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>Thêm phòng</Button>

        <Input.Search
            placeholder="Tìm theo mã hoặc tên phòng"
            allowClear
            onSearch={value => setSearchText(value)}
            style={{ width: 200 }}
        />

        <Select
            placeholder="Lọc trạng thái"
            allowClear
            style={{ width: 150 }}
            onChange={value => setFilterStatus(value)}
        >
            <Option value="Đang trống">Đang trống</Option>
            <Option value="Đã cho thuê">Đã cho thuê</Option>
            <Option value="Đang dọn dẹp">Đang dọn dẹp</Option>
        </Select>
        </Space>

        <Table
        columns={columns}
        dataSource={filteredRooms}
        rowKey="roomid"
        loading={loading}
        pagination={{ pageSize: 5 }}
        />

        <RoomForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingRoom || undefined}
        />
    </div>
  );
};

export default RoomManagement;
