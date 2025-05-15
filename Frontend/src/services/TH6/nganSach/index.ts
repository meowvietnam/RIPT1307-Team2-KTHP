export const getBudgets = async (): Promise<App.Budget[]> => {
  const data = localStorage.getItem('budgets');
  if (data) {
    return JSON.parse(data);
  }

  const mockData: App.Budget[] = [
    {
      id: 'bg1',
      category: 'Di chuyển',
      total: 1000,
      spent: 200,
    },
  ];

  localStorage.setItem('budgets', JSON.stringify(mockData));
  return mockData;
};

export const saveBudgets = async (budgets: App.Budget[]): Promise<void> => {
  localStorage.setItem('budgets', JSON.stringify(budgets));
};