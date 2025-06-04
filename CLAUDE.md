# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Project Context

**IMPORTANT**: This codebase is transitioning away from Chakra UI to a custom component system. When encountering Chakra UI-related errors or working on components, prioritize replacing Chakra components with the custom UI components in `/src/components/ui/`.

### Current Migration Status
- **Goal**: Remove all Chakra UI dependencies and replace with custom component system
- **UI Components**: Use components from `/src/components/ui/` (Button, Card, Container, etc.)
- **Styling**: Tailwind CSS + custom theme system in `/src/theme/`
- **TypeScript**: Path aliases configured for `@/` imports

## Essential Development Commands

### Frontend Development (React 19 + TypeScript + Vite)
```bash
cd frontend
npm run dev                  # Start dev server (http://localhost:5173)
npm run build               # Production build
npm run build:check         # TypeScript + build validation
npm run lint                # ESLint check
npm run type-check          # TypeScript validation only
npm run test                # Unit tests with Vitest
npm run test:watch          # Watch mode testing
npm run test:coverage       # Coverage report (70% minimum)
npm run test:e2e           # Playwright E2E tests
npm run test:all           # Complete test suite (unit + e2e)
npm run test:ci            # CI-optimized test suite
```

### Backend Development (Express.js)
```bash
cd backend
npm run dev                 # Start backend with nodemon
npm start                   # Production server
```

### Build Analysis and Optimization
```bash
npm run analyze             # Bundle analysis
npm run build:analyze       # Build + analyze
npm run verify-pwa          # PWA asset verification
```

### Testing Individual Components
```bash
# Run specific test files
npm test src/services/__tests__/imp*.test.js
npm test src/components/__tests__/PlayerSearch.test.tsx

# Watch mode for specific files
npm run test:watch -- PlayerSearch.test.tsx
npm run test:watch -- src/services/engine/

# Coverage for specific directories
npm run test:coverage -- src/services/imp/
```

## High-Level Architecture

### Overall Structure
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (transitioning from Chakra UI)
- **Backend**: Express.js server with OpenDota API integration (preserved for future features)
- **Architecture**: Monorepo with frontend/ and backend/ directories
- **Deployment**: Frontend-only to GitHub Pages (backend ready for Railway/Vercel)
- **PWA**: Full offline support with sophisticated service worker caching
- **Testing**: Vitest + Playwright with MSW for API mocking

### Critical Architectural Concepts

#### 1. IMP (Individual Match Performance) System
**Core Purpose**: Tournament-grade performance scoring (-100 to +100) with <100ms calculation time
```
/frontend/src/services/engine/impAlgorithm.js  # Core algorithm with role-based weighting
/frontend/src/services/imp/                    # Supporting infrastructure
/frontend/public/workers/impCalculator.js      # Web Worker for heavy calculations
```

#### 2. Multi-Tier Caching Strategy
**Performance Target**: Sub-100ms response with 80% cache hit rate
```
Memory Cache (50MB) → localStorage (25MB) → IndexedDB (500MB+) → Network APIs
```

#### 3. Path Alias System
```typescript
@/components → /src/components
@/services   → /src/services  
@/types      → /src/types
@/utils      → /src/utils
@/contexts   → /src/contexts
@/theme      → /src/theme
```

### Key Service Layers
```
/frontend/src/services/
├── api/                    # Modular API clients with rate limiting
│   ├── apiClient.ts        # Core HTTP client with retry logic
│   ├── cache.ts           # Multi-tier caching implementation
│   ├── impDataClient.ts   # IMP-specific data fetching
│   └── types.ts           # TypeScript interfaces for API
├── engine/                 # Performance-critical calculation engines
│   ├── impAlgorithm.js    # Core IMP scoring algorithm
│   ├── dataValidator.js   # Input validation & sanitization
│   └── recommendations.js # Hero/item recommendation engine
├── imp/                    # IMP system infrastructure
│   ├── cacheManager.js    # Intelligent caching with compression
│   ├── apiClient.js       # IMP-specific API client
│   ├── workerManager.js   # Web Worker coordination
│   └── performanceMonitor.js # Real-time performance tracking
└── performance/            # Bundle optimization & monitoring
```

### Component Architecture
```
/frontend/src/components/
├── ui/                     # Custom design system (replacing Chakra UI)
│   ├── Button.jsx         # Base button component
│   ├── Card.jsx           # Card container
│   ├── Container.jsx      # Layout container
│   └── index.js           # Barrel exports
├── visualizations/         # Advanced data visualization
│   ├── imp/               # IMP-specific charts and dashboards
│   ├── core/              # Base chart components (D3/Recharts)
│   └── performance/       # Performance analytics visualizations
├── layout/                 # App structure and navigation
│   ├── Header.jsx         # Main navigation
│   ├── Footer.jsx         # Footer component
│   └── MainLayout.jsx     # Root layout wrapper
└── professional/           # Pro-level analytics components
```

