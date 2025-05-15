export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Club {
  id: string;
  name: string;
  foundingDate: string;
  description: string;
  chairman: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  strengths: string;
  clubId: string;
  reason: string;
  status: ApplicationStatus;
  rejectReason?: string;
  history?: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  timestamp: string;
  action: string;
  user: string;
  reason?: string;
}

export interface Stats {
  totalClubs: number;
  activeClubs: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}