// White-Label Partner Program
// Reseller program for agencies and consultants

interface Partner {
  id: string;
  name: string;
  type: 'agency' | 'consultant' | 'vendor' | 'reseller';
  email: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  revenueShare: number; // percentage
  monthlyQuota: number;
  currentClients: number;
  totalRevenue: number;
  status: 'active' | 'suspended' | 'pending';
  branding: PartnerBranding;
  features: PartnerFeatures;
  createdAt: Date;
  lastActivity: Date;
}

interface PartnerBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  domain: string; // partner.dealershipai.com
  customCss?: string;
  favicon?: string;
}

interface PartnerFeatures {
  whiteLabel: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  clientManagement: boolean;
  reporting: boolean;
  support: 'email' | 'phone' | 'dedicated';
  maxClients: number;
  customIntegrations: boolean;
}

interface Client {
  id: string;
  partnerId: string;
  name: string;
  domain: string;
  tier: string;
  status: 'active' | 'inactive' | 'trial';
  monthlyRevenue: number;
  createdAt: Date;
  lastActivity: Date;
}

interface PartnerCommission {
  id: string;
  partnerId: string;
  clientId: string;
  amount: number;
  percentage: number;
  period: string; // YYYY-MM
  status: 'pending' | 'paid' | 'disputed';
  paidAt?: Date;
}

interface PartnerDashboard {
  overview: {
    totalClients: number;
    activeClients: number;
    monthlyRevenue: number;
    totalCommissions: number;
    pendingCommissions: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
  topClients: Array<{
    name: string;
    revenue: number;
    status: string;
  }>;
  performance: {
    clientGrowth: number;
    revenueGrowth: number;
    quotaProgress: number;
  };
}

export class WhiteLabelPartnerProgram {
  private redis: any;
  private prisma: any;

  constructor(redis: any, prisma: any) {
    this.redis = redis;
    this.prisma = prisma;
  }

  // Create new partner
  async createPartner(partnerData: Omit<Partner, 'id' | 'createdAt' | 'lastActivity'>): Promise<Partner> {
    try {
      // Generate partner ID
      const partnerId = `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create partner record
      const partner = await this.prisma.partner.create({
        data: {
          id: partnerId,
          ...partnerData,
          createdAt: new Date(),
          lastActivity: new Date()
        }
      });

      // Set up partner dashboard
      await this.setupPartnerDashboard(partnerId);

      // Send welcome email
      await this.sendWelcomeEmail(partner);

      return partner;

    } catch (error) {
      console.error('Create partner error:', error);
      throw error;
    }
  }

  // Get partner dashboard
  async getPartnerDashboard(partnerId: string): Promise<PartnerDashboard> {
    try {
      // Check cache first
      const cacheKey = `partner_dashboard:${partnerId}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get partner data
      const partner = await this.prisma.partner.findUnique({
        where: { id: partnerId },
        include: {
          clients: true,
          commissions: {
            where: {
              status: { in: ['pending', 'paid'] }
            }
          }
        }
      });

      if (!partner) {
        throw new Error('Partner not found');
      }

      // Calculate dashboard metrics
      const dashboard = await this.calculateDashboardMetrics(partner);

      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(dashboard));

      return dashboard;

    } catch (error) {
      console.error('Get partner dashboard error:', error);
      throw error;
    }
  }

  // Add client to partner
  async addClient(partnerId: string, clientData: Omit<Client, 'id' | 'partnerId' | 'createdAt' | 'lastActivity'>): Promise<Client> {
    try {
      // Check partner quota
      const partner = await this.prisma.partner.findUnique({
        where: { id: partnerId },
        include: { clients: true }
      });

      if (!partner) {
        throw new Error('Partner not found');
      }

      if (partner.clients.length >= partner.features.maxClients) {
        throw new Error('Partner has reached client quota');
      }

      // Create client
      const client = await this.prisma.client.create({
        data: {
          ...clientData,
          partnerId,
          createdAt: new Date(),
          lastActivity: new Date()
        }
      });

      // Update partner activity
      await this.updatePartnerActivity(partnerId);

      // Send notification
      await this.notifyPartnerNewClient(partnerId, client);

      return client;

    } catch (error) {
      console.error('Add client error:', error);
      throw error;
    }
  }

  // Calculate commission
  async calculateCommission(partnerId: string, clientId: string, revenue: number): Promise<PartnerCommission> {
    try {
      const partner = await this.prisma.partner.findUnique({
        where: { id: partnerId }
      });

      if (!partner) {
        throw new Error('Partner not found');
      }

      const commissionAmount = revenue * (partner.revenueShare / 100);
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM

      const commission = await this.prisma.partnerCommission.create({
        data: {
          partnerId,
          clientId,
          amount: commissionAmount,
          percentage: partner.revenueShare,
          period,
          status: 'pending'
        }
      });

      return commission;

    } catch (error) {
      console.error('Calculate commission error:', error);
      throw error;
    }
  }

