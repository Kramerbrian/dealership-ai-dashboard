/**
 * Real-time Notifications System for DealershipAI Dashboard
 * Handles alerts, updates, and system notifications
 */

class NotificationSystem {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'top-right',
            maxNotifications: options.maxNotifications || 5,
            autoClose: options.autoClose || 5000,
            enableSound: options.enableSound || true,
            enablePush: options.enablePush || false,
            ...options
        };
        
        this.notifications = [];
        this.container = null;
        this.sound = null;
        this.isSupported = this.checkSupport();
        
        this.init();
    }

    init() {
        this.createContainer();
        this.setupSound();
        this.setupPushNotifications();
        this.bindEvents();
    }

    createContainer() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = `notification-container ${this.options.position}`;
        this.container.innerHTML = `
            <div class="notification-list" id="notification-list"></div>
        `;
        
        document.body.appendChild(this.container);
        
        // Add styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
            }

            .notification-container.top-right {
                top: 20px;
                right: 20px;
            }

            .notification-container.top-left {
                top: 20px;
                left: 20px;
            }

            .notification-container.bottom-right {
                bottom: 20px;
                right: 20px;
            }

            .notification-container.bottom-left {
                bottom: 20px;
                left: 20px;
            }

            .notification-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 80vh;
                overflow-y: auto;
            }

            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 16px;
                min-width: 300px;
                max-width: 400px;
                pointer-events: auto;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border-left: 4px solid #667eea;
                position: relative;
                overflow: hidden;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .notification.success {
                border-left-color: #10b981;
            }

            .notification.warning {
                border-left-color: #f59e0b;
            }

            .notification.error {
                border-left-color: #ef4444;
            }

            .notification.info {
                border-left-color: #3b82f6;
            }

            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #1f2937;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .notification-icon {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }

            .notification-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .notification-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .notification-message {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
                margin: 0;
            }

            .notification-actions {
                margin-top: 12px;
                display: flex;
                gap: 8px;
            }

            .notification-action {
                padding: 6px 12px;
                border: 1px solid #d1d5db;
                background: white;
                color: #374151;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .notification-action:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }

            .notification-action.primary {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .notification-action.primary:hover {
                background: #5a6fd8;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: #e5e7eb;
                width: 100%;
                overflow: hidden;
            }

            .notification-progress-bar {
                height: 100%;
                background: #667eea;
                width: 100%;
                transform: translateX(-100%);
                transition: transform linear;
            }

            .notification.success .notification-progress-bar {
                background: #10b981;
            }

            .notification.warning .notification-progress-bar {
                background: #f59e0b;
            }

            .notification.error .notification-progress-bar {
                background: #ef4444;
            }

            .notification.info .notification-progress-bar {
                background: #3b82f6;
            }

            @media (max-width: 480px) {
                .notification {
                    min-width: 280px;
                    max-width: calc(100vw - 40px);
                }

                .notification-container {
                    left: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupSound() {
        if (this.options.enableSound) {
            // Create audio context for notification sounds
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.warn('Audio context not supported:', error);
            }
        }
    }

    setupPushNotifications() {
        if (this.options.enablePush && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    bindEvents() {
        // Listen for visibility changes to show notifications when tab becomes active
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.showQueuedNotifications();
            }
        });

        // Listen for custom events
        window.addEventListener('dealership-analysis-complete', (e) => {
            this.show('success', 'Analysis Complete', 'Your dealership analysis is ready!', {
                actions: [
                    { text: 'View Results', action: () => this.openAnalysisResults(e.detail) }
                ]
            });
        });

        window.addEventListener('subscription-updated', (e) => {
            this.show('info', 'Subscription Updated', 'Your subscription status has been updated.', {
                actions: [
                    { text: 'View Details', action: () => this.openSubscriptionDetails() }
                ]
            });
        });

        window.addEventListener('new-recommendation', (e) => {
            this.show('info', 'New Recommendation', 'We found new opportunities to improve your visibility!', {
                actions: [
                    { text: 'View Recommendations', action: () => this.openRecommendations() }
                ]
            });
        });
    }

    show(type = 'info', title, message, options = {}) {
        const notification = {
            id: this.generateId(),
            type,
            title,
            message,
            timestamp: new Date(),
            options: {
                autoClose: options.autoClose !== false ? this.options.autoClose : false,
                actions: options.actions || [],
                persistent: options.persistent || false,
                ...options
            }
        };

        this.notifications.push(notification);
        this.renderNotification(notification);
        this.playSound(type);
        
        if (this.options.enablePush && !document.hidden) {
            this.showPushNotification(notification);
        }

        // Auto-close if enabled
        if (notification.options.autoClose) {
            setTimeout(() => {
                this.hide(notification.id);
            }, notification.options.autoClose);
        }

        // Limit number of notifications
        if (this.notifications.length > this.options.maxNotifications) {
            const oldest = this.notifications.shift();
            this.hide(oldest.id);
        }
    }

    renderNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type}`;
        notificationElement.id = `notification-${notification.id}`;
        
        const icon = this.getIcon(notification.type);
        const actions = notification.options.actions.map(action => 
            `<button class="notification-action ${action.primary ? 'primary' : ''}" data-action="${action.text}">
                ${action.text}
            </button>`
        ).join('');

        notificationElement.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">
                    <svg class="notification-icon" viewBox="0 0 24 24" fill="currentColor">
                        ${icon}
                    </svg>
                    ${notification.title}
                </h4>
                <button class="notification-close" data-close="${notification.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                    </svg>
                </button>
            </div>
            <p class="notification-message">${notification.message}</p>
            ${actions ? `<div class="notification-actions">${actions}</div>` : ''}
            ${notification.options.autoClose ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;

        // Add event listeners
        notificationElement.querySelector('.notification-close').addEventListener('click', () => {
            this.hide(notification.id);
        });

        notificationElement.querySelectorAll('.notification-action').forEach(button => {
            button.addEventListener('click', () => {
                const actionText = button.dataset.action;
                const action = notification.options.actions.find(a => a.text === actionText);
                if (action && action.action) {
                    action.action();
                }
                this.hide(notification.id);
            });
        });

        // Add to container
        this.container.querySelector('.notification-list').appendChild(notificationElement);

        // Trigger animation
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);

        // Start progress bar animation
        if (notification.options.autoClose) {
            const progressBar = notificationElement.querySelector('.notification-progress-bar');
            if (progressBar) {
                progressBar.style.transitionDuration = `${notification.options.autoClose}ms`;
                progressBar.style.transform = 'translateX(0)';
            }
        }
    }

    hide(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.classList.add('hide');
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    hideAll() {
        this.notifications.forEach(notification => {
            this.hide(notification.id);
        });
    }

    getIcon(type) {
        const icons = {
            success: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
            warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
            error: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
            info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>'
        };
        return icons[type] || icons.info;
    }

    playSound(type) {
        if (!this.options.enableSound || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const frequencies = {
                success: [523, 659, 784], // C-E-G
                warning: [440, 415], // A-Ab
                error: [220, 196], // A-G
                info: [440] // A
            };
            
            const freq = frequencies[type] || frequencies.info;
            const duration = 0.2;
            
            oscillator.frequency.setValueAtTime(freq[0], this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('Could not play notification sound:', error);
        }
    }

    showPushNotification(notification) {
        if (Notification.permission === 'granted') {
            const pushNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id
            });
            
            pushNotification.onclick = () => {
                window.focus();
                pushNotification.close();
            };
        }
    }

    showQueuedNotifications() {
        // Show any notifications that were queued while tab was inactive
        this.notifications.forEach(notification => {
            if (!document.getElementById(`notification-${notification.id}`)) {
                this.renderNotification(notification);
            }
        });
    }

    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    checkSupport() {
        return typeof document !== 'undefined' && typeof window !== 'undefined';
    }

    // Action handlers
    openAnalysisResults(detail) {
        // Navigate to analysis results
        window.location.href = `/analysis/${detail.analysisId}`;
    }

    openSubscriptionDetails() {
        // Open subscription management
        window.location.href = '/subscription';
    }

    openRecommendations() {
        // Open recommendations page
        window.location.href = '/recommendations';
    }

    // Public API methods
    success(title, message, options) {
        this.show('success', title, message, options);
    }

    warning(title, message, options) {
        this.show('warning', title, message, options);
    }

    error(title, message, options) {
        this.show('error', title, message, options);
    }

    info(title, message, options) {
        this.show('info', title, message, options);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
} else {
    window.NotificationSystem = NotificationSystem;
}
