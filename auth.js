/**
 * Simple Authentication System for DealershipAI Dashboard
 * Provides session management and role-based access
 */

class DealershipAuth {
    constructor() {
        this.users = new Map([
            ['admin@dealershipai.com', {
                id: 'admin-001',
                email: 'admin@dealershipai.com',
                password: this.hashPassword('admin123'), // Change this!
                role: 'admin',
                name: 'Admin User',
                permissions: ['read', 'write', 'delete', 'manage_users']
            }],
            ['manager@dealershipai.com', {
                id: 'mgr-001',
                email: 'manager@dealershipai.com',
                password: this.hashPassword('manager123'), // Change this!
                role: 'manager',
                name: 'Manager User',
                permissions: ['read', 'write']
            }],
            ['viewer@dealershipai.com', {
                id: 'view-001',
                email: 'viewer@dealershipai.com',
                password: this.hashPassword('viewer123'), // Change this!
                role: 'viewer',
                name: 'Viewer User',
                permissions: ['read']
            }]
        ]);

        this.sessions = new Map();
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
    }

    hashPassword(password) {
        // Simple hash for demo - use bcrypt in production!
        return btoa(password + 'dealershipai_salt');
    }

    validateCredentials(email, password) {
        const user = this.users.get(email);
        if (!user) return null;

        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) return null;

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            permissions: user.permissions
        };
    }

    createSession(user) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            userId: user.id,
            user: user,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.sessionTimeout),
            lastActive: new Date()
        };

        this.sessions.set(sessionId, session);
        return sessionId;
    }

    validateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        if (new Date() > session.expiresAt) {
            this.sessions.delete(sessionId);
            return null;
        }

        // Update last active
        session.lastActive = new Date();
        return session;
    }

    logout(sessionId) {
        this.sessions.delete(sessionId);
    }

    hasPermission(sessionId, permission) {
        const session = this.validateSession(sessionId);
        if (!session) return false;

        return session.user.permissions.includes(permission);
    }

    generateSessionId() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Clean up expired sessions
    cleanupSessions() {
        const now = new Date();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.sessions.delete(sessionId);
            }
        }
    }

    getActiveUsers() {
        this.cleanupSessions();
        const activeUsers = new Set();

        for (const session of this.sessions.values()) {
            activeUsers.add({
                id: session.user.id,
                name: session.user.name,
                role: session.user.role,
                lastActive: session.lastActive
            });
        }

        return Array.from(activeUsers);
    }
}

// Create global auth instance
const auth = new DealershipAuth();

// Clean up expired sessions every hour
setInterval(() => {
    auth.cleanupSessions();
}, 60 * 60 * 1000);

// Login UI Handler
function showLoginForm() {
    const loginHtml = `
        <div id="login-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                width: 400px;
                max-width: 90%;
            ">
                <h2 style="text-align: center; margin-bottom: 1.5rem;">DealershipAI Dashboard</h2>
                <form id="login-form">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem;">Email:</label>
                        <input type="email" id="email" required style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem;">Password:</label>
                        <input type="password" id="password" required style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            box-sizing: border-box;
                        ">
                    </div>
                    <button type="submit" style="
                        width: 100%;
                        padding: 0.75rem;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">Login</button>
                </form>
                <div id="login-error" style="
                    color: red;
                    text-align: center;
                    margin-top: 1rem;
                    display: none;
                "></div>
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee;">
                    <p style="margin: 0; font-size: 0.9rem; color: #666;">Demo Accounts:</p>
                    <ul style="margin: 0.5rem 0; font-size: 0.8rem; color: #666;">
                        <li>admin@dealershipai.com / admin123</li>
                        <li>manager@dealershipai.com / manager123</li>
                        <li>viewer@dealershipai.com / viewer123</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loginHtml);

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const user = auth.validateCredentials(email, password);
        if (user) {
            const sessionId = auth.createSession(user);
            localStorage.setItem('dealership_session', sessionId);
            localStorage.setItem('dealership_user', JSON.stringify(user));

            document.getElementById('login-overlay').remove();
            window.location.reload();
        } else {
            const errorDiv = document.getElementById('login-error');
            errorDiv.textContent = 'Invalid email or password';
            errorDiv.style.display = 'block';
        }
    });
}

function checkAuth() {
    const sessionId = localStorage.getItem('dealership_session');
    const userData = localStorage.getItem('dealership_user');

    if (!sessionId || !userData) {
        showLoginForm();
        return null;
    }

    const session = auth.validateSession(sessionId);
    if (!session) {
        localStorage.removeItem('dealership_session');
        localStorage.removeItem('dealership_user');
        showLoginForm();
        return null;
    }

    return JSON.parse(userData);
}

function logout() {
    const sessionId = localStorage.getItem('dealership_session');
    if (sessionId) {
        auth.logout(sessionId);
    }

    localStorage.removeItem('dealership_session');
    localStorage.removeItem('dealership_user');
    window.location.reload();
}

// Auto-check auth on page load
window.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (user) {
        // Add user info to header
        const userInfo = document.createElement('div');
        userInfo.innerHTML = `
            <div style="position: fixed; top: 10px; right: 10px; background: white; padding: 8px 16px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 1000;">
                <span style="margin-right: 15px;">👋 ${user.name} (${user.role})</span>
                <button onclick="logout()" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">Logout</button>
            </div>
        `;
        document.body.appendChild(userInfo);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { auth, checkAuth, logout, showLoginForm };
}