import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Popconfirm, message } from 'antd';
import AdminDestinationForm from './form';
import { getDestinations } from '@/services/TH6/diemDen';

const Admin: React.FC = () => {
  const [destinations, setDestinations] = useState<App.Destination[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDestination, setEditingDestination] = useState<App.Destination | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      const data = await getDestinations();
      setDestinations(data);
    };
    fetchDestinations();
  }, []);

  const showModal = (destination?: App.Destination) => {
    setEditingDestination(destination || null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingDestination(null);
  };

  const handleSaveDestination = (updatedDestinations: App.Destination[]) => {
    setDestinations(updatedDestinations);
    message.success('Cập nhật danh sách điểm đến thành công!');
  };

  const handleDeleteDestination = (id: string) => {
    const updatedDestinations = destinations.filter((destination) => destination.id !== id);
    localStorage.setItem('destinations', JSON.stringify(updatedDestinations));
    setDestinations(updatedDestinations);
    message.success('Xóa điểm đến thành công!');
  };

  return (
    <div>
      <h1>Quản lý điểm đến</h1>
      <Button type="primary" onClick={() => showModal()} style={{ marginBottom: '20px' }}>
        Thêm điểm đến
      </Button>
      <Row gutter={[16, 16]}>
        {destinations.map((destination) => (
          <Col key={destination.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={<img alt={destination.name} src={destination.image} />}
              actions={[
                <Button type="link" onClick={() => showModal(destination)}>
                  Sửa
                </Button>,
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa điểm đến này?"
                  onConfirm={() => handleDeleteDestination(destination.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="link" danger>
                    Xóa
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={destination.name}
                description={`Rating: ${destination.rating} ⭐ | Chi phí: $${destination.cost}`}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <AdminDestinationForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleSaveDestination}
        editingDestination={editingDestination}
      />
    </div>
  );
};

export default Admin;