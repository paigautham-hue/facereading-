import { useParams } from "wouter";
import AnalysisProgress from "@/components/AnalysisProgress";

export default function AnalysisProgressPage() {
  const params = useParams<{ readingId: string }>();
  const readingId = params.readingId;

  if (!readingId) {
    return <div>Invalid reading ID</div>;
  }

  return <AnalysisProgress readingId={readingId} />;
}

