/**
 * Safe Storage Wrapper - Eliminates "Access to storage is not allowed" errors
 * Provides fallback memory storage when localStorage is blocked
 */

console.log('🔐 Safe Storage Wrapper Loading...');

// Create protected storage system
window.safeStorage = (function() {
    'use strict';

    // Memory fallback for when localStorage is blocked
    let memoryStorage = {};

    // Test localStorage availability
    function isLocalStorageAvailable() {
        try {
            if (typeof localStorage === 'undefined') return false;
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    const localStorageAvailable = isLocalStorageAvailable();
    console.log(localStorageAvailable ? '✅ localStorage available' : '⚠️ localStorage blocked, using memory fallback');

    return {
        // Safe get operation
        getItem: function(key) {
            try {
                if (localStorageAvailable) {
                    return localStorage.getItem(key);
                } else {
                    return memoryStorage[key] || null;
                }
            } catch (error) {
                console.log('🔐 Storage access blocked for key:', key);
                return memoryStorage[key] || null;
            }
        },

        // Safe set operation
        setItem: function(key, value) {
            try {
                if (localStorageAvailable) {
                    localStorage.setItem(key, value);
                    return true;
                } else {
                    memoryStorage[key] = value;
                    return true;
                }
            } catch (error) {
                console.log('🔐 Storage write blocked for key:', key);
                memoryStorage[key] = value;
                return true;
            }
        },

        // Safe remove operation
        removeItem: function(key) {
            try {
                if (localStorageAvailable) {
                    localStorage.removeItem(key);
                } else {
                    delete memoryStorage[key];
                }
                return true;
            } catch (error) {
                console.log('🔐 Storage remove blocked for key:', key);
                delete memoryStorage[key];
                return true;
            }
        },

        // Safe clear operation
        clear: function() {
            try {
                if (localStorageAvailable) {
                    localStorage.clear();
                } else {
                    memoryStorage = {};
                }
                return true;
            } catch (error) {
                console.log('🔐 Storage clear blocked');
                memoryStorage = {};
                return true;
            }
        },

        // Get all keys
        keys: function() {
            try {
                if (localStorageAvailable) {
                    return Object.keys(localStorage);
                } else {
                    return Object.keys(memoryStorage);
                }
            } catch (error) {
                console.log('🔐 Storage keys access blocked');
                return Object.keys(memoryStorage);
            }
        },

        // Check if storage is working
        isWorking: function() {
            return localStorageAvailable;
        },

        // Get storage type
        getType: function() {
            return localStorageAvailable ? 'localStorage' : 'memory';
        }
    };
})();

// Override global localStorage with safe wrapper
if (typeof window.localStorage === 'undefined' || !window.safeStorage.isWorking()) {
    console.log('🔐 Overriding localStorage with safe wrapper');

    window.localStorage = {
        getItem: window.safeStorage.getItem,
        setItem: window.safeStorage.setItem,
        removeItem: window.safeStorage.removeItem,
        clear: window.safeStorage.clear,
        key: function(index) {
            const keys = window.safeStorage.keys();
            return keys[index] || null;
        },
        get length() {
            return window.safeStorage.keys().length;
        }
    };
}

// Suppress storage-related errors
const originalError = console.error;
console.error = function(...args) {
    const message = String(args[0] || '');

    if (message.includes('Access to storage is not allowed') ||
        message.includes('localStorage is not available') ||
        message.includes('QuotaExceededError') ||
        message.includes('storage quota')) {
        console.log('🔐 Storage error suppressed:', message.substring(0, 50) + '...');
        return;
    }

    originalError.apply(console, args);
};

console.log('✅ Safe Storage Wrapper Active - Type:', window.safeStorage.getType());