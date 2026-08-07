import { HttpError } from "wasp/server";

export const createLeague = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Only authenticated users can create a league");
  }

  if (!context.user.isAdmin && context.user.role !== "ADMIN") {
    throw new HttpError(403, "Only administrators are allowed to create leagues");
  }

  const { name, season, location, startDate, endDate } = args || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new HttpError(400, "League name is required");
  }

  if (!season || typeof season !== "string" || !season.trim()) {
    throw new HttpError(400, "League season is required");
  }

  const parsedStartDate = startDate ? new Date(startDate) : new Date();
  const parsedEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const league = await context.entities.League.create({
    data: {
      name: name.trim(),
      season: season.trim(),
      location: location ? String(location).trim() : "Local Field",
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    },
  });

  return league;
};

export const getLeagues = async (args: any, context: any) => {
  const leagues = await context.entities.League.findMany({
    include: {
      teams: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return leagues.map((league: any) => ({
    ...league,
    teamCount: league.teams ? league.teams.length : 0,
  }));
};

export const createTeam = async (args: any, context: any) => {
  throw new Error("Not implemented");
};

export const getLeagueTeams = async (args: any, context: any) => {
  throw new Error("Not implemented");
};

export const addPlayerToTeam = async (args: any, context: any) => {
  throw new Error("Not implemented");
};

export const assignReferee = async (args: any, context: any) => {
  throw new Error("Not implemented");
};
