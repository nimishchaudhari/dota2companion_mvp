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

### 2. Always Ultrathink the Possibilities, Then Make Use of Asynchronous Agents

### 3. Agent Types and Responsibilities

#### Code Analysis Agent
```
Purpose: Analyze codebase structure and dependencies
Tasks:
- Search for related files and patterns
- Identify dependencies and imports
- Map component relationships
- Find similar implementations for reference
```

### 4. Code Generation Guidelines
- Always run linting, ensure that the code you've generated is correct syntactically

### 5. Product Design Approach
- Wear the creative hat and make use of the canvas space given to you when you develop the front end, feel free to suggest changes as a product designer