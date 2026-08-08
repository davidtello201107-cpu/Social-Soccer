export interface TeamInput {
  id: string;
  name: string;
  logo?: string | null;
}

export interface MatchEventInput {
  id?: string;
  type: string; // 'GOAL', 'YELLOW_CARD', 'RED_CARD'
  teamId?: string | null;
  playerId?: string | null;
}

export interface MatchInput {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status: string; // 'COMPLETED', 'FORFEITED', 'SCHEDULED', etc.
  forfeitedByTeamId?: string | null;
  events?: MatchEventInput[];
}

export interface TeamStandings {
  [key: string]: any;
  rank: number;
  teamId: string;
  teamName: string;
  logo?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  yellowCards: number;
  redCards: number;
}

/**
 * Calculates league standings for a given set of teams and matches.
 * Applies official football tie-breaker rules:
 * 1. Points (3 for win, 1 for draw, 0 for loss)
 * 2. Goal Difference (Goals For - Goals Against)
 * 3. Goals For (Goals Scored)
 * 4. Head-to-Head points/GD among tied teams
 * 5. Disciplinary record (fewest red cards, then fewest yellow cards)
 * 6. Alphabetical order by team name
 */
export function calculateStandings(
  teams: TeamInput[],
  matches: MatchInput[]
): TeamStandings[] {
  // Initialize standings map for each team
  const standingsMap = new Map<string, TeamStandings>();

  for (const team of teams) {
    standingsMap.set(team.id, {
      rank: 0,
      teamId: team.id,
      teamName: team.name,
      logo: team.logo || null,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
    });
  }

  // Process completed and forfeited matches
  for (const match of matches) {
    if (match.status !== "COMPLETED" && match.status !== "FORFEITED") {
      continue;
    }

    const homeTeam = standingsMap.get(match.homeTeamId);
    const awayTeam = standingsMap.get(match.awayTeamId);

    if (!homeTeam || !awayTeam) {
      continue;
    }

    let homeScore = match.homeScore ?? 0;
    let awayScore = match.awayScore ?? 0;

    // Handle Forfeits: 3-0 victory to non-forfeiting team
    if (match.status === "FORFEITED") {
      if (match.forfeitedByTeamId === match.homeTeamId) {
        homeScore = 0;
        awayScore = 3;
      } else {
        homeScore = 3;
        awayScore = 0;
      }
    }

    homeTeam.played += 1;
    awayTeam.played += 1;

    homeTeam.goalsFor += homeScore;
    homeTeam.goalsAgainst += awayScore;
    awayTeam.goalsFor += awayScore;
    awayTeam.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      homeTeam.won += 1;
      homeTeam.points += 3;
      awayTeam.lost += 1;
    } else if (awayScore > homeScore) {
      awayTeam.won += 1;
      awayTeam.points += 3;
      homeTeam.lost += 1;
    } else {
      homeTeam.drawn += 1;
      homeTeam.points += 1;
      awayTeam.drawn += 1;
      awayTeam.points += 1;
    }

    // Process disciplinary cards if match events exist
    if (match.events && Array.isArray(match.events)) {
      for (const event of match.events) {
        if (!event.teamId) continue;
        const teamStats = standingsMap.get(event.teamId);
        if (!teamStats) continue;

        if (event.type === "YELLOW_CARD") {
          teamStats.yellowCards += 1;
        } else if (event.type === "RED_CARD") {
          teamStats.redCards += 1;
        }
      }
    }
  }

  // Compute final Goal Difference for each team
  const standingsList = Array.from(standingsMap.values()).map((team) => ({
    ...team,
    goalDifference: team.goalsFor - team.goalsAgainst,
  }));

  // Sort teams using full tie-breaker rules
  const sortedStandings = sortStandings(standingsList, matches);

  // Assign ranks (1-indexed)
  return sortedStandings.map((team, index) => ({
    ...team,
    rank: index + 1,
  }));
}

/**
 * Sorts team standings based on points, goal difference, goals for, head-to-head, discipline, and name.
 */
export function sortStandings(
  standings: TeamStandings[],
  matches: MatchInput[]
): TeamStandings[] {
  const standingsCopy = [...standings];

  standingsCopy.sort((a, b) => {
    // 1. Points (descending)
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    // 2. Goal Difference (descending)
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    // 3. Goals For (descending)
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    // 4. Head-to-Head Comparison
    const h2hResult = compareHeadToHead(a.teamId, b.teamId, matches);
    if (h2hResult !== 0) {
      return h2hResult;
    }

    // 5. Disciplinary Record (fewest red cards, then fewest yellow cards)
    if (a.redCards !== b.redCards) {
      return a.redCards - b.redCards; // ascending: 0 red cards is better than 1
    }
    if (a.yellowCards !== b.yellowCards) {
      return a.yellowCards - b.yellowCards; // ascending: fewer yellow cards is better
    }

    // 6. Alphabetical by Team Name
    return a.teamName.localeCompare(b.teamName);
  });

  return standingsCopy;
}

/**
 * Evaluates head-to-head record between two specific teams.
 * Returns negative if Team A is ahead, positive if Team B is ahead, or 0 if tied.
 */
function compareHeadToHead(
  teamAId: string,
  teamBId: string,
  matches: MatchInput[]
): number {
  const h2hMatches = matches.filter(
    (m) =>
      (m.status === "COMPLETED" || m.status === "FORFEITED") &&
      ((m.homeTeamId === teamAId && m.awayTeamId === teamBId) ||
        (m.homeTeamId === teamBId && m.awayTeamId === teamAId))
  );

  if (h2hMatches.length === 0) {
    return 0;
  }

  let teamAPoints = 0;
  let teamBPoints = 0;
  let teamAGoals = 0;
  let teamBGoals = 0;

  for (const match of h2hMatches) {
    let homeScore = match.homeScore ?? 0;
    let awayScore = match.awayScore ?? 0;

    if (match.status === "FORFEITED") {
      if (match.forfeitedByTeamId === match.homeTeamId) {
        homeScore = 0;
        awayScore = 3;
      } else {
        homeScore = 3;
        awayScore = 0;
      }
    }

    const isAHome = match.homeTeamId === teamAId;
    const scoreA = isAHome ? homeScore : awayScore;
    const scoreB = isAHome ? awayScore : homeScore;

    teamAGoals += scoreA;
    teamBGoals += scoreB;

    if (scoreA > scoreB) {
      teamAPoints += 3;
    } else if (scoreB > scoreA) {
      teamBPoints += 3;
    } else {
      teamAPoints += 1;
      teamBPoints += 1;
    }
  }

  // Head-to-Head Points
  if (teamBPoints !== teamAPoints) {
    return teamBPoints - teamAPoints;
  }

  // Head-to-Head Goal Difference
  const h2hDiffA = teamAGoals - teamBGoals;
  const h2hDiffB = teamBGoals - teamAGoals;
  if (h2hDiffB !== h2hDiffA) {
    return h2hDiffB - h2hDiffA;
  }

  // Head-to-Head Goals Scored
  return teamBGoals - teamAGoals;
}
