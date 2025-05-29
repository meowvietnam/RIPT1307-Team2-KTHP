import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { Room, RoomType } from '@/services/typing';

interface RoomFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (room: Room) => void;
  initialValues?: Room;
}

const ROOM_STATUS: Room['status'][] = ['Đang trống', 'Đã cho thuê', 'Đang dọn dẹp'];
const ROOM_TYPES: Room['baseroomtype'][] = ['Phòng đơn', 'Phòng đôi'];
const { Option } = Select;

const RoomForm: React.FC<RoomFormProps> = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  useEffect(() => {
    // Lấy danh sách loại phòng từ localStorage
    const types = JSON.parse(localStorage.getItem('hotel_roomtypes') || '[]');
    setRoomTypes(types);
  }, []);

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const selectedType = roomTypes.find(rt => rt.RoomTypeID === values.RoomTypeID);
        // Nếu là thêm mới thì tự động sinh roomid
        const roomid = initialValues?.roomid ?? Date.now();
        onSubmit({
          ...values,
          roomid,
          RoomType: selectedType,
        } as Room);
      })
      .catch(() => {});
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
        initialValues={{
          status: 'Đang trống', // trạng thái mặc định
          ...initialValues
        }}>
        {/* Chỉ hiển thị trường mã phòng khi chỉnh sửa */}
        {initialValues && (
          <Form.Item
            label="Mã phòng"
            name="roomid"
            rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}
          >
            <Input disabled />
          </Form.Item>
        )}

        <Form.Item
          label="Tên phòng"
          name="roomname"
          rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Kiểu phòng"
          name="baseroomtype"
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
          label="Loại phòng"
          name="RoomTypeID"
          rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
        >
          <Select placeholder="Chọn loại phòng">
            {roomTypes.map(rt => (
              <Option key={rt.RoomTypeID} value={rt.RoomTypeID}>
                {rt.TypeName} (Giờ chuẩn: {rt.HourThreshold}, Phụ phí/giờ: {rt.OverchargePerHour})
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

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái">
            {ROOM_STATUS.map(status => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoomForm;