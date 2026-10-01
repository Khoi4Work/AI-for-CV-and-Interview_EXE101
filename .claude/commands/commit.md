# Commit Command
This command commits the currently staged changes with a specific message.

## Arguments
- `$ARGUMENT`: The commit message. If not provided, Claude will generate a suitable message based on the changes.

## Execution
If `$ARGUMENT` is provided:
`git commit -m "$ARGUMENT"`

If `$ARGUMENT` is NOT provided:
1. Run `git diff --cached` to see staged changes.
2. Generate a commit message following the project's convention (`[FEAT]`, `[FIX]`, `[REFACTOR]`, `[UI]`, `[DOCS]`).
3. Run `git commit -m "<generated_message>"`

## Post-condition
Changes are permanently recorded in the git history.
