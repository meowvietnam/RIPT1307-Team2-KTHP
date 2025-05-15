import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Space, Button, Select, Input, 
  Typography, Tag, Modal, message, Row, Col 
} from 'antd';
import { 
  UserSwitchOutlined, 
  SearchOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { ClubMember, ApplicationStatus, Club, HistoryEntry } from '../types';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const ClubMembers: React.FC = () => {
  // state
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // change club
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [targetClubId, setTargetClubId] = useState<string | null>(null);
  const [selectedMemberKeys, setSelectedMemberKeys] = useState<string[]>([]);
  
  // localStorage
  useEffect(() => {
    setLoading(true);
    const storedMembers = localStorage.getItem('clubManagement-members');
    const storedClubs = localStorage.getItem('clubManagement-clubs');
    
    if (storedMembers) {
      // mem approved
      const approvedMembers = JSON.parse(storedMembers).filter(
        (member: ClubMember) => member.status === ApplicationStatus.APPROVED
      );
      setMembers(approvedMembers);
    }
    
    if (storedClubs) {
      const activeClubs = JSON.parse(storedClubs).filter(
        (club: Club) => club.isActive
      );
      setClubs(activeClubs);
      
      // default club = 0 neu co
      if (activeClubs.length > 0 && !selectedClubId) {
        setSelectedClubId(activeClubs[0].id);
      }
    }
    
    setLoading(false);
  }, []);
  
  // mem theo club ( text ) 
  const filteredMembers = members.filter(member => {
    const matchesClub = !selectedClubId || member.clubId === selectedClubId;
    const matchesSearch = 
      member.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      member.email.toLowerCase().includes(searchText.toLowerCase()) ||
      member.phone.includes(searchText);
      
    return matchesClub && matchesSearch;
  });
  
  // club name id/
  const getClubName = (clubId: string): string => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Không xác định';
  };
  
  // thay mem -> club
  const handleTransferMembers = () => {
    if (!targetClubId || selectedMemberKeys.length === 0) {
      return;
    }
    
    const now = new Date().toISOString();
    const targetClub = clubs.find(club => club.id === targetClubId);
    
    if (!targetClub) {
      message.error('Câu lạc bộ đích không hợp lệ');
      return;
    }
    
    // update mem theo club
    const storedMembers = localStorage.getItem('clubManagement-members');
    if (storedMembers) {
      const allMembers: ClubMember[] = JSON.parse(storedMembers);
      
      // select mem update
      const updatedMembers = allMembers.map(member => {
        if (selectedMemberKeys.includes(member.id) && member.status === ApplicationStatus.APPROVED) {
          // ls neu k
          const history = member.history || [];
          
          return {
            ...member,
            clubId: targetClubId,
            updatedAt: now,
            history: [
              ...history,
              {
                timestamp: now,
                action: `Chuyển từ "${getClubName(member.clubId)}" sang "${targetClub.name}"`,
                user: 'Admin',
              }
            ]
          };
        }
        return member;
      });
      
      // update mem save
      localStorage.setItem('clubManagement-members', JSON.stringify(updatedMembers));
      
      // local
      const updatedLocalMembers = members.map(member => {
        if (selectedMemberKeys.includes(member.id)) {
          // ls
          const history = member.history || [];
          
          return {
            ...member,
            clubId: targetClubId,
            updatedAt: now,
            history: [
              ...history,
              {
                timestamp: now,
                action: `Chuyển từ "${getClubName(member.clubId)}" sang "${targetClub.name}"`,
                user: 'Admin',
              }
            ]
          };
        }
        return member;
      });
      
      setMembers(updatedLocalMembers);
      message.success(`Đã chuyển ${selectedMemberKeys.length} thành viên sang ${targetClub.name}`);
      
      // reset
      setSelectedMemberKeys([]);
      setTransferModalVisible(false);
      setTargetClubId(null);
    }
  };
  
  // row select
  const rowSelection = {
    selectedRowKeys: selectedMemberKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedMemberKeys(selectedKeys.map(key => key.toString()));
    }
  };
  
  // bang?
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
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => {
        switch (gender) {
          case 'male':
            return 'Nam';
          case 'female':
            return 'Nữ';
          default:
            return 'Khác';
        }
      },
    },
    {
      title: 'Sở trường',
      dataIndex: 'strengths',
      key: 'strengths',
    },
    {
      title: 'Câu lạc bộ',
      dataIndex: 'clubId',
      key: 'clubId',
      render: (clubId: string) => (
        <Tag color="blue">{getClubName(clubId)}</Tag>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
      sorter: (a: ClubMember, b: ClubMember) => 
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
  ];

  return (
    <>
      <Card title={<Title level={2}>Quản lý thành viên câu lạc bộ</Title>}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
              <Select
                placeholder="Chọn câu lạc bộ"
                style={{ width: '100%' }}
                value={selectedClubId}
                onChange={setSelectedClubId}
              >
                <Option value={null}>Tất cả câu lạc bộ</Option>
                {clubs.map(club => (
                  <Option key={club.id} value={club.id}>
                    {club.name}
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên, email hoặc SĐT"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
            
            <Col xs={24} md={8}>
              {selectedMemberKeys.length > 0 && (
                <Button
                  type="primary"
                  icon={<UserSwitchOutlined />}
                  onClick={() => setTransferModalVisible(true)}
                >
                  Chuyển {selectedMemberKeys.length} thành viên sang CLB khác
                </Button>
              )}
            </Col>
          </Row>
          
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredMembers}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>
      
    
      <Modal
        title={
          <Space>
            <SwapOutlined />
            <span>Chuyển {selectedMemberKeys.length} thành viên sang CLB khác</span>
          </Space>
        }
        visible={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferMembers}
        okText="Chuyển CLB"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Chọn câu lạc bộ đích:</Text>
        </div>
        
        <Select
          placeholder="Chọn câu lạc bộ đích"
          style={{ width: '100%' }}
          value={targetClubId}
          onChange={setTargetClubId}
        >
          {clubs
            .filter(club => club.id !== selectedClubId)
            .map(club => (
              <Option key={club.id} value={club.id}>
                {club.name}
              </Option>
            ))
          }
        </Select>
      </Modal>
    </>
  );
};

export default ClubMembers;