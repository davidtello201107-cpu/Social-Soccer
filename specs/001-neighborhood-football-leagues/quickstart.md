# Quickstart Validation Guide: Neighborhood Football Leagues

## Prerequisites

- Node.js 18+ & npm installed
- Wasp CLI (`npm i -g @wasp.sh/wasp-cli`)
- Running database or local SQLite setup (`wasp db migrate-dev`)

## Scenario 1: Create League & Setup Teams (P1 Flow)

1. Launch application:
   ```bash
   wasp start
   ```
2. Log in as an Administrator (`ADMIN` role).
3. Navigate to **Leagues** → Click **Create League**.
4. Enter League Name: `"Metro Neighborhood Spring League"`, Season: `"2026"`, Location: `"Central Park Pitch"`.
5. Register 4 Teams: `"Eastside Eagles"`, `"West End FC"`, `"Northside United"`, `"Southbank Strikers"`.
6. Add 5 player profiles per team.

## Scenario 2: Fixture Generation & Match Result Verification (P1 Flow)

1. Navigate to **League Fixtures** → Click **Generate Schedule**.
2. Select Match 1 (`Eastside Eagles` vs `West End FC`).
3. Log in as Referee or Admin → Open Match Result Entry.
4. Input Score: `Eastside Eagles 2 - 1 West End FC`.
5. Record goal scorers and minute.
6. Submit Match Result.
7. Navigate to **Standings Table** and verify:
   - `Eastside Eagles`: Played 1, Won 1, Points 3, GD +1.
   - `West End FC`: Played 1, Lost 1, Points 0, GD -1.

## Scenario 3: Player Transfer & Roster Verification (P2 Flow)

1. Log in as `Eastside Eagles` Team Manager.
2. Select Player `"Alex Smith"` → Click **Request Transfer** to `"Northside United"`.
3. Log in as `Northside United` Manager → Approve Transfer Request.
4. Verify `"Alex Smith"` now appears in `Northside United` squad list and is removed from `Eastside Eagles`.

## Scenario 4: Token Ledger Credit Verification (P2 Flow)

1. Log in as Player `"Alex Smith"`.
2. Navigate to **Player Dashboard** → **Token Wallet**.
3. Confirm participation token credit transaction is listed for Match 1 with updated balance.
