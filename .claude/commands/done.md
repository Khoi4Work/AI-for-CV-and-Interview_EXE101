# Done Command
This command combines staging and committing changes into a single step.

## Arguments
- `$ARGUMENT`: Optional commit message. If not provided, Claude will generate one following project conventions.

## Execution
1. Run `git add .` to stage all changes.
2. If `$ARGUMENT` is provided:
   Run `git commit -m "$ARGUMENT"`
3. If `$ARGUMENT` is NOT provided:
   - Run `git diff --cached` to analyze staged changes.
   - Generate a commit message following the project's convention (`[FEAT]`, `[FIX]`, `[REFACTOR]`, `[UI]`, `[DOCS]`).
   - Run `git commit -m "<generated_message>"`

## Post-condition
All current changes are staged and recorded in the git history.
