# Done Command
This command automates the process of staging and committing changes, grouped by their respective tags to maintain a clean git history.

## Arguments
- `$ARGUMENT`: Optional overarching commit message. If provided, this will be used for the final combined commit or as a guide. If NOT provided, Claude will analyze changes and generate specific messages.

## Execution
Instead of a single `git add .`, the process must be granular:

1. **Change Analysis**:
   - Run `git status` and `git diff` to identify all modified files.
   - Categorize each file/change based on the project's tags (`[FEAT]`, `[FIX]`, `[REFACTOR]`, `[UI]`, `[DOCS]`, etc.).

2. **Grouped Staging & Committing**:
   - For each unique tag identified (e.g., `[DOCS]`, `[REFACTOR]`):
     - Stage only the files belonging to that tag: `git add <file1> <file2> ...`
     - Generate a concise commit message starting with that tag.
     - Execute: `git commit -m "[TAG] <message>"`
   - Repeat this process until all changed files are committed.

3. **Verification**:
   - Run `git status` to ensure the working tree is clean.

## Post-condition
All changes are recorded in the git history, separated into logical, tag-based commits rather than one monolithic commit.
`