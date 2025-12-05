# Testing Strategy – Distribusion White‑Label Booking Flow

## 1. Scope & context

The current scope is the **search → results → checkout** flow of the Distribusion white‑label web app.

Key business risks:
- A user **cannot find any connections** (search or filters broken)
- A user **cannot successfully complete a booking** due to UI or validation bugs
- A user is **shown incorrect prices or itineraries**
- **Payment** or checkout issues (but production payments must not be triggered from tests)

## 2. Test pyramid & layers

### Unit / component level (usually, owned by devs, but QA can influence)

- React component tests (e.g. with Jest + React Testing Library):
  - Search form behaviour (validation, date pickers, passenger selector)
  - Filters/sorting components (correct options, default state)
  - Price/calculation widgets
  - Discount code UI once implemented

### End‑to‑End (E2E) UI tests (this project)

- Small but meaningful suite that validates critical journeys:
  - Happy path: search → view results → reach checkout (without paying)
  - Filtering/sorting: user can refine results without losing content
  - Validation: user cannot start a search with obviously invalid input
  - (Optional) smoke around checkout fields (passenger details required, payment section visible)

Target: ~10–20 stable, fast, and business‑critical E2E tests rather than hundreds of brittle ones.

## 3. Priorities & critical paths

1. **Search input correctness**
   - Correct origin/destination
   - Date/time in the future
   - Passenger counts

2. **Result list integrity**
   - At least one result for known test data
   - Filters/sorting do not break navigation or hide all results unexpectedly

3. **Checkout integrity**
   - Selected trip details correctly propagated
   - Prices consistent with results page
   - Required passenger fields present
   - Payment section visible, but no real payment triggered from tests

## 4. Tools & patterns

- **Playwright + TypeScript**
  - First‑class support for modern browsers, tracing, and CI integration
- **Page Object Model**
  - `SearchPage`, `ResultsPage`, `CheckoutPage` encapsulate selectors and flows
  - Tests stay readable and intention‑revealing
- **Configurable base URL**
  - `BASE_URL` env var for easy switching between staging/production‑like environments
- **CI integration**
  - GitHub Actions / GitLab CI running tests on every push/merge
  - Artifacts: HTML report, traces, screenshots on failure

## 5. Main challenges & mitigation

### a) Fragile selectors on a 3rd‑party white‑label app

- **Challenge**: Limited control over DOM, frequent A/B experiments.
- **Mitigation**:
  - Prefer accessible selectors (`getByRole`, `getByLabel`, `getByText`)
  - Agree on stable `data-testid` attributes for key elements (via contract with the dev team)
  - Keep selectors centralized in page objects

### b) Payments and external providers (Stripe, etc.)

- **Challenge**: Cannot execute real payments from automated tests.
- **Mitigation**:
  - E2E tests **stop before clicking “PAY NOW”**
  - For deeper flows, run against **sandbox** or stub payment calls in lower environments
  - Use **API tests** or mocked flows to validate discount logic, totals, and payment payloads

### c) Test data & flakiness

- **Challenge**: Real schedules, capacity limits, dynamic pricing.
- **Mitigation**:
  - Request a **stable test route** (e.g. fixed origin/destination with guaranteed availability)
  - Use **date offsets** (e.g. +7 days) with known good days from product/ops
  - Keep E2E suite small; push most cases down to API/component tests
  - Use Playwright’s **tracing** and network recording to debug failures

## 6. E2E vs. API vs. component - what to test where?

- **Component tests**:
  - All detailed validation rules (date ranges, passenger limits, error messages)
  - UI states of buttons, tooltips, disabled states

- **API tests**:
  - Pricing/discount logic, boundary conditions (zero / max discount)
  - All permutations of optional parameters (currency, locale, express vs. standard checkout)

- **E2E tests**:
  - Only **representative paths**:
    - Can I search and see results?
    - Can I refine results with filters?
    - Do trip details carry over correctly to checkout?
    - Is checkout structurally correct (but no payment)?

## 7. Observations about testability

- The white‑label UI is reasonably **consistent and semantically structured**, which helps accessible selectors.
- Some flows (e.g. passenger selection and seatmap) may benefit from **additional data‑test attributes**.
- Having a dedicated **staging environment** and a stable **test route** is key to long‑term reliable automation.
