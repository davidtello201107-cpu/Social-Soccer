import React, { useState, useEffect } from "react";
import { useAuth } from "wasp/client/auth";
import {
  getLeagues,
  getFixtures,
  submitMatchResult,
  useQuery,
} from "wasp/client/operations";
import { Link } from "wasp/client/router";
import {
  Trophy,
  ClipboardCheck,
  Shield,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Flag,
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

interface MatchEventItem {
  id: string;
  minute: number;
  type: string;
  description?: string;
}

export function MatchResultPage() {
  const { data: user } = useAuth();
  const { data: leagues, isLoading: isLoadingLeagues } = useQuery(getLeagues);
  
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [homeScore, setHomeScore] = useState<number | "">(0);
  const [awayScore, setAwayScore] = useState<number | "">(0);
  
  // Event logging state
  const [events, setEvents] = useState<MatchEventItem[]>([]);
  const [eventMinute, setEventMinute] = useState<number | "">(15);
  const [eventType, setEventType] = useState<string>("GOAL");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Set default selected league once loaded
  useEffect(() => {
    if (!selectedLeagueId && leagues && leagues.length > 0) {
      setSelectedLeagueId(leagues[0].id);
    }
  }, [leagues, selectedLeagueId]);

  const {
    data: fixtures,
    isLoading: isLoadingFixtures,
    refetch: refetchFixtures,
  } = useQuery(getFixtures, { leagueId: selectedLeagueId || undefined });

  // Update selected match when fixtures change
  useEffect(() => {
    if (fixtures && fixtures.length > 0 && !selectedMatchId) {
      const pendingMatch = fixtures.find((f: any) => f.status === "SCHEDULED" || f.status === "IN_PROGRESS") || fixtures[0];
      if (pendingMatch) {
        setSelectedMatchId(pendingMatch.id);
      }
    }
  }, [fixtures, selectedMatchId]);

  const selectedMatch = fixtures?.find((m: any) => m.id === selectedMatchId);

  const handleAddEvent = () => {
    if (eventMinute === "" || Number(eventMinute) < 0 || Number(eventMinute) > 120) {
      toast({
        title: "Invalid Minute",
        description: "Please enter a valid match minute between 0 and 120.",
        variant: "destructive",
      });
      return;
    }

    const newEvent: MatchEventItem = {
      id: Math.random().toString(36).substring(2, 9),
      minute: Number(eventMinute),
      type: eventType,
      description: eventDescription.trim() || undefined,
    };

    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.minute - b.minute));
    setEventDescription("");
    toast({
      title: "Event Added",
      description: `Added ${eventType} at minute ${eventMinute}'`,
    });
  };

  const handleRemoveEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) {
      toast({
        title: "No Match Selected",
        description: "Please select a match fixture to submit results.",
        variant: "destructive",
      });
      return;
    }

    if (homeScore === "" || awayScore === "") {
      toast({
        title: "Missing Scores",
        description: "Please enter final scores for both teams.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await submitMatchResult({
        matchId: selectedMatchId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        events: events.map((e) => ({
          minute: e.minute,
          type: e.type,
        })),
      });

      toast({
        title: "Match Result Recorded! 🎉",
        description: "Scores logged, events recorded, and league standings updated.",
      });

      setIsSubmitted(true);
      refetchFixtures();
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err?.message || "Failed to log match result. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setHomeScore(0);
    setAwayScore(0);
    setEvents([]);
    setIsSubmitted(false);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Referee Match Report
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Submit official match scores, log disciplinary cards, goals, and automatically sync league standings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/matches/fixtures" className="inline-flex items-center">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Fixtures
            </Button>
          </Link>
          <Link to="/standings" className="inline-flex items-center">
            <Button variant="default" size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Trophy className="h-4 w-4" />
              View Standings
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Selection & Result Entry Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* League & Match Selector Card */}
          <Card className="shadow-sm border-emerald-100 dark:border-emerald-950">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Flag className="h-5 w-5 text-emerald-600" />
                Select Match Fixture
              </CardTitle>
              <CardDescription>Choose an active league and scheduled fixture to report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* League Picker */}
                <div>
                  <Label htmlFor="league-select" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    League Season
                  </Label>
                  <select
                    id="league-select"
                    value={selectedLeagueId}
                    onChange={(e) => {
                      setSelectedLeagueId(e.target.value);
                      setSelectedMatchId("");
                      resetForm();
                    }}
                    className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {isLoadingLeagues ? (
                      <option>Loading leagues...</option>
                    ) : leagues && leagues.length > 0 ? (
                      leagues.map((league: any) => (
                        <option key={league.id} value={league.id}>
                          {league.name} ({league.season})
                        </option>
                      ))
                    ) : (
                      <option value="">No active leagues found</option>
                    )}
                  </select>
                </div>

                {/* Match Picker */}
                <div>
                  <Label htmlFor="match-select" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Match Fixture
                  </Label>
                  <select
                    id="match-select"
                    value={selectedMatchId}
                    onChange={(e) => {
                      setSelectedMatchId(e.target.value);
                      resetForm();
                    }}
                    className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {isLoadingFixtures ? (
                      <option>Loading fixtures...</option>
                    ) : fixtures && fixtures.length > 0 ? (
                      fixtures.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.homeTeam.name} vs {m.awayTeam.name} [{m.status}]
                        </option>
                      ))
                    ) : (
                      <option value="">No fixtures available for this league</option>
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Scoreboard Display & Form */}
          {selectedMatch ? (
            <Card className="shadow-md overflow-hidden border-2 border-emerald-500/20">
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 text-center relative">
                <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2 flex items-center justify-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Status: {selectedMatch.status}
                </div>
                <div className="flex items-center justify-around gap-4 my-4">
                  {/* Home Team */}
                  <div className="flex-1 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 mx-auto flex items-center justify-center font-bold text-lg mb-2">
                      {selectedMatch.homeTeam.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="font-bold text-lg leading-tight line-clamp-1">{selectedMatch.homeTeam.name}</div>
                    <span className="text-xs text-emerald-300/70">Home</span>
                  </div>

                  {/* Score Board */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-4xl font-extrabold text-white min-w-[2.5rem] text-center">
                      {homeScore !== "" ? homeScore : 0}
                    </span>
                    <span className="text-2xl text-emerald-400 font-bold">:</span>
                    <span className="text-4xl font-extrabold text-white min-w-[2.5rem] text-center">
                      {awayScore !== "" ? awayScore : 0}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 mx-auto flex items-center justify-center font-bold text-lg mb-2">
                      {selectedMatch.awayTeam.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="font-bold text-lg leading-tight line-clamp-1">{selectedMatch.awayTeam.name}</div>
                    <span className="text-xs text-emerald-300/70">Away</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSubmitResult} className="space-y-6">
                  {/* Score Inputs */}
                  <div className="grid grid-cols-2 gap-6 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <div>
                      <Label htmlFor="home-score" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {selectedMatch.homeTeam.name} Score
                      </Label>
                      <Input
                        id="home-score"
                        type="number"
                        min="0"
                        value={homeScore}
                        onChange={(e) => setHomeScore(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                        className="mt-1 text-center font-bold text-xl h-12 bg-white dark:bg-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="away-score" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {selectedMatch.awayTeam.name} Score
                      </Label>
                      <Input
                        id="away-score"
                        type="number"
                        min="0"
                        value={awayScore}
                        onChange={(e) => setAwayScore(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                        className="mt-1 text-center font-bold text-xl h-12 bg-white dark:bg-gray-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Submission Status Alert */}
                  {isSubmitted ? (
                    <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="font-bold text-emerald-900 dark:text-emerald-100">
                            Match Result Recorded Successfully
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300">
                            Standings have been updated in real-time.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        className="border-emerald-400 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800"
                      >
                        Edit / Submit Another
                      </Button>
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-11"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting Result...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Confirm & Submit Match Report
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                No fixture selected. Please pick a league and match fixture above.
              </p>
            </Card>
          )}
        </div>

        {/* Match Events Column */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Log Match Events
              </CardTitle>
              <CardDescription>Record goals, yellow cards, red cards, and match highlights.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Creation Form */}
              <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="event-minute" className="text-xs font-semibold">
                      Minute (')
                    </Label>
                    <Input
                      id="event-minute"
                      type="number"
                      min="0"
                      max="120"
                      value={eventMinute}
                      onChange={(e) => setEventMinute(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      placeholder="e.g. 45"
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-type" className="text-xs font-semibold">
                      Event Type
                    </Label>
                    <select
                      id="event-type"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full mt-1 h-9 px-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                    >
                      <option value="GOAL">⚽ Goal</option>
                      <option value="YELLOW_CARD">🟨 Yellow Card</option>
                      <option value="RED_CARD">🟥 Red Card</option>
                      <option value="SUB">🔄 Substitution</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="event-desc" className="text-xs font-semibold">
                    Description / Player (Optional)
                  </Label>
                  <Input
                    id="event-desc"
                    type="text"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="e.g. Penalty Goal / Foul"
                    className="mt-1 h-9 text-sm"
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddEvent}
                  className="w-full mt-2 gap-1 text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Add Event to Timeline
                </Button>
              </div>

              {/* Event Timeline List */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Match Timeline ({events.length})
                </h4>
                {events.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">
                    No events added yet. Use the form above to add match events.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-2.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded">
                            {ev.minute}'
                          </span>
                          <span className="font-semibold">
                            {ev.type === "GOAL" && "⚽ Goal"}
                            {ev.type === "YELLOW_CARD" && "🟨 Yellow Card"}
                            {ev.type === "RED_CARD" && "🟥 Red Card"}
                            {ev.type === "SUB" && "🔄 Substitution"}
                          </span>
                          {ev.description && (
                            <span className="text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                              - {ev.description}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEvent(ev.id)}
                          className="h-6 w-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MatchResultPage;

