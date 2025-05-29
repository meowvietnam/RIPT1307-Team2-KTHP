export interface Room {
  roomid: number;
  roomname: string;
  baseroomtype: 'Phòng đơn' | 'Phòng đôi';
  price: number;
  status: 'Đang trống' | 'Đã cho thuê' | 'Đang dọn dẹp';
  description?: string;
  RoomServices?: RoomService[];
  RoomTypeID: number;  
  RoomType?: RoomType; 
}

export interface RoomType {
  RoomTypeID: number;
  TypeName: 'Theo giờ' | 'Theo ngày' | 'Qua đêm';
  HourThreshold: number;
  OverchargePerHour: number;
  Rooms?: Room[];
}

export type RoomService = {
  RoomServiceID: number;
  RoomID: number;
  Room: Room;
  ServiceID: number;
  Service: Service;
  Quanity: number;
  StartTime: string;
  EndTime?: string;
  History?: History;
};

export type ServiceType = 'Food' | 'Drink';

export interface Service {
  ServiceID: number;
  ServiceName: string;
  Price: number;
  ServiceType: ServiceType;
}

export interface History {
  PhoneCustomer: string;
  FullNameCustomer: string;
  IDCustomer: string;
  historyid: number;
  roomid: number;
  room: Room;
  userid: number;
  user?: User;
  roomservices: RoomService[];
  totalprice: number;
  starttime: string | null;
  endtime?: string | null;
  isCheckedOut?: boolean;
}

export interface User{
  UserID: number;
  Username: string;
  Password: string;
  FullName: string;
  Email: string;
  Role: string;
}