"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LineChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, BarChart2, Play, Settings } from "lucide-react";

// Sample data for the chart
const data = [
  { time: '00:00', price: 42000 },
  { time: '04:00', price: 43200 },
  { time: '08:00', price: 42800 },
  { time: '12:00', price: 44500 },
  { time: '16:00', price: 45200 },
  { time: '20:00', price: 44800 },
  { time: '24:00', price: 46000 },
];

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trading Bot Dashboard</h1>
            <p className="text-muted-foreground">Monitor, analyze, and control your crypto trading strategies</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Start Trading
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <Card className="bg-card dark:bg-slate-900 border-border">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
            <CardDescription>BTC/USD recent performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card dark:bg-slate-900 hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Analytics
                <BarChart2 className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>Train and test your models</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Select and label data points on crypto price charts to train your models.</p>
              <Link href="/analytics">
                <Button className="w-full">
                  <span>Go to Analytics</span>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-slate-900 hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Models
                <Settings className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>Manage your trading models</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Run and test existing models from the backend model library.</p>
              <Link href="/models">
                <Button className="w-full">
                  <span>Go to Models</span>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-slate-900 hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Production
                <Play className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>Run your models in live trading</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Activate your models to execute trades on Luno as market data arrives.</p>
              <Link href="/production">
                <Button className="w-full">
                  <span>Go to Production</span>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
