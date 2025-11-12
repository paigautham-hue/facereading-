/**
 * New Advanced Reading Page (Admin-Only)
 * 
 * Create advanced reading by selecting an existing standard reading
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function NewAdvancedReading() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedReadingId, setSelectedReadingId] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch all completed standard readings
  const { data: standardReadings, isLoading } = trpc.faceReading.getMyReadings.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const createFromStandardMutation = trpc.advancedReading.createFromStandard.useMutation();

  const completedReadings = standardReadings?.filter((r) => r.status === "completed") || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReadingId) {
      toast.error("Please select a reading to enhance");
      return;
    }

    setCreating(true);

    try {
      const result = await createFromStandardMutation.mutateAsync({
        standardReadingId: selectedReadingId,
      });

      toast.success("Advanced reading created! Analysis started.");
      setLocation(`/advanced/${result.advancedReadingId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create advanced reading");
      setCreating(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Advanced readings are only available to administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            New Advanced Reading
          </h1>
          <p className="text-slate-400 mt-2">
            Select an existing reading to enhance with mole analysis, compatibility, and life timeline
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Select Reading to Enhance</CardTitle>
              <CardDescription>
                Choose a completed standard reading to analyze with the advanced system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {completedReadings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">
                    No completed readings found. Create a standard reading first.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setLocation("/new-reading")}
                    variant="outline"
                  >
                    Create Standard Reading
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Available Readings</Label>
                    <div className="mt-3 space-y-3">
                      {completedReadings.map((reading) => (
                        <label
                          key={reading.id}
                          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedReadingId === reading.id
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="reading"
                            value={reading.id}
                            checked={selectedReadingId === reading.id}
                            onChange={(e) => setSelectedReadingId(e.target.value)}
                            className="text-orange-500"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-200">
                              {reading.name}
                            </div>
                            <div className="text-sm text-slate-400">
                              {reading.gender} • Created{" "}
                              {new Date(reading.createdAt).toLocaleDateString()}
                              {reading.dateOfBirth && ` • Born ${reading.dateOfBirth}`}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-500 mb-2">
                      What You'll Get:
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>✓ Detailed Mole & Mark Analysis (100+ facial zones)</li>
                      <li>✓ Compatibility Analysis (romantic, business, friendship)</li>
                      <li>✓ Decade-by-Decade Life Timeline (9 periods + critical ages)</li>
                      <li>✓ Enhanced 20-25 page PDF report</li>
                      <li>✓ All standard analysis features included</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {completedReadings.length > 0 && (
            <div className="mt-8 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/advanced")}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700"
                disabled={creating || !selectedReadingId}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Advanced Reading
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

