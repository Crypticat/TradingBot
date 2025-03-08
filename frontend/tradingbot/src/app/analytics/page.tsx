"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { DataTable } from "@/components/data-table";
import { Save, Trash, Plus } from "lucide-react";

// Sample data for the chart
const data = Array.from({ length: 100 }, (_, i) => ({
  time: `${Math.floor(i / 4)}:${(i % 4) * 15}`.padStart(4, '0'),
  price: 40000 + Math.random() * 10000 - 5000 + (i * 50)
}));

export default function AnalyticsPage() {
  const [labeledPoints, setLabeledPoints] = useState<{x: string, y: number, label: string}[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");

  const handleChartClick = (data: any) => {
    if (data && data.activePayload) {
      const point = data.activePayload[0].payload;
      setLabeledPoints([...labeledPoints, {
        x: point.time,
        y: point.price,
        label: "bullish"
      }]);
    }
  };

  const removePoint = (index: number) => {
    setLabeledPoints(labeledPoints.filter((_, i) => i !== index));
  };

  const changePointLabel = (index: number, newLabel: string) => {
    const updatedPoints = [...labeledPoints];
    updatedPoints[index].label = newLabel;
    setLabeledPoints(updatedPoints);
  };

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Training</h1>
            <p className="text-muted-foreground">Label market data to train your trading models</p>
          </div>

          <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC-USD">BTC-USD</SelectItem>
                <SelectItem value="ETH-USD">ETH-USD</SelectItem>
                <SelectItem value="XRP-USD">XRP-USD</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[180px]">
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
          </div>
        </div>

        {/* Chart Section */}
        <Card className="bg-card dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Price Chart - {selectedSymbol}</CardTitle>
            <CardDescription>Click on the chart to label important points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />

                  {labeledPoints.map((point, index) => (
                    <ReferenceDot
                      key={index}
                      x={point.x}
                      y={point.y}
                      r={5}
                      fill={point.label === "bullish" ? "#10b981" : "#ef4444"}
                      stroke="none"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Reset Zoom
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Indicator
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={() => setLabeledPoints([])}>
                <Trash className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Labels
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Labeled Points Table */}
        <Card className="bg-card dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Labeled Points</CardTitle>
            <CardDescription>Manage your labeled data points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Label</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labeledPoints.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-muted-foreground">
                        No labeled points. Click on the chart to add some.
                      </td>
                    </tr>
                  ) : (
                    labeledPoints.map((point, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-3">{point.x}</td>
                        <td className="p-3">${point.y.toFixed(2)}</td>
                        <td className="p-3">
                          <Select
                            defaultValue={point.label}
                            onValueChange={(value) => changePointLabel(index, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bullish">Bullish</SelectItem>
                              <SelectItem value="bearish">Bearish</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePoint(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={labeledPoints.length === 0}>
              Train Model with Selected Points
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
