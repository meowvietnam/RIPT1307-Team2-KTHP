import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, DatePicker, 
  Table, Typography, Space, Select
} from 'antd';
import { 
  BookOutlined, 
  FileTextOutlined, 
  SearchOutlined,
  FormOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { ColumnChart, DonutChart } from '@/components/Chart';
import type { 
  GraduationDecision, 
  Certificate, 
  CertificateRegister
} from '../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard: React.FC = () => {
  // state
  const [registers, setRegisters] = useState<CertificateRegister[]>([]);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // filter
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().startOf('year'),
    moment()
  ]);
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null);
  
  // localStorage
  useEffect(() => {
    const storedRegisters = localStorage.getItem('certificateRegisters');
    const storedDecisions = localStorage.getItem('graduationDecisions');
    const storedCertificates = localStorage.getItem('certificates');
    
    if (storedRegisters) {
      setRegisters(JSON.parse(storedRegisters));
    }
    
    if (storedDecisions) {
      setDecisions(JSON.parse(storedDecisions));
    }
    
    if (storedCertificates) {
      setCertificates(JSON.parse(storedCertificates));
    }
  }, []);
  
  // filter ngay, reg
  const filteredCertificates = React.useMemo(() => {
    return certificates.filter(certificate => {
      const creationDate = moment(certificate.createdAt);
      const isInDateRange = creationDate.isBetween(dateRange[0], dateRange[1], undefined, '[]');
      
      if (!isInDateRange) return false;
      
      if (selectedRegister) {
        const decision = decisions.find(d => d.id === certificate.decisionId);
        return decision?.registerId === selectedRegister;
      }
      
      return true;
    });
  }, [certificates, decisions, dateRange, selectedRegister]);
  
  // thong so
  const stats = React.useMemo(() => {
    const totalRegisters = registers.length;
    const totalDecisions = decisions.length;
    const totalCertificates = filteredCertificates.length;
    
    // tong cong.
    const totalLookups = decisions.reduce((sum, decision) => sum + (decision.lookupCount || 0), 0);
    
    return {
      totalRegisters,
      totalDecisions,
      totalCertificates,
      totalLookups
    };
  }, [registers, decisions, filteredCertificates]);
  
  // cert cho bang
  const columns = [
    {
      title: 'Số hiệu văn bằng',
      dataIndex: 'certificateNumber',
      key: 'certificateNumber',
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
      title: 'Quyết định',
      key: 'decision',
      render: (_: unknown, record: Certificate) => {
        const decision = decisions.find(d => d.id === record.decisionId);
        return decision ? decision.decisionNumber : 'N/A';
      }
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY')
    }
  ];
  
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Tổng quan</Title>
      
      {/* Filters */}
      <Card style={{ marginBottom: 20 }}>
        <Space size="large">
          <div>
            <Text strong>Khoảng thời gian:</Text>
            <br />
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange([dates[0], dates[1]])}
              format="DD/MM/YYYY"
              allowClear={false}
              style={{ marginTop: 8, marginBottom: 8 }}
            />
          </div>
          
          <div>
            <Text strong>Sổ văn bằng:</Text>
            <br />
            <Select
              placeholder="Tất cả sổ văn bằng"
              style={{ width: 200, marginTop: 8 }}
              allowClear
              onChange={value => setSelectedRegister(value)}
              value={selectedRegister}
            >
              {registers.map(register => (
                <Option key={register.id} value={register.id}>
                  {register.name} ({register.year})
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>
      
      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic 
              title="Tổng số sổ văn bằng" 
              value={stats.totalRegisters} 
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic 
              title="Tổng số quyết định" 
              value={stats.totalDecisions} 
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic 
              title="Tổng số văn bằng" 
              value={stats.totalCertificates} 
              prefix={<FormOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic 
              title="Lượt tra cứu" 
              value={stats.totalLookups} 
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Recent certificates */}
      <Card title="Văn bằng mới cấp" style={{ marginBottom: 16 }}>
        <Table 
          dataSource={filteredCertificates.slice(0, 10)} 
          columns={columns} 
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;