/**
 * DealershipAI Hyper-Intelligence Bandit Algorithm
 * Upper Confidence Bound (UCB1) implementation for auto-healing system
 */

export interface BanditArm {
  id: string;
  name: string;
  description: string;
  expectedValue: number;
  confidence: number;
}

export interface BanditResult {
  selectedArm: string;
  confidence: number;
  expectedReward: number;
  reasoning: string;
}

export interface BanditStats {
  armId: string;
  pulls: number;
  totalReward: number;
  averageReward: number;
  confidence: number;
}

export class UCB1Bandit {
  private arms: BanditArm[];
  private stats: Map<string, BanditStats>;
  private totalPulls: number;
  
  constructor(arms: BanditArm[]) {
    this.arms = arms;
    this.stats = new Map();
    this.totalPulls = 0;
    
    // Initialize stats for each arm
    arms.forEach(arm => {
      this.stats.set(arm.id, {
        armId: arm.id,
        pulls: 0,
        totalReward: 0,
        averageReward: 0,
        confidence: 0
      });
    });
  }
  
  /**
   * Select the best arm using UCB1 algorithm
   */
  selectArm(): BanditResult {
    // If we haven't pulled all arms at least once, select the first unpulled arm
    for (const arm of this.arms) {
      const stats = this.stats.get(arm.id);
      if (stats && stats.pulls === 0) {
        return {
          selectedArm: arm.id,
          confidence: 1.0,
          expectedReward: arm.expectedValue,
          reasoning: `Initial exploration of arm ${arm.name}`
        };
      }
    }
    
    // Calculate UCB1 values for all arms
    const ucbValues = this.arms.map(arm => {
      const stats = this.stats.get(arm.id);
      if (!stats) return null;

      const averageReward = stats.averageReward;
      const confidence = Math.sqrt(2 * Math.log(this.totalPulls) / stats.pulls);
      const ucbValue = averageReward + confidence;

      return {
        armId: arm.id,
        ucbValue,
        averageReward,
        confidence
      };
    }).filter((v): v is { armId: string; ucbValue: number; averageReward: number; confidence: number } => v !== null);

    // Select arm with highest UCB value
    const bestArm = ucbValues.reduce((best, current) =>
      current.ucbValue > best.ucbValue ? current : best
    );

    const selectedArm = this.arms.find(arm => arm.id === bestArm.armId);

    return {
      selectedArm: bestArm.armId,
      confidence: bestArm.confidence,
      expectedReward: bestArm.averageReward,
      reasoning: `UCB1 selected ${selectedArm?.name} with value ${bestArm.ucbValue.toFixed(3)}`
    };
  }
  
  /**
   * Update arm statistics after receiving reward
   */
  update(armId: string, reward: number): void {
    const stats = this.stats.get(armId);
    if (!stats) return;
    
    // Update statistics
    stats.pulls += 1;
    stats.totalReward += reward;
    stats.averageReward = stats.totalReward / stats.pulls;
    
    // Update confidence
    if (stats.pulls > 0) {
      stats.confidence = Math.sqrt(2 * Math.log(this.totalPulls) / stats.pulls);
    }
    
    this.totalPulls += 1;
  }
  
  /**
   * Get current statistics for all arms
   */
  getStats(): BanditStats[] {
    return Array.from(this.stats.values());
  }
  
  /**
   * Get the best performing arm
   */
  getBestArm(): BanditStats | null {
    const stats = this.getStats();
    if (stats.length === 0) return null;
    
    return stats.reduce((best, current) => 
      current.averageReward > best.averageReward ? current : best
    );
  }
  
  /**
   * Reset bandit statistics
   */
  reset(): void {
    this.stats.clear();
    this.totalPulls = 0;
    
    this.arms.forEach(arm => {
      this.stats.set(arm.id, {
        armId: arm.id,
        pulls: 0,
        totalReward: 0,
        averageReward: 0,
        confidence: 0
      });
    });
  }
}

/**
 * Auto-healing bandit for DealershipAI
 */
export class AutoHealBandit extends UCB1Bandit {
  constructor() {
    const arms: BanditArm[] = [
      {
        id: 'republish',
        name: 'Republish',
        description: 'Republish inventory data to all channels',
        expectedValue: 150,
        confidence: 0.8
      },
      {
        id: 'purge',
        name: 'Purge',
        description: 'Remove stale or invalid data',
        expectedValue: 200,
        confidence: 0.9
      },
      {
        id: 'perf',
        name: 'Performance',
        description: 'Optimize page performance and speed',
        expectedValue: 100,
        confidence: 0.7
      },
      {
        id: 'answer',
        name: 'Answer Engine',
        description: 'Update AI answer engine visibility',
        expectedValue: 300,
        confidence: 0.85
      }
    ];
    
    super(arms);
  }
  
