import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { Service } from '@/models/Type';

interface Props {
  visible: boolean;
  data?: Service | null;
  onClose: () => void;
  onSave: (value: Service) => void;
}

const ServiceForm = ({ visible, data, onClose, onSave }: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    } else {
      form.resetFields();
    }
  }, [data]);

  return (
    <Modal
      visible={visible}
      title={data ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ'}
      onCancel={onClose}
      onOk={() => {
        form.validateFields().then((values) => {
          onSave({ ...data, ...values });
        });
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="ServiceName" label="Tên dịch vụ" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="Price" label="Giá (VNĐ)" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="ServiceType" label="Loại dịch vụ" rules={[{ required: true }]}>
            <Select>
                <Select.Option value="Food">Food</Select.Option>
                <Select.Option value="Drink">Drink</Select.Option>
                <Select.Option value="Room_Hourly">Room Hourly</Select.Option>
                <Select.Option value="Room_Overnight">Room Overnight</Select.Option>
            </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceForm;
