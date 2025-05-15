import React from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';

interface AddBudgetFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (budget: App.Budget) => void;
}

const AddBudgetForm: React.FC<AddBudgetFormProps> = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const newBudget: App.Budget = {
      id: `bg${Date.now()}`,
      category: values.category,
      total: values.total,
      spent: 0, // Giá trị mặc định
    };

    onSubmit(newBudget);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Thêm ngân sách"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Hạng mục"
          name="category"
          rules={[{ required: true, message: 'Vui lòng nhập hạng mục!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Tổng ngân sách"
          name="total"
          rules={[{ required: true, message: 'Vui lòng nhập tổng ngân sách!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm ngân sách
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddBudgetForm;