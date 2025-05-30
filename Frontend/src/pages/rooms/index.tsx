import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import RoomForm from './components/RoomForm';
import { Room, RoomType } from '@/services/typing'; // Chỉ import Room và RoomType
import { API_BASE_URL } from '@/config/api';

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('jwtToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
      if (response.status === 401) {
        message.error('Bạn không có quyền truy cập. Vui lòng đăng nhập.');
        throw new Error('Unauthorized');
      }
      if (response.status === 403) {
        message.error('Bạn không có quyền thực hiện hành động này.');
        throw new Error('Forbidden');
      }
      const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định từ server.' }));
      const errorMessage = errorData.title || errorData.message || (errorData.errors && Object.values(errorData.errors).flat().join('; ')) || 'Có lỗi xảy ra với yêu cầu API.';
      throw new Error(errorMessage);
    }
    return response.json();
  };

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/staff/rooms`, {
        headers: getAuthHeaders(),
      });
      const data = await handleApiResponse(response);
      setRooms(data);
    } catch (error) {
      console.error('Fetch rooms error:', error);
      if (error instanceof Error && error.message !== 'Unauthorized' && error.message !== 'Forbidden') {
        message.error(`Lỗi khi tải danh sách phòng: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Thay đổi kiểu của roomData thành Room
  const createRoomApi = async (roomData: Room) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleApiResponse(response);
  };

  // Thay đổi kiểu của roomData thành Room
  const updateRoomApi = async (roomData: Room) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms/${roomData.roomID}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleApiResponse(response);
  };

  const deleteRoomApi = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  };

  const handleAdd = () => {
    setEditingRoom(undefined);
    setFormVisible(true);
  };

  const handleEdit = (record: Room) => {
    setEditingRoom(record);
    setFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRoomApi(id);
      message.success('Xóa phòng thành công');
      fetchRooms();
    } catch (error) {
      console.error('Delete room error:', error);
      if (error instanceof Error && error.message !== 'Unauthorized' && error.message !== 'Forbidden') {
        message.error(`Lỗi khi xóa phòng: ${error.message}`);
      }
    }
  };

  // Thay đổi kiểu của values thành Room
  const handleSubmit = async (values: Room) => {
    try {
      if (!editingRoom) {
        await createRoomApi(values);
        message.success('Thêm phòng thành công');
      } else {
        await updateRoomApi(values);
        message.success('Cập nhật phòng thành công');
      }
      setFormVisible(false);
      fetchRooms();
    } catch (error) {
      console.error('Submit room error:', error);
      if (error instanceof Error && error.message !== 'Unauthorized' && error.message !== 'Forbidden') {
        message.error(`Lỗi: ${error.message}`);
      }
    }
  };

  const columns = [
    {
      title: 'Mã phòng',
      dataIndex: 'roomID',
      key: 'roomID',
    },
    {
      title: 'Tên phòng',
      dataIndex: 'roomName',
      key: 'roomName',
    },
    {
      title: 'Kiểu phòng',
      dataIndex: 'baseRoomType',
      key: 'baseRoomType',
    },
    // {
    //   title: 'Loại phòng',
    //   dataIndex: 'roomType',
    //   key: 'roomType',
    //   render: (roomType: RoomType) => roomType?.typeName || 'N/A',
    // },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
    },
    // {
    //   title: 'Trạng thái',
    //   dataIndex: 'status',
    //   key: 'status',
    // },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (text: string, record: Room) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa phòng này?"
            onConfirm={() => handleDelete(record.roomID)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm phòng
      </Button>
      <Table
        columns={columns}
        dataSource={rooms}
        loading={loading}
        rowKey="roomID"
        pagination={{ pageSize: 10 }}
      />
      <RoomForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingRoom}
      />
    </div>
  );
};

export default RoomManagement;