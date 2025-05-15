import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Divider } from 'antd';
import { getStatistics } from '@/services/TH6/thongKe';

const ThongKe: React.FC = () => {
  const [statistics, setStatistics] = useState<App.Statistics | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      const data = await getStatistics();
      setStatistics(data);
    };
    fetchStatistics();
  }, []);

  if (!statistics) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      <h1>Thống kê</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng số lịch trình"
              value={statistics.totalItineraries}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={statistics.totalRevenue}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Địa điểm phổ biến"
              value={statistics.popularDestinations.join(', ')}
            />
          </Card>
        </Col>
      </Row>
      <Divider />
      <h2>Phân bổ ngân sách</h2>
      <Row gutter={[16, 16]}>
        {Object.entries(statistics.categoryBreakdown).map(([category, amount]) => (
          <Col key={category} xs={24} sm={12} md={8}>
            <Card>
              <Statistic title={category} value={amount} prefix="$" />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ThongKe;