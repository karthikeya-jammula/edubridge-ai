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
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { prefs, setPrefs } = useAccessibility();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [a11yOpen, setA11yOpen] = React.useState(false);

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
          {/* Accessibility Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setA11yOpen(!a11yOpen)}
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
