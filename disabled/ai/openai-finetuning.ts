import OpenAI from "openai";
import { DealershipAIOptimizer } from '../optimizer/ai-optimizer-engine';

/**
 * OpenAI Fine-tuning Integration for DealershipAI Optimizer
 * Uses DPO (Direct Preference Optimization) to train specialized models
 */

export interface TrainingExample {
  messages: [
    { role: "user"; content: string },
    { role: "assistant"; content: DealershipAIOptimizer }
  ];
}

export interface FineTuningConfig {
  model: string;
  training_file: string;
  method: {
    type: "dpo";
    dpo: {
      hyperparameters: { beta: number };
    };
  };
}

export class DealershipAIFineTuningService {
  private openai: OpenAI;
  private config: FineTuningConfig;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    this.config = {
      model: "gpt-4o-2024-08-06",
      training_file: "file-all-about-the-AI-search-algorithms",
      method: {
        type: "dpo",
        dpo: {
          hyperparameters: { beta: 0.1 },
        },
      },
    };
  }

  /**
   * Create a fine-tuning job for dealership AI optimization
   */
  async createFineTuningJob(): Promise<OpenAI.FineTuning.FineTuningJob> {
    try {
      console.log('Creating fine-tuning job for DealershipAI optimizer...');
      
      const job = await this.openai.fineTuning.jobs.create({
        training_file: this.config.training_file,
        model: this.config.model,
        method: this.config.method,
      });

      console.log(`Fine-tuning job created: ${job.id}`);
      return job;
    } catch (error) {
      console.error('Error creating fine-tuning job:', error);
      throw error;
    }
  }

  /**
   * Generate training examples for dealership optimization
   */
  generateTrainingExamples(): TrainingExample[] {
    return [
      {
        messages: [
          {
            role: "user",
            content: "List the top SEO opportunity for ABC Toyota in October and explain why."
          },
          {
            role: "assistant",
            content: {
              actionable_win: "Add schema-marked FAQ for top-selling hybrid models and update service hours in GMB",
              opportunity: "Create 'Toyota Rav4 Hybrid owner review' video for UGC and consult with recent buyers",
              score: 0.95,
              explanation: "FAQ schema boosts AI citation and visibility for targeted shoppers. UGC video and GMB sync address both zero-click and AI Overviews ranking gaps."
            }
          }
        ]
      },
      {
        messages: [
          {
            role: "user",
            content: "What's the biggest AI visibility opportunity for Honda of Springfield this month?"
          },
          {
            role: "assistant",
            content: {
              actionable_win: "Implement comprehensive FAQ schema markup for service pages",
              opportunity: "Create structured content answering 'How much does a Honda service cost?' and 'What's included in Honda maintenance?'",
              score: 0.88,
              explanation: "FAQ schema markup helps capture featured snippets and zero-click results, directly improving search visibility without requiring clicks to your site."
            }
          }
        ]
      },
      {
        messages: [
          {
            role: "user",
            content: "Identify the top local SEO opportunity for Ford Dealership in Austin, Texas"
          },
          {
            role: "assistant",
            content: {
              actionable_win: "Optimize Google My Business with updated hours, photos, and service descriptions",
              opportunity: "Create location-specific landing pages for each service area and encourage customer reviews",
              score: 0.82,
              explanation: "Local SEO improvements directly impact local pack visibility and drive foot traffic to your dealership, especially important for automotive services."
            }
          }
        ]
      },
      {
        messages: [
          {
            role: "user",
            content: "What technical SEO improvement would have the highest impact for BMW of Seattle?"
          },
          {
            role: "assistant",
            content: {
              actionable_win: "Implement comprehensive structured data markup for vehicles and services",
              opportunity: "Add JSON-LD schema for LocalBusiness, AutoDealer, and Vehicle schemas to improve search understanding",
              score: 0.78,
              explanation: "Structured data helps search engines understand your business type and inventory, leading to better rich snippets and local search visibility."
            }
          }
        ]
      },
      {
        messages: [
          {
            role: "user",
            content: "What content strategy would best improve AI visibility for Mercedes-Benz of Miami?"
          },
          {
            role: "assistant",
            content: {
              actionable_win: "Develop comprehensive automotive content strategy with buyer guides",
              opportunity: "Create 'Complete Guide to Buying a Used Mercedes-Benz' and 'Mercedes Maintenance Schedule' content",
              score: 0.75,
              explanation: "High-quality, educational content establishes authority in the automotive space and improves search rankings across all search types."
            }
          }
        ]
      }
    ];
  }

  /**
   * Create training file for fine-tuning
   */
  async createTrainingFile(): Promise<string> {
    try {
      const trainingExamples = this.generateTrainingExamples();
      
      // Convert to JSONL format for OpenAI fine-tuning
      const jsonlContent = trainingExamples
        .map(example => JSON.stringify(example))
        .join('\n');

      // In a real implementation, you would upload this to OpenAI
      // For now, we'll return the content
      console.log('Training file content generated:', jsonlContent);
      
      // This would typically be uploaded to OpenAI Files API
      // const file = await this.openai.files.create({
      //   file: new File([jsonlContent], 'dealership-ai-training.jsonl'),
      //   purpose: 'fine-tune'
      // });
      
      return 'file-all-about-the-AI-search-algorithms'; // Return the file ID
    } catch (error) {
      console.error('Error creating training file:', error);
      throw error;
    }
  }

  /**
   * Check fine-tuning job status
   */
  async getFineTuningJobStatus(jobId: string): Promise<OpenAI.FineTuning.FineTuningJob> {
    try {
      const job = await this.openai.fineTuning.jobs.retrieve(jobId);
      return job;
    } catch (error) {
      console.error('Error retrieving fine-tuning job:', error);
      throw error;
    }
  }

  /**
   * List all fine-tuning jobs
   */
  async listFineTuningJobs(): Promise<OpenAI.FineTuning.FineTuningJob[]> {
    try {
      const jobs = await this.openai.fineTuning.jobs.list();
      return jobs.data;
    } catch (error) {
      console.error('Error listing fine-tuning jobs:', error);
      throw error;
    }
  }

  /**
   * Use fine-tuned model for optimization
   */
  async generateOptimizationWithFineTunedModel(
    prompt: string,
    modelId?: string
  ): Promise<DealershipAIOptimizer> {
    try {
      const model = modelId || 'ft:gpt-4o-2024-08-06:dealership-ai:your-model-id';
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a DealershipAI optimizer. Generate structured optimization recommendations using the dealership_ai_optimizer schema. Focus on actionable wins with high impact scores."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "dealership_ai_optimizer",
            strict: true,
            schema: {
              type: "object",
              properties: {
                actionable_win: { type: "string" },
                opportunity: { type: "string" },
                score: { type: "number" },
                explanation: { type: "string" }
              },
              required: ["actionable_win", "opportunity", "score", "explanation"],
              additionalProperties: false
            }
          }
        },
        temperature: 0.7,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from fine-tuned model');
      }

      return JSON.parse(content) as DealershipAIOptimizer;
    } catch (error) {
      console.error('Error generating optimization with fine-tuned model:', error);
      throw error;
    }
  }

  /**
   * Update fine-tuning configuration
   */
  updateConfig(newConfig: Partial<FineTuningConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): FineTuningConfig {
    return this.config;
  }
}

// Export singleton instance
export const dealershipAIFineTuning = new DealershipAIFineTuningService();
