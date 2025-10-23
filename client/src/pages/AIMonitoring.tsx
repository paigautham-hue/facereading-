import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Activity, TrendingUp, Zap, AlertCircle, Clock, Target, Database } from "lucide-react";

export default function AIMonitoring() {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d" | "all">("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: stats, isLoading } = trpc.aiMonitoring.getStats.useQuery(
    { timeRange },
    { refetchInterval: autoRefresh ? 10000 : false } // Auto-refresh every 10 seconds
  );

  const { data: recentLogs } = trpc.aiMonitoring.getRecentLogs.useQuery(
    { limit: 20, modelName: "all", status: "all" },
    { refetchInterval: autoRefresh ? 10000 : false }
  );

  const { data: errorLogs } = trpc.aiMonitoring.getErrorLogs.useQuery(
    { limit: 10 },
    { refetchInterval: autoRefresh ? 10000 : false }
  );

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const modelColors = {
    "gemini-2.5-pro": "from-purple-500 to-purple-700",
    "gpt-5": "from-green-500 to-green-700",
    "grok-4": "from-orange-500 to-orange-700",
  };

  const modelIcons = {
    "gemini-2.5-pro": "🔮",
    "gpt-5": "🧠",
    "grok-4": "⚡",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-slate-400 hover:text-orange-500 transition-colors">
                ← Back to Admin
              </Link>
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-white">AI Model Monitoring</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  autoRefresh
                    ? "bg-green-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {autoRefresh ? "🔄 Auto-refresh ON" : "⏸️ Auto-refresh OFF"}
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-orange-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Model Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(stats.stats).map(([modelName, modelStats]) => (
                <div
                  key={modelName}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{modelIcons[modelName as keyof typeof modelIcons]}</span>
                      <h3 className="text-lg font-semibold text-white">{modelName}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${modelColors[modelName as keyof typeof modelColors]} text-white text-sm font-medium`}>
                      {modelStats.successRate}% Success
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Total Calls
                      </span>
                      <span className="text-white font-semibold">{modelStats.total}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Successes
                      </span>
                      <span className="text-green-400 font-semibold">{modelStats.successes}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        Failures
                      </span>
                      <span className="text-red-400 font-semibold">{modelStats.failures}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Avg Response
                      </span>
                      <span className="text-white font-semibold">{modelStats.avgResponseTime}ms</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Avg Confidence
                      </span>
                      <span className="text-white font-semibold">{modelStats.avgConfidence}%</span>
                    </div>

                    {/* Operations Breakdown */}
                    <div className="pt-3 border-t border-slate-700">
                      <div className="text-xs text-slate-500 mb-2">Operations:</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-slate-400">Vision</div>
                          <div className="text-white font-semibold">{modelStats.byOperation.vision_analysis}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400">Reading</div>
                          <div className="text-white font-semibold">{modelStats.byOperation.face_reading}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400">Insights</div>
                          <div className="text-white font-semibold">{modelStats.byOperation.stunning_insights}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Error Logs */}
            {errorLogs && errorLogs.length > 0 && (
              <div className="bg-gradient-to-br from-red-950 to-slate-900 rounded-xl p-6 border border-red-900">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  Recent Errors
                </h2>
                <div className="space-y-3">
                  {errorLogs.map((log) => (
                    <div key={log.id} className="bg-slate-900/50 rounded-lg p-4 border border-red-900/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{modelIcons[log.modelName]}</span>
                          <div>
                            <div className="text-white font-semibold">{log.modelName}</div>
                            <div className="text-sm text-slate-400">{log.operation}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-red-400 bg-red-950/50 rounded p-2 font-mono">
                        {log.errorMessage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity Logs */}
            {recentLogs && recentLogs.length > 0 && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-orange-500" />
                  Recent Activity
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                        <th className="pb-3">Model</th>
                        <th className="pb-3">Operation</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Response Time</th>
                        <th className="pb-3">Confidence</th>
                        <th className="pb-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span>{modelIcons[log.modelName]}</span>
                              <span className="text-white text-sm">{log.modelName}</span>
                            </div>
                          </td>
                          <td className="py-3 text-slate-300 text-sm">{log.operation}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.status === "success"
                                ? "bg-green-900/50 text-green-400"
                                : "bg-red-900/50 text-red-400"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300 text-sm">
                            {log.responseTime ? `${log.responseTime}ms` : "-"}
                          </td>
                          <td className="py-3 text-slate-300 text-sm">
                            {log.confidenceScore ? `${log.confidenceScore}%` : "-"}
                          </td>
                          <td className="py-3 text-slate-400 text-xs">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            No monitoring data available yet. Start analyzing faces to see AI performance metrics.
          </div>
        )}
      </div>
    </div>
  );
}

