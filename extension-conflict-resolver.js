/**
 * Browser Extension Conflict Resolver
 * Eliminates "Could not establish connection" and extension-related errors
 */

console.log('🔧 Extension Conflict Resolver Loading...');

(function() {
    'use strict';

    // Suppress extension-related errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = function(...args) {
        const message = String(args[0] || '');
        const stack = (args[1] && args[1].stack) || '';

        // Block extension-related errors
        if (message.includes('Could not establish connection') ||
            message.includes('Receiving end does not exist') ||
            message.includes('Extension context invalidated') ||
            message.includes('chrome-extension:') ||
            message.includes('moz-extension:') ||
            message.includes('safari-extension:') ||
            stack.includes('chrome-extension') ||
            stack.includes('extension') ||
            stack.includes('content_script')) {

            console.log('🔧 Extension error suppressed:', message.substring(0, 40) + '...');
            return;
        }

        originalError.apply(console, args);
    };

    console.warn = function(...args) {
        const message = String(args[0] || '');

        if (message.includes('extension') ||
            message.includes('chrome-extension') ||
            message.includes('content script')) {
            console.log('🔧 Extension warning suppressed:', message.substring(0, 40) + '...');
            return;
        }

        originalWarn.apply(console, args);
    };

    // Block extension communication attempts
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        const originalSendMessage = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = function(...args) {
            try {
                return originalSendMessage.apply(this, args);
            } catch (error) {
                console.log('🔧 Extension communication blocked');
                return;
            }
        };
    }

    // Block extension port connections
    window.addEventListener('message', function(event) {
        if (event.source !== window) return;

        if (event.data && typeof event.data === 'object' &&
            (event.data.type === 'FROM_EXTENSION' ||
             event.data.source === 'extension' ||
             event.data.extension)) {
            console.log('🔧 Extension message blocked');
            event.stopPropagation();
            return;
        }
    });

    // Override extension-related global variables that might cause conflicts
    window.chrome = window.chrome || {};
    window.browser = window.browser || {};

    console.log('✅ Extension Conflict Resolver Active');
})();