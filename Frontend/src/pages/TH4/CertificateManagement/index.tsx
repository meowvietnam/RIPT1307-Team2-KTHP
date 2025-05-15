import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Card, Modal, Form, Input, 
  DatePicker, Select, message, Typography, Popconfirm, 
  Drawer, Descriptions, InputNumber, Divider, Row, Col 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, PrinterOutlined 
} from '@ant-design/icons';
import { 
  Certificate, GraduationDecision, 
  CertificateRegister, TemplateField, FieldType 
} from '../types';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CertificateManagement: React.FC = () => {
  // State management
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [registers, setRegisters] = useState<CertificateRegister[]>([]);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  
  const [form] = Form.useForm();

  // localstorage
  useEffect(() => {
    const storedCertificates = localStorage.getItem('certificates');
    const storedDecisions = localStorage.getItem('graduationDecisions');
    const storedRegisters = localStorage.getItem('certificateRegisters');
    const storedTemplateFields = localStorage.getItem('templateFields');
    
    if (storedCertificates) {
      setCertificates(JSON.parse(storedCertificates));
    }
    
    if (storedDecisions) {
      setDecisions(JSON.parse(storedDecisions));
    }
    
    if (storedRegisters) {
      setRegisters(JSON.parse(storedRegisters));
    }
    
    if (storedTemplateFields) {
      setTemplateFields(JSON.parse(storedTemplateFields));
    }
  }, []);

  // luu vao localstorage
  useEffect(() => {
    localStorage.setItem('certificates', JSON.stringify(certificates));
  }, [certificates]);

  // vang bang moi
  const handleAdd = () => {
    if (decisions.length === 0) {
      message.warning('Vui lòng tạo ít nhất một quyết định tốt nghiệp trước!');
      return;
    }
    
    form.resetFields();
    setEditingId(null);
    setSelectedDecision(null);
    setModalVisible(true);
  };

  // sua van bang
  const handleEdit = (record: Certificate) => {
    setEditingId(record.id);
    setSelectedDecision(record.decisionId);
    
    // date -> string
    const formValues = { ...record };
    if (record.birthDate) {
      formValues.birthDate = moment(record.birthDate);
    }
    
    // template value
    Object.entries(record.templateValues || {}).forEach(([key, value]) => {
      const field = templateFields.find(f => f.name === key);
      if (field && field.type === FieldType.DATE && typeof value === 'string') {
        formValues.templateValues[key] = moment(value);
      }
    });
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  // chi tiet vang bang
  const handleView = (record: Certificate) => {
    setSelectedCertificate(record);
    setDrawerVisible(true);
  };

  // xoa van bang
  const handleDelete = (id: string) => {
    setCertificates(certificates.filter(c => c.id !== id));
    message.success('Xóa văn bằng thành công!');
  };

  // quyet dinh vb
  const handleDecisionChange = (decisionId: string) => {
    setSelectedDecision(decisionId);
    
    const decision = decisions.find(d => d.id === decisionId);
    if (decision) {
      const register = registers.find(r => r.id === decision.registerId);
      
      if (register) {
        // auto set voi new vb
        if (!editingId) {
          form.setFieldsValue({
            registerNumber: register.currentNumber
          });
        }
      }
    }
  };

  // submit form
  const handleSave = () => {
    form.validateFields().then(values => {
      const decisionId = values.decisionId;
      const decision = decisions.find(d => d.id === decisionId);
      
      if (!decision) {
        message.error('Không tìm thấy quyết định tốt nghiệp!');
        return;
      }
      
      const register = registers.find(r => r.id === decision.registerId);
      if (!register) {
        message.error('Không tìm thấy sổ văn bằng!');
        return;
      }

      // format date 
      const formattedValues = { ...values };
      if (values.birthDate) {
        formattedValues.birthDate = values.birthDate.format('YYYY-MM-DD');
      }
      
      // format template voi value
      const templateValues: { [key: string]: any } = { ...values.templateValues || {} };
      Object.entries(templateValues).forEach(([key, value]) => {
        const field = templateFields.find(f => f.name === key);
        if (field && field.type === FieldType.DATE && moment.isMoment(value)) {
          templateValues[key] = (value as moment.Moment).format('YYYY-MM-DD');
        }
      });
      
      formattedValues.templateValues = templateValues;

      if (editingId) {
        // update vb co san
        const updatedCertificates = certificates.map(c => 
          c.id === editingId 
            ? {
                ...c,
                ...formattedValues,
                updatedAt: new Date().toISOString()
              }
            : c
        );
        
        setCertificates(updatedCertificates);
        message.success('Cập nhật văn bằng thành công!');
      } else {
        // new vb
        const registerNumber = register.currentNumber;
        
        // vb voi gias tri md
        const newCertificate: Certificate = {
          id: Date.now().toString(),
          registerNumber,
          certificateNumber: values.certificateNumber,
          studentId: values.studentId,
          fullName: values.fullName,
          birthDate: formattedValues.birthDate,
          decisionId: values.decisionId,
          templateValues: templateValues,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setCertificates([...certificates, newCertificate]);
        
        // so vb
        const updatedRegisters = registers.map(r => 
          r.id === register.id 
            ? { ...r, currentNumber: r.currentNumber + 1, updatedAt: new Date().toISOString() }
            : r
        );
        
        localStorage.setItem('certificateRegisters', JSON.stringify(updatedRegisters));
        setRegisters(updatedRegisters);
        
        message.success('Thêm văn bằng thành công!');
      }
      
      setModalVisible(false);
    });
  };

  // ten vb -> qd
  const getRegisterName = (decisionId: string): string => {
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return 'Không xác định';
    
    const register = registers.find(r => r.id === decision.registerId);
    return register ? register.name : 'Không xác định';
  };

  // so vb id qd
  const getDecisionNumber = (decisionId: string): string => {
    const decision = decisions.find(d => d.id === decisionId);
    return decision ? decision.decisionNumber : 'Không xác định';
  };
  
  // sort theo order value template
  const sortedTemplateFields = [...templateFields].sort((a, b) => a.order - b.order);

  // render field theo template dc chon
  const renderDynamicFields = () => {
    if (!sortedTemplateFields.length) {
      return <div>Không có trường nào được cấu hình</div>;
    }
    
    return sortedTemplateFields.map(field => {
      const fieldName = `templateValues.${field.name}`;
      const isRequired = field.required;
      
      const rules = isRequired 
        ? [{ required: true, message: `Vui lòng nhập ${field.displayName}!` }] 
        : [];
      
      switch (field.type) {
        case FieldType.STRING:
          return (
            <Form.Item 
              key={field.id}
              label={field.displayName}
              name={fieldName}
              rules={rules}
            >
              <Input placeholder={`Nhập ${field.displayName.toLowerCase()}`} />
            </Form.Item>
          );
        case FieldType.NUMBER:
          return (
            <Form.Item 
              key={field.id}
              label={field.displayName}
              name={fieldName}
              rules={rules}
            >
              <InputNumber style={{ width: '100%' }} placeholder={`Nhập ${field.displayName.toLowerCase()}`} />
            </Form.Item>
          );
        case FieldType.DATE:
          return (
            <Form.Item 
              key={field.id}
              label={field.displayName}
              name={fieldName}
              rules={rules}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          );
        default:
          return null;
      }
    });
  };

  // hang vb
  const columns = [
    {
      title: 'Số vào sổ',
      dataIndex: 'registerNumber',
      key: 'registerNumber',
      width: 100,
    },
    {
      title: 'Số hiệu văn bằng',
      dataIndex: 'certificateNumber',
      key: 'certificateNumber',
      width: 150,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
    },
    {
      title: 'Mã sinh viên',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: 120,
      render: (text: string) => text ? new Date(text).toLocaleDateString('vi-VN') : ''
    },
    {
      title: 'Quyết định',
      dataIndex: 'decisionId',
      key: 'decisionId',
      width: 150,
      render: (decisionId: string) => getDecisionNumber(decisionId)
    },
    {
      title: 'Sổ văn bằng',
      dataIndex: 'decisionId',
      key: 'registerName',
      width: 150,
      render: (decisionId: string) => getRegisterName(decisionId)
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right' as const,
      width: 240,
      render: (_: any, record: Certificate) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            title="Xem chi tiết"
          >
            Xem
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa văn bằng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} title="Xóa">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // format vb -> display
  const formatFieldValue = (field: TemplateField, value: any): string => {
    if (value === undefined || value === null) return '';
    
    switch (field.type) {
      case FieldType.DATE:
        return value ? new Date(value).toLocaleDateString('vi-VN') : '';
      case FieldType.NUMBER:
        return value.toString();
      default:
        return value.toString();
    }
  };

  return (
    <>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4}>Quản lý văn bằng</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm văn bằng
            </Button>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={certificates} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1300 }}
          />
        </Space>
      </Card>

      {/* Certificate Form Modal */}
      <Modal
        title={editingId ? "Cập nhật văn bằng" : "Thêm văn bằng mới"}
        visible={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText={editingId ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ 
            templateValues: {} 
          }}
        >
          <Divider orientation="left">Thông tin về quyết định</Divider>
          <Form.Item
            name="decisionId"
            label="Quyết định tốt nghiệp"
            rules={[{ required: true, message: 'Vui lòng chọn quyết định tốt nghiệp!' }]}
          >
            <Select 
              placeholder="Chọn quyết định tốt nghiệp" 
              onChange={handleDecisionChange}
              disabled={!!editingId}
            >
              {decisions.map(decision => (
                <Option key={decision.id} value={decision.id}>
                  {decision.decisionNumber} - {new Date(decision.issueDate).toLocaleDateString('vi-VN')} 
                  ({getRegisterName(decision.id)})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">Thông tin văn bằng</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="registerNumber"
                label="Số vào sổ"
                rules={[{ required: true, message: 'Vui lòng nhập số vào sổ!' }]}
              >
                <InputNumber style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="certificateNumber"
                label="Số hiệu văn bằng"
                rules={[{ required: true, message: 'Vui lòng nhập số hiệu văn bằng!' }]}
              >
                <Input placeholder="Nhập số hiệu văn bằng" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Thông tin sinh viên</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Mã sinh viên"
                rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên!' }]}
              >
                <Input placeholder="Nhập mã sinh viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="birthDate"
                label="Ngày sinh"
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Nhập họ và tên sinh viên" />
          </Form.Item>

          <Divider orientation="left">Thông tin bổ sung</Divider>
          {renderDynamicFields()}
        </Form>
      </Modal>

      {/* Certificate Detail Drawer */}
      <Drawer
        title="Chi tiết văn bằng"
        placement="right"
        width={640}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        extra={
          <Space>
            <Button icon={<PrinterOutlined />}>In văn bằng</Button>
          </Space>
        }
      >
        {selectedCertificate && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Số vào sổ">
              {selectedCertificate.registerNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Số hiệu văn bằng">
              {selectedCertificate.certificateNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {selectedCertificate.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Mã sinh viên">
              {selectedCertificate.studentId}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedCertificate.birthDate 
                ? new Date(selectedCertificate.birthDate).toLocaleDateString('vi-VN') 
                : ''}
            </Descriptions.Item>
            <Descriptions.Item label="Quyết định tốt nghiệp">
              {getDecisionNumber(selectedCertificate.decisionId)}
            </Descriptions.Item>
            <Descriptions.Item label="Sổ văn bằng">
              {getRegisterName(selectedCertificate.decisionId)}
            </Descriptions.Item>
            
            <Divider orientation="left">Thông tin bổ sung</Divider>
            
            {/* Render dynamic fields */}
            {sortedTemplateFields.map(field => (
              <Descriptions.Item key={field.id} label={field.displayName}>
                {formatFieldValue(
                  field, 
                  selectedCertificate.templateValues[field.name]
                )}
              </Descriptions.Item>
            ))}
            
            <Divider orientation="left">Thông tin hệ thống</Divider>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedCertificate.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {new Date(selectedCertificate.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
};

export default CertificateManagement;