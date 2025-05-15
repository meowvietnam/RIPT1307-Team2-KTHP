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
    {
      id: '2',
      name: 'Sapa',
      type: 'mountain',
      rating: 4.5,
      cost: 150,
      image: '/assets/sapa.jpg',
      description: 'Sapa nổi tiếng với cảnh đẹp núi rừng và văn hóa dân tộc.',
    },
  ];

  localStorage.setItem('destinations', JSON.stringify(mockData));
  return mockData;
};
