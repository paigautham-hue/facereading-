/**
 * Advanced Readings List Page (Admin-Only)
 * 
 * Shows all advanced readings created by the admin
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Loader2, Plus, Sparkles } from "lucide-react";

export default function AdvancedReadingsList() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: readings, isLoading } = trpc.advancedReading.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

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
              <Link key={reading.id} href={`/advanced/${reading.id}`}>
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400">
                      Created {new Date(reading.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

