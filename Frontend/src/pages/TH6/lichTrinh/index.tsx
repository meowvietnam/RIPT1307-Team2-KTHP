import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, List, Popconfirm, message } from 'antd';
import AddItineraryForm from './form';
import { getItineraries, saveItineraries } from '@/services/TH6/lichTrinh';
import { getDestinations } from '@/services/TH6/diemDen';

const LichTrinh: React.FC = () => {
  const [itineraries, setItineraries] = useState<App.Itinerary[]>([]);
  const [destinations, setDestinations] = useState<App.Destination[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Lấy danh sách lịch trình từ localStorage
    const fetchItineraries = async () => {
      const data = await getItineraries();
      setItineraries(data);
    };

    // Lấy danh sách điểm đến từ localStorage
    const fetchDestinations = async () => {
      const data = await getDestinations();
      setDestinations(data);
    };

    fetchItineraries();
    fetchDestinations();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddItinerary = async (newItinerary: App.Itinerary) => {
    const updatedItineraries = [...itineraries, newItinerary];
    setItineraries(updatedItineraries);
    await saveItineraries(updatedItineraries); // Lưu vào localStorage
    message.success('Thêm lịch trình thành công!');
  };

  const handleDeleteItinerary = async (id: string) => {
    const updatedItineraries = itineraries.filter((itinerary) => itinerary.id !== id);
    setItineraries(updatedItineraries);
    await saveItineraries(updatedItineraries); // Lưu vào localStorage
    message.success('Xóa lịch trình thành công!');
  };

  return (
    <div>
      <h1>Quản lý lịch trình</h1>
      <Button type="primary" onClick={showModal} style={{ marginBottom: '20px' }}>
        Thêm lịch trình
      </Button>
      <Row gutter={[16, 16]}>
        {itineraries.map((itinerary) => (
          <Col key={itinerary.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              actions={[
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa lịch trình này?"
                  onConfirm={() => handleDeleteItinerary(itinerary.id)}
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
                title={itinerary.name}
                description={`Ngày: ${itinerary.date} | Tổng chi phí: $${itinerary.totalCost}`}
              />
              <List
                size="small"
                header={<b>Điểm đến</b>}
                dataSource={itinerary.destinations}
                renderItem={(destination) => (
                  <List.Item>
                    {destination.name} - {destination.type} - ${destination.cost}
                  </List.Item>
                )}
              />
              <p>Thời gian di chuyển: {itinerary.travelTime} giờ</p>
            </Card>
          </Col>
        ))}
      </Row>
      <AddItineraryForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleAddItinerary}
        destinations={destinations}
      />
    </div>
  );
};

export default LichTrinh;