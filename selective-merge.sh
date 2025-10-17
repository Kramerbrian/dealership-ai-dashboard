#!/bin/bash

echo "🔄 Starting selective repository merge..."

# Create merge directories
mkdir -p merged/{dealership-ai,dealershipai-nextjs,dealershipai-dashboard-deploy}

# Function to copy unique files
copy_unique_files() {
    local source_repo="$1"
    local target_dir="$2"
    local analysis_file="$3"
    
    echo "Copying unique files from $source_repo..."
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Get relative path
            relative_path=${file#$source_repo/}
            target_path="merged/$target_dir/$relative_path"
            
            # Create directory if it doesn't exist
            mkdir -p "$(dirname "$target_path")"
            
            # Copy file
            cp "$file" "$target_path"
            echo "  Copied: $relative_path"
        fi
    done < "$analysis_file"
}

# Copy files from each repository
copy_unique_files "/Users/briankramer/dealership-ai" "dealership-ai" "analysis/repo1/unique_files.txt"
copy_unique_files "/Users/briankramer/dealershipai-nextjs" "dealershipai-nextjs" "analysis/repo2/unique_files.txt"
copy_unique_files "/Users/briankramer/dealershipai-dashboard-deploy" "dealershipai-dashboard-deploy" "analysis/repo3/unique_files.txt"

echo "✅ Selective merge complete!"
echo "Review the 'merged' directory and manually integrate files as needed."
