## Note:
- !!! This is just an example of the code; this framework cannot be used for testing Instagram or running multiple times !!!
- But anyway, the tests run if the framework is started

## Playwright E2E Tests

End-to-end (E2E) automated tests written in TypeScript using Playwright.  
The tests target the Distribution booking portal and live under the `framework/` directory of this repository.

> Default URL:  
> [https://book.distribusion.com/?retailerPartnerNumber=807197](https://book.distribusion.com/?retailerPartnerNumber=807197)

Created on Dec-01-2025

---

### Prerequisites

- Node.js (LTS recommended, e.g. 18+)
- npm
- (Optional) Docker & Docker Compose – if you want to run tests via containers instead of locally.

---

## Running the tests

```
cd framework

# You can just run ./run_tests.sh, it defaults to ./run_tests.sh false false

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
