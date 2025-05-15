/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  Row,
  Col,
  message,
  Divider
} from 'antd';
import { Appointment, AppointmentStatus, Staff, Service } from '../types';
import moment from 'moment';

interface AppointmentFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (appointment: Appointment) => void;
  appointment: Appointment | null;
  staffList: Staff[];
  serviceList: Service[];
}

const { Option } = Select;
const { TextArea } = Input;

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  visible, 
  onCancel, 
  onSave, 
  appointment, 
  staffList, 
  serviceList 
}) => {
  const [form] = Form.useForm();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);

  // reset form khi lich thay doi
  useEffect(() => {
    if (visible) {
      if (appointment) {
        form.setFieldsValue({
          customerName: appointment.customerName,
          customerPhone: appointment.customerPhone,
          customerEmail: appointment.customerEmail,
          serviceId: appointment.serviceId,
          staffId: appointment.staffId,
          date: moment(appointment.date),
          time: appointment.time,
          notes: appointment.notes,
          status: appointment.status
        });
        setSelectedServiceId(appointment.serviceId);
        setSelectedDate(moment(appointment.date));
        updateAvailableStaff(appointment.serviceId);
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: AppointmentStatus.PENDING,
          date: moment().add(1, 'days')
        });
        setSelectedDate(moment().add(1, 'days'));
        setSelectedServiceId(null);
        setAvailableStaff(staffList.filter(staff => staff.isActive));
      }
    }
  }, [visible, appointment, staffList]);

  const updateAvailableStaff = (serviceId: string | null) => {
    if (!serviceId) {
      setAvailableStaff(staffList.filter(staff => staff.isActive));
      return;
    }
    
    // filter staff voi dich vu lien quan
    const filtered = staffList.filter(
      staff => staff.isActive && staff.services.includes(serviceId)
    );
    setAvailableStaff(filtered);
    
    // thg staff k lam dc -> clear
    const currentStaffId = form.getFieldValue('staffId');
    if (currentStaffId && !filtered.some(staff => staff.id === currentStaffId)) {
      form.setFieldsValue({ staffId: undefined });
    }
  };

  // chon time dua vao lich staff
  const generateTimeSlots = (date: moment.Moment, staffId: string, serviceId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    const service = serviceList.find(s => s.id === serviceId);
    
    if (!staff || !service) {
      setAvailableTimeSlots([]);
      return;
    }

    // (0=Sunday, 1=Monday)
    const dayNumber = date.day();
    const dayMap: { [key: number]: keyof Staff['workSchedule'] } = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    const scheduleKey = dayMap[dayNumber];
    const daySchedule = staff.workSchedule[scheduleKey];
    
    if (!daySchedule) {
      message.warning('Nhân viên không làm việc vào ngày này');
      setAvailableTimeSlots([]);
      return;
    }

    // tao slot dua vao start, end
    const startTime = moment(daySchedule.startTime, 'HH:mm');
    const endTime = moment(daySchedule.endTime, 'HH:mm');
    const serviceDuration = service.duration;
    
    const slots = [];
    const currentTime = startTime.clone();
    
    // them slot neu co tg
    while (currentTime.clone().add(serviceDuration, 'minutes').isSameOrBefore(endTime)) {
      slots.push(currentTime.format('HH:mm'));
      currentTime.add(30, 'minutes'); // 30p moi time dich vu
    }
    
    // debug
    console.log('time slots:', slots);
    setAvailableTimeSlots(slots);
  };

  // check book chua?
  const isTimeSlotBooked = (date: string, time: string, staffId: string, appointmentId?: string) => {
    // skip check thi book r
    return false;
  };

  // chon service
  const handleServiceChange = (value: string) => {
    setSelectedServiceId(value);
    updateAvailableStaff(value);
    
    // Reset staff va time khi chon
    form.setFieldsValue({ 
      staffId: undefined,
      time: undefined 
    });
    setAvailableTimeSlots([]);
  };

  // thay date
  const handleDateChange = (date: moment.Moment | null) => {
    setSelectedDate(date);
    
    // Reset
    form.setFieldsValue({ time: undefined });
    
    const staffId = form.getFieldValue('staffId');
    const serviceId = form.getFieldValue('serviceId');
    
    if (date && staffId && serviceId) {
      generateTimeSlots(date, staffId, serviceId);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  // thay staff
  const handleStaffChange = (value: string) => {
    const date = form.getFieldValue('date');
    const serviceId = form.getFieldValue('serviceId');
    
    if (date && serviceId) {
      generateTimeSlots(date, value, serviceId);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  // submit form
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const appointmentData: Appointment = {
        id: appointment?.id || '',
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail,
        serviceId: values.serviceId,
        staffId: values.staffId,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time,
        status: values.status || AppointmentStatus.PENDING,
        notes: values.notes,
        createdAt: appointment?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSave(appointmentData);
    });
  };

  // service dai bao h?
  const getServiceDuration = (serviceId: string) => {
    const service = serviceList.find(s => s.id === serviceId);
    return service ? service.duration : 0;
  };

  return (
    <Modal
      title={appointment ? 'Chỉnh sửa lịch hẹn' : 'Tạo lịch hẹn mới'}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {appointment ? 'Cập nhật' : 'Đặt lịch'}
        </Button>
      ]}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Divider orientation="left">Thông tin khách hàng</Divider>
        
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="customerName"
              label="Họ tên khách hàng"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên khách hàng' }]}
            >
              <Input placeholder="Nhập họ tên khách hàng" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerPhone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customerEmail"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Chi tiết dịch vụ</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="serviceId"
              label="Dịch vụ"
              rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
            >
              <Select 
                placeholder="Chọn dịch vụ" 
                onChange={handleServiceChange}
                disabled={!!appointment}
              >
                {serviceList
                  .filter(service => service.isActive)
                  .map(service => (
                    <Option key={service.id} value={service.id}>
                      {service.name} ({service.duration} phút) - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="staffId"
              label="Nhân viên phục vụ"
              rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
            >
              <Select 
                placeholder="Chọn nhân viên" 
                onChange={handleStaffChange}
                disabled={!selectedServiceId || !!appointment}
              >
                {availableStaff.map(staff => (
                  <Option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.position}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Thời gian hẹn</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Ngày hẹn"
              rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                onChange={handleDateChange}
                disabledDate={(current) => {
                  // Can't select days before today
                  return current && current < moment().startOf('day');
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="time"
              label="Giờ hẹn"
              rules={[{ required: true, message: 'Vui lòng chọn giờ hẹn' }]}
            >
              <Select placeholder="Chọn giờ hẹn" disabled={availableTimeSlots.length === 0}>
                {availableTimeSlots.map(timeSlot => (
                  <Option key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <TextArea rows={3} placeholder="Nhập ghi chú cho lịch hẹn" />
        </Form.Item>

        {appointment && (
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={AppointmentStatus.PENDING}>Chờ duyệt</Option>
              <Option value={AppointmentStatus.CONFIRMED}>Đã xác nhận</Option>
              <Option value={AppointmentStatus.COMPLETED}>Đã hoàn thành</Option>
              <Option value={AppointmentStatus.CANCELLED}>Đã hủy</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default AppointmentForm;