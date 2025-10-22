import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Sparkles,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Activity,
  Shield,
  Trash2,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: readings, isLoading: readingsLoading } = trpc.admin.getAllReadings.useQuery(
    { limit: 50, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: users, isLoading: usersLoading } = trpc.admin.getAllUsers.useQuery(
    { limit: 50, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: feedbackList, isLoading: feedbackLoading } = trpc.admin.getAllFeedback.useQuery(
    { limit: 50, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>Admin privileges required to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="https://soulapps-cwodhbc5.manus.space" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                ← Soul Apps
              </a>
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="text-xl font-semibold">Face Reading</span>
                </div>
              </Link>
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                User Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor system performance and manage users
            </p>
          </div>

          {/* Stats Cards */}
          {statsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : stats ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={<Users className="w-5 h-5" />}
                color="text-blue-500"
              />
              <StatCard
                title="Total Readings"
                value={stats.totalReadings}
                icon={<FileText className="w-5 h-5" />}
                color="text-purple-500"
                subtitle={`${stats.completionRate}% completed`}
              />
              <StatCard
                title="Average Rating"
                value={stats.avgRating.toFixed(1)}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-green-500"
                subtitle={`${stats.totalFeedback} reviews`}
              />
              <StatCard
                title="Processing"
                value={stats.processingReadings}
                icon={<Activity className="w-5 h-5" />}
                color="text-orange-500"
                subtitle={`${stats.failedReadings} failed`}
              />
            </div>
          ) : null}

          {/* Tabs */}
          <Tabs defaultValue="readings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="readings">Readings</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            {/* Readings Tab */}
            <TabsContent value="readings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Readings</CardTitle>
                  <CardDescription>Manage and monitor face reading sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {readingsLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : readings && readings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {readings.map((reading) => (
                          <TableRow key={reading.id}>
                            <TableCell className="font-mono text-xs">
                              {reading.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {reading.user?.name || "Unknown"}
                              <div className="text-xs text-muted-foreground">
                                {reading.user?.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  reading.status === "completed"
                                    ? "default"
                                    : reading.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {reading.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{reading.version}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(reading.createdAt!).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {reading.status === "completed" && (
                                  <Link href={`/reading/${reading.id}`}>
                                    <Button size="sm" variant="ghost">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No readings found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : users && users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Readings</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                            <TableCell>{user.email || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.readingCount}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(user.createdAt!).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Feedback</CardTitle>
                  <CardDescription>Review ratings and accuracy feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  {feedbackLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : feedbackList && feedbackList.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Reading</TableHead>
                          <TableHead>Feedback</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedbackList.map((fb) => (
                          <TableRow key={fb.id}>
                            <TableCell>{fb.user?.name || "Unknown"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{fb.overallRating}</span>
                                <span className="text-muted-foreground">/5</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              v{fb.reading?.version}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {fb.specificFeedback || "No comment"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(fb.createdAt!).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No feedback found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className={color}>{icon}</div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold">{value}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

