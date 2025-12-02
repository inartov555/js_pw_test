# Testing the Future Discount Code Feature

Assumed feature:

> On the checkout page, there is a text input where the user can enter a discount code.
> If the code is valid, a **fixed amount discount** is applied to the total price.
> If invalid, an error is shown and the total remains unchanged.

## 1. High‑level acceptance criteria

1. A user can enter a valid discount code and see:
   - A success indication (e.g. “Code applied”)
   - A line item in the price breakdown (e.g. `Discount: -10.00 EUR`)
   - The total reduced by the fixed amount

2. An invalid/expired code:
   - Shows a clear error message
   - Does **not** change the price

3. A code cannot be applied more than once per booking.

4. A code cannot make the price negative or zero unless explicitly allowed.

5. The discount is correctly propagated to the payment provider (amount charged matches discounted total).

## 2. UI / E2E tests (Playwright)

Assuming selectors like:

- `data-testid="discount-code-input"`
- `data-testid="discount-apply-button"`
- `data-testid="discount-message"`
- `data-testid="price-total"`

### Example scenarios

1. **Happy path – valid code**

- Navigate search → results → checkout (using existing POMs).
- Enter a known good code, e.g. `QA_FIXED_10`.
- Click “Apply”.
- Assert:
  - A success message is visible.
  - The total decreased by exactly 10.00 EUR.
  - The discount line item is visible.

2. **Invalid code**

- Enter `THIS_IS_INVALID` and apply.
- Assert:
  - Error message visible (“Invalid or expired code”).
  - Total price unchanged.

3. **Code applied twice in UI**

- Apply `QA_FIXED_10` once.
- Try applying it again.
- Assert:
  - Message like “Code already applied”.
  - Total stays the same after the second attempt.

4. **Edge cases**

- Leading/trailing spaces (`"  QA_FIXED_10  "`).
- Different casing (`"qa_fixed_10"`).
- Form submission via Enter key instead of clicking.

> These tests remain relatively cheap and fast because they re‑use the existing search → checkout happy path.

## 3. API tests

Assuming API endpoints like:

- `POST /discounts/validate`
- `POST /cart/apply-discount`

We would cover:

- Valid/invalid codes
- Expired codes
- Codes not applicable to current route/currency
- Idempotency (applying same code twice)
- Security:
  - Cannot apply arbitrary discount by manipulating payload
  - Proper authorization (discount only for current cart/session)

Example checks:

- Response includes:
  - `discountAmount` (fixed amount)
  - `currency`
  - `newTotal`
  - Clear error type for invalid cases

## 4. Component tests

For the small React component managing discount codes:

- Local state changes when user types.
- Validation messages shown/hidden at the right times.
- Buttons disabled while async validation is in progress.
- Proper display of discount line items.

## 5. Test data & environments

- Introduce **test‑only discount codes** (e.g. prefixed with `QA_`) that always behave deterministically in staging.
- Validate that **production** never allows these codes.
- Involve product/ops to decide:
  - Max discount value
  - Which routes/currencies support discounts

## 6. Non‑functional aspects

- Performance: applying a code should be fast enough not to frustrate users.
- Accessibility:
  - Field has label, description, and error messages announced to screen readers.
- Analytics:
  - Events are fired when a discount is attempted/applied (for tracking uptake and issues).
