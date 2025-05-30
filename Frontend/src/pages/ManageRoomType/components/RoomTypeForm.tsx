import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import type { RoomType } from '@/services/typing';

interface RoomTypeFormProps {
  form: any;
  // Loại bỏ các props không cần thiết
}

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({ form }) => { // Chỉ cần form prop

  const formatHourThreshold = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return '';
    if (hours === 0) return '0 giờ';

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0 && remainingHours > 0) {
      return `${days} ngày ${remainingHours} giờ`;
    } else if (days > 0) {
      return `${days} ngày`;
    } else {
      return `${remainingHours} giờ`;
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="Tên loại phòng"
        name="typeName"
        rules={[{ required: true, message: 'Nhập tên loại phòng' }]}
      >
        {/* KHÔNG CẦN onChange ở đây, Form.Item sẽ tự động xử lý */}
        <Input />
      </Form.Item>

      <Form.Item
        label="Giờ chuẩn"
        name="hourThreshold"
        rules={[{ required: true, message: 'Nhập số giờ chuẩn' }]}
      >
        <InputNumber<number>
          min={1}
          style={{ width: '100%' }}
          formatter={value => formatHourThreshold(value)}
          parser={value => {
            const parsed = parseFloat(value?.replace(/[^0-9.]/g, '') || '0');
            return parsed;
          }}
        />
      </Form.Item>

      <Form.Item
        label="Giá cơ bản"
        name="basePrice"
        rules={[{ required: true, message: 'Nhập giá cơ bản' }]}
      >
        <InputNumber<number>
          min={0}
          style={{ width: '100%' }}
          formatter={value => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '₫'}
          parser={value => parseFloat(value?.replace('₫', '').replace(/,/g, '') || '0')}
        />
      </Form.Item>

      <Form.Item
        label="Phụ phí mỗi giờ"
        name="overchargePerHour"
        rules={[{ required: true, message: 'Nhập phụ phí mỗi giờ' }]}
      >
        <InputNumber<number>
          min={0}
          style={{ width: '100%' }}
          formatter={value => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '₫'}
          parser={value => parseFloat(value?.replace('₫', '').replace(/,/g, '') || '0')}
        />
      </Form.Item>
    </Form>
  );
};

export default RoomTypeForm;