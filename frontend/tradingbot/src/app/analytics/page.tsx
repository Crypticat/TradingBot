"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceDot,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { 
  Save, 
  Trash, 
  Plus, 
  ZoomIn, 
  ArrowLeftRight, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CalendarDays, 
  BookMarked, 
  Calendar,
  GitBranchPlus,
  BarChart2,
  Bot,
  Cpu,
  PieChart,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data for the chart
const data = Array.from({ length: 100 }, (_, i) => ({
  time: `${Math.floor(i / 4)}:${(i % 4) * 15}`.padStart(4, '0'),
  price: 40000 + Math.random() * 10000 - 5000 + (i * 50),
  volume: Math.random() * 100 + 50,
  rsi: Math.random() * 70 + 15
}));

// Technical indicators
const technicalIndicators = [
  { id: 'rsi', name: 'RSI', color: '#ef4444' },
  { id: 'macd', name: 'MACD', color: '#8b5cf6' },
  { id: 'sma', name: 'SMA (20)', color: '#f59e0b' },
  { id: 'ema', name: 'EMA (50)', color: '#10b981' },
];

export default function AnalyticsPage() {
  const [labeledPoints, setLabeledPoints] = useState<{x: string, y: number, label: string}[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [visibleIndicators, setVisibleIndicators] = useState<string[]>(['rsi']);
  const [chartMode, setChartMode] = useState<'selection' | 'labeling'>('labeling');
  const [selectionRange, setSelectionRange] = useState<{start: string | null, end: string | null}>({
    start: null, 
    end: null
  });
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle chart click for point labeling
  const handleChartClick = (data: any) => {
    if (chartMode !== 'labeling' || !data || !data.activePayload) return;
    
    const point = data.activePayload[0].payload;
    setLabeledPoints([...labeledPoints, {
      x: point.time,
      y: point.price,
      label: "bullish"
    }]);
  };

  const handleMouseDown = (e: any) => {
    if (chartMode !== 'selection' || !e || !e.activeLabel) return;
    setSelectionRange({ start: e.activeLabel, end: null });
  };

  const handleMouseMove = (e: any) => {
    if (chartMode !== 'selection' || !selectionRange.start || !e || !e.activeLabel) return;
    setSelectionRange({ ...selectionRange, end: e.activeLabel });
  };

  const handleMouseUp = (e: any) => {
    if (chartMode !== 'selection' || !selectionRange.start || !e || !e.activeLabel) return;
    console.log(`Selected range: ${selectionRange.start} to ${e.activeLabel}`);
    // Process the selection range here
  };

  const removePoint = (index: number) => {
    setLabeledPoints(labeledPoints.filter((_, i) => i !== index));
    setSelectedLabels(selectedLabels.filter(i => i !== index));
  };

  const changePointLabel = (index: number, newLabel: string) => {
    const updatedPoints = [...labeledPoints];
    updatedPoints[index].label = newLabel;
    setLabeledPoints(updatedPoints);
  };

  const toggleSelectLabel = (index: number) => {
    if (selectedLabels.includes(index)) {
      setSelectedLabels(selectedLabels.filter(i => i !== index));
    } else {
      setSelectedLabels([...selectedLabels, index]);
    }
  };

  const toggleIndicator = (indicatorId: string) => {
    if (visibleIndicators.includes(indicatorId)) {
      setVisibleIndicators(visibleIndicators.filter(id => id !== indicatorId));
    } else {
      setVisibleIndicators([...visibleIndicators, indicatorId]);
    }
  };

  const handleTrainModel = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsTrainingModalOpen(false);
      // Show success message, redirect, etc.
    }, 2000);
  };

  // Get point color based on label
  const getPointColor = (label: string) => {
    switch (label) {
      case 'bullish': return '#22c55e';
      case 'bearish': return '#ef4444';
      case 'neutral': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return null;
  }

  return (
    <main className="responsive-container">
      <div className="flex flex-col gap-6">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">Analytics & Training</h1>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Beta
              </Badge>
            </div>
            <p className="text-muted-foreground">Label market data to train your trading models</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC-USD">BTC-USD</SelectItem>
                <SelectItem value="ETH-USD">ETH-USD</SelectItem>
                <SelectItem value="XRP-USD">XRP-USD</SelectItem>
                <SelectItem value="SOL-USD">SOL-USD</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5m">5 minutes</SelectItem>
                <SelectItem value="15m">15 minutes</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="4h">4 hours</SelectItem>
                <SelectItem value="1d">1 day</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Date Range
            </Button>
          </div>
        </div>
        
        {/* Chart Section */}
        <Card className="card-gradient hover-card-effect">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedSymbol} Price Chart
                  <Badge variant="outline">{selectedTimeframe}</Badge>
                </CardTitle>
                <CardDescription>
                  {chartMode === 'labeling' ? 
                    'Click on the chart to label important points' : 
                    'Click and drag to select a range for analysis'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-muted rounded-md p-0.5 flex">
                  <Button 
                    variant={chartMode === 'labeling' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-sm h-8"
                    onClick={() => setChartMode('labeling')}
                  >
                    <BookMarked className="h-4 w-4 mr-1" />
                    Label
                  </Button>
                  <Button 
                    variant={chartMode === 'selection' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-sm h-8"
                    onClick={() => setChartMode('selection')}
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-1" />
                    Select
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-3">
            <div className="mb-4 flex flex-wrap gap-2">
              {technicalIndicators.map(indicator => (
                <Button
                  key={indicator.id}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 gap-1 border-border",
                    visibleIndicators.includes(indicator.id) && "bg-muted"
                  )}
                  onClick={() => toggleIndicator(indicator.id)}
                >
                  {visibleIndicators.includes(indicator.id) ? (
                    <Eye className="h-3 w-3" style={{ color: indicator.color }} />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={cn(
                    visibleIndicators.includes(indicator.id) ? "" : "text-muted-foreground"
                  )}>
                    {indicator.name}
                  </span>
                </Button>
              ))}
            </div>
            
            <div className="h-[450px] w-full chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={data}
                  onClick={handleChartClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))" 
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    domain={['auto', 'auto']}
                  />
                  
                  {/* Add secondary Y-axis for indicators */}
                  {visibleIndicators.includes('rsi') && (
                    <YAxis 
                      yAxisId={1}
                      orientation="right"
                      stroke="#ef4444"
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      ticks={[0, 30, 70, 100]}
                      tickFormatter={(value) => `${value}`}
                      width={30}
                      tick={{ fontSize: 10 }}
                    />
                  )}
                  
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))", 
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    formatter={(value, name) => {
                      if (name === 'rsi') return [`${value}`, 'RSI'];
                      return [`$${Number(value).toLocaleString()}`, 'Price'];
                    }}
                    animationDuration={200}
                  />
                  
                  {/* Main price line */}
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={false}
                    animationDuration={500}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))" }}
                    name="Price"
                  />
                  
                  {/* Additional indicators */}
                  {visibleIndicators.includes('rsi') && (
                    <Line 
                      type="monotone" 
                      dataKey="rsi" 
                      stroke="#ef4444" 
                      strokeWidth={1.5}
                      dot={false}
                      opacity={0.8}
                      yAxisId={1}
                      name="rsi"
                    />
                  )}
                  
                  {/* Reference lines for RSI */}
                  {visibleIndicators.includes('rsi') && (
                    <>
                      <ReferenceLine y={30} yAxisId={1} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
                      <ReferenceLine y={70} yAxisId={1} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
                    </>
                  )}
                  
                  {/* Selection range */}
                  {chartMode === 'selection' && selectionRange.start && selectionRange.end && (
                    <ReferenceArea 
                      x1={selectionRange.start} 
                      x2={selectionRange.end} 
                      strokeOpacity={0.3}
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  )}
                  
                  {/* Labeled points */}
                  {labeledPoints.map((point, index) => (
                    <ReferenceDot
                      key={index}
                      x={point.x}
                      y={point.y}
                      r={6}
                      fill={getPointColor(point.label)}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      strokeOpacity={0.8}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <ZoomIn className="h-4 w-4" />
                Reset View
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setLabeledPoints([])}
                className="gap-2"
                disabled={labeledPoints.length === 0}
              >
                <Trash className="h-4 w-4" />
                Clear All
              </Button>
              <Button 
                size="sm" 
                className="gap-2 btn-glow"
                disabled={labeledPoints.length === 0}
                onClick={() => setIsTrainingModalOpen(true)}
              >
                <GitBranchPlus className="h-4 w-4" />
                Train Model
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Labeled Points Section */}
        <Tabs defaultValue="labeled-points" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="labeled-points" className="gap-2">
                <BookMarked className="h-4 w-4" />
                Labeled Points
              </TabsTrigger>
              <TabsTrigger value="previous-models" className="gap-2">
                <Bot className="h-4 w-4" />
                Previous Models
              </TabsTrigger>
              <TabsTrigger value="statistics" className="gap-2">
                <BarChart2 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={selectedLabels.length === 0 || selectedLabels.length === labeledPoints.length}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Export Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                disabled={labeledPoints.length === 0}
              >
                <Save className="h-4 w-4" />
                Save All
              </Button>
            </div>
          </div>
        
          <TabsContent value="labeled-points" className="mt-0">
            <Card className="card-gradient">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Labeled Market Points</span>
                  <Badge variant={labeledPoints.length > 0 ? "default" : "outline"}>
                    {labeledPoints.length} points
                  </Badge>
                </CardTitle>
                <CardDescription>Manage and export your labeled data points</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="py-2 px-4 text-left w-10">
                          <input 
                            type="checkbox" 
                            className="size-4 rounded"
                            checked={selectedLabels.length === labeledPoints.length && labeledPoints.length > 0}
                            onChange={() => {
                              if (selectedLabels.length === labeledPoints.length) {
                                setSelectedLabels([]);
                              } else {
                                setSelectedLabels(labeledPoints.map((_, i) => i));
                              }
                            }}
                          />
                        </th>
                        <th className="py-2 px-4 text-left">Time</th>
                        <th className="py-2 px-4 text-left">Price</th>
                        <th className="py-2 px-4 text-left">Label</th>
                        <th className="py-2 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labeledPoints.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                            <div className="py-6">
                              <BookMarked className="h-10 w-10 mx-auto mb-2 opacity-20" />
                              <p>No labeled points yet. Click on the chart to label market data.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        labeledPoints.map((point, index) => (
                          <tr key={index} className={cn(
                            "border-b border-border hover:bg-muted/40 transition-colors",
                            index === labeledPoints.length - 1 && "border-b-0",
                            selectedLabels.includes(index) && "bg-muted/50"
                          )}>
                            <td className="py-2 px-4">
                              <input 
                                type="checkbox" 
                                className="size-4 rounded"
                                checked={selectedLabels.includes(index)}
                                onChange={() => toggleSelectLabel(index)}
                              />
                            </td>
                            <td className="py-2 px-4">{point.x}</td>
                            <td className="py-2 px-4">${point.y.toFixed(2)}</td>
                            <td className="py-2 px-4">
                              <div className="relative inline-block">
                                <div 
                                  className="absolute left-2 top-1/2 -translate-y-1/2 size-3 rounded-full" 
                                  style={{ backgroundColor: getPointColor(point.label) }}
                                />
                                <Select
                                  value={point.label}
                                  onValueChange={(value) => changePointLabel(index, value)}
                                >
                                  <SelectTrigger className="w-[130px] pl-7">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="bullish">Bullish</SelectItem>
                                    <SelectItem value="bearish">Bearish</SelectItem>
                                    <SelectItem value="neutral">Neutral</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="py-2 px-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => removePoint(index)}
                              >
                                <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="previous-models" className="mt-0">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Previously Trained Models</CardTitle>
                <CardDescription>Models trained from your labeled data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((model) => (
                    <div key={model} className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded-md">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-medium">BTC Trend Predictor #{model}</h3>
                          <Badge>72% accuracy</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Trained on {50 + model * 10} data points • Created on May {10 + model}, 2023
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Details</Button>
                        <Button variant="default" size="sm" className="btn-glow">Use Model</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="statistics" className="mt-0">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Label Statistics
                </CardTitle>
                <CardDescription>Analysis of your labeled data points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-muted/30 p-4 rounded-lg flex flex-col justify-between">
                    <div className="text-muted-foreground text-sm">Total Labels</div>
                    <div className="text-3xl font-semibold mt-2">24</div>
                    <div className="text-xs text-muted-foreground mt-2">Last 7 days</div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg flex flex-col justify-between">
                    <div className="text-muted-foreground text-sm">Distribution</div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="size-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">60% Bullish</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="size-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">40% Bearish</span>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{width: "60%"}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg flex flex-col justify-between">
                    <div className="text-muted-foreground text-sm">Training Quality</div>
                    <div className="flex items-center gap-1 mt-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">Good</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      You need 20 more points for excellent quality
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="text-center text-muted-foreground">
                  <p>Detailed statistics will appear here as you label more data points.</p>
                  <Button variant="outline" className="mt-4">Generate Full Report</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Model Training Dialog */}
      <Dialog open={isTrainingModalOpen} onOpenChange={setIsTrainingModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Train a New Model</DialogTitle>
            <DialogDescription>
              Create a new model based on your labeled data points
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model-name" className="text-right">
                Name
              </Label>
              <Input
                id="model-name"
                placeholder="My BTC Trading Model"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model-type" className="text-right">
                Type
              </Label>
              <Select defaultValue="classification">
                <SelectTrigger className="col-span-3" id="model-type">
                  <SelectValue placeholder="Model Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data-points" className="text-right">
                Data Points
              </Label>
              <div className="col-span-3 flex items-center">
                <span className="text-muted-foreground">{labeledPoints.length} labeled points selected</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="advanced-options" className="text-right">
                Advanced
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch id="advanced-options" />
                <Label htmlFor="advanced-options" className="cursor-pointer">Enable hyperparameter tuning</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrainingModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTrainModel} 
              disabled={isLoading}
              className="gap-2 btn-glow"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" />
                  Train Model
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