  // Get partner clients
  async getPartnerClients(partnerId: string): Promise<Client[]> {
    try {
      return await this.prisma.client.findMany({
        where: { partnerId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Get partner clients error:', error);
      return [];
    }
  }

  // Get partner commissions
  async getPartnerCommissions(partnerId: string, limit: number = 50): Promise<PartnerCommission[]> {
    try {
      return await this.prisma.partnerCommission.findMany({
        where: { partnerId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Get partner commissions error:', error);
      return [];
    }
  }

  // Update partner branding
  async updatePartnerBranding(partnerId: string, branding: Partial<PartnerBranding>): Promise<void> {
    try {
      await this.prisma.partner.update({
        where: { id: partnerId },
        data: { branding }
      });

      // Clear cache
      await this.redis.del(`partner_dashboard:${partnerId}`);

    } catch (error) {
      console.error('Update partner branding error:', error);
      throw error;
    }
  }

  // Generate partner report
  async generatePartnerReport(partnerId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const partner = await this.prisma.partner.findUnique({
        where: { id: partnerId },
        include: {
          clients: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          },
          commissions: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      });

      if (!partner) {
        throw new Error('Partner not found');
      }

      const report = {
        partner: {
          name: partner.name,
          tier: partner.tier,
          revenueShare: partner.revenueShare
        },
        period: {
          start: startDate,
          end: endDate
        },
        metrics: {
          newClients: partner.clients.length,
          totalRevenue: partner.commissions.reduce((sum: number, c: any) => sum + c.amount, 0),
          averageClientValue: partner.clients.length > 0
            ? partner.commissions.reduce((sum: number, c: any) => sum + c.amount, 0) / partner.clients.length
            : 0,
          commissionEarned: partner.commissions
            .filter((c: any) => c.status === 'paid')
            .reduce((sum: number, c: any) => sum + c.amount, 0)
        },
        clients: partner.clients.map((client: any) => ({
          name: client.name,
          domain: client.domain,
          tier: client.tier,
          revenue: client.monthlyRevenue,
          status: client.status
        })),
        commissions: partner.commissions.map((commission: any) => ({
          clientId: commission.clientId,
          amount: commission.amount,
          percentage: commission.percentage,
          period: commission.period,
          status: commission.status
        }))
      };

      return report;

    } catch (error) {
      console.error('Generate partner report error:', error);
      throw error;
    }
  }

  // Private helper methods
  private async setupPartnerDashboard(partnerId: string): Promise<void> {
    // Initialize partner dashboard with default settings
    await this.redis.setex(`partner_dashboard:${partnerId}`, 3600, JSON.stringify({
      overview: {
        totalClients: 0,
        activeClients: 0,
        monthlyRevenue: 0,
        totalCommissions: 0,
        pendingCommissions: 0
      },
      recentActivity: [],
      topClients: [],
      performance: {
        clientGrowth: 0,
        revenueGrowth: 0,
        quotaProgress: 0
      }
    }));
  }

  private async calculateDashboardMetrics(partner: any): Promise<PartnerDashboard> {
    const activeClients = partner.clients.filter((c: any) => c.status === 'active').length;
    const monthlyRevenue = partner.clients.reduce((sum: number, c: any) => sum + c.monthlyRevenue, 0);
    const totalCommissions = partner.commissions.reduce((sum: number, c: any) => sum + c.amount, 0);
    const pendingCommissions = partner.commissions
      .filter((c: any) => c.status === 'pending')
      .reduce((sum: number, c: any) => sum + c.amount, 0);

    return {
      overview: {
        totalClients: partner.clients.length,
        activeClients,
        monthlyRevenue,
        totalCommissions,
        pendingCommissions
      },
      recentActivity: [
        {
          type: 'client_added',
          description: 'New client added to portfolio',
          timestamp: new Date()
        }
      ],
      topClients: partner.clients
        .sort((a: any, b: any) => b.monthlyRevenue - a.monthlyRevenue)
        .slice(0, 5)
        .map((c: any) => ({
          name: c.name,
          revenue: c.monthlyRevenue,
          status: c.status
        })),
      performance: {
        clientGrowth: 0, // Would calculate from historical data
        revenueGrowth: 0, // Would calculate from historical data
        quotaProgress: (partner.clients.length / partner.monthlyQuota) * 100
      }
    };
  }

  private async sendWelcomeEmail(partner: Partner): Promise<void> {
    // In production, this would send an actual email
    console.log(`Welcome email sent to partner: ${partner.email}`);
  }

  private async updatePartnerActivity(partnerId: string): Promise<void> {
    await this.prisma.partner.update({
      where: { id: partnerId },
      data: { lastActivity: new Date() }
    });
  }

  private async notifyPartnerNewClient(partnerId: string, client: Client): Promise<void> {
    // In production, this would send a notification
    console.log(`Partner ${partnerId} notified of new client: ${client.name}`);
  }
}
