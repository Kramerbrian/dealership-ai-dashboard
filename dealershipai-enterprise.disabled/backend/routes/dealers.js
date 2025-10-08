const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

// Get all dealers for a tenant
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { page = 1, limit = 20, search } = req.query;

    // Check cache first
    const cacheKey = `dealers_${tenantId}_${page}_${limit}_${search || 'all'}`;
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    // Mock dealers data - in production, this would come from database
    const mockDealers = [
      {
        id: 'dealer_001',
        name: 'Premier Auto Group',
        domain: 'premierautogroup.com',
        city: 'Naples',
        state: 'FL',
        tier: 1,
        aiv: 89,
        revenue: 125000,
        establishedDate: '2018-03-15',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'dealer_002',
        name: 'Elite Motors',
        domain: 'elitemotors.com',
        city: 'Fort Myers',
        state: 'FL',
        tier: 2,
        aiv: 87,
        revenue: 98000,
        establishedDate: '2019-07-22',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'dealer_003',
        name: 'Metro Car Center',
        domain: 'metrocarcenter.com',
        city: 'Cape Coral',
        state: 'FL',
        tier: 1,
        aiv: 85,
        revenue: 87000,
        establishedDate: '2020-01-10',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'dealer_004',
        name: 'Sunshine Auto Sales',
        domain: 'sunshineautosales.com',
        city: 'Bonita Springs',
        state: 'FL',
        tier: 3,
        aiv: 78,
        revenue: 65000,
        establishedDate: '2021-05-08',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'dealer_005',
        name: 'Gulf Coast Motors',
        domain: 'gulfcoastmotors.com',
        city: 'Estero',
        state: 'FL',
        tier: 2,
        aiv: 82,
        revenue: 72000,
        establishedDate: '2017-11-30',
        lastUpdated: new Date().toISOString()
      }
    ];

    // Apply search filter if provided
    let filteredDealers = mockDealers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDealers = mockDealers.filter(dealer => 
        dealer.name.toLowerCase().includes(searchLower) ||
        dealer.domain.toLowerCase().includes(searchLower) ||
        dealer.city.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDealers = filteredDealers.slice(startIndex, endIndex);

    const response = {
      dealers: paginatedDealers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredDealers.length,
        totalPages: Math.ceil(filteredDealers.length / limit),
        hasNext: endIndex < filteredDealers.length,
        hasPrev: page > 1
      },
      summary: {
        totalDealers: filteredDealers.length,
        averageAIV: Math.round(filteredDealers.reduce((sum, d) => sum + d.aiv, 0) / filteredDealers.length),
        totalRevenue: filteredDealers.reduce((sum, d) => sum + d.revenue, 0),
        tierDistribution: {
          tier1: filteredDealers.filter(d => d.tier === 1).length,
          tier2: filteredDealers.filter(d => d.tier === 2).length,
          tier3: filteredDealers.filter(d => d.tier === 3).length
        }
      }
    };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({
      error: 'Failed to fetch dealers',
      message: error.message
    });
  }
});

// Get specific dealer details
router.get('/:tenantId/:dealerId', async (req, res) => {
  try {
    const { tenantId, dealerId } = req.params;

    // Check cache first
    const cacheKey = `dealer_${tenantId}_${dealerId}`;
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    // Mock detailed dealer data
    const dealerDetails = {
      id: dealerId,
      tenantId,
      name: 'Premier Auto Group',
      domain: 'premierautogroup.com',
      city: 'Naples',
      state: 'FL',
      zipCode: '34102',
      phone: '(239) 555-0123',
      email: 'info@premierautogroup.com',
      tier: 1,
      establishedDate: '2018-03-15',
      website: {
        url: 'https://premierautogroup.com',
        ssl: true,
        mobileFriendly: true,
        pageSpeed: 85,
        coreWebVitals: {
          lcp: 2.1,
          fid: 45,
          cls: 0.05
        }
      },
      socialMedia: {
        facebook: 'https://facebook.com/premierautogroup',
        instagram: 'https://instagram.com/premierautogroup',
        google: 'https://g.page/premierautogroup'
      },
      businessHours: {
        monday: '9:00 AM - 7:00 PM',
        tuesday: '9:00 AM - 7:00 PM',
        wednesday: '9:00 AM - 7:00 PM',
        thursday: '9:00 AM - 7:00 PM',
        friday: '9:00 AM - 7:00 PM',
        saturday: '9:00 AM - 6:00 PM',
        sunday: 'Closed'
      },
      services: [
        'New Car Sales',
        'Used Car Sales',
        'Auto Financing',
        'Trade-in Appraisals',
        'Service & Maintenance',
        'Parts & Accessories'
      ],
      brands: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'],
      metrics: {
        aiv: 89,
        revenue: 125000,
        monthlyTraffic: 45000,
        conversionRate: 3.2,
        averageDealSize: 28500,
        inventoryCount: 150
      },
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, dealerDetails);
    res.json(dealerDetails);
  } catch (error) {
    console.error('Error fetching dealer details:', error);
    res.status(500).json({
      error: 'Failed to fetch dealer details',
      message: error.message
    });
  }
});

// Create new dealer
router.post('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const dealerData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'domain', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !dealerData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // Create new dealer
    const newDealer = {
      id: `dealer_${Date.now()}`,
      tenantId,
      ...dealerData,
      tier: dealerData.tier || 3,
      aiv: 0, // Will be calculated
      revenue: 0,
      establishedDate: dealerData.establishedDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // In production, this would save to database
    console.log('Creating new dealer:', newDealer);

    res.status(201).json({
      message: 'Dealer created successfully',
      dealer: newDealer
    });
  } catch (error) {
    console.error('Error creating dealer:', error);
    res.status(500).json({
      error: 'Failed to create dealer',
      message: error.message
    });
  }
});

// Update dealer
router.put('/:tenantId/:dealerId', async (req, res) => {
  try {
    const { tenantId, dealerId } = req.params;
    const updateData = req.body;

    // Mock update - in production, this would update database
    const updatedDealer = {
      id: dealerId,
      tenantId,
      ...updateData,
      lastUpdated: new Date().toISOString()
    };

    // Clear cache for this dealer
    cache.del(`dealer_${tenantId}_${dealerId}`);

    res.json({
      message: 'Dealer updated successfully',
      dealer: updatedDealer
    });
  } catch (error) {
    console.error('Error updating dealer:', error);
    res.status(500).json({
      error: 'Failed to update dealer',
      message: error.message
    });
  }
});

// Delete dealer
router.delete('/:tenantId/:dealerId', async (req, res) => {
  try {
    const { tenantId, dealerId } = req.params;

    // Mock deletion - in production, this would delete from database
    console.log(`Deleting dealer ${dealerId} for tenant ${tenantId}`);

    // Clear cache
    cache.del(`dealer_${tenantId}_${dealerId}`);

    res.json({
      message: 'Dealer deleted successfully',
      dealerId
    });
  } catch (error) {
    console.error('Error deleting dealer:', error);
    res.status(500).json({
      error: 'Failed to delete dealer',
      message: error.message
    });
  }
});

module.exports = router;
