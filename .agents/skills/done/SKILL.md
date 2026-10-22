---
name: done
description: Review all current Git changes, group them by purpose, stage each group, create convention-compliant commits, and verify the final Git status. Invoke explicitly with $done when the user asks to finish, add, and commit work.
---

# Done

Run this workflow when explicitly invoked as `$done` or when the user asks to run the project's done command. An optional message after `$done` is the overarching commit-message guidance.

## 1. Inspect changes

- Run `git status --short`, `git diff`, and `git diff --cached`.
- Inspect untracked files relevant to this work before staging them.
- Identify the logical purpose of every changed file and group related files together. Do not group unrelated tasks just to reduce the number of commits.
- Preserve pre-existing staged changes and include them only if they belong to this done operation; do not discard or reset user changes.

## 2. Stage and commit by group

- Immediately before **each** Git operation that may trigger a permission or approval prompt—including every separate `git add` and every `git commit`—send the user a concise, plain-language summary of that specific operation. Do not reuse one batch summary for later operations, and do not paste shell syntax or the terminal command as the summary.
- Before `git add`, say which change group or files will be staged and why. Before `git commit`, state the planned commit subject and summarize the changes that commit contains. If requesting elevated permission, describe the operation and purpose in the approval justification instead of repeating the raw command.
- These summaries are informational heads-ups, not yes/no approval questions; do not phrase them as “Do you accept?”
- If all changes serve one purpose, stage those files and create one commit.
- If changes serve different purposes, stage only one logical group at a time and create a separate commit for each group.
- Commit subjects must start with a bracketed project tag, followed by a concise imperative description. Use the most suitable tag, normally `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[UI]`, `[DOCS]`, or `[CHORE]`.
- If the user supplied commit-message guidance, use it to describe the commits while retaining the required bracketed tag and imperative wording.
- Add a commit body with a clear, detailed list of what changed and why, following `CLAUDE.md`.
- Do not amend existing commits, push, merge, or create pull requests unless the user separately asks.
- If a Git operation is denied by the sandbox or requires approval, request elevated permission for that specific operation with a concise justification, then retry it after approval. Continue the workflow if it succeeds. If approval is denied or the retry still fails, stop and report the exact block. Never claim staging or committing succeeded when it did not.

## 3. Verify

- After each commit, confirm it exists with `git log -1 --oneline`.
- After all groups, run `git status --short` and report any remaining changes. Do not clean or revert them automatically.

## Completion report

Report the commit hash and subject for each successful commit, the verification result, and any changes left uncommitted or blocked.
