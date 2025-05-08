# TEN Agent Playground Frontend Structure

## Project Overview
The TEN Agent Playground is a Next.js-based web application that provides a user interface for interacting with the TEN Agent system. It's built with modern web technologies and follows a modular architecture.

## Technology Stack
- **Framework**: Next.js 15
- **Language**: TypeScript 5
- **UI Components**: shadcn/ui (Based on Radix UI)
- **State Management**: Redux (@reduxjs/toolkit)
- **Package Manager**: pnpm 9.12.3
- **Styling**: TailwindCSS with CSS Modules
- **Development Tools**: ESLint, Prettier

## Project Structure

### Core Directories
```
playground/
├── src/                    # Source code
│   ├── app/               # Next.js app router pages
│   ├── components/        # Reusable React components
│   ├── store/            # Redux store configuration
│   ├── common/           # Shared utilities and constants
│   ├── types/            # TypeScript type definitions
│   └── manager/          # Feature managers (RTC, Agent, etc.)
├── public/               # Static assets
└── styles/              # Global styles
```

### Key Components

#### 1. App Layer (`src/app/`)
- `layout.tsx`: Root layout with providers (Theme, Store)
- `page.tsx`: Main application page
- `global.css`: Global styles and Tailwind directives

#### 2. Components (`src/components/`)
- **Layout/**: Page layout components (Header, Action)
- **UI/**: Shared UI components (buttons, inputs)
- **Agent/**: Agent-specific components
- **Dynamic/**: Dynamically loaded components
- **Chat/**: Chat interface components

#### 3. State Management (`src/store/`)
- Redux-based state management
- Global state configuration
- Reducers for different features

#### 4. Common Utilities (`src/common/`)
- Hooks: Custom React hooks
- Constants: Application constants
- Utils: Helper functions
- Module Configuration: Agent module registry

#### 5. Types (`src/types/`)
- TypeScript interfaces and types
- Shared type definitions
- Module type definitions

#### 6. Managers (`src/manager/`)
- RTC Manager: Real-time communication
- Agent Manager: AI agent interaction
- Module Manager: Feature module management

## Key Features
1. **Real-time Communication**: Integration with Agora RTC
2. **Theme Support**: Light/Dark mode with system preference detection
3. **Module System**: Pluggable architecture for various AI capabilities
4. **Responsive Design**: Mobile-first approach with adaptive layouts

## Development Workflow
1. Uses Next.js development server
2. TypeScript compilation and type checking
3. ESLint and Prettier for code quality
4. Hot module replacement for rapid development

## Configuration Files
- `next.config.mjs`: Next.js configuration
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration

## Dependencies Management
- Package management via pnpm
- Strict dependency versioning
- Core dependencies tracked in package.json

## Architecture Patterns
1. **Component-Based Architecture**
   - Reusable UI components
   - Feature-based organization

2. **State Management**
   - Centralized Redux store
   - Local component state where appropriate

3. **Module System**
   - Pluggable AI agent modules
   - Dynamic loading capabilities

4. **Type Safety**
   - Strict TypeScript configuration
   - Comprehensive type definitions

## Best Practices
1. Component composition for UI elements
2. Type-safe development with TypeScript
3. Responsive design principles
4. Performance optimization with dynamic imports
5. Consistent code style with ESLint and Prettier