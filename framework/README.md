# QA E2E (Stage 1)

This is a minimal Playwright + TypeScript boilerplate project prepared.

This stage builds on the boilerplate and adds:

- A **Page Object Model** for the core flow: _search → results → checkout_
- At least **three E2E tests** written in TypeScript/Playwright
- Basic utilities for date handling

> ℹ️ **Selectors note**: selectors are written using accessible roles/labels and a few `data-testid` conventions.
> You will likely need to tweak them slightly to match the exact DOM of the white‑label link you were given.
> The structure and patterns are the main focus for the case study.

## Structure

- `src/pages/BasePage.ts` – common helpers (navigation, cookie banners)
- `src/pages/SearchPage.ts` – search form interactions
- `src/pages/ResultsPage.ts` – results list + filters
- `src/pages/CheckoutPage.ts` – checkout screen (without completing payment)
- `src/utils/date.ts` – helper for generating valid future dates

- `tests/search-to-checkout.e2e.spec.ts` – critical user flow
- `tests/filtering.e2e.spec.ts` – filtering & result list behaviour
- `tests/search-validation.e2e.spec.ts` – validation / edge cases on the search form

## Running

Same as stage 1:

```bash
npm install
npx playwright install --with-deps

export BASE_URL="https://<your-distribusion-url>"
npm test
```

The tests **never click on “PAY NOW”**. They only verify that we reach the checkout page and that expected elements are present.
