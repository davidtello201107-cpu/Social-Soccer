import { HttpError } from "wasp/server";

export const generateFixtures = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, "Only authenticated users can generate match fixtures");
  }
  return [];
};

export const getFixtures = async (args: any, context: any) => {
  return [];
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
