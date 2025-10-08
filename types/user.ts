// User types for the application
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'super_admin' | 'enterprise_admin' | 'dealership_admin' | 'user';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}