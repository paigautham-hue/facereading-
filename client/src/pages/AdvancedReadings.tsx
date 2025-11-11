import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Eye, RefreshCw, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdvancedReadings() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-admin users
  if (!loading && (!isAuthenticated || user?.role !== "admin")) {
    setLocation("/");
    return null;
  }

  const { data: readings, isLoading, refetch } = trpc.advancedFaceReading.getMyReadings.useQuery();

  const deleteMutation = trpc.advancedFaceReading.deleteReading.useMutation({
    onSuccess: () => {
      toast.success("Advanced reading deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const regenerateMutation = trpc.advancedFaceReading.regenerateAnalysis.useMutation({
    onSuccess: () => {
      toast.success("Advanced analysis regeneration started! This may take 10-15 minutes.");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to regenerate: ${error.message}`);
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <a className="text-sm text-gray-300 hover:text-orange-500 transition-colors">
                ← Back to Soul Apps
              </a>
            </Link>
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-orange-500">Advanced Face Reading</span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                ADMIN ONLY
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">Welcome, {user?.name}</span>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Standard Readings
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Enhanced Analysis with Claude API</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Advanced Face Reading System
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            20-25 page comprehensive reports with Mole Analysis, Compatibility, and Decade Timeline
          </p>
          <Link href="/advanced-reading/new">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-5 h-5 mr-2" />
              Start New Advanced Reading
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-2">🔮 Detailed Mole Analysis</h3>
            <p className="text-gray-300 text-sm">
              100+ zone system with lucky/unlucky positions, life area impacts, and personalized remedies
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-2">💕 Compatibility Analysis</h3>
            <p className="text-gray-300 text-sm">
              Romantic, business, and friendship compatibility with best/challenging matches
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-pink-900/40 to-orange-900/40 border-pink-500/30">
            <h3 className="text-xl font-bold text-white mb-2">📅 Decade Timeline</h3>
            <p className="text-gray-300 text-sm">
              9 life periods with fortune levels, opportunities, challenges, and 7 critical ages
            </p>
          </Card>
        </div>

        {/* Readings List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Your Advanced Readings</h2>
          
          {!readings || readings.length === 0 ? (
            <Card className="p-12 text-center bg-white/5 border-white/10">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold text-white mb-2">No Advanced Readings Yet</h3>
              <p className="text-gray-400 mb-6">
                Start your first advanced reading to unlock comprehensive insights
              </p>
              <Link href="/advanced-reading/new">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Advanced Reading
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {readings.map((reading) => (
                <Card
                  key={reading.id}
                  className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {reading.name || "Unnamed Reading"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            reading.status === "completed"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : reading.status === "failed"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : reading.status === "processing"
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                              : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                          }`}
                        >
                          {reading.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          Created: {new Date(reading.createdAt).toLocaleDateString()} at{" "}
                          {new Date(reading.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {reading.processingTimeSeconds && (
                          <span>Processing: {reading.processingTimeSeconds}s</span>
                        )}
                        {reading.tokensUsed && <span>Tokens: {reading.tokensUsed.toLocaleString()}</span>}
                      </div>
                      {reading.errorMessage && (
                        <p className="text-sm text-red-400 mt-2">Error: {reading.errorMessage}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {reading.status === "completed" && (
                        <>
                          <Link href={`/advanced-reading/${reading.id}`}>
                            <Button size="sm" variant="outline" className="border-purple-500/50">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/50"
                            onClick={() => regenerateMutation.mutate({ readingId: reading.id })}
                            disabled={regenerateMutation.isPending}
                          >
                            {regenerateMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                        </>
                      )}
                      {reading.status === "failed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-500/50"
                          onClick={() => regenerateMutation.mutate({ readingId: reading.id })}
                          disabled={regenerateMutation.isPending}
                        >
                          {regenerateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Retry
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this advanced reading?")) {
                            deleteMutation.mutate({ readingId: reading.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

