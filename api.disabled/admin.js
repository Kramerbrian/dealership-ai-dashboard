const express = require('express');
const router = express.Router();

// Mock data for demonstration
const mockData = {
    users: [
        {
            id: 1,
            name: 'John Smith',
            email: 'john@dealership.com',
            plan: 'pro',
            status: 'active',
            joined: '2024-01-15',
            lastActive: '2024-02-20',
            analysesCount: 12
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah@autodealer.com',
            plan: 'premium',
            status: 'active',
            joined: '2024-01-20',
            lastActive: '2024-02-19',
            analysesCount: 8
        },
        {
            id: 3,
            name: 'Mike Wilson',
            email: 'mike@carsales.com',
            plan: 'basic',
            status: 'pending',
            joined: '2024-02-01',
            lastActive: '2024-02-15',
            analysesCount: 1
        }
    ],
    subscriptions: [
        {
            id: 1,
            customerId: 1,
            customerName: 'John Smith',
            plan: 'Pro Tier',
            status: 'active',
            amount: 599.00,
            nextBilling: '2024-03-15',
            createdAt: '2024-01-15'
        },
        {
            id: 2,
            customerId: 2,
            customerName: 'Sarah Johnson',
            plan: 'Premium+',
            status: 'active',
            amount: 999.00,
            nextBilling: '2024-03-20',
            createdAt: '2024-01-20'
        }
    ],
    analyses: [
        {
            id: 1,
            dealership: 'Smith Auto Group',
            url: 'smithauto.com',
            aiScore: 87,
            status: 'completed',
            createdAt: '2024-02-15',
            userId: 1
        },
        {
            id: 2,
            dealership: 'Johnson Motors',
            url: 'johnsonmotors.com',
            aiScore: 92,
            status: 'completed',
            createdAt: '2024-02-18',
            userId: 2
        }
    ],
    payments: [
        {
            id: 1,
            customerId: 1,
            customerName: 'John Smith',
            amount: 599.00,
            status: 'succeeded',
            date: '2024-02-15',
            transactionId: 'pi_1234567890'
        },
        {
            id: 2,
            customerId: 2,
            customerName: 'Sarah Johnson',
            amount: 999.00,
            status: 'succeeded',
            date: '2024-02-20',
            transactionId: 'pi_0987654321'
        }
    ]
};

