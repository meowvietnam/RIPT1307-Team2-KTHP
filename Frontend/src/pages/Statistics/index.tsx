import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tabs, Table } from 'antd';
import { API_BASE_URL } from '@/config/api';
import { Room, Service, History } from '@/services/typing';
import DonutChart from '@/components/Chart/DonutChart';
import ColumnChart from '@/components/Chart/ColumnChart';

const StatisticsPage: React.FC = () => {
  const role = localStorage.getItem('role');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [histories, setHistories] = useState<History[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [roomsRes, historiesRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/staff/rooms`),
        fetch(`${API_BASE_URL}/staff/histories`),
        fetch(`${API_BASE_URL}/staff/services`)
      ]);
      setRooms(await roomsRes.json() as Room[]);
      setHistories(await historiesRes.json() as History[]);
      setServices(await servicesRes.json() as Service[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Thống kê số phòng
  const totalRooms = rooms.length;
  const roomsInUse = rooms.filter(r => r.status === 'In Use').length;
  const roomsAvailable = rooms.filter(r => r.status === 'Available').length;

  // Thống kê doanh thu
  const totalRevenue = histories.reduce((sum, h) => sum + (h.totalPrice || 0), 0);

  // Thống kê dịch vụ đã bán
  const serviceStats = services.map(service => {
    const totalSold = histories.reduce((sum, h) => {
      const found = (h.roomServices ?? []).filter(rs => rs.serviceID === service.serviceID);
      return sum + found.reduce((s, rs) => s + (rs.quantity || 0), 0);
    }, 0);
    return { ...service, totalSold };
  });

  const roomRevenueStats = rooms.map(room => {
    const revenue = histories
      .filter(h => h.roomID === room.roomID)
      .reduce((sum, h) => sum + (h.totalPrice || 0), 0);
    return { roomName: room.roomName, revenue };
  });

  const roomHistoryStats = rooms.map(room => {
    const count = histories.filter(h => h.roomID === room.roomID).length;
    return { roomName: room.roomName, count };
  });

  const userOrderStats = histories.reduce((acc: Record<number, number>, h) => {
    if (!h.userID) return acc;
    acc[h.userID] = (acc[h.userID] || 0) + 1;
    return acc;
  }, {});

  const userStatsData = Object.entries(userOrderStats).map(([userID, count]) => {
    const user = histories.find(h => h.userID === Number(userID))?.user;
    return {
      userName: user?.fullName || `ID ${userID}`,
      count,
    };
  });

  // Tính doanh thu từng tháng
  const monthlyRevenue: Record<string, number> = {};
  histories.forEach(h => {
    if (!h.startTime) return;
    const date = new Date(h.startTime);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // VD: 2024-06
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (h.totalPrice || 0);
  });
  const months = Object.keys(monthlyRevenue).sort();
  const revenues = months.map(m => monthlyRevenue[m]);

  // Chuẩn bị dữ liệu cho DonutChart
  const serviceStatsData = {
    title: 'Dịch vụ bán chạy',
    xAxis: serviceStats.map(s => s.serviceName),
    yAxis: [serviceStats.map(s => s.totalSold)],
    yLabel: ['Đã bán'],
    height: 350,
    showTotal: true,
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
    formatY: (val: number) => val.toLocaleString(),
  };

  const roomHistoryDonutData = {
    title: 'Số hóa đơn các phòng',
    xAxis: roomHistoryStats.map(r => r.roomName),
    yAxis: [roomHistoryStats.map(r => r.count)],
    yLabel: ['Số lượt sử dụng'],
    height: 350,
    showTotal: true,
    colors: ['#ff7a45', '#36cfc9', '#ff85c0', '#ffc53d', '#597ef7', '#73d13d', '#ff7875'],
    formatY: (val: number) => val.toLocaleString(),
  };

  const roomRevenueDonutData = {
    title: 'Doanh thu các phòng',
    xAxis: roomRevenueStats.map(r => r.roomName),
    yAxis: [roomRevenueStats.map(r => r.revenue)],
    yLabel: ['Doanh thu'],
    height: 350,
    showTotal: true,
    colors: ['#36cfc9', '#ff85c0', '#ffc53d', '#597ef7', '#73d13d', '#ff7875'],
    formatY: (val: number) => val.toLocaleString() + '₫',
  };

  const monthlyRevenueData = {
    title: 'Doanh thu theo tháng',
    xAxis: months,
    yAxis: [revenues],
    yLabel: ['Doanh thu'],
    height: 300,
    formatY: (val: number) => val.toLocaleString() + '₫',
  };

  const userOrderColumnData = {
    title: 'Số đơn hàng phục vụ của nhân viên',
    xAxis: userStatsData.map(u => u.userName),
    yAxis: [userStatsData.map(u => u.count)],
    yLabel: ['Số đơn hàng'],
    height: 300,
    colors: ['#1890ff'],
    formatY: (val: number) => val.toLocaleString(),
  };

  const historyColumns = [
    { title: 'Mã hóa đơn', dataIndex: 'historyID', key: 'historyID' },
    { title: 'Tên khách hàng', dataIndex: 'nameCustomer', key: 'nameCustomer' },
    { title: 'Số điện thoại', dataIndex: 'numberPhoneCustomer', key: 'numberPhoneCustomer' },
    { title: 'Phòng', dataIndex: 'room', key: 'room', render: (room: any) => room?.roomName },
    { title: 'Nhân viên', dataIndex: 'user', key: 'user', render: (user: any) => user?.fullName || '' },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice', render: (v: number) => v?.toLocaleString() + '₫' },
    { title: 'Bắt đầu', dataIndex: 'startTime', key: 'startTime' },
    {
      title: 'Kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (_: any, record: any) =>
        record.isCheckOut && record.endTime
          ? record.endTime
          : <span style={{ color: 'red', fontWeight: 600 }}>Chưa trả phòng</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isCheckOut',
      key: 'isCheckOut',
      render: (v: boolean) =>
        v
          ? <span style={{ color: 'green', fontWeight: 600 }}>Đã trả phòng</span>
          : <span style={{ color: 'red', fontWeight: 600 }}>Chưa trả phòng</span>
    },
  ];

  const sortedHistories = [...histories].sort((a, b) => {
    if (a.isCheckOut === b.isCheckOut) return 0;
    return a.isCheckOut ? 1 : -1;
  });
  return (
    <div>
      <h2>Thống kê tổng quan</h2>
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="Tổng số phòng" value={totalRooms} /></Card></Col>
        <Col span={6}><Card><Statistic title="Phòng đang sử dụng" value={roomsInUse} /></Card></Col>
        <Col span={6}><Card><Statistic title="Phòng trống" value={roomsAvailable} /></Card></Col>
        <Col span={6}><Card><Statistic title="Tổng doanh thu" value={totalRevenue} suffix="₫" /></Card></Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card loading={loading}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{serviceStatsData.title}</div>
            <DonutChart {...{ ...serviceStatsData, height: 120 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{roomRevenueDonutData.title}</div>
            <DonutChart {...{ ...roomRevenueDonutData, height: 120 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{roomHistoryDonutData.title}</div>
            <DonutChart {...{ ...roomHistoryDonutData, height: 120 }} />
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab={monthlyRevenueData.title} key="1">
                <ColumnChart {...monthlyRevenueData} />
              </Tabs.TabPane>
              {role === 'admin' && (
                <Tabs.TabPane tab={userOrderColumnData.title} key="2">
                  <ColumnChart {...userOrderColumnData} />
                </Tabs.TabPane>
              )}
            </Tabs>
          </Card>
        </Col>
      </Row>
      <Card 
        style={{ marginTop: 16 }}
        title={<span style={{ fontWeight: 600 }}>Danh sách hóa đơn</span>}>
        <Table
          dataSource={sortedHistories}
          columns={
            role === 'admin'
              ? historyColumns
              : historyColumns.filter(col => col.dataIndex !== 'user')
          }
          rowKey="historyID"
          pagination={{ pageSize: 8 }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default StatisticsPage; 