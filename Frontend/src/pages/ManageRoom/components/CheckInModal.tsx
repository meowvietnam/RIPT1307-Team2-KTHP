// src/pages/ManageRoom/components/CheckInModal.tsx

import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select, DatePicker } from 'antd';
import type { Room, History, User } from '@/services/typing'; // Bỏ RoomType nếu không dùng
import moment from 'moment';
import { API_BASE_URL } from '@/config/api';

const { Option } = Select;

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
  room: Room;
  onCheckInSuccess: (newHistory: History) => void;
  // Prop này quan trọng để thông báo cho component cha cập nhật trạng thái phòng.
  // Component cha sẽ gọi API để thay đổi trạng thái phòng trên backend.
  onStatusChange: (roomID: number, newStatus: Room['status']) => void;
  users: User[];
  loadingUsers: boolean;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  onClose,
  room,
  onCheckInSuccess,
  onStatusChange,
  users,
  loadingUsers,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        startTime: moment(), // Thời gian check-in mặc định là hiện tại
      });
    }
  }, [visible, form]);

  const handleSubmit = async (values: any) => {
    // Ngăn Check-in nếu phòng không "Available" (Trống)
    if (room.status !== 'Available') {
      message.error('Phòng không ở trạng thái "Available". Không thể Check-in.');
      onClose(); // Đóng modal nếu không hợp lệ
      return;
    }

    try {
      const payload = {
        roomID: room.roomID,
        nameCustomer: values.nameCustomer,
        numberPhoneCustomer: values.numberPhoneCustomer,
        idCustomer: values.idCustomer,
        userID: values.userID, // ID nhân viên phục vụ
        startTime: values.startTime ? values.startTime.toISOString() : moment().toISOString(),
        totalPrice: room.roomType?.basePrice || 0, // Sử dụng giá theo giờ mặc định từ RoomType
        isCheckOut: false, // Ban đầu chưa check-out
      };

      // 1. Gọi API để tạo lịch sử (check-in)
      const createHistoryResponse = await fetch(`${API_BASE_URL}/admin/histories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!createHistoryResponse.ok) {
        const errorData = await createHistoryResponse.json().catch(() => ({ message: `Server error: ${createHistoryResponse.status}` }));
        throw new Error(errorData?.message || `Lỗi check-in: ${createHistoryResponse.status}`);
      }

      const newHistory: History = await createHistoryResponse.json();

      // 2. Thông báo cho component cha để cập nhật trạng thái phòng trên backend
      // và trên giao diện.
      onStatusChange(room.roomID, 'In Use'); // Yêu cầu cha cập nhật trạng thái phòng thành "In Use"

      onCheckInSuccess(newHistory); // Báo cho component cha biết đã check-in thành công
      message.success('Check-in thành công!');
      onClose(); // Đóng modal

    } catch (error: any) {
      console.error("Error during check-in:", error);
      message.error(`Lỗi check-in: ${error.message}`);
    }
  };

  return (
    <Modal
      title={`Check-in cho phòng ${room.roomName}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Tên khách hàng"
          name="nameCustomer"
          rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại khách hàng"
          name="numberPhoneCustomer"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^\d{10,11}$/, message: 'Số điện thoại không hợp lệ (10 hoặc 11 số).' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="CMND/CCCD khách hàng"
          name="idCustomer"
          rules={[{ required: true, message: 'Vui lòng nhập CMND/CCCD!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nhân viên phục vụ"
          name="userID"
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên phục vụ!' }]}
        >
          <Select placeholder="Chọn nhân viên" loading={loadingUsers}>
            {users.map(user => (
              <Option key={user.userID} value={user.userID}>
                {user.fullName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
            label="Thời gian bắt đầu (check-in)"
            name="startTime"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian check-in!' }]}
        >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Check-in
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CheckInModal;