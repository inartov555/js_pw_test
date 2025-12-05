# Testing Strategy – Distribusion White‑Label Booking Flow

## 1. Scope & context

The current scope is the 'search -> results -> checkout' flow of the Distribusion white‑label web app.

Key business risks:
- A user cannot find any connections (search or filters broken)
- A user cannot successfully complete a booking due to UI or validation bugs
- A user is shown incorrect prices or itineraries
- Payment or checkout issues (but production payments must not be triggered from tests)

Target: ~10–20 stable, fast, and business‑critical E2E tests rather than hundreds of brittle ones.

## 2. Priorities & critical paths

1. **Search input correctness**
   - Correct From/To
   - Departure date in the future
   - Passenger counts

2. **Result list integrity**
   - At least one result for known test data
   - Filters/sorting do not break navigation or hide all results unexpectedly

3. **Checkout integrity**
   - Selected trip details correctly propagated
   - Prices consistent with results page
   - Required passenger fields present

## 3. Tools & patterns

- **Playwright + TypeScript**
  - First‑class support for modern browsers, tracing, and CI integration
- **Page Object Model**
  - `SearchPage`, `ResultsPage`, `CheckoutPage` encapsulate selectors and flows
  - Tests stay readable and intention‑revealing
- **Configurable base URL**
  - `BASE_URL` env var for easy switching between staging/production‑like environments
- **CI integration**
  - GitHub Actions + GitLab CI running tests on every push/merge
  - Artifacts: HTML report, traces, screenshots on failure

## 4. Main challenges & mitigation

### a) Fragile selectors on a 3rd‑party white‑label app

- **Challenge**: Limited control over DOM, frequent A/B experiments.
- **Mitigation**:
  - Keep selectors centralized in page objects

### b) Payments and external providers (Stripe, etc.)

- **Challenge**: Cannot execute real payments from automated tests.
- **Mitigation**:
  - E2E tests stop before clicking “PAY NOW”
  - For deeper flows, run against sandbox or stub payment calls in lower environments
  - Use API tests or mocked flows to validate discount logic, totals, and payment payloads

### c) Test data & flakiness

- **Challenge**: Real schedules, capacity limits, dynamic pricing.
- **Mitigation**:
  - Request a stable test route (e.g. fixed From/To with guaranteed availability)
  - Use Departure date offsets (e.g. +7 days) with known good days from product/ops
  - Keep E2E suite small; push most cases down to API/component tests
  - Use Playwright’s tracing and network recording to debug failures

## 5. Observations about testability

- The white‑label UI is reasonably consistent and semantically structured, which helps accessible selectors.
- Some flows (e.g. passenger selection and seatmap) may benefit from additional data‑test attributes.
- Having a dedicated staging environment and a stable test route is key to long‑term reliable automation.
