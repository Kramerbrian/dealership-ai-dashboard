// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.apiBase = '/api/admin';
        this.currentSection = 'overview';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOverviewData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                this.updateActiveNav(link);
            });
        });

        // Refresh button
        document.querySelector('[onclick="refreshData()"]').addEventListener('click', () => {
            this.refreshData();
        });

        // Export button
        document.querySelector('[onclick="exportData()"]').addEventListener('click', () => {
            this.exportData();
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update page title
        const titles = {
            overview: 'Overview',
            users: 'Users',
            subscriptions: 'Subscriptions',
            analyses: 'Analyses',
            payments: 'Payments',
            settings: 'Settings'
        };
        document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';

        // Load section data
        this.loadSectionData(sectionName);
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    async loadSectionData(section) {
        switch (section) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'users':
                await this.loadUsersData();
                break;
            case 'subscriptions':
                await this.loadSubscriptionsData();
                break;
            case 'analyses':
                await this.loadAnalysesData();
                break;
            case 'payments':
                await this.loadPaymentsData();
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
        }
    }

    async loadOverviewData() {
        try {
            const response = await fetch(`${this.apiBase}/overview`);
            const data = await response.json();
            
            this.updateStats(data);
        } catch (error) {
            console.error('Error loading overview data:', error);
        }
    }

    updateStats(data) {
        const stats = {
            'total-users': data.totalUsers,
            'active-subscriptions': data.activeSubscriptions,
            'monthly-revenue': `$${data.monthlyRevenue.toLocaleString()}`,
            'analyses-completed': data.analysesCompleted
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async loadUsersData() {
        try {
            const response = await fetch(`${this.apiBase}/users`);
            const data = await response.json();
            
            this.populateUsersTable(data.users);
        } catch (error) {
            console.error('Error loading users data:', error);
        }
    }

    populateUsersTable(users) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</td>
                <td><span class="status-badge status-${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
                <td>${user.joined}</td>
                <td>
                    <button class="btn btn-secondary" onclick="adminDashboard.editUser(${user.id})">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    async loadSubscriptionsData() {
        try {
            const response = await fetch(`${this.apiBase}/subscriptions`);
            const data = await response.json();
            
            this.populateSubscriptionsTable(data.subscriptions);
        } catch (error) {
            console.error('Error loading subscriptions data:', error);
        }
    }

    populateSubscriptionsTable(subscriptions) {
        const tbody = document.getElementById('subscriptions-table-body');
        if (!tbody) return;

        tbody.innerHTML = subscriptions.map(sub => `
            <tr>
                <td>${sub.customerName}</td>
                <td>${sub.plan}</td>
                <td><span class="status-badge status-${sub.status}">${sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</span></td>
                <td>$${sub.amount.toFixed(2)}</td>
                <td>${sub.nextBilling}</td>
                <td>
                    <button class="btn btn-secondary" onclick="adminDashboard.manageSubscription(${sub.id})">Manage</button>
                </td>
            </tr>
        `).join('');
    }

    async loadAnalysesData() {
        try {
            const response = await fetch(`${this.apiBase}/analyses`);
            const data = await response.json();
            
            this.populateAnalysesTable(data.analyses);
        } catch (error) {
            console.error('Error loading analyses data:', error);
        }
    }

    populateAnalysesTable(analyses) {
        const tbody = document.getElementById('analyses-table-body');
        if (!tbody) return;

        tbody.innerHTML = analyses.map(analysis => `
            <tr>
                <td>${analysis.dealership}</td>
                <td>${analysis.url}</td>
                <td>${analysis.aiScore}</td>
                <td><span class="status-badge status-${analysis.status}">${analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}</span></td>
                <td>${analysis.createdAt}</td>
                <td>
                    <button class="btn btn-secondary" onclick="adminDashboard.viewAnalysis(${analysis.id})">View</button>
                </td>
            </tr>
        `).join('');
    }

    async loadPaymentsData() {
        try {
            const response = await fetch(`${this.apiBase}/payments`);
            const data = await response.json();
            
            this.populatePaymentsTable(data.payments);
        } catch (error) {
            console.error('Error loading payments data:', error);
        }
    }

    populatePaymentsTable(payments) {
        const tbody = document.getElementById('payments-table-body');
        if (!tbody) return;

        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.customerName}</td>
                <td>$${payment.amount.toFixed(2)}</td>
                <td><span class="status-badge status-${payment.status}">${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span></td>
                <td>${payment.date}</td>
                <td>${payment.transactionId}</td>
                <td>
                    <button class="btn btn-secondary" onclick="adminDashboard.viewPayment(${payment.id})">View</button>
                </td>
            </tr>
        `).join('');
    }

    async loadSettingsData() {
        try {
            const response = await fetch(`${this.apiBase}/settings`);
            const data = await response.json();
            
            document.getElementById('rate-limit').value = data.rateLimit;
            document.getElementById('analysis-timeout').value = data.analysisTimeout;
            document.getElementById('email-notifications').checked = data.emailNotifications;
            document.getElementById('maintenance-mode').checked = data.maintenanceMode;
        } catch (error) {
            console.error('Error loading settings data:', error);
        }
    }

    async refreshData() {
        const btn = document.querySelector('[onclick="refreshData()"]');
        const originalText = btn.textContent;
        
        btn.innerHTML = '<div class="spinner"></div> Refreshing...';
        btn.disabled = true;
        
        try {
            await this.loadSectionData(this.currentSection);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async exportData() {
        try {
            const response = await fetch(`${this.apiBase}/export/${this.currentSection}?format=csv`);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentSection}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data');
        }
    }

    // User management
    async editUser(id) {
        try {
            const response = await fetch(`${this.apiBase}/users/${id}`);
            const user = await response.json();
            
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-plan').value = user.plan;
            document.getElementById('user-modal').classList.add('active');
            
            // Store user ID for saving
            document.getElementById('user-modal').dataset.userId = id;
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }

    async saveUser() {
        const userId = document.getElementById('user-modal').dataset.userId;
        const userData = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            plan: document.getElementById('user-plan').value
        };

        try {
            const response = await fetch(`${this.apiBase}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert('User updated successfully!');
                this.closeModal('user-modal');
                this.loadUsersData();
            } else {
                throw new Error('Failed to update user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Failed to update user');
        }
    }

    // Modal management
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Placeholder methods for other actions
    manageSubscription(id) {
        alert(`Managing subscription ${id}`);
    }

    viewAnalysis(id) {
        alert(`Viewing analysis ${id}`);
    }

    viewPayment(id) {
        alert(`Viewing payment ${id}`);
    }

    async saveSettings() {
        const settings = {
            rateLimit: parseInt(document.getElementById('rate-limit').value),
            analysisTimeout: parseInt(document.getElementById('analysis-timeout').value),
            emailNotifications: document.getElementById('email-notifications').checked,
            maintenanceMode: document.getElementById('maintenance-mode').checked
        };

        try {
            const response = await fetch(`${this.apiBase}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert('Settings saved successfully!');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminDashboard = new AdminDashboard();
});

// Global functions for onclick handlers
function refreshData() {
    window.adminDashboard.refreshData();
}

function exportData() {
    window.adminDashboard.exportData();
}

function editUser(id) {
    window.adminDashboard.editUser(id);
}

function saveUser() {
    window.adminDashboard.saveUser();
}

function closeModal(modalId) {
    window.adminDashboard.closeModal(modalId);
}

function manageSubscription(id) {
    window.adminDashboard.manageSubscription(id);
}

function viewAnalysis(id) {
    window.adminDashboard.viewAnalysis(id);
}

function viewPayment(id) {
    window.adminDashboard.viewPayment(id);
}

function saveSettings() {
    window.adminDashboard.saveSettings();
}

// Filter functions
function filterUsers() { alert('Filter users'); }
function filterSubscriptions() { alert('Filter subscriptions'); }
function filterAnalyses() { alert('Filter analyses'); }
function filterPayments() { alert('Filter payments'); }
