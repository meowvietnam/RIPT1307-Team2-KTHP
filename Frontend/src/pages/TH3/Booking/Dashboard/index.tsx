import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Space,
  Table,
  Typography,
  Badge,
  Divider,
  Button
} from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { Appointment, AppointmentStatus, Staff, Service, DashboardStats } from '../types';
import ColumnChart from '@/components/Chart/ColumnChart';
import DonutChart from '@/components/Chart/DonutChart';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// format tien
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Dashboard: React.FC = () => {
  // filter date
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().startOf('month'),
    moment()
  ]);
  
  // filter staff
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  
  // data state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  
  // refresh function
  const refreshData = () => {
    const storedAppointments = localStorage.getItem('bookingApp-appointments');
    const storedStaff = localStorage.getItem('bookingApp-staff');
    const storedServices = localStorage.getItem('bookingApp-services');
    
    console.log('Refreshing data from localStorage:', {
      appointments: storedAppointments ? JSON.parse(storedAppointments) : [],
      staff: storedStaff ? JSON.parse(storedStaff) : [],
      services: storedServices ? JSON.parse(storedServices) : []
    });
    
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
    
    if (storedStaff) {
      setStaffList(JSON.parse(storedStaff));
    }
    
    if (storedServices) {
      setServices(JSON.parse(storedServices));
    }
  };

  // mount data, check thay doi
  useEffect(() => {
    refreshData();

    // storage thay doi
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookingApp-appointments' || 
          e.key === 'bookingApp-staff' || 
          e.key === 'bookingApp-services') {
        refreshData();
      }
    };

    // component thay doi
    const handleAppointmentUpdate = () => refreshData();
    window.addEventListener('appointmentUpdated', handleAppointmentUpdate);
    
    window.addEventListener('storage', handleStorageChange);
    
    // clean up
    return () => {
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // filter ngay/staff
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter(appointment => {
      const appointmentDate = moment(appointment.date);
      const isInDateRange = appointmentDate.isBetween(dateRange[0], dateRange[1], undefined, '[]');
      const isStaffMatch = !selectedStaff || appointment.staffId === selectedStaff;
      
      return isInDateRange && isStaffMatch;
    });
  }, [appointments, dateRange, selectedStaff]);
  
  // check
  useEffect(() => {
    console.log('Calculating stats from filteredAppointments:', filteredAppointments);
    
    if (filteredAppointments.length === 0) {
      setStats({
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        cancelledAppointments: 0,
        totalRevenue: 0,
        averageRating: 0
      });
      return;
    }
    
    const pendingCount = filteredAppointments.filter(
      appointment => appointment.status === AppointmentStatus.PENDING
    ).length;
    
    const completedCount = filteredAppointments.filter(
      appointment => appointment.status === AppointmentStatus.COMPLETED
    ).length;
    
    const cancelledCount = filteredAppointments.filter(
      appointment => appointment.status === AppointmentStatus.CANCELLED
    ).length;
    
    const completedAppointments = filteredAppointments.filter(
      appointment => appointment.status === AppointmentStatus.COMPLETED
    );
    
    // doanh thu
    let revenue = 0;
    completedAppointments.forEach(appointment => {
      const service = services.find(s => s.id === appointment.serviceId);
      if (service) {
        revenue += service.price;
      }
    });
    
    // avg rating
    const ratings = completedAppointments
      .filter(appointment => appointment.rating)
      .map(appointment => appointment.rating || 0);
    
    let avgRating = 0;
    if (ratings.length > 0) {
      avgRating = parseFloat((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1));
    }
    
    const newStats = {
      totalAppointments: filteredAppointments.length,
      completedAppointments: completedCount,
      pendingAppointments: pendingCount,
      cancelledAppointments: cancelledCount,
      totalRevenue: revenue,
      averageRating: avgRating
    };
    
    console.log('New calculated stats:', newStats);
    setStats(newStats);
  }, [filteredAppointments, services]);
  
  // chart
  const appointmentsByStatus = React.useMemo(() => {
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    filteredAppointments.forEach(appointment => {
      switch (appointment.status) {
        case AppointmentStatus.PENDING:
          statusCounts.pending++;
          break;
        case AppointmentStatus.CONFIRMED:
          statusCounts.confirmed++;
          break;
        case AppointmentStatus.COMPLETED:
          statusCounts.completed++;
          break;
        case AppointmentStatus.CANCELLED:
          statusCounts.cancelled++;
          break;
        default:
          break;
      }
    });
    
    return {
      xAxis: ['Chờ duyệt', 'Xác nhận', 'Hoàn thành', 'Hủy'],
      yAxis: [[statusCounts.pending, statusCounts.confirmed, statusCounts.completed, statusCounts.cancelled]],
      yLabel: ['Số lượng lịch hẹn']
    };
  }, [filteredAppointments]);
  
  const revenueByService = React.useMemo(() => {
    const serviceRevenue: Record<string, number> = {};
    const completedAppointments = filteredAppointments.filter(
      appointment => appointment.status === AppointmentStatus.COMPLETED
    );
    
    services.forEach(service => {
      serviceRevenue[service.name] = 0;
    });
    
    // sum voi service (loc)
    completedAppointments.forEach(appointment => {
      const service = services.find(s => s.id === appointment.serviceId);
      if (service) {
        serviceRevenue[service.name] = (serviceRevenue[service.name] || 0) + service.price;
      }
    });
    
    // service 0 dong = cut
    const labels: string[] = [];
    const values: number[] = [];
    
    Object.entries(serviceRevenue)
      .filter(([_, value]) => value > 0)
      .forEach(([key, value]) => {
        labels.push(key);
        values.push(value);
      });
    
    return {
      xAxis: labels,
      yAxis: [values],
      yLabel: ['Doanh thu']
    };
  }, [filteredAppointments, services]);
  
  const appointmentsByDay = React.useMemo(() => {
    const dates: Record<string, number> = {};
    const currentDate = dateRange[0].clone();
    while (currentDate.isSameOrBefore(dateRange[1])) {
      dates[currentDate.format('YYYY-MM-DD')] = 0;
      currentDate.add(1, 'day');
    }
    
    filteredAppointments.forEach(appointment => {
      const date = moment(appointment.date).format('YYYY-MM-DD');
      if (dates[date] !== undefined) {
        dates[date]++;
      }
    });
    
    const labels = Object.keys(dates).map(date => moment(date).format('DD/MM'));
    const values = Object.values(dates);
    
    return {
      xAxis: labels,
      yAxis: [values],
      yLabel: ['Số lịch hẹn'],
      type: 'line'
    };
  }, [filteredAppointments, dateRange]);

  interface StaffPerformance {
    id: string;
    name: string;
    appointments: number;
    completed: number;
    revenue: number;
    avgRating: number;
    totalRatings: number;
    ratingSum: number;
  }
  
  const staffPerformance = React.useMemo(() => {
    const staffMap: Record<string, StaffPerformance> = {};
    
    staffList.forEach(staff => {
      staffMap[staff.id] = {
        id: staff.id,
        name: staff.name,
        appointments: 0,
        completed: 0,
        revenue: 0,
        avgRating: 0,
        totalRatings: 0,
        ratingSum: 0
      };
    });
    
    filteredAppointments.forEach(appointment => {
      if (staffMap[appointment.staffId]) {
        staffMap[appointment.staffId].appointments++;
        
        if (appointment.status === AppointmentStatus.COMPLETED) {
          staffMap[appointment.staffId].completed++;
          
          const service = services.find(s => s.id === appointment.serviceId);
          if (service) {
            staffMap[appointment.staffId].revenue += service.price;
          }
          
          if (appointment.rating) {
            staffMap[appointment.staffId].totalRatings++;
            staffMap[appointment.staffId].ratingSum += appointment.rating || 0;
          }
        }
      }
    });
    
    return Object.values(staffMap)
      .map(staff => ({
        ...staff,
        avgRating: staff.totalRatings > 0 
          ? parseFloat((staff.ratingSum / staff.totalRatings).toFixed(1)) 
          : 0
      }))
      .filter(staff => staff.appointments > 0) // Only show staff with appointments
      .sort((a, b) => b.completed - a.completed); // Sort by completed appointments
  }, [filteredAppointments, staffList, services]);
  
  const staffColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tổng lịch hẹn',
      dataIndex: 'appointments',
      key: 'appointments',
    },
    {
      title: 'Đã hoàn thành',
      dataIndex: 'completed',
      key: 'completed',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => formatCurrency(revenue),
    },
    {
      title: 'Đánh giá TB',
      dataIndex: 'avgRating',
      key: 'avgRating',
      render: (rating: number) => rating > 0 ? `${rating}/5` : 'N/A',
    },
  ];
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Dashboard</Title>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={refreshData}
          type="primary"
        >
          Refresh Data
        </Button>
      </div>
      
      {/* Filters */}
      <Card style={{ marginBottom: 20 }}>
        <Space size="large">
          <div>
            <Text strong>Khoảng thời gian:</Text>
            <br />
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange([dates[0] as moment.Moment, dates[1] as moment.Moment])}
              format="DD/MM/YYYY"
              allowClear={false}
              style={{ marginTop: 8, marginBottom: 8 }}
            />
          </div>
          
          <div>
            <Text strong>Nhân viên:</Text>
            <br />
            <Select
              placeholder="Tất cả nhân viên"
              style={{ width: 200, marginTop: 8 }}
              allowClear
              onChange={value => setSelectedStaff(value)}
              value={selectedStaff}
            >
              {staffList.map(staff => (
                <Option key={staff.id} value={staff.id}>{staff.name}</Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>
      
      {/* Summary statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic 
              title="Tổng lịch hẹn" 
              value={stats.totalAppointments} 
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic 
              title="Hoàn thành" 
              value={stats.completedAppointments} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic 
              title="Doanh thu" 
              value={stats.totalRevenue} 
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic 
              title="Đánh giá TB" 
              value={stats.averageRating || 'N/A'} 
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={stats.averageRating ? "/5" : ""}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Charts Row */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Thống kê lịch hẹn theo trạng thái" style={{ marginBottom: 16 }}>
            <ColumnChart 
              xAxis={appointmentsByStatus.xAxis} 
              yAxis={appointmentsByStatus.yAxis} 
              yLabel={appointmentsByStatus.yLabel} 
              height={300} 
              colors={['#1890ff']}
              formatY={(val) => val.toString()}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Doanh thu theo dịch vụ" style={{ marginBottom: 16 }}>
            <DonutChart 
              xAxis={revenueByService.xAxis} 
              yAxis={revenueByService.yAxis} 
              yLabel={revenueByService.yLabel} 
              height={300} 
              formatY={(val) => formatCurrency(val)}
              showTotal={true}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Line Chart for appointments by day */}
      <Card title="Số lượng lịch hẹn theo ngày" style={{ marginBottom: 16 }}>
        <ColumnChart 
          xAxis={appointmentsByDay.xAxis} 
          yAxis={appointmentsByDay.yAxis} 
          yLabel={appointmentsByDay.yLabel} 
          height={300} 
          type={appointmentsByDay.type as 'area' | 'bar' | undefined}
          colors={['#52c41a']}
          formatY={(val) => val.toString()}
        />
      </Card>
      
      {/* Staff Performance Table */}
      <Card title="Hiệu suất nhân viên" style={{ marginBottom: 16 }}>
        <Table 
          dataSource={staffPerformance} 
          columns={staffColumns} 
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;