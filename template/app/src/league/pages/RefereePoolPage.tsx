import React, { useState } from "react";
import { useAuth } from "wasp/client/auth";
import {
  assignReferee,
  getLeagues,
  getReferees,
  useQuery,
} from "wasp/client/operations";
import { Link } from "wasp/client/router";
import {
  UserCheck,
  UserPlus,
  Plus,
  Loader2,
  Filter,
  Trophy,
  CheckCircle2,
  Sparkles,
  Search,
  Shield,
  Calendar,
  AlertCircle,
  MapPin,
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

export function RefereePoolPage() {
  const { data: user } = useAuth();
  const {
    data: referees,
    isLoading: isLoadingReferees,
    error: refereesError,
    refetch: refetchReferees,
  } = useQuery(getReferees);

  const { data: leagues } = useQuery(getLeagues);

  // Form State
  const [isAddingReferee, setIsAddingReferee] = useState(false);
  const [refereeName, setRefereeName] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [targetRefereeId, setTargetRefereeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRegisterReferee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refereeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a referee name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await assignReferee({ refereeName: refereeName.trim() });
      toast({
        title: "Referee Registered",
        description: `Successfully added ${refereeName} to the referee pool.`,
      });
      setRefereeName("");
      setIsAddingReferee(false);
      refetchReferees();
    } catch (err: any) {
      toast({
        title: "Error Registering Referee",
        description: err?.message || "Failed to register referee.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignToMatch = async (refereeId: string) => {
    if (!selectedMatchId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Match ID to assign.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await assignReferee({ refereeId, matchId: selectedMatchId.trim() });
      toast({
        title: "Match Assigned",
        description: "Referee successfully assigned to match fixture.",
      });
      setSelectedMatchId("");
      setTargetRefereeId(null);
      refetchReferees();
    } catch (err: any) {
      toast({
        title: "Assignment Failed",
        description: err?.message || "Failed to assign referee to match.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReferees = (referees || []).filter((ref: any) => {
    const name = ref.name || ref.user?.username || ref.user?.email || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalReferees = referees?.length || 0;
  const activeAssignments = (referees || []).reduce(
    (acc: number, ref: any) => acc + (ref.matches?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <UserCheck className="w-5 h-5" />
            <span>League Officiating Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Referee Pool & Assignments
          </h1>
          <p className="text-slate-400 mt-1">
            Manage certified referees, track assigned match fixtures, and expand the officiating pool.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddingReferee(!isAddingReferee)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            {isAddingReferee ? (
              "Cancel"
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Register Referee
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Referees in Pool
            </CardTitle>
            <Users className="w-5 h-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalReferees}</div>
            <p className="text-xs text-slate-400 mt-1">Active registered match officials</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Active Match Assignments
            </CardTitle>
            <Calendar className="w-5 h-5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{activeAssignments}</div>
            <p className="text-xs text-slate-400 mt-1">Fixtures currently assigned</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Active Leagues
            </CardTitle>
            <Trophy className="w-5 h-5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{leagues?.length || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Leagues requiring officiators</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Form Panel */}
      {isAddingReferee && (
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Register New Referee
            </CardTitle>
            <CardDescription className="text-slate-400">
              Add a new official to the league pool to assign them to upcoming matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterReferee} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="refereeName" className="text-slate-200">
                  Referee Name / Username
                </Label>
                <Input
                  id="refereeName"
                  placeholder="e.g. Official Marcus Vance"
                  value={refereeName}
                  onChange={(e) => setRefereeName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Register Official
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingReferee(false)}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Referee Pool Table & Filter */}
      <Card className="bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Referee Directory
            </CardTitle>
            <CardDescription className="text-slate-400">
              All registered match officials and their current fixture allocations.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input
              placeholder="Search referee by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100 pl-9 placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingReferees ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
              <p>Loading referee pool...</p>
            </div>
          ) : refereesError ? (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span>Failed to load referees: {refereesError?.message || "Unknown error"}</span>
            </div>
          ) : filteredReferees.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-lg">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-300">No Referees Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "No referee matches your search criteria."
                  : "No referees have been registered yet. Click 'Register Referee' to add your first official."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReferees.map((referee: any) => (
                <Card
                  key={referee.id}
                  className="bg-slate-950 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {referee.name || referee.user?.username || "Referee"}
                        </CardTitle>
                        <p className="text-xs text-slate-400 mt-1">
                          {referee.email || referee.user?.email || "Registered Official"}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {referee.status || "Assigned"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2 border-y border-slate-900 text-slate-300">
                      <span className="text-slate-500">Matches Officiated:</span>
                      <span className="font-bold text-white">{referee.matchCount || referee.matches?.length || 0}</span>
                    </div>

                    {/* Assigned matches breakdown */}
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        Assigned Fixtures
                      </span>
                      {referee.matches && referee.matches.length > 0 ? (
                        <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {referee.matches.map((match: any) => (
                            <li
                              key={match.id}
                              className="text-xs p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 flex justify-between items-center"
                            >
                              <span>
                                {match.homeTeam?.name || "Team A"} vs {match.awayTeam?.name || "Team B"}
                              </span>
                              <span className="text-[10px] text-slate-500">ID: {match.id.substring(0, 6)}...</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No specific matches assigned yet.</p>
                      )}
                    </div>

                    {/* Assign Match Action */}
                    {targetRefereeId === referee.id ? (
                      <div className="space-y-2 pt-2 border-t border-slate-900">
                        <Label htmlFor={`match-${referee.id}`} className="text-xs text-slate-300">
                          Enter Match ID to Assign
                        </Label>
                        <Input
                          id={`match-${referee.id}`}
                          placeholder="e.g. match_123"
                          value={selectedMatchId}
                          onChange={(e) => setSelectedMatchId(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-xs h-8 focus:border-emerald-500"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAssignToMatch(referee.id)}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 w-full"
                          >
                            {isSubmitting && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setTargetRefereeId(null)}
                            className="border-slate-800 text-slate-400 hover:bg-slate-800 text-xs h-7"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTargetRefereeId(referee.id);
                          setSelectedMatchId("");
                        }}
                        className="w-full border-slate-800 hover:border-slate-700 text-slate-300 text-xs h-8 mt-2"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Assign Match Fixture
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RefereePoolPage;

