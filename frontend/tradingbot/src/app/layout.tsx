import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";

const fontSans = FontSans({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Luno Trading Bot",
  description: "AI-powered crypto trading bot for Luno",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen flex bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Sidebar />
          <div className="flex flex-col flex-1 md:pl-64">
            <div className="flex-1">
              {children}
            </div>
            <footer className="border-t border-border bg-card dark:bg-slate-900/50 py-6 px-4 mt-auto">
              <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-muted-foreground">© 2023 LunoBot Trading. All rights reserved.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Help
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
