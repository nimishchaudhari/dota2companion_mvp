# Claude Configuration - Nested Agent Orchestration

## Overview
This configuration enables Claude to use nested agents for complex tasks, similar to an orchestrator pattern. The main agent delegates specialized subtasks to child agents, improving efficiency and code quality.

## Agent Delegation Strategy

### 1. Always Use Nested Agents For:
- **Large Feature Implementation**: When implementing features that span multiple files or components
- **Complex Refactoring**: When refactoring requires analyzing and modifying multiple interconnected components
- **Full-Stack Changes**: When changes span both frontend and backend
- **Test Suite Creation**: When creating comprehensive test coverage for features
- **Performance Optimization**: When analyzing and optimizing performance across multiple components

### 2. Agent Types and Responsibilities

#### Code Analysis Agent
```
Purpose: Analyze codebase structure and dependencies
Tasks:
- Search for related files and patterns
- Identify dependencies and imports
- Map component relationships
- Find similar implementations for reference
```

#### Implementation Agent
```
Purpose: Write new code following existing patterns
Tasks:
- Implement new features
- Follow existing code conventions
- Use appropriate libraries already in the project
- Maintain consistency with existing code
```

#### Testing Agent
```
Purpose: Create and run tests
Tasks:
- Write unit tests
- Create integration tests
- Run test suites
- Report test results
```

#### Refactoring Agent
```
Purpose: Improve code quality
Tasks:
- Identify code smells
- Suggest improvements
- Perform safe refactoring
- Ensure backward compatibility
```

#### Documentation Agent
```
Purpose: Update documentation
Tasks:
- Update inline documentation
- Create API documentation
- Update README files (only when requested)
- Document complex logic
```

## Implementation Instructions

### When to Launch Nested Agents
1. **Automatic Delegation**: For tasks involving 3+ files or complex logic
2. **Concurrent Execution**: Launch multiple agents in parallel when tasks are independent
3. **Sequential Execution**: Use sequential agents when tasks depend on each other

## Asynchronous Execution Patterns

### Capabilities
- **Parallel Agent Launch**: Multiple agents can run concurrently in a single Task tool invocation
- **Independent Execution**: Each agent operates in isolation with its own context
- **Batch Processing**: Results from all agents are collected and returned together

### Limitations & Workarounds

#### 1. Stateless Execution
**Limitation**: Agents cannot communicate during execution
**Workaround**: Use file-based state sharing
```javascript
// Pattern: State file for inter-agent communication
const stateFile = '/tmp/agent_state.json';
// Agent 1 writes analysis results
// Agent 2 reads state file in subsequent invocation
```

#### 2. No Real-time Coordination
**Limitation**: Can't implement event-driven patterns between agents
**Workaround**: Design agents for complete independence
```markdown
GOOD: Agent A analyzes files → Agent B implements based on analysis
BAD: Agent A waits for Agent B's signal to continue
```

#### 3. Resource Contention
**Limitation**: Multiple agents editing same files can conflict
**Workaround**: Partition work by file or component
```javascript
// Assign specific files to each agent
Agent1: src/components/auth/*
Agent2: src/contexts/AuthContext.jsx
Agent3: backend/auth/*
```

### Effective Async Patterns

#### Pattern 1: Map-Reduce
```markdown
Map Phase (Parallel):
- Agent 1: Analyze frontend components
- Agent 2: Analyze backend APIs  
- Agent 3: Analyze database schema

Reduce Phase (Sequential):
- Orchestrator: Combine analyses and create implementation plan
```

#### Pattern 2: Pipeline with Checkpoints
```markdown
Stage 1 (Parallel): Analysis agents
↓ Write results to checkpoint files
Stage 2 (Parallel): Implementation agents read checkpoints
↓ Write implementation results
Stage 3 (Sequential): Integration agent combines all work
```

#### Pattern 3: Domain Partitioning
```markdown
Parallel Execution by Domain:
- Frontend Agent: All UI changes (isolated)
- Backend Agent: All API changes (isolated)
- Database Agent: All schema changes (isolated)
- Integration Agent: Wire everything together (sequential)
```

### Best Practices for Async Agents

1. **Design for Independence**
   - Each agent should be able to complete its task without external input
   - Avoid dependencies between parallel agents

2. **Use Clear Boundaries**
   - Partition work by file, directory, or feature
   - Prevent overlapping modifications

3. **Implement Checkpointing**
   - Save intermediate results to files
   - Allow recovery from partial completions

4. **Handle Conflicts Gracefully**
   - Check for file modifications before editing
   - Use unique identifiers for generated code

5. **Optimize for Throughput**
   - Batch similar operations together
   - Minimize file I/O operations

### Example: Async Feature Implementation

