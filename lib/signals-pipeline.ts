// SCS, SIS, ADI, SCR scorers and pipeline
export interface ClaritySignals {
  scs: number; // Search Clarity Score (0-1)
  sis: number; // Silo Integrity Score (0-1)
  adi: number; // Authority Depth Index (0-1)
  scr: number; // Schema Coverage Ratio (0-1)
}

export interface ContentData {
  title: string;
  metaDescription: string;
  headings: string[];
  content: string;
  url: string;
  schemaMarkup: any[];
  internalLinks: string[];
  externalLinks: string[];
  images: Array<{ alt: string; src: string; width?: number; height?: number }>;
  lastModified: Date;
}

export interface AuthorityData {
  authorCredentials: 'high' | 'medium' | 'low';
  citations: number;
  references: number;
  expertContent: number;
  contentAge: number;
  engagementScore: number;
  socialProof: number;
}

export interface SchemaData {
  hasJsonLd: boolean;
  jsonLdValid: boolean;
  completeness: number;
  errorRate: number;
  coverageBreadth: number;
  entityTypes: string[];
}

export class SignalsPipeline {
  // Calculate Search Clarity Score (SCS)
  calculateSCS(contentData: ContentData): number {
    let score = 0;
    
    // Title optimization (0-0.3)
    const titleLength = contentData.title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      score += 0.3;
    } else if (titleLength > 0) {
      score += 0.15;
    }
    
    // Meta description (0-0.2)
    const metaLength = contentData.metaDescription.length;
    if (metaLength >= 120 && metaLength <= 160) {
      score += 0.2;
    } else if (metaLength > 0) {
      score += 0.1;
    }
    
    // Heading structure (0-0.2)
    if (contentData.headings.length > 0) {
      const hasH1 = contentData.headings.some(h => h.startsWith('h1'));
      const properStructure = this.checkHeadingStructure(contentData.headings);
      if (hasH1 && properStructure) {
        score += 0.2;
      } else if (hasH1) {
        score += 0.1;
      }
    }
    
    // URL clarity (0-0.15)
    const urlClarity = this.calculateUrlClarity(contentData.url);
    score += urlClarity * 0.15;
    
    // Internal linking (0-0.15)
    if (contentData.internalLinks.length >= 3) {
      score += 0.15;
    } else if (contentData.internalLinks.length >= 1) {
      score += 0.08;
    }
    
