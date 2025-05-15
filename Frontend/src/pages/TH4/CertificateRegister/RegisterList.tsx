import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Modal, Form, Input, InputNumber, message, Typography, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CertificateRegister } from '../types';

const { Title } = Typography;

const CertificateRegisterList: React.FC = () => {
  const [registers, setRegisters] = useState<CertificateRegister[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // localStorage
    const storedRegisters = localStorage.getItem('certificateRegisters');
    if (storedRegisters) {
      setRegisters(JSON.parse(storedRegisters));
    }
  }, []);

  useEffect(() => {
    // save vao local
    localStorage.setItem('certificateRegisters', JSON.stringify(registers));
  }, [registers]);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: CertificateRegister) => {
    form.setFieldsValue({
      year: record.year,
      name: record.name,
      description: record.description,
      currentNumber: record.currentNumber
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const decisionsStr = localStorage.getItem('graduationDecisions');
    if (decisionsStr) {
      const decisions = JSON.parse(decisionsStr);
      const isUsed = decisions.some((d: any) => d.registerId === id);
      if (isUsed) {
        message.error('Không thể xóa sổ văn bằng này vì đang có quyết định tốt nghiệp tham chiếu!');
        return;
      }
    }

    const newRegisters = registers.filter(r => r.id !== id);
    setRegisters(newRegisters);
    message.success('Xóa sổ văn bằng thành công!');
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      // check xem co vb nam nay chua?
      if (!editingId) {
        const yearExists = registers.some(r => r.year === values.year);
        if (yearExists) {
          message.error('Sổ văn bằng cho năm này đã tồn tại!');
          return;
        }
      }

      if (editingId) {

        const updatedRegisters = registers.map(r => 
          r.id === editingId 
            ? { ...r, ...values, updatedAt: new Date().toISOString() } 
            : r
        );
        setRegisters(updatedRegisters);
        message.success('Cập nhật sổ văn bằng thành công!');
      } else {

        const newRegister: CertificateRegister = {
          id: Date.now().toString(),
          year: values.year,
          name: values.name,
          description: values.description,
          currentNumber: values.currentNumber || 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setRegisters([...registers, newRegister]);
        message.success('Thêm sổ văn bằng thành công!');
      }
      setModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      sorter: (a: CertificateRegister, b: CertificateRegister) => a.year - b.year
    },
    {
      title: 'Tên sổ',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Số hiện tại',
      dataIndex: 'currentNumber',
      key: 'currentNumber'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: CertificateRegister) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa sổ văn bằng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4}>Quản lý sổ văn bằng</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm sổ văn bằng
            </Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={registers} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      <Modal
        title={editingId ? "Cập nhật sổ văn bằng" : "Thêm sổ văn bằng mới"}
        visible={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText={editingId ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="year"
            label="Năm"
            rules={[{ required: true, message: 'Vui lòng nhập năm!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={2000} max={2100} />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên sổ"
            rules={[{ required: true, message: 'Vui lòng nhập tên sổ!' }]}
          >
            <Input placeholder="Nhập tên sổ văn bằng" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item
            name="currentNumber"
            label="Số bắt đầu"
            rules={[{ required: true, message: 'Vui lòng nhập số bắt đầu!' }]}
            initialValue={1}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CertificateRegisterList;