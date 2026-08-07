export interface GenerateFixturesOptions {
  teamIds: string[];
  startDate: Date | string;
  venue?: string;
  daysBetweenRounds?: number;
  doubleRoundRobin?: boolean;
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
    doubleRoundRobin = false,
  } = options || {};

  if (!teamIds || !Array.isArray(teamIds)) {
    return [];
  }

  // Filter out invalid/empty team IDs
  const validTeamIds = teamIds.filter(
    (id) => typeof id === "string" && id.trim().length > 0
  );

  if (validTeamIds.length < 2) {
    return [];
  }

  // Safely parse start date
  let baseDate = new Date(startDate);
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  const teams = [...validTeamIds];

  // If odd number of teams, add dummy 'BYE' team
  const isOdd = teams.length % 2 !== 0;
  if (isOdd) {
    teams.push("BYE");
  }

  const numTeams = teams.length;
  const singleLegRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const fixtures: ScheduledFixture[] = [];

  // Helper to generate a single round-robin pass
  const generateLeg = (
    currentTeams: string[],
    startRoundNumber: number,
    startBaseDate: Date,
    isReturnLeg: boolean = false
  ) => {
    const legTeams = [...currentTeams];

    for (let round = 0; round < singleLegRounds; round++) {
      const roundDate = new Date(startBaseDate);
      roundDate.setDate(roundDate.getDate() + round * Math.max(1, daysBetweenRounds));

      for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
        let home = legTeams[matchIdx];
        let away = legTeams[numTeams - 1 - matchIdx];

        // Alternate home/away for index 0 team every round to balance home/away games
        if (matchIdx === 0 && round % 2 === 1) {
          const temp = home;
          home = away;
          away = temp;
        }

        // For return leg, swap home and away teams
        if (isReturnLeg) {
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
            round: startRoundNumber + round,
          });
        }
      }

      // Rotate teams clockwise around fixed index 0
      // [teams[0], teams[numTeams - 1], teams[1], teams[2], ..., teams[numTeams - 2]]
      legTeams.splice(1, 0, legTeams.pop()!);
    }
  };

  // Generate first leg (first round robin)
  generateLeg(teams, 1, baseDate, false);

  // If double round-robin requested, generate return leg
  if (doubleRoundRobin) {
    const returnLegStartDate = new Date(baseDate);
    returnLegStartDate.setDate(
      returnLegStartDate.getDate() + singleLegRounds * Math.max(1, daysBetweenRounds)
    );
    generateLeg(teams, singleLegRounds + 1, returnLegStartDate, true);
  }

  return fixtures;
}

