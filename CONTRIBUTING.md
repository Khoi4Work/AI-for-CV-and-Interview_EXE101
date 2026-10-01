# Contributing to AI for CV and Interview

Welcome! To maintain high quality and consistency, this project uses a strict AI Agent orchestration system to automate the development lifecycle.

## 🤖 AI Agent Workflow (The Pipeline)

We use a specialized multi-agent pipeline to ensure every feature is planned, implemented, tested, and audited before it reaches the codebase.

### The `/code` Command
To implement a new feature or fix a bug, use the custom `/code` command:
` /code <your feature request or bug fix description>`

### How the Pipeline Works (Sequential Flow)
The process follows a strict sequential chain. A step only begins when the previous one has successfully produced a handover document in `.submission/`.

1.  **Step 0: Safety & Clean-up**: The system verifies the git branch (blocks `main`/`master`) and clears the `.submission/` directory.
2.  **Step 1: Planning (Orchestrator)**:
    - Analyzes requirements and specs in `.spec/`.
    - Creates a detailed plan in `.submission/ke-hoach.md`.
    - **Decision Gate**: If there are "CÂU HỎI CÒN BỎ NGỎ", the process stops for user clarification.
3.  **Step 2: Implementation (Coder)**:
    - Implements the feature strictly based on `ke-hoach.md`.
    - Writes a summary of changes to `.submission/thay-doi.md`.
4.  **Step 3: Verification (Tester)**:
    - Writes and executes integration tests.
    - Writes results to `.submission/ket-qua-test.md`.
    - **Decision Gate**: If any test fails, the process stops for fixing.
5.  **Step 4: Audit (Reviewer)**:
    - Performs a final technical audit.
    - Writes the final verdict to `.submission/danh-gia.md` (`VERIFIED` / `REQUEST CHANGES`).

### Pipeline Artifacts Summary
| File | Agent | Purpose |
| :--- | :--- | :--- |
| `.spec/*` | User | Source of truth / Requirements |
| `.submission/ke-hoach.md` | Orchestrator | Execution plan & decision gate |
| `.submission/thay-doi.md` | Coder | Detailed report of implemented changes |
| `.submission/ket-qua-test.md` | Tester | Test evidence & quality gate |
| `.submission/danh-gia.md` | Reviewer | Final technical audit & verdict |

### Setup for Collaborators
1. Install [Claude Code CLI](https://claude.ai/code).
2. Pull the latest changes (including the `.claude/` directory).
3. **Initialize Required Directories**: Since these folders are often ignored by git, you must create them manually if they don't exist:
   `mkdir .spec .submission`
4. Place your specifications in the `.spec/` folder.
5. Use the `/code` command for all development to ensure it passes through the automated review pipeline.

## 🛠 Development Standards

### Git Workflow & Custom Commands
We use custom commands to maintain a clean git history and structural integrity:
- `/code <request>`: Triggers the full AI SDLC pipeline described above.
- `/add`: Stages all current changes after checking for "strange" files that don't fit the project structure.
- `/commit`: Commits staged changes with a structured message (filtering out internal agent/config logs).
- `/done`: Combines `/add` and `/commit` into one step. Useful for quickly finalizing verified changes.

**Typical Development Loop**:
`Place spec in .spec/` $\rightarrow$ `/code "Feature name"` $\rightarrow$ `Review .submission/` $\rightarrow$ `/done` (or `/add` $\rightarrow$ `/commit`)

**Commit Convention**:
All commits must use the following prefixes:
- `[FEAT]`: New features.
- `[FIX]`: Bug fixes.
- `[REFACTOR]`: Code changes that neither fix a bug nor add a feature.
- `[UI]`: UI/UX improvements.
- `[DOCS]`: Documentation updates.

### Coding Standards
- **Frontend**: React 19, Tailwind CSS 4.0. Professional, rounded-2xl design system.
- **Backend**: Java, Spring Boot. Strictly follow the Layered Architecture: `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository`.
- **Documentation**: All session progress must be recorded in `SESSIONS.md`.
