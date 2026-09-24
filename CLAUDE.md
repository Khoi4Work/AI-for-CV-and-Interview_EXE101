# CLAUDE.md - Project Intelligence Guide

This file serves as the "Source of Truth" for Claude Code. It defines the project's identity, technical constraints, and behavioral expectations to ensure consistency across all sessions and as the project scales.

## 🎯 Project Overview
**Name**: AI for CV and Interview
**Goal**: A comprehensive platform for AI-driven CV optimization and interview preparation.
**Current Stage**: Initial codebase established. Core directory structures and basic UI shells are implemented.

**Note for Contributors**: Please read [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and the AI Agent workflow.

## 🛠 Technical Architecture

### 🎨 Frontend (Client Side)
- **Framework**: React 19 (SPA)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.0
- **Routing**: `react-router-dom`
- **Iconography**: `lucide-react`
- **Directory**: `frontend/`
- **Design System**:
  - Primary Color: `#0b3c8f` (Deep Blue)
  - Style: Clean, professional, rounded-2xl corners, subtle shadows.

### ⚙️ Backend (Server Side)
- **Language**: Java
- **Framework**: Spring Boot
- **Build Tool**: Maven
- **Architecture Pattern**: Layered Architecture (`Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository`)
- **Directory**: `backend/`

## 📂 Directory Map
- `frontend/`: Complete frontend source, assets, and config.
- `backend/`: Complete Java backend source and Maven config.
- `.gitignore`: Configured to ignore `node_modules/`, `target/`, `.idea/`, `.claude/`.

## ⚠️ Critical Rules & Constraints
- **Git Commits**: Must strictly use prefixes like `[FEAT]`, `[FIX]`, `[REFACTOR]`.
- **Session Tracking**: All session records MUST be kept exclusively in `SESSIONS.md`. Never create separate files.
- **Agentic Principles**: Strictly follow the **Plan $\rightarrow$ Execute $\rightarrow$ Observe $\rightarrow$ Reflect** cycle.

## 📜 Development Guidelines

### 🖋 Coding Standards
- **Token Efficiency**: Stop immediately and ask for feedback if a tool call (especially `Edit`) fails more than 3 times. Do not blindly retry; analyze the failure, read the file again, and propose a new approach.
- **Explicit File Access**: Do not use wildcards (`*`) or broad globs to "guess" or "sweep" files when a specific target is unknown. If a file is not found or its location is unclear, ask the user for the exact path or request further guidance.
- **Simplicity**: Prefer clear, explicit logic over "clever" abstractions.
- **Boring Code**: Prioritize stability and predictability over innovative but fragile patterns.

### 🛠 Implementation Workflow
1. **Plan**: Define the logic and identify impacted files.
2. **Execute**: Implement the change with high precision.
3. **Verify**: Confirm the fix via logs, tests, or visual check.
4. **Reflect**: Evaluate if the implementation adheres to the project's design system and architecture.
5. **Record**: Update `SESSIONS.md` immediately after completing a task or ending a session to maintain a clear project trail.

### 🗒 Session & Progress Tracking
- **SESSIONS.md Autonomy**: Claude has full standing authorization to modify `SESSIONS.md` to record progress, task completions, and session summaries. Do not ask for permission to update this file. All session records must be kept exclusively within `SESSIONS.md`; do not create separate markdown files for sessions (e.g., avoid formats like `[absolute path]+[date]`).
- **End-of-Session Clean-up**: Before ending a session or switching tasks, Claude MUST check for uncommitted changes using `git status` and `git log`. If "stale" code (code modified but not committed) is found, Claude must explicitly remind the user to commit these changes to avoid "code rotting" or lost work.

### 🚀 Git & Version Control
- **Commit Title**: Must start with a prefix in brackets (e.g., `[FEAT]`, `[FIX]`, `[REFACTOR]`), followed by a concise and imperative description (e.g., `[FEAT] Add logout button`).
- **Commit Description**: Detailed list of what was changed and why.
- **No Co-authoring**: Standard commits without external attribution.

## 🤖 Agentic Principles (Andrej Karpathy)
When acting as an agent in this repository, adhere to these four pillars:

1. **Iterative Loop**: Never expect a perfect one-shot solution. Always cycle through: **Plan $\rightarrow$ Execute $\rightarrow$ Observe $\rightarrow$ Reflect**.
2. **Tool-Centric Action**: Use the provided shell and filesystem tools to verify state. Do not assume; check the actual code.
3. **Explicit Reasoning**: maintain a clear "thought trace" before executing commands to ensure the path to the goal is logical.
4. **Verification-Driven**: A task is NOT complete until it is verified. Every change must be checked against the objective before marking as resolved.

## 📊 Mock Data Standards (CV Evaluation)
Mock CV data in `frontend/src/constants/cv/cv-mock-data.js` is built based on professional HR standards:
- **Excellent CVs**: Follow the **Google XYZ Formula** ("Accomplished [X] as measured by [Y], by doing [Z]") and focus on **Impact over Activity** (quantifiable results over task listing). Based on FAANG/Ivy League recruiting patterns.
- **Poor CVs**: Synthesize common **HR Red Flags** (vague descriptions, unprofessional contact, "fluff" summaries without evidence, and lack of digital presence).

