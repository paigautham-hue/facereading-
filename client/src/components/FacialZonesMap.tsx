import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface FacialZone {
  zone: string;
  position: string;
  quality: string;
  interpretation: string;
  confidence: number;
}

interface FacialZonesMapProps {
  facialZones?: FacialZone[];
}

export default function FacialZonesMap({ facialZones }: FacialZonesMapProps) {
  if (!facialZones || facialZones.length === 0) return null;

  const getQualityColor = (quality: string) => {
    const q = quality.toLowerCase();
    if (q.includes("excellent")) return "from-green-500 to-emerald-600";
    if (q.includes("good")) return "from-blue-500 to-cyan-600";
    if (q.includes("average")) return "from-yellow-500 to-amber-600";
    return "from-orange-500 to-red-600";
  };

  const getQualityBadge = (quality: string) => {
    const q = quality.toLowerCase();
    if (q.includes("excellent")) return <Badge className="bg-green-500">Excellent</Badge>;
    if (q.includes("good")) return <Badge className="bg-blue-500">Good</Badge>;
    if (q.includes("average")) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge className="bg-orange-500">Challenging</Badge>;
  };

  const getZoneIcon = (zone: string) => {
    const z = zone.toLowerCase();
    if (z.includes("career")) return "💼";
    if (z.includes("wealth") || z.includes("fortune")) return "💰";
    if (z.includes("relationship") || z.includes("marriage")) return "❤️";
    if (z.includes("health") || z.includes("vitality")) return "🏥";
    if (z.includes("wisdom") || z.includes("intelligence")) return "🧠";
    if (z.includes("family") || z.includes("children")) return "👨‍👩‍👧‍👦";
    if (z.includes("social") || z.includes("friends")) return "👥";
    if (z.includes("travel") || z.includes("migration")) return "✈️";
    if (z.includes("authority") || z.includes("power")) return "👑";
    if (z.includes("creativity") || z.includes("art")) return "🎨";
    if (z.includes("spiritual")) return "🙏";
    if (z.includes("longevity")) return "🕰️";
    return "⭐";
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          Facial Zones Analysis
        </CardTitle>
        <CardDescription>Traditional face reading zones and their quality assessment</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {facialZones.map((zone, idx) => (
            <div
              key={idx}
              className="group p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getZoneIcon(zone.zone)}</span>
                  <div>
                    <div className="font-semibold text-lg">{zone.zone}</div>
                    <div className="text-xs text-muted-foreground">{zone.position}</div>
                  </div>
                </div>
                {getQualityBadge(zone.quality)}
              </div>

              {/* Quality Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Quality Assessment</span>
                  <span>{zone.confidence}% confidence</span>
                </div>
                <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getQualityColor(zone.quality)} rounded-full transition-all duration-1000`}
                    style={{ width: `${zone.confidence}%` }}
                  />
                </div>
              </div>

              {/* Interpretation */}
              <div className="p-3 rounded-md bg-gradient-to-r from-muted/50 to-muted/20 border border-muted">
                <p className="text-sm leading-relaxed">{zone.interpretation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {facialZones.filter((z) => z.quality.toLowerCase().includes("excellent")).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Excellent Zones</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {facialZones.filter((z) => z.quality.toLowerCase().includes("good")).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Good Zones</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {facialZones.filter((z) => z.quality.toLowerCase().includes("average")).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Average Zones</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(facialZones.reduce((sum, z) => sum + z.confidence, 0) / facialZones.length)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Avg Confidence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

