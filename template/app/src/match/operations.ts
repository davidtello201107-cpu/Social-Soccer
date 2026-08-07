import { HttpError } from "wasp/server";
import { generateRoundRobinFixtures } from "./scheduleGenerator";
import { calculateStandings } from "./standingsEngine";

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

  if (!args?.matchId) {
    throw new HttpError(400, "Match ID is required");
  }

  const match = await context.entities.Match.findUnique({
    where: { id: args.matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  if (!match) {
    throw new HttpError(404, "Match not found");
  }

  const updatedMatch = await context.entities.Match.update({
    where: { id: args.matchId },
    data: {
      status: "COMPLETED",
    },
  });

  if (args.events && Array.isArray(args.events)) {
    for (const event of args.events) {
      await context.entities.MatchEvent.create({
        data: {
          minute: Number(event.minute) || 0,
          type: String(event.type || "GOAL"),
          match: { connect: { id: args.matchId } },
        },
      });
    }
  }

  // Recalculate standings for the league
  const teams = await context.entities.Team.findMany({
    where: { leagueId: match.leagueId },
  });

  const leagueMatches = await context.entities.Match.findMany({
    where: { leagueId: match.leagueId },
    include: { events: true },
  });

  const matchInputs = leagueMatches.map((m: any) => {
    if (m.id === args.matchId) {
      return {
        id: m.id,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeScore: Number(args.homeScore ?? 0),
        awayScore: Number(args.awayScore ?? 0),
        status: "COMPLETED",
        events: m.events,
      };
    }
    return {
      id: m.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: 0,
      awayScore: 0,
      status: m.status,
      events: m.events,
    };
  });

  const standingsList = calculateStandings(teams, matchInputs);

  for (const item of standingsList) {
    const existingRecord = await context.entities.StandingsRecord.findFirst({
      where: { teamId: item.teamId },
    });

    if (existingRecord) {
      await context.entities.StandingsRecord.update({
        where: { id: existingRecord.id },
        data: {
          points: item.points,
          played: item.played,
          wins: item.won,
          draws: item.drawn,
          losses: item.lost,
          goalsFor: item.goalsFor,
          goalsAgainst: item.goalsAgainst,
        },
      });
    } else {
      await context.entities.StandingsRecord.create({
        data: {
          team: { connect: { id: item.teamId } },
          points: item.points,
          played: item.played,
          wins: item.won,
          draws: item.drawn,
          losses: item.lost,
          goalsFor: item.goalsFor,
          goalsAgainst: item.goalsAgainst,
        },
      });
    }
  }

  return {
    success: true,
    matchStatus: "COMPLETED",
    tokensDistributed: 0,
    match: updatedMatch,
  };
};

export const getLeagueStandings = async (args: any, context: any) => {
  let leagueId = args?.leagueId;

  if (!leagueId) {
    const activeLeague = await context.entities.League.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (activeLeague) {
      leagueId = activeLeague.id;
    } else {
      return [];
    }
  }

  const teams = await context.entities.Team.findMany({
    where: { leagueId },
  });

  if (!teams || teams.length === 0) {
    return [];
  }

  const matches = await context.entities.Match.findMany({
    where: { leagueId },
    include: { events: true },
  });

  return calculateStandings(teams, matches);
};

