import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Modal,
  message,
  Popconfirm,
  Switch,
  Row,
  Col,
  Input,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { Service } from '../types';
import ServiceForm from './ServiceForm';

const { Title } = Typography;

const ServiceManagement: React.FC = () => {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [searchText, setSearchText] = useState<string>('');

  // Load services from localStorage
  useEffect(() => {
    setLoading(true);
    const storedServices = localStorage.getItem('bookingApp-services');
    if (storedServices) {
      setServiceList(JSON.parse(storedServices));
    }
    setLoading(false);
  }, []);

  // Save services vao localStorage
  useEffect(() => {
    localStorage.setItem('bookingApp-services', JSON.stringify(serviceList));
  }, [serviceList]);

  // add/edit service
  const handleSaveService = (service: Service) => {
    if (currentService) {
      const updatedServiceList = serviceList.map(item => 
        item.id === service.id ? service : item
      );
      setServiceList(updatedServiceList);
      message.success('Dịch vụ đã được cập nhật thành công');
    } else {
      // Add service
      const newService = {
        ...service,
        id: Date.now().toString(),
        isActive: true
      };
      setServiceList([...serviceList, newService]);
      message.success('Dịch vụ mới đã được thêm thành công');
    }
    setIsModalVisible(false);
    setCurrentService(null);
  };

  // delete service
  const handleDeleteService = (id: string) => {
    setServiceList(serviceList.filter(service => service.id !== id));
    message.success('Dịch vụ đã được xóa thành công');
  };

  // toggling service active status
  const handleToggleStatus = (id: string, isActive: boolean) => {
    const updatedServiceList = serviceList.map(service => 
      service.id === id ? { ...service, isActive } : service
    );
    setServiceList(updatedServiceList);
    message.success(`Dịch vụ đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
  };

  // Filter services bang search
  const filteredServices = serviceList.filter(service => 
    service.name.toLowerCase().includes(searchText.toLowerCase()) ||
    service.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Format VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format hours minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours} giờ ${remainingMinutes} phút` : `${hours} giờ`;
    }
  };

  const columns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => (
        <div>
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Giá dịch vụ',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <Tag color="blue">{formatPrice(price)}</Tag>,
      sorter: (a: Service, b: Service) => a.price - b.price,
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => formatDuration(duration),
      sorter: (a: Service, b: Service) => a.duration - b.duration,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text: string, record: Service) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Không hoạt động"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: Service) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentService(record);
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa dịch vụ này?"
            onConfirm={() => handleDeleteService(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title={<Title level={2}>Quản lý dịch vụ</Title>}>
      {/* Search and add service */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={16} md={18}>
          <Input
            placeholder="Tìm kiếm dịch vụ..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentService(null);
              setIsModalVisible(true);
            }}
            block
          >
            Thêm dịch vụ
          </Button>
        </Col>
      </Row>

      {/* Service table */}
      <Table
        columns={columns}
        dataSource={filteredServices}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Service form modal */}
      <ServiceForm
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentService(null);
        }}
        onSave={handleSaveService}
        service={currentService}
      />
    </Card>
  );
};

export default ServiceManagement;