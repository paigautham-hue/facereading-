import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { Link, useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Download, ArrowLeft, Sparkles, Heart, Calendar, MapPin } from "lucide-react";
import { parseJSONSafe } from "@/lib/utils";

export default function AdvancedReadingView() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/advanced-reading/:id");
  const readingId = params?.id;

  // Redirect non-admin users
  if (!loading && (!isAuthenticated || user?.role !== "admin")) {
    setLocation("/");
    return null;
  }

  const { data: reading, isLoading } = trpc.advancedFaceReading.getReading.useQuery(
    { readingId: readingId || "" },
    { enabled: !!readingId }
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Card className="p-8 bg-red-900/20 border-red-500/30">
          <h2 className="text-xl font-bold text-white mb-2">Advanced Reading Not Found</h2>
          <p className="text-gray-300 mb-4">The requested advanced reading could not be found.</p>
          <Link href="/advanced-readings">
            <Button variant="outline">Back to Advanced Readings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Parse JSON fields
  const executiveSummary = parseJSONSafe(reading.executiveSummary);
  const detailedAnalysis = parseJSONSafe(reading.detailedAnalysis);
  const moleAnalysis = parseJSONSafe(reading.moleAnalysis);
  const compatibilityAnalysis = parseJSONSafe(reading.compatibilityAnalysis);
  const decadeTimeline = parseJSONSafe(reading.decadeTimeline);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/advanced-readings">
              <a className="text-sm text-gray-300 hover:text-purple-500 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Advanced Readings
              </a>
            </Link>
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-purple-500">Advanced Reading</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {reading.pdfPath && (
              <a href={reading.pdfPath} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF Report
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-8">
        {/* Reading Info */}
        <Card className="p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{reading.name || "Unnamed Reading"}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>Created: {new Date(reading.createdAt).toLocaleDateString()}</span>
                {reading.processingTimeSeconds && <span>Processing: {reading.processingTimeSeconds}s</span>}
                {reading.tokensUsed && <span>Tokens: {reading.tokensUsed.toLocaleString()}</span>}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              reading.status === "completed"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
            }`}>
              {reading.status}
            </div>
          </div>
        </Card>

        {/* Executive Summary */}
        {executiveSummary && (
          <Card className="p-6 bg-white/5 border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-gold-500" />
              Executive Summary
            </h2>
            
            {executiveSummary.whatISeeFirst && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">What I See First</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {executiveSummary.whatISeeFirst.map((feature: string, i: number) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {executiveSummary.faceShape && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Face Shape</h3>
                <p className="text-gray-300 mb-1">
                  <strong>Shape:</strong> {executiveSummary.faceShape.classification}
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Element:</strong> {executiveSummary.faceShape.element}
                </p>
                <p className="text-gray-300">{executiveSummary.faceShape.interpretation}</p>
              </div>
            )}

            {executiveSummary.lifeStrengths && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Life Strengths</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {executiveSummary.lifeStrengths.map((strength: string, i: number) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* ADVANCED: Mole Analysis */}
        {moleAnalysis && (
          <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
            <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              ADVANCED: Detailed Mole Analysis
            </h2>

            {moleAnalysis.overview && (
              <p className="text-gray-300 mb-6">{moleAnalysis.overview}</p>
            )}

            {moleAnalysis.significantMoles && Array.isArray(moleAnalysis.significantMoles) && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Significant Moles</h3>
                <div className="grid gap-4">
                  {moleAnalysis.significantMoles.map((mole: any, index: number) => (
                    <Card key={index} className="p-4 bg-white/5 border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">
                            {mole.position} <span className="text-sm text-gray-400">(Zone {mole.zone})</span>
                          </h4>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                            mole.auspiciousness === "very_lucky" || mole.auspiciousness === "lucky"
                              ? "bg-green-500/20 text-green-300"
                              : mole.auspiciousness === "very_unlucky" || mole.auspiciousness === "unlucky"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}>
                            {mole.auspiciousness?.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-2">{mole.interpretation}</p>
                      {mole.lifeAreas && Array.isArray(mole.lifeAreas) && (
                        <p className="text-sm text-gray-400 mb-1">
                          <strong>Affects:</strong> {mole.lifeAreas.join(", ")}
                        </p>
                      )}
                      {mole.timing && (
                        <p className="text-sm text-gray-400">
                          <strong>Peak Influence:</strong> {mole.timing}
                        </p>
                      )}
                      {mole.remedies && Array.isArray(mole.remedies) && mole.remedies.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded">
                          <p className="text-sm font-semibold text-blue-300 mb-1">Remedies:</p>
                          <ul className="text-sm text-gray-300 list-disc list-inside">
                            {mole.remedies.map((remedy: string, i: number) => (
                              <li key={i}>{remedy}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ADVANCED: Compatibility Analysis */}
        {compatibilityAnalysis && (
          <Card className="p-6 bg-gradient-to-br from-pink-900/40 to-orange-900/40 border-pink-500/30">
            <h2 className="text-2xl font-bold text-pink-400 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6" />
              ADVANCED: Compatibility Analysis
            </h2>

            {/* Romantic Compatibility */}
            {compatibilityAnalysis.romanticCompatibility && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">💕 Romantic Compatibility</h3>
                <div className="space-y-2">
                  {compatibilityAnalysis.romanticCompatibility.bestMatches && (
                    <p className="text-gray-300">
                      <strong className="text-green-400">Best Matches:</strong>{" "}
                      {compatibilityAnalysis.romanticCompatibility.bestMatches.join(", ")}
                    </p>
                  )}
                  {compatibilityAnalysis.romanticCompatibility.challengingMatches && (
                    <p className="text-gray-300">
                      <strong className="text-orange-400">Challenging Matches:</strong>{" "}
                      {compatibilityAnalysis.romanticCompatibility.challengingMatches.join(", ")}
                    </p>
                  )}
                  {compatibilityAnalysis.romanticCompatibility.relationshipStyle && (
                    <p className="text-gray-300 mt-3">
                      <strong>Relationship Style:</strong> {compatibilityAnalysis.romanticCompatibility.relationshipStyle}
                    </p>
                  )}
                  {compatibilityAnalysis.romanticCompatibility.longTermPotential && (
                    <p className="text-gray-300">
                      <strong>Long-term Potential:</strong> {compatibilityAnalysis.romanticCompatibility.longTermPotential}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Business Compatibility */}
            {compatibilityAnalysis.businessCompatibility && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">💼 Business Compatibility</h3>
                <div className="space-y-2">
                  {compatibilityAnalysis.businessCompatibility.idealPartners && (
                    <p className="text-gray-300">
                      <strong className="text-green-400">Ideal Partners:</strong>{" "}
                      {compatibilityAnalysis.businessCompatibility.idealPartners.join(", ")}
                    </p>
                  )}
                  {compatibilityAnalysis.businessCompatibility.leadershipStyle && (
                    <p className="text-gray-300 mt-3">
                      <strong>Leadership Style:</strong> {compatibilityAnalysis.businessCompatibility.leadershipStyle}
                    </p>
                  )}
                  {compatibilityAnalysis.businessCompatibility.negotiationApproach && (
                    <p className="text-gray-300">
                      <strong>Negotiation Approach:</strong> {compatibilityAnalysis.businessCompatibility.negotiationApproach}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Friendship Compatibility */}
            {compatibilityAnalysis.friendshipCompatibility && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">🤝 Friendship Compatibility</h3>
                <div className="space-y-2">
                  {compatibilityAnalysis.friendshipCompatibility.bestFriendTypes && (
                    <p className="text-gray-300">
                      <strong className="text-green-400">Best Friend Types:</strong>{" "}
                      {compatibilityAnalysis.friendshipCompatibility.bestFriendTypes.join(", ")}
                    </p>
                  )}
                  {compatibilityAnalysis.friendshipCompatibility.socialCircle && (
                    <p className="text-gray-300 mt-3">
                      <strong>Social Circle:</strong> {compatibilityAnalysis.friendshipCompatibility.socialCircle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ADVANCED: Decade Timeline */}
        {decadeTimeline && (
          <Card className="p-6 bg-gradient-to-br from-orange-900/40 to-yellow-900/40 border-orange-500/30">
            <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              ADVANCED: Decade-by-Decade Timeline
            </h2>

            {decadeTimeline.decades && Array.isArray(decadeTimeline.decades) && (
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-semibold text-white">Life Decades</h3>
                <div className="grid gap-4">
                  {decadeTimeline.decades.map((decade: any, index: number) => (
                    <Card key={index} className="p-4 bg-white/5 border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white text-lg">
                            {decade.ageRange}: {decade.period}
                          </h4>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                            decade.fortuneLevel === "excellent" || decade.fortuneLevel === "good"
                              ? "bg-green-500/20 text-green-300"
                              : decade.fortuneLevel === "difficult" || decade.fortuneLevel === "challenging"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}>
                            {decade.fortuneLevel?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {decade.keyThemes && Array.isArray(decade.keyThemes) && (
                        <div className="mb-2">
                          <p className="text-sm font-semibold text-gray-300 mb-1">Key Themes:</p>
                          <ul className="text-sm text-gray-400 list-disc list-inside">
                            {decade.keyThemes.map((theme: string, i: number) => (
                              <li key={i}>{theme}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {decade.advice && (
                        <p className="text-sm text-gray-300 italic mt-2">
                          <strong>Advice:</strong> {decade.advice}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {decadeTimeline.criticalAges && Array.isArray(decadeTimeline.criticalAges) && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">⚠️ Critical Ages & Turning Points</h3>
                <div className="grid gap-3">
                  {decadeTimeline.criticalAges.map((critical: any, index: number) => (
                    <Card key={index} className="p-3 bg-red-900/20 border-red-500/30">
                      <h4 className="font-semibold text-white">
                        Age {critical.age}: {critical.significance}
                      </h4>
                      {critical.prediction && (
                        <p className="text-sm text-gray-300 mt-1">{critical.prediction}</p>
                      )}
                      {critical.preparation && (
                        <p className="text-sm text-gray-400 italic mt-1">
                          <strong>Preparation:</strong> {critical.preparation}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Download PDF Again */}
        {reading.pdfPath && (
          <div className="text-center py-8">
            <a href={reading.pdfPath} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Download className="w-5 h-5 mr-2" />
                Download Complete 20-25 Page PDF Report
              </Button>
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

