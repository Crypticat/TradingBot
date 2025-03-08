"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart2, LineChart, Play, Home, Settings } from "lucide-react";
import { MobileNav } from "./mobile-nav";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card dark:bg-slate-900">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl flex items-center mr-8">
            <LineChart className="h-6 w-6 mr-2 text-primary" />
            <span>LunoBot</span>
          </Link>

          <div className="hidden md:flex gap-1">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                size="sm"
                className="flex items-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/analytics">
              <Button
                variant={pathname.startsWith("/analytics") ? "secondary" : "ghost"}
                size="sm"
                className="flex items-center"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/models">
              <Button
                variant={pathname.startsWith("/models") ? "secondary" : "ghost"}
                size="sm"
                className="flex items-center"
              >
                <LineChart className="h-4 w-4 mr-2" />
                Models
              </Button>
            </Link>
            <Link href="/production">
              <Button
                variant={pathname.startsWith("/production") ? "secondary" : "ghost"}
                size="sm"
                className="flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Production
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant={pathname.startsWith("/settings") ? "secondary" : "ghost"}
                size="sm"
                className="flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MobileNav />
          <Button size="sm" variant="outline">
            Connect to Luno
          </Button>
        </div>
      </div>
    </nav>
  );
}
