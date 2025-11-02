import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Sparkles, Eye, Brain, Heart, TrendingUp, Star, Zap, LogOut, Shield } from "lucide-react";
import { MysticHeroIcon } from "@/components/MysticHeroIcon";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  return (
    <div className="min-h-screen">
      {/* Header for logged-in users */}
      {isAuthenticated && (
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
          <div className="container py-3 md:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Left: Soul Apps + Logo */}
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <a href="https://soulapps-cwodhbc5.manus.space" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
                  ← Soul Apps
                </a>
                <div className="flex items-center gap-1 md:gap-2 min-w-0">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  <span className="text-base md:text-xl font-semibold truncate">Face Reading</span>
                </div>
              </div>
              
              {/* Right: Navigation - Desktop */}
              <div className="hidden lg:flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    My Readings
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>

              {/* Right: Navigation - Mobile (Compact) */}
              <div className="flex lg:hidden items-center gap-1">
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="px-2">
                      <Shield className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="px-2">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="px-2" onClick={() => logoutMutation.mutate()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Cosmic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
        
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Back to Soul Apps Link */}
            <div className="flex justify-center">
              <a href="https://soulapps-cwodhbc5.manus.space" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Back to Soul Apps</span>
              </a>
            </div>
            {/* Mystical Hero Icon */}
            <div className="flex justify-center">
              <MysticHeroIcon />
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Discover Your Destiny
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground font-light">
                Through the Ancient Art of Face Reading
              </p>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Unlock the secrets hidden in your facial features. Our AI-powered system combines
              ancient wisdom with cutting-edge technology to reveal your personality, potential,
              and life path with stunning accuracy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/20">
                      <Sparkles className="mr-2 h-5 w-5" />
                      View My Readings
                    </Button>
                  </Link>
                  <Link href="/new-reading">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30">
                      Start New Reading
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/20">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get Your Reading
                    </Button>
                  </a>
                  <a href="#features">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30">
                      Learn More
                    </Button>
                  </a>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span>Ancient Wisdom</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-card/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                What Your Face Reveals
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our comprehensive analysis covers 15+ life aspects with stunning detail
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Simple, Fast, Accurate
            </h2>
            <p className="text-lg text-muted-foreground">
              Get your comprehensive face reading in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {isAuthenticated ? (
              <Link href="/new-reading">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Your Reading Now
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container">
          <div className="max-w-6xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xl font-semibold">
              <Sparkles className="w-6 h-6 text-primary" />
              <span>{APP_TITLE}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Combining ancient wisdom with modern AI technology
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a href="https://soulapps-cwodhbc5.manus.space" className="text-muted-foreground hover:text-primary transition-colors">
                ← Back to Soul Apps
              </a>
              <span className="text-muted-foreground/50">|</span>
              <span className="text-muted-foreground">Explore More Spiritual Tools</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 {APP_TITLE}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Personality Traits",
    description: "Discover your core character, temperament, and emotional nature with remarkable accuracy.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Career & Success",
    description: "Uncover your natural talents, leadership potential, and peak earning years.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Love & Relationships",
    description: "Understand your relationship style, compatibility indicators, and marriage timing.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Wealth & Finance",
    description: "Learn about your earning capacity, saving habits, and wealth accumulation patterns.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Health & Vitality",
    description: "Gain insights into your constitutional strength, health indicators, and longevity.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Life Purpose",
    description: "Discover your calling, life direction, and the mission you're meant to fulfill.",
  },
];

const steps = [
  {
    title: "Capture Photos",
    description: "Follow our guided system to capture multiple angles of your face with your camera.",
  },
  {
    title: "AI Analysis",
    description: "Our advanced AI analyzes your facial features using ancient wisdom and modern science.",
  },
  {
    title: "Get Your Reading",
    description: "Receive a comprehensive 20-30 page report with stunning insights about your life.",
  },
];

