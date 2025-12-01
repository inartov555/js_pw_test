# QA E2E (Stage 1)

This is a minimal Playwright + TypeScript boilerplate project prepared.

It focuses on:
- Using the latest stable Playwright test runner
- Type-safe tests via TypeScript
- A configuration that is CI-friendly and easy to extend

## Tech stack

- Node.js 20+
- TypeScript 5.x
- Playwright Test 1.57.x

## Getting started

```bash
npm install
npx playwright install --with-deps
```

Set the base URL of the Distribusion white-label app (the link provided in the task email) via an environment variable:

```bash
export BASE_URL="https://<your-distribusion-url>"   # macOS/Linux
set BASE_URL=https://<your-distribusion-url>        # Windows (PowerShell: $env:BASE_URL="...")
```

Run tests:

```bash
npm test
```

### Project structure

- `playwright.config.ts` – shared Playwright configuration
- `tests/example-smoke.spec.ts` – simple smoke test that opens the homepage
- `tsconfig.json` – TypeScript compiler options

At this stage there is intentionally **no Page Object Model** yet – this is a pure, lean starting point.
