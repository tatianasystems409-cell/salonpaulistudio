/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  imageUrl: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  userId?: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  createdAt: any;
  updatedAt: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  imageUrl?: string;
  lastUpdated: string;
}

export interface Admin {
  uid: string;
  email: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export interface Rating {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: any;
}
