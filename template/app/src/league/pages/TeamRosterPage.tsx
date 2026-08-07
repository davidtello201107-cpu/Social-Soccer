import React, { useState } from "react";
import { useAuth } from "wasp/client/auth";
import {
  addPlayerToTeam,
  createTeam,
  getLeagues,
  getLeagueTeams,
  useQuery,
} from "wasp/client/operations";
import { Link } from "wasp/client/router";
import {
  Users,
  UserPlus,
  Shield,
  Plus,
  Loader2,
  Filter,
  Shirt,
  Trophy,
  CheckCircle2,
  Sparkles,
  Search,
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

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"] as const;

export function TeamRosterPage() {
  const { data: user } = useAuth();
  const { data: leagues, isLoading: isLoadingLeagues } = useQuery(getLeagues);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("all");

  const queryArgs =
    selectedLeagueId && selectedLeagueId !== "all"
      ? { leagueId: selectedLeagueId }
      : {};
  const {
    data: teams,
    isLoading: isLoadingTeams,
    error: teamsError,
    refetch: refetchTeams,
  } = useQuery(getLeagueTeams, queryArgs);

  // Form toggles
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // Team Form state
  const [teamName, setTeamName] = useState("");
  const [teamLeagueId, setTeamLeagueId] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  // Player Form state
  const [selectedTeamForPlayer, setSelectedTeamForPlayer] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerPosition, setPlayerPosition] = useState<string>("Midfielder");
  const [playerJersey, setPlayerJersey] = useState("");
  const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);

  // Filter state for player search inside teams
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateTeam = async (e: React.FormEvent) => {
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
      setIsSubmittingTeam(true);
      await createTeam({
        name: teamName.trim(),
        leagueId: teamLeagueId || (leagues && leagues[0]?.id) || undefined,
        logo: teamLogo.trim() || undefined,
      });

      toast({
        title: "Team Registered",
        description: `Successfully registered team "${teamName}".`,
      });

      setTeamName("");
      setTeamLogo("");
      setIsCreatingTeam(false);
      refetchTeams();
    } catch (err: any) {
      toast({
        title: "Failed to Register Team",
        description: err?.message || "An error occurred while registering the team.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeamId = selectedTeamForPlayer || (teams && teams[0]?.id);
    if (!targetTeamId) {
      toast({
        title: "Validation Error",
        description: "Please select a team for the player.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingPlayer(true);
      await addPlayerToTeam({
        teamId: targetTeamId,
        playerName: playerName.trim() || undefined,
        position: playerPosition,
        jerseyNumber: playerJersey ? parseInt(playerJersey, 10) : undefined,
      });

      toast({
        title: "Player Added",
        description: `Successfully added ${playerName.trim() || "Player"} to roster.`,
      });

      setPlayerName("");
      setPlayerJersey("");
      setIsAddingPlayer(false);
      refetchTeams();
    } catch (err: any) {
      toast({
        title: "Failed to Add Player",
        description: err?.message || "An error occurred while adding the player.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPlayer(false);
    }
  };

  const openAddPlayerForTeam = (teamId: string) => {
    setSelectedTeamForPlayer(teamId);
    setIsAddingPlayer(true);
  };

  const filteredTeams = (teams || []).filter((team: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTeam = team.name.toLowerCase().includes(q);
    const matchesPlayer = team.players?.some(
      (p: any) =>
        p.user?.username?.toLowerCase().includes(q) ||
        p.user?.email?.toLowerCase().includes(q) ||
        p.position?.toLowerCase().includes(q)
    );
    return matchesTeam || matchesPlayer;
  });

  const totalTeamsCount = teams?.length || 0;
  const totalPlayersCount =
    teams?.reduce((acc: number, t: any) => acc + (t.players?.length || 0), 0) || 0;

  const getPositionBadgeStyle = (position: string) => {
    switch (position?.toLowerCase()) {
      case "goalkeeper":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700/50";
      case "defender":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700/50";
      case "midfielder":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50";
      case "forward":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-700/50";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div className="py-10 lg:mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <Shirt className="h-6 w-6" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground" id="team-roster-heading">
                Teams & Player Rosters
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Register neighborhood teams, manage player rosters, assign field positions, and track jersey numbers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreatingTeam(!isCreatingTeam)}
              variant={isCreatingTeam ? "outline" : "default"}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {isCreatingTeam ? "Cancel Registration" : "Register Team"}
            </Button>
            <Button
              onClick={() => {
                if (teams && teams.length > 0 && !selectedTeamForPlayer) {
                  setSelectedTeamForPlayer(teams[0].id);
                }
                setIsAddingPlayer(!isAddingPlayer);
              }}
              variant={isAddingPlayer ? "outline" : "secondary"}
              className="gap-2"
              disabled={!teams || teams.length === 0}
            >
              <UserPlus className="h-4 w-4" />
              {isAddingPlayer ? "Cancel Player Form" : "Add Player"}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registered Teams</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalTeamsCount}</p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                <Shield className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rostered Players</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalPlayersCount}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/60">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Leagues</p>
                <p className="text-3xl font-bold text-foreground mt-1">{leagues?.length || 0}</p>
              </div>
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-500">
                <Trophy className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Team Collapsible Form */}
        {isCreatingTeam && (
          <Card className="mb-8 border-primary/30 bg-card shadow-lg animate-in fade-in slide-in-from-top-4">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Register New Football Team</CardTitle>
              </div>
              <CardDescription>
                Add a new team to participate in an active neighborhood league.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      placeholder="e.g. Barrio Real FC"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamLeague">League *</Label>
                    <select
                      id="teamLeague"
                      value={teamLeagueId}
                      onChange={(e) => setTeamLeagueId(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {leagues && leagues.length > 0 ? (
                        leagues.map((league: any) => (
                          <option key={league.id} value={league.id}>
                            {league.name} ({league.season})
                          </option>
                        ))
                      ) : (
                        <option value="">No leagues found</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="teamLogo">Team Logo URL (Optional)</Label>
                    <Input
                      id="teamLogo"
                      placeholder="https://example.com/logo.png"
                      value={teamLogo}
                      onChange={(e) => setTeamLogo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreatingTeam(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingTeam} className="gap-2">
                    {isSubmittingTeam ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Register Team
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Player Collapsible Form */}
        {isAddingPlayer && (
          <Card className="mb-8 border-secondary/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-4">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-secondary-foreground" />
                <CardTitle className="text-xl">Add Player to Team Roster</CardTitle>
              </div>
              <CardDescription>
                Assign a player, jersey number, and field position to a team roster.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerTeam">Target Team *</Label>
                    <select
                      id="playerTeam"
                      value={selectedTeamForPlayer}
                      onChange={(e) => setSelectedTeamForPlayer(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      required
                    >
                      {teams && teams.length > 0 ? (
                        teams.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.league?.name || "League"})
                          </option>
                        ))
                      ) : (
                        <option value="">No teams available</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerName">Player Full Name</Label>
                    <Input
                      id="playerName"
                      placeholder="e.g. Carlos Rodriguez"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerPosition">Position *</Label>
                    <select
                      id="playerPosition"
                      value={playerPosition}
                      onChange={(e) => setPlayerPosition(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerJersey">Jersey Number (Optional)</Label>
                    <Input
                      id="playerJersey"
                      type="number"
                      placeholder="e.g. 10"
                      min="1"
                      max="99"
                      value={playerJersey}
                      onChange={(e) => setPlayerJersey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddingPlayer(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingPlayer} className="gap-2">
                    {isSubmittingPlayer ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    Add Player to Roster
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">League:</span>
            <select
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Leagues</option>
              {leagues?.map((league: any) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team or player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {/* Main Teams & Rosters List */}
        {isLoadingTeams || isLoadingLeagues ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading teams and player rosters...</p>
          </div>
        ) : teamsError ? (
          <Card className="border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-sm text-destructive font-medium">
              Error loading teams: {teamsError.message}
            </p>
          </Card>
        ) : filteredTeams.length === 0 ? (
          <Card className="border-dashed border-border p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold text-foreground">No Teams Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {searchQuery
                ? "No teams or players matched your search criteria."
                : "No teams have been registered for this league selection yet."}
            </p>
            <Button
              onClick={() => setIsCreatingTeam(true)}
              className="mt-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              Register First Team
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredTeams.map((team: any) => (
              <Card
                key={team.id}
                className="overflow-hidden border-border/70 bg-card hover:border-border transition-colors shadow-sm"
              >
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            League: <strong className="text-foreground">{team.league?.name || "N/A"}</strong>
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {team.players?.length || 0} registered player(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAddPlayerForTeam(team.id)}
                      className="gap-1.5 self-start sm:self-auto"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Add Player
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {!team.players || team.players.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No players registered on this roster yet. Click "Add Player" to register players.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/20 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4 w-16 text-center">#</th>
                            <th className="py-3 px-4">Player Name</th>
                            <th className="py-3 px-4">Position</th>
                            <th className="py-3 px-4">Account Email / Username</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {team.players.map((player: any) => (
                            <tr
                              key={player.id}
                              className="hover:bg-muted/10 transition-colors"
                            >
                              <td className="py-3 px-4 text-center font-semibold text-muted-foreground">
                                {player.number !== null && player.number !== undefined ? (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary/20 text-secondary-foreground text-xs font-bold">
                                    {player.number}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-3 px-4 font-medium text-foreground">
                                {player.user?.username || player.user?.email || "Rostered Player"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionBadgeStyle(
                                    player.position
                                  )}`}
                                >
                                  {player.position || "Player"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-xs text-muted-foreground">
                                {player.user?.email || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamRosterPage;

