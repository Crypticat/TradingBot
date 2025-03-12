"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Ban, Download, Play, RefreshCw, Settings, TrendingDown, TrendingUp, Clock } from "lucide-react";

// Sample data for the chart
const data = Array.from({ length: 50 }, (_, i) => ({
  time: new Date(Date.now() - (50 - i) * 60000).toLocaleTimeString(),
  price: 42000 + Math.sin(i / 5) * 1000 + (i * 10),
  prediction: i > 40 ? null : 42000 + Math.sin(i / 5) * 1000 + (i * 10) + (Math.random() * 200 - 100)
}));

// Sample trading history
const tradeHistory = [
  { id: 1, type: 'buy', price: 42100, amount: 0.05, time: '12:30:45', status: 'completed' },
  { id: 2, type: 'sell', price: 42300, amount: 0.05, time: '13:15:22', status: 'completed' },
  { id: 3, type: 'buy', price: 42050, amount: 0.07, time: '14:05:11', status: 'completed' },
  { id: 4, type: 'buy', price: 41900, amount: 0.03, time: '15:22:30', status: 'pending' }
];

export default function ProductionPage() {
  const [isLive, setIsLive] = useState(false);
  const [selectedModel, setSelectedModel] = useState("model-1");
  const [balance, setBalance] = useState({ fiat: 5000, crypto: 0.2 });
  const [mounted, setMounted] = useState(false);

  // Fix for hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleLive = () => {
    setIsLive(!isLive);
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Production</h1>
            <p className="text-muted-foreground">Run your trading models in a live environment</p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="model-1">BTC Daily Predictor</SelectItem>
                <SelectItem value="model-2">ETH Volatility Model</SelectItem>
                <SelectItem value="model-3">Multi-Coin Trend Detector</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-4">
              <Switch
                id="live-mode"
                checked={isLive}
                onCheckedChange={handleToggleLive}
              />
              <label
                htmlFor="live-mode"
                className={`font-medium ${isLive ? 'text-green-500' : 'text-muted-foreground'}`}
              >
                {isLive ? 'Live Trading' : 'Simulation Mode'}
              </label>
            </div>
          </div>
        </div>

        {/* Live trading warning */}
        {isLive && (
          <Alert className="border-amber-500 bg-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-500">
              Live trading is enabled. The model will execute real trades on Luno using your account.
            </AlertDescription>
          </Alert>
        )}

        {/* Trading dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card dark:bg-slate-900 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Live Market - BTC/USD</CardTitle>
              <CardDescription>Current market data and model predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      name="Actual Price"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="prediction"
                      stroke="#10b981"
                      name="Prediction"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-md border border-border p-3">
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="font-semibold text-xl">$42,150.00</div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-sm text-muted-foreground">24h Change</div>
                  <div className="font-semibold text-xl flex items-center text-green-500">
                    <TrendingUp className="mr-1 h-5 w-5" />
                    +2.3%
                  </div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="font-semibold text-xl">$1.2B</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle>Account Balance</CardTitle>
                <CardDescription>Current portfolio value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">USD Balance</span>
                    <span className="font-medium">${balance.fiat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">BTC Balance</span>
                    <span className="font-medium">{balance.crypto.toFixed(6)} BTC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">BTC Value</span>
                    <span className="font-medium">${(balance.crypto * 42150).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span>Total Value</span>
                    <span className="font-bold text-xl">
                      ${(balance.fiat + balance.crypto * 42150).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle>Trading Controls</CardTitle>
                <CardDescription>Manage automated trading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={isLive ? "default" : "outline"}>
                        {isLive ? "Running" : "Stopped"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Model</span>
                      <span className="font-medium">BTC Daily Predictor</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Signal</span>
                      <span className="flex items-center text-green-500">
                        <TrendingUp className="mr-1 h-4 w-4" />
                        Buy
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant={isLive ? "destructive" : "default"}
                      onClick={handleToggleLive}
                      className="w-full"
                    >
                      {isLive ? (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Stop Trading
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Trading
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trade history and logs */}
        <Tabs defaultValue="trades" className="w-full">
          <TabsList>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="mt-4">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Trades</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left">Time</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Price</th>
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Value</th>
                        <th className="p-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeHistory.map((trade) => (
                        <tr key={trade.id} className="border-b border-border">
                          <td className="p-3 flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            {trade.time}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={trade.type === 'buy' ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'}>
                              {trade.type === 'buy' ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {trade.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3">${trade.price.toLocaleString()}</td>
                          <td className="p-3">{trade.amount} BTC</td>
                          <td className="p-3">${(trade.price * trade.amount).toLocaleString()}</td>
                          <td className="p-3">
                            <Badge variant={trade.status === 'completed' ? 'secondary' : 'outline'}>
                              {trade.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border p-4 bg-slate-950 font-mono text-sm h-[300px] overflow-y-auto">
                  <p className="text-green-500">[15:30:22] System initialized. Starting BTC Daily Predictor model.</p>
                  <p className="text-blue-400">[15:30:25] Fetching market data from Luno API...</p>
                  <p className="text-blue-400">[15:30:27] Market data received. Current BTC price: $42,150.00</p>
                  <p className="text-yellow-500">[15:31:05] Model predicts upward trend with 72% confidence.</p>
                  <p className="text-green-500">[15:31:10] BUY signal generated. Preparing to execute trade.</p>
                  <p className="text-blue-400">[15:31:15] Placing buy order: 0.03 BTC at $42,150.00</p>
                  <p className="text-blue-400">[15:31:20] Order submitted to Luno. Order ID: #28371</p>
                  <p className="text-green-500">[15:32:05] Order #28371 filled successfully.</p>
                  <p className="text-blue-400">[15:35:00] Monitoring market conditions...</p>
                  <p className="text-yellow-500">[15:40:15] Model recalculating based on new market data.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Trading Performance</CardTitle>
                <CardDescription>Model performance metrics in production</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-md border border-border p-3">
                    <div className="text-sm text-muted-foreground">Profit/Loss</div>
                    <div className="font-semibold text-xl text-green-500">+$285.50</div>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                    <div className="font-semibold text-xl">68%</div>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <div className="text-sm text-muted-foreground">Total Trades</div>
                    <div className="font-semibold text-xl">25</div>
                  </div>
                </div>

                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { date: "05/01", value: 5000 },
                      { date: "05/05", value: 5050 },
                      { date: "05/10", value: 4950 },
                      { date: "05/15", value: 5100 },
                      { date: "05/20", value: 5200 },
                      { date: "05/25", value: 5150 },
                      { date: "05/30", value: 5285 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Portfolio Value"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