  /**
   * Evaluate if auto-heal should be executed
   */
  shouldAutoHeal(task: any): boolean {
    const { expectedValueUSD, confidence } = task;
    
    // Auto-heal if EV >= $150 and confidence >= 0.8
    return expectedValueUSD >= 150 && confidence >= 0.8;
  }
  
  /**
   * Select the best auto-heal action
   */
  selectAutoHealAction(task: any): BanditResult {
    const result = this.selectArm();
    
    // Log the decision
    console.log(`Auto-heal decision: ${result.selectedArm} for task ${task.id}`);
    console.log(`Reasoning: ${result.reasoning}`);
    
    return result;
  }
  
  /**
   * Update bandit with repair outcome
   */
  updateRepairOutcome(armId: string, success: boolean, valueSaved: number): void {
    const reward = success ? valueSaved : 0;
    this.update(armId, reward);
  }
}

/**
 * Contextual bandit for different problem types
 */
export class ContextualBandit {
  private bandits: Map<string, UCB1Bandit>;
  
  constructor() {
    this.bandits = new Map();
    
    // Initialize bandits for different contexts
    this.initializeContextualBandits();
  }
  
  private initializeContextualBandits(): void {
    // Freshness problems
    this.bandits.set('freshness', new UCB1Bandit([
      { id: 'update_prices', name: 'Update Prices', description: 'Refresh pricing data', expectedValue: 100, confidence: 0.8 },
      { id: 'update_photos', name: 'Update Photos', description: 'Refresh vehicle photos', expectedValue: 80, confidence: 0.7 },
      { id: 'update_mileage', name: 'Update Mileage', description: 'Refresh mileage data', expectedValue: 60, confidence: 0.6 }
    ]));
    
    // Parity problems
    this.bandits.set('parity', new UCB1Bandit([
      { id: 'sync_channels', name: 'Sync Channels', description: 'Synchronize across all channels', expectedValue: 200, confidence: 0.9 },
      { id: 'fix_pricing', name: 'Fix Pricing', description: 'Correct pricing inconsistencies', expectedValue: 150, confidence: 0.8 },
      { id: 'update_availability', name: 'Update Availability', description: 'Fix availability status', expectedValue: 120, confidence: 0.7 }
    ]));
    
    // Policy problems
    this.bandits.set('policy', new UCB1Bandit([
      { id: 'review_policies', name: 'Review Policies', description: 'Review and update policies', expectedValue: 100, confidence: 0.8 },
      { id: 'update_disclosures', name: 'Update Disclosures', description: 'Update required disclosures', expectedValue: 80, confidence: 0.7 },
      { id: 'fix_compliance', name: 'Fix Compliance', description: 'Address compliance issues', expectedValue: 120, confidence: 0.9 }
    ]));
  }
  
  /**
   * Select action based on problem context
   */
  selectAction(context: string, task: any): BanditResult {
    const bandit = this.bandits.get(context);
    if (!bandit) {
      throw new Error(`No bandit found for context: ${context}`);
    }
    
    return bandit.selectArm();
  }
  
  /**
   * Update bandit with outcome
   */
  updateOutcome(context: string, armId: string, reward: number): void {
    const bandit = this.bandits.get(context);
    if (bandit) {
      bandit.update(armId, reward);
    }
  }
  
  /**
   * Get statistics for all contexts
   */
  getAllStats(): Map<string, BanditStats[]> {
    const allStats = new Map();
    
    this.bandits.forEach((bandit, context) => {
      allStats.set(context, bandit.getStats());
    });
    
    return allStats;
  }
}

/**
 * Multi-armed bandit for task prioritization
 */
export class TaskPrioritizationBandit extends UCB1Bandit {
  constructor() {
    const arms: BanditArm[] = [
      {
        id: 'high_urgency',
        name: 'High Urgency',
        description: 'Tasks with high urgency and impact',
        expectedValue: 500,
        confidence: 0.9
      },
      {
        id: 'medium_urgency',
        name: 'Medium Urgency',
        description: 'Tasks with medium urgency and impact',
        expectedValue: 200,
        confidence: 0.7
      },
      {
        id: 'low_urgency',
        name: 'Low Urgency',
        description: 'Tasks with low urgency and impact',
        expectedValue: 50,
        confidence: 0.5
      }
    ];
    
    super(arms);
  }
  
  /**
   * Prioritize tasks based on urgency and impact
   */
  prioritizeTasks(tasks: any[]): any[] {
    return tasks.sort((a, b) => {
      const aResult = this.selectArm();
      const bResult = this.selectArm();
      
      return bResult.expectedReward - aResult.expectedReward;
    });
  }
}
