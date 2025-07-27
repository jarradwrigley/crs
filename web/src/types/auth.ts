import { ReactNode } from "react";

export interface Subscriptionaaaa {
  createdAt: string;
  deviceName: string;
  email: string;
  imei: string;
  phone: string;
  plan: string;
  price: number;
  queuePosition: string;
  status: string;
  updatedAt: string;
  user: string;
  _id: string;
}

export interface Subscription {
  _id: string;
  user: string;
  imei: string;
  deviceName: string;
  phone: string;
  email: string;
  plan: string;
  price: number;
  queuePosition: string;
  status: "PENDING" | "QUEUED" | "ACTIVE" | "EXPIRED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
  activatedAt?: string;
}

export interface TransactionMetadata {
  deviceInfo: {
    imei: string;
    deviceName: string;
  };
  submissionNotes: string;
  encryptionCards: string[];
  phoneNumber: string;
  email: string;
}

export interface TransactionSubscription {
  _id: string;
  imei: string;
  deviceName: string;
  plan: string;
  status: string;
}

export interface TransactionDevice {
  _id: string;
  imei: string;
  deviceName: string;
}

export interface Transaction {
  _id: string;
  user: string;
  transactionId: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  plan: string;
  paymentMethod: string;
  queuePosition: string;
  queuedAt?: string;
  initiatedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata: TransactionMetadata;
  subscription: TransactionSubscription;
  device: TransactionDevice;
  relatedTransactions: string[];
}

export interface User {
  accessToken: string;
  createdAt: string;
  email: string;
  refreshToken: string;
  updatedAt: string;
  username: string;
  _id: string;
  image: string;
  subscriptions: Subscription[];
  adminInfo: {
    employeeId: string;
    accessLevel: number;
    canApproveSubscriptions: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
    maxApprovalAmount: number;
  };
  devices: any[];
  emailVerificationExpires: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isOnline: boolean;
  lastLoginAt: string;
  lastSeen: string;
  role: string;
  stats: { messageCount: number; activeDevices: number };
  subscription: { status: string };
  // Add these new fields for transaction history
  transactionHistory: Transaction[];
  transactionStats: any[];
  totalSpent: number;
  completedTransactions: number;
}

export interface RegisterData {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  // confirmPassword: string;
  deviceName: string;
  imei: string;
  plan: string;
  files: File[];
}

export interface NewDeviceData {
  deviceName: string;
  imei: string;
  plan: string;
  phoneNumber: string;
  files: File[];
}

export interface NewSubscriptionData {
  imei: string;
  plan: string;
  files: File[];
}

export interface ActiveStatusResponse {
  success: boolean;
  data: {
    hasActiveSubscription: boolean;
    activeCount: number;
    activeSubscriptions: Array<{
      _id: string;
      imei: string;
      deviceName: string;
      plan: string;
      endDate: string;
      startDate: string;
    }>;
    message: string;
  };
}


export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean; // Add this new property
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  fetchUserData: () => Promise<void>; // Add this new method
  retrieveUserData: () => Promise<any>;
  checkOnboarding: (imei: string) => Promise<any>;
  setupDevice: (imei: string, deviceName: string) => Promise<any>;
  activateSubscription: (
    subscriptionId: string,
    totpCode: string,
    imei: string
  ) => Promise<any>;
  fetchOptionsById: (subscriptionId: string) => Promise<any>;
  checkEncryption: (ip: string) => Promise<any>;
  renewSubscription: (
    subscriptionId: string,
    newPlan: string,
    paymentMethod: string
  ) => Promise<any>;
  searchDevice: (debouncedSearchQuery: any) => Promise<any>;
  addNewDevice: (data: NewDeviceData) => Promise<any>;
  addSubscription: (data: NewSubscriptionData) => Promise<any>;
  checkActiveStatus: () => Promise<ActiveStatusResponse>;
}

export type DrawerRouteItem = {
  label: string;
  icon: ReactNode;
  path: string;
};
