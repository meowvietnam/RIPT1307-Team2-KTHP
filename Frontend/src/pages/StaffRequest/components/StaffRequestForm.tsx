import React from 'react';
import { Form, Input, Button } from 'antd';

const { TextArea } = Input;

interface StaffRequestFormProps {
  loading: boolean;
  onFinish: (values: { title: string; content: string }) => void;
  form: any;
  userID: number | null;
}

const StaffRequestForm: React.FC<StaffRequestFormProps> = ({ loading, onFinish, form, userID }) => (
  <Form layout="vertical" onFinish={onFinish} form={form}>
    <Form.Item
      label="Tiêu đề"
      name="title"
      rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      label="Nội dung"
      name="content"
      rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
    >
      <TextArea rows={4} />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" loading={loading} disabled={!userID}>
        Gửi yêu cầu
      </Button>
    </Form.Item>
  </Form>
);

export default StaffRequestForm;