import { Form, Input, Button, Select } from 'antd';

const { Option } = Select;

const roles = ['Admin', 'Nhân viên'];

export default function UserForm({ initialValues, onSubmit }: any) {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const fullUser = { ...initialValues, ...values };
    onSubmit(fullUser);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item name="Username" label="Tên đăng nhập" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="Password" label="Mật khẩu" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item name="FullName" label="Họ tên" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="Role" label="Vai trò" rules={[{ required: true }]}>
        <Select placeholder="Chọn vai trò">
          {roles.map(role => (
            <Option key={role} value={role}>{role}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">Lưu</Button>
      </Form.Item>
    </Form>
  );
}
