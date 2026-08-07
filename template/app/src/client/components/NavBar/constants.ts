import { routes } from "wasp/client/router";
import { BlogUrl, DocsUrl } from "../../../shared/common";
import type { NavigationItem } from "./NavBar";

const staticNavigationItems: NavigationItem[] = [
  { name: "Documentation", to: DocsUrl },
  { name: "Blog", to: BlogUrl },
];

export const marketingNavigationItems: NavigationItem[] = [
  { name: "Features", to: "/#features" },
  { name: "Pricing", to: routes.PricingPageRoute.to },
  ...staticNavigationItems,
] as const;

export const demoNavigationitems: NavigationItem[] = [
  { name: "AI Scheduler", to: routes.DemoAppRoute.to },
  { name: "File Upload", to: routes.FileUploadRoute.to },
  ...staticNavigationItems,
] as const;

export const adminFootballNavigationItems: NavigationItem[] = [
  { name: "Leagues", to: routes.LeagueDashboardRoute.to },
  { name: "Teams", to: routes.TeamRosterRoute.to },
  { name: "Referees", to: routes.RefereePoolRoute.to },
  { name: "Fixtures", to: routes.FixtureScheduleRoute.to },
  { name: "Match Results", to: routes.MatchResultRoute.to },
  { name: "Standings", to: routes.StandingsRoute.to },
  { name: "Transfers", to: routes.TransferDashboardRoute.to },
  { name: "Token Admin", to: routes.AdminTokenRoute.to },
];

export const managerFootballNavigationItems: NavigationItem[] = [
  { name: "Teams & Rosters", to: routes.TeamRosterRoute.to },
  { name: "Fixtures", to: routes.FixtureScheduleRoute.to },
  { name: "Standings", to: routes.StandingsRoute.to },
  { name: "Transfers", to: routes.TransferDashboardRoute.to },
];

export const refereeFootballNavigationItems: NavigationItem[] = [
  { name: "Fixtures", to: routes.FixtureScheduleRoute.to },
  { name: "Match Results", to: routes.MatchResultRoute.to },
  { name: "Standings", to: routes.StandingsRoute.to },
];

export const playerFootballNavigationItems: NavigationItem[] = [
  { name: "Teams", to: routes.TeamRosterRoute.to },
  { name: "Fixtures", to: routes.FixtureScheduleRoute.to },
  { name: "Standings", to: routes.StandingsRoute.to },
  { name: "Transfers", to: routes.TransferDashboardRoute.to },
  { name: "My Wallet", to: routes.PlayerWalletRoute.to },
];

export const publicFootballNavigationItems: NavigationItem[] = [
  { name: "Standings", to: routes.StandingsRoute.to },
  { name: "Fixtures", to: routes.FixtureScheduleRoute.to },
  { name: "AI Scheduler", to: routes.DemoAppRoute.to },
  { name: "File Upload", to: routes.FileUploadRoute.to },
  ...staticNavigationItems,
];

export interface UserAuthData {
  isAdmin?: boolean;
  role?: string;
}

export function getRoleNavigationItems(user?: UserAuthData | null): NavigationItem[] {
  if (!user) {
    return publicFootballNavigationItems;
  }

  if (user.isAdmin || user.role === "ADMIN") {
    return adminFootballNavigationItems;
  }

  switch (user.role) {
    case "MANAGER":
      return managerFootballNavigationItems;
    case "REFEREE":
      return refereeFootballNavigationItems;
    case "PLAYER":
      return playerFootballNavigationItems;
    default:
      return publicFootballNavigationItems;
  }
}

