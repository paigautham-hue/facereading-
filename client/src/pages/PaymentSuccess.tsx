import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: session, isLoading } = trpc.payment.verifySession.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  const { data: creditsData } = trpc.payment.getCredits.useQuery();

  useEffect(() => {
    // Get session_id from URL
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    
    if (sid) {
      setSessionId(sid);
      // Invalidate credits query to refresh balance
      utils.payment.getCredits.invalidate();
    } else {
      // No session ID, redirect to pricing
      setLocation("/pricing");
    }
  }, [setLocation, utils]);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-900/50 border-slate-800 p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Payment Successful!
          </h1>

          {/* Message */}
          <p className="text-slate-400 mb-6">
            Your credits have been added to your account. You can now create face readings!
          </p>

          {/* Credits Display */}
          {creditsData && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400 mb-1">Your Current Balance</p>
              <p className="text-4xl font-bold text-orange-500">
                {creditsData.credits}
              </p>
              <p className="text-sm text-slate-400 mt-1">credits</p>
            </div>
          )}

          {/* Email Confirmation */}
          {session.customerEmail && (
            <p className="text-sm text-slate-500 mb-6">
              A receipt has been sent to <span className="text-slate-400">{session.customerEmail}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/new-reading">
              <Button className="w-full" size="lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Start New Reading
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" className="w-full" size="lg">
                View My Readings
              </Button>
            </Link>

            <Link href="/orders">
              <Button variant="ghost" className="w-full">
                View Order History
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

