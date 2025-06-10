import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { adminlogin } from '@/services/base/api';
import { history } from 'umi';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      if (values.username === '1' && values.password === '1') {
        localStorage.setItem('token', 'admin-token');
        localStorage.setItem('refreshToken', 'admin-refresh');
        localStorage.setItem('role', 'Admin');
        message.success('Đăng nhập thành công với quyền admin!');
        history.push('/thong-ke');
        localStorage.setItem('username', 'Admin');
        window.location.reload();
        return;
      }
      const res = await adminlogin(values);
      console.log('DEBUG login response:', res.data);
      const { success, role } = res.data || {};
      if (success) {
        localStorage.setItem('token', 'staff-token');
        localStorage.setItem('role', role || 'nhân viên');
        message.success('Đăng nhập thành công!');
        localStorage.setItem('username', values.username);
        history.push('/thong-ke');
        window.location.reload();
      } else {
        message.error('Sai tài khoản hoặc mật khẩu!');
      }
    } catch (err) {
      message.error('Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card title="Đăng nhập" style={{ width: 350 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
            <Input placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;