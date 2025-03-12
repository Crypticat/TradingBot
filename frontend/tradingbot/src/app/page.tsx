"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { 
  ArrowUpRight, 
  BarChart2, 
  Play, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Activity,
  RefreshCw,
  BarChart3,
  Bot,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Sample data for the chart
const data = [
  { time: '00:00', price: 42000, volume: 120 },
  { time: '04:00', price: 43200, volume: 200 },
  { time: '08:00', price: 42800, volume: 180 },
  { time: '12:00', price: 44500, volume: 300 },
  { time: '16:00', price: 45200, volume: 250 },
  { time: '20:00', price: 44800, volume: 220 },
  { time: '24:00', price: 46000, volume: 280 },
];

// Sample market data
const marketData = [
  { pair: 'BTC/USD', price: 45892.32, change: 2.4 },
  { pair: 'ETH/USD', price: 3240.18, change: -1.2 },
  { pair: 'XRP/USD', price: 0.58, change: 5.6 },
  { pair: 'SOL/USD', price: 98.75, change: 3.2 },
];

// Sample model performance data
const modelData = [
  { name: 'SMA Crossover', winRate: 68, profit: 12.4, trades: 45 },
  { name: 'LSTM Predictor', winRate: 72, profit: 18.7, trades: 32 },
  { name: 'RSI Strategy', winRate: 64, profit: 8.2, trades: 56 },
];

export default function Home() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix for hydration errors - only render client-specific components after hydration
  useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Don't render anything until after hydration to prevent mismatch
  if (!mounted) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold mr-3">Trading Dashboard</h1>
              <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <span className="animate-pulse size-2 rounded-full bg-primary mr-1"></span>
                Live
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-xl">
              Monitor, analyze, and control your crypto trading strategies in real-time
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              className="gap-2 group"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn(
                "h-4 w-4 transition-all",
                isRefreshing && "animate-spin"
              )} />
              {isRefreshing ? "Updating..." : "Refresh Data"}
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Start Trading
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card dark:bg-slate-900 overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription>Total Balance</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                $18,245.32
                <Badge className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 h-5">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3.2%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBalance)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card dark:bg-slate-900 overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription>24h Volume</CardDescription>
              <CardTitle className="text-2xl">$5,428.89</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVolume)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardDescription>Active Models</CardDescription>
              <CardTitle className="text-2xl">3</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                  <span>2 profitable</span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-1 text-blue-500" />
                  <span>45 trades today</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardDescription>Overall Profit</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                +$842.25
                <Badge className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 h-5">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Since 28 days ago</span>
                <Link href="/analytics" className="text-primary hover:underline flex items-center">
                  View details
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Market Overview */}
          <div className="lg:col-span-2">
            <Card className="bg-card dark:bg-slate-900 border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Market Overview</CardTitle>
                  <CardDescription>BTC/USD recent performance</CardDescription>
                </div>
                {isClient && (
                  <DropdownSelector 
                    options={["BTC/USD", "ETH/USD", "XRP/USD", "SOL/USD"]} 
                    defaultValue="BTC/USD" 
                  />
                )}
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9ca3af" 
                        tickLine={false}
                        axisLine={{ stroke: "#374151" }}
                      />
                      <YAxis 
                        stroke="#9ca3af" 
                        tickLine={false}
                        axisLine={{ stroke: "#374151" }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1f2937", 
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                        }} 
                        formatter={(value) => [`$${value.toLocaleString()}`, "Price"]}
                        labelStyle={{ color: "#9ca3af" }}
                      />
                      <ReferenceLine 
                        y={44000} 
                        stroke="#22c55e" 
                        strokeDasharray="3 3"
                        label={{ 
                          value: "Buy zone", 
                          position: "insideBottomLeft", 
                          fill: "#22c55e",
                          fontSize: 12
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 2, fill: "#3b82f6" }}
                        activeDot={{ r: 5, fill: "#3b82f6", stroke: "#1e3a8a" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 text-sm">
                <span className="text-muted-foreground">Last updated: Today, 12:45 PM</span>
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Full Chart
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Market Pairs & Model Performance */}
          <div className="flex flex-col gap-6">
            <Card className="bg-card dark:bg-slate-900 border-border">
              <CardHeader>
                <CardTitle className="text-lg">Market Pairs</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {marketData.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.pair}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toLocaleString()}</p>
                      </div>
                      <Badge 
                        className={cn(
                          "h-6",
                          item.change > 0 
                            ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" 
                            : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        )}
                      >
                        {item.change > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {item.change > 0 ? "+" : ""}{item.change}%
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="ghost" size="sm" className="w-full">
                  View All Markets
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card dark:bg-slate-900 border-border">
              <CardHeader>
                <CardTitle className="text-lg">Model Performance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {modelData.map((model, index) => (
                    <li key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <p className="font-medium">{model.name}</p>
                        </div>
                        <Badge 
                          className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                        >
                          {model.trades} trades
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${model.winRate}%` }}
                            ></div>
                          </div>
                          <span>{model.winRate}% win rate</span>
                        </div>
                        <span className="text-green-500">+{model.profit}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Link href="/models" className="w-full">
                  <Button size="sm" className="w-full gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Model Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAccessCard
            title="Analytics"
            icon={BarChart2}
            description="Train and test your models"
            content="Select and label data points on crypto price charts to train your models."
            href="/analytics"
          />
          <QuickAccessCard
            title="Models"
            icon={Settings}
            description="Manage your trading models"
            content="Run and test existing models from the backend model library."
            href="/models"
          />
          <QuickAccessCard
            title="Production"
            icon={Play}
            description="Run your models in live trading"
            content="Activate your models to execute trades on Luno as market data arrives."
            href="/production"
          />
        </div>
      </div>
    </main>
  );
}

// Dropdown selector component for chart timeframes
function DropdownSelector({ options, defaultValue }) {
  const [selected, setSelected] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="relative">
      <select 
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="appearance-none bg-transparent border border-border rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// Quick access card component
function QuickAccessCard({ title, icon: Icon, description, content, href }) {
  return (
    <Card className="bg-card dark:bg-slate-900 hover:bg-accent/50 transition-all group border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 size-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{content}</p>
        <Link href={href}>
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <span>Go to {title}</span>
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
