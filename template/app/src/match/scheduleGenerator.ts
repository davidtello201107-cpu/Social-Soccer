export interface GenerateFixturesOptions {
  teamIds: string[];
  startDate: Date | string;
  venue?: string;
  daysBetweenRounds?: number;
}

export interface ScheduledFixture {
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: Date;
  venue: string;
  round: number;
}

/**
 * Generates a round-robin fixture schedule for a list of team IDs.
 * Uses the Berger algorithm (circle rotation) to pair teams across rounds.
 * Handles odd numbers of teams by inserting a dummy 'BYE' team.
 */
export function generateRoundRobinFixtures(options: GenerateFixturesOptions): ScheduledFixture[] {
  const {
    teamIds,
    startDate,
    venue = "Main Field",
    daysBetweenRounds = 7,
  } = options;

  if (!teamIds || teamIds.length < 2) {
    return [];
  }

  const baseDate = new Date(startDate);
  const teams = [...teamIds];

  // If odd number of teams, add dummy 'BYE' team
  const isOdd = teams.length % 2 !== 0;
  if (isOdd) {
    teams.push("BYE");
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const fixtures: ScheduledFixture[] = [];

  for (let round = 0; round < numRounds; round++) {
    // Round execution date: baseDate + round * daysBetweenRounds
    const roundDate = new Date(baseDate);
    roundDate.setDate(roundDate.getDate() + round * daysBetweenRounds);

    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      let home = teams[matchIdx];
      let away = teams[numTeams - 1 - matchIdx];

      // Alternate home/away for index 0 team every round to balance home/away games
      if (matchIdx === 0 && round % 2 === 1) {
        const temp = home;
        home = away;
        away = temp;
      }

      // Ignore BYE matches
      if (home !== "BYE" && away !== "BYE") {
        // Stagger match time by 2 hours per match index in the same round
        const matchScheduledAt = new Date(roundDate);
        matchScheduledAt.setHours(10 + matchIdx * 2, 0, 0, 0);

        fixtures.push({
          homeTeamId: home,
          awayTeamId: away,
          scheduledAt: matchScheduledAt,
          venue,
          round: round + 1,
        });
      }
    }

    // Rotate teams clockwise around fixed index 0
    // [teams[0], teams[numTeams - 1], teams[1], teams[2], ..., teams[numTeams - 2]]
    teams.splice(1, 0, teams.pop()!);
  }

  return fixtures;
}
