import React, { useState, useEffect } from 'react';
import { Table, Typography, Tag, Empty } from 'antd';
import { ClubMember, ApplicationStatus } from '../types';

const { Text } = Typography;

interface ClubMemberListProps {
  clubId: string;
}

const ClubMemberList: React.FC<ClubMemberListProps> = ({ clubId }) => {
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(false);

  // load mem
  useEffect(() => {
    setLoading(true);
    const storedMembers = localStorage.getItem('clubManagement-members');
    if (storedMembers) {
      // filter
      const allMembers: ClubMember[] = JSON.parse(storedMembers);
      const approvedMembers = allMembers.filter(
        member => member.clubId === clubId && member.status === ApplicationStatus.APPROVED
      );
      setMembers(approvedMembers);
    }
    setLoading(false);
  }, [clubId]);

  // Table 
  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
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
          case 'other':
            return 'Khác';
          default:
            return 'Không xác định';
        }
      }
    },
    {
      title: 'Sở trường',
      dataIndex: 'strengths',
      key: 'strengths',
    },
  ];

  return (
    <>
      {members.length > 0 ? (
        <Table 
          columns={columns}
          dataSource={members}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty description="Câu lạc bộ chưa có thành viên nào" />
      )}
    </>
  );
};

export default ClubMemberList;