# Project instructions

These instructions apply to AI coding assistants working in this repository. `CLAUDE.md` points Claude Code here so shared project rules stay in one place.

## Project

AI for CV and Interview is a web application for CV improvement and interview preparation.

- Frontend: React, Vite, Tailwind CSS, and React Router in `frontend/`.
- Backend: Java and Spring Boot with a Controller → Service → Repository structure in `backend/`.
- Treat the existing code and configuration as authoritative when details here are incomplete or out of date.

## Working in the repository

- Before changing code, inspect the relevant implementation and nearby tests. Keep changes focused on the user's request.
- Prefer explicit, simple changes that fit existing conventions. Do not invent APIs, requirements, or architecture when the repository or request does not establish them.
- Do not expose secrets or add credentials to tracked files. Follow `.gitignore` and inspect untracked files before including them in a change.
- Run the relevant verification for code changes when requested or needed to support a completion claim. Report what was run and any failures; do not claim checks passed without evidence.
- Ask only when a missing decision materially affects the result or an action is destructive, external, or not clearly authorized. Do not stage, commit, push, deploy, or modify unrelated user work unless asked.

## Terminal and file editing

- Use PowerShell commands such as `Get-Content` and `rg` for reading and searching files. Use `git status` and `git diff` to inspect repository changes.
- Create, edit, move, or delete project files with `apply_patch` or the editor. Do not write files through shell commands, including `Set-Content`, `Out-File`, redirection, or scripts.
- Before running commands that install packages, delete or move files, or stage or commit Git changes, explain the exact command and ask the user for approval.
- Keep all Git commands in this repository and on the current branch unless the user explicitly directs otherwise.

## Project conventions

- Backend code follows the existing layered architecture: Controller → Service → Repository.
- Frontend changes should follow the design and component conventions already present in the relevant feature.
- Commit subjects, when the user asks for a commit, use a project prefix such as `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[UI]`, or `[DOCS]` and an imperative summary.
- Update `SESSIONS.md` only when the user or a task-specific project workflow asks for a session record.

## CV evaluation mock data

When editing `frontend/src/constants/cv/cv-mock-data.js`, keep examples realistic and distinguish strong evidence of impact from vague or unsupported claims. Do not treat any single resume-writing formula as mandatory unless the task asks for it.
