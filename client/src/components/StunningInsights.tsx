import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Flame,
  Smile,
  Baby,
  Users,
  UserPlus,
  AlertTriangle,
  Heart,
  DollarSign,
  AlertCircle,
  Eye,
  HeartCrack,
  Clock,
  ShieldAlert,
  Scale,
  Theater,
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface StunningInsight {
  id: string;
  category: string;
  title: string;
  level: string;
  description: string;
  confidence: number;
  basedOn: string[];
  isSensitive: boolean;
  icon: string;
}

interface StunningInsightsProps {
  insights: StunningInsight[];
  overallConfidence: number;
}

const iconMap: Record<string, React.ReactNode> = {
  flame: <Flame className="w-6 h-6" />,
  lips: <Smile className="w-6 h-6" />,
  baby: <Baby className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  "user-friends": <UserPlus className="w-6 h-6" />,
  "alert-triangle": <AlertTriangle className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
  "dollar-sign": <DollarSign className="w-6 h-6" />,
  "alert-circle": <AlertCircle className="w-6 h-6" />,
  eye: <Eye className="w-6 h-6" />,
  "heart-crack": <HeartCrack className="w-6 h-6" />,
  clock: <Clock className="w-6 h-6" />,
  "shield-alert": <ShieldAlert className="w-6 h-6" />,
  scale: <Scale className="w-6 h-6" />,
  mask: <Theater className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
};

function InsightCard({ insight }: { insight: StunningInsight }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<"accurate" | "inaccurate" | null>(null);

  const icon = iconMap[insight.icon] || iconMap.star;
  
  // Color coding based on sensitivity
  const cardClass = insight.isSensitive
    ? "border-amber-500/30 bg-amber-950/20"
    : "border-primary/30 bg-primary/5";
  
  const iconColor = insight.isSensitive ? "text-amber-500" : "text-primary";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`${cardClass} transition-all hover:border-primary/50`}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-start justify-between cursor-pointer">
              <div className="flex items-start gap-4 flex-1">
                <div className={`${iconColor} mt-1`}>{icon}</div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{insight.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-sm">
                      {insight.level}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  {insight.isSensitive && (
                    <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
                      Sensitive Content
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {insight.description}
              </p>
            </div>

            {/* Based On */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-2">Based on:</p>
              <div className="flex flex-wrap gap-2">
                {insight.basedOn.map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-2">Was this accurate?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={feedback === "accurate" ? "default" : "outline"}
                  onClick={() => setFeedback("accurate")}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant={feedback === "inaccurate" ? "destructive" : "outline"}
                  onClick={() => setFeedback("inaccurate")}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  No
                </Button>
              </div>
              {feedback && (
                <p className="text-xs text-muted-foreground mt-2">
                  Thank you for your feedback! This helps improve our accuracy.
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function StunningInsights({ insights, overallConfidence }: StunningInsightsProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-4">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          What Will Stun You About Your Reading
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          These deeply personal insights reveal surprising truths about you that others wouldn't know just by looking.
          Our AI has analyzed your facial features with {overallConfidence}% overall confidence.
        </p>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-4">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/50 border-muted">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Important:</strong> These insights are based on ancient face reading wisdom combined with modern AI analysis.
            They represent tendencies and possibilities, not absolute certainties. Your choices and actions shape your destiny.
            For medical, legal, or psychological concerns, please consult appropriate professionals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