### Build Optimization Strategy
**Key Features in vite.config.js**:
- **IMP-Optimized Chunking**: Separate chunks for core engine, workers, and visualizations
- **PWA Caching**: Aggressive caching for OpenDota API and Steam assets
- **Bundle Analysis**: Built-in bundle size monitoring with 300kb warning limit
- **Tree Shaking**: Aggressive elimination of unused code
- **Asset Optimization**: Image/font optimization with organized output structure

### Dota 2-Specific Features
- **IMP System**: Individual Match Performance scoring with statistical normalization
- **Draft Assistant**: Real-time hero recommendation with meta analysis
- **Build Calculator**: Interactive item builds with DPS calculations
- **Performance Analytics**: Advanced player statistics with percentile ranking
- **Match Analysis**: Deep dive into match performance with timeline visualization

## Nested Agent Orchestration Strategy

### 1. Always Use Nested Agents For:
- **Large Feature Implementation**: When implementing features that span multiple files or components
- **Complex Refactoring**: When refactoring requires analyzing and modifying multiple interconnected components
- **Full-Stack Changes**: When changes span both frontend and backend
- **Test Suite Creation**: When creating comprehensive test coverage for features
- **Performance Optimization**: When analyzing and optimizing performance across multiple components
- **Bug Fixes with Testing**: When fixing complex issues that require comprehensive testing

### 2. Critical Requirement: All Agent Solutions Must Be Tested
**IMPORTANT**: When delegating to agents, always explicitly request:
- "Provide a fully tested and working solution"
- "Include comprehensive test coverage for all new functionality"
- "Verify all tests pass before returning the solution"
- "Run npm run test:all to ensure no regressions"

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

#### Testing Agent
```
Purpose: Create and validate comprehensive test coverage
Tasks:
- Write unit tests with Vitest
- Create integration tests with Testing Library
- Set up E2E tests with Playwright
- Validate test coverage meets 70% threshold
```

#### Performance Agent
```
Purpose: Optimize application performance
Tasks:
- Analyze bundle size and chunking
- Optimize component rendering
- Implement caching strategies
- Validate Core Web Vitals metrics
```

### 4. Development Workflow Requirements

#### Pre-Commit Validation
```bash
cd frontend
npm run lint                # ESLint validation
npm run type-check          # TypeScript compilation check
npm run test:unit           # Unit test validation
npm run build:check         # Build verification
```

#### Component Development Guidelines
- **Chakra UI Migration**: Replace Chakra components with custom UI components from `/src/components/ui/`
- **Styling**: Use Tailwind CSS classes, custom theme system in `/src/theme/`
- **TypeScript**: Use path aliases (`@/components`, `@/services`, etc.)
- **Testing**: Write tests for all new components with 70% minimum coverage

#### API Integration Patterns
- **Caching**: Use multi-tier cache system via `cacheManager.js`
- **Error Handling**: Implement circuit breaker pattern with graceful degradation
- **Rate Limiting**: Respect OpenDota API limits (55 req/min conservative)
- **Type Safety**: Use TypeScript interfaces from `/src/types/`

### 5. Quality Assurance Requirements
- **Test Coverage**: Minimum 70% for branches, functions, lines, and statements
- **TypeScript**: Strict mode enabled, no `any` types without justification
- **Performance**: Lighthouse score 95+ for production builds, <100ms IMP calculations
- **PWA**: Full offline functionality with intelligent cache invalidation
- **Bundle Size**: 300kb warning limit with strategic code splitting
- **Accessibility**: WCAG 2.1 AA compliance for all interactive components

### 6. IMP System Critical Implementation Notes

#### Performance Requirements
- **Calculation Time**: Sub-100ms for IMP score computation
- **Memory Budget**: 50MB limit with intelligent cache management
- **Cache Hit Rate**: 80% target with multi-tier strategy
- **Animation FPS**: 60fps for chart visualizations

#### Architecture Constraints
- **Algorithm**: Role-based weighting with statistical normalization
- **Data Validation**: Comprehensive input sanitization for malformed OpenDota responses
- **Worker Integration**: Heavy calculations offloaded to Web Workers
- **Error Recovery**: Graceful degradation when API data is incomplete

#### Testing Strategy
- **Edge Cases**: Missing data fields, malformed API responses, network failures
- **Performance**: Benchmark testing for calculation time limits
- **Integration**: End-to-end testing with real OpenDota API data
- **Regression**: Automated testing to prevent performance degradation