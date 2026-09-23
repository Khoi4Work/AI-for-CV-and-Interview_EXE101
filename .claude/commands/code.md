# Command: Develop Feature
This command triggers a strict sequential AI SDLC flow to implement a feature based on provided API and DB specifications.

## Instructions
1. **Pre-flight Check**:
    - Check the current git branch. If it is `main` or `master`, STOP immediately and notify the user.
    - Clear the `.submission/` directory (remove `ke-hoach.md`, `thay-doi.md`, `ket-qua-test.md`, and `danh-gia.md`) to prevent reading stale data.

2. **Step 1: Planning (Orchestrator)**:
    - Invoke the `orchestrator` agent to create a plan based on requirements and `.spec/` files.
    - Wait until `.submission/ke-hoach.md` is created.
    - **Decision Gate**: If `ke-hoach.md` contains a "CÂU HỎI CÒN BỎ NGỎ" (Open Questions) section, STOP and present these questions to the user. Only proceed if there are no open questions or they have been resolved.

3. **Step 2: Implementation (Coder)**:
    - Invoke the `coder` agent.
    - Wait until `.submission/thay-doi.md` is created.

4. **Step 3: Verification (Tester)**:
    - Invoke the `tester` agent.
    - Wait until `.submission/ket-qua-test.md` is created.
    - **Decision Gate**: If any tests fail, STOP immediately and present the failure details to the user.

5. **Step 4: Audit (Reviewer)**:
    - Invoke the `reviewer` agent.
    - Present the final verdict from `.submission/danh-gia.md` to the user.

## Final Constraints
- Do NOT merge branches, push code, or create pull requests.
- Leave all changes on the current branch for the user to review manually.

## Usage
`/code <feature_description_or_notes>`
