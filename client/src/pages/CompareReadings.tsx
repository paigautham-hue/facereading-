import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CompareReadings() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/compare/:standardId/:advancedId");
  
  const standardId = params?.standardId || "";
  const advancedId = params?.advancedId || "";

  const { data: standardReading, isLoading: standardLoading } = trpc.faceReading.getReading.useQuery(
    { readingId: standardId },
    { enabled: isAuthenticated && !!standardId }
  );

  const { data: advancedReading, isLoading: advancedLoading } = trpc.advancedReading.get.useQuery(
    { id: advancedId },
    { enabled: isAuthenticated && !!advancedId }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to compare readings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (standardLoading || advancedLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!standardReading || !advancedReading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Readings Not Found</CardTitle>
            <CardDescription>One or both readings could not be loaded</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const standardAnalysis = standardReading.analysis ? JSON.parse(standardReading.analysis) : null;
  const advancedAnalysis = advancedReading.analysis;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Compare Readings</h1>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Reading Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Standard Reading</CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Basic
                </Badge>
              </div>
              <CardDescription>
                Created: {new Date(standardReading.createdAt!).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {standardReading.pdfPath && (
                <a href={standardReading.pdfPath} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          <Card className="border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Advanced Reading</CardTitle>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                  Enhanced
                </Badge>
              </div>
              <CardDescription>
                Created: {new Date(advancedReading.createdAt!).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {advancedAnalysis?.pdfPath && (
                <a href={advancedAnalysis.pdfPath} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full bg-purple-500/10 border-purple-500/30">
                    <Download className="mr-2 h-4 w-4" />
                    Download Enhanced PDF
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="space-y-8">
          {/* Executive Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Standard Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {standardAnalysis?.executiveSummary ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">First Impression</p>
                        <p className="text-sm">{standardAnalysis.executiveSummary.whatISeeFirst}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Overall Impression</p>
                        <p className="text-sm">{standardAnalysis.executiveSummary.overallImpression}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No analysis available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Advanced Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {advancedAnalysis?.executiveSummary ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Title</p>
                        <p className="text-sm font-semibold">{advancedAnalysis.executiveSummary.title}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">First Impressions</p>
                        <p className="text-sm">{advancedAnalysis.executiveSummary.firstImpressions}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dominant Traits</p>
                        <p className="text-sm">{advancedAnalysis.executiveSummary.dominantTraits}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No analysis available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Key Differences */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>✨ What's New in Advanced Reading</CardTitle>
              <CardDescription>
                Enhanced features available only in the advanced analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <p className="font-medium">Mole Analysis</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    100+ facial zones analyzed for lucky/unlucky positions with remedies
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <p className="font-medium">Compatibility Analysis</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Romantic, business, and friendship compatibility insights
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <p className="font-medium">Decade Timeline</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Life predictions mapped across 9 decades with critical ages
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