```javascript
// Orchestrator launches all analysis agents in parallel
const analysisAgents = [
  { task: "Find all user-related components", domain: "frontend" },
  { task: "Analyze current API structure", domain: "backend" },
  { task: "Check database schema", domain: "database" }
];

// After analysis completes, launch implementation agents
const implementationAgents = [
  { task: "Create new components", files: analysisResults.newComponents },
  { task: "Update existing components", files: analysisResults.updates },
  { task: "Add API endpoints", files: analysisResults.apiFiles }
];

// Finally, sequential integration
const integrationTask = {
  task: "Connect all components and test integration",
  dependencies: implementationAgents.results
};
```

## Git Worktree-Based Agent Isolation

### Overview
Each agent operates in its own Git worktree, providing complete isolation and preventing conflicts. The orchestrator pre-plans all tasks and validates changes before merging.

### Worktree Setup Pattern
```bash
# Orchestrator creates isolated environments for each agent
git worktree add -b agent-1-auth project_directory/agent-workspaces/agent-1 HEAD
git worktree add -b agent-2-api project_directory/agent-workspaces/agent-2 HEAD
git worktree add -b agent-3-tests project_directory/agent-workspaces/agent-3 HEAD
```

### Orchestrator Responsibilities

#### 1. Pre-Task Analysis (CRITICAL)
The orchestrator MUST fully analyze and decompose tasks BEFORE delegating:
```markdown
ORCHESTRATOR ANALYSIS PHASE:
1. Read all relevant files
2. Understand current implementation
3. Plan exact changes needed
4. Decompose into atomic, specific tasks
5. Assign clear file boundaries to each agent
```

#### 2. Task Assignment Rules
- **Atomic Tasks**: Each agent task must be completable in ONE commit
- **No Dependencies**: Agents must NEVER depend on other agents' work
- **Specific Instructions**: Include exact function names, line numbers, patterns
- **File Ownership**: Each file can only be modified by ONE agent

### Example: Orchestrated Feature Implementation

```markdown
## Orchestrator Pre-Planning Example
Feature: "Add user favorites feature"

ORCHESTRATOR ANALYSIS:
1. Reads PlayerProfilePage.jsx, understands structure
2. Identifies needed changes:
   - Add favorites button at line 47
   - Create new state hook after line 15
   - Add API call function after line 82
3. Reads backend server.js, identifies:
   - Need new endpoint after line 234
   - Need validation middleware
   
TASK DECOMPOSITION:
Agent-1 Task: "Add favorites UI to PlayerProfilePage.jsx"
- Worktree: /tmp/agent-workspaces/favorites-ui
- Specific changes:
  * Insert FavoritesButton component at line 47
  * Add useFavorites hook import at line 5
  * Add favorites state at line 16
  
Agent-2 Task: "Create favorites API endpoint"
- Worktree: /tmp/agent-workspaces/favorites-api  
- Specific changes:
  * Add POST /api/favorites endpoint after line 234 in server.js
  * Include validation for playerId parameter
  * Return {success: true, favoriteId: string}
```

### Worktree Workflow

```bash
# 1. Orchestrator creates worktrees
WORKSPACE_DIR="/tmp/agent-workspaces"
mkdir -p $WORKSPACE_DIR

# Create isolated worktree for each agent
git worktree add -b agent-$TASK_ID $WORKSPACE_DIR/agent-$TASK_ID HEAD

# 2. Agent executes in isolation
cd $WORKSPACE_DIR/agent-$TASK_ID
# Agent makes changes
git add -A
git commit -m "Agent $TASK_ID: $TASK_DESCRIPTION"

# 3. Orchestrator validates changes
git diff HEAD..agent-$TASK_ID --stat
git diff HEAD..agent-$TASK_ID

# 4. Orchestrator cherry-picks approved changes
git cherry-pick agent-$TASK_ID

# 5. Cleanup
git worktree remove $WORKSPACE_DIR/agent-$TASK_ID
git branch -D agent-$TASK_ID
```

### Validation Workflow

```markdown
ORCHESTRATOR VALIDATION CHECKLIST:
1. ✓ Changes match assigned task exactly
2. ✓ No modifications outside assigned files
3. ✓ Code follows project conventions
4. ✓ No merge conflicts with main branch
5. ✓ Tests pass (if applicable)
6. ✓ No security issues introduced
```

### Agent Task Template

```markdown
AGENT TASK SPECIFICATION:
Task ID: agent-auth-button-001
Worktree: /tmp/agent-workspaces/auth-button
Branch: agent-auth-button-001
Base Commit: <commit-hash>

SPECIFIC CHANGES REQUIRED:
1. File: src/components/Header.jsx
   - Line 23: Add import for AuthButton component
   - Line 47: Insert <AuthButton /> before </nav>
   
2. File: src/components/AuthButton.jsx (NEW FILE)
   - Create functional component
   - Include login/logout logic
   - Use existing AuthContext from line 3

CONSTRAINTS:
- Do NOT modify any other files
- Do NOT refactor existing code
- Do NOT add additional features
- Complete in single commit

SUCCESS CRITERIA:
- AuthButton renders in header
- Clicking toggles auth state
- No console errors
```

