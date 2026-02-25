// ============================================
// EduBridge AI – Main Navigation Bar
// ============================================

"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useAccessibility } from "@/context/accessibility-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Type,
  User,
  Volume2,
  X,
  FlaskConical,
  BriefcaseBusiness,
  Shield,
  Bell,
  CheckCheck,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  quizId?: string;
}

export function Navbar() {
  const { user, logout, token } = useAuth();
  const { prefs, setPrefs } = useAccessibility();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [a11yOpen, setA11yOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = React.useState(false);

  // Fetch notifications helper
  const fetchNotifications = React.useCallback(async (showLoading = false) => {
    if (!user || !token || (user.role !== "STUDENT" && user.role !== "TEACHER")) return;
    if (showLoading) setLoadingNotifs(true);
    try {
      const res = await fetch("/api/student/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn("[Notifications] API returned", res.status);
        if (showLoading) setLoadingNotifs(false);
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        const notifs = Array.isArray(data.data.notifications)
          ? data.data.notifications
          : Array.isArray(data.data)
            ? data.data
            : [];
        setNotifications(notifs);
      }
    } catch (err) {
      console.error("[Notifications] fetch error:", err);
    } finally {
      if (showLoading) setLoadingNotifs(false);
    }
  }, [user, token]);

  // Fetch on mount & poll every 8 seconds for live updates
  React.useEffect(() => {
    if (!user || !token) return;
    // Initial fetch with slight delay to ensure token is ready
    const timeout = setTimeout(() => fetchNotifications(false), 500);
    const interval = setInterval(() => fetchNotifications(false), 8000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [user, token, fetchNotifications]);

  // Also refresh when panel opens
  React.useEffect(() => {
    if (notifOpen) fetchNotifications(true);
  }, [notifOpen, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    if (!token) return;
    try {
      await fetch("/api/student/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  // Expose refresh for external use (e.g. after publishing a quiz)
  React.useEffect(() => {
    (window as any).__refreshNotifications = () => fetchNotifications(false);
    return () => { delete (window as any).__refreshNotifications; };
  }, [fetchNotifications]);

  const navLinks = React.useMemo(() => {
    if (!user) return [];

    const links = [];

    if (user.role === "STUDENT") {
      links.push(
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/explain", label: "AI Explainer", icon: BookOpen },
        { href: "/quiz", label: "Quizzes", icon: GraduationCap },
        { href: "/lab", label: "Virtual Lab", icon: FlaskConical },
        { href: "/career", label: "Career Map", icon: BriefcaseBusiness }
      );
    }

    if (user.role === "TEACHER") {
      links.push(
        { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
        { href: "/teacher/quizzes", label: "Manage Quizzes", icon: GraduationCap }
      );
    }

    if (user.role === "ADMIN") {
      links.push(
        { href: "/admin", label: "Admin Panel", icon: Shield },
        { href: "/teacher", label: "Analytics", icon: LayoutDashboard }
      );
    }

    return links;
  }, [user]);

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="h-7 w-7 text-primary" aria-hidden="true" />
          <span className="hidden sm:inline">EduBridge AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm" className="gap-2">
                <link.icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          {user && (user.role === "STUDENT" || user.role === "TEACHER") && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setNotifOpen(!notifOpen); setA11yOpen(false); }}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Accessibility Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setA11yOpen(!a11yOpen); setNotifOpen(false); }}
            aria-label="Accessibility settings"
            title="Accessibility settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {user ? (
            <>
              <Badge variant="secondary" className="hidden sm:flex gap-1">
                <User className="h-3 w-3" />
                {user.name}
              </Badge>
              <Badge variant="outline" className="hidden sm:flex">
                {user.role}
              </Badge>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Notification Panel */}
      {notifOpen && (
        <div className="absolute right-4 top-16 w-96 max-h-[420px] overflow-y-auto border rounded-lg bg-background shadow-xl z-[60]" role="region" aria-label="Notifications">
          <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-background z-10">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1 text-xs">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
          </div>
          {loadingNotifs ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No notifications yet</div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-sm ${n.isRead ? "opacity-60" : "bg-primary/5"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {n.quizId && (
                      <Link href="/quiz" onClick={() => setNotifOpen(false)}>
                        <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                          Take Quiz
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accessibility Panel */}
      {a11yOpen && (
        <div className="border-t bg-background p-4" role="region" aria-label="Accessibility settings">
          <div className="container mx-auto flex flex-wrap gap-4 items-center">
            <Button
              variant={prefs.highContrast ? "default" : "outline"}
              size="sm"
              onClick={() => setPrefs({ highContrast: !prefs.highContrast })}
              className="gap-2"
            >
              {prefs.highContrast ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              High Contrast
            </Button>

            <Button
              variant={prefs.dyslexiaFont ? "default" : "outline"}
              size="sm"
              onClick={() => setPrefs({ dyslexiaFont: !prefs.dyslexiaFont })}
              className="gap-2"
            >
              <Type className="h-4 w-4" />
              Dyslexia Font
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Font Size:</span>
              {[1, 1.25, 1.5].map((size) => (
                <Button
                  key={size}
                  variant={prefs.fontSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrefs({ fontSize: size })}
                >
                  {size === 1 ? "A" : size === 1.25 ? "A+" : "A++"}
                </Button>
              ))}
            </div>

            <Button
              variant={prefs.screenReaderMode ? "default" : "outline"}
              size="sm"
              onClick={() => setPrefs({ screenReaderMode: !prefs.screenReaderMode })}
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Screen Reader
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
