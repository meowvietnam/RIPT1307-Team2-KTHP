import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  InputNumber,
  Upload,
  Row,
  Col
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Service } from '../types';

interface ServiceFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (service: Service) => void;
  service: Service | null;
}

const { TextArea } = Input;

const ServiceForm: React.FC<ServiceFormProps> = ({ visible, onCancel, onSave, service }) => {
  const [form] = Form.useForm();

  // reset
  useEffect(() => {
    if (visible) {
      if (service) {
        form.setFieldsValue({
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, service, form]);

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const newService: Service = {
        id: service?.id || '',
        name: values.name,
        description: values.description,
        price: values.price,
        duration: values.duration,
        isActive: service?.isActive || true,
      };

      onSave(newService);
    });
  };

  return (
    <Modal
      title={service ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {service ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          price: 0,
          duration: 30,
        }}
      >
        <Form.Item
          name="name"
          label="Tên dịch vụ"
          rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
        >
          <Input placeholder="Nhập tên dịch vụ" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả dịch vụ"
        >
          <TextArea rows={3} placeholder="Nhập mô tả chi tiết về dịch vụ" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Giá dịch vụ (VND)"
              rules={[
                { required: true, message: 'Vui lòng nhập giá dịch vụ' },
                { type: 'number', min: 0, message: 'Giá không thể là số âm' }
              ]}
            >
              <InputNumber 
                min={0} 
                step={10000} 
                style={{ width: '100%' }} 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : '0'}
                placeholder="Nhập giá dịch vụ" 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="duration"
              label="Thời gian thực hiện (phút)"
              rules={[
                { required: true, message: 'Vui lòng nhập thời gian thực hiện' },
                { type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0' }
              ]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập thời gian thực hiện" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="image"
          label="Hình ảnh dịch vụ (Tùy chọn)"
        >
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceForm;