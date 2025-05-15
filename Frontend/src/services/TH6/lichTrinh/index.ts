export const getItineraries = async (): Promise<App.Itinerary[]> => {
  const data = localStorage.getItem('itineraries');
  if (data) {
    return JSON.parse(data);
  }

  const mockData: App.Itinerary[] = [
    {
      id: 'it1',
      name: 'Lịch trình Hà Nội - Sapa',
      date: '2025-05-10',
      totalCost: 500,
      destinations: [
        { id: 'd1', name: 'Hà Nội', type: 'city', rating: 4.5, cost: 100, image: 'hanoi.jpg', description: 'The capital city of Vietnam' },
        { id: 'd2', name: 'Sapa', type: 'mountain', rating: 4.7, cost: 150, image: 'sapa.jpg', description: 'A mountainous town in northern Vietnam' },
      ],
      travelTime: 3,
    },
  ];

  localStorage.setItem('itineraries', JSON.stringify(mockData));
  return mockData;
};

export const saveItineraries = async (itineraries: App.Itinerary[]): Promise<void> => {
  localStorage.setItem('itineraries', JSON.stringify(itineraries));
};