"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, 
  Bot, 
  Brain, 
  Check, 
  GitBranch, 
  LayoutGrid, 
  List, 
  PlayCircle, 
  Plus, 
  RefreshCw, 
  Settings2, 
  Sliders, 
  ArrowUpRight, 
  ChevronDown, 
  Trash, 
  History,
  LineChart,
  EyeIcon,
  BookOpen,
  Layers,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock models data
const models = [
  {
    id: "1",
    name: "BTC Price Predictor",
    description: "LSTM model to predict BTC price trends",
    type: "predictive",
    status: "active",
    accuracy: 68.4,
    lastUpdated: "2023-09-14",
    parameters: {
      epochs: 200,
      learningRate: 0.001,
      batchSize: 32,
    },
    framework: "tensorflow",
    metrics: {
      precision: 0.72,
      recall: 0.68,
      f1Score: 0.70,
    },
    features: ["price", "volume", "macd", "rsi"]
  },
  {
    id: "2",
    name: "ETH Reversal Detector",
    description: "Detects reversal patterns in ETH/USD price action",
    type: "classification",
    status: "inactive",
    accuracy: 72.1,
    lastUpdated: "2023-10-02",
    parameters: {
      epochs: 150,
      learningRate: 0.002,
      batchSize: 64,
    },
    framework: "pytorch",
    metrics: {
      precision: 0.75,
      recall: 0.71,
      f1Score: 0.73,
    },
    features: ["price", "volume", "adx", "bollinger"]
  },
  {
    id: "3",
    name: "RSI-based Trading Strategy",
    description: "Simple model that trades based on overbought/oversold RSI conditions",
    type: "rule-based",
    status: "active",
    accuracy: 65.8,
    lastUpdated: "2023-10-10",
    parameters: {
      oversoldThreshold: 30,
      overboughtThreshold: 70,
      period: 14,
    },
    framework: "custom",
    metrics: {
      precision: 0.67,
      recall: 0.70,
      f1Score: 0.68,
    },
    features: ["rsi"]
  }
];

// Framework badges with icons and colors
const frameworkDetails = {
  tensorflow: { color: "bg-orange-500/10 text-orange-500", icon: Brain },
  pytorch: { color: "bg-red-500/10 text-red-500", icon: Layers },
  sklearn: { color: "bg-blue-500/10 text-blue-500", icon: Sliders },
  custom: { color: "bg-purple-500/10 text-purple-500", icon: Settings2 },
};

// Status badges with colors
const statusColors = {
  active: "bg-green-500/10 text-green-500",
  inactive: "bg-gray-500/10 text-gray-500",
  training: "bg-blue-500/10 text-blue-500",
  error: "bg-red-500/10 text-red-500",
};

