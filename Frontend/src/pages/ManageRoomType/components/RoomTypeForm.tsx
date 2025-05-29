import React from 'react';
import { Form, InputNumber, Select } from 'antd';

interface RoomTypeFormProps {
  form: any;
  typeName: string;
  numDays: number;
  onTypeChange: (value: string) => void;
  onNumDaysChange: (value: number | null) => void;
}

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({
  form,
  typeName,
  numDays,
  onTypeChange,
  onNumDaysChange,
}) => (
  <Form form={form} layout="vertical">
    <Form.Item
      label="Tên loại phòng"
      name="TypeName"
      rules={[{ required: true, message: 'Chọn loại phòng' }]}
    >
      <Select onChange={onTypeChange}>
        <Select.Option value="Theo giờ">Theo giờ</Select.Option>
        <Select.Option value="Theo ngày">Theo ngày</Select.Option>
        <Select.Option value="Qua đêm">Qua đêm</Select.Option>
      </Select>
    </Form.Item>
    {typeName === 'Theo ngày' && (
      <Form.Item label="Số ngày" required>
        <InputNumber
          min={1}
          value={numDays}
          onChange={onNumDaysChange}
          style={{ width: '100%' }}
        />
      </Form.Item>
    )}
    <Form.Item
      label="Giờ chuẩn"
      name="HourThreshold"
      rules={[{ required: true, message: 'Nhập số giờ chuẩn' }]}
    >
      <InputNumber
        min={1}
        style={{ width: '100%' }}
        disabled={typeName === 'Theo ngày'}
      />
    </Form.Item>
    <Form.Item
      label="Phụ phí mỗi giờ"
      name="OverchargePerHour"
      rules={[{ required: true, message: 'Nhập phụ phí mỗi giờ' }]}
    >
      <InputNumber min={0} style={{ width: '100%' }} />
    </Form.Item>
  </Form>
);

export default RoomTypeForm;