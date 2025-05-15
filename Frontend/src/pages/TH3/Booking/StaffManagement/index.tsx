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
  Avatar,
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
  UserOutlined
} from '@ant-design/icons';
import { Staff, WorkSchedule } from '../types';
import StaffForm from './StaffForm';

const { Title } = Typography;

const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [searchText, setSearchText] = useState<string>('');

  // Load staff localStorage
  useEffect(() => {
    setLoading(true);
    const storedStaff = localStorage.getItem('bookingApp-staff');
    if (storedStaff) {
      setStaffList(JSON.parse(storedStaff));
    }
    setLoading(false);
  }, []);

  // Save staff localStorage
  useEffect(() => {
    localStorage.setItem('bookingApp-staff', JSON.stringify(staffList));
  }, [staffList]);

  // add/edit staff
  const handleSaveStaff = (staff: Staff) => {
    if (currentStaff) {
      // Edit staff
      const updatedStaffList = staffList.map(item => 
        item.id === staff.id ? staff : item
      );
      setStaffList(updatedStaffList);
      message.success('Nhân viên đã được cập nhật thành công');
    } else {
      // Add staff
      const newStaff = {
        ...staff,
        id: Date.now().toString(),
        isActive: true
      };
      setStaffList([...staffList, newStaff]);
      message.success('Nhân viên mới đã được thêm thành công');
    }
    setIsModalVisible(false);
    setCurrentStaff(null);
  };

  // delet staff
  const handleDeleteStaff = (id: string) => {
    setStaffList(staffList.filter(staff => staff.id !== id));
    message.success('Nhân viên đã được xóa thành công');
  };

  // staff active status
  const handleToggleStatus = (id: string, isActive: boolean) => {
    const updatedStaffList = staffList.map(staff => 
      staff.id === id ? { ...staff, isActive } : staff
    );
    setStaffList(updatedStaffList);
    message.success(`Nhân viên đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
  };

  // staff search
  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchText.toLowerCase()) ||
    staff.position.toLowerCase().includes(searchText.toLowerCase()) ||
    staff.phone.includes(searchText) ||
    staff.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // work schedule
  const formatWorkSchedule = (schedule: WorkSchedule): string => {
    const days = [
      { key: 'monday', label: 'T2' },
      { key: 'tuesday', label: 'T3' },
      { key: 'wednesday', label: 'T4' },
      { key: 'thursday', label: 'T5' },
      { key: 'friday', label: 'T6' },
      { key: 'saturday', label: 'T7' },
      { key: 'sunday', label: 'CN' }
    ];

    return days
      .filter(day => schedule[day.key as keyof WorkSchedule])
      .map(day => {
        const hours = schedule[day.key as keyof WorkSchedule];
        return hours ? `${day.label}: ${hours.startTime}-${hours.endTime}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  // Table columns
  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Staff) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            src={record.avatar}
          />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (text: string, record: Staff) => (
        <>
          <div>{record.phone}</div>
          <div>{record.email}</div>
        </>
      ),
    },
    {
      title: 'Số khách tối đa/ngày',
      dataIndex: 'maxAppointmentsPerDay',
      key: 'maxAppointmentsPerDay',
    },
    {
      title: 'Lịch làm việc',
      key: 'workSchedule',
      render: (text: string, record: Staff) => (
        <span>{formatWorkSchedule(record.workSchedule)}</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (text: string, record: Staff) => (
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
      render: (text: string, record: Staff) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentStaff(record);
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDeleteStaff(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title={<Title level={2}>Quản lý nhân viên</Title>}>
      {/* Search and add staff */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={16} md={18}>
          <Input
            placeholder="Tìm kiếm nhân viên theo tên, vị trí, số điện thoại hoặc email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentStaff(null);
              setIsModalVisible(true);
            }}
            block
          >
            Thêm nhân viên
          </Button>
        </Col>
      </Row>

      {/* Staff table */}
      <Table
        columns={columns}
        dataSource={filteredStaff}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Staff form modal */}
      <StaffForm
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentStaff(null);
        }}
        onSave={handleSaveStaff}
        staff={currentStaff}
      />
    </Card>
  );
};

export default StaffManagement;