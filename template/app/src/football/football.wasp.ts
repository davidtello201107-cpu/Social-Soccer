import { action, page, query, route, type Spec } from "@wasp.sh/spec";

import { LeagueDashboardPage } from "../league/pages/LeagueDashboardPage" with { type: "ref" };
import { TeamRosterPage } from "../league/pages/TeamRosterPage" with { type: "ref" };
import { RefereePoolPage } from "../league/pages/RefereePoolPage" with { type: "ref" };
import {
  addPlayerToTeam,
  assignReferee,
  createLeague,
  createTeam,
  getLeagues,
  getLeagueTeams,
} from "../league/operations" with { type: "ref" };
import { FixtureSchedulePage } from "../match/pages/FixtureSchedulePage" with { type: "ref" };
import { MatchResultPage } from "../match/pages/MatchResultPage" with { type: "ref" };
import { StandingsPage } from "../match/pages/StandingsPage" with { type: "ref" };
import { TransferDashboardPage } from "../transfer/pages/TransferDashboardPage" with { type: "ref" };
import { PlayerWalletPage } from "../token/pages/PlayerWalletPage" with { type: "ref" };
import { AdminTokenPage } from "../token/pages/AdminTokenPage" with { type: "ref" };

export const footballSpec: Spec = [
  route(
    "LeagueDashboardRoute",
    "/league",
    page(LeagueDashboardPage, { authRequired: true }),
  ),
  route(
    "TeamRosterRoute",
    "/league/teams",
    page(TeamRosterPage, { authRequired: true }),
  ),
  route(
    "RefereePoolRoute",
    "/league/referees",
    page(RefereePoolPage, { authRequired: true }),
  ),
  route(
    "FixtureScheduleRoute",
    "/matches/fixtures",
    page(FixtureSchedulePage, { authRequired: true }),
  ),
  route(
    "MatchResultRoute",
    "/matches/result",
    page(MatchResultPage, { authRequired: true }),
  ),
  route(
    "StandingsRoute",
    "/standings",
    page(StandingsPage),
  ),
  route(
    "TransferDashboardRoute",
    "/transfers",
    page(TransferDashboardPage, { authRequired: true }),
  ),
  route(
    "PlayerWalletRoute",
    "/wallet",
    page(PlayerWalletPage, { authRequired: true }),
  ),
  route(
    "AdminTokenRoute",
    "/admin/tokens",
    page(AdminTokenPage, { authRequired: true }),
  ),

  query(getLeagues, { entities: ["League", "Team"] }),
  action(createLeague, { entities: ["League"] }),
  query(getLeagueTeams, { entities: ["Team", "League", "PlayerProfile"] }),
  action(createTeam, { entities: ["Team", "League", "User"] }),
  action(addPlayerToTeam, { entities: ["PlayerProfile", "Team", "User"] }),
  action(assignReferee, { entities: ["Referee", "User", "Match"] }),
];

