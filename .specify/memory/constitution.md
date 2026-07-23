<!--
SYNC IMPACT REPORT
Version change: [CONSTITUTION_VERSION] -> 1.0.0 (Initial Ratification)
Modified principles:
- [PRINCIPLE_1_NAME] -> I. Wasp & Full-Stack Type-Safety First
- [PRINCIPLE_2_NAME] -> II. Modular & Extensible SaaS Core
- [PRINCIPLE_3_NAME] -> III. Code Quality & Automated Test Discipline
- [PRINCIPLE_4_NAME] -> IV. AI-Native & Spec-Driven Development
- [PRINCIPLE_5_NAME] -> V. Minimalist & YAGNI Engineering
Added sections:
- Security & Compliance Standards
- Development Workflow & Quality Gates
Removed sections: None
Templates requiring updates:
- .specify/templates/plan-template.md (✅ aligned)
- .specify/templates/spec-template.md (✅ aligned)
- .specify/templates/tasks-template.md (✅ aligned)
Follow-up TODOs: None
-->

# Open SaaS Constitution

## Core Principles

### I. Wasp & Full-Stack Type-Safety First
Every feature MUST build upon the Wasp full-stack framework (React, Node.js, Prisma). End-to-end type safety MUST be preserved across database models, server operations, and frontend components without un-typed escape hatches (e.g. `any`).

*Rationale*: Wasp automates authentication, routing, and RPC type inference. Maintaining strict type boundaries prevents runtime integration bugs and minimizes boilerplate.

### II. Modular & Extensible SaaS Core
Key SaaS subsystem integrations (payments via Stripe/Polar/Lemon Squeezy, transactional email via SendGrid/Mailgun/SMTP, analytics via Plausible/Google Analytics) MUST remain decoupled, feature-flagged, and environment-configurable.

*Rationale*: Open SaaS serves as a versatile foundation for diverse business models; core integrations must be effortlessly customizable or swappable without breaking application architecture.

### III. Code Quality & Automated Test Discipline
All codebase contributions MUST pass ESLint, Prettier formatting, TypeScript compilation, and automated Playwright end-to-end test suites prior to merge. Zero-tolerance policy for unhandled lint or type errors in production branches.

*Rationale*: High quality standards prevent regressions, enforce consistency across team and AI-assisted contributions, and ensure production reliability.

### IV. AI-Native & Spec-Driven Development
Non-trivial feature work MUST follow the SpecKit specification process (`spec.md` → `plan.md` → `tasks.md` → implementation). Code structure, prompt rules, and documentation MUST remain clean and accessible for both human developers and AI coding agents.

*Rationale*: Structured spec artifacts eliminate ambiguity, align human-AI collaboration, and enable automated verification of feature completeness.

### V. Minimalist & YAGNI Engineering
Maintain a lean, transparent boilerplate structure. Developers MUST avoid introducing unnecessary abstraction layers, redundant external dependencies, or premature architectural complexity until proven necessary.

*Rationale*: SaaS starter kits must prioritize clarity and fast developer onboarding over complex abstract patterns.

## Security & Compliance Standards

- Environment variables and secret API keys MUST be handled via validated configuration objects and NEVER exposed to frontend bundles unless explicitly prefixed for public client usage.
- Multi-tenant data isolation and authorization checks MUST be strictly enforced within Wasp server operations and Prisma query scopes.
- Sensitive user data MUST be protected following industry standards for authentication, password hashing, and session management provided by Wasp Auth.

## Development Workflow & Quality Gates

- **Lint & Format**: `npm run lint` and `npm run prettier:check` MUST execute cleanly without errors before pull requests are opened.
- **Database Schema**: Any Prisma schema modifications MUST include clean migration scripts and corresponding type updates.
- **End-to-End Testing**: New user flows MUST be accompanied by Playwright integration/e2e tests.
- **Deployment Compatibility**: Changes MUST maintain compatibility with automated single-command deployments (e.g., Railway, Fly.io).

## Governance

This Constitution supersedes all informal development practices. Proposed amendments require:
1. A specification detailing the amendment rationale.
2. Incrementing `CONSTITUTION_VERSION` according to Semantic Versioning (MAJOR for breaking governance/principle changes, MINOR for additions, PATCH for clarifications).
3. Updating dependent templates in `.specify/templates/` to reflect new rules.

**Version**: 1.0.0 | **Ratified**: 2026-07-22 | **Last Amended**: 2026-07-22
