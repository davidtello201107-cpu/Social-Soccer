# Interface Contracts: Wasp Operations API

## 1. League Operations

### `createLeague` (Action)
- **Input**: `{ name: string, season: string, location: string, startDate: string, endDate: string }`
- **Output**: `{ id: string, name: string, season: string }`
- **Roles**: `ADMIN`

### `getLeagues` (Query)
- **Input**: `{}`
- **Output**: `Array<{ id: string, name: string, season: string, teamCount: number }>`
- **Roles**: Public / Auth

---

## 2. Match & Standings Operations

### `generateFixtures` (Action)
- **Input**: `{ leagueId: string, startDate: string }`
- **Output**: `{ createdCount: number }`
- **Roles**: `ADMIN`

### `submitMatchResult` (Action)
- **Input**: `{ matchId: string, homeScore: number, awayScore: number, events: Array<{ playerId: string, type: 'GOAL'|'YELLOW_CARD'|'RED_CARD', minute: number }> }`
- **Output**: `{ success: boolean, matchStatus: 'COMPLETED', tokensDistributed: number }`
- **Roles**: `ADMIN`, `REFEREE`

### `getLeagueStandings` (Query)
- **Input**: `{ leagueId: string }`
- **Output**: `Array<{ rank: number, teamName: string, played: number, won: number, drawn: number, lost: number, goalsFor: number, goalsAgainst: number, goalDifference: number, points: number }>`
- **Roles**: Public / Auth

---

## 3. Player Transfer Operations

### `requestTransfer` (Action)
- **Input**: `{ playerId: string, toTeamId: string }`
- **Output**: `{ transferId: string, status: 'PENDING' }`
- **Roles**: `MANAGER`, `ADMIN`

### `respondTransfer` (Action)
- **Input**: `{ transferId: string, accept: boolean }`
- **Output**: `{ transferId: string, status: 'APPROVED' | 'REJECTED' }`
- **Roles**: `MANAGER`, `ADMIN`

---

## 4. Token System Operations

### `getPlayerWallet` (Query)
- **Input**: `{ playerId: string }`
- **Output**: `{ balance: number, history: Array<{ id: string, amount: number, type: string, description: string, createdAt: string }> }`
- **Roles**: `PLAYER`, `MANAGER`, `ADMIN`
