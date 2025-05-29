import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import type { Service } from '@/services/typing';
import ServiceForm from '@/pages/Service/component/ServiceForm';

const STORAGE_KEY = 'hotel_services';

const ServicePage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setServices(JSON.parse(stored));
  }, [open]);

  const saveToStorage = (data: Service[]) => {
    setServices(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleSave = (service: Service) => {
    let updated: Service[];
    if (editing) {
      updated = services.map((s) => (s.ServiceID === editing.ServiceID ? { ...editing, ...service } : s));
    } else {
      const newID = services.length > 0 ? Math.max(...services.map(s => s.ServiceID)) + 1 : 1;
      updated = [...services, { ...service, ServiceID: newID }];
    }
    saveToStorage(updated);
    setOpen(false);
    message.success('Đã lưu dịch vụ');
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xoá?',
      onOk: () => {
        const updated = services.filter(s => s.ServiceID !== id);
        saveToStorage(updated);
        message.success('Đã xoá dịch vụ');
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'ServiceID' },
    { title: 'Tên dịch vụ', dataIndex: 'ServiceName' },
    { title: 'Giá', dataIndex: 'Price', render: (v: number) => `${v.toLocaleString()} đ` },
    { title: 'Loại dịch vụ', dataIndex: 'ServiceType' },
    {
      title: 'Hành động',
      render: (_: any, record: Service) => (
        <Space>
          <Button onClick={() => { setEditing(record); setOpen(true); }}>Sửa</Button>
          <Button danger onClick={() => handleDelete(record.ServiceID)}>Xoá</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Danh sách dịch vụ</h2>
      <Button type="primary" onClick={() => { setEditing(null); setOpen(true); }}>
        Thêm dịch vụ
      </Button>
      <Table
        dataSource={services}
        columns={columns}
        rowKey="ServiceID"
        style={{ marginTop: 16 }}
      />
      {open && (
        <ServiceForm
          visible={open}
          onClose={() => setOpen(false)}
          data={editing}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ServicePage;
