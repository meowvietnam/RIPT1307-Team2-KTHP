import { useEffect, useState } from 'react';
import { Button, Table, Space, Modal, message } from 'antd';
import type { RoomService } from '@/models/Type';
import RoomServiceForm from '@/components/RoomServiceForm';

const LOCAL_KEY = 'roomservice';

const RoomServicePage = () => {
  const [data, setData] = useState<RoomService[]>([]);
  const [editing, setEditing] = useState<RoomService | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  const saveToLocal = (newData: RoomService[]) => {
    setData(newData);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newData));
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xoá dịch vụ?',
      onOk: () => {
        const filtered = data.filter(item => item.RoomServiceID !== id);
        saveToLocal(filtered);
        message.success('Đã xoá');
      },
    });
  };

  const handleSave = (item: RoomService) => {
    let newData = [];
    if (editing) {
      newData = data.map(d => (d.RoomServiceID === item.RoomServiceID ? item : d));
    } else {
      const newID = data.length > 0 ? Math.max(...data.map(d => d.RoomServiceID)) + 1 : 1;
      newData = [...data, { ...item, RoomServiceID: newID }];
    }
    saveToLocal(newData);
    setOpen(false);
  };

  const columns = [
    { title: 'Phòng', dataIndex: ['Room', 'roomname'] },
    { title: 'Dịch vụ', dataIndex: ['Service', 'ServiceName'] },
    { title: 'Số lượng', dataIndex: 'Quanity' },
    { title: 'Bắt đầu', dataIndex: 'StartTime' },
    { title: 'Kết thúc', dataIndex: 'EndTime' },
    {
      title: 'Tổng tiền',
      render: (_: any, record: RoomService) =>
        (record.Quanity * record.Service.Price).toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }),
    },
    {
      title: 'Hành động',
      render: (_: any, record: RoomService) => (
        <Space>
          <Button onClick={() => { setEditing(record); setOpen(true); }}>Sửa</Button>
          <Button danger onClick={() => handleDelete(record.RoomServiceID)}>Xoá</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
        <h2>Quản lý dịch vụ</h2>
      <Button type="primary" onClick={() => { setEditing(null); setOpen(true); }}>
        Thêm dịch vụ
      </Button>
      <Table columns={columns} dataSource={data} rowKey="ID" style={{ marginTop: 16 }} />
      {open && (
        <RoomServiceForm
          visible={open}
          onClose={() => setOpen(false)}
          data={editing ?? undefined}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default RoomServicePage;
