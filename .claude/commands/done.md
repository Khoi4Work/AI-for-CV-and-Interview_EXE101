# Done Command
This command automates the process of staging and committing changes by grouping them based on their purpose (tags), ensuring that changes belonging to the same task/category are committed together.

## Arguments
- `$ARGUMENT`: Optional overarching commit message. If provided, it will be used as a guide for the generated commits.

## Execution
The process focuses on grouping changes by their functional tag:

1. **Change Analysis**:
   - Run `git status` and `git diff` to identify all modified files.
   - Group files that belong to the same logical change or tag (e.g., all `[UI]` changes for a specific feature together, all `[DOCS]` changes together).

2. **Grouped Staging & Committing**:
   - If all changes share the same tag (e.g., everything is `[UI]`):
     - Stage all: `git add .`
     - Commit once: `git commit -m "[UI] <comprehensive_message>"`
   - If changes belong to different tags (e.g., some are `[UI]`, some are `[REFACTOR]`):
     - For each unique tag:
       - Stage only the files for that specific tag.
       - Commit with that tag: `git commit -m "[TAG] <message>"`
   - This ensures that changes for the same task (sharing the same tag) are NOT split up, but different tasks (different tags) ARE separated.

3. **Verification**:
   - Run `git status` to ensure the working tree is clean.

## Post-condition
Changes are recorded in the git history. Files with the same tag are kept in a single commit, while changes with different tags are separated into distinct commits.
`