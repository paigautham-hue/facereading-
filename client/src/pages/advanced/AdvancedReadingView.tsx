/**
 * Advanced Reading View Page (Admin-Only)
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
import { Loader2, Download, Sparkles, Heart, Calendar } from "lucide-react";

export default function AdvancedReadingView() {
  const { user } = useAuth();
  const [, params] = useRoute("/advanced/:id");
  const readingId = params?.id;

  const { data, isLoading } = trpc.advancedReading.get.useQuery(
    { id: readingId! },
    { enabled: !!readingId && !!user && user.role === "admin" }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || user.role !== "admin" || !data) {
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

  const { reading, analysis } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/advanced">
            <Button variant="ghost" className="mb-4">← Back to Readings</Button>
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
            >
              {reading.status}
            </Badge>
          </div>
        </div>

        {/* Analysis Content */}
        {reading.status === "processing" && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 text-orange-500 animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analysis in Progress</h3>
              <p className="text-slate-400 text-center max-w-md">
                Your advanced reading is being generated. This may take 10-15 minutes.
                Please check back shortly.
              </p>
            </CardContent>
          </Card>
        )}

        {reading.status === "failed" && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-500">Analysis Failed</CardTitle>
              <CardDescription>
                {reading.errorMessage || "An error occurred during analysis"}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {reading.status === "completed" && analysis && (
          <div className="space-y-6">
            {/* Standard Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(analysis.executiveSummary, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Enhanced Section 1: Mole Analysis */}
            <Card className="border-orange-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Detailed Mole & Mark Analysis
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of facial marks across 100+ zones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(analysis.moleAnalysis, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Enhanced Section 2: Compatibility */}
            <Card className="border-orange-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-orange-500" />
                  Compatibility Analysis
                </CardTitle>
                <CardDescription>
                  Romantic, business, and friendship compatibility insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(analysis.compatibilityAnalysis, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Enhanced Section 3: Decade Timeline */}
            <Card className="border-orange-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Decade-by-Decade Life Timeline
                </CardTitle>
                <CardDescription>
                  9 life periods + 7 critical ages mapped out
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(analysis.decadeTimeline, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* PDF Download */}
            {analysis.pdfPath && (
              <div className="flex justify-center">
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => window.open(analysis.pdfPath!, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Full PDF Report
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

