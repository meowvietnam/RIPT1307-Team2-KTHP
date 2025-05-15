import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  InputNumber,
  Upload,
  Select,
  Row,
  Col,
  TimePicker,
  Checkbox,
  Space
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Staff, WorkSchedule, Service } from '../types';
import moment from 'moment';

interface StaffFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (staff: Staff) => void;
  staff: Staff | null;
}

interface DayTimeRange {
  enabled: boolean;
  startTime: moment.Moment | null;
  endTime: moment.Moment | null;
}

const { Option } = Select;

const StaffForm: React.FC<StaffFormProps> = ({ visible, onCancel, onSave, staff }) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<Service[]>([]);
  
  // days configuration
  const [monday, setMonday] = useState<DayTimeRange>({ enabled: false, startTime: null, endTime: null });
  const [tuesday, setTuesday] = useState<DayTimeRange>({ enabled: false, startTime: null, endTime: null });
  const [wednesday, setWednesday] = useState<DayTimeRange>({ enabled: false, startTime: null, endTime: null });
  const [thursday, setThursday] = useState<DayTimeRange>({ enabled: false, startTime: null, endTime: null });
  const [friday, setFriday] = useState<DayTimeRange>({ enabled: false, startTime: null, endTime: null });
  const [saturday, setSaturday] = useState<DayTimeRange>({ enabled: false, startTime: null, endTime: null });
  const [sunday, setSunday] = useState<DayTimeRange>({ enabled: false, startTime: null, endTime: null });

  // reset
  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      loadServices();
      if (staff) {
        form.setFieldsValue({
          name: staff.name,
          position: staff.position,
          phone: staff.phone,
          email: staff.email,
          maxAppointmentsPerDay: staff.maxAppointmentsPerDay,
          services: staff.services
        });
        
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        setScheduleFromStaff(staff.workSchedule);
      } else {
        form.resetFields();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        resetSchedule();
      }
    }
  }, [visible, staff]);

  const loadServices = () => {
    const storedServices = localStorage.getItem('bookingApp-services');
    if (storedServices) {
      setServices(JSON.parse(storedServices));
    }
  };

  const setScheduleFromStaff = (schedule: WorkSchedule) => {
    if (schedule.monday) {
      setMonday({
        enabled: true,
        startTime: moment(schedule.monday.startTime, 'HH:mm'),
        endTime: moment(schedule.monday.endTime, 'HH:mm')
      });
    } else {
      setMonday({ enabled: false, startTime: null, endTime: null });
    }

    if (schedule.tuesday) {
      setTuesday({
        enabled: true,
        startTime: moment(schedule.tuesday.startTime, 'HH:mm'),
        endTime: moment(schedule.tuesday.endTime, 'HH:mm')
      });
    } else {
      setTuesday({ enabled: false, startTime: null, endTime: null });
    }

    if (schedule.wednesday) {
      setWednesday({
        enabled: true,
        startTime: moment(schedule.wednesday.startTime, 'HH:mm'),
        endTime: moment(schedule.wednesday.endTime, 'HH:mm')
      });
    } else {
      setWednesday({ enabled: false, startTime: null, endTime: null });
    }

    if (schedule.thursday) {
      setThursday({
        enabled: true,
        startTime: moment(schedule.thursday.startTime, 'HH:mm'),
        endTime: moment(schedule.thursday.endTime, 'HH:mm')
      });
    } else {
      setThursday({ enabled: false, startTime: null, endTime: null });
    }

    if (schedule.friday) {
      setFriday({
        enabled: true,
        startTime: moment(schedule.friday.startTime, 'HH:mm'),
        endTime: moment(schedule.friday.endTime, 'HH:mm')
      });
    } else {
      setFriday({ enabled: false, startTime: null, endTime: null });
    }

    if (schedule.saturday) {
      setSaturday({
        enabled: true,
        startTime: moment(schedule.saturday.startTime, 'HH:mm'),
        endTime: moment(schedule.saturday.endTime, 'HH:mm')
      });
    } else {
      setSaturday({ enabled: false, startTime: null, endTime: null });
    }

    if (schedule.sunday) {
      setSunday({
        enabled: true,
        startTime: moment(schedule.sunday.startTime, 'HH:mm'),
        endTime: moment(schedule.sunday.endTime, 'HH:mm')
      });
    } else {
      setSunday({ enabled: false, startTime: null, endTime: null });
    }
  };

  // reset lich
  const resetSchedule = () => {
    setMonday({ enabled: false, startTime: null, endTime: null });
    setTuesday({ enabled: false, startTime: null, endTime: null });
    setWednesday({ enabled: false, startTime: null, endTime: null });
    setThursday({ enabled: false, startTime: null, endTime: null });
    setFriday({ enabled: false, startTime: null, endTime: null });
    setSaturday({ enabled: false, startTime: null, endTime: null });
    setSunday({ enabled: false, startTime: null, endTime: null });
  };

  // submit form
  const handleSubmit = () => {
    form.validateFields().then(values => {
      // lam viec tu form
      const workSchedule: WorkSchedule = {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null
      };

      if (monday.enabled && monday.startTime && monday.endTime) {
        workSchedule.monday = {
          startTime: monday.startTime.format('HH:mm'),
          endTime: monday.endTime.format('HH:mm')
        };
      }
      
      if (tuesday.enabled && tuesday.startTime && tuesday.endTime) {
        workSchedule.tuesday = {
          startTime: tuesday.startTime.format('HH:mm'),
          endTime: tuesday.endTime.format('HH:mm')
        };
      }
      
      if (wednesday.enabled && wednesday.startTime && wednesday.endTime) {
        workSchedule.wednesday = {
          startTime: wednesday.startTime.format('HH:mm'),
          endTime: wednesday.endTime.format('HH:mm')
        };
      }
      
      if (thursday.enabled && thursday.startTime && thursday.endTime) {
        workSchedule.thursday = {
          startTime: thursday.startTime.format('HH:mm'),
          endTime: thursday.endTime.format('HH:mm')
        };
      }
      
      if (friday.enabled && friday.startTime && friday.endTime) {
        workSchedule.friday = {
          startTime: friday.startTime.format('HH:mm'),
          endTime: friday.endTime.format('HH:mm')
        };
      }
      
      if (saturday.enabled && saturday.startTime && saturday.endTime) {
        workSchedule.saturday = {
          startTime: saturday.startTime.format('HH:mm'),
          endTime: saturday.endTime.format('HH:mm')
        };
      }
      
      if (sunday.enabled && sunday.startTime && sunday.endTime) {
        workSchedule.sunday = {
          startTime: sunday.startTime.format('HH:mm'),
          endTime: sunday.endTime.format('HH:mm')
        };
      }

      const newStaff: Staff = {
        id: staff?.id || '',
        name: values.name,
        position: values.position,
        phone: values.phone,
        email: values.email,
        maxAppointmentsPerDay: values.maxAppointmentsPerDay,
        workSchedule,
        services: values.services || [],
        isActive: staff?.isActive || true
      };

      onSave(newStaff);
    });
  };

  // lich input
  const renderDaySchedule = (
    day: string,
    dayState: DayTimeRange,
    setDayState: React.Dispatch<React.SetStateAction<DayTimeRange>>
  ) => (
    <Row gutter={[8, 8]} align="middle" style={{ marginBottom: 8 }}>
      <Col span={6}>
        <Checkbox
          checked={dayState.enabled}
          onChange={e => setDayState({ ...dayState, enabled: e.target.checked })}
        >
          {day}
        </Checkbox>
      </Col>
      <Col span={18}>
        <Space>
          <TimePicker
            format="HH:mm"
            disabled={!dayState.enabled}
            placeholder="Bắt đầu"
            value={dayState.startTime}
            onChange={time => setDayState({ ...dayState, startTime: time })}
          />
          <span>đến</span>
          <TimePicker
            format="HH:mm"
            disabled={!dayState.enabled}
            placeholder="Kết thúc"
            value={dayState.endTime}
            onChange={time => setDayState({ ...dayState, endTime: time })}
          />
        </Space>
      </Col>
    </Row>
  );

  return (
    <Modal
      title={staff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {staff ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          maxAppointmentsPerDay: 10
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Họ tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input placeholder="Nhập họ tên nhân viên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="position"
              label="Vị trí"
              rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
            >
              <Input placeholder="Nhập vị trí nhân viên" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập địa chỉ email" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="maxAppointmentsPerDay"
          label="Số lượng khách tối đa mỗi ngày"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng khách tối đa' }]}
        >
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="services"
          label="Dịch vụ cung cấp"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một dịch vụ' }]}
        >
          <Select 
            mode="multiple" 
            placeholder="Chọn dịch vụ mà nhân viên có thể thực hiện"
            optionFilterProp="children"
            style={{ width: '100%' }}
          >
            {services.map(service => (
              <Option key={service.id} value={service.id}>
                {service.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Lịch làm việc">
          <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '2px' }}>
            {renderDaySchedule('Thứ hai', monday, setMonday)}
            {renderDaySchedule('Thứ ba', tuesday, setTuesday)}
            {renderDaySchedule('Thứ tư', wednesday, setWednesday)}
            {renderDaySchedule('Thứ năm', thursday, setThursday)}
            {renderDaySchedule('Thứ sáu', friday, setFriday)}
            {renderDaySchedule('Thứ bảy', saturday, setSaturday)}
            {renderDaySchedule('Chủ nhật', sunday, setSunday)}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StaffForm;