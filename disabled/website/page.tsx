import { getCurrentUser } from '@/lib/auth';
import { api } from '@/lib/trpc/server';

export default async function WebsitePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Loading...</div>;
  }

  const websiteData = await api.dealership.getWebsiteHealth.query({
    tenantId: user.tenant?.id,
    accessibleTenants: [user.tenant_id]
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Website Health Analysis
        </h1>
        <p className="text-gray-600 mt-1">
          Comprehensive analysis of your dealership's website performance and SEO
        </p>
      </div>

      {/* Website Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SGP Integrity</p>
              <p className="text-2xl font-bold text-gray-900">
                {websiteData.seo_score || 0}/100
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${websiteData.seo_score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Zero-Click Optimization</p>
              <p className="text-2xl font-bold text-gray-900">
                {websiteData.seo_score || 0}/100
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${websiteData.seo_score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Technical SEO</p>
              <p className="text-2xl font-bold text-gray-900">
                {websiteData.seo_score || 0}/100
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${websiteData.seo_score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SGP Analysis */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Structured Data Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Schema.org markup validation</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">LocalBusiness Schema</span>
                <span className="text-sm font-medium text-green-600">
                  Present
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FAQ Schema</span>
                <span className="text-sm font-medium text-green-600">
                  Present
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HowTo Schema</span>
                <span className="text-sm font-medium text-green-600">
                  Present
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Schema Completeness</span>
                <span className="text-sm font-medium text-gray-900">
                  {(websiteData as any).schemaCompleteness || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zero-Click Analysis */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Zero-Click Optimization</h3>
            <p className="text-sm text-gray-600 mt-1">Featured snippet readiness</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FAQ Count</span>
                <span className="text-sm font-medium text-gray-900">
                  {(websiteData as any).faqCount || 0} questions
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Heading Structure</span>
                <span className={`text-sm font-medium ${websiteData.goodHeadingStructure ? 'text-green-600' : 'text-red-600'}`}>
                  {websiteData.goodHeadingStructure ? 'Optimized' : 'Needs Work'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Meta Description</span>
                <span className={`text-sm font-medium ${websiteData.hasMetaDescription ? 'text-green-600' : 'text-red-600'}`}>
                  {websiteData.hasMetaDescription ? 'Present' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Article Schema</span>
                <span className={`text-sm font-medium ${websiteData.hasArticleSchema ? 'text-green-600' : 'text-red-600'}`}>
                  {websiteData.hasArticleSchema ? 'Present' : 'Missing'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
          <p className="text-sm text-gray-600 mt-1">Actionable steps to improve your website's AI visibility</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {websiteData.recommendations?.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            )) || (
              <p className="text-sm text-gray-500">No specific recommendations at this time.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
