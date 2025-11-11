import { useAuth } from "@/_core/hooks/useAuth";
import StunningInsights from "@/components/StunningInsights";
import ElementBalanceWheel from "@/components/ElementBalanceWheel";
import FacialZonesMap from "@/components/FacialZonesMap";
import MoleInterpretations from "@/components/MoleInterpretations";
import ScientificValidation from "@/components/ScientificValidation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import { Sparkles, ArrowLeft, Download, Star, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ReadingView() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/reading/:id");
  const readingId = params?.id;

  const { data: reading, isLoading } = trpc.faceReading.getReading.useQuery(
    { readingId: readingId! },
    { enabled: !!readingId && isAuthenticated }
  );

  const generatePDFMutation = trpc.faceReading.generatePDF.useMutation({
    onSuccess: (data) => {
      // Open PDF in new tab
      window.open(data.pdfUrl, "_blank");
      toast.success("PDF generated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to generate PDF: " + error.message);
    },
  });

  const regenerateMutation = trpc.faceReading.regenerateAnalysis.useMutation({
    onSuccess: () => {
      toast.success("Analysis regeneration started! Redirecting...");
      window.location.href = `/analysis/${readingId}`;
    },
    onError: (error) => {
      toast.error("Failed to regenerate: " + error.message);
    },
  });

  const handleDownloadPDF = () => {
    if (readingId) {
      generatePDFMutation.mutate({ readingId });
    }
  };

  if (!isAuthenticated || !readingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view this reading</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your reading...</p>
        </div>
      </div>
    );
  }

  if (!reading || !reading.executiveSummary || !reading.detailedAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Reading Not Found</CardTitle>
            <CardDescription>This reading is not available or still processing</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { executiveSummary, detailedAnalysis } = reading;
  
  // Type guard: ensure detailedAnalysis has expected structure
  const hasAgeMapping = detailedAnalysis && typeof detailedAnalysis === 'object' && 'ageMapping' in detailedAnalysis;
  const hasFacialZones = detailedAnalysis && typeof detailedAnalysis === 'object' && 'facialZones' in detailedAnalysis;
  const hasElementBalance = detailedAnalysis && typeof detailedAnalysis === 'object' && 'elementBalance' in detailedAnalysis;
  const hasMoleInterpretations = detailedAnalysis && typeof detailedAnalysis === 'object' && 'moleInterpretations' in detailedAnalysis;
  const hasScientificValidation = detailedAnalysis && typeof detailedAnalysis === 'object' && 'scientificValidation' in detailedAnalysis;

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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => regenerateMutation.mutate({ readingId: readingId! })}
                disabled={regenerateMutation.isPending}
                title="Regenerate with latest AI model"
              >
                {regenerateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadPDF}
                disabled={generatePDFMutation.isPending}
              >
                {generatePDFMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative bg-card/50 backdrop-blur-sm p-6 rounded-full border border-primary/30">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Your Face Reading</h1>
            <p className="text-muted-foreground">
              A comprehensive analysis of your facial features and life path
            </p>
            <p className="text-sm text-muted-foreground/80">
              Created on {new Date(reading.createdAt!).toLocaleDateString()} at {new Date(reading.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Executive Summary */}
          <Card className="border-primary/30 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                What I See First
              </CardTitle>
              <CardDescription>Your most prominent features and immediate insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {(executiveSummary as any).whatISeeFirst?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-foreground/90">{feature}</p>
                  </div>
                ))}
              </div>

              {/* Face Shape */}
              <div className="pt-4 border-t border-border/50">
                <h3 className="font-semibold text-lg mb-2">Face Shape & Element</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Classification</p>
                    <p className="font-medium text-primary">{(executiveSummary as any).faceShape?.classification}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Element</p>
                    <p className="font-medium text-primary">{(executiveSummary as any).faceShape?.element}</p>
                  </div>
                </div>
                <p className="mt-3 text-foreground/80">{(executiveSummary as any).faceShape?.interpretation}</p>
              </div>

              {/* Key Insights */}
              <div className="pt-4 border-t border-border/50">
                <h3 className="font-semibold text-lg mb-3">Key Insights</h3>
                <div className="space-y-3">
                  {(executiveSummary as any).keyInsights?.map((insight: string, index: number) => (
                    <Card key={index} className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <p className="text-foreground/90">{insight}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stunning Insights */}
          {reading.stunningInsights && (reading.stunningInsights as any).insights && (
            <StunningInsights
              insights={(reading.stunningInsights as any).insights}
              overallConfidence={(reading.stunningInsights as any).overallConfidence}
            />
          )}

          {/* Personality Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Personality Snapshot</CardTitle>
              <CardDescription>Your core character traits with confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(executiveSummary as any).personalitySnapshot?.map((trait: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{trait.trait}</span>
                      <span className="text-sm text-primary">{trait.confidence}%</span>
                    </div>
                    <Progress value={trait.confidence} className="h-2" />
                    <p className="text-sm text-muted-foreground">{trait.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Life Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your Life Strengths</CardTitle>
              <CardDescription>Natural talents and abilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {(executiveSummary as any).lifeStrengths?.map((strength: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/90">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Element Balance Wheel - Only show if data exists */}
          {hasElementBalance && (detailedAnalysis as any).elementBalance && (
            <ElementBalanceWheel elementBalance={(detailedAnalysis as any).elementBalance} />
          )}

          {/* Facial Zones Map - Only show if data exists */}
          {hasFacialZones && (detailedAnalysis as any).facialZones && (
            <FacialZonesMap facialZones={(detailedAnalysis as any).facialZones} />
          )}

          {/* Mole Interpretations - Only show if data exists */}
          {hasMoleInterpretations && (detailedAnalysis as any).moleInterpretations && (
            <MoleInterpretations moleInterpretations={(detailedAnalysis as any).moleInterpretations} />
          )}

          {/* Scientific Validation - Only show if data exists */}
          {hasScientificValidation && (detailedAnalysis as any).scientificValidation && (
            <ScientificValidation scientificValidation={(detailedAnalysis as any).scientificValidation} />
          )}

          {/* Detailed Analysis Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Detailed Analysis</CardTitle>
              <CardDescription>Comprehensive breakdown of all life aspects</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="measurements" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="measurements">Measurements</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="life-aspects">Life Aspects</TabsTrigger>
                </TabsList>

                <TabsContent value="measurements" className="space-y-4 mt-6">
                  <FeatureSection
                    title="Facial Measurements"
                    data={(detailedAnalysis as any).facialMeasurements}
                  />
                </TabsContent>

                <TabsContent value="features" className="space-y-4 mt-6">
                  <FeatureSection
                    title="Feature Analysis"
                    data={(detailedAnalysis as any).featureAnalysis}
                  />
                  <FeatureSection
                    title="Special Markers"
                    data={(detailedAnalysis as any).specialMarkers}
                  />
                </TabsContent>

                <TabsContent value="life-aspects" className="space-y-4 mt-6">
                  <LifeAspectsSection aspects={(detailedAnalysis as any).lifeAspects} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Mole Analysis */}
          {(detailedAnalysis as any).moleAnalysis && (detailedAnalysis as any).moleAnalysis.detectedMoles && (detailedAnalysis as any).moleAnalysis.detectedMoles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Detailed Mole Analysis</CardTitle>
                <CardDescription>Lucky and unlucky mole positions with meanings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {(detailedAnalysis as any).moleAnalysis.detectedMoles.map((mole: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      mole.luckyOrUnlucky === 'lucky' ? 'bg-green-50 border-green-500 dark:bg-green-950/20' :
                      mole.luckyOrUnlucky === 'unlucky' ? 'bg-red-50 border-red-500 dark:bg-red-950/20' :
                      'bg-gray-50 border-gray-300 dark:bg-gray-950/20'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg">{mole.location}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          mole.luckyOrUnlucky === 'lucky' ? 'bg-green-500 text-white' :
                          mole.luckyOrUnlucky === 'unlucky' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {mole.luckyOrUnlucky.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{mole.zone}</p>
                      <p className="text-foreground/90 mb-2">{mole.meaning}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Affects:</span>
                        <span className="text-primary">{mole.lifeAspect}</span>
                      </div>
                      {mole.remedy && mole.remedy !== 'None needed' && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                          <span className="font-medium text-sm">Remedy: </span>
                          <span className="text-sm text-muted-foreground">{mole.remedy}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {(detailedAnalysis as any).moleAnalysis.overallMolePattern && (
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold mb-2">Overall Mole Pattern</h4>
                    <p className="text-muted-foreground">{(detailedAnalysis as any).moleAnalysis.overallMolePattern}</p>
                  </div>
                )}
                
                {(detailedAnalysis as any).moleAnalysis.recommendations && (detailedAnalysis as any).moleAnalysis.recommendations.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {(detailedAnalysis as any).moleAnalysis.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <p className="text-foreground/90">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Compatibility Analysis */}
          {(detailedAnalysis as any).compatibilityAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Compatibility Analysis</CardTitle>
                <CardDescription>Romantic, business, and friendship compatibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Romantic Compatibility */}
                {(detailedAnalysis as any).compatibilityAnalysis.romanticCompatibility && (
                  <div>
                    <h4 className="font-semibold text-lg mb-4 text-pink-600 dark:text-pink-400">Romantic Compatibility</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-green-600 dark:text-green-400 mb-3">Best Matches</h5>
                        <div className="space-y-3">
                          {(detailedAnalysis as any).compatibilityAnalysis.romanticCompatibility.bestMatches.map((match: any, index: number) => (
                            <div key={index} className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                              <div className="font-medium mb-1">{match.faceType} ({match.element})</div>
                              <p className="text-sm text-muted-foreground">{match.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-orange-600 dark:text-orange-400 mb-3">Challenging Matches</h5>
                        <div className="space-y-3">
                          {(detailedAnalysis as any).compatibilityAnalysis.romanticCompatibility.challengingMatches.map((match: any, index: number) => (
                            <div key={index} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                              <div className="font-medium mb-1">{match.faceType} ({match.element})</div>
                              <p className="text-sm text-muted-foreground">{match.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Business Compatibility */}
                {(detailedAnalysis as any).compatibilityAnalysis.businessCompatibility && (
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold text-lg mb-4 text-blue-600 dark:text-blue-400">Business Compatibility</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-green-600 dark:text-green-400 mb-3">Best Business Partners</h5>
                        <div className="space-y-3">
                          {(detailedAnalysis as any).compatibilityAnalysis.businessCompatibility.bestPartners.map((partner: any, index: number) => (
                            <div key={index} className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                              <div className="font-medium mb-1">{partner.faceType} ({partner.element})</div>
                              <p className="text-sm text-muted-foreground">{partner.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-orange-600 dark:text-orange-400 mb-3">Difficult Business Partners</h5>
                        <div className="space-y-3">
                          {(detailedAnalysis as any).compatibilityAnalysis.businessCompatibility.difficultPartners.map((partner: any, index: number) => (
                            <div key={index} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                              <div className="font-medium mb-1">{partner.faceType} ({partner.element})</div>
                              <p className="text-sm text-muted-foreground">{partner.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Friendship Dynamics */}
                {(detailedAnalysis as any).compatibilityAnalysis.friendshipDynamics && (
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold text-lg mb-2 text-purple-600 dark:text-purple-400">Friendship Dynamics</h4>
                    <p className="text-muted-foreground">{(detailedAnalysis as any).compatibilityAnalysis.friendshipDynamics}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Decade Timeline */}
          {(detailedAnalysis as any).decadeTimeline && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Decade-by-Decade Life Timeline</CardTitle>
                <CardDescription>Your life journey through the ages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { key: 'ages0to10', title: 'Ages 0-10: Childhood Foundation' },
                    { key: 'ages11to20', title: 'Ages 11-20: Adolescence & Discovery' },
                    { key: 'ages21to30', title: 'Ages 21-30: Young Adulthood' },
                    { key: 'ages31to40', title: 'Ages 31-40: Prime Years' },
                    { key: 'ages41to50', title: 'Ages 41-50: Mid-Life Mastery' },
                    { key: 'ages51to60', title: 'Ages 51-60: Wealth & Wisdom' },
                    { key: 'ages61to70', title: 'Ages 61-70: Legacy Building' },
                    { key: 'ages71to80', title: 'Ages 71-80: Elder Wisdom' },
                    { key: 'ages81plus', title: 'Ages 81+: Longevity & Peace' },
                  ].map((decade, index) => (
                    (detailedAnalysis as any).decadeTimeline[decade.key] && (
                      <div key={index} className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <h5 className="font-medium mb-2 text-blue-600 dark:text-blue-400">{decade.title}</h5>
                        <p className="text-sm text-muted-foreground">{(detailedAnalysis as any).decadeTimeline[decade.key]}</p>
                      </div>
                    )
                  ))}
                </div>
                
                {(detailedAnalysis as any).decadeTimeline.criticalAges && (detailedAnalysis as any).decadeTimeline.criticalAges.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold text-lg mb-3 text-orange-600 dark:text-orange-400">Critical Life Ages</h4>
                    <div className="space-y-3">
                      {(detailedAnalysis as any).decadeTimeline.criticalAges.map((critical: any, index: number) => (
                        <div key={index} className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500">
                          <div className="font-semibold text-orange-600 dark:text-orange-400 mb-1">
                            Age {critical.age}: {critical.significance}
                          </div>
                          <p className="text-sm text-muted-foreground">{critical.prediction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Age Mapping */}
          {hasAgeMapping && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Age Mapping & Timeline</CardTitle>
                <CardDescription>Your life journey through facial analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasAgeMapping && (detailedAnalysis as any).ageMapping && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Current Position</h4>
                        <p className="text-muted-foreground">{(detailedAnalysis as any).ageMapping.currentPosition}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Future Outlook</h4>
                        <p className="text-muted-foreground">{(detailedAnalysis as any).ageMapping.futureOutlook}</p>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <h4 className="font-semibold">Life Periods</h4>
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <h5 className="font-medium mb-1">Early Life (0-30)</h5>
                          <p className="text-sm text-muted-foreground">{(detailedAnalysis as any).ageMapping.lifePeriods?.earlyLife}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <h5 className="font-medium mb-1">Middle Life (30-60)</h5>
                          <p className="text-sm text-muted-foreground">{(detailedAnalysis as any).ageMapping.lifePeriods?.middleLife}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <h5 className="font-medium mb-1">Later Life (60+)</h5>
                          <p className="text-sm text-muted-foreground">{(detailedAnalysis as any).ageMapping.lifePeriods?.laterLife}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function FeatureSection({ title, data }: { title: string; data: any }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{title}</CardTitle>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </p>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function LifeAspectsSection({ aspects }: { aspects: any }) {
  const aspectsList = [
    { key: "personality", label: "Personality Traits", icon: "🧠" },
    { key: "intellectual", label: "Intellectual Capacity", icon: "📚" },
    { key: "career", label: "Career & Success", icon: "💼" },
    { key: "wealth", label: "Wealth & Finance", icon: "💰" },
    { key: "relationships", label: "Love & Relationships", icon: "❤️" },
    { key: "health", label: "Health & Vitality", icon: "🏥" },
    { key: "family", label: "Family & Children", icon: "👨‍👩‍👧‍👦" },
    { key: "social", label: "Social Life", icon: "🤝" },
    { key: "creativity", label: "Creativity & Expression", icon: "🎨" },
    { key: "spirituality", label: "Spirituality & Wisdom", icon: "🔮" },
    { key: "willpower", label: "Willpower & Determination", icon: "💪" },
    { key: "emotionalIntelligence", label: "Emotional Intelligence", icon: "🧘" },
    { key: "authority", label: "Authority & Power", icon: "👑" },
    { key: "lifePurpose", label: "Life Purpose", icon: "🎯" },
    { key: "laterLifeFortune", label: "Later Life Fortune", icon: "🌅" },
  ];

  return (
    <div className="space-y-4">
      {aspectsList.map((aspect) => (
        <Card key={aspect.key} className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{aspect.icon}</span>
              {aspect.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed">{aspects[aspect.key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

