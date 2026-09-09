# MORPHO output investigation

## Follow-up: show unchanged markets

- [x] Show configured disabled markets with an explanation when speeds are unchanged.
- [x] Verify unchanged and reward-removal output and retain omission of unconfigured markets.

Verified the updated generator with assertions for unchanged MORPHO visibility, preserved reward-removal text, and omission of null-alias markets. Bundle and diff whitespace checks passed. JSON and reward calculations are unchanged.

- [x] Trace Base MORPHO discovery, configuration mapping, and output filters.
- [x] Reproduce Markdown and JSON behavior with focused verification.
- [x] Fix any confirmed defect and record findings and verification.

## Review

No source defect confirmed; no application or configuration changes made. Existing config edits belong to the user.

Read-only Base RPC verification at block 51095493 confirmed MORPHO is in getAllMarkets with an exact config-address match. WELL and USDC both have raw supply speed 0 and borrow speed 1. Thus all four proposed speeds are unchanged sentinels, and the Markdown generator intentionally hides the disabled market.

Executed both local output generators with these proposed speeds: Markdown omits MORPHO, JSON retains MOONWELL_MORPHO's WELL entry with unchanged speeds (-1) and the new epoch end time, and drops its USDC no-op. Also verified that a supply-removal action appears in both outputs. All four assertions passed. This verifies local behavior with current chain speeds, not the user's unspecified deployed URL or historical snapshot.
