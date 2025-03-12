"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wifi, WifiOff } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check API connection
  const checkApiConnection = async () => {
    if (!navigator.onLine) {
      setApiConnected(false);
      return;
    }

    setChecking(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Set a timeout to avoid long waits
        signal: AbortSignal.timeout(3000),
      });
      
      setApiConnected(response.ok);
    } catch (error) {
      console.warn("API connection check failed:", error);
      setApiConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial API connection check
    checkApiConnection();
    
    // Check API connection periodically
    const intervalId = setInterval(checkApiConnection, 3000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Badge 
              variant="outline" 
              className={`gap-1 ${
                !isOnline 
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                  : apiConnected 
                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                    : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              } transition-colors`}
            >
              {isOnline ? (
                apiConnected ? (
                  <>
                    <span className="animate-pulse size-2 rounded-full bg-green-500 mr-1"></span>
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <span className="animate-pulse size-2 rounded-full bg-amber-500 mr-1"></span>
                    <Wifi className="h-3 w-3 mr-1" />
                    {checking ? "Checking" : "Offline"}
                  </>
                )
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {!isOnline ? (
            "You are currently offline. Check your internet connection."
          ) : apiConnected ? (
            "Connected to the trading bot API server."
          ) : (
            "Unable to connect to the trading bot API server. Make sure it's running."
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
