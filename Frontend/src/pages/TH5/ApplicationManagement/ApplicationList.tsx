import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Card, Modal, Form, Input, 
  Select, DatePicker, Typography, Popconfirm, Tag, 
  Radio, Drawer, Tabs, Timeline, message, Row, Col, Descriptions
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CheckOutlined, CloseOutlined, InfoCircleOutlined,
  UserOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { ClubMember, ApplicationStatus, Club, HistoryEntry } from '../types';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ApplicationList: React.FC = () => {
  // State 
  const [applications, setApplications] = useState<ClubMember[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [currentApplication, setCurrentApplication] = useState<ClubMember | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  
  // chon cot
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchActionType, setBatchActionType] = useState<'approve' | 'reject' | null>(null);
  const [batchRejectReason, setBatchRejectReason] = useState('');
  
  // load tu local
  useEffect(() => {
    setLoading(true);
    const storedApplications = localStorage.getItem('clubManagement-members');
    const storedClubs = localStorage.getItem('clubManagement-clubs');
    
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }
    
    if (storedClubs) {
      setClubs(JSON.parse(storedClubs));
    }
    
    setLoading(false);
  }, []);
  
  // save app local
  useEffect(() => {
    localStorage.setItem('clubManagement-members', JSON.stringify(applications));
  }, [applications]);
  
  // new app
  const handleAdd = () => {
    setCurrentApplication(null);
    form.resetFields();
    setFormVisible(true);
  };
  
  // edit app
  const handleEdit = (record: ClubMember) => {
    setCurrentApplication(record);
    form.setFieldsValue({
      ...record,
      clubId: record.clubId
    });
    setFormVisible(true);
  };
  
  // app detail
  const handleViewDetails = (record: ClubMember) => {
    setCurrentApplication(record);
    setDetailVisible(true);
  };
  
  // history
  const handleViewHistory = (record: ClubMember) => {
    setCurrentApplication(record);
    setHistoryVisible(true);
  };
  
  // xoa app
  const handleDelete = (id: string) => {
    setApplications(applications.filter(app => app.id !== id));
    message.success('Xóa đơn đăng ký thành công');
  };
  
  // submit form
  const handleFormSubmit = () => {
    form.validateFields().then(values => {
      const now = new Date().toISOString();
      
      if (currentApplication) {
        // update app
        const updatedApplications = applications.map(app => {
          if (app.id === currentApplication.id) {
            // ls app
            const history = app.history || [];
            
            return {
              ...app,
              ...values,
              updatedAt: now,
              history: [
                ...history,
                {
                  timestamp: now,
                  action: 'Cập nhật thông tin',
                  user: 'Admin',
                }
              ]
            };
          }
          return app;
        });
        
        setApplications(updatedApplications);
        message.success('Cập nhật đơn đăng ký thành công');
      } else {
        // new app
        const newApplication: ClubMember = {
          id: Date.now().toString(),
          ...values,
          status: ApplicationStatus.PENDING,
          createdAt: now,
          updatedAt: now,
          history: [
            {
              timestamp: now,
              action: 'Tạo đơn đăng ký',
              user: 'Admin',
            }
          ]
        };
        
        setApplications([...applications, newApplication]);
        message.success('Thêm đơn đăng ký thành công');
      }
      
      setFormVisible(false);
    });
  };
  
  // accept app
  const handleApprove = (id: string) => {
    const now = new Date().toISOString();
    
    const updatedApplications = applications.map(app => {
      if (app.id === id) {
        // ls app
        const history = app.history || [];
        
        return {
          ...app,
          status: ApplicationStatus.APPROVED,
          updatedAt: now,
          history: [
            ...history,
            {
              timestamp: now,
              action: 'Đã duyệt đơn',
              user: 'Admin',
            }
          ]
        };
      }
      return app;
    });
    
    setApplications(updatedApplications);
    message.success('Duyệt đơn đăng ký thành công');
  };
  
  // app reject
  const handleShowRejectModal = (record: ClubMember) => {
    setCurrentApplication(record);
    rejectForm.resetFields();
    setRejectVisible(true);
  };
  
  // reject + ly do
  const handleReject = () => {
    rejectForm.validateFields().then(values => {
      if (!currentApplication) return;
      
      const now = new Date().toISOString();
      const updatedApplications = applications.map(app => {
        if (app.id === currentApplication.id) {
          // check ls + co hay k
          const history = app.history || [];
          
          return {
            ...app,
            status: ApplicationStatus.REJECTED,
            rejectReason: values.rejectReason,
            updatedAt: now,
            history: [
              ...history,
              {
                timestamp: now,
                action: 'Đã từ chối đơn',
                user: 'Admin',
                reason: values.rejectReason
              }
            ]
          };
        }
        return app;
      });
      
      setApplications(updatedApplications);
      message.success('Từ chối đơn đăng ký thành công');
      setRejectVisible(false);
    });
  };
  
  // check batch
  const handleBatchOperation = () => {
    if (!selectedRowKeys.length) return;
    
    const now = new Date().toISOString();
    let updatedApplications = [...applications];
    let successMessage = '';
    
    if (batchActionType === 'approve') {
      // accept batch
      updatedApplications = applications.map(app => {
        if (selectedRowKeys.includes(app.id) && app.status === ApplicationStatus.PENDING) {
          // ls
          const history = app.history || [];
          
          return {
            ...app,
            status: ApplicationStatus.APPROVED,
            updatedAt: now,
            history: [
              ...history,
              {
                timestamp: now,
                action: 'Đã duyệt đơn (hàng loạt)',
                user: 'Admin',
              }
            ]
          };
        }
        return app;
      });
      
      successMessage = `Đã duyệt ${selectedRowKeys.length} đơn đăng ký`;
    } else if (batchActionType === 'reject') {
      // reject
      if (!batchRejectReason.trim()) {
        message.error('Vui lòng nhập lý do từ chối');
        return;
      }
      
      updatedApplications = applications.map(app => {
        if (selectedRowKeys.includes(app.id) && app.status === ApplicationStatus.PENDING) {
          // ls
          const history = app.history || [];
          
          return {
            ...app,
            status: ApplicationStatus.REJECTED,
            rejectReason: batchRejectReason,
            updatedAt: now,
            history: [
              ...history,
              {
                timestamp: now,
                action: 'Đã từ chối đơn (hàng loạt)',
                user: 'Admin',
                reason: batchRejectReason
              }
            ]
          };
        }
        return app;
      });
      
      successMessage = `Đã từ chối ${selectedRowKeys.length} đơn đăng ký`;
    }
    
    setApplications(updatedApplications);
    setSelectedRowKeys([]);
    setBatchActionType(null);
    setBatchRejectReason('');
    message.success(successMessage);
  };
  
  // status + club
  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    const matchesClub = !selectedClub || app.clubId === selectedClub;
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      app.email.toLowerCase().includes(searchText.toLowerCase()) ||
      app.phone.includes(searchText);
      
    return matchesStatus && matchesClub && matchesSearch;
  });
  
  // club => id
  const getClubName = (clubId: string): string => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Không xác định';
  };
  
  // club color
  const getStatusTag = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
      case ApplicationStatus.APPROVED:
        return <Tag color="green" icon={<CheckOutlined />}>Đã duyệt</Tag>;
      case ApplicationStatus.REJECTED:
        return <Tag color="red" icon={<CloseOutlined />}>Từ chối</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };
  
  // row select
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
        // pending
      const pendingKeys = applications
        .filter(app => app.status === ApplicationStatus.PENDING)
        .map(app => app.id);
        
      const validSelectedKeys = selectedKeys.filter(key => 
        pendingKeys.includes(key.toString())
      );
      
      setSelectedRowKeys(validSelectedKeys);
    }
  };
  
  // table
  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: ClubMember, b: ClubMember) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Câu lạc bộ',
      dataIndex: 'clubId',
      key: 'clubId',
      render: (clubId: string) => getClubName(clubId),
      sorter: (a: ClubMember, b: ClubMember) => getClubName(a.clubId).localeCompare(getClubName(b.clubId)),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: ApplicationStatus) => getStatusTag(status),
      sorter: (a: ClubMember, b: ClubMember) => a.status.localeCompare(b.status),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: ClubMember, b: ClubMember) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ClubMember) => (
        <Space size="small">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => handleViewDetails(record)}
            title="Xem chi tiết"
          >
            Chi tiết
          </Button>
          
          <Button
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
            title="Xem lịch sử"
          >
            Lịch sử
          </Button>
          
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          >
            Sửa
          </Button>
          
          {record.status === ApplicationStatus.PENDING && (
            <>
              <Button
                type="primary"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                title="Duyệt đơn"
              >
                Duyệt
              </Button>
              
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleShowRejectModal(record)}
                title="Từ chối"
              >
                Từ chối
              </Button>
            </>
          )}
          
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đơn đăng ký này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} title="Xóa">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card title={<Title level={2}>Quản lý đơn đăng ký thành viên</Title>}>
        <Space direction="vertical" style={{ width: '100%' }}>
          
          <div style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Input.Search
                  placeholder="Tìm kiếm theo tên, email hoặc SĐT"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  allowClear
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} md={8}>
                <Select
                  placeholder="Lọc theo câu lạc bộ"
                  style={{ width: '100%' }}
                  value={selectedClub}
                  onChange={(value) => setSelectedClub(value)}
                  allowClear
                >
                  {clubs.map(club => (
                    <Option key={club.id} value={club.id}>{club.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <Select
                  placeholder="Lọc theo trạng thái"
                  style={{ width: '100%' }}
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value)}
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value={ApplicationStatus.PENDING}>Chờ duyệt</Option>
                  <Option value={ApplicationStatus.APPROVED}>Đã duyệt</Option>
                  <Option value={ApplicationStatus.REJECTED}>Từ chối</Option>
                </Select>
              </Col>
            </Row>
          </div>

          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              {selectedRowKeys.length > 0 && (
                <>
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    icon={<CheckOutlined />}
                    onClick={() => {
                      setBatchActionType('approve');
                      Modal.confirm({
                        title: `Duyệt ${selectedRowKeys.length} đơn đăng ký đã chọn?`,
                        content: 'Đơn đăng ký đã duyệt sẽ được thêm vào danh sách thành viên CLB',
                        icon: <ExclamationCircleOutlined />,
                        okText: 'Duyệt',
                        cancelText: 'Hủy',
                        onOk: handleBatchOperation,
                      });
                    }}
                  >
                    Duyệt {selectedRowKeys.length} đơn đã chọn
                  </Button>
                  
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setBatchActionType('reject');
                      Modal.confirm({
                        title: `Từ chối ${selectedRowKeys.length} đơn đăng ký đã chọn?`,
                        icon: <ExclamationCircleOutlined />,
                        content: (
                          <div>
                            <p>Vui lòng nhập lý do từ chối:</p>
                            <TextArea 
                              rows={3} 
                              placeholder="Nhập lý do từ chối"
                              value={batchRejectReason}
                              onChange={e => setBatchRejectReason(e.target.value)}
                            />
                          </div>
                        ),
                        okText: 'Từ chối',
                        cancelText: 'Hủy',
                        onOk: handleBatchOperation,
                      });
                    }}
                  >
                    Từ chối {selectedRowKeys.length} đơn đã chọn
                  </Button>
                </>
              )}
            </Space>
            
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm đơn đăng ký
            </Button>
          </div>
          

          <Table 
            rowSelection={rowSelection}
            columns={columns} 
            dataSource={filteredApplications}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>
      

      <Modal
        title={currentApplication ? "Chỉnh sửa đơn đăng ký" : "Thêm đơn đăng ký mới"}
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleFormSubmit}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^\d{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                initialValue="male"
              >
                <Radio.Group>
                  <Radio value="male">Nam</Radio>
                  <Radio value="female">Nữ</Radio>
                  <Radio value="other">Khác</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="clubId"
                label="Câu lạc bộ"
                rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ!' }]}
              >
                <Select placeholder="Chọn câu lạc bộ">
                  {clubs.map(club => (
                    <Option key={club.id} value={club.id}>{club.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="strengths"
                label="Sở trường"
                rules={[{ required: true, message: 'Vui lòng nhập sở trường!' }]}
              >
                <Input placeholder="Nhập sở trường" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="reason"
            label="Lý do đăng ký"
            rules={[{ required: true, message: 'Vui lòng nhập lý do đăng ký!' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do đăng ký" />
          </Form.Item>
        </Form>
      </Modal>
      

      <Drawer
        title="Chi tiết đơn đăng ký"
        width={640}
        onClose={() => setDetailVisible(false)}
        visible={detailVisible}
      >
        {currentApplication && (
          <div>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Thông tin đơn đăng ký" key="1">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Họ và tên">
                    {currentApplication.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {currentApplication.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {currentApplication.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới tính">
                    {currentApplication.gender === 'male' ? 'Nam' : 
                     currentApplication.gender === 'female' ? 'Nữ' : 'Khác'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {currentApplication.address}
                  </Descriptions.Item>
                  <Descriptions.Item label="Câu lạc bộ">
                    {getClubName(currentApplication.clubId)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Sở trường">
                    {currentApplication.strengths}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lý do đăng ký">
                    <Paragraph>{currentApplication.reason}</Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {getStatusTag(currentApplication.status)}
                  </Descriptions.Item>
                  
                  {currentApplication.status === ApplicationStatus.REJECTED && (
                    <Descriptions.Item label="Lý do từ chối">
                      <Text type="danger">{currentApplication.rejectReason}</Text>
                    </Descriptions.Item>
                  )}
                  
                  <Descriptions.Item label="Ngày đăng ký">
                    {moment(currentApplication.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
              
              <TabPane tab="Lịch sử thao tác" key="2">
                {currentApplication.history && currentApplication.history.length > 0 ? (
                  <Timeline mode="left">
                    {[...currentApplication.history].reverse().map((entry, index) => (
                      <Timeline.Item 
                        key={index}
                        label={moment(entry.timestamp).format('DD/MM/YYYY HH:mm:ss')}
                      >
                        <Text strong>{entry.action}</Text> bởi {entry.user}
                        {entry.reason && (
                          <div>
                            <Text type="secondary">Lý do: {entry.reason}</Text>
                          </div>
                        )}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Text>Không có lịch sử thao tác</Text>
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
      

      <Drawer
        title="Lịch sử thao tác"
        width={500}
        onClose={() => setHistoryVisible(false)}
        visible={historyVisible}
      >
        {currentApplication && currentApplication.history && currentApplication.history.length > 0 ? (
          <Timeline mode="left">
            {[...currentApplication.history].reverse().map((entry, index) => (
              <Timeline.Item 
                key={index}
                label={moment(entry.timestamp).format('DD/MM/YYYY HH:mm:ss')}
              >
                <Text strong>{entry.action}</Text> bởi {entry.user}
                {entry.reason && (
                  <div>
                    <Text type="secondary">Lý do: {entry.reason}</Text>
                  </div>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Text>Không có lịch sử thao tác</Text>
        )}
      </Drawer>
      

      <Modal
        title="Từ chối đơn đăng ký"
        visible={rejectVisible}
        onOk={handleReject}
        onCancel={() => setRejectVisible(false)}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejectReason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do từ chối đơn đăng ký" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ApplicationList;