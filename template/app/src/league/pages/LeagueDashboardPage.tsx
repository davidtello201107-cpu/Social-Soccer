import React, { useState } from "react";
import { useAuth } from "wasp/client/auth";
import {
  createLeague,
  createTeam,
  assignReferee,
  getLeagues,
  getLeagueTeams,
  getReferees,
  useQuery,
} from "wasp/client/operations";
import { Link } from "wasp/client/router";
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Users,
  Loader2,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  UserCheck,
  UserPlus,
  Shirt,
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

export function LeagueDashboardPage() {
  const { data: user } = useAuth();
  const { data: leagues, isLoading: isLoadingLeagues, error: leaguesError, refetch: refetchLeagues } = useQuery(getLeagues);
  const { data: referees, isLoading: isLoadingReferees, refetch: refetchReferees } = useQuery(getReferees);
  const { data: teams, isLoading: isLoadingTeams, refetch: refetchTeams } = useQuery(getLeagueTeams);

  const [isCreatingLeague, setIsCreatingLeague] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingReferee, setIsAddingReferee] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // League Form State
  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Quick Team Form State
  const [teamName, setTeamName] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState("");

  // Quick Referee Form State
  const [refereeName, setRefereeName] = useState("");

  const isAdmin = user?.isAdmin || user?.role === "ADMIN";

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !season.trim()) {
      toast({
        title: "Validation Error",
        description: "League name and season are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createLeague({
        name: name.trim(),
        season: season.trim(),
        location: location.trim() || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });

      toast({
        title: "League Created",
        description: `Successfully created "${name}" for season ${season}.`,
      });

      setName("");
      setSeason("");
      setLocation("");
      setStartDate("");
      setEndDate("");
      setIsCreatingLeague(false);
      refetchLeagues();
    } catch (err: any) {
      toast({
        title: "Failed to Create League",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createTeam({
        name: teamName.trim(),
        leagueId: selectedLeagueId || (leagues && leagues[0]?.id) || undefined,
      });

      toast({
        title: "Team Registered",
        description: `Successfully registered team "${teamName}".`,
      });

      setTeamName("");
      setIsCreatingTeam(false);
      refetchTeams();
      refetchLeagues();
    } catch (err: any) {
      toast({
        title: "Failed to Register Team",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRegisterReferee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refereeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Referee name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await assignReferee({ refereeName: refereeName.trim() });

      toast({
        title: "Referee Added",
        description: `Successfully added ${refereeName} to the referee pool.`,
      });

      setRefereeName("");
      setIsAddingReferee(false);
      refetchReferees();
    } catch (err: any) {
      toast({
        title: "Failed to Register Referee",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLeaguesCount = leagues?.length || 0;
  const totalTeamsCount = teams?.length || leagues?.reduce((acc: number, l: any) => acc + (l.teamCount || 0), 0) || 0;
  const totalRefereesCount = referees?.length || 0;

  return (
    <div className="py-10 lg:mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                League & Competition Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Unified administration hub for neighborhood football leagues, team rosters, and referee pools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <>
                <Button
                  onClick={() => {
                    setIsCreatingLeague(!isCreatingLeague);
                    setIsCreatingTeam(false);
                    setIsAddingReferee(false);
                  }}
                  variant={isCreatingLeague ? "secondary" : "default"}
                  className="gap-2"
                >
                  {isCreatingLeague ? "Cancel League" : <><Plus className="h-4 w-4" /> New League</>}
                </Button>

                <Button
                  onClick={() => {
                    setIsCreatingTeam(!isCreatingTeam);
                    setIsCreatingLeague(false);
                    setIsAddingReferee(false);
                  }}
                  variant={isCreatingTeam ? "secondary" : "outline"}
                  className="gap-2"
                >
                  {isCreatingTeam ? "Cancel Team" : <><Shirt className="h-4 w-4" /> Quick Team</>}
                </Button>

                <Button
                  onClick={() => {
                    setIsAddingReferee(!isAddingReferee);
                    setIsCreatingLeague(false);
                    setIsCreatingTeam(false);
                  }}
                  variant={isAddingReferee ? "secondary" : "outline"}
                  className="gap-2"
                >
                  {isAddingReferee ? "Cancel Referee" : <><UserPlus className="h-4 w-4" /> Quick Referee</>}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Overview Stats Cards - League, Team, & Referee integration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leagues
              </CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLeaguesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active competitions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Registered Teams
              </CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeamsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Link to="/league/teams" className="text-primary hover:underline">
                  Manage Rosters →
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Certified Referees
              </CardTitle>
              <UserCheck className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRefereesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Link to="/league/referees" className="text-primary hover:underline">
                  Manage Pool →
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Administrator Access
              </CardTitle>
              <Shield className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdmin ? "Admin" : "Member"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isAdmin
                  ? "Full league & official control"
                  : "View-only dashboard access"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inline Quick Creation Panels */}
        {isCreatingLeague && (
          <Card className="mb-8 border-primary/30 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Create New Football League</CardTitle>
              </div>
              <CardDescription>
                Configure the primary details for your neighborhood football competition.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLeague} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="leagueName">League Name *</Label>
                    <Input
                      id="leagueName"
                      placeholder="e.g. Metro Neighborhood Premier League"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">Season *</Label>
                    <Input
                      id="season"
                      placeholder="e.g. 2026 Spring / Season 1"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Primary Venue / Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. Central Community Sports Complex"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingLeague(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create League"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isCreatingTeam && (
          <Card className="mb-8 border-emerald-500/30 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shirt className="h-5 w-5 text-emerald-500" />
                <CardTitle>Quick Team Registration</CardTitle>
              </div>
              <CardDescription>
                Register a new team directly into a league.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickCreateTeam} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quickTeamName">Team Name *</Label>
                    <Input
                      id="quickTeamName"
                      placeholder="e.g. Red Star FC"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quickLeagueSelect">Target League</Label>
                    <select
                      id="quickLeagueSelect"
                      value={selectedLeagueId}
                      onChange={(e) => setSelectedLeagueId(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Default (Latest League)</option>
                      {leagues?.map((l: any) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.season})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingTeam(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Register Team"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isAddingReferee && (
          <Card className="mb-8 border-sky-500/30 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-sky-500" />
                <CardTitle>Quick Referee Registration</CardTitle>
              </div>
              <CardDescription>
                Add an official referee to the central pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickRegisterReferee} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quickRefName">Referee Full Name *</Label>
                  <Input
                    id="quickRefName"
                    placeholder="e.g. Michael Oliver"
                    value={refereeName}
                    onChange={(e) => setRefereeName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingReferee(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-700">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Register Referee"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Operations & Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 mb-8 bg-card border rounded-lg gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">League Management Sections:</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/league">
              <Button variant="default" size="sm" className="gap-1">
                <Trophy className="h-3.5 w-3.5" /> Dashboard
              </Button>
            </Link>
            <Link to="/league/teams">
              <Button variant="outline" size="sm" className="gap-1">
                <Users className="h-3.5 w-3.5" /> Teams & Rosters
              </Button>
            </Link>
            <Link to="/league/referees">
              <Button variant="outline" size="sm" className="gap-1">
                <UserCheck className="h-3.5 w-3.5" /> Referee Pool
              </Button>
            </Link>
          </div>
        </div>

        {/* Leagues Directory List */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            Neighborhood Football Leagues
          </h2>

          {isLoadingLeagues ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : leaguesError ? (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="py-6 text-center text-destructive">
                Failed to load leagues: {leaguesError.message}
              </CardContent>
            </Card>
          ) : leagues && leagues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league: any) => {
                const startStr = league.startDate
                  ? new Date(league.startDate).toLocaleDateString()
                  : "N/A";
                const endStr = league.endDate
                  ? new Date(league.endDate).toLocaleDateString()
                  : "N/A";

                return (
                  <Card
                    key={league.id}
                    className="flex flex-col justify-between hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary mb-2">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                        </span>
                      </div>
                      <CardTitle className="text-xl">{league.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-primary">
                        Season: {league.season}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground flex-grow">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>{league.location || "Local Field"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>
                          {startStr} - {endStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {league.teamCount}{" "}
                          {league.teamCount === 1 ? "Team" : "Teams"} Registered
                        </span>
                      </div>
                    </CardContent>

                    <div className="p-6 pt-0 border-t border-border mt-4 flex items-center justify-between gap-2">
                      <Link
                        to="/league/teams"
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium pt-3"
                      >
                        Manage Teams & Rosters <ArrowRight className="h-3 w-3" />
                      </Link>
                      <Link
                        to="/league/referees"
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 pt-3"
                      >
                        Assign Referees
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent className="space-y-3">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No Leagues Created Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {isAdmin
                    ? "Get started by creating your first neighborhood football league above."
                    : "No leagues have been configured by an administrator yet."}
                </p>
                {isAdmin && (
                  <Button
                    onClick={() => setIsCreatingLeague(true)}
                    className="mt-2 gap-2"
                  >
                    <Plus className="h-4 w-4" /> Create First League
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeagueDashboardPage;