export default function ModelsPage() {
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [viewType, setViewType] = useState("grid");
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  // Fix for hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedModel = models.find(model => model.id === selectedModelId);

  // Filter models based on search and active filter
  const filteredModels = models.filter(model => {
    const matchesSearch = searchQuery === "" || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = activeFilter === "all" || model.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Generate a progress bar color based on accuracy
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 70) return "bg-green-500";
    if (accuracy >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  // Framework badge component
  const FrameworkBadge = ({ framework }) => {
    const { color, icon: Icon } = frameworkDetails[framework] || frameworkDetails.custom;
    return (
      <Badge variant="outline" className={cn("gap-1", color)}>
        <Icon className="h-3 w-3" />
        {framework}
      </Badge>
    );
  };

  // Don't render until client-side
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
              <h1 className="text-3xl font-bold">Models</h1>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {models.length} Total
              </Badge>
            </div>
            <p className="text-muted-foreground">Manage and deploy your trading models</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Input 
              className="w-[250px]" 
              placeholder="Search models..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => setIsCreatingModel(true)} className="gap-2 btn-glow">
              <Plus className="h-4 w-4" />
              Create Model
            </Button>
          </div>
        </div>
        
        {/* Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs 
            value={activeFilter} 
            onValueChange={setActiveFilter}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <div className="bg-muted rounded-md p-0.5 flex">
              <Button 
                variant={viewType === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-sm h-8"
                onClick={() => setViewType("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewType === "list" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-sm h-8"
                onClick={() => setViewType("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Models Grid/List View */}
        {viewType === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map(model => (
              <Card key={model.id} className="card-gradient hover-card-effect">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {model.name}
                        <FrameworkBadge framework={model.framework} />
                      </CardTitle>
                      <CardDescription className="mt-1">{model.description}</CardDescription>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(statusColors[model.status])}
                    >
                      {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-sm font-medium">{model.accuracy}% accuracy</div>
                    <div className="flex-grow h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", getAccuracyColor(model.accuracy))}
                        style={{ width: `${model.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Type:</span>
                      <span>{model.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <History className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{model.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedModelId(model.id)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  <Button 
                    size="sm" 
                    className={cn("flex-1", model.status === "active" ? "bg-green-600 hover:bg-green-700" : "")}
                    disabled={model.status === "training"}
                  >
                    {model.status === "active" ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Running
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <Card className="card-gradient">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4 hidden md:table-cell">Type</th>
                    <th className="text-left py-3 px-4 hidden lg:table-cell">Framework</th>
                    <th className="text-left py-3 px-4">Accuracy</th>
                    <th className="text-left py-3 px-4 hidden sm:table-cell">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.map(model => (
                    <tr key={model.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground hidden sm:block">{model.description}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">{model.type}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <FrameworkBadge framework={model.framework} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.accuracy}%</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", getAccuracyColor(model.accuracy))}
                              style={{ width: `${model.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <Badge 
                          variant="secondary" 
                          className={cn(statusColors[model.status])}
                        >
                          {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="size-8"
                            onClick={() => setSelectedModelId(model.id)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className={cn(
                              "size-8",
                              model.status === "active" && "text-green-500"
                            )}
                            disabled={model.status === "training"}
                          >
                            {model.status === "active" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Model Details Dialog */}
      <Dialog open={selectedModelId !== null} onOpenChange={() => setSelectedModelId(null)}>
        <DialogContent className="max-w-3xl">
          {selectedModel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedModel.name}
                  <Badge 
                    variant="secondary" 
                    className={cn(statusColors[selectedModel.status])}
                  >
                    {selectedModel.status.charAt(0).toUpperCase() + selectedModel.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedModel.description}</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Model Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-border">
                      <span className="text-muted-foreground">Type</span>
                      <span>{selectedModel.type}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border">
                      <span className="text-muted-foreground">Framework</span>
                      <span><FrameworkBadge framework={selectedModel.framework} /></span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{selectedModel.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border">
                      <span className="text-muted-foreground">Features Used</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {selectedModel.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold mt-4 mb-2">Model Parameters</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedModel.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1 border-b border-border">
                        <span className="text-muted-foreground">{key}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Performance Metrics</h4>
                  <Card className="bg-muted/20 border-none mb-4">
                    <CardContent className="pt-6">
                      <div className="flex justify-center items-center mb-4">
                        <div className="relative size-32">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{selectedModel.accuracy}%</span>
                          </div>
                          <svg className="size-32 -rotate-90" viewBox="0 0 100 100">
                            <circle 
                              cx="50" cy="50" r="40" 
                              fill="none" 
                              stroke="hsl(var(--muted))" 
                              strokeWidth="8"
                            />
                            <circle 
                              cx="50" cy="50" r="40" 
                              fill="none" 
                              stroke={getAccuracyColor(selectedModel.accuracy).replace('bg', 'text')} 
                              strokeWidth="8"
                              strokeDasharray={`${selectedModel.accuracy * 2.51} 251`}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Precision</div>
                          <div className="font-semibold">{selectedModel.metrics.precision.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Recall</div>
                          <div className="font-semibold">{selectedModel.metrics.recall.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">F1 Score</div>
                          <div className="font-semibold">{selectedModel.metrics.f1Score.toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <h4 className="text-sm font-semibold mb-2">Actions</h4>
                  <div className="space-y-3">
                    <Button className="w-full gap-2" variant={selectedModel.status === "active" ? "default" : "outline"}>
                      {selectedModel.status === "active" ? (
                        <>
                          <Check className="h-4 w-4" />
                          Running
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          Start Model
                        </>
                      )}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="gap-2">
                        <LineChart className="h-4 w-4" />
                        Test Model
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <GitBranch className="h-4 w-4" />
                        Clone
                      </Button>
                    </div>
                    
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash className="h-4 w-4" />
                      Delete Model
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Model Dialog */}
      <Dialog open={isCreatingModel} onOpenChange={setIsCreatingModel}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Model</DialogTitle>
            <DialogDescription>
              Configure and train a new trading model
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model-name" className="text-right">
                Name
              </Label>
              <Input
                id="model-name"
                placeholder="My Trading Model"
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
                  <SelectItem value="predictive">Predictive</SelectItem>
                  <SelectItem value="rule-based">Rule-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="framework" className="text-right">
                Framework
              </Label>
              <Select defaultValue="tensorflow">
                <SelectTrigger className="col-span-3" id="framework">
                  <SelectValue placeholder="Select Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tensorflow">TensorFlow</SelectItem>
                  <SelectItem value="pytorch">PyTorch</SelectItem>
                  <SelectItem value="sklearn">Scikit-learn</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {["price", "volume", "rsi", "macd", "adx", "bollinger"].map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Switch id={`feature-${feature}`} />
                    <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="training-data" className="text-right">
                Training Data
              </Label>
              <Select defaultValue="btc-1h-data">
                <SelectTrigger className="col-span-3" id="training-data">
                  <SelectValue placeholder="Select Data Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btc-1h-data">BTC/USD 1h (2000 samples)</SelectItem>
                  <SelectItem value="eth-1h-data">ETH/USD 1h (1800 samples)</SelectItem>
                  <SelectItem value="labeled-data">My Labeled Data (24 samples)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="advanced-options" className="text-right">
                Advanced
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch id="advanced-options" />
                <Label htmlFor="advanced-options">Show advanced configuration options</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingModel(false)}>
              Cancel
            </Button>
            <Button className="gap-2 btn-glow">
              <Bot className="h-4 w-4" />
              Create & Train
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
