import React, { useState, useEffect } from 'react';
import {
  Modal, Input, DatePicker, Button, Form, message, Select, InputNumber, Space
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Room, History, RoomService, Service, User } from '@/models/Type';
import dayjs from 'dayjs';

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
  const allUsers = JSON.parse(localStorage.getItem('hotel_users') || '[]') as User[];
  setUsers(allUsers);
}, []);


  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('hotel_services') || '[]') as Service[];
    setServices(all);
  }, []);

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
          StartTime: item.startTime.toISOString(),
          IsCheckedOut: false,
        };
      });

      const total = newRoomServices.reduce((sum, rs) => {
        return sum + (rs.Service?.Price || 0) * rs.Quanity;
      }, 0);

      const newHistory: History = {
        historyid: Date.now(),
        roomid: room.roomid,
        room,
        userid: Number(values.userid),
        roomservices: newRoomServices,
        totalprice: total,
        starttime: values.starttime.toISOString(),
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
          label="User ID"
          name="userid"
          rules={[{ required: true, message: 'Vui lòng nhập User ID' }]}
        >
          <Input type="number" placeholder="Nhập ID người dùng" />
        </Form.Item>

        <Form.Item
          label="Thời gian bắt đầu"
          name="starttime"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
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
