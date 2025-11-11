/**
 * AI Chatbot Component for DealershipAI Dashboard
 * Provides intelligent assistance and recommendations
 */

class AIChatbot {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            apiKey: options.apiKey || null,
            theme: options.theme || 'light',
            position: options.position || 'bottom-right',
            ...options
        };
        
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.createChatbotUI();
        this.bindEvents();
        this.loadWelcomeMessage();
    }

    createChatbotUI() {
        // Create chatbot container
        this.container.innerHTML = `
            <div class="ai-chatbot-container ${this.options.theme} ${this.options.position}">
                <!-- Chat Toggle Button -->
                <button class="chatbot-toggle" id="chatbot-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
                        <path d="M7 9H17V11H7V9ZM7 12H15V14H7V12Z" fill="currentColor"/>
                    </svg>
                    <span class="notification-badge" id="notification-badge" style="display: none;">1</span>
                </button>

                <!-- Chat Window -->
                <div class="chatbot-window" id="chatbot-window" style="display: none;">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <div class="ai-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div class="title-text">
                                <h3>DealershipAI Assistant</h3>
                                <p>How can I help you today?</p>
                            </div>
                        </div>
                        <button class="chatbot-close" id="chatbot-close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Messages -->
                    <div class="chatbot-messages" id="chatbot-messages">
                        <!-- Messages will be added here -->
                    </div>

                    <!-- Input Area -->
                    <div class="chatbot-input-area">
                        <div class="input-container">
                            <input type="text" 
                                   id="chatbot-input" 
                                   placeholder="Ask me about your dealership analytics..."
                                   maxlength="500">
                            <button id="chatbot-send" disabled>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                        <div class="quick-actions">
                            <button class="quick-action" data-message="Show me my AI visibility score">
                                📊 AI Score
                            </button>
                            <button class="quick-action" data-message="What are my top issues?">
                                ⚠️ Top Issues
                            </button>
                            <button class="quick-action" data-message="How can I improve my SEO?">
                                🔍 SEO Tips
                            </button>
                            <button class="quick-action" data-message="Show me competitor analysis">
                                🏆 Competitors
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add CSS styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-chatbot-container {
                position: fixed;
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .ai-chatbot-container.bottom-right {
                bottom: 20px;
                right: 20px;
            }

            .ai-chatbot-container.bottom-left {
                bottom: 20px;
                left: 20px;
            }

            .chatbot-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chatbot-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }

            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4757;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chatbot-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .chatbot-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .chatbot-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .ai-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .title-text h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .title-text p {
                margin: 0;
                font-size: 12px;
                opacity: 0.8;
            }

            .chatbot-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s ease;
            }

            .chatbot-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .chatbot-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .message {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
                word-wrap: break-word;
            }

            .message.user {
                background: #667eea;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .message.assistant {
                background: #f1f3f4;
                color: #333;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .message.typing {
                background: #f1f3f4;
                color: #666;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .typing-dots {
                display: flex;
                gap: 2px;
            }

            .typing-dot {
                width: 4px;
                height: 4px;
                background: #666;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-10px);
                }
            }

            .chatbot-input-area {
                padding: 16px;
                border-top: 1px solid #e0e0e0;
            }

            .input-container {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }

            #chatbot-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #e0e0e0;
                border-radius: 24px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s ease;
            }

            #chatbot-input:focus {
                border-color: #667eea;
            }

            #chatbot-send {
                width: 40px;
                height: 40px;
                border: none;
                background: #667eea;
                color: white;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            #chatbot-send:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            #chatbot-send:not(:disabled):hover {
                background: #5a6fd8;
                transform: scale(1.05);
            }

            .quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .quick-action {
                padding: 6px 12px;
                background: #f8f9fa;
                border: 1px solid #e0e0e0;
                border-radius: 16px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .quick-action:hover {
                background: #e9ecef;
                border-color: #667eea;
            }

            .ai-chatbot-container.dark {
                color: #fff;
            }

            .ai-chatbot-container.dark .chatbot-window {
                background: #1a1a1a;
                color: #fff;
            }

            .ai-chatbot-container.dark .message.assistant {
                background: #2d2d2d;
                color: #fff;
            }

            .ai-chatbot-container.dark #chatbot-input {
                background: #2d2d2d;
                border-color: #444;
                color: #fff;
            }

            .ai-chatbot-container.dark .quick-action {
                background: #2d2d2d;
                border-color: #444;
                color: #fff;
            }

            @media (max-width: 480px) {
                .chatbot-window {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 100px);
                    bottom: 80px;
                    right: 20px;
                    left: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // Toggle chatbot
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggle();
        });

        // Close chatbot
        document.getElementById('chatbot-close').addEventListener('click', () => {
            this.close();
        });

        // Send message
        document.getElementById('chatbot-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Input enter key
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input change
        document.getElementById('chatbot-input').addEventListener('input', (e) => {
            const sendButton = document.getElementById('chatbot-send');
            sendButton.disabled = !e.target.value.trim();
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const message = e.target.dataset.message;
                this.sendMessage(message);
            });
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (this.isOpen) {
            window.style.display = 'flex';
            toggle.style.transform = 'rotate(180deg)';
            document.getElementById('chatbot-input').focus();
            this.hideNotification();
        } else {
            window.style.display = 'none';
            toggle.style.transform = 'rotate(0deg)';
        }
    }

    close() {
        this.isOpen = false;
        document.getElementById('chatbot-window').style.display = 'none';
        document.getElementById('chatbot-toggle').style.transform = 'rotate(0deg)';
    }

    showNotification() {
        document.getElementById('notification-badge').style.display = 'flex';
    }

    hideNotification() {
        document.getElementById('notification-badge').style.display = 'none';
    }

    async sendMessage(message = null) {
        const input = document.getElementById('chatbot-input');
        const text = message || input.value.trim();
        
        if (!text) return;

        // Clear input
        input.value = '';
        document.getElementById('chatbot-send').disabled = true;

        // Add user message
        this.addMessage('user', text);

        // Show typing indicator
        this.showTyping();

        try {
            // Get AI response
            const response = await this.getAIResponse(text);
            
            // Hide typing indicator
            this.hideTyping();
            
            // Add assistant message
            this.addMessage('assistant', response);
            
        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTyping();
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    }

    addMessage(type, content) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = content;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ type, content, timestamp: new Date() });
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing';
        typingDiv.innerHTML = `
            <span>AI is typing</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        typingDiv.id = 'typing-indicator';
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.isTyping = true;
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    async getAIResponse(message) {
        // If no API key, return mock responses
        if (!this.options.apiKey) {
            return this.getMockResponse(message);
        }

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    apiKey: this.options.apiKey,
                    context: this.getContext()
                })
            });

            const data = await response.json();
            return data.response || 'Sorry, I could not process your request.';
            
        } catch (error) {
            console.error('AI API error:', error);
            return this.getMockResponse(message);
        }
    }

    getMockResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('ai visibility score') || lowerMessage.includes('score')) {
            return "Your AI Visibility Score is calculated based on multiple factors including website performance, SEO optimization, social media presence, and local search visibility. To get your actual score, please run a dealership analysis first.";
        }
        
        if (lowerMessage.includes('issues') || lowerMessage.includes('problems')) {
            return "Common issues I find include: slow page loading, missing meta descriptions, poor mobile optimization, lack of local SEO optimization, and insufficient social media presence. Run an analysis to see your specific issues.";
        }
        
        if (lowerMessage.includes('seo') || lowerMessage.includes('search')) {
            return "To improve your SEO: 1) Optimize page titles and meta descriptions, 2) Improve page loading speed, 3) Add structured data markup, 4) Create quality content regularly, 5) Build local citations and reviews.";
        }
        
        if (lowerMessage.includes('competitor') || lowerMessage.includes('competition')) {
            return "Competitor analysis helps you understand your market position. I can analyze your competitors' SEO strategies, social media presence, and identify opportunities where you can outperform them.";
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            return "I can help you with: analyzing your dealership's online presence, explaining your AI Visibility Score, providing SEO recommendations, competitor analysis, and answering questions about your analytics data.";
        }
        
        return "I'm here to help with your dealership analytics! You can ask me about your AI Visibility Score, SEO recommendations, competitor analysis, or any questions about your data. What would you like to know?";
    }

    getContext() {
        // Get current dashboard context
        return {
            currentUrl: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }

    loadWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('assistant', 'Hello! I\'m your DealershipAI assistant. I can help you understand your analytics, provide SEO recommendations, and answer questions about your dealership\'s online presence. How can I help you today?');
        }, 1000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatbot;
} else {
    window.AIChatbot = AIChatbot;
}
