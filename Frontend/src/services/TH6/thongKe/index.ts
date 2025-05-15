export const getStatistics = async (): Promise<App.Statistics> => {
  const data = localStorage.getItem('statistics');
  if (data) {
    return JSON.parse(data);
  }

  const mockData: App.Statistics = {
    totalItineraries: 10,
    popularDestinations: ['Hạ Long Bay', 'Sapa'],
    totalRevenue: 5000,
    categoryBreakdown: {
      travel: 2000,
      food: 1500,
      accommodation: 1500,
    },
  };

  localStorage.setItem('statistics', JSON.stringify(mockData));
  return mockData;
};