const express = require('express');
const router = express.Router();

// In-memory storage for demo purposes
// In production, this would be stored in a database
const onboardingData = new Map();

// Store onboarding data
router.post('/submit', async (req, res) => {
    try {
        const {
            dealershipName,
            contactName,
            email,
            phone,
            website,
            address,
            yearsInBusiness,
            employeeCount,
            googleMyBusiness,
            facebook,
            instagram,
            yelp,
            monthlyVisitors,
            seoAgency,
            marketingChallenges,
            goals,
            communication,
            additionalInfo,
            terms,
            marketing
        } = req.body;

        // Validate required fields
        if (!dealershipName || !contactName || !email || !phone || !website || !address) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        if (!terms) {
            return res.status(400).json({
                success: false,
                error: 'Terms and conditions must be accepted'
            });
        }

        // Create onboarding record
        const onboardingId = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const onboardingRecord = {
            id: onboardingId,
            dealershipName,
            contactName,
            email,
            phone,
            website,
            address,
            yearsInBusiness,
            employeeCount,
            digitalPresence: {
                googleMyBusiness,
                facebook,
                instagram,
                yelp,
                monthlyVisitors,
                seoAgency
            },
            marketingChallenges,
            goals: Array.isArray(goals) ? goals : [goals],
            communication: Array.isArray(communication) ? communication : [communication],
            additionalInfo,
            marketingConsent: !!marketing,
            createdAt: new Date().toISOString(),
            status: 'pending_review'
        };

        // Store the data
        onboardingData.set(onboardingId, onboardingRecord);

        // In a real application, you would:
        // 1. Save to database
        // 2. Send confirmation email
        // 3. Create user account
        // 4. Set up initial dashboard
        // 5. Notify admin team

        console.log('New onboarding submission:', {
            id: onboardingId,
            dealership: dealershipName,
            email: email,
            timestamp: onboardingRecord.createdAt
        });

        res.json({
            success: true,
            onboardingId,
            message: 'Onboarding data submitted successfully',
            nextSteps: [
                'Check your email for confirmation',
                'Our team will review your information',
                'You\'ll receive access to your dashboard within 24 hours'
            ]
        });

    } catch (error) {
        console.error('Onboarding submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit onboarding data'
        });
    }
});

// Get onboarding status
router.get('/status/:id', (req, res) => {
    try {
        const { id } = req.params;
        const record = onboardingData.get(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Onboarding record not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: record.id,
                status: record.status,
                dealershipName: record.dealershipName,
                createdAt: record.createdAt,
                nextSteps: record.status === 'pending_review' ? [
                    'Your information is being reviewed',
                    'You\'ll receive an email with next steps',
                    'Dashboard access will be provided within 24 hours'
                ] : [
                    'Your account is ready',
                    'Check your email for login credentials',
                    'Access your dashboard to get started'
                ]
            }
        });

    } catch (error) {
        console.error('Onboarding status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get onboarding status'
        });
    }
});

// Get all onboarding records (admin endpoint)
router.get('/admin/all', (req, res) => {
    try {
        const records = Array.from(onboardingData.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: records,
            total: records.length
        });

    } catch (error) {
        console.error('Get all onboarding records error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get onboarding records'
        });
    }
});

// Update onboarding status (admin endpoint)
router.put('/admin/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending_review', 'approved', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const record = onboardingData.get(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Onboarding record not found'
            });
        }

        record.status = status;
        record.updatedAt = new Date().toISOString();

        onboardingData.set(id, record);

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: {
                id: record.id,
                status: record.status,
                updatedAt: record.updatedAt
            }
        });

    } catch (error) {
        console.error('Update onboarding status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update status'
        });
    }
});

// Delete onboarding record (admin endpoint)
router.delete('/admin/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        if (!onboardingData.has(id)) {
            return res.status(404).json({
                success: false,
                error: 'Onboarding record not found'
            });
        }

        onboardingData.delete(id);

        res.json({
            success: true,
            message: 'Onboarding record deleted successfully'
        });

    } catch (error) {
        console.error('Delete onboarding record error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete record'
        });
    }
});

module.exports = router;
