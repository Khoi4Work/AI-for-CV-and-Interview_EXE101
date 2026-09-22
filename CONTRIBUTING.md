# Contributing to AI for CV and Interview

Welcome! To maintain high quality and consistency, this project uses a set of AI Agents to automate the development lifecycle.

## 🤖 AI Agent Workflow

We use Claude Code with a specialized multi-agent orchestration system. If you are using Claude Code, you have access to a powerful automated pipeline.

### The `/code` Command
Instead of implementing features manually, you can use the custom `/code` command:
` /code <your feature request or bug fix description>`

**What happens under the hood?**
1. **Orchestrator**: Analyzes the request and plans the implementation.
2. **Coder**: Writes the actual code following our Layered Architecture.
3. **Tester**: Creates and runs tests to verify the implementation.
4. **Reviewer**: Audits the code for Clean Code and SOLID principles.

### Setup for Collaborators
1. Install [Claude Code CLI](https://claude.ai/code).
2. Pull the latest changes (including the `.claude/` directory).
3. Use the `/code` command for new features or fixes to ensure they pass through the automated review pipeline.

## 🛠 Development Standards

### Git Commit Convention
All commits must use the following prefixes:
- `[FEAT]`: New features.
- `[FIX]`: Bug fixes.
- `[REFACTOR]`: Code changes that neither fix a bug nor add a feature.
- `[UI]`: UI/UX improvements.

### Coding Standards
- **Frontend**: React 19, Tailwind CSS 4.0. Follow the professional, rounded-2xl design system.
- **Backend**: Java, Spring Boot. Strictly adhere to the Controller $\rightarrow$ Service $\rightarrow$ Repository pattern.
- **Documentation**: All session progress must be recorded in `SESSIONS.md`.
