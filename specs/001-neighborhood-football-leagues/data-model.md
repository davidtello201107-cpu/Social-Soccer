# Data Model: Neighborhood Football Leagues SaaS Platform

## Enums

```prisma
enum Role {
  ADMIN
  MANAGER
  REFEREE
  PLAYER
}

enum MatchStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  POSTPONED
  FORFEITED
}

enum TransferStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum TokenType {
  PARTICIPATION
  FAIR_PLAY
  MATCH_MVP
  BONUS
}
```

## Entities & Schemas

### 1. User & Profile (`User`)
Extends Wasp Auth entity with platform role and wallet linkage.
- `id`: String (Primary Key)
- `email`: String (Unique)
- `username`: String
- `role`: Role (Default: `PLAYER`)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 2. League (`League`)
Represents a competitive league or tournament.
- `id`: String (Primary Key)
- `name`: String
- `season`: String
- `location`: String
- `startDate`: DateTime
- `endDate`: DateTime
- `isTransferWindowOpen`: Boolean (Default: `true`)
- `teams`: Team[]
- `matches`: Match[]

### 3. Team (`Team`)
Represents a participating squad in a league.
- `id`: String (Primary Key)
- `leagueId`: String (Foreign Key -> League)
- `name`: String
- `logoUrl`: String?
- `managerId`: String (Foreign Key -> User)
- `players`: PlayerProfile[]
- `homeMatches`: Match[]
- `awayMatches`: Match[]
- `standings`: StandingsRecord?

### 4. PlayerProfile (`PlayerProfile`)
Represents a player registered under a team.
- `id`: String (Primary Key)
- `userId`: String (Unique, Foreign Key -> User)
- `teamId`: String? (Foreign Key -> Team)
- `jerseyNumber`: Int?
- `position`: String?
- `wallet`: TokenWallet?
- `transfers`: TransferRequest[]

### 5. Referee (`Referee`)
Represents a match official.
- `id`: String (Primary Key)
- `userId`: String (Unique, Foreign Key -> User)
- `certification`: String?
- `matches`: Match[]

### 6. Match (`Match`)
Represents a fixture between two teams.
- `id`: String (Primary Key)
- `leagueId`: String (Foreign Key -> League)
- `homeTeamId`: String (Foreign Key -> Team)
- `awayTeamId`: String (Foreign Key -> Team)
- `refereeId`: String? (Foreign Key -> Referee)
- `scheduledAt`: DateTime
- `venue`: String
- `status`: MatchStatus (Default: `SCHEDULED`)
- `homeScore`: Int (Default: `0`)
- `awayScore`: Int (Default: `0`)
- `events`: MatchEvent[]

### 7. MatchEvent (`MatchEvent`)
Records goals, cards, and match occurrences.
- `id`: String (Primary Key)
- `matchId`: String (Foreign Key -> Match)
- `playerId`: String (Foreign Key -> PlayerProfile)
- `type`: String (GOAL, YELLOW_CARD, RED_CARD, ASSIST)
- `minute`: Int

### 8. StandingsRecord (`StandingsRecord`)
Calculated ranking stats for a team in a league.
- `id`: String (Primary Key)
- `leagueId`: String (Foreign Key -> League)
- `teamId`: String (Unique, Foreign Key -> Team)
- `played`: Int (Default: `0`)
- `won`: Int (Default: `0`)
- `drawn`: Int (Default: `0`)
- `lost`: Int (Default: `0`)
- `goalsFor`: Int (Default: `0`)
- `goalsAgainst`: Int (Default: `0`)
- `goalDifference`: Int (Default: `0`)
- `points`: Int (Default: `0`)

### 9. TransferRequest (`TransferRequest`)
Tracks player movement state between teams.
- `id`: String (Primary Key)
- `playerId`: String (Foreign Key -> PlayerProfile)
- `fromTeamId`: String (Foreign Key -> Team)
- `toTeamId`: String (Foreign Key -> Team)
- `status`: TransferStatus (Default: `PENDING`)
- `requestedAt`: DateTime

### 10. TokenWallet & TokenTransaction (`TokenWallet`, `TokenTransaction`)
Ledger for tracking participation token rewards.
- `TokenWallet`:
  - `id`: String (Primary Key)
  - `playerId`: String (Unique, Foreign Key -> PlayerProfile)
  - `balance`: Int (Default: `0`)
- `TokenTransaction`:
  - `id`: String (Primary Key)
  - `walletId`: String (Foreign Key -> TokenWallet)
  - `amount`: Int
  - `type`: TokenType
  - `description`: String
  - `createdAt`: DateTime
