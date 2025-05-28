import React, { useEffect, useState } from 'react';
import {
  Modal, Form, Select, InputNumber, DatePicker, Button, Space, message
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { History, RoomService, Service } from '@/models/Type';

interface Props {
  visible: boolean;
  onClose: () => void;
  history: History;
  onUpdated: (updatedHistory: History) => void;
}

const AddRoomServiceModal: React.FC<Props> = ({ visible, onClose, history, onUpdated }) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const serviceList = JSON.parse(localStorage.getItem('hotel_services') || '[]') as Service[];
    setServices(serviceList);
  }, []);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newServices: RoomService[] = values.roomservices.map((item: any, index: number) => {
        const service = services.find(s => s.ServiceID === item.serviceId);
        return {
          RoomServiceID: Date.now() + index,
          RoomID: history.roomid,
          Room: history.room,
          ServiceID: item.serviceId,
          Service: service!,
          Quanity: item.quantity,
          StartTime: item.startTime.toISOString(),
          IsCheckedOut: false,
          History: history,
        };
      });

      const updatedRoomServices = [...history.roomservices, ...newServices];
      const updatedTotal = updatedRoomServices.reduce(
        (sum, rs) => sum + (rs.Service?.Price || 0) * rs.Quanity,
        0
      );

      const updatedHistory: History = {
        ...history,
        roomservices: updatedRoomServices,
        totalprice: updatedTotal,
      };

      // Cập nhật vào localStorage
      const all = JSON.parse(localStorage.getItem('hotel_histories') || '[]') as History[];
      const newAll = all.map(h => (h.historyid === history.historyid ? updatedHistory : h));
      localStorage.setItem('hotel_histories', JSON.stringify(newAll));

      message.success('Đã thêm dịch vụ thành công!');
      form.resetFields();
      onClose();
      onUpdated(updatedHistory);
    });
  };

  return (
    <Modal
      title="Thêm dịch vụ cho lần sử dụng"
      visible={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Thêm"
      cancelText="Hủy"
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.List name="roomservices">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'serviceId']}
                    rules={[{ required: true, message: 'Chọn dịch vụ' }]}
                  >
                    <Select placeholder="Dịch vụ" style={{ width: 200 }}>
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
                    rules={[{ required: true, message: 'Số lượng' }]}
                  >
                    <InputNumber min={1} placeholder="Số lượng" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'startTime']}
                    rules={[{ required: true, message: 'Thời gian' }]}
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

export default AddRoomServiceModal;
