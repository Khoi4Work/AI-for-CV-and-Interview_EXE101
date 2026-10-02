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

- If all changes serve one purpose, stage those files and create one commit.
- If changes serve different purposes, stage only one logical group at a time and create a separate commit for each group.
- Commit subjects must start with a bracketed project tag, followed by a concise imperative description. Use the most suitable tag, normally `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[UI]`, `[DOCS]`, or `[CHORE]`.
- If the user supplied commit-message guidance, use it to describe the commits while retaining the required bracketed tag and imperative wording.
- Add a commit body with a clear, detailed list of what changed and why, following `CLAUDE.md`.
- Do not amend existing commits, push, merge, or create pull requests unless the user separately asks.
- If Git reports a permission or approval block, stop and report it accurately. Never claim staging or committing succeeded when it did not.

## 3. Verify

- After each commit, confirm it exists with `git log -1 --oneline`.
- After all groups, run `git status --short` and report any remaining changes. Do not clean or revert them automatically.

## Completion report

Report the commit hash and subject for each successful commit, the verification result, and any changes left uncommitted or blocked.
