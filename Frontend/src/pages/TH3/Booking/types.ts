
export interface WorkingHours {
  startTime: string; // Format: "HH:mm" e.g. "09:00"
  endTime: string;   // Format: "HH:mm" e.g. "17:00"
}

export interface WorkSchedule {
  monday: WorkingHours | null;
  tuesday: WorkingHours | null;
  wednesday: WorkingHours | null;
  thursday: WorkingHours | null;
  friday: WorkingHours | null;
  saturday: WorkingHours | null;
  sunday: WorkingHours | null;
}


export interface Staff {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  avatar?: string;
  maxAppointmentsPerDay: number;
  workSchedule: WorkSchedule;
  services: string[];
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // min
  image?: string;
  isActive: boolean;
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  staffId: string;
  date: string; // Format: "YYYY-MM-DD"
  time: string; // Format: "HH:mm"
  status: AppointmentStatus;
  notes?: string;
  rating?: number; // 1-5 sao
  feedback?: string;
  staffResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  appointmentId: string;
  staffId: string;
  serviceId: string;
  rating: number; // 1-5 sao
  comment?: string;
  staffResponse?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageRating: number;
}