declare module App {
  // Interface cho điểm đến
  export interface Destination {
    id: string;
    name: string;
    type: 'beach' | 'mountain' | 'city';
    rating: number;
    cost: number;
    image: string;
    description: string;
  }

  // Interface cho lịch trình
  export interface Itinerary {
    id: string;
    name: string;
    date: string; // Ngày của lịch trình (YYYY-MM-DD)
    destinations: Destination[]; // Danh sách điểm đến trong lịch trình
    totalCost: number; // Tổng chi phí của lịch trình
    travelTime: number; // Tổng thời gian di chuyển giữa các điểm (giờ)
  }

  // Interface cho ngân sách
  export interface Budget {
    id: string;
    category: string; // Hạng mục ngân sách (ví dụ: Di chuyển, Ăn uống)
    total: number; // Tổng ngân sách
    spent: number; // Số tiền đã chi
  }

  // Interface cho thống kê
  export interface Statistics {
    totalItineraries: number; // Tổng số lịch trình đã tạo
    popularDestinations: string[]; // Danh sách các điểm đến phổ biến
    totalRevenue: number; // Tổng doanh thu
    categoryBreakdown: {
      [key: string]: number; // Phân bổ ngân sách theo hạng mục (ví dụ: travel, food)
    };
  }
}