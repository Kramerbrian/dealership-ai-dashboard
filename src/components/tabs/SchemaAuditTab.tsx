'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface SchemaAuditTabProps {
  auditData?: any;
}

export default function SchemaAuditTab({ auditData }: SchemaAuditTabProps) {
  const [schemaData, setSchemaData] = useState({
    totalPages: 0,
    pagesWithSchema: 0,
    schemaTypes: [] as string[],
    errors: 0,
    warnings: 0,
    lastScanned: new Date()
  });

  const [schemaTypes, setSchemaTypes] = useState([
    {
      type: 'LocalBusiness',
      status: 'implemented',
      pages: 15,
      score: 95,
      description: 'Business information and location data'
    },
    {
      type: 'AutoDealer',
      status: 'implemented',
      pages: 12,
      score: 88,
      description: 'Automotive dealership specific markup'
    },
    {
      type: 'Organization',
      status: 'partial',
      pages: 8,
      score: 65,
      description: 'Company information and contact details'
    },
    {
      type: 'Product',
      status: 'missing',
      pages: 0,
      score: 0,
      description: 'Vehicle inventory and product information'
    },
    {
      type: 'Review',
      status: 'partial',
      pages: 5,
      score: 45,
      description: 'Customer reviews and ratings'
    },
    {
      type: 'FAQ',
      status: 'missing',
      pages: 0,
      score: 0,
      description: 'Frequently asked questions'
    }
  ]);

  const [schemaErrors, setSchemaErrors] = useState([
    {
      id: 1,
      type: 'error',
      message: 'Missing required property "address" in LocalBusiness schema',
      page: '/contact',
      severity: 'high'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Invalid phone number format in Organization schema',
      page: '/about',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'error',
      message: 'Missing "priceRange" property in AutoDealer schema',
      page: '/inventory',
      severity: 'high'
    },
    {
      id: 4,
      type: 'info',
      message: 'Consider adding "openingHours" to LocalBusiness schema',
      page: '/contact',
      severity: 'low'
    }
  ]);

  useEffect(() => {
    // Simulate schema scanning
    const interval = setInterval(() => {
      setSchemaData(prev => ({
        ...prev,
        totalPages: Math.floor(Math.random() * 50) + 100,
        pagesWithSchema: Math.floor(Math.random() * 30) + 70,
        errors: Math.floor(Math.random() * 5),
        warnings: Math.floor(Math.random() * 10) + 5
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'text-green-400 bg-green-500/20';
      case 'partial': return 'text-yellow-400 bg-yellow-500/20';
      case 'missing': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'partial': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'missing': return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'info': return <CheckCircleIcon className="w-5 h-5 text-blue-400" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <MagnifyingGlassIcon className="w-8 h-8 text-purple-400" />
            Schema Audit
          </h2>
          <p className="text-gray-400 mt-1">
            Comprehensive analysis of your website's structured data markup
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last Scanned</div>
          <div className="text-white font-medium">
            {schemaData.lastScanned.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Schema Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Schema Implementation Overview</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {Math.round((schemaData.pagesWithSchema / schemaData.totalPages) * 100)}% coverage
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{schemaData.totalPages}</div>
            <div className="text-sm text-gray-400">Total Pages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{schemaData.pagesWithSchema}</div>
            <div className="text-sm text-gray-400">With Schema</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{schemaData.errors}</div>
            <div className="text-sm text-gray-400">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{schemaData.warnings}</div>
            <div className="text-sm text-gray-400">Warnings</div>
          </div>
        </div>
      </motion.div>

      {/* Schema Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Schema Types Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {schemaTypes.map((schema, index) => (
            <motion.div
              key={schema.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600/50 rounded-lg flex items-center justify-center">
                    <TagIcon className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{schema.type}</h4>
                    <p className="text-sm text-gray-400">{schema.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(schema.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schema.status)}`}>
                    {schema.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Implementation Score</span>
                <span className="text-sm font-medium text-white">{schema.score}/100</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    schema.score >= 80 ? 'bg-green-500' :
                    schema.score >= 60 ? 'bg-yellow-500' :
                    schema.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${schema.score}%` }}
                />
              </div>
              <div className="text-sm text-gray-400">
                {schema.pages} pages implemented
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Schema Errors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Schema Validation Issues</h3>
          <div className="text-sm text-gray-400">
            {schemaErrors.filter(error => error.type === 'error').length} errors, {' '}
            {schemaErrors.filter(error => error.type === 'warning').length} warnings
          </div>
        </div>
        <div className="space-y-3">
          {schemaErrors.map((error, index) => (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
            >
              <div className="flex-shrink-0">
                {getErrorIcon(error.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{error.message}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                    {error.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Page: {error.page}</p>
              </div>
              <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium rounded-lg transition-colors">
                Fix
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Schema Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Schema Code Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">LocalBusiness Schema</h4>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "name": "Lou Glutz Motors",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Chicago",
    "addressRegion": "IL",
    "postalCode": "60601"
  },
  "telephone": "+1-312-555-0123",
  "url": "https://louglutzmotors.com",
  "priceRange": "$$"
}`}
              </pre>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
          Run Schema Audit
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Generate Schema
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          Export Report
        </button>
      </div>
    </div>
  );
}
