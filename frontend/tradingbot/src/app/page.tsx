"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BarChart4,
  Clock,
  Play,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Activity,
  Percent,
  RotateCcw,
  Calendar
} from "lucide-react";
import { fetchLivePrice, fetchTradeData } from "@/services/api";
import { PriceChart } from "@/components/price-chart";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

// Currency pairs available on Luno
const CURRENCY_PAIRS = [
  { value: "XBTZAR", label: "BTC/ZAR" },
  { value: "ETHZAR", label: "ETH/ZAR" },
  { value: "XRPZAR", label: "XRP/ZAR" },
  { value: "LTCZAR", label: "LTC/ZAR" },
  { value: "BCHZAR", label: "BCH/ZAR" },
  { value: "XBTUSDC", label: "BTC/USDC" },
  { value: "ETHUSDC", label: "ETH/USDC" },
  { value: "XRPUSDC", label: "XRP/USDC" },
];

export default function Home() {
  const [priceData, setPriceData] = useState<any[]>([]);
  const [livePrice, setLivePrice] = useState<any>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("XBTZAR");
  const [timeWindow, setTimeWindow] = useState("24h");
  const [marketStats, setMarketStats] = useState({
    volume24h: 0,
    priceChange24h: 0,
    priceChangePercent24h: 0,
    high24h: 0,
    low24h: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate market stats from trade data
  const calculateMarketStats = (trades: any[]) => {
    if (!trades || trades.length === 0) return;

    // Sort trades by timestamp (newest first)
    const sortedTrades = [...trades].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate 24h volume
    const volume24h = sortedTrades.reduce((sum, trade) => sum + parseFloat(trade.volume), 0);

    // Find high and low price in the last 24h
    const prices = sortedTrades.map(trade => parseFloat(trade.price));
    const high24h = Math.max(...prices);
    const low24h = Math.min(...prices);

    // Calculate price change (current price - earliest price)
    const latestPrice = parseFloat(sortedTrades[0].price);
    const earliestPrice = parseFloat(sortedTrades[sortedTrades.length - 1].price);
    const priceChange24h = latestPrice - earliestPrice;
    const priceChangePercent24h = (priceChange24h / earliestPrice) * 100;

    setMarketStats({
      volume24h,
      priceChange24h,
      priceChangePercent24h,
      high24h,
      low24h
    });
  };

  // Load data based on current parameters
  const loadData = async () => {
    try {
      setIsRefreshing(true);

      // Build parameters for the API call
      const params: any = {};

      // Calculate timestamp based on the selected time window
      if (timeWindow) {
        const now = new Date();
        const hours = parseInt(timeWindow.replace('h', ''));
        // Calculate time in the past (subtract hours from current time)
        // Use 23h59m for 24h to ensure we stay within the API's limit
        const hoursToSubtract = hours === 24 ? 23.98 : hours;
        const pastTime = new Date(now.getTime() - (hoursToSubtract * 60 * 60 * 1000));
        params.since = pastTime.getTime().toString();
      }

      // Fetch recent trades using the trade endpoint with parameters
      const tradeResponse = await fetchTradeData(selectedSymbol, params);

      if (tradeResponse && tradeResponse.trades) {
        // Get all recent trades without limiting
        const trades = tradeResponse.trades;
        setRecentTrades(trades);

        // Calculate market statistics
        calculateMarketStats(trades);

        // Convert trades to price chart format
        // Sort trades by timestamp (oldest first)
        const sortedTrades = [...trades].sort((a, b) => {
          // Parse ISO date strings for proper comparison
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateA.getTime() - dateB.getTime();
        });

        // Transform trades data to price chart format
        const chartData = sortedTrades.map(trade => ({
          time: new Date(trade.timestamp).toLocaleString(),
          price: parseFloat(trade.price),
          volume: parseFloat(trade.volume),
        }));

        setPriceData(chartData);
      }

      // Fetch current live price
      const livePriceData = await fetchLivePrice(selectedSymbol);
      setLivePrice(livePriceData);

    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load market data. Please try again later.");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Load data on component mount and when configuration changes
  useEffect(() => {
    loadData();

    // Set up a timer to refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      loadData();
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [selectedSymbol, timeWindow]);

  // Format price with proper currency symbol
  const formatPrice = (price: number) => {
    if (selectedSymbol.includes("ZAR")) {
      return `R ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$ ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Handle currency pair change
  const handleSymbolChange = (value: string) => {
    setSelectedSymbol(value);
    setIsLoading(true);
  };

  // Handle time window change
  const handleTimeWindowChange = (value: string) => {
    setTimeWindow(value);
    setIsLoading(true);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    loadData();
  };

  return (
    <main className="flex flex-col p-6 gap-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Luno Trading Bot</h1>
        <p className="text-lg text-muted-foreground">
          Automated cryptocurrency trading using machine learning models
        </p>
      </section>

      {/* Configuration Panel */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="w-40">
                <Select value={selectedSymbol} onValueChange={handleSymbolChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency pair" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Currency Pairs</SelectLabel>
                      {CURRENCY_PAIRS.map((pair) => (
                        <SelectItem key={pair.value} value={pair.value}>
                          {pair.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-40">
                <Select value={timeWindow} onValueChange={handleTimeWindowChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Time Window</SelectLabel>
                      <SelectItem value="1h">Last 1 hour</SelectItem>
                      <SelectItem value="4h">Last 4 hours</SelectItem>
                      <SelectItem value="8h">Last 8 hours</SelectItem>
                      <SelectItem value="12h">Last 12 hours</SelectItem>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              className="gap-2"
              disabled={isRefreshing}
            >
              <RotateCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Market Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Current Price */}
            <Card className="bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>Current Price</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {livePrice ? formatPrice(livePrice.price) : "-"}
                    </span>
                    <Badge variant="outline" className="font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Live
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 24h Change */}
            <Card className={`bg-card hover:shadow-md transition-shadow ${
              marketStats.priceChangePercent24h > 0 ? 'border-green-500/50' :
              marketStats.priceChangePercent24h < 0 ? 'border-red-500/50' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Percent className="h-4 w-4 mr-1" />
                    <span>24h Change</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${
                      marketStats.priceChangePercent24h > 0 ? 'text-green-500' :
                      marketStats.priceChangePercent24h < 0 ? 'text-red-500' : ''
                    }`}>
                      {marketStats.priceChangePercent24h > 0 ? '+' : ''}
                      {marketStats.priceChangePercent24h.toFixed(2)}%
                    </span>
                    {marketStats.priceChangePercent24h > 0 ? (
                      <ArrowUp className="h-5 w-5 text-green-500" />
                    ) : marketStats.priceChangePercent24h < 0 ? (
                      <ArrowDown className="h-5 w-5 text-red-500" />
                    ) : (
                      <Activity className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 24h Volume */}
            <Card className="bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>24h Volume</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {marketStats.volume24h.toFixed(4)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 24h High */}
            <Card className="bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>24h High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatPrice(marketStats.high24h)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 24h Low */}
            <Card className="bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span>24h Low</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatPrice(marketStats.low24h)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-2">
            {/* Price Chart Card */}
            <Card className="md:col-span-8 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    {CURRENCY_PAIRS.find(pair => pair.value === selectedSymbol)?.label || selectedSymbol} Market
                    {livePrice && (
                      <Badge variant="outline" className="ml-2 font-mono">
                        {formatPrice(livePrice.price)}
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge
                    variant={marketStats.priceChangePercent24h > 0 ? "success" :
                            marketStats.priceChangePercent24h < 0 ? "destructive" : "outline"}
                    className="font-mono"
                  >
                    {marketStats.priceChangePercent24h > 0 ? '+' : ''}
                    {marketStats.priceChangePercent24h.toFixed(2)}%
                  </Badge>
                </div>
                <CardDescription>
                  Recent price movements for the last {timeWindow} of trades
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="h-[300px]">
                  {priceData.length > 0 ? (
                    <PriceChart data={priceData} height={300} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No trade data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades Card */}
            <Card className="md:col-span-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Recent Trades</CardTitle>
                <CardDescription>
                  Latest {recentTrades.length} market transactions
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0">
                <div className="overflow-auto max-h-[300px]">
                  <table className="w-full">
                    <thead className="border-b sticky top-0 bg-card z-10">
                      <tr>
                        <th className="text-left font-medium px-4 py-2">Time</th>
                        <th className="text-left font-medium px-4 py-2">Price</th>
                        <th className="text-left font-medium px-4 py-2">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTrades.length > 0 ? (
                        recentTrades.map((trade, index) => (
                          <tr key={index} className="border-b border-border/50 last:border-none hover:bg-muted/30">
                            <td className="px-4 py-2 text-sm">
                              {new Date(trade.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-2 font-mono text-sm">
                              {parseFloat(trade.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2">
                              <div className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                                trade.is_buy
                                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                  : 'bg-red-500/20 text-red-600 dark:text-red-400'
                              }`}>
                                {trade.is_buy ? (
                                  <><TrendingUp className="h-3 w-3 mr-1" /> Buy</>
                                ) : (
                                  <><TrendingDown className="h-3 w-3 mr-1" /> Sell</>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                            No recent trades available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Analytics</CardTitle>
                <BarChart4 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="pb-4">
                  Analyze historical data and train models
                </CardDescription>
                <Link href="/analytics">
                  <Button className="w-full group">
                    Go to Analytics
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Models</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="pb-4">
                  Manage and test your trading models
                </CardDescription>
                <Link href="/models">
                  <Button className="w-full group">
                    View Models
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Production</CardTitle>
                <Play className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="pb-4">
                  Run trading bots in production
                </CardDescription>
                <Link href="/production">
                  <Button className="w-full group">
                    Start Trading
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}
