# Repository Guidelines

## Project Structure & Module Organization
- `src/components/`: UI components (Astro). Use `ComponentName.astro`.
- `src/layouts/`, `src/pages/`: Page layouts and routes.
- `src/lib/`: Utilities and domain logic (TypeScript). Jest tests live in `src/lib/__tests__/`.
- `src/styles/`, `src/scripts/`, `src/content/`, `src/data/`: Styles, scripts, content and data helpers.
- `public/`: Static assets served as-is.
- `dist/`: Build output (generated). Do not edit.

## Build, Test, and Development Commands
- `npm run dev`: Start Astro dev server at `http://localhost:4321`.
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Serve the built site locally.
- `npm test` / `npm run test:run`: Run Vitest (UI/browser-like code, happy-dom).
- `npm run test:coverage`: Vitest with coverage report in `coverage/`.
- `npm run test:jest`: Run Jest (Node-style libs in `src/lib`).
- `npm run lint` / `npm run lint:fix`: ESLint check/fix for `src/**/*.ts`.
- `npm run format` / `npm run format:check`: Prettier write/check.
- Hooks: pre-commit runs tests; pre-push runs coverage, format check, `tsc --noEmit`, and build.

## Coding Style & Naming Conventions
- Language: TypeScript + ESM. Prefer `const`, avoid `var`; `no-debugger` enforced.
- Prettier: 2 spaces, single quotes, semicolons, width 100 (Markdown 80), trailing commas `es5`.
- Components: `PascalCase.astro` in `src/components/`.
- Tests: `*.test.ts`; Jest tests live under `__tests__/` for `src/lib`.
- Imports: App/Vitest code may use `~` alias (to `/src`); Jest tests may use `@/` (mapped to `src/`).

## Testing Guidelines
- Vitest: For components and browser-like code. Setup: `src/test-setup-vitest.ts`; env: `happy-dom`.
- Jest: For `src/lib/**` Node-like utilities. Setup: `src/test-setup.ts`.
- Place new lib tests in `src/lib/__tests__/` and component tests beside the component or under `src/components/__tests__/`.
- Aim for meaningful coverage; ensure `npm run test:coverage` passes before pushing.

## Commit & Pull Request Guidelines
- Commits: Clear, imperative subject (e.g., `Add diff view for versions`). Keep scope focused.
- Before PR: `npm run lint && npm run format:check && npm run test:coverage && npm run build`.
- PRs: Include summary, rationale, linked issues, test notes, and UI screenshots when applicable.

## Security & Config Tips
- Do not commit secrets. Use environment variables and access via `getEnvVar` in `src/lib/env.ts`.
- Keep generated folders (`dist/`, `.astro/`, `coverage/`) out of PRs.
