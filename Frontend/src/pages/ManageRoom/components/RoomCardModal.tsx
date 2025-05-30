import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Card, Descriptions, Button, Form, Select, InputNumber, Space, message, Spin, Tag } from 'antd';
import type { History, Room, Service, RoomType, User, RoomService } from '@/services/typing';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CheckInModal from './CheckInModal';
import moment from 'moment';
import { API_BASE_URL } from '@/config/api';

const { Option } = Select;

interface Props {
  room: Room;
  visible: boolean;
  onClose: () => void;
  onStatusChange: (roomid: number, newStatus: Room['status']) => void;
  onRoomTypeChange?: (roomid: number, newRoomTypeID: number | null) => void;
  calculateDisplayTotalPrice: (history: History | null, currentRoom: Room, allServices: Service[]) => number;
  services: Service[]; // Tất cả dịch vụ được truyền từ ManageRoom/RoomStaffView
  roomTypes: RoomType[]; // Tất cả loại phòng được truyền từ ManageRoom/RoomStaffView
}

const RoomHistoryModal: React.FC<Props> = ({
  room,
  visible,
  onClose,
  onStatusChange,
  onRoomTypeChange,
  calculateDisplayTotalPrice,
  services,
  roomTypes,
}) => {
  const [histories, setHistories] = useState<History[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<History | null>(null);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentRoomTypeID, setCurrentRoomTypeID] = useState<number | null>(room.roomTypeID || null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setCurrentRoomTypeID(room.roomTypeID || null);
  }, [room.roomTypeID]);

  const fetchModalData = () => {
    if (!visible) return;

    setLoadingModal(true);
    setLoadingUsers(true);

    Promise.all([
      fetch(`${API_BASE_URL}/staff/histories/room/${room.roomID}`)
        .then(response => {
          if (!response.ok) {
            return response.json().catch(() => { throw new Error(`HTTP error! status: ${response.status}`); })
              .then(errorData => { throw new Error(errorData?.message || `HTTP error! status: ${response.status}`); });
          }
          return response.json();
        }),
      fetch(`${API_BASE_URL}/staff/usersdto`)
        .then(response => {
          if (!response.ok) {
            return response.json().catch(() => { throw new Error(`HTTP error! status: ${response.status}`); })
              .then(errorData => { throw new Error(errorData?.message || `HTTP error! status: ${response.status}`); });
          }
          return response.json();
        }),
    ])
      .then(([historiesData, usersData]) => {
        if (!Array.isArray(historiesData)) {
          message.warning('Dữ liệu lịch sử phòng nhận được không đúng định dạng. Vui lòng kiểm tra API.');
          setHistories([]);
        } else {
          setHistories(historiesData);
          const activeHistory = historiesData.find(h => !h.endTime);
          if (activeHistory) {
            setSelectedHistory(activeHistory);
          } else if (historiesData.length > 0) {
            const mostRecentHistory = historiesData.reduce((prev, current) =>
              (new Date(current.startTime!) > new Date(prev.startTime!)) ? current : prev
            );
            setSelectedHistory(mostRecentHistory);
          } else {
            setSelectedHistory(null);
          }
        }

        if (!Array.isArray(usersData)) {
          message.warning('Dữ liệu người dùng nhận được không đúng định dạng.');
          setUsers([]);
        } else {
          setUsers(usersData);
        }

        form.resetFields();
      })
      .catch(error => {
        console.error("Error fetching modal data:", error);
        message.error(`Lỗi khi tải dữ liệu: ${error instanceof Error ? error.message : String(error)}`);
        setHistories([]);
        setUsers([]);
      })
      .finally(() => {
        setLoadingModal(false);
        setLoadingUsers(false);
      });
  };

  useEffect(() => {
    fetchModalData();
  }, [visible, room.roomID]);

