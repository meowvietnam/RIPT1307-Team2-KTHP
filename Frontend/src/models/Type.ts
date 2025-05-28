export interface Room {
  roomid: number;
  roomname: string;
  roomtype: string;
  price: number;
  status: 'Đang trống' | 'Đã cho thuê' | 'Đang dọn dẹp';
  description?: string;
  RoomServices?: RoomService[];
}

export type RoomService = {
  RoomServiceID: number;
  RoomID: number;
  Room: Room;
  ServiceID: number;
  Service: Service;
  Quanity: number;
  StartTime: string;
  IsCheckedOut: boolean;
  EndTime?: string;
  History?: History;
};

export type ServiceType = 'Food' | 'Drink' | 'Room_Hourly' | 'Room_Overnight';

export interface Service {
  ServiceID: number;
  ServiceName: string;
  Price: number;
  ServiceType: ServiceType;
}

export interface History {
  historyid: number;
  roomid: number;
  room: Room;
  userid: number;
  user?: User;
  roomservices: RoomService[];
  totalprice: number;
  starttime: string;   // ISO format (DateTime)
  endtime?: string | null;
}

export interface User{
  UserID: number;
  Username: string;
  Password: string;
  FullName: string;
  Email: string;
  Role: string;
}