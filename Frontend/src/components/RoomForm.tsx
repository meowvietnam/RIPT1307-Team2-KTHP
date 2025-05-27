// src/components/RoomForm.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { Room } from '@/models/room';

interface RoomFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (room: Room) => void;
  initialValues?: Room;
}

const { Option } = Select;

const RoomForm: React.FC<RoomFormProps> = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values as Room);
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
      <Form form={form} layout="vertical">
        <Form.Item
          label="Mã phòng"
          name="roomid"
          rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}
        >
          <Input disabled={!!initialValues} />
        </Form.Item>

        <Form.Item
          label="Tên phòng"
          name="roomname"
          rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Loại phòng"
          name="roomtype"
          rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
        >
          <Select placeholder="Chọn loại phòng">
            <Option value="Phòng đơn">Phòng đơn</Option>
            <Option value="Phòng đôi">Phòng đôi</Option>
            <Option value="Phòng VIP">Phòng VIP</Option>
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
            <Option value="Đang trống">Đang trống</Option>
            <Option value="Đã cho thuê">Đã cho thuê</Option>
            <Option value="Đang dọn dẹp">Đang dọn dẹp</Option>
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
