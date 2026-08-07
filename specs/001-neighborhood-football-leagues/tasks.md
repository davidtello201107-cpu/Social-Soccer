# Tasks: Neighborhood Football Leagues SaaS Platform

**Feature Branch**: `001-neighborhood-football-leagues`  
**Specification**: [spec.md](./spec.md) | **Implementation Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md) | **Operations Contract**: [contracts/operations.md](./contracts/operations.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment verification

- [x] T001 Verify Wasp framework dependencies and environment configuration in `template/app/package.json`
- [x] T002 [P] Verify code quality, linting, and formatting tools configuration in `template/app/eslint.config.js` and `template/app/prettier.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models and authentication infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Update Prisma schema with platform roles and user entity extensions in `template/app/schema.prisma`
- [ ] T004 Add core football domain Prisma models (`League`, `Team`, `PlayerProfile`, `Referee`, `Match`, `MatchEvent`, `StandingsRecord`, `TransferRequest`, `TokenWallet`, `TokenTransaction`) in `template/app/schema.prisma`
- [ ] T005 Run database migration to apply domain schema changes in `template/app/schema.prisma`
- [x] T006 [P] Declare global Wasp routes, auth, and role-based permissions in `template/app/main.wasp.ts`
- [ ] T007 [P] Create multi-role app layout and navigation bar in `template/app/src/client/components/NavBar.tsx` and `template/app/src/client/App.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - League & Team Administration (Priority: P1) 🎯 MVP

**Goal**: Allow Administrators to create and configure neighborhood football leagues, register teams, assign referees, and build player rosters with assigned jersey numbers and positions.

**Independent Test**: Can be verified by creating a new league, registering 4 teams with 10 players each, assigning 2 referees, and inspecting the team rosters and referee pool lists.

### Tests for User Story 1

- [ ] T008 [P] [US1] Write end-to-end integration test for League, Team, Player, and Referee setup flow in `template/app/e2e-tests/league-admin.spec.ts`

### Implementation for User Story 1

- [ ] T009 [P] [US1] Declare Wasp actions and queries for League & Team administration (`createLeague`, `getLeagues`, `createTeam`, `getLeagueTeams`, `addPlayerToTeam`, `assignReferee`) in `template/app/main.wasp.ts`
- [ ] T010 [US1] Implement `createLeague` action and `getLeagues` query operations in `template/app/src/league/operations.ts`
- [ ] T011 [US1] Implement `createTeam`, `getLeagueTeams`, and `addPlayerToTeam` operations in `template/app/src/league/operations.ts`
- [ ] T012 [US1] Implement `assignReferee` and `getReferees` operations in `template/app/src/league/operations.ts`
- [ ] T013 [P] [US1] Build League Creation and Configuration page component in `template/app/src/league/pages/LeagueDashboardPage.tsx`
- [ ] T014 [P] [US1] Build Team Registration and Player Roster management UI in `template/app/src/league/pages/TeamRosterPage.tsx`
- [ ] T015 [P] [US1] Build Referee Management and Pool Assignment UI in `template/app/src/league/pages/RefereePoolPage.tsx`
- [ ] T016 [US1] Integrate League, Team, and Referee UI components with Wasp backend operations in `template/app/src/league/pages/LeagueDashboardPage.tsx`

**Checkpoint**: User Story 1 is fully functional as an independent MVP.

---

## Phase 4: User Story 2 - Match Scheduling, Results & Standings (Priority: P1)

**Goal**: Generate round-robin match fixtures, allow referees/admins to log match scores, scorers, and disciplinary cards, and recalculate league standings in real time.

**Independent Test**: Can be verified by generating a 4-team round-robin schedule, logging match outcomes, and checking that standings points (3 for win, 1 for draw, 0 for loss), goal difference, and ranks update accurately under 1 second.

### Tests for User Story 2

- [ ] T017 [P] [US2] Write end-to-end test for fixture schedule generation, result entry, and standings calculation in `template/app/e2e-tests/match-standings.spec.ts`

### Implementation for User Story 2

- [ ] T018 [P] [US2] Declare Wasp actions and queries for matches and standings (`generateFixtures`, `getFixtures`, `submitMatchResult`, `getLeagueStandings`) in `template/app/main.wasp.ts`
- [ ] T019 [US2] Implement round-robin fixture schedule generation algorithm in `template/app/src/match/scheduleGenerator.ts`
- [ ] T020 [US2] Implement `generateFixtures` action and `getFixtures` query in `template/app/src/match/operations.ts`
- [ ] T021 [US2] Implement standings calculation engine (points, GD, GF, GA, tie-breaker rules) in `template/app/src/match/standingsEngine.ts`
- [ ] T022 [US2] Implement `submitMatchResult` action to record scores, goal events, cards, set status to COMPLETED, and update standings in `template/app/src/match/operations.ts`
- [ ] T023 [US2] Implement `getLeagueStandings` query operation in `template/app/src/match/operations.ts`
- [ ] T024 [P] [US2] Build Fixture Schedule list and fixture assignment page component in `template/app/src/match/pages/FixtureSchedulePage.tsx`
- [ ] T025 [P] [US2] Build Referee Match Result Submission form UI component in `template/app/src/match/pages/MatchResultPage.tsx`
- [ ] T026 [P] [US2] Build Real-time League Standings Table UI component in `template/app/src/match/pages/StandingsPage.tsx`
- [ ] T027 [US2] Connect Fixture, Result Entry, and Standings UI to backend Wasp operations in `template/app/src/match/pages/StandingsPage.tsx`

**Checkpoint**: User Stories 1 and 2 deliver complete competitive league management functionality.

---

## Phase 5: User Story 3 - Player Transfer Management (Priority: P2)

**Goal**: Support player transfer requests, dual-approval authorization workflows, and roster migration during open transfer windows.

**Independent Test**: Can be verified by initiating a player transfer request from Team A to Team B, approving it as Team B manager/Admin, confirming roster migration, and checking that transfers are blocked when windows are closed.

### Tests for User Story 3

- [ ] T028 [P] [US3] Write end-to-end test for player transfer workflows and window enforcement in `template/app/e2e-tests/player-transfer.spec.ts`

### Implementation for User Story 3

- [ ] T029 [P] [US3] Declare Wasp actions and queries for transfer management (`requestTransfer`, `respondTransfer`, `getPendingTransfers`, `toggleTransferWindow`) in `template/app/main.wasp.ts`
- [ ] T030 [US3] Implement `requestTransfer` action with transfer window validation in `template/app/src/transfer/operations.ts`
- [ ] T031 [US3] Implement `respondTransfer` action for manager approval and roster migration in `template/app/src/transfer/operations.ts`
- [ ] T032 [US3] Implement `getPendingTransfers` query and `toggleTransferWindow` admin action in `template/app/src/transfer/operations.ts`
- [ ] T033 [P] [US3] Build Transfer Request modal and player selector component in `template/app/src/transfer/components/TransferRequestModal.tsx`
- [ ] T034 [P] [US3] Build Pending Transfers & Approval Dashboard component in `template/app/src/transfer/pages/TransferDashboardPage.tsx`
- [ ] T035 [US3] Integrate Transfer Dashboard with backend operations and user notifications in `template/app/src/transfer/pages/TransferDashboardPage.tsx`

**Checkpoint**: Player transfers work seamlessly across team rosters with authorization checks.

---

## Phase 6: User Story 4 - Participation Rewards & Token System (Priority: P2)

**Goal**: Automatically issue participation tokens to players upon match verification and fair play awards, maintained in an internal immutable double-entry ledger.

**Independent Test**: Can be verified by confirming a completed match result, checking player token wallets for credited tokens within 10 seconds, and reviewing the transaction history ledger.

### Tests for User Story 4

- [ ] T036 [P] [US4] Write end-to-end test for participation token credit and wallet ledger verification in `template/app/e2e-tests/token-ledger.spec.ts`

### Implementation for User Story 4

- [ ] T037 [P] [US4] Declare Wasp actions and queries for token wallet and transactions (`getPlayerWallet`, `distributeFairPlayTokens`) in `template/app/main.wasp.ts`
- [ ] T038 [US4] Implement token transaction minting and ledger distribution service in `template/app/src/token/ledgerService.ts`
- [ ] T039 [US4] Trigger automatic token distribution on match completion inside `submitMatchResult` in `template/app/src/match/operations.ts`
- [ ] T040 [US4] Implement `getPlayerWallet` query and `distributeFairPlayTokens` action in `template/app/src/token/operations.ts`
- [ ] T041 [P] [US4] Build Player Token Wallet & Transaction History Dashboard in `template/app/src/token/pages/PlayerWalletPage.tsx`
- [ ] T042 [P] [US4] Build Admin Token Distribution & Fair Play Rewards UI in `template/app/src/token/pages/AdminTokenPage.tsx`
- [ ] T043 [US4] Connect Wallet and Reward UI components to backend token operations in `template/app/src/token/pages/PlayerWalletPage.tsx`

**Checkpoint**: All user stories fully implemented with participation token ledger integration.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final formatting, documentation updates, and scenario validation

- [ ] T044 [P] Update navigation routes, public landing page, and project overview in `template/app/README.md`
- [ ] T045 [P] Run end-to-end scenario validation from `specs/001-neighborhood-football-leagues/quickstart.md`
- [ ] T046 Perform codebase linting and type check verification (`npm run lint`, `npm run prettier:check`) in `template/app/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion.
  - User Story 1 (P1): Can start immediately after Phase 2.
  - User Story 2 (P1): Depends on Phase 2; uses models from US1 (Leagues, Teams, Players).
  - User Story 3 (P2): Depends on Phase 2; operates on Team rosters created in US1.
  - User Story 4 (P2): Depends on Phase 2; triggered by Match completions from US2.
- **Polish (Phase 7)**: Depends on completion of target user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Independent foundation for domain entities.
- **User Story 2 (P1)**: Operates on teams created in US1, but can be built in parallel after Phase 2 models exist.
- **User Story 3 (P2)**: Operates on player/team profiles created in US1.
- **User Story 4 (P2)**: Hooks into match completion events defined in US2.

---

## Parallel Execution Examples

### Parallel Example: User Story 1 (League & Team Administration)

```bash
# Launch test creation:
Task: "Write end-to-end integration test for League, Team, Player, and Referee setup flow in template/app/e2e-tests/league-admin.spec.ts"

# Launch UI components in parallel:
Task: "Build League Creation and Configuration page component in template/app/src/league/pages/LeagueDashboardPage.tsx"
Task: "Build Team Registration and Player Roster management UI in template/app/src/league/pages/TeamRosterPage.tsx"
Task: "Build Referee Management and Pool Assignment UI in template/app/src/league/pages/RefereePoolPage.tsx"
```

### Parallel Example: User Story 2 (Match Scheduling & Standings)

```bash
# Launch UI components in parallel:
Task: "Build Fixture Schedule list and fixture assignment page component in template/app/src/match/pages/FixtureSchedulePage.tsx"
Task: "Build Referee Match Result Submission form UI component in template/app/src/match/pages/MatchResultPage.tsx"
Task: "Build Real-time League Standings Table UI component in template/app/src/match/pages/StandingsPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - League & Team Administration).
3. **STOP and VALIDATE**: Verify league creation, team registration, player rosters, and referee pools.
4. Demo/Deploy MVP foundation.

### Incremental Delivery

1. Foundation → Setup + Core Models ready.
2. Increment 1 (MVP) → User Story 1 (League & Team Administration).
3. Increment 2 → User Story 2 (Match Scheduling, Results & Standings).
4. Increment 3 → User Story 3 (Player Transfer Management).
5. Increment 4 → User Story 4 (Participation Rewards & Token System).
6. Polish → Scenario validation and lint/type checks.
