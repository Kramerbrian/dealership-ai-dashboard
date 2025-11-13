'use client';
import { useState } from 'react';

interface PermissionsInspectorProps {
  resource: string;
  action: string;
  role: string;
  plan: 'starter' | 'growth' | 'professional';
  features: string[];
}

export default function PermissionsInspector({
  resource,
  action,
  role,
  plan,
  features
}: PermissionsInspectorProps) {
  const [open, setOpen] = useState(false);

  const reasons = [
    !features.includes(resource) && `Plan ${plan} does not include "${resource}".`,
    role === 'dealer_user' && action !== 'view' && `Role ${role} cannot ${action} on ${resource}.`,
    role === 'viewer' && action !== 'view' && `Role ${role} can only view, not ${action}.`,
    role === 'editor' && action === 'admin' && `Role ${role} cannot perform admin actions.`,
    plan === 'starter' && resource.includes('advanced') && `Advanced features require ${plan === 'starter' ? 'Growth or Professional' : 'higher tier'}.`,
    plan === 'starter' && action === 'export' && `Export functionality requires Growth or Professional plan.`,
  ].filter(Boolean) as string[];

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-gray-100 text-gray-800';
      case 'growth': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'viewer': return 'bg-green-100 text-green-800';
      case 'editor': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'dealer_user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)} 
        className="group relative inline-flex items-center text-xs text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-105"
        title="View permission details"
      >
        <svg className="w-3 h-3 mr-1 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Why disabled?
      </button>
      
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 grid place-items-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Permissions Inspector</h3>
                  <p className="text-sm text-gray-500">Access control analysis</p>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Current Context */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Current Context
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Resource:</span>
                    <span className="font-medium text-gray-900">{resource}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Action:</span>
                    <span className="font-medium text-gray-900">{action}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                      {role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(plan)}`}>
                      {plan}
                    </span>
                  </div>
                </div>
              </div>

              {/* Permission Issues */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Permission Issues
                </h4>
                <div className="space-y-2">
                  {reasons.length ? (
                    reasons.map((reason, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm text-red-800">{reason}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-800">No issues detected.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Solutions */}
              {reasons.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    How to Fix
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    {!features.includes(resource) && (
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Upgrade to a plan that includes "{resource}"</span>
                      </li>
                    )}
                    {role === 'dealer_user' && action !== 'view' && (
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Contact your admin to grant {action} permissions</span>
                      </li>
                    )}
                    {role === 'viewer' && action !== 'view' && (
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Request editor or admin role from your administrator</span>
                      </li>
                    )}
                    {plan === 'starter' && resource.includes('advanced') && (
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Upgrade to Growth or Professional plan</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setOpen(false)} 
                className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-medium rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
