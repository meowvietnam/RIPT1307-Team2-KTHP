import { useState, useEffect } from 'react';
import { Table, Button, Modal, Popconfirm, message } from 'antd';
import UserForm from '@/components/UserForm';

const STORAGE_KEY = 'USER_DATA';

export default function UserManagerPage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setUsers(JSON.parse(data));
  }, []);

  const saveToStorage = (data: any[]) => {
    setUsers(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleAdd = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    const filtered = users.filter(u => u.UserID !== id);
    saveToStorage(filtered);
    message.success('Đã xóa tài khoản');
  };

  const handleSave = (user: any) => {
    const isEdit = users.some(u => u.UserID === user.UserID);
    const updated = isEdit
      ? users.map(u => u.UserID === user.UserID ? user : u)
      : [...users, { ...user, UserID: Date.now() }];
    saveToStorage(updated);
    setModalVisible(false);
  };

  const columns = [
    { title: 'Tên đăng nhập', dataIndex: 'Username' },
    { title: 'Họ tên', dataIndex: 'FullName' },
    { title: 'Email', dataIndex: 'Email' },
    { title: 'Vai trò', dataIndex: 'Role' },
    {
      title: 'Hành động',
      render: (_: any, record: any) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa tài khoản này?" onConfirm={() => handleDelete(record.UserID)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </>
      )
    }
  ];

  return (
    <>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm tài khoản
      </Button>
      <Table dataSource={users} rowKey="UserID" columns={columns} />

      <Modal
        title={editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <UserForm
          initialValues={editingUser}
          onSubmit={handleSave}
        />
      </Modal>
    </>
  );
}
