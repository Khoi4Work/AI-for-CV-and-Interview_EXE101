# CLAUDE.md - Project Intelligence Guide

This file serves as the "Source of Truth" for Claude Code. It defines the project's identity, technical constraints, and behavioral expectations to ensure consistency across all sessions and as the project scales.

## 🎯 Project Overview
**Name**: AI for CV and Interview
**Goal**: A comprehensive platform for AI-driven CV optimization and interview preparation.
**Current Stage**: Initial codebase established. Core directory structures and basic UI shells are implemented.

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

### 📚 Reference Material
- **Directory**: `importedCode/`
- **Status**: Explicitly ignored by Git (`.gitignore`).
- **Usage**: Treat as read-only reference. Do not move or modify these files unless explicitly instructed.

## 📂 Directory Map
- `frontend/`: Complete frontend source, assets, and config.
- `backend/`: Complete Java backend source and Maven config.
- `importedCode/`: Reference implementations for logic/UI (Local only).
- `.gitignore`: Configured to ignore `node_modules/`, `target/`, `.idea/`, `.claude/`, and `importedCode/`.

## ⚠️ Critical Rules & Constraints
- **Git Commits**: Must strictly use prefixes like `[FEAT]`, `[FIX]`, `[REFACTOR]`.
- **Session Tracking**: All session records MUST be kept exclusively in `SESSIONS.md`. Never create separate files.
- **Agentic Principles**: Strictly follow the **Plan $\rightarrow$ Execute $\rightarrow$ Observe $\rightarrow$ Reflect** cycle.

## 📜 Development Guidelines

### 🖋 Coding Standards
- **Surgical Changes**: Modify only what is necessary. Avoid sweeping changes that risk regressions.
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

