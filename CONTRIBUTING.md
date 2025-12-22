# Contributing to TypeScript Type Debugger

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 24.0.0
- pnpm >= 10.0.0

### Setup

```bash
git clone https://github.com/adrianbrowning/ts-type-debugger.git
cd ts-type-debugger
pnpm install
```

### Development

```bash
pnpm dev        # Start dev server at http://localhost:5173
pnpm build      # Production build
pnpm preview    # Preview production build
```

## Making Changes

### Workflow

1. Fork the repository
2. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Run tests and linting (see below)
5. Commit with a descriptive message
6. Push and open a Pull Request

### Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(trace): add mapped type support`
- `fix(ui): correct timeline scrubbing on mobile`
- `docs: update contributing guide`

## Testing

```bash
pnpm test              # Unit & integration tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests only
pnpm test:ui           # Browser component tests
pnpm test:e2e          # Playwright E2E tests
pnpm test:all          # All tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

All tests must pass before merging.

## Linting

```bash
pnpm lint:ts    # TypeScript type checking
pnpm lint:fix   # ESLint with auto-fix
pnpm lint       # Both type check and ESLint
```

## Project Structure

```
src/
├── astGenerator.ts       # Core AST parsing & trace generation
├── eval_local.ts         # Type evaluation helpers
├── core/                 # Type debugger core logic
│   ├── typeDebugger.ts   # Main entry point
│   ├── traceProcessor.ts # Trace → display data
│   └── types.ts          # Type definitions
├── web/                  # React UI
│   ├── App.tsx           # Main component
│   ├── components/       # UI components
│   └── hooks/            # Custom hooks
└── services/             # Supporting services

tests/
├── integration/          # Type resolution tests
├── ui/                   # Component tests
└── e2e/                  # Playwright browser tests
```

## Code Style

- Prefer `type` over `interface`
- Use named tuple types: `[lat: number, long: number]`
- Keep code concise
- No unnecessary comments on self-explanatory code

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include tests for new functionality
- Update documentation if needed
- Ensure all CI checks pass
- Request review from maintainers

## Questions?

Open an issue for questions or discussions about potential changes.
