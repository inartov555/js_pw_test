# js_pw_test - Playwright E2E Tests

End-to-end (E2E) automated tests written in TypeScript using [Playwright](https://playwright.dev/).  
The tests target the Distribusion booking portal and live under the `framework/` directory of this repository.

> Default test base URL (can be overridden via `BASE_URL`):  
> `https://book.distribusion.com/?retailerPartnerNumber=807197`

[GitHub repo](https://github.com/inartov555/js_pw_test) • [GitLab project](https://gitlab.com/inartov555/js_pw_test) • [Example GitLab pipeline run](https://gitlab.com/inartov555/js_pw_test/-/pipelines/2197950838/)

---

## Running the tests

### Option A – Local runs (NO Docker)

```bash
cd framework
npm install
npx playwright install
npx playwright test --trace on --headed --reporter=list,html
```

---

### Option B – Docker + docker compose

The `framework/Dockerfile` is based on the official Playwright image  
and is wired up via `framework/docker-compose.yml`.

From the repo root:

```bash
cd framework

# Run tests using docker compose (reusing build cache)
./run_tests.sh

# Run tests with a clean image build (no cache)
./run_tests.sh true
```

You can also inspect or tweak `docker-compose.yml` to adjust:

- Mounted volumes (artifacts, X11 socket, etc.)
- Ports (default maps `8000:8000`)
- Environment variables

---

## Tech stack

- **Playwright Test** (`@playwright/test`)
- **TypeScript**
- **Node.js / npm**
- **Docker** + **docker compose** (optional, for containerized runs)
- GitLab CI for automation

---

## Repository structure

At a high level:

```text
js_pw_test/
├─ framework/
│  ├─ Dockerfile
│  ├─ docker-compose.yml
│  ├─ package.json
│  ├─ playwright.config.ts
│  ├─ run_tests.sh
│  ├─ setup.sh
│  ├─ tests/          # Playwright test specs (*.spec.ts)
│  └─ src/            # Optional framework / helper code
└─ testStrategy/      # Folder for test strategy / documentation (if used)
```

The actual Playwright project (config, tests, Dockerfile, etc.) is fully contained in the `framework/` directory.

---

## Getting started

### 1. Prerequisites

- Node.js (LTS recommended, e.g. 18+)
- npm
- (Optional) Docker & docker compose – if you want to run tests via containers instead of locally.

---

## Configuration

### Playwright configuration

The main config lives in `framework/playwright.config.ts`. It includes:

- `testDir: "./tests"` – where tests are located.
- `baseURL` – taken from the `BASE_URL` environment variable,  
  falling back to the Distribusion booking URL if not provided.
- `outputDir` – controlled by `HOST_ARTIFACTS` or defaults to `playwright-report`.
- HTML report – written under `<HOST_ARTIFACTS>/playwright-report`.

Key environment variables:

- **`BASE_URL`**  
  Target application under test.  
  Example:

  ```bash
  export BASE_URL="https://book.distribusion.com/?retailerPartnerNumber=807197"
  ```

- **`HOST_ARTIFACTS`**  
  Directory where Playwright will write test artifacts (traces, videos, reports).  
  In CI, we typically set this to something like `artifacts` so GitLab can collect it.

---

## CI/CD with GitLab

This repository is also mirrored to GitLab, where the tests can be run automatically in CI.

- GitLab project: `https://gitlab.com/inartov555/js_pw_test`
- Example pipeline run:  
  `https://gitlab.com/inartov555/js_pw_test/-/pipelines/2197950838/`

Once the `.gitlab-ci.yml` configuration is in place, every push/merge request to `main` (or other branches you configure) will:

1. Install Node dependencies for the Playwright framework.
2. Run the Playwright tests using the official Playwright Docker image.
3. Upload Playwright reports and artifacts as GitLab pipeline artifacts.

### Optional: GitLab pipeline badge

You can add a badge at the top of this README:

```markdown
[![GitLab pipeline status](https://gitlab.com/inartov555/js_pw_test/badges/main/pipeline.svg)](https://gitlab.com/inartov555/js_pw_test/-/pipelines)
```
