"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart2, LineChart, Play, Home, Settings, LucideGlobe } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "sticky top-0 z-40 w-full border-b border-border transition-all duration-200",
      scrolled 
        ? "bg-background/90 backdrop-blur-md shadow-sm" 
        : "bg-card dark:bg-slate-900"
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl flex items-center mr-8 group">
            <div className="relative mr-2 size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden group-hover:bg-primary/20 transition-colors">
              <LineChart className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
              LunoBot
            </span>
          </Link>
          <div className="hidden md:flex gap-2">
            <NavItem href="/" icon={<Home className="h-4 w-4 mr-2" />} label="Dashboard" active={pathname === "/"} />
            <NavItem href="/analytics" icon={<BarChart2 className="h-4 w-4 mr-2" />} label="Analytics" active={pathname.startsWith("/analytics")} />
            <NavItem href="/models" icon={<LineChart className="h-4 w-4 mr-2" />} label="Models" active={pathname.startsWith("/models")} />
            <NavItem href="/production" icon={<Play className="h-4 w-4 mr-2" />} label="Production" active={pathname.startsWith("/production")} />
            <NavItem href="/settings" icon={<Settings className="h-4 w-4 mr-2" />} label="Settings" active={pathname.startsWith("/settings")} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center mr-2">
            <div className="size-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>
          <MobileNav />
          <Button size="sm" variant="outline" className="gap-2 relative overflow-hidden group">
            <LucideGlobe className="h-4 w-4" />
            <span>Connect to Luno</span>
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "flex items-center relative",
          active && "font-medium"
        )}
      >
        {icon}
        {label}
        {active && (
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full" />
        )}
      </Button>
    </Link>
  );
}
