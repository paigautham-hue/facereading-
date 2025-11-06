import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CreditCard, CheckCircle2, XCircle, Clock, Sparkles, LogOut, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Orders() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: orders, isLoading } = trpc.payment.getOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: creditsData } = trpc.payment.getCredits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="max-w-md w-full bg-slate-900/50 border-slate-800 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-slate-400 mb-6">Please log in to view your order history.</p>
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>Login</a>
          </Button>
        </Card>
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-semibold text-white">{APP_TITLE}</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {creditsData && (
                <div className="text-sm text-slate-300">
                  <span className="font-semibold text-orange-500">{creditsData.credits}</span> credits
                </div>
              )}

              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>

              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
            <p className="text-slate-400">View all your past purchases and transactions</p>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading orders...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="bg-slate-900/50 border-slate-800 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-orange-500" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {order.creditsAmount} Credits
                          </h3>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className={`text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-slate-400">
                          <p>Order ID: {order.id}</p>
                          <p>Date: {formatDate(order.createdAt)}</p>
                          {order.completedAt && (
                            <p>Completed: {formatDate(order.completedAt)}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-white mb-1">
                        {formatPrice(order.amount)}
                      </p>
                      <p className="text-xs text-slate-500 uppercase">{order.currency}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-900/50 border-slate-800 p-12 text-center">
              <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
              <p className="text-slate-400 mb-6">
                You haven't made any purchases yet. Get started by buying credits!
              </p>
              <Link href="/pricing">
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  View Pricing
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

