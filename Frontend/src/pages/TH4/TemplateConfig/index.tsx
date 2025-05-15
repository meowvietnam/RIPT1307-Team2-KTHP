import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Modal, Form, Input, Select, Switch, message, Typography, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { TemplateField, FieldType } from '../types';

const { Title } = Typography;
const { Option } = Select;

const TemplateConfig: React.FC = () => {
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // localStorage
    const storedFields = localStorage.getItem('templateFields');
    if (storedFields) {
      setFields(JSON.parse(storedFields));
    } else {
      // init empty field
      const defaultFields: TemplateField[] = [
        {
          id: 'field_ethnic',
          name: 'ethnic',
          displayName: 'Dân tộc',
          type: FieldType.STRING,
          required: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'field_birthplace',
          name: 'birthplace',
          displayName: 'Nơi sinh',
          type: FieldType.STRING,
          required: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'field_gpa',
          name: 'gpa',
          displayName: 'Điểm trung bình',
          type: FieldType.NUMBER,
          required: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setFields(defaultFields);
      localStorage.setItem('templateFields', JSON.stringify(defaultFields));
    }
  }, []);

  useEffect(() => {
    // save vao local
    localStorage.setItem('templateFields', JSON.stringify(fields));
  }, [fields]);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: TemplateField) => {
    form.setFieldsValue({
      name: record.name,
      displayName: record.displayName,
      type: record.type,
      required: record.required
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // check cert
    const certificatesStr = localStorage.getItem('certificates');
    if (certificatesStr) {
      const certificates = JSON.parse(certificatesStr);
      const isUsed = certificates.some((c: any) => 
        c.templateValues && c.templateValues.hasOwnProperty(id)
      );
      if (isUsed) {
        message.error('Không thể xóa trường này vì đã có văn bằng sử dụng!');
        return;
      }
    }

    const newFields = fields.filter(f => f.id !== id);
    setFields(newFields);
    message.success('Xóa trường thành công!');
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      // check trung ten
      const nameExists = fields.some(f => 
        f.name === values.name && (editingId ? f.id !== editingId : true)
      );
      
      if (nameExists) {
        message.error('Tên trường này đã tồn tại!');
        return;
      }

      if (editingId) {
        // Update
        const updatedFields = fields.map(f => 
          f.id === editingId 
            ? { 
                ...f, 
                name: values.name,
                displayName: values.displayName,
                type: values.type,
                required: values.required,
                updatedAt: new Date().toISOString() 
              } 
            : f
        );
        setFields(updatedFields);
        message.success('Cập nhật trường thành công!');
      } else {
        // new
        const newOrder = fields.length ? Math.max(...fields.map(f => f.order)) + 1 : 1;
        const newField: TemplateField = {
          id: `field_${Date.now()}`,
          name: values.name,
          displayName: values.displayName,
          type: values.type,
          required: values.required,
          order: newOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setFields([...fields, newField]);
        message.success('Thêm trường thành công!');
      }
      setModalVisible(false);
    });
  };

  const handleMoveUp = (id: string) => {
    const index = fields.findIndex(f => f.id === id);
    if (index <= 0) return;
    
    const newFields = [...fields];
    // Swap order
    const temp = newFields[index].order;
    newFields[index].order = newFields[index - 1].order;
    newFields[index - 1].order = temp;
    
    // Sort order
    newFields.sort((a, b) => a.order - b.order);
    setFields(newFields);
  };

  const handleMoveDown = (id: string) => {
    const index = fields.findIndex(f => f.id === id);
    if (index < 0 || index >= fields.length - 1) return;
    
    const newFields = [...fields];
    // Swap order
    const temp = newFields[index].order;
    newFields[index].order = newFields[index + 1].order;
    newFields[index + 1].order = temp;
    
    // Sort order
    newFields.sort((a, b) => a.order - b.order);
    setFields(newFields);
  };

  // get field
  const getFieldTypeText = (type: FieldType): string => {
    switch (type) {
      case FieldType.STRING:
        return 'Chuỗi';
      case FieldType.NUMBER:
        return 'Số';
      case FieldType.DATE:
        return 'Ngày tháng';
      default:
        return 'Không xác định';
    }
  };

  // sort bang order
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const columns = [
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order'
    },
    {
      title: 'Tên hiển thị',
      dataIndex: 'displayName',
      key: 'displayName'
    },
    {
      title: 'Tên kỹ thuật',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'type',
      key: 'type',
      render: (type: FieldType) => getFieldTypeText(type)
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'required',
      key: 'required',
      render: (required: boolean) => required ? 'Có' : 'Không'
    },
    {
      title: 'Sắp xếp',
      key: 'sort',
      render: (_: any, record: TemplateField, index: number) => (
        <Space size="small">
          <Button 
            icon={<ArrowUpOutlined />} 
            disabled={index === 0}
            onClick={() => handleMoveUp(record.id)}
          />
          <Button 
            icon={<ArrowDownOutlined />} 
            disabled={index === fields.length - 1}
            onClick={() => handleMoveDown(record.id)}
          />
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: TemplateField) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa trường này?"
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
            <Title level={4}>Cấu hình biểu mẫu phụ lục văn bằng</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm trường
            </Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={sortedFields} 
            rowKey="id" 
            loading={loading}
            pagination={false}
          />
        </Space>
      </Card>

      <Modal
        title={editingId ? "Cập nhật trường" : "Thêm trường mới"}
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
            name="displayName"
            label="Tên hiển thị"
            rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]}
          >
            <Input placeholder="Nhập tên hiển thị" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên kỹ thuật"
            rules={[
              { required: true, message: 'Vui lòng nhập tên kỹ thuật!' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên kỹ thuật chỉ được chứa chữ cái, số và dấu gạch dưới!' }
            ]}
          >
            <Input placeholder="Nhập tên kỹ thuật (không dấu, không ký tự đặc biệt)" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Kiểu dữ liệu"
            rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu!' }]}
            initialValue={FieldType.STRING}
          >
            <Select>
              <Option value={FieldType.STRING}>Chuỗi</Option>
              <Option value={FieldType.NUMBER}>Số</Option>
              <Option value={FieldType.DATE}>Ngày tháng</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="required"
            label="Bắt buộc"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TemplateConfig;