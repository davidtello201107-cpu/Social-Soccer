import React, { useState, useEffect } from "react";
import { useAuth } from "wasp/client/auth";
import {
  generateFixtures,
  getFixtures,
  getLeagues,
  getReferees,
  assignReferee,
  useQuery,
} from "wasp/client/operations";
import { Link } from "wasp/client/router";
import {
  Calendar,
  Trophy,
  Users,
  UserCheck,
  RefreshCw,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  ShieldAlert,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "../../client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../client/components/ui/card";
import { Input } from "../../client/components/ui/input";
import { Label } from "../../client/components/ui/label";
import { toast } from "../../client/hooks/use-toast";

export function FixtureSchedulePage() {
  const { data: user } = useAuth();
  const { data: leagues, isLoading: isLoadingLeagues } = useQuery(getLeagues);
  const { data: referees, isLoading: isLoadingReferees, refetch: refetchReferees } = useQuery(getReferees);

  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");

  // Set default selected league once leagues load
  useEffect(() => {
    if (!selectedLeagueId && leagues && leagues.length > 0) {
      setSelectedLeagueId(leagues[0].id);
    }
  }, [leagues, selectedLeagueId]);

  const {
    data: fixtures,
    isLoading: isLoadingFixtures,
    error: fixturesError,
    refetch: refetchFixtures,
  } = useQuery(getFixtures, { leagueId: selectedLeagueId || undefined });

  const [startDate, setStartDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [assigningMatchId, setAssigningMatchId] = useState<string | null>(null);

  const isAdmin = user?.isAdmin || user?.role === "ADMIN";

  const handleGenerateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeagueId) {
      toast({
        title: "Validation Error",
        description: "Please select a league to generate fixtures.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await generateFixtures({
        leagueId: selectedLeagueId,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
      });

      toast({
        title: "Fixtures Generated!",
        description: `Successfully created ${result?.createdCount || 0} round-robin matches.`,
      });

      refetchFixtures();
    } catch (err: any) {
      toast({
        title: "Fixture Generation Failed",
        description: err?.message || "Could not generate round-robin schedule.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAssignReferee = async (matchId: string, refereeId: string) => {
    if (!refereeId) return;

    try {
      setAssigningMatchId(matchId);
      await assignReferee({ matchId, refereeId });

      toast({
        title: "Referee Assigned",
        description: "Successfully assigned official referee to match.",
      });

      refetchFixtures();
      refetchReferees();
    } catch (err: any) {
      toast({
        title: "Assignment Failed",
        description: err?.message || "Unable to assign referee to match.",
        variant: "destructive",
      });
    } finally {
      setAssigningMatchId(null);
    }
  };

  const filteredFixtures = (fixtures || []).filter((match: any) => {
    if (statusFilter === "SCHEDULED") return match.status === "SCHEDULED";
    if (statusFilter === "COMPLETED") return match.status === "COMPLETED";
    return true;
  });

  const scheduledCount = (fixtures || []).filter((m: any) => m.status === "SCHEDULED").length;
  const completedCount = (fixtures || []).filter((m: any) => m.status === "COMPLETED").length;

  return (
    <div className="py-10 lg:mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Match Fixture Schedule
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Generate round-robin fixtures, assign certified referees, and track upcoming match schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/standings">
              <Button variant="outline" size="sm" className="gap-1">
                <Trophy className="h-4 w-4 text-amber-500" /> League Standings
              </Button>
            </Link>
            <Link to="/matches/result">
              <Button variant="outline" size="sm" className="gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Submit Results
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats & Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Matches
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fixtures?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Generated fixtures</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scheduled / Upcoming
              </CardTitle>
              <Clock className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending kickoff</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Matches
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Results submitted</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Generator & League Selection Control */}
        <Card className="mb-8 border-primary/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Schedule Generator & Controls</CardTitle>
            </div>
            <CardDescription>
              Select a neighborhood football league to view or re-generate round-robin match fixtures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateSchedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="leagueSelect">Select Football League</Label>
                  <select
                    id="leagueSelect"
                    value={selectedLeagueId}
                    onChange={(e) => setSelectedLeagueId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary"
                  >
                    {isLoadingLeagues ? (
                      <option>Loading leagues...</option>
                    ) : leagues && leagues.length > 0 ? (
                      leagues.map((league: any) => (
                        <option key={league.id} value={league.id}>
                          {league.name} ({league.season}) — {league.teamCount || 0} teams
                        </option>
                      ))
                    ) : (
                      <option value="">No leagues found</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Schedule Kickoff Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={isGenerating || !selectedLeagueId}
                    className="w-full gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Generate Fixtures
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Fixture Schedule Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              League Match Fixtures
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={statusFilter === "ALL" ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter("ALL")}
              >
                All ({fixtures?.length || 0})
              </Button>
              <Button
                variant={statusFilter === "SCHEDULED" ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter("SCHEDULED")}
              >
                Scheduled ({scheduledCount})
              </Button>
              <Button
                variant={statusFilter === "COMPLETED" ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter("COMPLETED")}
              >
                Completed ({completedCount})
              </Button>
            </div>
          </div>

          {/* Fixtures List */}
          {isLoadingFixtures ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : fixturesError ? (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="py-6 text-center text-destructive">
                Failed to load match fixtures: {fixturesError.message}
              </CardContent>
            </Card>
          ) : filteredFixtures.length > 0 ? (
            <div className="space-y-4">
              {filteredFixtures.map((match: any, index: number) => {
                const matchDateStr = match.date
                  ? new Date(match.date).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Date TBD";

                const isCompleted = match.status === "COMPLETED";

                return (
                  <Card
                    key={match.id}
                    className="hover:shadow-md transition-shadow bg-card/80 backdrop-blur"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Match Info & Teams */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                              Match #{index + 1}
                            </span>
                            <span
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                              }`}
                            >
                              {match.status}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {matchDateStr}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4 py-2">
                            <div className="sm:col-span-2 text-left sm:text-right font-semibold text-lg text-foreground">
                              {match.homeTeam?.name || "Home Team"}
                            </div>

                            <div className="text-center font-bold text-sm px-3 py-1 bg-muted rounded-md text-muted-foreground w-max mx-auto sm:w-auto">
                              VS
                            </div>

                            <div className="sm:col-span-2 text-left font-semibold text-lg text-foreground">
                              {match.awayTeam?.name || "Away Team"}
                            </div>
                          </div>
                        </div>

                        {/* Referee Assignment Controls */}
                        <div className="lg:w-72 pt-4 lg:pt-0 lg:border-l lg:border-border lg:pl-6 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <UserCheck className="h-4 w-4 text-sky-500" />
                            Assigned Referee
                          </div>

                          {match.referee ? (
                            <div className="p-2 bg-muted/60 rounded-md text-sm font-medium text-foreground flex items-center justify-between">
                              <span>
                                {match.referee.user?.username ||
                                  match.referee.user?.email ||
                                  "Certified Official"}
                              </span>
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                          ) : (
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              No referee assigned
                            </div>
                          )}

                          {/* Quick Assign Dropdown */}
                          <div className="pt-1">
                            <select
                              value={match.refereeId || ""}
                              onChange={(e) =>
                                handleAssignReferee(match.id, e.target.value)
                              }
                              disabled={assigningMatchId === match.id}
                              className="w-full text-xs h-8 px-2 rounded border border-input bg-background text-foreground"
                            >
                              <option value="">
                                {match.referee ? "Change Referee..." : "Assign Referee..."}
                              </option>
                              {referees?.map((ref: any) => (
                                <option key={ref.id} value={ref.id}>
                                  {ref.name || ref.user?.username || ref.user?.email}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent className="space-y-3">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No Fixtures Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Select a league and click "Generate Fixtures" to create a round-robin match schedule.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default FixtureSchedulePage;

