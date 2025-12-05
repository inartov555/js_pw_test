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
