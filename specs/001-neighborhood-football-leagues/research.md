# Technical Research: Neighborhood Football Leagues SaaS Platform

## 1. Wasp Full-Stack Operations & Architecture

### Decision
Utilize Wasp server operations (Actions for mutations, Queries for data fetching) connected directly to React components via auto-generated types (`wasp/client/operations`).

### Rationale
Wasp handles RPC serialization, cache invalidation, end-to-end TypeScript types, and session authentication automatically. This adheres strictly to **Constitution Principle I (Wasp & Full-Stack Type-Safety First)**.

### Alternatives Considered
- *Custom REST API Express endpoints*: Rejected; loses automated type safety and introduces boilerplate.
- *GraphQL*: Rejected; unnecessary complexity for this scale (violates **Constitution Principle V - YAGNI**).

---

## 2. Standings & Match Calculations Engine

### Decision
Calculate team standings dynamically or via incremental update triggers upon match confirmation. Results store match events (Goals, Yellow Cards, Red Cards) and compute points (3 W, 1 D, 0 L), Goal Difference ($GF - GA$), and tie-breakers.

### Rationale
Sub-second standings updates (**SC-002**) require efficient queries. Storing calculated standings cache in a `Standings` table or computing via optimized Prisma queries ensures instant response times.

### Alternatives Considered
- *Heavy client-side sorting*: Rejected; inefficient and inconsistent across clients.
- *External worker process*: Rejected; overkill for immediate score submission flows.

---

## 3. Token System & Reward Ledger Architecture

### Decision
Implement an internal double-entry style token transaction ledger (`TokenLedger`) within Prisma. When a referee/admin verifies a match, a server action executes a Prisma transaction to mint participation tokens into player balances (`TokenWallet`).

### Rationale
Provides auditability, immutability, and instant balance updates (**SC-004**). Decoupled from external web3/blockchain integrations to keep initial SaaS footprint simple while leaving hooks for future expansion (**Constitution Principle II & V**).

### Alternatives Considered
- *On-chain ERC-20 Tokens*: Rejected for initial phase due to user onboarding friction and gas fees.
- *Simple integer column on User*: Rejected because it lacks audit trails and transaction history.

---

## 4. Authorization & Multi-Tenant Role Security

### Decision
Enforce 4 primary user roles (`ADMIN`, `MANAGER`, `REFEREE`, `PLAYER`) inside Wasp operation handlers and Prisma context checks.

### Rationale
Ensures strict multi-tenant isolation and domain permissions (**Security & Compliance Standards**). Managers can only modify their team; referees can only log assigned matches; admins maintain global control.
