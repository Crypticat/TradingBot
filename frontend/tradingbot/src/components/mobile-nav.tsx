"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, BarChart2, LineChart, Play, Home, Settings } from "lucide-react";

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
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            <span>LunoBot</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 p-2">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href ||
              (route.href !== "/" && pathname.startsWith(route.href));

            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {route.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
