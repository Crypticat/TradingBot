"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Bell, Key, Database, Save, Smartphone, Mail } from "lucide-react";

export default function SettingsPage() {
  const [lunoApiKey, setLunoApiKey] = useState("");
  const [lunoApiSecret, setLunoApiSecret] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState("medium");

  const handleSaveApiKeys = () => {
    // This would connect to your FastAPI backend to store the API keys
    console.log("Saving API keys:", { lunoApiKey, lunoApiSecret });
  };

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your trading bot and connections</p>
        </div>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api">API Connection</TabsTrigger>
            <TabsTrigger value="trading">Trading Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="mt-4">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Luno API Configuration
                </CardTitle>
                <CardDescription>
                  Connect your Luno account to enable trading. Your API credentials are encrypted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="text"
                    placeholder="Enter your Luno API Key"
                    value={lunoApiKey}
                    onChange={(e) => setLunoApiKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-secret">API Secret</Label>
                  <Input
                    id="api-secret"
                    type="password"
                    placeholder="Enter your Luno API Secret"
                    value={lunoApiSecret}
                    onChange={(e) => setLunoApiSecret(e.target.value)}
                  />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-500">Security Information</p>
                    <p className="text-xs text-amber-500/80 mt-1">
                      Make sure your API key has the correct permissions to trade, but limit it to only what's necessary.
                      Never share your API credentials with anyone.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveApiKeys} disabled={!lunoApiKey || !lunoApiSecret}>
                  <Save className="h-4 w-4 mr-2" />
                  Save API Configuration
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="mt-4">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Trading Preferences
                </CardTitle>
                <CardDescription>
                  Configure how your bot trades and manages risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-trade">Automated Trading</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your bot to execute trades automatically
                    </p>
                  </div>
                  <Switch
                    id="auto-trade"
                    checked={autoTradeEnabled}
                    onCheckedChange={setAutoTradeEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trade-amount">Maximum Trade Amount (USD)</Label>
                  <Input
                    id="trade-amount"
                    type="number"
                    defaultValue="500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum amount per individual trade
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-level">Risk Level</Label>
                  <Select value={riskLevel} onValueChange={setRiskLevel}>
                    <SelectTrigger id="risk-level">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Affects trade frequency and position sizing
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stop-loss">Default Stop Loss (%)</Label>
                  <Input
                    id="stop-loss"
                    type="number"
                    defaultValue="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="take-profit">Default Take Profit (%)</Label>
                  <Input
                    id="take-profit"
                    type="number"
                    defaultValue="10"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Trading Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card className="bg-card dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-notifications">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts about trades and market conditions
                    </p>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                {notificationsEnabled && (
                  <>
                    <div className="pl-6 border-l-2 border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications in browser
                          </p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notify me about:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="trades-executed" defaultChecked />
                          <Label htmlFor="trades-executed">Trades executed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="price-alerts" defaultChecked />
                          <Label htmlFor="price-alerts">Price alerts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="model-signals" defaultChecked />
                          <Label htmlFor="model-signals">Model signals</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="system-errors" defaultChecked />
                          <Label htmlFor="system-errors">System errors</Label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
