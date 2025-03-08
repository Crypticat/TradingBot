"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Settings, RefreshCw, Trash, Download, UploadCloud } from "lucide-react";

// Sample model data
const models = [
  {
    id: "model-1",
    name: "BTC Daily Predictor",
    description: "Predicts BTC price movements on daily timeframes",
    accuracy: 68.5,
    lastRun: "2023-10-15",
    status: "active"
  },
  {
    id: "model-2",
    name: "ETH Volatility Model",
    description: "Detects high volatility periods for ETH",
    accuracy: 72.1,
    lastRun: "2023-10-20",
    status: "inactive"
  },
  {
    id: "model-3",
    name: "Multi-Coin Trend Detector",
    description: "Analyzes trends across multiple coins",
    accuracy: 65.8,
    lastRun: "2023-10-22",
    status: "active"
  },
];

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState("library");
  const [runningModel, setRunningModel] = useState<string | null>(null);

  const handleRunModel = (modelId: string) => {
    setRunningModel(modelId);
    // In a real application, this would call your FastAPI backend
    setTimeout(() => {
      setRunningModel(null);
    }, 3000);
  };

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Model Management</h1>
            <p className="text-muted-foreground">Run, test and manage your trading models</p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <UploadCloud className="h-4 w-4 mr-2" />
              Import Model
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Create Model
            </Button>
          </div>
        </div>

        <Tabs defaultValue="library" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="library">Model Library</TabsTrigger>
            <TabsTrigger value="running">Running Models</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map(model => (
                <Card key={model.id} className="bg-card dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{model.name}</CardTitle>
                      <Badge variant={model.status === "active" ? "default" : "outline"}>
                        {model.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>{model.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-medium">{model.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Run</span>
                        <span>{model.lastRun}</span>
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => handleRunModel(model.id)}
                            disabled={runningModel === model.id}
                          >
                            {runningModel === model.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Run Model
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button variant="destructive" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="running" className="mt-4">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Running Models</CardTitle>
                <CardDescription>Models currently running in backtesting or simulation</CardDescription>
              </CardHeader>
              <CardContent>
                {runningModel ? (
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {models.find(m => m.id === runningModel)?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Running backtest on historical data
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setRunningModel(null)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>No models are currently running</p>
                    <p className="text-sm">Run a model from the Model Library tab</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Performance metrics from your model test runs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 text-muted-foreground">
                  <p>No test results available</p>
                  <p className="text-sm">Run a model to see results here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
