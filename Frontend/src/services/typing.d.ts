export interface Room {
  roomID: number;
  roomName: string;
  baseRoomType: 'Single'| 'Double'; // Keep as is, or expand if more base types exist
  price: number;
  // Make sure this list includes ALL possible statuses your rooms can have.
  status: 'Available' | 'In Use'| 'Being Cleaned' | 'Checked Out';
  description?: string;
  roomTypeID: number | null;
  roomType?: RoomType | null;
}

export interface RoomType {
  roomTypeID: number;
  typeName: string;
  hourThreshold: number;
  overchargePerHour: number;
  basePrice: number;
 // rooms?: Room[];
}

export type RoomService = {
  roomServiceID: number;
  roomID: number;
  room: Room;
  serviceID: number;
  service: Service;
  quantity: number;
  history?: History;
  
};

export type ServiceType = 'Food' | 'Drink';

export interface Service {
  serviceID: number;
  serviceName: string;
  price: number;
  serviceType: ServiceType;
}

export interface History {
  numberPhoneCustomer: string;
  nameCustomer: string;
  idCustomer: string;
  historyID: number;
  roomID: number;
  room: Room;
  userID: number;
  user?: User;
  roomServices: RoomService[];
  totalPrice: number;
  startTime: string | null;
  endTime?: string | null;
  isCheckOut?: boolean;
}

export interface User{
  userID: number;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: string;
}

interface Request {
  requestID: number;
  userID: number;
  title: string;
  content: string;
  status: 'Pending' | 'Accept' | 'Reject';
  user?: User;
}