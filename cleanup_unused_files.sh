#!/bin/bash

# Script to add .bak suffix to unused files identified by knip
# This makes them safe to remove later while keeping backups

# Array of unused files from knip output
unused_files=(
    "src/components/auth/FormInput.tsx"
    "src/components/game/board-components/ChainTargetUI.tsx"
    "src/components/game/board-components/GameBoardHand.tsx"
    "src/components/game/board-components/GameBoardHeader.tsx"
    "src/components/game/board-components/GameBoardLayout.tsx"
    "src/components/game/board-components/GameControls.tsx"
    "src/components/game/board-components/GameStatus.tsx"
    "src/components/game/board-components/PendingChoicesOverlay.tsx"
    "src/components/game/board-components/PlayerHand.tsx"
    "src/components/game/board-components/RoundTracker.tsx"
    "src/components/ui/GameControls.tsx"
    "src/hooks/useAvatarUrl.ts"
    "src/hooks/useGameBoardCallbacks.ts"
)

# Change to the frontend directory
cd darknet-duel-frontend || {
    echo "Error: darknet-duel-frontend directory not found"
    exit 1
}

echo "Adding .bak suffix to unused files..."
echo "========================================="

# Counter for processed files
processed=0
errors=0

# Process each unused file
for file in "${unused_files[@]}"; do
    if [ -f "$file" ]; then
        # Create backup by renaming with .bak suffix
        if mv "$file" "$file.bak"; then
            echo "✓ Backed up: $file -> $file.bak"
            ((processed++))
        else
            echo "✗ Failed to backup: $file"
            ((errors++))
        fi
    else
        echo "⚠ File not found: $file"
        ((errors++))
    fi
done

echo "========================================="
echo "Summary:"
echo "- Files processed: $processed"
echo "- Errors/warnings: $errors"
echo ""
echo "The unused files have been renamed with .bak suffix."
echo "You can safely delete them later or restore them by removing the .bak suffix."
echo ""
echo "To delete all .bak files later, run:"
echo "find . -name '*.bak' -type f -delete"
echo ""
echo "To restore a specific file, run:"
echo "mv filename.bak filename"