'use client';

import React from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface GoogleAuthButtonProps {
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onAuthSuccess,
  onAuthError,
  className = '',
  children
}) => {
  const { 
    isLoading, 
    error, 
    isAuthenticated, 
    initiateGoogleAuth, 
    logout 
  } = useApiClient();

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      logout();
      return;
    }

    try {
      await initiateGoogleAuth();
      onAuthSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Authentication failed';
      onAuthError?.(errorMessage);
    }
  };

  return (
    <div className={`google-auth-button ${className}`}>
      <button
        onClick={handleAuthClick}
        disabled={isLoading}
        className={`
          flex items-center justify-center px-4 py-2 rounded-lg font-medium
          transition-colors duration-200
          ${isAuthenticated 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isAuthenticated ? 'Signing out...' : 'Connecting...'}
          </div>
        ) : (
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Disconnect Google
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect Google Services
              </>
            )}
          </div>
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {isAuthenticated && (
        <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          ✓ Google Services Connected
        </div>
      )}
      
      {children}
    </div>
  );
};

export default GoogleAuthButton;
