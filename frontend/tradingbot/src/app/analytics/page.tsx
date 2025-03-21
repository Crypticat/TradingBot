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
import { PriceChart } from "@/components/price-chart";
import { RecentTrades } from "@/components/recent-trades";
import { fetchCandleData, createModel } from "@/services/api";
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

// Technical indicators
const technicalIndicators = [
  { id: 'rsi', name: 'RSI', color: '#ef4444' },
  { id: 'macd', name: 'MACD', color: '#8b5cf6' },
  { id: 'sma', name: 'SMA (20)', color: '#f59e0b' },
  { id: 'ema', name: 'EMA (50)', color: '#10b981' },
];

export default function AnalyticsPage() {
  const [labeledPoints, setLabeledPoints] = useState<{x: string, y: number, label: string}[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("XBTZAR");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [visibleIndicators, setVisibleIndicators] = useState<string[]>(['rsi']);
  const [chartMode, setChartMode] = useState<'selection' | 'labeling'>('labeling');
  const [selectionRange, setSelectionRange] = useState<{start: string | null, end: string | null}>({
    start: null, 
    end: null
  });
  const [mounted, setMounted] = useState(false);
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [advancedOptions, setAdvancedOptions] = useState(false);

  // Fix hydration issues by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load price data when symbol or timeframe changes
  useEffect(() => {
    if (mounted) {
      loadPriceData();
    }
  }, [mounted, selectedSymbol, selectedTimeframe]);

  const loadPriceData = async () => {
    try {
      setIsLoading(true);
      // Use the new fetchCandleData function
      const data = await fetchCandleData(
        selectedSymbol, 
        selectedTimeframe
      );
      
      // Transform the data for the chart if needed
      setChartData(data.map(item => ({
        time: new Date(item.time).toLocaleString(),
        price: item.price,
        volume: item.volume,
        open: item.open,
        high: item.high,
        low: item.low,
        // Add mock indicator data for demo
        rsi: Math.random() * 70 + 15,
        macd: Math.random() * 20 - 10,
        sma: item.price * (1 + (Math.random() * 0.05 - 0.025)),
        ema: item.price * (1 + (Math.random() * 0.03 - 0.015)),
      })));
    } catch (error) {
      console.error('Error loading price data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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

  const handleTrainModel = async () => {
    if (labeledPoints.length === 0 || !modelName) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await createModel(
        modelName,
        modelDescription || `Model for ${selectedSymbol} - ${new Date().toISOString().split('T')[0]}`,
        selectedSymbol,
        labeledPoints
      );
      
      // Show success message or redirect
      setIsTrainingModalOpen(false);
      // Reset form fields
      setModelName("");
      setModelDescription("");
      setAdvancedOptions(false);
      
      // Optionally, redirect to models page
      // router.push('/models');
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      setIsLoading(false);
    }
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
                <SelectItem value="XBTZAR">XBT/ZAR</SelectItem>
                <SelectItem value="ETHZAR">ETH/ZAR</SelectItem>
                <SelectItem value="XRPZAR">XRP/ZAR</SelectItem>
                <SelectItem value="SOLZAR">SOL/ZAR</SelectItem>
                <SelectItem value="XBTUSDC">XBT/USDC</SelectItem>
                <SelectItem value="ETHUSDC">ETH/USDC</SelectItem>
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
        
        {/* Chart and Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
                  <PriceChart 
                    data={chartData}
                    isLoading={isLoading}
                    onChartClick={handleChartClick}
                    labeledPoints={labeledPoints}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Reset View
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={loadPriceData}>
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
          </div>
          
          {/* Recent Trades Section */}
          <div>
            <RecentTrades symbol={selectedSymbol} />
          </div>
        </div>
        
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
                    <div className="text-3xl font-semibold mt-2">{labeledPoints.length}</div>
                    <div className="text-xs text-muted-foreground mt-2">Last 7 days</div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg flex flex-col justify-between">
                    <div className="text-muted-foreground text-sm">Distribution</div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="size-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">
                          {Math.round(labeledPoints.filter(p => p.label === 'bullish').length / Math.max(1, labeledPoints.length) * 100)}% Bullish
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="size-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">
                          {Math.round(labeledPoints.filter(p => p.label === 'bearish').length / Math.max(1, labeledPoints.length) * 100)}% Bearish
                        </span>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{
                        width: `${labeledPoints.filter(p => p.label === 'bullish').length / Math.max(1, labeledPoints.length) * 100}%`
                      }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg flex flex-col justify-between">
                    <div className="text-muted-foreground text-sm">Training Quality</div>
                    <div className="flex items-center gap-1 mt-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">
                        {labeledPoints.length < 10 ? 'Poor' : 
                         labeledPoints.length < 30 ? 'Good' : 'Excellent'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {labeledPoints.length < 30 ? 
                        `You need ${30 - labeledPoints.length} more points for excellent quality` : 
                        'You have enough data for good model training'}
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
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model-description" className="text-right">
                Description
              </Label>
              <Input
                id="model-description"
                placeholder="Optional description"
                className="col-span-3"
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
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
                <Switch 
                  id="advanced-options" 
                  checked={advancedOptions}
                  onCheckedChange={setAdvancedOptions}
                />
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
              disabled={isLoading || !modelName || labeledPoints.length === 0}
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
