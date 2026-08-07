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
  if (!context.user) {
    throw new HttpError(401, "Only authenticated users can create a team");
  }

  const teamName = args?.name || args?.teamName;
  if (!teamName || typeof teamName !== "string" || !teamName.trim()) {
    throw new HttpError(400, "Team name is required");
  }

  let leagueId = args?.leagueId;
  if (!leagueId) {
    const firstLeague = await context.entities.League.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (firstLeague) {
      leagueId = firstLeague.id;
    } else {
      throw new HttpError(400, "League ID is required or no active league found");
    }
  }

  const team = await context.entities.Team.create({
    data: {
      name: teamName.trim(),
      league: { connect: { id: leagueId } },
      logo: args?.logo ? String(args.logo).trim() : null,
      ...(args?.managerId ? { manager: { connect: { id: args.managerId } } } : {}),
    },
    include: {
      league: true,
      players: true,
    },
  });

  return team;
};

export const getLeagueTeams = async (args: any, context: any) => {
  const whereClause = args?.leagueId ? { leagueId: args.leagueId } : {};

  const teams = await context.entities.Team.findMany({
    where: whereClause,
    include: {
      league: true,
      players: {
        include: {
          user: true,
        },
      },
      manager: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return teams.map((team: any) => ({
    ...team,
    playerCount: team.players ? team.players.length : 0,
  }));
};

export const addPlayerToTeam = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Only authenticated users can add a player to a team");
  }

  let teamId = args?.teamId;
  if (!teamId) {
    const targetTeam = await context.entities.Team.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (targetTeam) {
      teamId = targetTeam.id;
    } else {
      throw new HttpError(400, "Team ID is required or no active team found");
    }
  }

  const position = args?.position ? String(args.position).trim() : "Midfielder";
  const jerseyNumber = args?.jerseyNumber !== undefined && args?.jerseyNumber !== null && args?.jerseyNumber !== ""
    ? parseInt(String(args.jerseyNumber), 10)
    : (args?.number !== undefined && args?.number !== null && args?.number !== "" ? parseInt(String(args.number), 10) : null);

  let userId = args?.userId;
  if (!userId) {
    const playerName = args?.playerName || args?.name || "Player";
    const sanitize = String(playerName).toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const dummyEmail = `player_${sanitize}_${randomSuffix}@example.com`;
    const dummyUsername = `${sanitize}_${randomSuffix}`;

    const newUser = await context.entities.User.create({
      data: {
        username: dummyUsername,
        email: dummyEmail,
        role: "PLAYER",
      },
    });
    userId = newUser.id;
  }

  const existingProfile = await context.entities.PlayerProfile.findUnique({
    where: { userId },
  });

  let playerProfile;
  if (existingProfile) {
    playerProfile = await context.entities.PlayerProfile.update({
      where: { id: existingProfile.id },
      data: {
        team: { connect: { id: teamId } },
        position,
        ...(jerseyNumber !== null && !isNaN(jerseyNumber) ? { number: jerseyNumber } : {}),
      },
      include: {
        user: true,
        team: true,
      },
    });
  } else {
    playerProfile = await context.entities.PlayerProfile.create({
      data: {
        user: { connect: { id: userId } },
        team: { connect: { id: teamId } },
        position,
        number: jerseyNumber !== null && !isNaN(jerseyNumber) ? jerseyNumber : null,
      },
      include: {
        user: true,
        team: true,
      },
    });
  }

  return playerProfile;
};

export const assignReferee = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Only authenticated users can assign or register a referee");
  }

  let refereeId = args?.refereeId;
  let userId = args?.userId;
  const refereeName = args?.refereeName || args?.name;

  let referee;

  if (refereeId) {
    referee = await context.entities.Referee.findUnique({
      where: { id: refereeId },
      include: { user: true, matches: true },
    });
    if (!referee) {
      throw new HttpError(404, "Referee not found with provided refereeId");
    }
  } else if (userId) {
    referee = await context.entities.Referee.findUnique({
      where: { userId },
      include: { user: true, matches: true },
    });
    if (!referee) {
      await context.entities.User.update({
        where: { id: userId },
        data: { role: "REFEREE" },
      });

      referee = await context.entities.Referee.create({
        data: {
          user: { connect: { id: userId } },
        },
        include: { user: true, matches: true },
      });
    }
  } else if (refereeName && typeof refereeName === "string" && refereeName.trim()) {
    const sanitize = refereeName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const dummyEmail = `referee_${sanitize}_${randomSuffix}@example.com`;
    const dummyUsername = refereeName.trim();

    const newUser = await context.entities.User.create({
      data: {
        username: dummyUsername,
        email: dummyEmail,
        role: "REFEREE",
      },
    });

    referee = await context.entities.Referee.create({
      data: {
        user: { connect: { id: newUser.id } },
      },
      include: { user: true, matches: true },
    });
  } else {
    throw new HttpError(400, "Referee ID, User ID, or referee name is required");
  }

  if (args?.matchId) {
    await context.entities.Match.update({
      where: { id: args.matchId },
      data: {
        referee: { connect: { id: referee.id } },
      },
    });
    referee = await context.entities.Referee.findUnique({
      where: { id: referee.id },
      include: { user: true, matches: true },
    });
  }

  return {
    ...referee,
    name: referee?.user?.username || referee?.user?.email || "Referee",
    assigned: true,
  };
};

export const getReferees = async (args: any, context: any) => {
  const referees = await context.entities.Referee.findMany({
    include: {
      user: true,
      matches: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  return referees.map((referee: any) => ({
    ...referee,
    name: referee.user?.username || referee.user?.email || "Referee",
    email: referee.user?.email,
    matchCount: referee.matches ? referee.matches.length : 0,
    status: "Assigned",
  }));
};

