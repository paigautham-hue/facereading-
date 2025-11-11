import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MoleInterpretation {
  position: string;
  size: string;
  color: string;
  meaning: string;
  lifeArea: string;
  auspiciousness: 'highly_auspicious' | 'auspicious' | 'neutral' | 'challenging' | 'highly_challenging';
  confidence: number;
}

interface MoleInterpretationsProps {
  moleInterpretations?: MoleInterpretation[];
}

export default function MoleInterpretations({ moleInterpretations }: MoleInterpretationsProps) {
  if (!moleInterpretations || moleInterpretations.length === 0) return null;

  const getAuspiciousnessColor = (level: string) => {
    if (level === "highly_auspicious") return "from-green-500 to-emerald-600";
    if (level === "auspicious") return "from-blue-500 to-cyan-600";
    if (level === "neutral") return "from-gray-500 to-slate-600";
    if (level === "challenging") return "from-orange-500 to-amber-600";
    return "from-red-500 to-rose-600";
  };

  const getAuspiciousnessBadge = (level: string) => {
    if (level === "highly_auspicious") return <Badge className="bg-green-500">✨ Highly Auspicious</Badge>;
    if (level === "auspicious") return <Badge className="bg-blue-500">🌟 Auspicious</Badge>;
    if (level === "neutral") return <Badge className="bg-gray-500">⚪ Neutral</Badge>;
    if (level === "challenging") return <Badge className="bg-orange-500">⚠️ Challenging</Badge>;
    return <Badge className="bg-red-500">🔴 Highly Challenging</Badge>;
  };

  const getLifeAreaIcon = (area: string) => {
    const a = area.toLowerCase();
    if (a.includes("wealth") || a.includes("money")) return "💰";
    if (a.includes("career") || a.includes("work")) return "💼";
    if (a.includes("relationship") || a.includes("love") || a.includes("marriage")) return "❤️";
    if (a.includes("health")) return "🏥";
    if (a.includes("family") || a.includes("children")) return "👨‍👩‍👧‍👦";
    if (a.includes("travel")) return "✈️";
    if (a.includes("wisdom") || a.includes("intelligence")) return "🧠";
    if (a.includes("creativity")) return "🎨";
    if (a.includes("spiritual")) return "🙏";
    if (a.includes("social")) return "👥";
    return "⭐";
  };

  const getMoleColorDot = (color: string) => {
    const c = color.toLowerCase();
    if (c.includes("light brown") || c.includes("tan")) return "bg-amber-300";
    if (c.includes("dark brown")) return "bg-amber-800";
    if (c.includes("black")) return "bg-black";
    if (c.includes("red")) return "bg-red-500";
    if (c.includes("honey")) return "bg-yellow-400";
    return "bg-gray-600";
  };

  const getMoleSize = (size: string) => {
    const s = size.toLowerCase();
    if (s.includes("large")) return "w-6 h-6";
    if (s.includes("medium")) return "w-4 h-4";
    return "w-3 h-3";
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          Mole Interpretations
        </CardTitle>
        <CardDescription>Detailed analysis of {moleInterpretations.length} significant mole{moleInterpretations.length > 1 ? 's' : ''} based on traditional moleosophy</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {moleInterpretations.map((mole, idx) => (
            <div
              key={idx}
              className="group p-5 rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-background to-muted/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`${getMoleSize(mole.size)} ${getMoleColorDot(mole.color)} rounded-full border-2 border-white shadow-md`} />
                    <div className="absolute -top-1 -right-1 text-lg">{getLifeAreaIcon(mole.lifeArea)}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{mole.position}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="capitalize">{mole.size}</span>
                      <span>•</span>
                      <span className="capitalize">{mole.color}</span>
                    </div>
                  </div>
                </div>
                {getAuspiciousnessBadge(mole.auspiciousness)}
              </div>

              {/* Life Area */}
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-sm">{getLifeAreaIcon(mole.lifeArea)}</span>
                <span className="text-sm font-medium">{mole.lifeArea}</span>
              </div>

              {/* Meaning */}
              <div className="p-4 rounded-md bg-gradient-to-r from-muted/50 to-muted/20 border border-muted mb-3">
                <p className="text-sm leading-relaxed">{mole.meaning}</p>
              </div>

              {/* Confidence Bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Interpretation Confidence</span>
                  <span>{mole.confidence}%</span>
                </div>
                <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getAuspiciousnessColor(mole.auspiciousness)} rounded-full transition-all duration-1000`}
                    style={{ width: `${mole.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {moleInterpretations.filter((m) => m.auspiciousness.includes("auspicious") && !m.auspiciousness.includes("challenging")).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Auspicious Moles</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-gray-500/10 to-slate-500/5 border border-gray-500/20 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {moleInterpretations.filter((m) => m.auspiciousness === "neutral").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Neutral Moles</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {moleInterpretations.filter((m) => m.auspiciousness.includes("challenging")).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Challenging Moles</div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div className="text-xs text-muted-foreground">
              <strong>Note:</strong> Mole interpretations are based on traditional moleosophy from Chinese, Indian, and Western face reading systems. 
              The analysis considers the precise location (from 86 facial positions), size, color, and associated life areas. 
              "Challenging" moles often indicate areas requiring attention or growth opportunities.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