const handleRoomTypeSelectChange = (value: number) => {
  // CHỈ cho phép đổi loại phòng NẾU phòng KHÔNG phải 'Checked Out' VÀ KHÔNG phải 'Being Cleaned'
  // Điều này có nghĩa là phòng đang ở trạng thái 'Available' HOẶC 'In Use'
  if (room.status !== 'Checked Out' && room.status !== 'Being Cleaned') {
    setCurrentRoomTypeID(value);
    if (onRoomTypeChange) {
      onRoomTypeChange(room.roomID, value);
    } else {
      message.warning('Không thể cập nhật kiểu phòng (onRoomTypeChange không được cung cấp).');
    }
  } else {
    // Sửa thông báo lỗi để phản ánh đúng logic
    message.warning('Không thể thay đổi loại phòng khi phòng đã check-out hoặc đang dọn dẹp.');
  }
};

  const handleAddService = (values: any) => {
    if (!selectedHistory) {
      message.error('Vui lòng chọn lịch sử để thêm dịch vụ.');
      return;
    }
    if (selectedHistory.isCheckOut) {
      message.error('Lịch sử này đã được check-out. Không thể thêm dịch vụ.');
      return;
    }
    if (room.status !== 'In Use') {
      message.error('Chỉ có thể thêm dịch vụ khi phòng đang ở trạng thái "In Use".');
      return;
    }
    if (!selectedHistory.startTime) {
      message.error('Lịch sử chưa được check-in. Vui lòng check-in trước khi thêm dịch vụ.');
      return;
    }

    const servicesToAdd = (values.roomservices || []).map((item: any) => ({
      serviceID: item.serviceId,
      quantity: item.quantity,
    }));

    fetch(`${API_BASE_URL}/staff/roomservices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        historyID: selectedHistory.historyID,
        roomID: room.roomID,
        services: servicesToAdd,
      }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().catch(() => { throw new Error('Failed to add services'); })
            .then(errorData => { throw new Error(errorData?.message || `HTTP error! status: ${response.status}`); });
        }
        return response.json();
      })
      .then((updatedHistory: History) => {
        setHistories(prevHistories => prevHistories.map(h =>
          h.historyID === updatedHistory.historyID ? updatedHistory : h
        ));
        setSelectedHistory(updatedHistory);
        message.success('Thêm dịch vụ thành công!');
        form.resetFields();
      })
      .catch(error => {
        console.error("Error adding service:", error);
        message.error(`Lỗi khi thêm dịch vụ: ${error instanceof Error ? error.message : String(error)}`);
      });
  };

  const handleCheckOut = () => {
    if (!selectedHistory) {
      message.error('Vui lòng chọn lịch sử để check-out.');
      return;
    }
    if (room.status !== 'In Use' || selectedHistory.endTime || selectedHistory.isCheckOut) {
      message.error('Phòng không ở trạng thái "In Use" hoặc đã check-out rồi.');
      return;
    }
    if (!selectedHistory.startTime) {
      message.error('Không thể check-out một lịch sử chưa có thời gian bắt đầu (chưa check-in).');
      return;
    }

    // --- BẮT ĐẦU PHẦN CHỈNH SỬA QUAN TRỌNG NHẤT (THEO YÊU CẦU CỦA BẠN) ---
    // Tìm thông tin RoomType hiện tại của phòng từ danh sách roomTypes props
    const currentRoomType = roomTypes.find(rt => rt.roomTypeID === room.roomTypeID);

    const historyToUpdate = {
      // Sao chép các thuộc tính cơ bản của selectedHistory
      // Loại bỏ các navigation properties để tránh lỗi tuần hoàn và dữ liệu không cần thiết
      ...selectedHistory, // Sử dụng spread operator để giữ lại các thuộc tính khác

      room: undefined, // Xóa đối tượng room lồng ghép để chỉ gửi roomID
      user: undefined, // Xóa đối tượng user lồng ghép để chỉ gửi userID
      roomType: undefined, // <<< LOẠI BỎ ROOMTYPE OBJECT NÀY >>>
      
      // Đảm bảo roomID và userID được gửi ở cấp độ gốc của đối tượng
      roomID: room.roomID, // Lấy từ prop 'room'
      userID: selectedHistory.user?.userID || 0, // Lấy userID từ đối tượng user lồng ghép. Đảm bảo là số, nếu null thì là 0.

      endTime: new Date().toISOString(), // Cập nhật thời gian kết thúc
      isCheckOut: true, // Đặt trạng thái đã check-out

      // CẬP NHẬT ROOMSERVICES:
      roomServices: selectedHistory.roomServices?.map((rs: RoomService) => {
        const serviceData = services.find(s => s.serviceID === rs.serviceID);
        return {
          roomServiceID: rs.roomServiceID,
          serviceID: rs.serviceID,
          quantity: rs.quantity,
          historyID: selectedHistory.historyID,
          roomID: room.roomID,
          service: serviceData ? { 
            serviceID: serviceData.serviceID,
            serviceName: serviceData.serviceName,
            price: serviceData.price,
            serviceType: serviceData.serviceType,
          } : undefined,
        };
      }),

      // <<< CHỈ GỬI CÁC THUỘC TÍNH SNAPSHOT CỦA ROOMTYPE >>>
      // Đảm bảo các thuộc tính này tồn tại và được gửi đi
      typeName: currentRoomType?.typeName,
      hourThreshold: currentRoomType?.hourThreshold,
      overchargePerHour: currentRoomType?.overchargePerHour,
      basePrice: currentRoomType?.basePrice,
      // <<< LOẠI BỎ roomTypeID NẾU BẠN KHÔNG MUỐN NÓ CÒN LÀ MỘT KHÓA NGOẠI HOẶC CỘT RIÊNG BIỆT >>>
      // Nếu bạn muốn giữ RoomTypeID như một cột độc lập trong History, thì vẫn giữ dòng này:
      // roomTypeID: room.roomTypeID, 
      // Nhưng theo yêu cầu của bạn là "không gửi RoomTypeID", thì dòng này sẽ bị loại bỏ.
      // Quyết định này phụ thuộc vào cách bạn xử lý RoomTypeID ở backend (nó có còn là FK không, hay chỉ là cột snapshot).
      // Nếu History của bạn chỉ có TypeName, HourThreshold, OverchargePerHour, BasePrice và không có RoomTypeID thì hãy bỏ dòng trên.
      // Nếu bạn muốn History vừa có RoomTypeID vừa có các thuộc tính snapshot (để dễ truy vấn theo ID gốc), thì hãy giữ roomTypeID.
      // Tôi sẽ loại bỏ nó theo yêu cầu của bạn.
      // <<< END CHỈNH SỬA QUAN TRỌNG NHẤT >>>

      // KHÔNG CẦN gửi totalPrice nếu backend của bạn tính toán nó.
      totalPrice: calculateDisplayTotalPrice(selectedHistory, room, services),
    };
    // --- KẾT THÚC PHẦN CHỈNH SỬA QUAN TRỌNG NHẤT ---

    fetch(`${API_BASE_URL}/staff/histories/${selectedHistory.historyID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historyToUpdate),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().catch(() => { throw new Error(`HTTP error! status: ${response.status}`); })
            .then(errorData => { throw new Error(errorData?.message || `HTTP error! status: ${response.status}`); });
        }
        return response.json();
      })
      .then((updatedHistory: History) => {
        onStatusChange(room.roomID, 'Being Cleaned');
        setHistories(prevHistories => prevHistories.map(h =>
          h.historyID === updatedHistory.historyID ? updatedHistory : h
        ));
        setSelectedHistory(updatedHistory);
        message.success('Check-out thành công! Phòng đã chuyển sang trạng thái "Being Cleaned".');

        let surchargeMessage = '';
        if (updatedHistory.startTime && updatedHistory.endTime && room.roomType?.hourThreshold && room.roomType.overchargePerHour) {
          const start = new Date(updatedHistory.startTime);
          const end = new Date(updatedHistory.endTime);
          const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

          if (durationHours > room.roomType.hourThreshold) {
            const overchargeHours = durationHours - room.roomType.hourThreshold;
            const surcharge = overchargeHours * room.roomType.overchargePerHour;
            surchargeMessage = `Phòng đã ở quá ${room.roomType.hourThreshold} giờ (${durationHours.toFixed(1)} giờ). Phụ phí: ${surcharge.toLocaleString()}₫`;
          }
        }
        if (surchargeMessage) {
          message.info(surchargeMessage);
        }
      })
      .catch(error => {
        console.error("Error checking out:", error);
        message.error(`Lỗi check-out: ${error instanceof Error ? error.message : String(error)}`);
      });
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'Available': return 'green';
      case 'In Use': return 'volcano';
      case 'Being Cleaned': return 'orange';
      case 'Checked Out': return 'blue ';

      default: return 'default';
    }
  };

  const getHistoryStatus = (history: History) => {
    if (history.isCheckOut) {
      return <Tag color="blue">Checked Out</Tag>;
    }
    if (room.status === 'In Use' && history.startTime) {
      return <Tag color="volcano">In Use</Tag>;
    }
    if (history.startTime && !history.endTime) {
      return <Tag color="processing">Đang hoạt động</Tag>;
    }
    return <Tag color="blue">Checked Out</Tag>;

  };

  return (
    <Modal
      title={`Lịch sử phòng ${room.roomName}`}
      visible={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      centered
      bodyStyle={{ paddingBottom: '0' }}
    >
      <Spin spinning={loadingModal} tip="Đang tải dữ liệu...">
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Cột trái: Danh sách lịch sử */}
          <div style={{ width: '35%' }}>
            <Card
              title="Danh sách lịch sử"
              size="small"
              extra={
                <Button
                  type="primary"
                  onClick={() => setCheckInModalVisible(true)}
                  disabled={room.status !== 'Available'}
                >
                  Check-in
                </Button>
              }
              style={{ marginBottom: 0 }}
            >
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {histories.length > 0 ? (
                  histories.map(history => (
                    <Card
                      key={history.historyID}
                      size="small"
                      style={{ marginBottom: 8, cursor: 'pointer', borderColor: selectedHistory?.historyID === history.historyID ? '#1890ff' : undefined }}
                      onClick={() => setSelectedHistory(history)}
                    >
                      <p><strong>Mã:</strong> {history.historyID || 'N/A'}</p>
                      <p><strong>Khách hàng:</strong> {history.nameCustomer || 'N/A'}</p>
                      <p><strong>Bắt đầu:</strong> {history.startTime ? new Date(history.startTime).toLocaleString() : 'N/A'}</p>
                      <p><strong>Kết thúc:</strong> {history.endTime ? new Date(history.endTime).toLocaleString() : 'N/A'}</p>
                      {getHistoryStatus(history)}
                    </Card>
                  ))
                ) : (
                  <p>Chưa có lịch sử nào cho phòng này.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Cột phải: Chi tiết lịch sử và chức năng */}
          <div style={{ width: '65%' }}>
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={handleCheckOut}
                disabled={!selectedHistory || selectedHistory.isCheckOut || room.status !== 'In Use'}
              >
                Check-out
              </Button>

              <Select
                value={currentRoomTypeID}
                onChange={handleRoomTypeSelectChange}
                style={{ width: 150 }}
                placeholder="Đổi loại phòng"
                disabled={selectedHistory?.isCheckOut||room.status === 'Checked Out' || room.status === 'Being Cleaned'}
              >
                {roomTypes.map(type => (
                  <Option key={type.roomTypeID} value={type.roomTypeID}>
                    {type.typeName}
                  </Option>
                ))}
              </Select>
            </Space>

            {selectedHistory ? (
              <>
                <Descriptions bordered size="small" column={2} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="Mã lịch sử">{selectedHistory.historyID || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Tên khách hàng">{selectedHistory.nameCustomer || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{selectedHistory.numberPhoneCustomer || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="CMND/CCCD">{selectedHistory.idCustomer || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Nhân viên phục vụ">{selectedHistory.user?.fullName || selectedHistory.user?.username || selectedHistory.userID || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Thời gian bắt đầu">{selectedHistory.startTime ? new Date(selectedHistory.startTime).toLocaleString() : 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Thời gian kết thúc">{selectedHistory.endTime ? new Date(selectedHistory.endTime).toLocaleString() : 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    {/* SỬ DỤNG calculateDisplayTotalPrice TỪ PROPS */}
                    {calculateDisplayTotalPrice(selectedHistory, room, services)?.toLocaleString() || '0'}₫
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái phòng">
                    <Tag color={getStatusColor(selectedHistory.room.status)}>
                      {getHistoryStatus(selectedHistory)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Dịch vụ đã dùng" span={2}>
                    {selectedHistory.roomServices && selectedHistory.roomServices.length > 0 ? (
                      <ol>
                        {selectedHistory.roomServices.map((rs: RoomService) => {
                          const serviceFound = services.find(s => s.serviceID === rs.serviceID);
                          const serviceName = rs.service?.serviceName || serviceFound?.serviceName || 'Không rõ';
                          const servicePrice = rs.service?.price || serviceFound?.price || 0;
                          return (
                            <li key={rs.roomServiceID}>
                              {serviceName} - ({servicePrice?.toLocaleString()}₫) x {rs.quantity}
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <p>Chưa có dịch vụ nào.</p>
                    )}
                  </Descriptions.Item>
                </Descriptions>

                {/* Form thêm dịch vụ */}
                <Card title="Thêm dịch vụ" size="small" style={{ marginBottom: 0 }}>
                  <Form
                    form={form}
                    onFinish={handleAddService}
                    layout="vertical"
                    initialValues={{ roomservices: [{ serviceId: undefined, quantity: 1 }] }}
                  >
                    <Form.List name="roomservices">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                              <Form.Item
                                {...restField}
                                name={[name, 'serviceId']}
                                rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}
                                style={{ width: 200 }}
                              >
                                <Select placeholder="Chọn dịch vụ">
                                  {services.map(service => (
                                    <Option key={service.serviceID} value={service.serviceID}>
                                      {service.serviceName} ({service.price?.toLocaleString()}₫)
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'quantity']}
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                                style={{ width: 100 }}
                              >
                                <InputNumber min={1} placeholder="Số lượng" />
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
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button type="primary" htmlType="submit">
                        Lưu dịch vụ
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </>
            ) : (
              <p>Chọn một lịch sử để xem chi tiết hoặc Check-in cho phòng mới.</p>
            )}
          </div>
        </div>
      </Spin>

      {/* CheckInModal */}
      <CheckInModal
        visible={checkInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
        room={room}
        onCheckInSuccess={(newHistory) => {
          setHistories(prev => [newHistory, ...prev].sort((a, b) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime()));
          setSelectedHistory(newHistory);
          message.success("Check-in thành công!");
          onStatusChange(room.roomID, 'In Use');
        }}
        onStatusChange={onStatusChange}
        users={users}
        loadingUsers={loadingUsers}
      />
    </Modal>
  );
};

export default RoomHistoryModal;