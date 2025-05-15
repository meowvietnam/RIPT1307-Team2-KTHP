export const getDestinations = async (): Promise<App.Destination[]> => {
  const data = localStorage.getItem('destinations');
  if (data) {
    return JSON.parse(data);
  }

  const mockData: App.Destination[] = [
    {
      id: '1',
      name: 'Hạ Long Bay',
      type: 'beach',
      rating: 4.8,
      cost: 200,
      image: '/assets/halong.jpg',
      description: 'Vịnh Hạ Long là một trong những kỳ quan thiên nhiên thế giới.',
    },
  ];

  localStorage.setItem('destinations', JSON.stringify(mockData));
  return mockData;
};

export const saveDestinations = async (destinations: App.Destination[]): Promise<void> => {
  localStorage.setItem('destinations', JSON.stringify(destinations));
};