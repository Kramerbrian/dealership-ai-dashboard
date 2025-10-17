# DealershipAI Repository Integration Guide

## Overview
This guide helps you integrate files from multiple DealershipAI repositories into your main `dealership-ai-dashboard` repository.

## Current Repository Status

### Main Repository: `dealership-ai-dashboard`
- **Status**: ✅ Most complete
- **Features**: Ory authentication, full Next.js app, all integrations
- **GitHub**: https://github.com/Kramerbrian/dealership-ai-dashboard.git

### Repository 1: `dealership-ai`
- **Status**: 📦 Older version
- **GitHub**: https://github.com/Kramerbrian/dealership-ai.git
- **Unique files**: See analysis/repo1/unique_files.txt

### Repository 2: `dealershipai-nextjs`
- **Status**: 📦 Next.js focused
- **GitHub**: https://github.com/Kramerbrian/dealershipai.git
- **Unique files**: See analysis/repo2/unique_files.txt

### Repository 3: `dealershipai-dashboard-deploy`
- **Status**: 📦 Deployment focused
- **Unique files**: See analysis/repo3/unique_files.txt

## Integration Steps

### Step 1: Review Analysis
```bash
# View unique files from each repository
cat analysis/repo1/unique_files.txt
cat analysis/repo2/unique_files.txt
cat analysis/repo3/unique_files.txt
```

### Step 2: Run Selective Merge
```bash
./selective-merge.sh
```

### Step 3: Manual Integration
1. Review files in the `merged/` directory
2. Identify files that should be integrated into the main repository
3. Copy or merge unique functionality
4. Update imports and references

### Step 4: Clean Up
1. Test the integrated application
2. Remove duplicate files
3. Update documentation
4. Commit changes to git

## Recommended Actions

### Keep in Main Repository
- All current functionality (it's the most complete)
- Ory authentication setup
- Next.js application structure
- Database schemas and migrations

### Consider Integrating
- Unique components from other repositories
- Different deployment configurations
- Additional documentation
- Alternative implementations

### Archive/Delete
- Duplicate files
- Outdated implementations
- Unused configurations

## Next Steps

1. **Review the analysis files** to understand what's unique in each repository
2. **Run the selective merge** to prepare files for integration
3. **Manually review and integrate** only the files you need
4. **Test thoroughly** before committing changes
5. **Update GitHub repositories** as needed

## Safety Notes

- Your main repository remains unchanged until you decide to integrate
- All unique files are preserved in the `merged/` directory
- You can always revert changes using git
- Consider creating a new branch for integration work

## Disk Space Management

Since disk space is limited (99% full):
- The analysis approach is lightweight (no full backups)
- Only unique files are copied to the `merged/` directory
- You can delete the `merged/` directory after integration
- Consider cleaning up `node_modules` directories in other repositories
