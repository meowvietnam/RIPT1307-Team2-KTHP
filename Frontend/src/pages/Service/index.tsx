import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import type { Service } from '@/services/typing';
import ServiceForm from '@/pages/Service/component/ServiceForm';
import { API_BASE_URL } from '@/config/api';

const ServicePage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/services`);
      
      console.log('Fetch Services - HTTP Response Status:', response.status);
      console.log('Fetch Services - HTTP Response OK:', response.ok);

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
          console.error('Fetch Services - Error Response Body:', errorData);
        } catch (jsonError) {
          console.error('Fetch Services - Could not parse error JSON:', jsonError);
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: Service[] = await response.json();
      console.log('Fetch Services - Dữ liệu JSON nhận được (camelCase):', data);

      if (!Array.isArray(data)) {
        console.warn('Fetch Services - Dữ liệu nhận được không phải là một mảng:', data);
        message.warning('Dữ liệu dịch vụ nhận được không đúng định dạng. Vui lòng kiểm tra API.');
        setServices([]);
        return;
      }

      setServices(data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách dịch vụ:', err);
      message.error(`Tải danh sách dịch vụ thất bại: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAdd = () => {
    setEditingService(null);
    setModalVisible(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setModalVisible(true);
  };

  const handleSave = async (service: Service) => {
    console.log('ServicePage handleSave: Dữ liệu service nhận từ ServiceForm:', service);
    try {
      const isEdit = service.serviceID !== undefined && service.serviceID > 0 && services.some(s => s.serviceID === service.serviceID);

      let response: Response;
      let savedService: Service;

      if (isEdit) {
        console.log('ServicePage handleSave: Gửi PUT request với body:', JSON.stringify(service));
        response = await fetch(`${API_BASE_URL}/admin/services/${service.serviceID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(service),
        });
        savedService = await response.json();
      } else {
        const serviceToCreate = { ...service };
        delete (serviceToCreate as Partial<Service>).serviceID; 
        console.log('ServicePage handleSave: Gửi POST request với body:', JSON.stringify(serviceToCreate));
        response = await fetch(`${API_BASE_URL}/admin/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceToCreate),
        });
        savedService = await response.json();
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi lưu dịch vụ');
      }

      console.log('ServicePage handleSave: Dữ liệu savedService nhận được từ API phản hồi:', savedService);

      if (isEdit) {
        setServices(prevServices => prevServices.map(s => s.serviceID === savedService.serviceID ? savedService : s));
        message.success('Cập nhật dịch vụ thành công!');
      } else {
        setServices(prevServices => [...prevServices, savedService]);
        message.success('Thêm dịch vụ mới thành công!');
      }
      setModalVisible(false);
    } catch (err: any) {
      console.error('API save error:', err);
      message.error(`Lưu dịch vụ thất bại: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xoá dịch vụ này?',
      onOk: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi xoá dịch vụ');
          }

          setServices(prevServices => prevServices.filter(s => s.serviceID !== id));
          message.success('Đã xoá dịch vụ thành công!');
        } catch (err: any) {
          console.error('API delete error:', err);
          message.error(`Xoá dịch vụ thất bại: ${err.message}`);
        }
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'serviceID', key: 'serviceID' },
    { title: 'Tên dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (v: number | undefined | null) => (v !== undefined && v !== null) ? `${v.toLocaleString()} đ` : '0 đ'
    },
    { title: 'Loại dịch vụ', dataIndex: 'serviceType', key: 'serviceType' },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Service) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Sửa</Button>
          <Button danger onClick={() => handleDelete(record.serviceID)}>Xoá</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Danh sách dịch vụ</h2>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm dịch vụ
      </Button>
      <Table
        dataSource={services}
        columns={columns}
        rowKey="serviceID"
        loading={loading}
        style={{ marginTop: 16 }}
      />
      
      <ServiceForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={editingService}
        onSave={handleSave}
      />
    </div>
  );
};

export default ServicePage;