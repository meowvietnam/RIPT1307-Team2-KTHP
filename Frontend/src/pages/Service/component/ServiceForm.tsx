import { Form, Input, InputNumber, Modal, Select, message } from 'antd';
import { useEffect } from 'react';
import type { Service, ServiceType } from '@/services/typing';

interface Props {
  visible: boolean;
  data?: Service | null;
  onClose: () => void;
  onSave: (value: Service) => void;
}

const ServiceForm = ({ visible, data, onClose, onSave }: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    console.log('ServiceForm useEffect: data nhận được:', data);
    if (data) {
      form.setFieldsValue({
        serviceID: data.serviceID,
        serviceName: data.serviceName,
        price: data.price,
        serviceType: data.serviceType,
      });
      console.log('ServiceForm useEffect: Đã setFieldsValue với dữ liệu:', form.getFieldsValue());
    } else {
      form.resetFields();
      form.setFieldsValue({ serviceID: 0, price: 0 });
      console.log('ServiceForm useEffect: Đã reset và đặt giá trị mặc định cho form.');
    }
  }, [data, form]);

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        console.log('ServiceForm handleOk: Dữ liệu (values) từ form sau khi người dùng nhập:', values);
        const fullService = { ...data, ...values, serviceID: data?.serviceID || 0 };
        console.log('ServiceForm handleOk: Đối tượng service hoàn chỉnh gửi đi:', fullService);
        onSave(fullService);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
        message.error('Vui lòng kiểm tra lại thông tin nhập liệu!');
      });
  };

  return (
    <Modal
      visible={visible}
      title={data ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ'}
      onCancel={onClose}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="serviceID" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item name="serviceName" label="Tên dịch vụ" rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập giá hợp lệ!' }]}>
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={(value: number | undefined) => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => parseFloat((value || '').replace(/,/g, '')) || 0}
          />
        </Form.Item>

        <Form.Item name="serviceType" label="Loại dịch vụ" rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ!' }]}>
            <Select>
                <Select.Option value="Food">Food</Select.Option>
                <Select.Option value="Drink">Drink</Select.Option>
            </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceForm;