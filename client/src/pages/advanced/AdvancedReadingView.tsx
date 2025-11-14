/**
 * Advanced Reading View Page
 * 
 * Display advanced reading with 3 enhanced sections:
 * - Mole/Mark Analysis
 * - Compatibility Analysis
 * - Decade Timeline
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { Loader2, Download, Sparkles, Heart, Calendar, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdvancedReadingView() {
  const { user } = useAuth();
  const [, params] = useRoute("/advanced/:id");
  const readingId = params?.id;
  const [elapsedTime, setElapsedTime] = useState(0);

  const { data, isLoading, refetch } = trpc.advancedReading.get.useQuery(
    { id: readingId! },
    { enabled: !!readingId && !!user }
  );

  // Poll every 5 seconds if processing
  useEffect(() => {
    if (data?.reading.status === "processing") {
      const pollInterval = setInterval(() => {
        refetch();
      }, 5000);

      return () => clearInterval(pollInterval);
    }
  }, [data?.reading.status, refetch]);

  // Track elapsed time for processing
  useEffect(() => {
    if (data?.reading.status === "processing") {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setElapsedTime(0);
    }
  }, [data?.reading.status]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
            <CardDescription>
              {!user ? "Please log in to view advanced readings." : "Reading not found or access denied."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { reading, analysis } = data;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimateProgress = (elapsed: number) => {
    // Estimate: 10-15 minutes = 600-900 seconds
    // Show progress from 0% to 95% (never 100% until actually complete)
    const progress = Math.min(95, Math.floor((elapsed / 900) * 100));
    return progress;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/advanced">
            <Button variant="ghost" className="mb-4 text-slate-300 hover:text-white">
              ← Back to Readings
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-2">
                <Sparkles className="h-8 w-8" />
                {reading.name}
              </h1>
              <p className="text-slate-400 mt-2 capitalize">
                {reading.gender}
                {reading.dateOfBirth && ` • Born ${reading.dateOfBirth}`}
              </p>
            </div>
            <Badge
              variant={
                reading.status === "completed"
                  ? "default"
                  : reading.status === "failed"
                  ? "destructive"
                  : "secondary"
              }
              className={
                reading.status === "completed"
                  ? "bg-green-600"
                  : reading.status === "processing"
                  ? "bg-orange-600"
                  : ""
              }
            >
              {reading.status}
            </Badge>
          </div>
        </div>

        {/* Processing Status with Progress */}
        {reading.status === "processing" && (
          <Card className="border-orange-500/50 bg-slate-900/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <Loader2 className="h-20 w-20 text-orange-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-500">
                    {estimateProgress(elapsedTime)}%
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-white">Analysis in Progress</h3>
              <p className="text-slate-400 text-center max-w-md mb-4">
                Your advanced reading is being generated with enhanced mole analysis, 
                compatibility insights, and decade-by-decade timeline.
              </p>
              <div className="flex gap-4 text-sm text-slate-500">
                <span>Elapsed: {formatTime(elapsedTime)}</span>
                <span>•</span>
                <span>Estimated: 10-15 minutes</span>
              </div>
              <div className="w-full max-w-md mt-6">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000"
                    style={{ width: `${estimateProgress(elapsedTime)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Page will auto-refresh when complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Failed Status */}
        {reading.status === "failed" && (
          <Card className="border-red-500 bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Analysis Failed
              </CardTitle>
              <CardDescription className="text-red-300">
                {reading.errorMessage || "An error occurred during analysis"}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Completed Analysis - Formatted Display */}
        {reading.status === "completed" && analysis && (
          <div className="space-y-6">
            {/* Executive Summary */}
            {analysis.executiveSummary && (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Executive Summary</CardTitle>
                  {analysis.executiveSummary.title && (
                    <CardDescription className="text-lg font-semibold text-orange-400">
                      {analysis.executiveSummary.title}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.executiveSummary.firstImpressions && (
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-2">First Impressions</h4>
                      <p className="text-slate-400">{analysis.executiveSummary.firstImpressions}</p>
                    </div>
                  )}
                  {analysis.executiveSummary.dominantTraits && Array.isArray(analysis.executiveSummary.dominantTraits) && (
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-2">Dominant Traits</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        {analysis.executiveSummary.dominantTraits.map((trait: string, i: number) => (
                          <li key={i}>{trait}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.executiveSummary.coreChallenge && (
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-2">Core Challenge</h4>
                      <p className="text-slate-400">{analysis.executiveSummary.coreChallenge}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mole Analysis */}
            {analysis.moleAnalysis && (
              <Card className="border-orange-500/50 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    Detailed Mole & Mark Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Comprehensive analysis of facial marks across 100+ zones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.moleAnalysis.introduction && (
                    <p className="text-slate-400 italic">{analysis.moleAnalysis.introduction}</p>
                  )}
                  {analysis.moleAnalysis.moles && Array.isArray(analysis.moleAnalysis.moles) && (
                    <div className="space-y-4">
                      {analysis.moleAnalysis.moles.map((mole: any, i: number) => (
                        <div key={i} className="border-l-4 border-orange-500 pl-4 py-2 bg-slate-800/30 rounded-r">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={mole.significance === "lucky" ? "default" : "destructive"} className="text-xs">
                              {mole.significance || "neutral"}
                            </Badge>
                            <span className="text-sm font-semibold text-slate-300">
                              Zone {mole.zoneNumber}: {mole.locationDescription}
                            </span>
                          </div>
                          {mole.lifeAspect && (
                            <p className="text-xs text-slate-500 mb-1">Affects: {mole.lifeAspect}</p>
                          )}
                          {mole.interpretation && (
                            <p className="text-sm text-slate-400 mb-2">{mole.interpretation}</p>
                          )}
                          {mole.remedy && (
                            <p className="text-xs text-orange-400">💡 Remedy: {mole.remedy}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Compatibility Analysis */}
            {analysis.compatibilityAnalysis && (
              <Card className="border-purple-500/50 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Heart className="h-5 w-5 text-purple-500" />
                    Compatibility Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Romantic, business, and friendship compatibility insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysis.compatibilityAnalysis.romantic && (
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                        💕 Romantic Relationships
                      </h4>
                      <div className="space-y-2 pl-4">
                        {analysis.compatibilityAnalysis.romantic.bestMatches && (
                          <div>
                            <span className="text-sm font-medium text-slate-300">Best Matches: </span>
                            <span className="text-sm text-slate-400">{analysis.compatibilityAnalysis.romantic.bestMatches}</span>
                          </div>
                        )}
                        {analysis.compatibilityAnalysis.romantic.challenges && (
                          <div>
                            <span className="text-sm font-medium text-slate-300">Challenges: </span>
                            <span className="text-sm text-slate-400">{analysis.compatibilityAnalysis.romantic.challenges}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {analysis.compatibilityAnalysis.business && (
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                        💼 Business Partnerships
                      </h4>
                      <div className="space-y-2 pl-4">
                        {analysis.compatibilityAnalysis.business.idealCollaborators && (
                          <div>
                            <span className="text-sm font-medium text-slate-300">Ideal Collaborators: </span>
                            <span className="text-sm text-slate-400">{analysis.compatibilityAnalysis.business.idealCollaborators}</span>
                          </div>
                        )}
                        {analysis.compatibilityAnalysis.business.warningSigns && (
                          <div>
                            <span className="text-sm font-medium text-slate-300">Warning Signs: </span>
                            <span className="text-sm text-slate-400">{analysis.compatibilityAnalysis.business.warningSigns}</span>
                          </div>
                        )}
                        {analysis.compatibilityAnalysis.business.bestRole && (
                          <div>
                            <span className="text-sm font-medium text-slate-300">Best Role: </span>
                            <span className="text-sm text-slate-400">{analysis.compatibilityAnalysis.business.bestRole}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {analysis.compatibilityAnalysis.friendships && (
                    <div>
                      <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                        🤝 Friendships
                      </h4>
                      <div className="space-y-2 pl-4">
                        {analysis.compatibilityAnalysis.friendships.naturalAllies && (
                          <div>
                            <span className="text-sm font-medium text-slate-300">Natural Allies: </span>
                            <span className="text-sm text-slate-400">{analysis.compatibilityAnalysis.friendships.naturalAllies}</span>
                          </div>
                        )}
                        {analysis.compatibilityAnalysis.friendships.potentialConflicts && (
                          <div>
                            <span className="text-sm font-medium text-slate-300">Potential Conflicts: </span>
                            <span className="text-sm text-slate-400">{analysis.compatibilityAnalysis.friendships.potentialConflicts}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Decade Timeline */}
            {analysis.decadeTimeline && analysis.decadeTimeline.timeline && Array.isArray(analysis.decadeTimeline.timeline) && (
              <Card className="border-blue-500/50 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Decade-by-Decade Life Timeline
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    9 life periods + 7 critical ages mapped out
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.decadeTimeline.timeline.map((period: any, i: number) => (
                    <div key={i} className="border-l-4 border-blue-500 pl-4 py-3 bg-slate-800/30 rounded-r">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          {period.period}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-300">{period.focus}</span>
                      </div>
                      {period.analysis && (
                        <p className="text-sm text-slate-400 mb-2">{period.analysis}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {period.opportunity && (
                          <div className="text-xs">
                            <span className="text-green-400">✓ Opportunity: </span>
                            <span className="text-slate-400">{period.opportunity}</span>
                          </div>
                        )}
                        {period.challenge && (
                          <div className="text-xs">
                            <span className="text-orange-400">⚠ Challenge: </span>
                            <span className="text-slate-400">{period.challenge}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* PDF Download */}
            {analysis.pdfPath && (
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
                  onClick={() => window.open(analysis.pdfPath!, "_blank")}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Full 20-25 Page PDF Report
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

