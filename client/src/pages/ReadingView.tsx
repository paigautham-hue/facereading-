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
                {executiveSummary.whatISeeFirst?.map((feature: string, index: number) => (
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
                    <p className="font-medium text-primary">{executiveSummary.faceShape?.classification}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Element</p>
                    <p className="font-medium text-primary">{executiveSummary.faceShape?.element}</p>
                  </div>
                </div>
                <p className="mt-3 text-foreground/80">{executiveSummary.faceShape?.interpretation}</p>
              </div>

              {/* Key Insights */}
              <div className="pt-4 border-t border-border/50">
                <h3 className="font-semibold text-lg mb-3">Key Insights</h3>
                <div className="space-y-3">
                  {executiveSummary.keyInsights?.map((insight: string, index: number) => (
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
          {reading.stunningInsights && (
            <StunningInsights
              insights={reading.stunningInsights.insights}
              overallConfidence={reading.stunningInsights.overallConfidence}
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
                {executiveSummary.personalitySnapshot?.map((trait: any, index: number) => (
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
                {executiveSummary.lifeStrengths?.map((strength: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/90">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Element Balance Wheel */}
          <ElementBalanceWheel elementBalance={detailedAnalysis.facialMeasurements?.elementBalance} />

          {/* Facial Zones Map */}
          <FacialZonesMap facialZones={detailedAnalysis.facialMeasurements?.facialZones} />

          {/* Mole Interpretations */}
          <MoleInterpretations moleInterpretations={detailedAnalysis.specialMarkers?.moleInterpretations} />

          {/* Scientific Validation */}
          <ScientificValidation scientificValidation={detailedAnalysis.scientificValidation} />

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
                    data={detailedAnalysis.facialMeasurements}
                  />
                </TabsContent>

                <TabsContent value="features" className="space-y-4 mt-6">
                  <FeatureSection
                    title="Feature Analysis"
                    data={detailedAnalysis.featureAnalysis}
                  />
                  <FeatureSection
                    title="Special Markers"
                    data={detailedAnalysis.specialMarkers}
                  />
                </TabsContent>

                <TabsContent value="life-aspects" className="space-y-4 mt-6">
                  <LifeAspectsSection aspects={detailedAnalysis.lifeAspects} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Age Mapping */}
          {detailedAnalysis.ageMapping && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Age Mapping & Timeline</CardTitle>
                <CardDescription>Your life journey through facial analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Current Position</h4>
                    <p className="text-muted-foreground">{detailedAnalysis.ageMapping.currentPosition}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Future Outlook</h4>
                    <p className="text-muted-foreground">{detailedAnalysis.ageMapping.futureOutlook}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h4 className="font-semibold">Life Periods</h4>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h5 className="font-medium mb-1">Early Life (0-30)</h5>
                      <p className="text-sm text-muted-foreground">{detailedAnalysis.ageMapping.lifePeriods?.earlyLife}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h5 className="font-medium mb-1">Middle Life (30-60)</h5>
                      <p className="text-sm text-muted-foreground">{detailedAnalysis.ageMapping.lifePeriods?.middleLife}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h5 className="font-medium mb-1">Later Life (60+)</h5>
                      <p className="text-sm text-muted-foreground">{detailedAnalysis.ageMapping.lifePeriods?.laterLife}</p>
                    </div>
                  </div>
                </div>
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

