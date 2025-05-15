export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date'
}

export interface CertificateRegister {
  id: string;
  year: number;
  name: string;
  description?: string;
  currentNumber: number; // Starting number for new certificates
  createdAt: string;
  updatedAt: string;
}

export interface GraduationDecision {
  id: string;
  decisionNumber: string;
  issueDate: string;
  excerpt: string;
  registerId: string; // Reference to Certificate Register
  registerName?: string; // For display purposes
  lookupCount: number; // Track lookup count
  createdAt: string;
  updatedAt: string;
}

export interface TemplateField {
  id: string;
  name: string; // Technical name
  displayName: string; // Display name
  type: FieldType;
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  registerNumber: number; // Auto-generated
  certificateNumber: string;
  studentId: string;
  fullName: string;
  birthDate: string;
  decisionId: string;
  decisionNumber?: string;
  templateValues: { [key: string]: string | number | Date };
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  certificateNumber?: string;
  registerNumber?: string;
  studentId?: string;
  fullName?: string;
  birthDate?: string;
}