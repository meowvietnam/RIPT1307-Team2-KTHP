import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import { getDestinations } from '@/services/TH6/diemDen';

const { Option } = Select;

interface AdminDestinationFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (destinations: App.Destination[]) => void;
  editingDestination: App.Destination | null;
}

const AdminDestinationForm: React.FC<AdminDestinationFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  editingDestination,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingDestination) {
      form.setFieldsValue(editingDestination);
    } else {
      form.resetFields();
    }
  }, [editingDestination, form]);

  const onFinish = async (values: any) => {
    const newDestination: App.Destination = {
      id: editingDestination ? editingDestination.id : `dd${Date.now()}`,
      name: values.name,
      type: values.type,
      rating: values.rating,
      cost: values.cost,
      image: '/images/default.jpg',
      description: values.description || 'Không có mô tả',
    };

    const existingDestinations = await getDestinations();
    const updatedDestinations = editingDestination
      ? existingDestinations.map((destination) =>
          destination.id === editingDestination.id ? newDestination : destination
        )
      : [...existingDestinations, newDestination];

    localStorage.setItem('destinations', JSON.stringify(updatedDestinations));
    onSubmit(updatedDestinations);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={editingDestination ? 'Sửa điểm đến' : 'Thêm điểm đến'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên địa điểm"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên địa điểm!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Loại hình"
          name="type"
          rules={[{ required: true, message: 'Vui lòng chọn loại hình!' }]}
        >
          <Select>
            <Option value="beach">Biển</Option>
            <Option value="mountain">Núi</Option>
            <Option value="city">Thành phố</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Chi phí"
          name="cost"
          rules={[{ required: true, message: 'Vui lòng nhập chi phí!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Đánh giá"
          name="rating"
          rules={[{ required: true, message: 'Vui lòng nhập đánh giá!' }]}
        >
          <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Mô tả"
          name="description"
        >
          <Input.TextArea rows={3} placeholder="Nhập mô tả (không bắt buộc)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {editingDestination ? 'Lưu thay đổi' : 'Thêm điểm đến'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminDestinationForm;