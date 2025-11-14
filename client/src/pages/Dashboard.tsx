import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Sparkles, Plus, Calendar, Eye, Trash2, Loader2, LogOut, Shield, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteAdvancedId, setDeleteAdvancedId] = useState<string | null>(null);
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  const { data: readings, isLoading, refetch } = trpc.faceReading.getMyReadings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: advancedReadings, isLoading: advancedLoading, refetch: refetchAdvanced } = trpc.advancedReading.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.faceReading.deleteReading.useMutation({
    onSuccess: () => {
      toast.success("Reading deleted successfully");
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete reading: " + error.message);
    },
  });

  const deleteAdvancedMutation = trpc.advancedReading.delete.useMutation({
    onSuccess: () => {
      toast.success("Advanced reading deleted successfully");
      refetchAdvanced();
      setDeleteAdvancedId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete advanced reading: " + error.message);
    },
  });

  const regenerateMutation = trpc.faceReading.regenerateAnalysis.useMutation({
    onSuccess: (data, variables) => {
      toast.success("Analysis regeneration started!");
      setLocation(`/analysis/${variables.readingId}`);
    },
    onError: (error) => {
      toast.error("Failed to regenerate: " + error.message);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your readings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleDelete = (readingId: string) => {
    deleteMutation.mutate({ readingId });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="https://soulapps-cwodhbc5.manus.space" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                ← Soul Apps
              </a>
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="text-xl font-semibold">Face Reading</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/new-reading">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Reading
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">My Readings</h1>
            <p className="text-muted-foreground">
              View and manage your face reading history
            </p>
          </div>

          {/* Readings Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : readings && readings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {readings.map((reading) => (
                <Card
                  key={reading.id}
                  className="group relative overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">
                          {reading.status === "completed" ? "Reading Complete" : "In Progress"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(reading.createdAt!).toLocaleDateString()} at {new Date(reading.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </CardDescription>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reading.status === "completed"
                            ? "bg-primary/20 text-primary"
                            : reading.status === "processing"
                            ? "bg-accent/20 text-accent"
                            : reading.status === "failed"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {reading.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Version {reading.version}</span>
                      <span>•</span>
                      <span>{reading.modelVersion}</span>
                    </div>

                    <div className="flex gap-2">
                      {reading.status === "completed" ? (
                        <>
                          <Link href={`/reading/${reading.id}`} className="flex-1">
                            <Button className="w-full" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View Reading
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => regenerateMutation.mutate({ readingId: reading.id })}
                            disabled={regenerateMutation.isPending}
                            title="Regenerate with latest AI model"
                          >
                            {regenerateMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      ) : reading.status === "failed" ? (
                        <Button 
                          className="flex-1" 
                          size="sm" 
                          variant="outline"
                          onClick={() => regenerateMutation.mutate({ readingId: reading.id })}
                          disabled={regenerateMutation.isPending}
                        >
                          {regenerateMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Retry Analysis
                        </Button>
                      ) : (
                        <Button className="flex-1" size="sm" variant="outline" disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(reading.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-primary/30">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">No Readings Yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Start your journey of self-discovery by creating your first face reading
                  </p>
                </div>
                <Link href="/new-reading">
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Reading
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Advanced Readings Section */}
          <div className="space-y-4 pt-12">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                  My Advanced Readings
                </h2>
                <p className="text-muted-foreground">
                  Enhanced analysis with mole reading, compatibility, and life timeline
                </p>
              </div>
            </div>

            {advancedLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : advancedReadings && advancedReadings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advancedReadings.map((reading) => (
                  <Card
                    key={reading.id}
                    className="group relative overflow-hidden border-purple-500/20 bg-card/50 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">
                            {reading.name || "Unknown"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            {new Date(reading.createdAt!).toLocaleDateString()} at {new Date(reading.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </CardDescription>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reading.status === "completed"
                              ? "bg-purple-500/20 text-purple-500"
                              : reading.status === "processing"
                              ? "bg-accent/20 text-accent"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {reading.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{reading.gender}</span>
                        {reading.dateOfBirth && (
                          <>
                            <span>•</span>
                            <span>{new Date(reading.dateOfBirth).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {reading.status === "completed" ? (
                          <Link href={`/advanced/${reading.id}`} className="flex-1">
                            <Button className="w-full bg-purple-500 hover:bg-purple-600" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View Advanced Reading
                            </Button>
                          </Link>
                        ) : reading.status === "failed" ? (
                          <Button className="flex-1" size="sm" variant="outline" disabled>
                            Analysis Failed
                          </Button>
                        ) : (
                          <Button className="flex-1" size="sm" variant="outline" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteAdvancedId(reading.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-purple-500/30">
                <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="p-4 rounded-full bg-purple-500/10">
                    <Sparkles className="w-12 h-12 text-purple-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">No Advanced Readings Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Unlock deeper insights with mole analysis, compatibility, and decade-by-decade life timeline
                    </p>
                  </div>
                  <Link href="/advanced/new">
                    <Button size="lg" className="bg-purple-500 hover:bg-purple-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Advanced Reading
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reading?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your reading and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Advanced Reading Confirmation Dialog */}
      <AlertDialog open={!!deleteAdvancedId} onOpenChange={(open) => !open && setDeleteAdvancedId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advanced Reading?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your advanced reading and all
              associated analysis data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAdvancedId && deleteAdvancedMutation.mutate({ id: deleteAdvancedId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAdvancedMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

