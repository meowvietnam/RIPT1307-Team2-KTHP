import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Alert, Button } from 'antd';
import { Pie } from '@ant-design/plots';
import { getBudgets, saveBudgets } from '@/services/TH6/nganSach';
import AddBudgetForm from './form';

const NganSach: React.FC = () => {
  const [budgets, setBudgets] = useState<App.Budget[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Lấy danh sách ngân sách từ localStorage
    const fetchBudgets = async () => {
      const data = await getBudgets();
      setBudgets(data);
    };
    fetchBudgets();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddBudget = async (newBudget: App.Budget) => {
    const updatedBudgets = [...budgets, newBudget];
    setBudgets(updatedBudgets);
    await saveBudgets(updatedBudgets); // Lưu vào localStorage
  };

  const handleDeleteBudget = async (id: string) => {
    const updatedBudgets = budgets.filter((budget) => budget.id !== id);
    setBudgets(updatedBudgets);
    await saveBudgets(updatedBudgets); // Lưu vào localStorage
  };

  const chartData = budgets.map((budget) => ({
    type: budget.category,
    value: budget.spent,
  }));

  const config = {
    appendPadding: 10,
    data: chartData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <div>
      <h1>Quản lý ngân sách</h1>
      <Button type="primary" onClick={showModal} style={{ marginBottom: '20px' }}>
        Thêm ngân sách
      </Button>
      <Row gutter={[16, 16]}>
        {budgets.map((budget) => (
          <Col key={budget.id} xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Card.Meta
                title={budget.category}
                description={`Đã chi: $${budget.spent} / $${budget.total}`}
              />
              <Progress
                percent={(budget.spent / budget.total) * 100}
                status={budget.spent > budget.total ? 'exception' : 'active'}
              />
              {budget.spent > budget.total && (
                <Alert message="Ngân sách đã vượt!" type="error" showIcon />
              )}
            </Card>
          </Col>
        ))}
      </Row>
      <h2>Phân bổ ngân sách</h2>
      <Pie {...config} />
      <AddBudgetForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleAddBudget}
      />
    </div>
  );
};

export default NganSach;