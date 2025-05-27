import { Room } from '@/models/Type';
import { RoomService, Service } from '@/models/Type';
import { Modal, Form, InputNumber, DatePicker, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';


const RoomServiceForm = ({ visible, onClose, data, onSave }: {
  visible: boolean;
  onClose: () => void;
  data?: RoomService;
  onSave: (data: RoomService) => void;}) => {

  const [form] = Form.useForm();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  useEffect(() => {
    setRooms(JSON.parse(localStorage.getItem('hotel_rooms') || '[]'));
    setServices(JSON.parse(localStorage.getItem('hotel_services') || '[]'));
  }, [visible]);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        StartTime: moment(data.StartTime),
        EndTime: data.EndTime ? moment(data.EndTime) : undefined,
        RoomID: data.RoomID,
        ServiceID: data.ServiceID,
      });
    } else {
      form.resetFields();
    }
  }, [data]);

  const handleOk = () => {
    form.validateFields().then(values => {
      const room = rooms.find(r => r.roomid === values.RoomID)!;
      const service = services.find(s => s.ServiceID === values.ServiceID)!;

      onSave({
        ...(data || { ID: Date.now() }),
        ...values,
        Room: room,
        Service: service,
        StartTime: values.StartTime.toISOString(),
        EndTime: values.EndTime?.toISOString(),
      });
    });
  };

  return (
    <Modal visible={visible} onCancel={onClose} onOk={handleOk} title={data ? 'Chỉnh sửa' : 'Thêm dịch vụ'}>
      <Form form={form} layout="vertical">
        <Form.Item name="RoomID" label="Phòng" rules={[{ required: true }]}>
          <Select options={rooms.map(r => ({ label: r.roomname, value: r.roomid }))} />
        </Form.Item>
        <Form.Item name="ServiceID" label="Dịch vụ" rules={[{ required: true }]}>
          <Select options={services.map(s => ({ label: s.ServiceName, value: s.ServiceID }))} />
        </Form.Item>
        <Form.Item name="Quanity" label="Số lượng" rules={[{ required: true }]}>
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item name="StartTime" label="Thời gian bắt đầu" rules={[{ required: true }]}>
          <DatePicker showTime />
        </Form.Item>
        <Form.Item name="EndTime" label="Thời gian kết thúc">
          <DatePicker showTime />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoomServiceForm;
