"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { fetchTradeData } from "@/services/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RecentTrades({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeWindow, setTimeWindow] = useState("24h");

  const loadRecentTrades = async () => {
    try {
      setIsLoading(true);

      // Calculate timestamp based on the selected time window
      const params: any = {};
      if (timeWindow) {
        const now = new Date();
        const hours = parseInt(timeWindow.replace('h', ''));
        // Calculate time in the past (subtract hours from current time)
        // Use 23h59m for 24h to ensure we stay within the API's limit
        const hoursToSubtract = hours === 24 ? 23.98 : hours;
        const pastTime = new Date(now.getTime() - (hoursToSubtract * 60 * 60 * 1000));
        params.since = pastTime.getTime().toString();
      }

      const response = await fetchTradeData(symbol, params);
      if (response && response.trades) {
        setTrades(response.trades);
      } else {
        setTrades([]);
      }
    } catch (error) {
      console.error("Failed to load recent trades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecentTrades();
  }, [symbol, timeWindow]);

  return (
    <Card className="bg-card dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Recent Trades</CardTitle>
          <CardDescription>Latest market transactions for {symbol} (last {timeWindow})</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="text-sm bg-background border border-border rounded p-1"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
          >
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="8h">8h</option>
            <option value="12h">12h</option>
            <option value="24h">24h</option>
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={loadRecentTrades}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Type</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No recent trades available
                  </td>
                </tr>
              ) : (
                trades.map((trade, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/40 transition-colors">
                    <td className="p-2">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                    <td className="p-2">${parseFloat(trade.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="p-2">{parseFloat(trade.volume).toFixed(6)}</td>
                    <td className="p-2">
                      <Badge className={trade.is_buy
                        ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        : "bg-red-500/20 text-red-500 hover:bg-red-500/30"}>
                        {trade.is_buy ? (
                          <><TrendingUp className="h-3 w-3 mr-1" /> Buy</>
                        ) : (
                          <><TrendingDown className="h-3 w-3 mr-1" /> Sell</>
                        )}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
