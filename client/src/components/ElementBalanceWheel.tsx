import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ElementBalanceProps {
  elementBalance?: {
    dominant: string;
    secondary: string;
    harmony: string;
    conflicts: string[];
  };
}

export default function ElementBalanceWheel({ elementBalance }: ElementBalanceProps) {
  if (!elementBalance) return null;

  const elements = [
    { name: "Wood", color: "from-green-500 to-emerald-600", icon: "🌳", position: "top-0 left-1/2 -translate-x-1/2" },
    { name: "Fire", color: "from-red-500 to-orange-600", icon: "🔥", position: "top-1/4 right-0" },
    { name: "Earth", color: "from-yellow-500 to-amber-600", icon: "🏔️", position: "bottom-1/4 right-0" },
    { name: "Metal", color: "from-gray-400 to-slate-600", icon: "⚔️", position: "bottom-0 left-1/2 -translate-x-1/2" },
    { name: "Water", color: "from-blue-500 to-cyan-600", icon: "💧", position: "bottom-1/4 left-0" },
  ];

  const isDominant = (name: string) => elementBalance.dominant.toLowerCase().includes(name.toLowerCase());
  const isSecondary = (name: string) => elementBalance.secondary.toLowerCase().includes(name.toLowerCase());

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">☯️</span>
          Five Element Balance
        </CardTitle>
        <CardDescription>Your elemental constitution and energy harmony</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Element Wheel Visualization */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border-2 border-primary/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-1">☯️</div>
                <div className="text-xs font-medium text-muted-foreground">Balance</div>
              </div>
            </div>
          </div>

          {/* Element circles */}
          {elements.map((element, idx) => {
            const dominant = isDominant(element.name);
            const secondary = isSecondary(element.name);
            const size = dominant ? "w-20 h-20" : secondary ? "w-16 h-16" : "w-12 h-12";
            const opacity = dominant ? "opacity-100" : secondary ? "opacity-80" : "opacity-50";

            return (
              <div
                key={element.name}
                className={`absolute ${element.position} ${opacity} transition-all duration-500 hover:scale-110`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${idx * 72}deg) translateY(-80px) rotate(-${idx * 72}deg)`,
                }}
              >
                <div
                  className={`${size} rounded-full bg-gradient-to-br ${element.color} flex items-center justify-center shadow-lg border-2 ${
                    dominant ? "border-white animate-pulse" : secondary ? "border-white/70" : "border-white/30"
                  }`}
                >
                  <span className="text-2xl">{element.icon}</span>
                </div>
                <div className="text-center mt-2">
                  <div className={`text-xs font-semibold ${dominant ? "text-foreground" : "text-muted-foreground"}`}>
                    {element.name}
                  </div>
                  {dominant && <div className="text-[10px] text-primary font-bold">Dominant</div>}
                  {secondary && <div className="text-[10px] text-primary/70 font-bold">Secondary</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Element Details */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <div className="font-semibold text-sm text-primary mb-1">Dominant Element</div>
                <div className="text-sm">{elementBalance.dominant}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌟</span>
              <div>
                <div className="font-semibold text-sm text-secondary-foreground mb-1">Secondary Element</div>
                <div className="text-sm">{elementBalance.secondary}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">☮️</span>
              <div>
                <div className="font-semibold text-sm text-green-700 dark:text-green-400 mb-1">Elemental Harmony</div>
                <div className="text-sm">{elementBalance.harmony}</div>
              </div>
            </div>
          </div>

          {elementBalance.conflicts && elementBalance.conflicts.length > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/20">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-semibold text-sm text-orange-700 dark:text-orange-400 mb-2">Elemental Tensions</div>
                  <ul className="text-sm space-y-1">
                    {elementBalance.conflicts.map((conflict, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{conflict}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

