import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, InputNumber, Rate } from 'antd';
import { getDestinations } from '@/services/TH6/diemDen';

const { Option } = Select;

const TrangChu: React.FC = () => {
  const [destinations, setDestinations] = useState<App.Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<App.Destination[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [maxCost, setMaxCost] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    // Lấy danh sách điểm đến từ localStorage khi component được mount
    const fetchDestinations = async () => {
      const data = await getDestinations();
      setDestinations(data);
      setFilteredDestinations(data); // Hiển thị tất cả điểm đến ban đầu
    };
    fetchDestinations();
  }, []);

  const handleFilterType = (value: string) => {
    setFilterType(value);
    applyFilters(value, maxCost, minRating);
  };

  const handleMaxCost = (value: number | null) => {
    setMaxCost(value);
    applyFilters(filterType, value, minRating);
  };

  const handleMinRating = (value: number | null) => {
    setMinRating(value);
    applyFilters(filterType, maxCost, value);
  };

  const applyFilters = (type: string | null, cost: number | null, rating: number | null) => {
    let filtered = destinations;

    if (type) {
      filtered = filtered.filter((destination) => destination.type === type);
    }

    if (cost !== null) {
      filtered = filtered.filter((destination) => destination.cost <= cost);
    }

    if (rating !== null) {
      filtered = filtered.filter((destination) => destination.rating >= rating);
    }

    setFilteredDestinations(filtered);
  };

  return (
    <div>
      <h1>Khám phá điểm đến</h1>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <Select
          placeholder="Lọc theo loại hình"
          style={{ width: 200 }}
          onChange={handleFilterType}
          allowClear
        >
          <Option value="beach">Biển</Option>
          <Option value="mountain">Núi</Option>
          <Option value="city">Thành phố</Option>
        </Select>
        <InputNumber
          placeholder="Chi phí tối đa"
          style={{ width: 200 }}
          min={0}
          onChange={handleMaxCost}
        />
        <Select
          placeholder="Đánh giá tối thiểu"
          style={{ width: 200 }}
          onChange={handleMinRating}
          allowClear
        >
          <Option value={1}>1 sao</Option>
          <Option value={2}>2 sao</Option>
          <Option value={3}>3 sao</Option>
          <Option value={4}>4 sao</Option>
          <Option value={5}>5 sao</Option>
        </Select>
      </div>
      <Row gutter={[16, 16]}>
        {filteredDestinations.map((destination) => (
          <Col key={destination.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={<img alt={destination.name} src={destination.image} />}
            >
              <Card.Meta
                title={destination.name}
                description={
                  <>
                    <p>Loại hình: {destination.type}</p>
                    <p>Chi phí: ${destination.cost}</p>
                    <Rate disabled defaultValue={destination.rating} />
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TrangChu;