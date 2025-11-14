/**
 * Advanced Readings List Page
 * 
 * Shows all advanced readings created by the current user
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdvancedReadingsList() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: readings, isLoading } = trpc.advancedReading.list.useQuery(undefined, {
    enabled: !!user,
  });

  const deleteMutation = trpc.advancedReading.delete.useMutation({
    onSuccess: () => {
      toast.success("Reading deleted successfully");
      utils.advancedReading.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this reading?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
            <CardDescription>
              You must be logged in to view advanced readings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-2">
              <Sparkles className="h-8 w-8" />
              Advanced Readings
            </h1>
            <p className="text-slate-400 mt-2">
              Enhanced analysis with mole reading, compatibility, and decade timeline
            </p>
          </div>
          <Link href="/advanced/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              New Advanced Reading
            </Button>
          </Link>
        </div>

        {/* Readings Grid */}
        {!readings || readings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Sparkles className="h-16 w-16 text-orange-500/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Advanced Readings Yet</h3>
              <p className="text-slate-400 mb-6 text-center max-w-md">
                Create your first advanced reading to unlock detailed mole analysis,
                compatibility insights, and decade-by-decade life timeline.
              </p>
              <Link href="/advanced/new">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Reading
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readings.map((reading) => (
              <div key={reading.id} className="relative">
                <Link href={`/advanced/${reading.id}`}>
                  <Card className="cursor-pointer hover:border-orange-500 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-orange-500">{reading.name}</CardTitle>
                          <CardDescription className="capitalize">
                            {reading.gender}
                            {reading.dateOfBirth && ` • ${reading.dateOfBirth}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              reading.status === "completed"
                                ? "default"
                                : reading.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {reading.status}
                          </Badge>
                          {reading.status === "failed" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={(e) => handleDelete(e, reading.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400">
                        Created {new Date(reading.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

