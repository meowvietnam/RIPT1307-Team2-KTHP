import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, InputNumber, Select, Space, message } from 'antd';
import type { RoomType } from '@/services/typing';
import RoomTypeForm from './components/RoomTypeForm';

const STORAGE_KEY = 'hotel_roomtypes';

const ManageRoomType: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [form] = Form.useForm();
  const [typeName, setTypeName] = useState<string>('Theo giờ');
  const [numDays, setNumDays] = useState<number>(1);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setRoomTypes(data);
  }, []);

  const openModal = (roomType?: RoomType) => {
    setEditing(roomType || null);
    setModalVisible(true);
    if (roomType) {
      setTypeName(roomType.TypeName);
      if (roomType.TypeName === 'Theo ngày') {
        setNumDays(roomType.HourThreshold / 24);
      }
      form.setFieldsValue(roomType);
    } else {
      setTypeName('Theo giờ');
      setNumDays(1);
      form.resetFields();
    }
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      let updated: RoomType[];
      if (editing) {
        updated = roomTypes.map(rt =>
          rt.RoomTypeID === editing.RoomTypeID ? { ...editing, ...values } : rt
        );
        message.success('Cập nhật loại phòng thành công!');
      } else {
        const newType: RoomType = {
          ...values,
          RoomTypeID: Date.now(),
        };
        updated = [newType, ...roomTypes];
        message.success('Thêm loại phòng thành công!');
      }
      setRoomTypes(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setModalVisible(false);
      setEditing(null);
    });
  };

  const handleTypeChange = (value: string) => {
    setTypeName(value);
    if (value === 'Theo ngày') {
      setNumDays(1);
      form.setFieldsValue({ HourThreshold: 24 });
    } else if (value === 'Qua đêm') {
      form.setFieldsValue({ HourThreshold: 12 });
    } else {
      form.setFieldsValue({ HourThreshold: undefined });
    }
  };

  const handleNumDaysChange = (value: number | null) => {
    if (value !== null) {
      setNumDays(value);
      form.setFieldsValue({ HourThreshold: value * 24 });
    }
  };

  const columns = [
    { title: 'Tên loại phòng', dataIndex: 'TypeName', key: 'TypeName' },
    { title: 'Giờ chuẩn', dataIndex: 'HourThreshold', key: 'HourThreshold' },
    { title: 'Phụ phí/giờ', dataIndex: 'OverchargePerHour', key: 'OverchargePerHour', render: (value: number) => value.toLocaleString() + '₫', },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: RoomType) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record.RoomTypeID)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa loại phòng?',
      onOk: () => {
        const updated = roomTypes.filter(rt => rt.RoomTypeID !== id);
        setRoomTypes(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        message.success('Đã xóa loại phòng!');
      }
    });
  };

  return (
    <div>
      <h2>Quản lý loại phòng</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
        Thêm loại phòng
      </Button>
      <Table dataSource={roomTypes} columns={columns} rowKey="RoomTypeID" />

      <Modal
        title={editing ? 'Sửa loại phòng' : 'Thêm loại phòng'}
        visible={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <RoomTypeForm
          form={form}
          typeName={typeName}
          numDays={numDays}
          onTypeChange={handleTypeChange}
          onNumDaysChange={handleNumDaysChange}
        />
      </Modal>
    </div>
  );
};

export default ManageRoomType;