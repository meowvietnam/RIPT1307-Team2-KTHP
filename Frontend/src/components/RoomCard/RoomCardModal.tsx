import React, { useEffect, useState } from 'react';
import { Modal, Card, Descriptions, Button, Form, Select, InputNumber, DatePicker, Space, message } from 'antd';
import type { History, Room, Service } from '@/models/Type';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CreateHistoryModal from './HistoryModal';

interface Props {
  room: Room;
  visible: boolean;
  onClose: () => void;
}

const RoomHistoryModal: React.FC<Props> = ({ room, visible, onClose }) => {
  const [histories, setHistories] = useState<History[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<History | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      const allHistories = JSON.parse(localStorage.getItem('hotel_histories') || '[]') as History[];
      const filtered = allHistories.filter(h => h.roomid === room.roomid);
      setHistories(filtered);
      setSelectedHistory(filtered[0] || null);

      const allServices = JSON.parse(localStorage.getItem('hotel_services') || '[]') as Service[];
      setServices(allServices);

      form.resetFields(); // reset form mỗi khi modal hiện ra
    }
  }, [visible, room.roomid, form]);

  const handleAddService = (values: any) => {
    if (!selectedHistory) {
      message.error('Vui lòng chọn lịch sử để thêm dịch vụ.');
      return;
    }
    // Tạo roomservice mới từ dữ liệu form
    const newRoomServices = (values.roomservices || []).map((item: any, index: number) => {
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

    // Cập nhật lịch sử hiện tại
    const updatedRoomServices = [...(selectedHistory.roomservices || []), ...newRoomServices];
    const newTotal = updatedRoomServices.reduce((sum, rs) => sum + (rs.Service?.Price || 0) * rs.Quanity, 0);

    const updatedHistory = {
      ...selectedHistory,
      roomservices: updatedRoomServices,
      totalprice: newTotal,
    };

    // Cập nhật localStorage
    const allHistories = JSON.parse(localStorage.getItem('hotel_histories') || '[]') as History[];
    const newHistories = allHistories.map(h => (h.historyid === selectedHistory.historyid ? updatedHistory : h));
    localStorage.setItem('hotel_histories', JSON.stringify(newHistories));

    // Cập nhật state
    setHistories(newHistories);
    setSelectedHistory(updatedHistory);
    message.success('Thêm dịch vụ thành công!');
    form.resetFields();
  };

  return (
    <Modal
      title={`Chi tiết phòng ${room.roomname}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left: history list */}
        <div style={{ width: '35%', borderRight: '1px solid #f0f0f0', paddingRight: 12, maxHeight: 400, overflowY: 'auto' }}>
          <h4>Lịch sử sử dụng</h4>
          <Button type="primary" style={{ marginBottom: 12 }} onClick={() => setCreateVisible(true)}>
            Thêm lịch sử
          </Button>
          {histories.length === 0 ? (
            <p>Không có lịch sử.</p>
          ) : (
            histories.map((h) => (
              <Card
                key={h.historyid}
                size="small"
                style={{ marginBottom: 8, cursor: 'pointer', backgroundColor: selectedHistory?.historyid === h.historyid ? '#e6f7ff' : '#fff' }}
                onClick={() => setSelectedHistory(h)}
              >
                <p><b>Bắt đầu:</b> {new Date(h.starttime).toLocaleString()}</p>
                <p><b>Tổng tiền:</b> {h.totalprice.toLocaleString()}₫</p>
              </Card>
            ))
          )}
        </div>

        {/* Right: selected history detail + thêm dịch vụ */}
        <div style={{ width: '65%' }}>
          <h4>Chi tiết sử dụng</h4>
          {selectedHistory ? (
            <>
              <Descriptions bordered size="small" column={1} style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Mã lịch sử">{selectedHistory.historyid}</Descriptions.Item>
                <Descriptions.Item label="Người dùng">{selectedHistory.user?.FullName || selectedHistory.userid}</Descriptions.Item>
                <Descriptions.Item label="Bắt đầu">{new Date(selectedHistory.starttime).toLocaleString()}</Descriptions.Item>
                {selectedHistory.endtime && (
                  <Descriptions.Item label="Kết thúc">{new Date(selectedHistory.endtime).toLocaleString()}</Descriptions.Item>
                )}
                <Descriptions.Item label="Tổng tiền">{selectedHistory.totalprice.toLocaleString()}₫</Descriptions.Item>
                <Descriptions.Item label="Dịch vụ đã dùng">
                  {(selectedHistory.roomservices || []).map(rs => (
                    <div key={rs.RoomServiceID}>
                      • {rs.Service?.ServiceName || rs.ServiceID} ({rs.Quanity}) - {new Date(rs.StartTime).toLocaleString()}
                    </div>
                  ))}
                </Descriptions.Item>
              </Descriptions>

              {/* Form thêm dịch vụ */}
              <Form form={form} layout="vertical" onFinish={handleAddService}>
                <Form.List name="roomservices">
                  {(fields, { add, remove }) => (
                    <>
                      <label><b>Thêm dịch vụ mới</b></label>
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
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Lưu dịch vụ mới
                  </Button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <p>Chọn một lịch sử để xem chi tiết.</p>
          )}
        </div>
      </div>

      <CreateHistoryModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        room={room}
        onCreated={(newHistory) => {
          setHistories((prev) => [newHistory, ...prev]);
          setSelectedHistory(newHistory);
        }}
      />
    </Modal>
  );
};

export default RoomHistoryModal;
