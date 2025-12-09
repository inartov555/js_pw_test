# Playwright E2E Tests

End-to-end (E2E) automated tests written in TypeScript using Playwright.  
The tests target the Distribution booking portal and live under the `framework/` directory of this repository.

> Default test base URL:  
> [https://book.distribusion.com/?retailerPartnerNumber=807197](https://book.distribusion.com/?retailerPartnerNumber=807197)

[GitLab project](https://gitlab.com/inartov555/js_pw_test) • [Example GitLab pipeline run](https://gitlab.com/inartov555/js_pw_test/-/pipelines)

Created on Dec-01-2025

---

## Running the tests

```
cd framework

./run_tests.sh $1 $2

# Input parameters:
#
#     Use docker (is_isolated)
#   - $1 - true - Docker launches tests with NPM, isolated environment;
#          false - NPM starts tests, NO isolated environment;
#          default = false;
#
#     Only if Docker is used, clearing cache before starting service (when is_isolated = true)
#   - $2 - true - starting tests WITHOUT cached data (allows to start the service faster);
#          false - starting the tests WITH cache (cache is cleared);
#          default = false;
```

### Option A – Local runs (NO Docker)

```bash
cd framework

./run_tests.sh false
```

### Option B – Docker

From the repo root:

```bash
cd framework

# Run tests using Docker compose (reusing build cache)
./run_tests.sh true false

# Run tests with a clean image build (no cache)
./run_tests.sh true true
```

Copied project folder, run results like logs, etc., are located in: `/home/$user_name/TEST1/workspace`. 
Artifacts (run results, logs, etc.) are located in: `/home/$user_name/TEST1/workspace/artifacts`.

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
- **GitLab CI** for automation

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
│  ├─ tests/
│  └─ src/
└─ testStrategy/
```

The actual Playwright project (config, tests, Dockerfile, etc.) is fully contained in the `framework/` directory.

---

## Getting started

### 1. Prerequisites

- Node.js (LTS recommended, e.g. 18+)
- npm
- (Optional) Docker & Docker Compose – if you want to run tests via containers instead of locally.

---

## Configuration

### Playwright configuration

The main config lives in `framework/playwright.config.ts`. It includes:

- `testDir: "./tests"` – where tests are located.
- `baseURL` – taken from the `BASE_URL` environment variable,  
  falling back to the Distribusion booking URL if not provided.
- `outputDir` – controlled by `HOST_ARTIFACTS` or defaults to `playwright-report`.
- HTML report – written under `<HOST_ARTIFACTS>/playwright-report`.

---

## CI/CD with GitLab

This repository is also mirrored to GitLab, where the tests can be run automatically in CI.

- GitLab project: [https://gitlab.com/inartov555/js_pw_test](https://gitlab.com/inartov555/js_pw_test)
- Example pipeline run:  
  [https://gitlab.com/inartov555/js_pw_test/-/pipelines](https://gitlab.com/inartov555/js_pw_test/-/pipelines)
