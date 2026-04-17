# Changelog

All notable changes to this project will be documented in this file.

## [1.7.0] - 2026-04-17

### Portal - Fund System

#### Added
- **Deposit 3-Step Wizard**: Rebuilt `/portal/fund/deposit` as a compact wide-screen 3-step wizard.
  - Step 1: Select deposit account + input amount (with quick-amount presets, live validation, and currency symbol prefix).
  - Step 2: Select payment method and click "Confirm Selection" to trigger an async calculation/loading state before proceeding.
  - Step 3: Confirm order details; display integrated receiving account info for bank/crypto, or third-party redirect prompt for card/e-wallet.
- **Step Navigation**: Added "Modify" links on Step 3 to jump back to Step 1 (account/amount) or Step 2 (payment method).
- **Trading Account Formatting**: Updated account labels across deposit, withdraw, and trading account cards to the compact format `Platform-AccountNumber-Type-Equity` (e.g. `MT5-8999998-Pro-¥1,500,000.00`).

#### Fixed
- **Cryptocurrency Exchange Rate Calculation**: Corrected mock exchange rates for BTC/ETH to prevent absurd payment amounts.
  - BTC rate: `0.000012` → `8333333`
  - ETH rate: `0.00035` → `285714`
- **Rate Display Precision**: Improved `rateDisplay` formatting so extremely small rates (< 0.0001) use `toPrecision(6)` instead of rounding to `0.0000`.
- **Currency Symbols**: Extended `currencySymbol` to support crypto symbols: BTC (₿), ETH (Ξ), USDT (₮).

#### Changed
- Refactored `/portal/fund/withdraw`, `/portal/fund/transfer`, and `/portal/fund/history` pages for layout and interaction consistency with the new Fund design language.
- Updated `TradingAccounts.tsx` dashboard cards to align with the new account label format and monospace styling.

---