// Get dashboard overview stats
router.get('/overview', async (req, res) => {
    try {
        const stats = {
            totalUsers: mockData.users.length,
            activeSubscriptions: mockData.subscriptions.filter(s => s.status === 'active').length,
            monthlyRevenue: mockData.subscriptions
                .filter(s => s.status === 'active')
                .reduce((sum, s) => sum + s.amount, 0),
            analysesCompleted: mockData.analyses.filter(a => a.status === 'completed').length,
            revenueGrowth: 15.2,
            userGrowth: 12.8,
            analysisGrowth: 23.1
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching overview stats:', error);
        res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, plan } = req.query;
        
        let filteredUsers = [...mockData.users];
        
        if (status) {
            filteredUsers = filteredUsers.filter(user => user.status === status);
        }
        
        if (plan) {
            filteredUsers = filteredUsers.filter(user => user.plan === plan);
        }
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        res.json({
            users: paginatedUsers,
            total: filteredUsers.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredUsers.length / limit)
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = mockData.users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userIndex = mockData.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { name, email, plan, status } = req.body;
        
        mockData.users[userIndex] = {
            ...mockData.users[userIndex],
            name: name || mockData.users[userIndex].name,
            email: email || mockData.users[userIndex].email,
            plan: plan || mockData.users[userIndex].plan,
            status: status || mockData.users[userIndex].status
        };
        
        res.json(mockData.users[userIndex]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Get all subscriptions
router.get('/subscriptions', async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        let filteredSubscriptions = [...mockData.subscriptions];
        
        if (status) {
            filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === status);
        }
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);
        
        res.json({
            subscriptions: paginatedSubscriptions,
            total: filteredSubscriptions.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredSubscriptions.length / limit)
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Get all analyses
router.get('/analyses', async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        let filteredAnalyses = [...mockData.analyses];
        
        if (status) {
            filteredAnalyses = filteredAnalyses.filter(analysis => analysis.status === status);
        }
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedAnalyses = filteredAnalyses.slice(startIndex, endIndex);
        
        res.json({
            analyses: paginatedAnalyses,
            total: filteredAnalyses.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredAnalyses.length / limit)
        });
    } catch (error) {
        console.error('Error fetching analyses:', error);
        res.status(500).json({ error: 'Failed to fetch analyses' });
    }
});

// Get all payments
router.get('/payments', async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        let filteredPayments = [...mockData.payments];
        
        if (status) {
            filteredPayments = filteredPayments.filter(payment => payment.status === status);
        }
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
        
        res.json({
            payments: paginatedPayments,
            total: filteredPayments.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredPayments.length / limit)
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Get revenue analytics
router.get('/analytics/revenue', async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        // Mock revenue data for different periods
        const revenueData = {
            '7d': [
                { date: '2024-02-14', revenue: 1200 },
                { date: '2024-02-15', revenue: 1500 },
                { date: '2024-02-16', revenue: 1800 },
                { date: '2024-02-17', revenue: 1400 },
                { date: '2024-02-18', revenue: 1600 },
                { date: '2024-02-19', revenue: 1900 },
                { date: '2024-02-20', revenue: 1700 }
            ],
            '30d': [
                { date: '2024-01-21', revenue: 12000 },
                { date: '2024-01-28', revenue: 15000 },
                { date: '2024-02-04', revenue: 18000 },
                { date: '2024-02-11', revenue: 14000 },
                { date: '2024-02-18', revenue: 16000 }
            ]
        };
        
        res.json(revenueData[period] || revenueData['30d']);
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        res.status(500).json({ error: 'Failed to fetch revenue analytics' });
    }
});

// Get user growth analytics
router.get('/analytics/users', async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        // Mock user growth data
        const userGrowthData = {
            '7d': [
                { date: '2024-02-14', users: 1200 },
                { date: '2024-02-15', users: 1210 },
                { date: '2024-02-16', users: 1225 },
                { date: '2024-02-17', users: 1230 },
                { date: '2024-02-18', users: 1240 },
                { date: '2024-02-19', users: 1245 },
                { date: '2024-02-20', users: 1247 }
            ],
            '30d': [
                { date: '2024-01-21', users: 1000 },
                { date: '2024-01-28', users: 1050 },
                { date: '2024-02-04', users: 1100 },
                { date: '2024-02-11', users: 1150 },
                { date: '2024-02-18', users: 1200 }
            ]
        };
        
        res.json(userGrowthData[period] || userGrowthData['30d']);
    } catch (error) {
        console.error('Error fetching user growth analytics:', error);
        res.status(500).json({ error: 'Failed to fetch user growth analytics' });
    }
});

// Get system settings
router.get('/settings', async (req, res) => {
    try {
        const settings = {
            rateLimit: 100,
            analysisTimeout: 300,
            emailNotifications: true,
            maintenanceMode: false,
            apiVersion: '1.0.0',
            lastUpdated: '2024-02-20T10:30:00Z'
        };
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update system settings
router.put('/settings', async (req, res) => {
    try {
        const { rateLimit, analysisTimeout, emailNotifications, maintenanceMode } = req.body;
        
        // In a real application, you would save these to a database
        const updatedSettings = {
            rateLimit: rateLimit || 100,
            analysisTimeout: analysisTimeout || 300,
            emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
            maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false,
            lastUpdated: new Date().toISOString()
        };
        
        res.json(updatedSettings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Export data
router.get('/export/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'json' } = req.query;
        
        let data;
        let filename;
        
        switch (type) {
            case 'users':
                data = mockData.users;
                filename = 'users';
                break;
            case 'subscriptions':
                data = mockData.subscriptions;
                filename = 'subscriptions';
                break;
            case 'analyses':
                data = mockData.analyses;
                filename = 'analyses';
                break;
            case 'payments':
                data = mockData.payments;
                filename = 'payments';
                break;
            default:
                return res.status(400).json({ error: 'Invalid export type' });
        }
        
        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
            res.send(csv);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
            res.json(data);
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

module.exports = router;
