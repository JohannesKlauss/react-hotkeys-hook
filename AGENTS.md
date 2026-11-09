# AGENTS.md

This file provides guidelines for agentic coding agents working in this repository.

## Github

This repo is hosted on Github. Use the `gh` CLI to fetch issues, create PRs, etc.

## CodeScene

- After changing code, run `code_health_review` on changed files.
- If Code Health drops, fix the issues, run the review again, and use `code_health_score` to confirm the result.
- Before finishing, run `pre_commit_code_health_safeguard` and only stop when it passes.

## Development Workflow

- Use `packages/lab` to reproduce bugs
- Verify behavior with the playwright mcp

## Development Commands

### Build and Development

- `npm run build` - Build the main library package (runs in packages/react-hotkeys-hook)
- `npm run build:documentation` - Build documentation site
- `npm run -w packages/react-hotkeys-hook dev` - Watch and rebuild the library
- `npm run -w packages/react-hotkeys-hook build` - Type-check and build the library with Vite+ Pack

### Linting and Formatting

- `npm run lint` - Run Vite+ lint on packages
- `npm run format` - Format the workspace
- `npm exec -- vp check` - Check workspace formatting and lint
- `npm exec -- vp fmt` - Format the workspace

### Testing

- `npm run test` - Run all tests (Vitest in packages/react-hotkeys-hook)
- `npm run -w packages/react-hotkeys-hook test` - Run tests in library package
- `npm exec -w packages/react-hotkeys-hook -- vp test` - Run tests once
- `npm exec -w packages/react-hotkeys-hook -- vp test -t "test name"` - Run tests matching a name
- `npm exec -w packages/react-hotkeys-hook -- vp test src/test/useHotkeys.test.tsx` - Run a specific test file

## Code Style Guidelines

### Formatting (Vite+ / Oxfmt)

- Line width: 120 characters
- Indentation: Spaces (2 spaces)
- Quotes: Single quotes
- Semicolons: As needed (optional)

### Imports

- Use `import type` for type-only imports: `import type { Hotkey } from './types'`
- Group imports: external React hooks first, then local modules
- Keep imports at top of file, grouped by purpose

### TypeScript

- Use explicit type annotations for function parameters and returns
- Prefer `readonly` for arrays that shouldn't be modified: `readonly FormTags[]`
- Use `type` over `interface` for object types (this codebase uses `type`)
- Use generic type parameters with constraints: `function foo<T extends HTMLElement>()`
- Use `as const` for literal types where appropriate
- Use `@ts-expect-error` for intentional type errors with explanation

### Naming Conventions

- Variables and functions: camelCase (`isHotkeyEnabled`, `recordedKeys`)
- Components: PascalCase (`HotkeysProvider`, `BoundHotkeysProxyProvider`)
- Types: PascalCase (`HotkeyCallback`, `Options`, `HotkeysContextType`)
- Constants: UPPER_SNAKE_CASE (`FORM_TAGS_AND_ROLES`)
- Private/internal variables: Prefix with underscore (`_options`, `_deps`)

### React Patterns

- Use functional components with hooks
- Use `useCallback` for event handlers and functions passed to children
- Use `useRef` for mutable refs and DOM elements
- Use `useState` for component state
- Use `useEffect` or `useLayoutEffect` for side effects
- Prefer `useLayoutEffect` over `useEffect` for DOM mutations
- Use TypeScript generics for refs: `useRef<T>(null)`
- Export default hooks for main API: `export default function useHotkeys()`

### Error Handling

- Use conditional checks instead of try-catch where possible
- Return early from functions on error conditions
- Use type guards: `isReadonlyArray(enabledOnTags)`
- Check for undefined/null before accessing properties
- Use optional chaining: `e.target?.isContentEditable`

### Comments

- Use TODO comments for future improvements: `// TODO: Make modifiers work with sequences`
- Use targeted `oxlint-disable` comments for intentional lint violations
- Avoid inline comments for obvious code
- Add comments for complex logic or non-obvious behavior
- Use console.warn for developer-facing warnings in production code

### Testing Patterns (Vitest + Testing Library)

- Test files use `.test.tsx` extension in `src/test/` directory
- Use `test()` from vitest (not `it()`)
- Use `expect()` for assertions
- Mock functions with `vi.fn()`
- Use `vi.useFakeTimers()` for timer-related tests
- Use `userEvent.setup()` for user interactions
- Test files in `src/test/`, source in `src/lib/`
- Use `renderHook()` for testing hooks
- Use `render()` for testing components
- Use `beforeEach()` for setup
- Use `.only()` sparingly for debugging only (remove before commit)

### File Structure

- Main source: `packages/react-hotkeys-hook/src/lib/`
- Tests: `packages/react-hotkeys-hook/src/test/`
- Types: Defined in `src/lib/types.ts`
- Entry point: `src/lib/index.ts`
- Monorepo: Multiple packages in `packages/` directory

### Additional Notes

- This is an ES modules project (type: "module" in package.json)
- Use `type` imports for type-only imports to reduce bundle size
- Avoid parameter reassignment
- Use single variable declarators
- Avoid unnecessary else statements
- Use self-closing JSX elements
- Use as const assertions for literal types
- This project uses Vitest, not Jest
- Build system: Vite+ Pack + TypeScript
- Testing environment: jsdom
