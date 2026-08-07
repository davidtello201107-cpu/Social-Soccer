import { HttpError } from "wasp/server";
import { generateRoundRobinFixtures } from "./scheduleGenerator";

export const generateFixtures = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Only authenticated users can generate match fixtures");
  }

  let leagueId = args?.leagueId;
  if (!leagueId) {
    const activeLeague = await context.entities.League.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (activeLeague) {
      leagueId = activeLeague.id;
    } else {
      throw new HttpError(400, "League ID is required or no active league found");
    }
  }

  const league = await context.entities.League.findUnique({
    where: { id: leagueId },
    include: { teams: true },
  });

  if (!league) {
    throw new HttpError(404, "League not found");
  }

  if (!league.teams || league.teams.length < 2) {
    throw new HttpError(400, "At least 2 teams are required to generate fixtures");
  }

  const teamIds = league.teams.map((team: any) => team.id);
  const startDate = args?.startDate || league.startDate || new Date();

  const generatedFixtures = generateRoundRobinFixtures({
    teamIds,
    startDate,
  });

  // Delete existing scheduled matches for this league prior to regenerating schedule
  await context.entities.Match.deleteMany({
    where: {
      leagueId,
      status: "SCHEDULED",
    },
  });

  const createdMatches = [];
  for (const fixture of generatedFixtures) {
    const match = await context.entities.Match.create({
      data: {
        league: { connect: { id: leagueId } },
        homeTeam: { connect: { id: fixture.homeTeamId } },
        awayTeam: { connect: { id: fixture.awayTeamId } },
        date: fixture.scheduledAt,
        status: "SCHEDULED",
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
    });
    createdMatches.push(match);
  }

  return {
    success: true,
    createdCount: createdMatches.length,
    matches: createdMatches,
  };
};

export const getFixtures = async (args: any, context: any) => {
  const whereClause = args?.leagueId ? { leagueId: args.leagueId } : {};

  const matches = await context.entities.Match.findMany({
    where: whereClause,
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      referee: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return matches;
};

export const submitMatchResult = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Only authenticated users can submit match results");
  }
  return { success: true };
};

export const getLeagueStandings = async (args: any, context: any) => {
  return [];
};

