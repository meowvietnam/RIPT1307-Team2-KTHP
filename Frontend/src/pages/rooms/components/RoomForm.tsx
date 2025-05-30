import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { Room, RoomType } from '@/services/typing';
import { API_BASE_URL } from '@/config/api';

interface RoomFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Room) => void;
  initialValues?: Room;
}

const ROOM_TYPES: Room['baseRoomType'][] = ['Single', 'Double']; // Giả sử đây là các loại phòng cơ bản, có thể thay đổi tùy theo yêu cầu
const { Option } = Select;

const RoomForm: React.FC<RoomFormProps> = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  // Không cần state roomTypes và loadingRoomTypes nữa nếu không hiển thị ô chọn loại phòng
  // const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  // const [loadingRoomTypes, setLoadingRoomTypes] = useState<boolean>(false);

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

  useEffect(() => {
    // Không cần fetchRoomTypes nữa nếu không hiển thị ô chọn loại phòng
    // const fetchRoomTypes = async () => { ... };

    if (visible) {
      // Đặt giá trị ban đầu cho form
      if (initialValues) {
        form.setFieldsValue({
          roomID: initialValues.roomID,
          roomName: initialValues.roomName,
          baseRoomType: initialValues.baseRoomType,
          price: initialValues.price,
          description: initialValues.description,
          // roomTypeID và status không hiển thị trên form, nhưng giá trị của chúng
          // sẽ được lấy từ initialValues khi gửi dữ liệu cập nhật.
        });
      } else {
        // Reset form khi tạo mới
        form.resetFields();
        form.setFieldsValue({
            baseRoomType: undefined,
            description: undefined,
            price: undefined,
            roomName: undefined,
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        let dataToSubmit: Room;

        if (initialValues) {
          // Khi cập nhật: Lấy các trường từ form và bổ sung các trường không thay đổi từ initialValues.
          dataToSubmit = {
            roomID: initialValues.roomID,
            roomName: values.roomName,
            baseRoomType: values.baseRoomType,
            price: values.price,
            description: values.description,
            roomTypeID: initialValues.roomTypeID, // Giữ nguyên roomTypeID của phòng hiện tại
            status: initialValues.status, // Giữ nguyên status của phòng hiện tại
            roomType: initialValues.roomType // Giữ nguyên đối tượng roomType của phòng hiện tại
          };
        } else {
          // Khi tạo mới: Tạo đối tượng Room với các giá trị từ form.
          // roomTypeID và roomType sẽ không được lấy từ input form, mà do backend xử lý.
          dataToSubmit = {
            roomID: 0, // ID thường được backend gán tự động
            roomName: values.roomName,
            baseRoomType: values.baseRoomType,
            price: values.price,
            description: values.description,
            roomTypeID: 0, // Gán 0 hoặc undefined. Backend sẽ phải tự gán loại phòng.
            status: 'Available', // Gán một giá trị mặc định cho frontend, BE sẽ ghi đè
          };
        }

        onSubmit(dataToSubmit);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
        message.error('Vui lòng điền đầy đủ và đúng thông tin.');
      });
  };

  return (
    <Modal
      visible={visible}
      title={initialValues ? 'Chỉnh sửa phòng' : 'Thêm phòng'}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
    >
      <Form
        form={form}
        layout="vertical"
      >
        {initialValues && (
          <Form.Item label="Mã phòng" name="roomID">
            <Input disabled />
          </Form.Item>
        )}

        <Form.Item
          label="Tên phòng"
          name="roomName"
          rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Kiểu phòng"
          name="baseRoomType"
          rules={[{ required: true, message: 'Vui lòng chọn kiểu phòng' }]}
        >
          <Select placeholder="Chọn kiểu phòng">
            {ROOM_TYPES.map(type => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* Form.Item cho loại phòng đã bị xóa hoàn toàn khỏi đây */}
      </Form>
    </Modal>
  );
};

export default RoomForm;