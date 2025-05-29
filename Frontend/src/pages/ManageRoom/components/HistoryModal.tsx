import React, { useState, useEffect } from 'react';
import {
  Modal, Input, DatePicker, Button, Form, message, Select, InputNumber, Space
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Room, History, RoomService, Service, User } from '@/services/typing';

interface Props {
  visible: boolean;
  onClose: () => void;
  room: Room;
  onCreated: (history: History) => void;
}

const CreateHistoryModal: React.FC<Props> = ({ visible, onClose, room, onCreated }) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem('USER_DATA') || '[]') as User[];
    setUsers(allUsers);
  }, [visible]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('hotel_services') || '[]') as Service[];
    setServices(all);
  }, [visible]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newRoomServices: RoomService[] = (values.roomservices || []).map((item: any, index: number) => {
        const service = services.find(s => s.ServiceID === item.serviceId);
        return {
          RoomServiceID: Date.now() + index,
          RoomID: room.roomid,
          Room: room,
          ServiceID: item.serviceId,
          Service: service!,
          Quanity: item.quantity,
          StartTime: item.startTime ? item.startTime.toISOString() : '',
          IsCheckedOut: false,
        };
      });

      const total = room.price + newRoomServices.reduce((sum, rs) => {
        return sum + (rs.Service?.Price || 0) * rs.Quanity;
      }, 0);

      const newHistory: History = {
        historyid: Date.now(),
        roomid: room.roomid,
        room,
        userid: Number(values.userid),
        user: users.find(u => u.UserID === Number(values.userid)),
        roomservices: newRoomServices,
        totalprice: total,
        starttime: values.starttime ? values.starttime.toISOString() : null,
        endtime: null,
        PhoneCustomer: values.PhoneCustomer || '',
        FullNameCustomer: values.FullNameCustomer || '',
        IDCustomer: values.IDCustomer || '',
      };

      const all = JSON.parse(localStorage.getItem('hotel_histories') || '[]') as History[];
      const updated = [newHistory, ...all];
      localStorage.setItem('hotel_histories', JSON.stringify(updated));

      onCreated(newHistory);
      message.success('Thêm lịch sử thành công!');
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title="Thêm lịch sử sử dụng"
      visible={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Thêm"
      cancelText="Hủy"
      width={800}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Tên khách hàng"
          name="FullNameCustomer"
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại khách"
          name="PhoneCustomer"
        >
          <Input placeholder="Nhập số điện thoại khách" />
        </Form.Item>
        <Form.Item
          label="CMND/CCCD khách"
          name="IDCustomer"
        >
          <Input placeholder="Nhập số CMND/CCCD khách" />
        </Form.Item>
        <Form.Item
          label="User"
          name="userid"
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
        >
          <Select
            placeholder="Chọn nhân viên"
          >
            {users.map(user => (
              <Select.Option key={user.UserID} value={user.UserID}>
                {user.FullName} ({user.Username})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.List name="roomservices">
          {(fields, { add, remove }) => (
            <>
              <label>Dịch vụ sử dụng</label>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'serviceId']}
                    rules={[{ required: true, message: 'Chọn dịch vụ' }]}
                  >
                    <Select placeholder="Chọn dịch vụ" style={{ width: 200 }}>
                      {services.map(service => (
                        <Select.Option key={service.ServiceID} value={service.ServiceID}>
                          {service.ServiceName} - {service.Price}đ
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'quantity']}
                    rules={[{ required: true, message: 'Nhập số lượng' }]}
                  >
                    <InputNumber min={1} placeholder="Số lượng" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'startTime']}
                    rules={[{ required: true, message: 'Chọn thời gian bắt đầu' }]}
                  >
                    <DatePicker showTime placeholder="Thời gian bắt đầu" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm dịch vụ
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default CreateHistoryModal;