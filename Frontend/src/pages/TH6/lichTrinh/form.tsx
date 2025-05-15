import React from 'react';
import { Modal, Form, Input, DatePicker, Select, Button } from 'antd';

const { Option } = Select;

interface AddItineraryFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (itinerary: App.Itinerary) => void;
  destinations: App.Destination[];
}

const AddItineraryForm: React.FC<AddItineraryFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  destinations,
}) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const selectedDestinations = destinations.filter((destination) =>
      values.destinations.includes(destination.id)
    );

    const totalCost = selectedDestinations.reduce((sum, destination) => sum + destination.cost, 0);
    const travelTime = selectedDestinations.length > 1 ? (selectedDestinations.length - 1) * 1 : 0; // 1 giờ giữa mỗi điểm

    const newItinerary: App.Itinerary = {
      id: `it${Date.now()}`,
      name: values.name,
      date: values.date.format('YYYY-MM-DD'),
      destinations: selectedDestinations,
      totalCost,
      travelTime,
    };

    onSubmit(newItinerary);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Thêm lịch trình"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên lịch trình"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên lịch trình!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Ngày"
          name="date"
          rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Chọn điểm đến"
          name="destinations"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một điểm đến!' }]}
        >
          <Select mode="multiple" placeholder="Chọn điểm đến">
            {destinations.map((destination) => (
              <Option key={destination.id} value={destination.id}>
                {destination.name} - {destination.type} - ${destination.cost}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm lịch trình
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddItineraryForm;