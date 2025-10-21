import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Brain, FileText, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface AnalysisProgressProps {
  readingId: string;
}

const PROGRESS_STEPS = [
  { label: "Initializing analysis...", progress: 10, icon: Sparkles },
  { label: "Analyzing facial features...", progress: 30, icon: Brain },
  { label: "Generating personality insights...", progress: 50, icon: Brain },
  { label: "Creating stunning predictions...", progress: 70, icon: Sparkles },
  { label: "Generating PDF report...", progress: 90, icon: FileText },
  { label: "Analysis complete!", progress: 100, icon: CheckCircle2 },
];

export default function AnalysisProgress({ readingId }: AnalysisProgressProps) {
  const [, setLocation] = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Poll reading status
  const { data: reading } = trpc.faceReading.getReading.useQuery(
    { readingId },
    {
      refetchInterval: 2000, // Poll every 2 seconds
      enabled: !isComplete,
    }
  );

  useEffect(() => {
    if (reading) {
      if (reading.status === "completed") {
        setCurrentStepIndex(PROGRESS_STEPS.length - 1);
        setIsComplete(true);
        // Redirect to reading view after 2 seconds
        setTimeout(() => {
          setLocation(`/reading/${readingId}`);
        }, 2000);
      } else if (reading.status === "processing") {
        // Simulate progress through steps
        const interval = setInterval(() => {
          setCurrentStepIndex((prev) => {
            if (prev < PROGRESS_STEPS.length - 2) {
              return prev + 1;
            }
            return prev;
          });
        }, 3000);
        return () => clearInterval(interval);
      } else if (reading.status === "failed") {
        setIsComplete(true);
      }
    }
  }, [reading, readingId, setLocation]);

  const currentStep = PROGRESS_STEPS[currentStepIndex];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {isComplete && reading?.status === "completed" ? (
              <CheckCircle2 className="w-8 h-8 text-primary" />
            ) : (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {reading?.status === "failed" 
              ? "Analysis Failed" 
              : reading?.status === "completed"
              ? "Analysis Complete!"
              : "Analyzing Your Face..."}
          </CardTitle>
          <CardDescription>
            {reading?.status === "failed"
              ? reading.errorMessage || "An error occurred during analysis"
              : reading?.status === "completed"
              ? "Redirecting to your reading..."
              : "This may take a few moments. Please don't close this page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {reading?.status !== "failed" && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={currentStep.progress} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{currentStep.progress}% Complete</span>
                  <span className="font-medium">
                    Step {currentStepIndex + 1} of {PROGRESS_STEPS.length}
                  </span>
                </div>
              </div>

              {/* Current Step */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium">{currentStep.label}</span>
              </div>

              {/* All Steps */}
              <div className="space-y-2">
                {PROGRESS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-md transition-all ${
                        isActive
                          ? "bg-primary/10 border border-primary/30"
                          : isCompleted
                          ? "bg-muted/50"
                          : "opacity-40"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

