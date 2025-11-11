import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScientificValidationProps {
  scientificValidation?: {
    fwhrAnalysis: {
      ratio: number;
      interpretation: string;
      researchBasis: string;
      confidence: number;
    };
    symmetryAnalysis: {
      score: number;
      implications: string;
      researchBasis: string;
    };
    sexualDimorphism: {
      masculinityScore: number;
      femininityScore: number;
      interpretation: string;
    };
  };
}

export default function ScientificValidation({ scientificValidation }: ScientificValidationProps) {
  if (!scientificValidation) return null;

  const { fwhrAnalysis, symmetryAnalysis, sexualDimorphism } = scientificValidation;

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          Scientific Validation
        </CardTitle>
        <CardDescription>Research-based facial analysis using evolutionary psychology and anthropometry</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* fWHR Analysis */}
        <div className="p-5 rounded-lg border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-full bg-blue-500/20 border-2 border-blue-500/30">
              <span className="text-2xl">📏</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Facial Width-to-Height Ratio (fWHR)</h3>
              <div className="text-sm text-muted-foreground">Evolutionary psychology research on dominance and behavior</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fwhrAnalysis.ratio.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Ratio</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-md bg-background/50 border border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-1">INTERPRETATION</div>
              <p className="text-sm">{fwhrAnalysis.interpretation}</p>
            </div>

            <div className="p-3 rounded-md bg-background/50 border border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-1">RESEARCH BASIS</div>
              <p className="text-xs text-muted-foreground">{fwhrAnalysis.researchBasis}</p>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Analysis Confidence</span>
                <span>{fwhrAnalysis.confidence}%</span>
              </div>
              <Progress value={fwhrAnalysis.confidence} className="h-2" />
            </div>
          </div>
        </div>

        {/* Symmetry Analysis */}
        <div className="p-5 rounded-lg border-2 border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-full bg-green-500/20 border-2 border-green-500/30">
              <span className="text-2xl">⚖️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Facial Symmetry</h3>
              <div className="text-sm text-muted-foreground">Developmental stability and genetic quality indicator</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{symmetryAnalysis.score}/100</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Symmetry Visual Bar */}
            <div className="relative h-8 bg-secondary rounded-full overflow-hidden border-2 border-border">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-end px-3 transition-all duration-1000"
                style={{ width: `${symmetryAnalysis.score}%` }}
              >
                <span className="text-xs font-bold text-white">{symmetryAnalysis.score}%</span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-background/50 border border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-1">IMPLICATIONS</div>
              <p className="text-sm">{symmetryAnalysis.implications}</p>
            </div>

            <div className="p-3 rounded-md bg-background/50 border border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-1">RESEARCH BASIS</div>
              <p className="text-xs text-muted-foreground">{symmetryAnalysis.researchBasis}</p>
            </div>
          </div>
        </div>

        {/* Sexual Dimorphism */}
        <div className="p-5 rounded-lg border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/5">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-full bg-purple-500/20 border-2 border-purple-500/30">
              <span className="text-2xl">⚧️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Sexual Dimorphism</h3>
              <div className="text-sm text-muted-foreground">Sex-typical features and hormone indicators</div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Masculinity/Femininity Bars */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>♂️ Masculinity</span>
                <span>{sexualDimorphism.masculinityScore}/100</span>
              </div>
              <div className="relative h-6 bg-secondary rounded-full overflow-hidden border-2 border-border">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-end px-3 transition-all duration-1000"
                  style={{ width: `${sexualDimorphism.masculinityScore}%` }}
                >
                  <span className="text-xs font-bold text-white">{sexualDimorphism.masculinityScore}%</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>♀️ Femininity</span>
                <span>{sexualDimorphism.femininityScore}/100</span>
              </div>
              <div className="relative h-6 bg-secondary rounded-full overflow-hidden border-2 border-border">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-pink-700 flex items-center justify-end px-3 transition-all duration-1000"
                  style={{ width: `${sexualDimorphism.femininityScore}%` }}
                >
                  <span className="text-xs font-bold text-white">{sexualDimorphism.femininityScore}%</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md bg-background/50 border border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-1">INTERPRETATION</div>
              <p className="text-sm">{sexualDimorphism.interpretation}</p>
            </div>
          </div>
        </div>

        {/* Research Note */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">📚</span>
            <div className="text-xs text-muted-foreground">
              <strong>Scientific Foundation:</strong> This analysis is based on peer-reviewed research in evolutionary psychology, facial anthropometry, and behavioral genetics. 
              Studies show correlations between facial features and personality traits, though individual variation is significant. 
              These measurements provide probabilistic insights, not deterministic predictions.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

