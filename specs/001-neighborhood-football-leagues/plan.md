# Implementation Plan: Neighborhood Football Leagues SaaS Platform

**Branch**: `001-neighborhood-football-leagues` | **Date**: 2026-07-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-neighborhood-football-leagues/spec.md`

## Summary

Build a comprehensive SaaS platform for managing neighborhood football leagues leveraging Wasp full-stack framework (React 18, Node.js, Prisma ORM, Shadcn UI). The architecture covers league/team/referee administration, automated round-robin scheduling, real-time standings calculations, player transfer workflows, and an internal token rewards ledger.

## Technical Context

**Language/Version**: TypeScript 5+, React 18+, Node.js 18+  
**Primary Dependencies**: Wasp Framework, Tailwind CSS, Shadcn UI, Lucide Icons  
**Storage**: PostgreSQL / SQLite via Prisma ORM  
**Testing**: Playwright e2e tests (`e2e-tests/`)  
**Target Platform**: Web application (Desktop & Mobile Responsive)  
**Project Type**: Full-stack Web Application (Wasp SaaS Template)  
**Performance Goals**: Standings table updates < 1s, token credit transactions < 10s  
**Constraints**: Zero un-typed escape hatches (`any`); strict multi-tenant authorization  
**Scale/Scope**: Multi-league platform handling hundreds of teams, thousands of players, and token transactions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Principle I: Wasp & Full-Stack Type-Safety First**: All models, operations, and UI components use Wasp auto-generated types without `any`.
- [x] **Principle II: Modular & Extensible SaaS Core**: Token ledger and match engines are decoupled and feature-flagged.
- [x] **Principle III: Code Quality & Automated Test Discipline**: Playwright end-to-end tests cover primary flows; ESLint & Prettier passing.
- [x] **Principle IV: AI-Native & Spec-Driven Development**: Full SpecKit workflow followed (`spec.md` → `research.md` → `data-model.md` → `plan.md`).
- [x] **Principle V: Minimalist & YAGNI Engineering**: Internal token ledger avoids premature web3/blockchain overhead.

## Project Structure

### Documentation (this feature)

```text
specs/001-neighborhood-football-leagues/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research & architectural decisions
├── data-model.md        # Prisma data models & enums
├── quickstart.md        # Validation & verification guide
├── contracts/           # Wasp operations & interface definitions
│   └── operations.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout (template/app)

```text
template/app/
├── schema.prisma              # Database schema definitions
├── main.wasp.ts               # Wasp route, auth, & operation declarations
└── src/
    ├── league/                # League & team management handlers/components
    │   ├── operations.ts
    │   └── pages/
    ├── match/                 # Match fixture, result & standings handlers
    │   ├── operations.ts
    │   └── pages/
    ├── transfer/              # Player transfer request handlers
    │   └── operations.ts
    └── token/                 # Participation token wallet & ledger handlers
        └── operations.ts
```

**Structure Decision**: Integrated directly into `template/app/` following standard Wasp full-stack directory conventions.

## Complexity Tracking

| Violation | Why Needed                          | Simpler Alternative Rejected Because |
| --------- | ----------------------------------- | ------------------------------------ |
| _None_    | _Fully compliant with Constitution_ | _N/A_                                |
