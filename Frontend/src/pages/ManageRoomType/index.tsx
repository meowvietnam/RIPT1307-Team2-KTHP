import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, InputNumber, Select, Space, message } from 'antd';
import type { RoomType } from '@/services/typing';
import RoomTypeForm from './components/RoomTypeForm';
import { API_BASE_URL } from '@/config/api';

const ManageRoomType: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roomtypes`);
      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch { }
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }
      const data: RoomType[] = await response.json();
      if (!Array.isArray(data)) {
        message.warning('Dữ liệu loại phòng nhận được không đúng định dạng. Vui lòng kiểm tra API.');
        setRoomTypes([]);
        return;
      }
      setRoomTypes(data);
    } catch (err: any) {
      message.error(`Tải danh sách loại phòng thất bại: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const formatHourThresholdForDisplay = (hours: number): string => {
    if (hours === 0) return '0 giờ';
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0 && remainingHours > 0) {
      return `${days} ngày ${remainingHours} giờ`;
    } else if (days > 0) {
      return `${days} ngày`;
    } else {
      return `${remainingHours} giờ`;
    }
  };

  const openModal = (roomType?: RoomType) => {
    setEditingRoomType(roomType || null);
    setModalVisible(true);
    if (roomType) {
      form.setFieldsValue(roomType);
    } else {
      form.resetFields(); // Đảm bảo reset sạch sẽ
      form.setFieldsValue({
        typeName: '', // Đảm bảo khởi tạo với chuỗi rỗng
        hourThreshold: 1,
        basePrice: 0,
        overchargePerHour: 0,
      });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const roomTypeToSave: RoomType = { ...editingRoomType, ...values };

      let response: Response;

      if (editingRoomType && editingRoomType.roomTypeID) {
        response = await fetch(`${API_BASE_URL}/admin/roomtypes/${roomTypeToSave.roomTypeID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomTypeToSave),
        });
      } else {
        const newRoomType = { ...roomTypeToSave };
        delete (newRoomType as Partial<RoomType>).roomTypeID;

        response = await fetch(`${API_BASE_URL}/admin/roomtypes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRoomType),
        });
      }

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
          console.error("Lỗi API response:", errorData);
        } catch {
          console.error("Lỗi: Không thể parse JSON từ phản hồi lỗi.");
        }
        throw new Error(errorData?.message || 'Lỗi khi lưu loại phòng');
      }

      message.success(editingRoomType ? 'Cập nhật loại phòng thành công!' : 'Thêm loại phòng thành công!');
      setModalVisible(false);
      setEditingRoomType(null);
      form.resetFields();
      fetchRoomTypes();
    } catch (error: any) {
      console.error("Lỗi khi lưu loại phòng (Frontend catch):", error);
      message.error(`Lưu loại phòng thất bại: ${error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa loại phòng?',
      content: 'Bạn có chắc chắn muốn xóa loại phòng này? Thao tác này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/admin/roomtypes/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            let errorData = null;
            try {
              errorData = await response.json();
            } catch { }
            throw new Error(errorData?.message || 'Lỗi khi xóa loại phòng');
          }

          message.success('Đã xóa loại phòng thành công!');
          fetchRoomTypes();
        } catch (error: any) {
          message.error(`Xóa loại phòng thất bại: ${error.message}`);
        }
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'roomTypeID', key: 'roomTypeID' },
    { title: 'Tên loại phòng', dataIndex: 'typeName', key: 'typeName' },
    {
      title: 'Giờ chuẩn',
      dataIndex: 'hourThreshold',
      key: 'hourThreshold',
      render: (value: number) => formatHourThresholdForDisplay(value),
    },
    {
      title: 'Giá cơ bản',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (value: number) => value.toLocaleString() + '₫',
    },
    {
      title: 'Phụ phí/giờ',
      dataIndex: 'overchargePerHour',
      key: 'overchargePerHour',
      render: (value: number) => value.toLocaleString() + '₫',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: RoomType) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record.roomTypeID)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý loại phòng</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
        Thêm loại phòng
      </Button>
      <Table
        dataSource={roomTypes}
        columns={columns}
        rowKey="roomTypeID"
        loading={loading}
      />

      <Modal
        title={editingRoomType ? 'Sửa loại phòng' : 'Thêm loại phòng'}
        visible={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <RoomTypeForm form={form} />
      </Modal>
    </div>
  );
};

export default ManageRoomType;