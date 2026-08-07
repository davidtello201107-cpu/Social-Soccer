import React, { useState, useEffect } from "react";
import {
  getLeagues,
  getLeagueStandings,
  useQuery,
} from "wasp/client/operations";
import { Link } from "wasp/client/router";
import {
  Trophy,
  Calendar,
  ClipboardCheck,
  Shield,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
  Flame,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { Button } from "../../client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../client/components/ui/card";
import { Label } from "../../client/components/ui/label";

export function StandingsPage() {
  const { data: leagues, isLoading: isLoadingLeagues } = useQuery(getLeagues);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");

  // Auto-select first league when loaded
  useEffect(() => {
    if (!selectedLeagueId && leagues && leagues.length > 0) {
      setSelectedLeagueId(leagues[0].id);
    }
  }, [leagues, selectedLeagueId]);

  const {
    data: standings,
    isLoading: isLoadingStandings,
    error: standingsError,
    refetch: refetchStandings,
  } = useQuery(getLeagueStandings, { leagueId: selectedLeagueId || undefined });

  // Calculate overview metrics
  const leagueLeader = standings && standings.length > 0 ? standings[0] : null;

  const topAttack = standings && standings.length > 0
    ? [...standings].sort((a, b) => b.goalsFor - a.goalsFor)[0]
    : null;

  const bestDefense = standings && standings.length > 0
    ? [...standings].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0]
    : null;

  const selectedLeague = leagues?.find((l: any) => l.id === selectedLeagueId);

  return (
    <div className="py-10 lg:mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-amber-500" />
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                League Standings & Table
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Real-time competitive standings, goal metrics, disciplinary records, and tie-breaker calculations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/matches/fixtures">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Match Fixtures
              </Button>
            </Link>
            <Link to="/matches/result">
              <Button variant="default" size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <ClipboardCheck className="h-4 w-4" />
                Submit Results
              </Button>
            </Link>
          </div>
        </div>

        {/* League Selector & Control Bar */}
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="league-select" className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Select Football League
                </Label>
                <select
                  id="league-select"
                  value={selectedLeagueId}
                  onChange={(e) => setSelectedLeagueId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {isLoadingLeagues ? (
                    <option>Loading active leagues...</option>
                  ) : leagues && leagues.length > 0 ? (
                    leagues.map((league: any) => (
                      <option key={league.id} value={league.id}>
                        {league.name} ({league.season}) — {league.teamCount || league.teams?.length || 0} registered teams
                      </option>
                    ))
                  ) : (
                    <option value="">No leagues found</option>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchStandings()}
                  className="h-10 gap-2 text-xs font-semibold"
                  disabled={isLoadingStandings}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStandings ? "animate-spin" : ""}`} />
                  Refresh Standings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standings Highlights KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leader Card */}
          <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                League Leader 🥇
              </CardTitle>
              <Award className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              {leagueLeader ? (
                <div>
                  <div className="text-2xl font-bold text-foreground truncate">
                    {leagueLeader.teamName}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {leagueLeader.points} PTS
                    </span>
                    <span>GD: {leagueLeader.goalDifference > 0 ? `+${leagueLeader.goalDifference}` : leagueLeader.goalDifference}</span>
                    <span>W-D-L: {leagueLeader.won}-{leagueLeader.drawn}-{leagueLeader.lost}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic py-1">No leader data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Top Attack Card */}
          <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Top Offense ⚽
              </CardTitle>
              <Flame className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {topAttack ? (
                <div>
                  <div className="text-2xl font-bold text-foreground truncate">
                    {topAttack.teamName}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                      {topAttack.goalsFor} Goals Scored
                    </span>
                    <span>Avg: {(topAttack.played > 0 ? (topAttack.goalsFor / topAttack.played).toFixed(1) : 0)} / game</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic py-1">No attack data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Best Defense Card */}
          <Card className="bg-gradient-to-br from-sky-500/10 via-card to-card border-sky-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                Best Defense 🛡️
              </CardTitle>
              <ShieldCheck className="h-5 w-5 text-sky-500" />
            </CardHeader>
            <CardContent>
              {bestDefense ? (
                <div>
                  <div className="text-2xl font-bold text-foreground truncate">
                    {bestDefense.teamName}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded bg-sky-500/10">
                      {bestDefense.goalsAgainst} Goals Conceded
                    </span>
                    <span>Played: {bestDefense.played} matches</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic py-1">No defense data yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Standings Table */}
        <Card className="shadow-md overflow-hidden border border-border">
          <CardHeader className="border-b border-border bg-card/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  {selectedLeague?.name || "League"} Table Standings
                </CardTitle>
                <CardDescription>
                  Live positions automatically updated after every completed match report.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingStandings ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : standingsError ? (
              <div className="p-6 text-center text-destructive flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load standings: {standingsError.message}</span>
              </div>
            ) : standings && standings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/70 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4 text-center w-12">#</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-3 text-center">MP</th>
                      <th className="py-3 px-3 text-center">W</th>
                      <th className="py-3 px-3 text-center">D</th>
                      <th className="py-3 px-3 text-center">L</th>
                      <th className="py-3 px-3 text-center hidden sm:table-cell">GF</th>
                      <th className="py-3 px-3 text-center hidden sm:table-cell">GA</th>
                      <th className="py-3 px-3 text-center">GD</th>
                      <th className="py-3 px-3 text-center hidden md:table-cell">Cards</th>
                      <th className="py-3 px-4 text-center font-bold text-foreground">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {standings.map((team: any) => {
                      const isFirst = team.rank === 1;
                      const isTopThree = team.rank <= 3;

                      return (
                        <tr
                          key={team.teamId}
                          className={`transition-colors hover:bg-muted/40 ${
                            isFirst
                              ? "bg-amber-500/10 font-medium"
                              : isTopThree
                              ? "bg-emerald-500/5"
                              : ""
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                                isFirst
                                  ? "bg-amber-500 text-white shadow-sm"
                                  : team.rank === 2
                                  ? "bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                                  : team.rank === 3
                                  ? "bg-amber-700/80 text-white"
                                  : "text-muted-foreground bg-muted"
                              }`}
                            >
                              {team.rank}
                            </span>
                          </td>

                          {/* Team Name & Logo */}
                          <td className="py-3.5 px-4 font-semibold text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {team.teamName.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[180px] sm:max-w-none">
                                {team.teamName}
                              </span>
                              {isFirst && (
                                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-bold">
                                  Leader
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Played */}
                          <td className="py-3.5 px-3 text-center font-medium">{team.played}</td>

                          {/* Won */}
                          <td className="py-3.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                            {team.won}
                          </td>

                          {/* Drawn */}
                          <td className="py-3.5 px-3 text-center text-muted-foreground font-medium">
                            {team.drawn}
                          </td>

                          {/* Lost */}
                          <td className="py-3.5 px-3 text-center text-red-500 font-medium">
                            {team.lost}
                          </td>

                          {/* Goals For */}
                          <td className="py-3.5 px-3 text-center text-muted-foreground hidden sm:table-cell">
                            {team.goalsFor}
                          </td>

                          {/* Goals Against */}
                          <td className="py-3.5 px-3 text-center text-muted-foreground hidden sm:table-cell">
                            {team.goalsAgainst}
                          </td>

                          {/* Goal Difference */}
                          <td className="py-3.5 px-3 text-center font-semibold">
                            <span
                              className={
                                team.goalDifference > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : team.goalDifference < 0
                                  ? "text-red-500"
                                  : "text-muted-foreground"
                              }
                            >
                              {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                            </span>
                          </td>

                          {/* Disciplinary Cards */}
                          <td className="py-3.5 px-3 text-center text-xs hidden md:table-cell">
                            <div className="flex items-center justify-center gap-1.5 font-medium">
                              <span className="px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800">
                                🟨 {team.yellowCards || 0}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                                🟥 {team.redCards || 0}
                              </span>
                            </div>
                          </td>

                          {/* Points */}
                          <td className="py-3.5 px-4 text-center font-extrabold text-base text-foreground bg-muted/20">
                            {team.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <Trophy className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                <h3 className="text-lg font-semibold">No Standings Available</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Register teams and complete match fixtures to generate live standings for this league.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tie-Breaker & Rules Legend Box */}
        <Card className="bg-muted/40 border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <HelpCircle className="h-4 w-4 text-primary" />
              Official League Ranking & Tie-Breaker Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Teams are ranked according to official competitive football rules in descending priority:
            </p>
            <ol className="list-decimal list-inside space-y-1 font-medium text-foreground/80 pl-1">
              <li><strong>Total Points</strong> (3 points for a Win, 1 point for a Draw, 0 for a Loss)</li>
              <li><strong>Goal Difference (GD)</strong> = Goals For (GF) − Goals Against (GA)</li>
              <li><strong>Higher Goals Scored (GF)</strong></li>
              <li><strong>Head-to-Head Record</strong> (Points and Goal Difference between tied teams)</li>
              <li><strong>Fair Play Disciplinary Record</strong> (Fewest Red Cards, then fewest Yellow Cards)</li>
              <li><strong>Alphabetical Team Name Order</strong></li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StandingsPage;

