import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import type { User } from '@/services/typing';

const { Option } = Select;

const roles = ['Staff'];

interface UserFormProps {
  initialValues: User | null;
  onSubmit: (user: User) => void;
}

export default function UserForm({ initialValues, onSubmit }: UserFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        userID: initialValues.userID,
        username: initialValues.username,
        fullName: initialValues.fullName,
        email: initialValues.email,
        role: initialValues.role,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ userID: 0 });
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const fullUser: User = {
      ...initialValues,
      ...values,
    };
    onSubmit(fullUser);
  };

  const handleFinishFailed = (errorInfo: any) => {
    console.error('Form submission failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin nhập liệu!');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    >
      <Form.Item name="userID" hidden>
        <Input type="hidden" />
      </Form.Item>

      <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
        <Input />
      </Form.Item>

      {(!initialValues || initialValues.userID === 0) && (
        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
          <Input.Password />
        </Form.Item>
      )}

      <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
        <Input />
      </Form.Item>

      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
        <Input />
      </Form.Item>

      <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
        <Select placeholder="Chọn vai trò">
          {roles.map(role => (
            <Option key={role} value={role}>{role}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">Lưu</Button>
        <Button onClick={() => form.resetFields()} style={{ marginLeft: 8 }}>Đặt lại</Button>
      </Form.Item>
    </Form>
  );
}