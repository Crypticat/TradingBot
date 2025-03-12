"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart2, 
  LineChart, 
  Play, 
  Home, 
  Settings, 
  LucideGlobe,
  ChevronRight,
  LogOut
} from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { NetworkStatus } from "@/components/network-status";

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const routes = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/models", label: "Models", icon: LineChart },
    { href: "/production", label: "Production", icon: Play },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4">
          <Link href="/" className="font-bold text-xl flex items-center group">
            <div className="relative mr-2 size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden group-hover:bg-primary/20 transition-colors">
              <LineChart className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
              LunoBot
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center mr-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
            <MobileNav />
          </div>
        </div>
        <div className="h-16"></div> {/* Spacer for fixed header */}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 w-64 flex-col border-r border-border bg-card dark:bg-slate-900">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/" className="font-bold text-xl flex items-center group">
            <div className="relative mr-2 size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden group-hover:bg-primary/20 transition-colors">
              <LineChart className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
              LunoBot
            </span>
          </Link>
        </div>

        {/* Nav Items */}
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium text-muted-foreground px-3 mb-2">BACKEND</h3>
        </div>

        {/* Network Status - added below logo */}
        <div className="px-4 mb-4">
          <NetworkStatus />
        </div>


        {/* Nav Items */}
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium text-muted-foreground px-3 mb-2">NAVIGATION</h3>
        </div>

        <div className="space-y-1 px-3">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href ||
              (route.href !== "/" && pathname.startsWith(route.href));
            return (
              <Link
                key={route.href}
                href={route.href}
                className="block"
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-between group",
                    isActive ? "bg-secondary" : "hover:bg-muted/50"
                  )}
                  size="sm"
                >
                  <span className="flex items-center">
                    <Icon className={cn("h-4 w-4 mr-3", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className={cn(isActive ? "font-medium" : "font-normal")}>
                      {route.label}
                    </span>
                  </span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-primary animate-in slide-in-from-left" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full gap-2 justify-start" 
            size="sm"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
}
