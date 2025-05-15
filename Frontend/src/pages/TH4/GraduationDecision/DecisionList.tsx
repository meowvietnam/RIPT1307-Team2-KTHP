import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Modal, Form, Input, DatePicker, Select, message, Typography, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { GraduationDecision, CertificateRegister } from '../types';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const GraduationDecisionList: React.FC = () => {
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [registers, setRegisters] = useState<CertificateRegister[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // localStorage
    const storedDecisions = localStorage.getItem('graduationDecisions');
    if (storedDecisions) {
      setDecisions(JSON.parse(storedDecisions));
    }

    const storedRegisters = localStorage.getItem('certificateRegisters');
    if (storedRegisters) {
      setRegisters(JSON.parse(storedRegisters));
    }
  }, []);

  useEffect(() => {
    // save vao local
    localStorage.setItem('graduationDecisions', JSON.stringify(decisions));
  }, [decisions]);

  const handleAdd = () => {
    if (registers.length === 0) {
      message.warning('Vui lòng tạo ít nhất một sổ văn bằng trước!');
      return;
    }
    
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: GraduationDecision) => {
    form.setFieldsValue({
      decisionNumber: record.decisionNumber,
      issueDate: moment(record.issueDate),
      excerpt: record.excerpt,
      registerId: record.registerId
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // check vb voi quyet dinh
    const certificatesStr = localStorage.getItem('certificates');
    if (certificatesStr) {
      const certificates = JSON.parse(certificatesStr);
      const isUsed = certificates.some((c: any) => c.decisionId === id);
      if (isUsed) {
        message.error('Không thể xóa quyết định này vì đã có văn bằng tham chiếu!');
        return;
      }
    }

    const newDecisions = decisions.filter(d => d.id !== id);
    setDecisions(newDecisions);
    message.success('Xóa quyết định tốt nghiệp thành công!');
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const issueDate = values.issueDate.format('YYYY-MM-DD');
      
      if (editingId) {
        // update quyet dinh
        const updatedDecisions = decisions.map(d => 
          d.id === editingId 
            ? { 
                ...d, 
                decisionNumber: values.decisionNumber,
                issueDate,
                excerpt: values.excerpt,
                registerId: values.registerId,
                updatedAt: new Date().toISOString() 
              } 
            : d
        );
        setDecisions(updatedDecisions);
        message.success('Cập nhật quyết định tốt nghiệp thành công!');
      } else {
        // qd moi
        const newDecision: GraduationDecision = {
          id: Date.now().toString(),
          decisionNumber: values.decisionNumber,
          issueDate,
          excerpt: values.excerpt,
          registerId: values.registerId,
          lookupCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDecisions([...decisions, newDecision]);
        message.success('Thêm quyết định tốt nghiệp thành công!');
      }
      setModalVisible(false);
    });
  };

  // ten theo id
  const getRegisterName = (registerId: string): string => {
    const register = registers.find(r => r.id === registerId);
    return register ? register.name : 'Không xác định';
  };

  // qd voi name
  const enrichedDecisions = decisions.map(decision => ({
    ...decision,
    registerName: getRegisterName(decision.registerId)
  }));

  const columns = [
    {
      title: 'Số quyết định',
      dataIndex: 'decisionNumber',
      key: 'decisionNumber'
    },
    {
      title: 'Ngày ban hành',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trích yếu',
      dataIndex: 'excerpt',
      key: 'excerpt',
      ellipsis: true
    },
    {
      title: 'Sổ văn bằng',
      dataIndex: 'registerName',
      key: 'registerName'
    },
    {
      title: 'Lượt tra cứu',
      dataIndex: 'lookupCount',
      key: 'lookupCount'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: GraduationDecision) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa quyết định này?"
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
            <Title level={4}>Quản lý quyết định tốt nghiệp</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm quyết định
            </Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={enrichedDecisions} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      <Modal
        title={editingId ? "Cập nhật quyết định tốt nghiệp" : "Thêm quyết định tốt nghiệp mới"}
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
            name="decisionNumber"
            label="Số quyết định"
            rules={[{ required: true, message: 'Vui lòng nhập số quyết định!' }]}
          >
            <Input placeholder="Nhập số quyết định" />
          </Form.Item>
          <Form.Item
            name="issueDate"
            label="Ngày ban hành"
            rules={[{ required: true, message: 'Vui lòng chọn ngày ban hành!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="excerpt"
            label="Trích yếu"
            rules={[{ required: true, message: 'Vui lòng nhập trích yếu!' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập trích yếu quyết định" />
          </Form.Item>
          <Form.Item
            name="registerId"
            label="Sổ văn bằng"
            rules={[{ required: true, message: 'Vui lòng chọn sổ văn bằng!' }]}
          >
            <Select placeholder="Chọn sổ văn bằng">
              {registers.map(register => (
                <Option key={register.id} value={register.id}>
                  {register.name} ({register.year})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GraduationDecisionList;