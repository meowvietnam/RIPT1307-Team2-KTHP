import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Input, Button, DatePicker, 
  Table, Typography, Empty, Alert, Space, 
  Descriptions, Divider, Row, Col, Badge, Modal
} from 'antd';
import { 
  SearchOutlined, 
  InfoCircleOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import { 
  Certificate, 
  GraduationDecision, 
  CertificateRegister,
  TemplateField,
  FieldType,
  SearchParams
} from '../types';
import moment from 'moment';

const { Title, Text } = Typography;

const CertificateLookup: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [registers, setRegisters] = useState<CertificateRegister[]>([]);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  
  const [searchResults, setSearchResults] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [form] = Form.useForm();

  // Load data from localStorage
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

  // submit form
  const handleSearch = (values: SearchParams) => {
    setSearchPerformed(true);
    setLoading(true);
    setErrorMessage(null);
    
    // check 2 field xem dc k
    const filledParams = Object.values(values).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
    
    // format yyyy-mm-dd
    if (values.birthDate && moment.isMoment(values.birthDate)) {
      values.birthDate = (values.birthDate as moment.Moment).format('YYYY-MM-DD');
    }
    
    // check 2 field xem dc k
    if (filledParams < 2) {
      setErrorMessage('Vui lòng nhập ít nhất 2 tiêu chí tìm kiếm!');
      setSearchResults([]);
      setLoading(false);
      return;
    }
    
    // delay debug
    setTimeout(() => {
      // check chi tieu, tim van bang
      const results = certificates.filter(certificate => {
        const matchesCertificateNumber = !values.certificateNumber || 
          certificate.certificateNumber.toLowerCase().includes(values.certificateNumber.toLowerCase());
        
        const matchesRegisterNumber = !values.registerNumber || 
          certificate.registerNumber.toString() === values.registerNumber;
        
        const matchesStudentId = !values.studentId || 
          certificate.studentId.toLowerCase().includes(values.studentId.toLowerCase());
        
        const matchesFullName = !values.fullName || 
          certificate.fullName.toLowerCase().includes(values.fullName.toLowerCase());
        
        const matchesBirthDate = !values.birthDate || 
          certificate.birthDate === values.birthDate;
        
        return matchesCertificateNumber && matchesRegisterNumber && 
               matchesStudentId && matchesFullName && matchesBirthDate;
      });
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setErrorMessage('Không tìm thấy văn bằng phù hợp với thông tin đã nhập.');
      } else {
        // debug tang lookup
        const updatedDecisions = [...decisions];
        const affectedDecisionIds = new Set(results.map(r => r.decisionId));
        
        affectedDecisionIds.forEach(decisionId => {
          const decisionIndex = updatedDecisions.findIndex(d => d.id === decisionId);
          if (decisionIndex >= 0) {
            updatedDecisions[decisionIndex] = {
              ...updatedDecisions[decisionIndex],
              lookupCount: (updatedDecisions[decisionIndex].lookupCount || 0) + 1
            };
          }
        });
        
        // localstorage
        setDecisions(updatedDecisions);
        localStorage.setItem('graduationDecisions', JSON.stringify(updatedDecisions));
      }
      
      setLoading(false);
    }, 500); // 500ms
  };

  // clear search
  const handleClearSearch = () => {
    form.resetFields();
    setSearchResults([]);
    setSearchPerformed(false);
    setErrorMessage(null);
  };

  // thong tin van bang
  const handleViewDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setDetailModalVisible(true);
  };

  // chi tiet
  const getDecisionDetails = (decisionId: string) => {
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return { number: 'Không xác định', date: '' };
    
    return {
      number: decision.decisionNumber,
      date: new Date(decision.issueDate).toLocaleDateString('vi-VN'),
      excerpt: decision.excerpt
    };
  };

  // helper dang ky
  const getRegisterDetails = (decisionId: string) => {
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return { name: 'Không xác định', year: '' };
    
    const register = registers.find(r => r.id === decision.registerId);
    if (!register) return { name: 'Không xác định', year: '' };
    
    return {
      name: register.name,
      year: register.year
    };
  };

  // format -> hien thi
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

  // sort theo cai order
  const sortedTemplateFields = [...templateFields].sort((a, b) => a.order - b.order);

  // bang tim kiem
  const columns = [
    {
      title: 'Số hiệu văn bằng',
      dataIndex: 'certificateNumber',
      key: 'certificateNumber',
    },
    {
      title: 'Số vào sổ',
      dataIndex: 'registerNumber',
      key: 'registerNumber',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Mã sinh viên',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthDate',
      key: 'birthDate',
      render: (text: string) => text ? new Date(text).toLocaleDateString('vi-VN') : ''
    },
    {
      title: 'Quyết định',
      key: 'decision',
      render: (_: any, record: Certificate) => {
        const decision = getDecisionDetails(record.decisionId);
        return decision.number;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Certificate) => (
        <Button 
          type="primary" 
          icon={<InfoCircleOutlined />} 
          onClick={() => handleViewDetails(record)}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <>
      <Card>
        <Title level={4}>Tra cứu văn bằng</Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="certificateNumber"
                label="Số hiệu văn bằng"
              >
                <Input placeholder="Nhập số hiệu văn bằng" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="registerNumber"
                label="Số vào sổ"
              >
                <Input placeholder="Nhập số vào sổ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="studentId"
                label="Mã sinh viên"
              >
                <Input placeholder="Nhập mã sinh viên" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="birthDate"
                label="Ngày sinh"
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
                loading={loading}
              >
                Tìm kiếm
              </Button>
              <Button onClick={handleClearSearch}>
                Xóa tìm kiếm
              </Button>
            </Space>
          </Form.Item>
          
          {errorMessage && (
            <Alert
              message={errorMessage}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Form>
        
        <Divider orientation="left">Kết quả tìm kiếm</Divider>
        
        {searchPerformed ? (
          <Table
            columns={columns}
            dataSource={searchResults}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            locale={{ 
              emptyText: <Empty description="Không tìm thấy kết quả phù hợp" /> 
            }}
          />
        ) : (
          <Empty description="Vui lòng nhập thông tin tìm kiếm" />
        )}
      </Card>
      
      <Modal
        title="Chi tiết văn bằng"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button 
            key="print" 
            type="primary" 
            icon={<FilePdfOutlined />}
          >
            In văn bằng
          </Button>,
          <Button 
            key="close" 
            onClick={() => setDetailModalVisible(false)}
          >
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedCertificate && (
          <>
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Số hiệu văn bằng" span={2}>
                <Text strong>{selectedCertificate.certificateNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số vào sổ">
                {selectedCertificate.registerNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                <Text strong>{selectedCertificate.fullName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã sinh viên">
                {selectedCertificate.studentId}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedCertificate.birthDate ? 
                  new Date(selectedCertificate.birthDate).toLocaleDateString('vi-VN') : ''}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">Thông tin văn bằng</Divider>
            
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}>
              {sortedTemplateFields.map(field => (
                <Descriptions.Item key={field.id} label={field.displayName}>
                  {formatFieldValue(
                    field, 
                    selectedCertificate.templateValues[field.name]
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
            
            <Divider orientation="left">Thông tin quyết định</Divider>
            
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Quyết định tốt nghiệp">
                {getDecisionDetails(selectedCertificate.decisionId).number}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày ban hành">
                {getDecisionDetails(selectedCertificate.decisionId).date}
              </Descriptions.Item>
              <Descriptions.Item label="Trích yếu" span={2}>
                {getDecisionDetails(selectedCertificate.decisionId).excerpt}
              </Descriptions.Item>
              <Descriptions.Item label="Sổ văn bằng">
                {getRegisterDetails(selectedCertificate.decisionId).name}
              </Descriptions.Item>
              <Descriptions.Item label="Năm">
                {getRegisterDetails(selectedCertificate.decisionId).year}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">Thông tin hệ thống</Divider>
            
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Ngày cấp">
                {new Date(selectedCertificate.createdAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge status="success" text="Hợp lệ" />
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </>
  );
};

export default CertificateLookup;