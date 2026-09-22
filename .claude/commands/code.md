# Command: Develop Feature
This command triggers the professional AI SDLC flow to implement a feature based on provided API and DB specifications.

## Instructions
1. Invoke the `orchestrator` agent.
2. Pass the following context:
    - The user's specific requirements: `$ARGUMENT`
    - Request the agent to first locate and read the API and DB markdown files in the repository.
    - Instruct the agent to follow the full Orchestrator $\rightarrow$ Coder $\rightarrow$ Tester $\rightarrow$ Reviewer loop.
3. Ensure the `orchestrator` presents a "Implementation Strategy" for user approval before delegating to the `coder`.

## Usage
`/code <feature_description_or_notes>`
