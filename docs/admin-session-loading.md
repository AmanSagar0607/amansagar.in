# Admin session loading state

The protected admin layout now streams a shadcn skeleton while the server validates the session. After verification, the authenticated shell replaces the placeholder and shows the account email in the header, including on narrow screens. The sign-in form already displays a pending state while credentials are checked.

## Verification

- `npm run typecheck` passed.
- Targeted ESLint check passed for the layout and admin shell.
- Tests were not run.
