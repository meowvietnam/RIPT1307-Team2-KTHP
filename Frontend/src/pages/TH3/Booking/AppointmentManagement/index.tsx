import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  Typography,
  Tabs,
  Badge,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { Appointment, AppointmentStatus, Staff, Service } from '../types';
import AppointmentForm from './AppointmentForm';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const AppointmentManagement: React.FC = () => {
  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  
  // Filters
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [staffFilter, setStaffFilter] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | null>(null);
  const [activeTab, setActiveTab] = useState<string>(AppointmentStatus.PENDING);

  // Load data
  useEffect(() => {
    setLoading(true);
    
    // Load appointments
    const storedAppointments = localStorage.getItem('bookingApp-appointments');
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
    
    // Load staff
    const storedStaff = localStorage.getItem('bookingApp-staff');
    if (storedStaff) {
      setStaffList(JSON.parse(storedStaff));
    }
    
    // Load services
    const storedServices = localStorage.getItem('bookingApp-services');
    if (storedServices) {
      setServiceList(JSON.parse(storedServices));
    }
    
    setLoading(false);
  }, []);

  // localStorage
  useEffect(() => {
    localStorage.setItem('bookingApp-appointments', JSON.stringify(appointments));
  }, [appointments]);

  // create/edit appointment
  const handleSaveAppointment = (appointment: Appointment) => {
    if (currentAppointment) {
      // Update appointment
      const updatedAppointments = appointments.map(item => 
        item.id === appointment.id ? appointment : item
      );
      setAppointments(updatedAppointments);
      message.success('Lịch hẹn đã được cập nhật thành công');
    } else {
      // new appointment
      const newAppointment = {
        ...appointment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAppointments([...appointments, newAppointment]);
      message.success('Lịch hẹn mới đã được tạo thành công');
    }
    setIsModalVisible(false);
    setCurrentAppointment(null);
  };

  // delete appointment
  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(appointment => appointment.id !== id));
    message.success('Lịch hẹn đã được xóa thành công');
  };

  // update appointment status
  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === id) {
        return {
          ...appointment,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return appointment;
    });
    
    setAppointments(updatedAppointments);
    message.success(`Trạng thái lịch hẹn đã được cập nhật thành ${getStatusLabel(status)}`);
  };

  // id service
  const getServiceName = (serviceId: string) => {
    const service = serviceList.find(service => service.id === serviceId);
    return service ? service.name : 'Không xác định';
  };

  // id staff
  const getStaffName = (staffId: string) => {
    const staff = staffList.find(staff => staff.id === staffId);
    return staff ? staff.name : 'Không xác định';
  };

  // status label
  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'Chờ duyệt';
      case AppointmentStatus.CONFIRMED:
        return 'Đã xác nhận';
      case AppointmentStatus.COMPLETED:
        return 'Đã hoàn thành';
      case AppointmentStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  // status tag
  const getStatusTag = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return <Tag icon={<ClockCircleOutlined />} color="orange">Chờ duyệt</Tag>;
      case AppointmentStatus.CONFIRMED:
        return <Tag icon={<CalendarOutlined />} color="blue">Đã xác nhận</Tag>;
      case AppointmentStatus.COMPLETED:
        return <Tag icon={<CheckCircleOutlined />} color="green">Đã hoàn thành</Tag>;
      case AppointmentStatus.CANCELLED:
        return <Tag icon={<CloseCircleOutlined />} color="red">Đã hủy</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Filter appointments
  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      // Filter tab (status)
      if (activeTab !== 'all' && appointment.status !== activeTab) {
        return false;
      }
      
      // Filter date range
      if (dateRange) {
        const appointmentDate = moment(appointment.date);
        if (!appointmentDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) {
          return false;
        }
      }
      
      // Filter staff
      if (staffFilter && appointment.staffId !== staffFilter) {
        return false;
      }
      
      // Filter service
      if (serviceFilter && appointment.serviceId !== serviceFilter) {
        return false;
      }
      
      return true;
    });
  };

  // dinh nghia cot
  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (text: string, record: Appointment) => (
        <div>
          <div><Text strong>{record.customerName}</Text></div>
          <div>{record.customerPhone}</div>
          <div>{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceId',
      key: 'service',
      render: (serviceId: string) => getServiceName(serviceId),
    },
    {
      title: 'Nhân viên phụ trách',
      dataIndex: 'staffId',
      key: 'staff',
      render: (staffId: string) => getStaffName(staffId),
    },
    {
      title: 'Thời gian',
      key: 'datetime',
      render: (text: string, record: Appointment) => (
        <div>
          <div>{moment(record.date).format('DD/MM/YYYY')}</div>
          <div>{record.time}</div>
        </div>
      ),
      sorter: (a: Appointment, b: Appointment) => {
        const dateA = moment(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm');
        const dateB = moment(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm');
        return dateA.valueOf() - dateB.valueOf();
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: Appointment) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentAppointment(record);
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>
          {record.status === AppointmentStatus.PENDING && (
            <Button
              type="primary"
              onClick={() => handleUpdateStatus(record.id, AppointmentStatus.CONFIRMED)}
            >
              Xác nhận
            </Button>
          )}
          {record.status === AppointmentStatus.CONFIRMED && (
            <Button
              type="primary"
              style={{ backgroundColor: 'green', borderColor: 'green' }}
              onClick={() => handleUpdateStatus(record.id, AppointmentStatus.COMPLETED)}
            >
              Hoàn thành
            </Button>
          )}
          {(record.status === AppointmentStatus.PENDING || record.status === AppointmentStatus.CONFIRMED) && (
            <Button
              danger
              onClick={() => handleUpdateStatus(record.id, AppointmentStatus.CANCELLED)}
            >
              Hủy
            </Button>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa lịch hẹn này?"
            onConfirm={() => handleDeleteAppointment(record.id)}
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

  // dem status
  const getStatusCount = (status: AppointmentStatus) => {
    return appointments.filter(appointment => appointment.status === status).length;
  };

  return (
    <Card title={<Title level={2}>Quản lý lịch hẹn</Title>}>
      {/* Filter section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={(dates) => {
              setDateRange(dates as [moment.Moment, moment.Moment]);
            }}
            format="DD/MM/YYYY"
            allowClear
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn nhân viên"
            allowClear
            onChange={(value: string) => setStaffFilter(value || null)}
          >
            {staffList
              .filter(staff => staff.isActive)
              .map(staff => (
                <Option key={staff.id} value={staff.id}>
                  {staff.name}
                </Option>
              ))}
          </Select>
        </Col>
        <Col xs={24} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn dịch vụ"
            allowClear
            onChange={(value: string) => setServiceFilter(value || null)}
          >
            {serviceList
              .filter(service => service.isActive)
              .map(service => (
                <Option key={service.id} value={service.id}>
                  {service.name}
                </Option>
              ))}
          </Select>
        </Col>
        <Col xs={24} md={6}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              if (staffList.length === 0) {
                message.warning('Vui lòng thêm ít nhất một nhân viên trước khi đặt lịch.');
                return;
              }
              if (serviceList.length === 0) {
                message.warning('Vui lòng thêm ít nhất một dịch vụ trước khi đặt lịch.');
                return;
              }
              setCurrentAppointment(null);
              setIsModalVisible(true);
            }}
            style={{ width: '100%' }}
          >
            Tạo lịch hẹn mới
          </Button>
        </Col>
      </Row>

      {/* Status tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        style={{ marginBottom: 16 }}
      >
        <TabPane 
          tab={
            <Badge count={getStatusCount(AppointmentStatus.PENDING)} showZero>
              <span>Chờ duyệt</span>
            </Badge>
          }
          key={AppointmentStatus.PENDING} 
        />
        <TabPane 
          tab={
            <Badge count={getStatusCount(AppointmentStatus.CONFIRMED)} showZero>
              <span>Đã xác nhận</span>
            </Badge>
          }
          key={AppointmentStatus.CONFIRMED} 
        />
        <TabPane 
          tab={
            <Badge count={getStatusCount(AppointmentStatus.COMPLETED)} showZero>
              <span>Đã hoàn thành</span>
            </Badge>
          }
          key={AppointmentStatus.COMPLETED} 
        />
        <TabPane 
          tab={
            <Badge count={getStatusCount(AppointmentStatus.CANCELLED)} showZero>
              <span>Đã hủy</span>
            </Badge>
          }
          key={AppointmentStatus.CANCELLED} 
        />
        <TabPane 
          tab="Tất cả" 
          key="all" 
        />
      </Tabs>

      {/* Appointments table */}
      <Table
        columns={columns}
        dataSource={getFilteredAppointments()}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Appointment form modal */}
      <AppointmentForm
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentAppointment(null);
        }}
        onSave={handleSaveAppointment}
        appointment={currentAppointment}
        staffList={staffList}
        serviceList={serviceList}
      />
    </Card>
  );
};

export default AppointmentManagement;