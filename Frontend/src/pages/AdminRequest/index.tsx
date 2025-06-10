import React, { useEffect, useState } from 'react';
import { Table, message, Select, Popconfirm, Button } from 'antd';
import { API_BASE_URL } from '@/config/api';
import './components/style.less'
import { Request } from '@/services/typing';
import { DeleteOutlined } from '@ant-design/icons';

const statusOptions = [
    { value: 'Pending', label: 'Pending', color: 'blue' },
    { value: 'Accept', label: 'Accept', color: 'green' },
    { value: 'Reject', label: 'Reject', color: 'red' },
];

const AdminRequestList: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
        console.log('request: ',requests)
    }, []);

    const fetchRequests = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/staff/requests`)
        .then(res => res.json())
        .then(data => setRequests(data))
        .catch(() => message.error('Lỗi khi tải danh sách request!'))
        .finally(() => setLoading(false));
    };

    const handleStatusChange = async (requestID: number, newStatus: Request['status']) => {
        try {
        const res = await fetch(`${API_BASE_URL}/admin/requests/${requestID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');
        message.success('Cập nhật trạng thái thành công');
        setRequests(prev =>
            prev.map(r =>
            r.requestID === requestID ? { ...r, status: newStatus } : r
            )
        );
        } catch {
        message.error('Cập nhật trạng thái thất bại');
        }
    };

    const handleDelete = async (requestID: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/requests/${requestID}`, {
            method: 'DELETE',
            });
            if (!res.ok) throw new Error('Xóa thất bại');
            message.success('Đã xóa yêu cầu');
            setRequests(prev => prev.filter(r => r.requestID !== requestID));
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'requestID', key: 'requestID', width: 60 },
        { title: 'UserID', dataIndex: 'userID', key: 'userID', width: 80 },
        { 
            title: 'Email', 
            dataIndex: 'user', 
            key: 'user.email', 
            width: 180,
            render: (user: any) => user?.email
        },
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
        { title: 'Nội dung', dataIndex: 'content', key: 'content' },
        {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status: string, record: Request) => {
            return (
                <Select
                    value={status}
                    className={`status-select status-${status.toLowerCase()}`}
                    style={{ width: 120, transition: 'background-color 0.3s' }}
                    onChange={value => handleStatusChange(record.requestID, value as Request['status'])}
                    dropdownStyle={{ minWidth: 120 }}
                    >
                    {statusOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                        </Select.Option>
                    ))}
                </Select>
            );
            },
        },
        {
            title: 'Xóa',
            key: 'action',
            width: 80,
            render: (_: any, record: Request) => (
            <Popconfirm
                title="Bạn có chắc muốn xóa yêu cầu này?"
                onConfirm={() => handleDelete(record.requestID)}
                okText="Xóa"
                cancelText="Hủy"
            >
                <Button danger type="text" icon={<DeleteOutlined />} />
            </Popconfirm>
            ),
        },
    ];

    return (
        <div>
        <h2>Danh sách yêu cầu của nhân viên</h2>
        <Table
            rowKey="requestID"
            columns={columns}
            dataSource={requests}
            loading={loading}
            pagination={{ pageSize: 10 }}
        />
        </div>
    );
};

export default AdminRequestList;