import React, { useEffect, useState } from 'react';
import { Modal, Card, Descriptions, Button, Form, Select, InputNumber, DatePicker, Space, message } from 'antd';
import type { History, Room, Service } from '@/services/typing';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CreateHistoryModal from './HistoryModal';

interface Props {
  room: Room;
  visible: boolean;
  onClose: () => void;
  onStatusChange: (roomid: number, newStatus: Room['status']) => void; // thêm dòng này
}

const RoomHistoryModal: React.FC<Props> = ({ room, visible, onClose, onStatusChange }) => {
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

      form.resetFields();
    }
  }, [visible, room.roomid, form]);

  const handleAddService = (values: any) => {
    if (!selectedHistory) {
      message.error('Vui lòng chọn lịch sử để thêm dịch vụ.');
      return;
    }

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

    const updatedRoomServices = [...(selectedHistory.roomservices || []), ...newRoomServices];
    const serviceTotal = updatedRoomServices.reduce((sum, rs) => sum + (rs.Service?.Price || 0) * rs.Quanity, 0);
    const newTotal = room.price + serviceTotal;

    const updatedHistory = {
      ...selectedHistory,
      roomservices: updatedRoomServices,
      totalprice: newTotal,
    };

    const allHistories = JSON.parse(localStorage.getItem('hotel_histories') || '[]') as History[];
    const newHistories = allHistories.map(h => (h.historyid === selectedHistory.historyid ? updatedHistory : h));
    localStorage.setItem('hotel_histories', JSON.stringify(newHistories));

    const filtered = newHistories.filter(h => h.roomid === room.roomid);
    setHistories(filtered);
    setSelectedHistory(updatedHistory);
    message.success('Thêm dịch vụ thành công!');
    form.resetFields();
  };

  const handleCheckIn = () => {
    const allRooms = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
    const updatedRooms = allRooms.map((r: any) =>
      r.roomid === room.roomid ? { ...r, status: 'Đã cho thuê' } : r
    );
    localStorage.setItem('hotel_rooms', JSON.stringify(updatedRooms));
    onStatusChange(room.roomid, 'Đã cho thuê');

    const now = new Date();

    const allHistories = JSON.parse(localStorage.getItem('hotel_histories') || '[]');
    const newHistories = allHistories.map((h: any) =>
      h.historyid === selectedHistory?.historyid
        ? { ...h, starttime: now.toISOString() }
        : h
    );
    localStorage.setItem('hotel_histories', JSON.stringify(newHistories));

    form.setFieldsValue({ starttime: now });
    if (selectedHistory) {
      setSelectedHistory({
        ...selectedHistory,
        starttime: now.toISOString(),
      });
    }

    message.success('Check-in thành công! Phòng đã chuyển sang trạng thái "Đã cho thuê".');
  };

  const handleCheckOut = () => {
    if (!selectedHistory) {
      message.error('Vui lòng chọn lịch sử để check-out.');
      return;
    }

    const now = new Date();
    const start = selectedHistory.starttime ? new Date(selectedHistory.starttime) : null;
    const end = now;
    let surcharge = 0;

    if (start && room.RoomType?.HourThreshold) {
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const overHours = Math.max(0, Math.ceil(diffHours - room.RoomType.HourThreshold));
      
      if (overHours > 0) {
        surcharge = overHours * room.RoomType.OverchargePerHour;
      }
    }
    
    // Cập nhật lịch sử
    const allHistories = JSON.parse(localStorage.getItem('hotel_histories') || '[]');
    const newHistories = allHistories.map((h: any) =>
      h.historyid === selectedHistory.historyid
        ? {
            ...h,
            endtime: now.toISOString(),
            isCheckedOut: true,
            totalprice: h.totalprice + surcharge,
          }
        : h
    );
    localStorage.setItem('hotel_histories', JSON.stringify(newHistories));

    setSelectedHistory({
      ...selectedHistory,
      endtime: now.toISOString(),
      isCheckedOut: true,
      totalprice: selectedHistory.totalprice + surcharge,
    });

    // Đổi trạng thái phòng thành "Đang dọn dẹp"
    const allRooms = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
    const updatedRooms = allRooms.map((r: any) =>
      r.roomid === room.roomid ? { ...r, status: 'Đang dọn dẹp' } : r
    );
    localStorage.setItem('hotel_rooms', JSON.stringify(updatedRooms));
    onStatusChange(room.roomid, 'Đang dọn dẹp');

    if (surcharge > 0) {
      message.warning(`Khách đã ở quá giờ quy định. Phụ phí thêm: ${surcharge.toLocaleString()}₫`);
    } else {
      message.success('Check-out thành công! Phòng chuyển sang trạng thái "Đang dọn dẹp".');
    }
  };

  const handleDeleteHistory = (historyId: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa lịch sử?',
      onOk: () => {
        const allHistories = JSON.parse(localStorage.getItem('hotel_histories') || '[]');
        const newHistories = allHistories.filter((item: any) => item.historyid !== historyId);
        localStorage.setItem('hotel_histories', JSON.stringify(newHistories));
        setHistories(newHistories.filter((item: any) => item.roomid === room.roomid));
        setSelectedHistory(null);
        message.success('Đã xóa lịch sử!');
      }
    });
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
        <div style={{ width: '35%', borderRight: '1px solid #f0f0f0', paddingRight: 12,maxHeight:400, overflowY: 'auto' }}>
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
                style={{
                  height: "auto",
                  marginBottom: 8,
                  cursor: 'pointer',
                  backgroundColor: selectedHistory?.historyid === h.historyid ? '#e6f7ff' : '#fff'
                }}
                onClick={() => setSelectedHistory(h)}
              >
                <p><b>Tên khách hàng: </b>{h.FullNameCustomer}</p>
                <p><b>Bắt đầu:</b> {h.starttime ? new Date(h.starttime).toLocaleString() : 'N/A'}</p>
                <p><b>Tổng tiền:</b> {h.totalprice.toLocaleString()}₫</p>
                <p>
                  <b>Trạng thái: </b>
                  {h.isCheckedOut ? (
                    <span style={{ color: 'black', fontWeight: 600 }}>Đã check out</span>
                  ) : (
                    <span style={{ color: 'red', fontWeight: 600 }}>Chưa check out</span>
                  )}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button
                    size="small"
                    type="primary"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteHistory(h.historyid);
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div style={{ width: '65%' }}>
          <h4>Chi tiết sử dụng</h4>
          {selectedHistory && (
            <Button
              type="primary"
              style={{ marginBottom: 16 }}
              disabled={!!selectedHistory.starttime}
              onClick={handleCheckIn}
            >
              Check-in
            </Button>
          )}
          {selectedHistory && selectedHistory.starttime && !selectedHistory.endtime && (
            <Button
              type="primary"
              style={{ marginBottom: 16, marginLeft: 8 }}
              onClick={handleCheckOut}
            >
              Check-out
            </Button>
          )}
          {selectedHistory ? (
            <>
              <Descriptions bordered size="small" column={2} style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Mã lịch sử">{selectedHistory.historyid}</Descriptions.Item>
                <Descriptions.Item label="Tên khách hàng">{selectedHistory.FullNameCustomer}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{selectedHistory.PhoneCustomer}</Descriptions.Item>
                <Descriptions.Item label="CMND/CCCD">{selectedHistory.IDCustomer}</Descriptions.Item>
                <Descriptions.Item label="Nhân viên phục vụ">{selectedHistory.user?.FullName || selectedHistory.userid}</Descriptions.Item>
                <Descriptions.Item label="Thời gian bắt đầu">{selectedHistory.starttime ? new Date(selectedHistory.starttime).toLocaleString() : 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Thời gian kết thúc">{selectedHistory.endtime ? new Date(selectedHistory.endtime).toLocaleString() : 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  {(() => {
                    let surcharge = 0;
                    if (selectedHistory.starttime && selectedHistory.endtime && room.RoomType?.HourThreshold) {
                      const start = new Date(selectedHistory.starttime);
                      const end = new Date(selectedHistory.endtime);
                      const diffMs = end.getTime() - start.getTime();
                      const diffHours = diffMs / (1000 * 60 * 60);
                      const overHours = Math.max(0, Math.ceil(diffHours - room.RoomType.HourThreshold));
                      if (overHours > 0) {
                        surcharge = overHours * room.RoomType.OverchargePerHour;
                      }
                    }
                    return (
                      <>
                        {(selectedHistory.totalprice).toLocaleString()}₫
                        {surcharge > 0 ? (
                          <span style={{ color: 'red', marginLeft: 8 }}>
                            (cộng thêm phụ phí do quá giờ: {surcharge.toLocaleString()}₫)
                          </span>
                        ) : (
                          <span style={{ color: 'green', marginLeft: 8 }}>
                            (không có phụ phí)
                          </span>
                        )}
                      </>
                    );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Dịch vụ đã dùng">
                  <div style={{ maxHeight: 90, overflowY: 'auto' }}>
                    {(selectedHistory.roomservices || []).map(rs => (
                      <div key={rs.RoomServiceID}>
                        - {rs.Service?.ServiceName || rs.ServiceID} ({rs.Quanity}) - {(rs.Service?.Price || 0).toLocaleString()}₫
                      </div>
                    ))}
                  </div>
                </Descriptions.Item>
              </Descriptions>

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
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={!!selectedHistory?.isCheckedOut} >
                          Thêm dịch vụ
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block disabled={!!selectedHistory?.isCheckedOut}>
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
          const all = JSON.parse(localStorage.getItem('hotel_histories') || '[]');
          const filtered = all.filter((item: any) => item.roomid === room.roomid);
          setHistories(filtered);
          setSelectedHistory(newHistory);
        }}
      />
    </Modal>
  );
};

export default RoomHistoryModal;