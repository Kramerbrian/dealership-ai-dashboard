#!/usr/bin/env node

/**
 * TypeScript Client Generator
 * Generates TypeScript client from OpenAPI specification
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const OPENAPI_SPEC_PATH = join(__dirname, '../openapi/seo.yml');
const CLIENT_OUTPUT_PATH = join(__dirname, '../src/lib/api-client');
const PACKAGE_JSON_PATH = join(__dirname, '../package.json');

async function generateClient() {
  try {
    console.log('🚀 Generating TypeScript client from OpenAPI specification...');

    // Check if OpenAPI spec exists
    if (!existsSync(OPENAPI_SPEC_PATH)) {
      throw new Error(`OpenAPI specification not found at ${OPENAPI_SPEC_PATH}`);
    }

    // Install openapi-generator if not already installed
    console.log('📦 Installing openapi-generator...');
    try {
      execSync('npx @openapitools/openapi-generator-cli version', { stdio: 'ignore' });
    } catch {
      console.log('Installing openapi-generator...');
      execSync('npm install -g @openapitools/openapi-generator-cli', { stdio: 'inherit' });
    }

    // Generate TypeScript client
    console.log('🔧 Generating TypeScript client...');
    execSync(
      `npx @openapitools/openapi-generator-cli generate \
        -i ${OPENAPI_SPEC_PATH} \
        -g typescript-fetch \
        -o ${CLIENT_OUTPUT_PATH} \
        --additional-properties=typescriptThreePlus=true,supportsES6=true,withInterfaces=true,modelPropertyNaming=original`,
      { stdio: 'inherit' }
    );

    // Create custom client wrapper
    console.log('📝 Creating custom client wrapper...');
    createClientWrapper();

    // Update package.json with client dependencies
    console.log('📋 Updating package.json...');
    updatePackageJson();

    console.log('✅ TypeScript client generated successfully!');
    console.log(`📁 Client files created in: ${CLIENT_OUTPUT_PATH}`);
    console.log('🔧 Run "npm install" to install new dependencies');

  } catch (error) {
    console.error('❌ Failed to generate TypeScript client:', error);
    process.exit(1);
  }
}

function createClientWrapper() {
  const wrapperContent = `/**
 * DealershipAI API Client
 * Auto-generated TypeScript client with custom wrapper
 */

import { Configuration, DefaultApi } from './api';
import { SeoGenerateRequest, SeoGenerateResponse } from './models';

export interface ClientConfig {
  baseUrl?: string;
  apiKey?: string;
  bearerToken?: string;
  timeout?: number;
}

export class DealershipAIClient {
  private api: DefaultApi;
  private config: ClientConfig;

  constructor(config: ClientConfig = {}) {
    this.config = {
      baseUrl: 'https://api.dealershipai.com/v2',
      timeout: 30000,
      ...config,
    };

    const configuration = new Configuration({
      basePath: this.config.baseUrl,
      apiKey: this.config.apiKey,
      accessToken: this.config.bearerToken,
      timeout: this.config.timeout,
    });

    this.api = new DefaultApi(configuration);
  }

  /**
   * Generate SEO content
   */
  async generateSeoContent(request: SeoGenerateRequest): Promise<SeoGenerateResponse> {
    try {
      const response = await this.api.generateSeoContent(request);
      return response;
    } catch (error) {
      throw new Error(\`SEO generation failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Validate SEO content
   */
  async validateSeoContent(request: any): Promise<any> {
    try {
      const response = await this.api.validateSeoContent(request);
      return response;
    } catch (error) {
      throw new Error(\`SEO validation failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Allocate traffic for A/B test
   */
  async allocateTraffic(request: any): Promise<any> {
    try {
      const response = await this.api.allocateTraffic(request);
      return response;
    } catch (error) {
      throw new Error(\`Traffic allocation failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Check A/B test guardrails
   */
  async checkGuardrails(request: any): Promise<any> {
    try {
      const response = await this.api.checkGuardrails(request);
      return response;
    } catch (error) {
      throw new Error(\`Guardrail check failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Calculate minimum detectable effect
   */
  async calculateMDE(request: any): Promise<any> {
    try {
      const response = await this.api.calculateMDE(request);
      return response;
    } catch (error) {
      throw new Error(\`MDE calculation failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Check allocation safety
   */
  async checkAllocationSafety(request: any): Promise<any> {
    try {
      const response = await this.api.checkAllocationSafety(request);
      return response;
    } catch (error) {
      throw new Error(\`Allocation safety check failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Receive metrics webhook
   */
  async receiveMetrics(request: any): Promise<any> {
    try {
      const response = await this.api.receiveMetrics(request);
      return response;
    } catch (error) {
      throw new Error(\`Metrics webhook failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Upsert variant priors
   */
  async upsertPriors(request: any): Promise<any> {
    try {
      const response = await this.api.upsertPriors(request);
      return response;
    } catch (error) {
      throw new Error(\`Priors upsert failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Generate SEO report
   */
  async generateReport(params: {
    variantId?: string;
    format?: 'json' | 'csv' | 'pdf';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const response = await this.api.generateReport(
        params.variantId,
        params.format,
        params.startDate,
        params.endDate
      );
      return response;
    } catch (error) {
      throw new Error(\`Report generation failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.updateConfiguration();
  }

  /**
   * Set bearer token
   */
  setBearerToken(token: string): void {
    this.config.bearerToken = token;
    this.updateConfiguration();
  }

  /**
   * Set base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
    this.updateConfiguration();
  }

  /**
   * Update API configuration
   */
  private updateConfiguration(): void {
    const configuration = new Configuration({
      basePath: this.config.baseUrl,
      apiKey: this.config.apiKey,
      accessToken: this.config.bearerToken,
      timeout: this.config.timeout,
    });

    this.api = new DefaultApi(configuration);
  }
}

// Export types and client
export * from './models';
export * from './api';
export { DealershipAIClient as default };
`;

  writeFileSync(join(CLIENT_OUTPUT_PATH, 'index.ts'), wrapperContent);
}

function updatePackageJson() {
  try {
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    
    // Add client dependencies if not already present
    const clientDependencies = {
      'whatwg-fetch': '^3.6.2',
      'es6-promise': '^4.2.8',
    };

    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }

    Object.entries(clientDependencies).forEach(([dep, version]) => {
      if (!packageJson.dependencies[dep]) {
        packageJson.dependencies[dep] = version;
      }
    });

    // Add client scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts['generate-client'] = 'ts-node scripts/generate-client.ts';
    packageJson.scripts['validate-openapi'] = 'swagger-codegen validate -i openapi/seo.yml';

    writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.warn('⚠️  Could not update package.json:', error);
  }
}

// Run the generator
generateClient();
