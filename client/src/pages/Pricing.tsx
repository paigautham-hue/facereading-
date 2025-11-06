import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Check, Sparkles, ArrowLeft, LogOut, Shield } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Pricing() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: products, isLoading: loadingProducts } = trpc.payment.getProducts.useQuery();
  const { data: creditsData } = trpc.payment.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createCheckout = trpc.payment.createCheckoutSession.useMutation();

  const handlePurchase = async (productId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      toast.info("Redirecting to checkout...");
      const result = await createCheckout.mutateAsync({ productId });
      
      if (result.url) {
        // Open checkout in new tab
        window.open(result.url, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getPricePerReading = (price: number, credits: number) => {
    return `$${(price / credits / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-semibold text-white">{APP_TITLE}</span>
              </div>
            </Link>

            {/* Right: Navigation */}
            <div className="flex items-center gap-4">
              {isAuthenticated && creditsData && (
                <div className="text-sm text-slate-300">
                  <span className="font-semibold text-orange-500">{creditsData.credits}</span> credits
                </div>
              )}
              
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      My Readings
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild variant="default" size="sm">
                  <a href={getLoginUrl()}>Login</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-orange-500">Reading Package</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Purchase credits to unlock detailed AI-powered face readings. The more you buy, the more you save!
          </p>
          {isAuthenticated && creditsData && (
            <div className="mt-6 inline-block bg-slate-800/50 border border-slate-700 rounded-lg px-6 py-3">
              <p className="text-slate-300">
                You currently have{" "}
                <span className="text-2xl font-bold text-orange-500">{creditsData.credits}</span>{" "}
                credits
              </p>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        {loadingProducts ? (
          <div className="text-center text-slate-400">Loading pricing...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {products?.map((product) => (
              <Card
                key={product.id}
                className={`relative bg-slate-900/50 border-slate-800 p-6 hover:border-orange-500/50 transition-all ${
                  product.popular ? "ring-2 ring-orange-500 scale-105" : ""
                }`}
              >
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    BEST VALUE
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{product.description}</p>
                  
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">{formatPrice(product.price)}</span>
                  </div>
                  
                  <div className="text-sm text-slate-400">
                    {getPricePerReading(product.price, product.credits)} per reading
                  </div>

                  {product.savings && (
                    <div className="mt-2 text-sm font-semibold text-green-400">
                      {product.savings}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>{product.credits} Face Reading{product.credits > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>11-page PDF Report</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>AI-Powered Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Instant Results</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={product.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(product.id)}
                  disabled={createCheckout.isPending}
                >
                  {createCheckout.isPending ? "Processing..." : "Purchase Now"}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Analysis</h3>
              <p className="text-slate-400">
                15+ life aspects analyzed including personality, career, relationships, and health
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Detailed PDF Report</h3>
              <p className="text-slate-400">
                Beautiful 11-page report with insights, predictions, and personalized guidance
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Model AI</h3>
              <p className="text-slate-400">
                Powered by Gemini 2.5 Pro, GPT-5, and Grok 4 for maximum accuracy
              </p>
            </div>
          </div>
        </div>

        {/* Test Card Notice */}
        <div className="mt-16 max-w-2xl mx-auto bg-slate-800/30 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Test Mode</h3>
          <p className="text-sm text-slate-400 mb-3">
            This is a test environment. Use test card: <code className="bg-slate-900 px-2 py-1 rounded">4242 4242 4242 4242</code>
          </p>
          <p className="text-xs text-slate-500">
            Any expiry date in the future and any 3-digit CVC will work.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 {APP_TITLE}. All rights reserved.</p>
          <p className="mt-2">
            <a href="https://soulapps-cwodhbc5.manus.space" className="hover:text-orange-500 transition-colors">
              Back to Soul Apps
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

