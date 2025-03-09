"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { 
  Menu, 
  BarChart2, 
  LineChart, 
  Play, 
  Home, 
  Settings, 
  LucideGlobe,
  ChevronRight,
  LogOut
} from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  
  const routes = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/models", label: "Models", icon: LineChart },
    { href: "/production", label: "Production", icon: Play },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden relative">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 border-r">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <div className="relative mr-2 size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <LineChart className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              LunoBot
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col py-4">
          <div className="px-3 mb-2">
            <div className="flex items-center px-2 py-1.5">
              <div className="size-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span className="text-xs text-muted-foreground">API Connected</span>
            </div>
          </div>
          
          <div className="px-3 mb-1">
            <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">NAVIGATION</h3>
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
                  onClick={() => setOpen(false)}
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
        </div>
        
        <SheetFooter className="mt-auto p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full gap-2 justify-start" 
            size="sm"
          >
            <LucideGlobe className="h-4 w-4" />
            <span>Connect to Luno</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full gap-2 justify-start mt-2" 
            size="sm"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Logout</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