### Benefits of This Approach

1. **True Isolation**: No file conflicts between agents
2. **Safe Experimentation**: Can reject changes without affecting main
3. **Atomic Changes**: Each agent produces one focused commit
4. **Easy Rollback**: Just remove worktree if changes are bad
5. **Parallel Execution**: Agents truly work independently

### Implementation Guidelines

1. **Orchestrator Must Pre-Plan Everything**
   ```javascript
   // BAD: Vague delegation
   "Agent 1: Implement authentication"
   
   // GOOD: Specific pre-planned changes
   "Agent 1: In src/auth/login.jsx, add validateCredentials function 
    at line 45 that checks username length > 3 and password length > 8"
   ```

2. **Small, Focused Changes**
   - Each agent task should modify 1-3 files maximum
   - Changes should be completable in 10-50 lines of code
   - If larger, break into multiple sequential agent tasks

3. **Validation Before Merge**
   - Orchestrator reviews EVERY line of agent changes
   - Run tests in agent worktree before merging
   - Reject and retry if changes don't match specification

### Agent Communication Protocol
```markdown
## Task Delegation Format
Task ID: [Unique identifier]
Worktree Path: [Isolated workspace location]
Base Commit: [Starting point commit hash]
Assigned Files: [Exclusive file ownership list]
Specific Changes: [Line-by-line change specifications]
Validation Criteria: [How orchestrator will verify success]
Expected Output: [Clear description of deliverables]
```

### Example Nested Agent Usage

```markdown
# Example 1: Feature Implementation
Main Agent receives: "Add user authentication to the app"

Delegates to:
1. Analysis Agent: "Search for existing auth patterns, identify auth libraries in use"
2. Implementation Agent: "Implement auth components based on analysis results"
3. Testing Agent: "Create tests for auth components"
4. Integration Agent: "Integrate auth with existing components"
```

```markdown
# Example 2: Performance Optimization
Main Agent receives: "Optimize the player profile page performance"

Delegates to:
1. Analysis Agent: "Profile the PlayerProfilePage component, identify performance bottlenecks"
2. Optimization Agent: "Implement memoization, lazy loading, and other optimizations"
3. Testing Agent: "Verify optimizations don't break functionality"
```

## Task Tool Usage Guidelines

### Launching Child Agents
```javascript
// Pattern for launching a child agent
const analysisTask = {
  description: "Analyze auth patterns",
  prompt: `Analyze the codebase for existing authentication patterns.
           Search for:
           - Auth-related components in src/components
           - Auth context in src/contexts
           - Auth utilities or hooks
           - Package.json for auth libraries
           Return a structured summary of findings.`
};
```

### Handling Agent Results
1. Parse child agent results for key information
2. Use results to inform subsequent agent tasks
3. Aggregate results for user-facing summary
4. Handle errors gracefully with fallback strategies

## Best Practices

### 1. Task Decomposition
- Break complex tasks into specific, actionable subtasks
- Each subtask should have a single, clear objective
- Avoid overlapping responsibilities between agents

### 2. Context Preservation
- Pass relevant file paths and code snippets to child agents
- Include project-specific conventions and patterns
- Maintain consistency across all agent outputs

### 3. Error Handling
- Always validate child agent outputs
- Provide fallback strategies for failed tasks
- Report issues clearly to the user

### 4. Performance Optimization
- Launch independent agents concurrently
- Avoid redundant file reads across agents
- Cache and reuse analysis results when appropriate

## Project-Specific Configuration

### Dota 2 Companion MVP
- **Frontend Agents**: Specialize in React, Tailwind, Vite
- **Backend Agents**: Focus on Express.js, OpenDota API integration
- **API Agents**: Handle external API calls and data transformation
- **State Management Agents**: Work with React Context API

### Development Commands
When child agents complete implementation tasks, ensure they run:
- Frontend: `npm run lint`, `npm run build`
- Backend: `npm test` (if tests exist)

## Usage Examples

### Complex Feature Request
```
User: "Add a hero comparison feature to the app"

Orchestrator Response:
1. Launch Analysis Agent → Find similar features, identify patterns
2. Launch Design Agent → Create component structure
3. Launch Parallel Agents:
   - Frontend Implementation Agent
   - Backend API Agent
   - State Management Agent
4. Launch Testing Agent → Create tests
5. Launch Integration Agent → Connect all pieces
```

### Multi-File Refactoring
```
User: "Refactor the API calls to use a centralized service"

Orchestrator Response:
1. Launch Analysis Agent → Map all API calls
2. Launch Design Agent → Design service architecture
3. Launch Implementation Agent → Create API service
4. Launch Migration Agent → Update all components
5. Launch Testing Agent → Ensure nothing breaks
```

## Notes
- This configuration optimizes for the Dota 2 Companion MVP structure
- Agents should always check for existing patterns before implementing new ones
- Documentation should only be created when explicitly requested
- All agents should follow the project's existing code style and conventions