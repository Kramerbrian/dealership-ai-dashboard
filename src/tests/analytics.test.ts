import request from 'supertest';
import app from '../server';
import jwt from 'jsonwebtoken';
import { UserRole, Permission } from '../types/auth.types';

// Mock JWT token for testing
const generateTestToken = (role: UserRole, dealershipId?: string) => {
  return jwt.sign(
    {
      userId: 'test-user',
      email: 'test@example.com',
      role,
      dealershipId,
      permissions: getPermissionsForRole(role)
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

const getPermissionsForRole = (role: UserRole): Permission[] => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return Object.values(Permission);
    case UserRole.DEALERSHIP_OWNER:
      return [
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_DETAILED_ANALYTICS,
        Permission.EXPORT_ANALYTICS,
        Permission.VIEW_SALES_DATA,
        Permission.VIEW_MARKETING_DATA
      ];
    case UserRole.VIEWER:
      return [Permission.VIEW_ANALYTICS];
    default:
      return [];
  }
};

describe('Analytics API Endpoints', () => {
  describe('GET /api/analytics/dealership/:dealershipId', () => {
    it('should return analytics for authorized user', async () => {
      const token = generateTestToken(UserRole.DEALERSHIP_OWNER, 'dealership-123');
      
      const response = await request(app)
        .get('/api/analytics/dealership/dealership-123')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dealershipId');
      expect(response.body.data).toHaveProperty('metrics');
    });

    it('should reject unauthorized access', async () => {
      const response = await request(app)
        .get('/api/analytics/dealership/dealership-123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('authentication');
    });

    it('should reject access to wrong dealership', async () => {
      const token = generateTestToken(UserRole.DEALERSHIP_OWNER, 'dealership-456');
      
      const response = await request(app)
        .get('/api/analytics/dealership/dealership-123')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should allow super admin to access any dealership', async () => {
      const token = generateTestToken(UserRole.SUPER_ADMIN);
      
      const response = await request(app)
        .get('/api/analytics/dealership/dealership-123')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/analytics/dealership/:dealershipId/ai-visibility', () => {
    it('should return AI visibility metrics', async () => {
      const token = generateTestToken(UserRole.DEALERSHIP_OWNER, 'dealership-123');
      
      const response = await request(app)
        .get('/api/analytics/dealership/dealership-123/ai-visibility')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('overallScore');
      expect(response.body.data).toHaveProperty('platformScores');
      expect(response.body.data.platformScores).toHaveProperty('chatgpt');
    });
  });

  describe('GET /api/analytics/dealership/:dealershipId/competitors', () => {
    it('should require detailed analytics permission', async () => {
      const viewerToken = generateTestToken(UserRole.VIEWER, 'dealership-123');
      
      const response = await request(app)
        .get('/api/analytics/dealership/dealership-123/competitors')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return competitor analysis for authorized user', async () => {
      const token = generateTestToken(UserRole.DEALERSHIP_OWNER, 'dealership-123');
      
      const response = await request(app)
        .get('/api/analytics/dealership/dealership-123/competitors')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('marketPosition');
      expect(response.body.data).toHaveProperty('topCompetitors');
    });
  });

  describe('POST /api/analytics/dealership/:dealershipId/export', () => {
    it('should export analytics data', async () => {
      const token = generateTestToken(UserRole.DEALERSHIP_OWNER, 'dealership-123');
      
      const response = await request(app)
        .post('/api/analytics/dealership/dealership-123/export')
        .set('Authorization', `Bearer ${token}`)
        .send({
          format: 'pdf',
          metrics: ['aiVisibility', 'sales'],
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('downloadUrl');
      expect(response.body.data).toHaveProperty('expiresAt');
    });

    it('should validate export format', async () => {
      const token = generateTestToken(UserRole.DEALERSHIP_OWNER, 'dealership-123');
      
      const response = await request(app)
        .post('/api/analytics/dealership/dealership-123/export')
        .set('Authorization', `Bearer ${token}`)
        .send({
          format: 'invalid-format',
          metrics: ['aiVisibility'],
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard for user with dealership', async () => {
      const token = generateTestToken(UserRole.SALES_MANAGER, 'dealership-123');
      
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('aiVisibility');
      expect(response.body.data).toHaveProperty('sales');
      expect(response.body.data).toHaveProperty('threats');
    });

    it('should fail for user without dealership', async () => {
      const token = generateTestToken(UserRole.SUPER_ADMIN);
      
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toContain('No dealership associated');
    });
  });
});

describe('Authentication', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@dealership.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('permissions');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@dealership.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      const token = generateTestToken(UserRole.DEALERSHIP_OWNER, 'dealership-123');
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('role');
      expect(response.body.data).toHaveProperty('permissions');
    });
  });
});

export {};