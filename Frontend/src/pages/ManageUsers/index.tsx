import { useState, useEffect } from 'react';
import { Table, Button, Modal, Popconfirm, message } from 'antd';
import UserForm from '@/pages/ManageUsers/components/UserForm'; 
import type { User } from '@/services/typing'; 
import { API_BASE_URL } from '@/config/api'; 

export default function UserManagerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      message.error(`Tải danh sách người dùng thất bại: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleDelete = async (userID: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi xóa người dùng');
      }

      setUsers(prevUsers => prevUsers.filter(u => u.userID !== userID));
      message.success('Đã xóa tài khoản thành công!');
    } catch (err: any) {
      console.error('API delete error:', err);
      message.error(`Xóa tài khoản thất bại: ${err.message}`);
    }
  };

  const handleSave = async (user: User) => {
    setModalVisible(false);

    try {
      const isEdit = user.userID !== undefined && user.userID > 0 && users.some(u => u.userID === user.userID);

      let response: Response; 

      if (isEdit) {
        response = await fetch(`${API_BASE_URL}/admin/users/${user.userID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
      } else {
        const userToCreate = { ...user };
        delete (userToCreate as Partial<User>).userID;

        response = await fetch(`${API_BASE_URL}/admin/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userToCreate),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi lưu người dùng');
      }

      const savedUser: User = await response.json();

      if (isEdit) {
        setUsers(prevUsers => prevUsers.map(u => u.userID === savedUser.userID ? savedUser : u));
        message.success('Cập nhật tài khoản thành công!');
      } else {
        setUsers(prevUsers => [...prevUsers, savedUser]);
        message.success('Thêm tài khoản mới thành công!');
      }
    } catch (err: any) {
      console.error('API save error:', err);
      message.error(`Lưu tài khoản thất bại: ${err.message}`);
    }
  };

  const columns = [
    { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Vai trò', dataIndex: 'role', key: 'role' },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: User) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa tài khoản này?" onConfirm={() => handleDelete(record.userID)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </>
      )
    }
  ];

  return (
    <>
      <h2>Quản lý nhân viên</h2>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm tài khoản
      </Button>
      <Table dataSource={users} rowKey="userID" columns={columns} loading={loading} />

      <Modal
        title={editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản'}
        visible={modalVisible} 
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <UserForm
          initialValues={editingUser || {
            userID: 0, 
            username: '',
            password: '',
            fullName: '',
            email: '',
            role: '',
          }}
          onSubmit={handleSave}
        />
      </Modal>
    </>
  );
}