    return Math.min(1, score);
  }

  // Calculate Silo Integrity Score (SIS)
  calculateSIS(contentData: ContentData): number {
    let score = 0;
    
    // Content hierarchy (0-0.3)
    const hierarchyDepth = this.calculateHierarchyDepth(contentData.headings);
    if (hierarchyDepth >= 3) {
      score += 0.3;
    } else if (hierarchyDepth >= 2) {
      score += 0.2;
    }
    
    // Topic clustering (0-0.25)
    const topicClusters = this.identifyTopicClusters(contentData);
    if (topicClusters >= 5) {
      score += 0.25;
    } else if (topicClusters >= 3) {
      score += 0.15;
    }
    
    // Cross-linking (0-0.25)
    const crossLinks = this.calculateCrossLinks(contentData.internalLinks);
    if (crossLinks >= 10) {
      score += 0.25;
    } else if (crossLinks >= 5) {
      score += 0.15;
    }
    
    // Content depth (0-0.2)
    const contentDepth = contentData.content.length;
    if (contentDepth >= 1500) {
      score += 0.2;
    } else if (contentDepth >= 800) {
      score += 0.1;
    }
    
    return Math.min(1, score);
  }

  // Calculate Authority Depth Index (ADI)
  calculateADI(authorityData: AuthorityData): number {
    let score = 0;
    
    // Expert content (0-0.3)
    if (authorityData.expertContent >= 0.8) {
      score += 0.3;
    } else if (authorityData.expertContent >= 0.5) {
      score += 0.2;
    }
    
    // Citations (0-0.25)
    if (authorityData.citations >= 5) {
      score += 0.25;
    } else if (authorityData.citations >= 2) {
      score += 0.15;
    }
    
    // Author credentials (0-0.2)
    switch (authorityData.authorCredentials) {
      case 'high':
        score += 0.2;
        break;
      case 'medium':
        score += 0.1;
        break;
      case 'low':
        score += 0.05;
        break;
    }
    
    // Content freshness (0-0.15)
    if (authorityData.contentAge <= 30) { // 30 days
      score += 0.15;
    } else if (authorityData.contentAge <= 90) {
      score += 0.1;
    }
    
    // User engagement (0-0.1)
    if (authorityData.engagementScore >= 0.7) {
      score += 0.1;
    } else if (authorityData.engagementScore >= 0.4) {
      score += 0.05;
    }
    
    return Math.min(1, score);
  }

  // Calculate Schema Coverage Ratio (SCR)
  calculateSCR(schemaData: SchemaData): number {
    let score = 0;
    
    // JSON-LD implementation (0-0.4)
    if (schemaData.hasJsonLd && schemaData.jsonLdValid) {
      score += 0.4;
    } else if (schemaData.hasJsonLd) {
      score += 0.2;
    }
    
    // Schema completeness (0-0.3)
    if (schemaData.completeness >= 0.8) {
      score += 0.3;
    } else if (schemaData.completeness >= 0.5) {
      score += 0.2;
    }
    
    // Error rate (0-0.2)
    if (schemaData.errorRate <= 0.05) {
      score += 0.2;
    } else if (schemaData.errorRate <= 0.15) {
      score += 0.1;
    }
    
    // Coverage breadth (0-0.1)
    if (schemaData.coverageBreadth >= 0.7) {
      score += 0.1;
    } else if (schemaData.coverageBreadth >= 0.4) {
      score += 0.05;
    }
    
    return Math.min(1, score);
  }

  // Calculate all clarity signals
  calculateClaritySignals(
    contentData: ContentData,
    authorityData: AuthorityData,
    schemaData: SchemaData
  ): ClaritySignals {
    return {
      scs: this.calculateSCS(contentData),
      sis: this.calculateSIS(contentData),
      adi: this.calculateADI(authorityData),
      scr: this.calculateSCR(schemaData)
    };
  }

  // Helper methods
  private checkHeadingStructure(headings: string[]): boolean {
    let lastLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.charAt(1));
      if (level > lastLevel + 1) {
        return false; // Skip levels
      }
      lastLevel = level;
    }
    return true;
  }

  private calculateUrlClarity(url: string): number {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(s => s.length > 0);
    
    // Check for descriptive segments
    const descriptiveSegments = pathSegments.filter(seg => 
      seg.length > 2 && /[a-zA-Z]/.test(seg)
    ).length;
    
    // Check for parameters
    const hasParams = urlObj.search.length > 0;
    
    // Check for fragments
    const hasFragment = urlObj.hash.length > 0;
    
    let score = 0;
    if (descriptiveSegments >= 2) score += 0.5;
    else if (descriptiveSegments >= 1) score += 0.3;
    
    if (!hasParams) score += 0.3;
    if (!hasFragment) score += 0.2;
    
    return Math.min(1, score);
  }

  private calculateHierarchyDepth(headings: string[]): number {
    const levels = new Set<number>();
    for (const heading of headings) {
      const level = parseInt(heading.charAt(1));
      levels.add(level);
    }
    return levels.size;
  }

  private identifyTopicClusters(contentData: ContentData): number {
    // Simple topic clustering based on keyword density
    const content = contentData.content.toLowerCase();
    const topics = [
      'automotive', 'car', 'vehicle', 'dealer', 'dealership',
      'sales', 'service', 'parts', 'finance', 'insurance',
      'new', 'used', 'certified', 'pre-owned', 'lease'
    ];
    
    let clusters = 0;
    for (const topic of topics) {
      const matches = (content.match(new RegExp(topic, 'g')) || []).length;
      if (matches >= 3) {
        clusters++;
      }
    }
    
    return clusters;
  }

  private calculateCrossLinks(internalLinks: string[]): number {
    // Count unique internal links
    const uniqueLinks = new Set(internalLinks);
    return uniqueLinks.size;
  }
}

// Export singleton instance
export const signalsPipeline = new SignalsPipeline();
