import React, { useState, useEffect } from 'react';
import { Button, Form, message, Table, Tag, Modal } from 'antd';
import { API_BASE_URL } from '@/config/api';
import StaffRequestForm from './components/StaffRequestForm';
import { Request } from '@/services/typing';

const statusColor: Record<string, string> = {
    Pending: 'blue',
    Accept: 'green',
    Reject: 'red',
};

const StaffRequest: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState<number | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [refresh, setRefresh] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
        message.error('Không tìm thấy thông tin đăng nhập!');
        return;
        }
        fetch(`${API_BASE_URL}/staff/usersdto`)
        .then(res => res.json())
        .then(users => {
            console.log('DEBUG users data:', users);
            const user = users.find((u: any) => u.userName === username);
            if (user) {
            setUserID(user.userID);
            localStorage.setItem('staffID', JSON.stringify(user.userID));
            } else message.error('Không tìm thấy nhân viên phù hợp!');
        })
        .catch(() => message.error('Lỗi khi lấy danh sách nhân viên!'));
    }, []);

    useEffect(() => {
        if (!userID) return;
        fetch(`${API_BASE_URL}/staff/requests`)
        .then(res => res.json())
        .then(data => {
            console.log('DEBUG requests data:', data);
            const filtered = data
            .filter((item: any) => item.userID === userID)
            .sort((a: any, b: any) => b.requestID - a.requestID);
            setRequests(filtered);
        })
        .catch(() => message.error('Lỗi khi tải danh sách yêu cầu!'));
    }, [userID, refresh]);

    const [form] = Form.useForm();

    const onFinish = async (values: { title: string; content: string }) => {
        setLoading(true);
        try {
        if (!userID) {
            message.error('Không tìm thấy thông tin nhân viên!');
            setLoading(false);
            return;
        }
        const response = await fetch(`${API_BASE_URL}/staff/requests`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            userID,
            title: values.title,
            content: values.content,
            status: 'Pending',
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gửi yêu cầu thất bại');
        }
        message.success('Gửi yêu cầu thành công!');
        setRefresh(r => !r);
        setModalOpen(false);
        form.resetFields();
        } catch (error) {
        message.error(`Lỗi: ${error instanceof Error ? error.message : String(error)}`);
        }
        setLoading(false);
    };

    const columns = [
        { title: 'ID', dataIndex: 'requestID', key: 'requestID', width: 60 },
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
        { title: 'Nội dung', dataIndex: 'content', key: 'content' },
        {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
            <Tag color={statusColor[status] || 'default'}>{status}</Tag>
        ),
        },
    ];

    return (
        <div>
        <h2>Báo cáo vấn đề</h2>
        <Button type="primary" onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
            Gửi báo cáo mới
        </Button>
        <Modal
            title="Gửi báo cáo mới"
            visible={modalOpen}
            onCancel={() => setModalOpen(false)}
            footer={null}
            destroyOnClose
        >
            <StaffRequestForm
                loading={loading}
                onFinish={onFinish}
                form={form}
                userID={userID}
            />
        </Modal>

        <Table
            rowKey="requestID"
            columns={columns}
            dataSource={requests}
            pagination={{ pageSize: 5 }}
            bordered
        />
        </div>
    );
};

export default StaffRequest;