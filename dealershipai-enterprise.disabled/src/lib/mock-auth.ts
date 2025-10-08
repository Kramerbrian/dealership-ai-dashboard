/**
 * Mock Authentication System
 * Use this when Clerk is not available or for testing
 */

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    type: 'single' | 'dealership' | 'enterprise';
  };
}

// Mock user data
const mockUsers: MockUser[] = [
  {
    id: 'mock-user-1',
    email: 'admin@dealershipai.com',
    firstName: 'Demo',
    lastName: 'Admin',
    role: 'dealership_admin',
    tenantId: 'mock-tenant-1',
    tenant: {
      id: 'mock-tenant-1',
      name: 'Premium Auto Dealership',
      type: 'dealership'
    }
  },
  {
    id: 'mock-user-2',
    email: 'user@dealershipai.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    tenantId: 'mock-tenant-1',
    tenant: {
      id: 'mock-tenant-1',
      name: 'Premium Auto Dealership',
      type: 'dealership'
    }
  }
];

export class MockAuth {
  private static currentUser: MockUser | null = null;
  private static isSignedIn = false;

  static signIn(email: string, password: string): Promise<MockUser> {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        if (user && password === 'demo123') {
          this.currentUser = user;
          this.isSignedIn = true;
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  static signUp(email: string, password: string, firstName: string, lastName: string): Promise<MockUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mockUsers.find(u => u.email === email)) {
          reject(new Error('User already exists'));
          return;
        }

        const newUser: MockUser = {
          id: `mock-user-${Date.now()}`,
          email,
          firstName,
          lastName,
          role: 'user',
          tenantId: 'mock-tenant-1',
          tenant: {
            id: 'mock-tenant-1',
            name: 'Premium Auto Dealership',
            type: 'dealership'
          }
        };

        mockUsers.push(newUser);
        this.currentUser = newUser;
        this.isSignedIn = true;
        resolve(newUser);
      }, 1000);
    });
  }

  static signOut(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        this.isSignedIn = false;
        resolve();
      }, 500);
    });
  }

  static getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  static isAuthenticated(): boolean {
    return this.isSignedIn;
  }

  static getMockUsers(): MockUser[] {
    return mockUsers;
  }
}

// Export for use in components
export const mockAuth = MockAuth;
