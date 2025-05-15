import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, 
  Typography, Select, Button, Table
} from 'antd';
import { 
  TeamOutlined, 
  FormOutlined, 
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { ClubMember, Club, ApplicationStatus, Stats } from '../types';
import ColumnChart from '@/components/Chart/ColumnChart';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard: React.FC = () => {
  // state
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalClubs: 0,
    activeClubs: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  });
  
  // export
  const [selectedExportClub, setSelectedExportClub] = useState<string | null>(null);
  
  // localstorage
  useEffect(() => {
    const storedMembers = localStorage.getItem('clubManagement-members');
    const storedClubs = localStorage.getItem('clubManagement-clubs');
    
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }
    
    if (storedClubs) {
      setClubs(JSON.parse(storedClubs));
    }
  }, []);
  
  // stat
  useEffect(() => {
    const activeClubs = clubs.filter(club => club.isActive);
    const pendingApplications = members.filter(member => member.status === ApplicationStatus.PENDING);
    const approvedApplications = members.filter(member => member.status === ApplicationStatus.APPROVED);
    const rejectedApplications = members.filter(member => member.status === ApplicationStatus.REJECTED);
    
    setStats({
      totalClubs: clubs.length,
      activeClubs: activeClubs.length,
      pendingApplications: pendingApplications.length,
      approvedApplications: approvedApplications.length,
      rejectedApplications: rejectedApplications.length,
    });
  }, [clubs, members]);
  
  // app theo club
  const applicationsByClubData = React.useMemo(() => {
    const clubNames: string[] = [];
    const pendingData: number[] = [];
    const approvedData: number[] = [];
    const rejectedData: number[] = [];
    
    clubs.forEach(club => {
      clubNames.push(club.name);
      
      // count mem 
      const clubMembers = members.filter(member => member.clubId === club.id);
      
      pendingData.push(
        clubMembers.filter(member => member.status === ApplicationStatus.PENDING).length
      );
      
      approvedData.push(
        clubMembers.filter(member => member.status === ApplicationStatus.APPROVED).length
      );
      
      rejectedData.push(
        clubMembers.filter(member => member.status === ApplicationStatus.REJECTED).length
      );
    });
    
    return {
      xAxis: clubNames,
      yAxis: [pendingData, approvedData, rejectedData],
      yLabel: ['Chờ duyệt', 'Đã duyệt', 'Từ chối']
    };
  }, [clubs, members]);
  
  // excel shit
  const handleExport = () => {
    if (!selectedExportClub) {
      return;
    }
    
    // club cac thu
    const club = clubs.find(c => c.id === selectedExportClub);
    if (!club) {
      return;
    }
    
    // check approved mem
    const approvedMembers = members.filter(
      member => member.clubId === selectedExportClub && 
                member.status === ApplicationStatus.APPROVED
    );
    
    // data -> export
    const exportData = approvedMembers.map((member, index) => ({
      'STT': index + 1,
      'Họ và tên': member.fullName,
      'Email': member.email,
      'Số điện thoại': member.phone,
      'Giới tính': member.gender === 'male' ? 'Nam' : 
                   member.gender === 'female' ? 'Nữ' : 'Khác',
      'Địa chỉ': member.address,
      'Sở trường': member.strengths,
      'Ngày tham gia': new Date(member.updatedAt).toLocaleDateString('vi-VN')
    }));
    
    // worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    
    // xel
    const filename = `Danh_sach_thanh_vien_${club.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };
  
  // mem list
  const exportPreviewMembers = selectedExportClub 
    ? members.filter(
        member => member.clubId === selectedExportClub && 
                  member.status === ApplicationStatus.APPROVED
      )
    : [];
    
  // table -> export
  const exportPreviewColumns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
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
    }
  ];
  
  return (
    <>
      <Title level={2}>Tổng quan hệ thống quản lý câu lạc bộ</Title>
      
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số CLB"
              value={stats.totalClubs}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">CLB đang hoạt động: {stats.activeClubs}</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn đăng ký chờ duyệt"
              value={stats.pendingApplications}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn đã duyệt"
              value={stats.approvedApplications}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn bị từ chối"
              value={stats.rejectedApplications}
              prefix={<CloseOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
      

      <Card title="Số đơn đăng ký theo từng CLB" style={{ marginBottom: 24 }}>
        <ColumnChart 
          xAxis={applicationsByClubData.xAxis} 
          yAxis={applicationsByClubData.yAxis} 
          yLabel={applicationsByClubData.yLabel} 
          height={400} 
          colors={['#faad14', '#52c41a', '#ff4d4f']}
          formatY={(val) => val.toString()}
        />
      </Card>
      
      
      <Card title="Xuất danh sách thành viên" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Select
                placeholder="Chọn câu lạc bộ"
                style={{ width: '100%', marginRight: 16 }}
                value={selectedExportClub}
                onChange={setSelectedExportClub}
              >
                {clubs.map(club => (
                  <Option key={club.id} value={club.id}>
                    {club.name} ({
                      members.filter(
                        m => m.clubId === club.id && 
                            m.status === ApplicationStatus.APPROVED
                      ).length
                    } thành viên)
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} md={12}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                disabled={!selectedExportClub}
              >
                Xuất Excel
              </Button>
            </Col>
          </Row>
        </div>
        
        {selectedExportClub && (
          <>
            <Text>Xem trước danh sách thành viên:</Text>
            <Table
              columns={exportPreviewColumns}
              dataSource={exportPreviewMembers}
              rowKey="id"
              pagination={false}
              size="small"
              style={{ marginTop: 16 }}
            />
          </>
        )}
      </Card>
    </>
  );
};

export default Dashboard;