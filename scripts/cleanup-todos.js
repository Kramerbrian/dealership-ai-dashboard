#!/usr/bin/env node

/**
 * TODO Cleanup Script
 * Finds and helps manage TODO items in the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TODO_PATTERNS = [
  /\/\/\s*TODO:?\s*(.+)/gi,
  /\/\*\s*TODO:?\s*(.+?)\s*\*\//gi,
  /\/\/\s*FIXME:?\s*(.+)/gi,
  /\/\*\s*FIXME:?\s*(.+?)\s*\*\//gi,
  /\/\/\s*HACK:?\s*(.+)/gi,
  /\/\*\s*HACK:?\s*(.+?)\s*\*\//gi,
  /\/\/\s*XXX:?\s*(.+)/gi,
  /\/\*\s*XXX:?\s*(.+?)\s*\*\//gi,
];

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /coverage/,
  /dist/,
  /build/,
];

class TodoCleanup {
  constructor() {
    this.todos = [];
    this.stats = {
      total: 0,
      byType: {},
      byFile: {},
      byPriority: { high: 0, medium: 0, low: 0 }
    };
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!IGNORE_PATTERNS.some(pattern => pattern.test(filePath))) {
          this.scanDirectory(filePath);
        }
      } else if (this.isCodeFile(file)) {
        this.scanFile(filePath);
      }
    }
  }

  isCodeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'].includes(ext);
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        TODO_PATTERNS.forEach(pattern => {
          const matches = [...line.matchAll(pattern)];
          matches.forEach(match => {
            const todo = {
              file: filePath,
              line: index + 1,
              content: match[0].trim(),
              description: match[1]?.trim() || '',
              type: this.getTodoType(match[0]),
              priority: this.getPriority(match[1] || ''),
              raw: line.trim()
            };
            
            this.todos.push(todo);
            this.updateStats(todo);
          });
        });
      });
    } catch (error) {
      console.warn(`Error reading file ${filePath}:`, error.message);
    }
  }

  getTodoType(content) {
    if (content.includes('TODO')) return 'TODO';
    if (content.includes('FIXME')) return 'FIXME';
    if (content.includes('HACK')) return 'HACK';
    if (content.includes('XXX')) return 'XXX';
    return 'UNKNOWN';
  }

  getPriority(description) {
    const desc = description.toLowerCase();
    if (desc.includes('urgent') || desc.includes('critical') || desc.includes('security')) {
      return 'high';
    }
    if (desc.includes('important') || desc.includes('soon') || desc.includes('performance')) {
      return 'medium';
    }
    return 'low';
  }

  updateStats(todo) {
    this.stats.total++;
    this.stats.byType[todo.type] = (this.stats.byType[todo.type] || 0) + 1;
    this.stats.byFile[todo.file] = (this.stats.byFile[todo.file] || 0) + 1;
    this.stats.byPriority[todo.priority]++;
  }

  generateReport() {
    console.log('\n📋 TODO Cleanup Report');
    console.log('='.repeat(50));
    
    console.log(`\n📊 Total TODOs found: ${this.stats.total}`);
    
    console.log('\n📈 By Type:');
    Object.entries(this.stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\n🎯 By Priority:');
    Object.entries(this.stats.byPriority).forEach(([priority, count]) => {
      const emoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
      console.log(`  ${emoji} ${priority}: ${count}`);
    });
    
    console.log('\n📁 Files with most TODOs:');
    Object.entries(this.stats.byFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([file, count]) => {
        console.log(`  ${file}: ${count}`);
      });
  }

  generateDetailedReport() {
    console.log('\n📝 Detailed TODO List');
    console.log('='.repeat(50));
    
    // Group by priority
    const byPriority = {
      high: this.todos.filter(t => t.priority === 'high'),
      medium: this.todos.filter(t => t.priority === 'medium'),
      low: this.todos.filter(t => t.priority === 'low')
    };
    
    Object.entries(byPriority).forEach(([priority, todos]) => {
      if (todos.length === 0) return;
      
      const emoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
      console.log(`\n${emoji} ${priority.toUpperCase()} Priority (${todos.length} items)`);
      console.log('-'.repeat(30));
      
      todos.forEach(todo => {
        console.log(`\n${todo.file}:${todo.line}`);
        console.log(`  ${todo.content}`);
        if (todo.description) {
          console.log(`  Description: ${todo.description}`);
        }
      });
    });
  }

  generateActionPlan() {
    console.log('\n🎯 Action Plan');
    console.log('='.repeat(50));
    
    const highPriority = this.todos.filter(t => t.priority === 'high');
    const mediumPriority = this.todos.filter(t => t.priority === 'medium');
    
    console.log('\n🔴 HIGH PRIORITY - Address immediately:');
    highPriority.forEach(todo => {
      console.log(`  • ${todo.file}:${todo.line} - ${todo.description || 'No description'}`);
    });
    
    console.log('\n🟡 MEDIUM PRIORITY - Address this sprint:');
    mediumPriority.slice(0, 10).forEach(todo => {
      console.log(`  • ${todo.file}:${todo.line} - ${todo.description || 'No description'}`);
    });
    
    if (mediumPriority.length > 10) {
      console.log(`  ... and ${mediumPriority.length - 10} more`);
    }
    
    console.log('\n📋 Recommendations:');
    console.log('  1. Create GitHub issues for high-priority TODOs');
    console.log('  2. Add proper descriptions to TODOs without them');
    console.log('  3. Convert TODOs to proper feature requests');
    console.log('  4. Remove outdated TODOs that are no longer relevant');
    console.log('  5. Implement proper error handling instead of HACK comments');
  }

  generateMarkdownReport() {
    const report = `# TODO Cleanup Report

Generated on: ${new Date().toISOString()}

## Summary

- **Total TODOs**: ${this.stats.total}
- **High Priority**: ${this.stats.byPriority.high}
- **Medium Priority**: ${this.stats.byPriority.medium}
- **Low Priority**: ${this.stats.byPriority.low}

## By Type

${Object.entries(this.stats.byType).map(([type, count]) => `- **${type}**: ${count}`).join('\n')}

## High Priority Items

${this.todos.filter(t => t.priority === 'high').map(todo => 
  `- [ ] **${todo.file}:${todo.line}** - ${todo.description || 'No description'}`
).join('\n')}

## Files with Most TODOs

${Object.entries(this.stats.byFile)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([file, count]) => `- **${file}**: ${count}`)
  .join('\n')}
`;

    fs.writeFileSync('TODO_REPORT.md', report);
    console.log('\n📄 Markdown report saved to TODO_REPORT.md');
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const showDetailed = args.includes('--detailed');
  const showActionPlan = args.includes('--action-plan');
  const generateMarkdown = args.includes('--markdown');
  
  console.log('🔍 Scanning codebase for TODOs...');
  
  const cleanup = new TodoCleanup();
  cleanup.scanDirectory('.');
  
  cleanup.generateReport();
  
  if (showDetailed) {
    cleanup.generateDetailedReport();
  }
  
  if (showActionPlan) {
    cleanup.generateActionPlan();
  }
  
  if (generateMarkdown) {
    cleanup.generateMarkdownReport();
  }
  
  console.log('\n✅ Scan complete!');
}

if (require.main === module) {
  main();
}

module.exports = TodoCleanup;
