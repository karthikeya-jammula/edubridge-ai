// ============================================
// EduBridge AI – Admin Panel Page
// User management, system metrics, module config
// ============================================

"use client";

import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Settings,
  Activity,
  Loader2,
  Search,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
  Globe,
  BookOpen,
} from "lucide-react";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface SystemMetrics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalQuizzes: number;
  totalAttempts: number;
  aiCallsToday: number;
  cacheHitRate: number;
}

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

const DEFAULT_MODULES: ModuleConfig[] = [
  { id: "ai-explain", name: "AI Explainer", description: "Topic explanations with AI", enabled: true, icon: "🧠" },
  { id: "translate", name: "Translation", description: "Multilingual AI translation", enabled: true, icon: "🌐" },
  { id: "quiz", name: "Quizzes", description: "AI-generated quizzes", enabled: true, icon: "📝" },
  { id: "virtual-lab", name: "Virtual Lab", description: "Interactive science experiments", enabled: true, icon: "🔬" },
  { id: "career", name: "Career Mapping", description: "AI career guidance", enabled: true, icon: "🎯" },
  { id: "tts", name: "Text-to-Speech", description: "Audio narration", enabled: true, icon: "🔊" },
  { id: "stt", name: "Speech-to-Text", description: "Voice input", enabled: false, icon: "🎙️" },
  { id: "study-plan", name: "Study Plans", description: "Personalized study schedules", enabled: true, icon: "📅" },
];

export default function AdminPage() {
  const { apiFetch } = useApi();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [modules, setModules] = useState<ModuleConfig[]>(DEFAULT_MODULES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await apiFetch<{ users: UserRecord[]; metrics: SystemMetrics }>("/api/admin/users");
    if (res.success && res.data) {
      setUsers(res.data.users || []);
      setMetrics(res.data.metrics || null);
    }
    setLoading(false);
  };

  const toggleUserActive = async (userId: string, active: boolean) => {
    await apiFetch(`/api/admin/users`, {
      method: "PATCH",
      body: JSON.stringify({ userId, active: !active }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !active } : u))
    );
  };

  const changeRole = async (userId: string, newRole: string) => {
    await apiFetch(`/api/admin/users`, {
      method: "PATCH",
      body: JSON.stringify({ userId, role: newRole }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const toggleModule = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">System management, user control & module configuration</p>
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.totalQuizzes}</p>
                  <p className="text-xs text-muted-foreground">Total Quizzes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.aiCallsToday}</p>
                  <p className="text-xs text-muted-foreground">AI Calls Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.cacheHitRate}%</p>
                  <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              {["ALL", "STUDENT", "TEACHER", "ADMIN"].map((role) => (
                <Button
                  key={role}
                  size="sm"
                  variant={roleFilter === role ? "default" : "outline"}
                  onClick={() => { setRoleFilter(role); setPage(1); }}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div className="border rounded-lg overflow-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 bg-background"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.active ? "success" : "destructive"} className="text-xs">
                          {user.active ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant={user.active ? "destructive" : "default"}
                          onClick={() => toggleUserActive(user.id, user.active)}
                          className="gap-1 text-xs"
                        >
                          {user.active ? (
                            <><UserX className="h-3 w-3" /> Disable</>
                          ) : (
                            <><UserCheck className="h-3 w-3" /> Enable</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {filteredUsers.length} users
              </p>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Module Configuration
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      mod.enabled ? "border-primary/30 bg-primary/5" : "border-muted bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mod.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{mod.name}</p>
                        <p className="text-xs text-muted-foreground">{mod.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        mod.enabled ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                      role="switch"
                      aria-checked={mod.enabled}
                      aria-label={`Toggle ${mod.name}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          mod.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" /> Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>API Status</span>
                  <Badge variant="success">Operational</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Database</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>AI Service</span>
                  <Badge variant={process.env.NEXT_PUBLIC_OPENAI_KEY ? "success" : "warning"}>
                    {process.env.NEXT_PUBLIC_OPENAI_KEY ? "Active" : "Not Configured"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Cache</span>
                  <Badge variant="success">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" /> User Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Students</span>
                        <span>{metrics.totalStudents}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(metrics.totalStudents / Math.max(metrics.totalUsers, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Teachers</span>
                        <span>{metrics.totalTeachers}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(metrics.totalTeachers / Math.max(metrics.totalUsers, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Admins</span>
                        <span>{metrics.totalAdmins}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(metrics.totalAdmins / Math.max(metrics.totalUsers, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
