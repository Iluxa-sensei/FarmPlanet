import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle, Clock, Globe, Filter, Download, Sun, Activity, Eye, Satellite, Bell, AlertTriangle, MapPin, Sprout, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type KpForecastRow = [string, string, string, string];
type XRayRow = {
  time_tag: string;
  satellite: number;
  flux: number;
  observed_flux: number;
  electron_correction: number;
  electron_contaminaton: boolean;
  energy: string;
};

interface Alert {
  id: number;
  type: string;
  event: string;
  location: string;
  region: string;
  severity: string;
  status: string;
  timestamp: string;
  description: string;
  kpLevel: number;
  source: string;
  impact: string;
  actionTaken: string | null;
  expires: string;
}

// Territory interface from MapPage
interface Territory {
  id: string;
  points: [number, number][];
  name: string;
  crop?: string;
  plantingDate?: string;
  area?: number;
  aiPlan?: any;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const TERRITORIES_STORAGE_KEY = 'farmplanet_territories';

  // Load territories from localStorage
  const loadTerritories = (): Territory[] => {
    try {
      const stored = localStorage.getItem(TERRITORIES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading territories:', error);
    }
    return [];
  };

  // Generate AI Plan notifications
  const generateAIPlanAlerts = (alertId: number): Alert[] => {
    const territories = loadTerritories();
    const farmAlerts: Alert[] = [];
    const now = new Date();

    territories.forEach(territory => {
      if (!territory.plantingDate || !territory.crop || !territory.aiPlan) {
        return;
      }

      const plantingDate = new Date(territory.plantingDate);
      const daysPassed = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeksPassed = Math.floor(daysPassed / 7);
      const currentWeek = Math.max(1, weeksPassed + 1); // Ensure at least week 1
      const daysIntoWeek = daysPassed % 7;

      // Always generate alert for territories with AI plans (even if planting date is in future)
      if (territory.aiPlan && territory.aiPlan.totalWeeks > 0) {
        let weekToShow = currentWeek;
        let planToShow = territory.aiPlan.weeklyPlans[weekToShow - 1];

        // If no plan for current week, show the first week
        if (!planToShow && territory.aiPlan.weeklyPlans.length > 0) {
          weekToShow = 1;
          planToShow = territory.aiPlan.weeklyPlans[0];
        }

        if (planToShow) {
          // Determine severity - make it more visible for testing
          let severity: "high" | "medium" | "low" = "medium";
          let status: "active" | "monitoring" | "resolved" = "active";

          if (daysPassed < 0) {
            // Future planting
            severity = "low";
            status = "monitoring";
          } else if (daysIntoWeek === 0 || daysIntoWeek === 1) {
            // First days of week
            severity = "high";
            status = "active";
          }

          farmAlerts.push({
            id: alertId++,
            type: "farming",
            event: `🌾 ${territory.name} - Week ${weekToShow} Tasks`,
            location: territory.name,
            region: territory.crop || "Unknown crop",
            severity: severity,
            status: status,
            timestamp: now.toISOString(),
            description: `${planToShow.title}. ${planToShow.tasks.length} tasks to complete this week. ${daysPassed >= 0 ? `Day ${daysIntoWeek + 1} of 7.` : 'Planned for future.'}`,
            kpLevel: Math.round((weekToShow / territory.aiPlan.totalWeeks) * 10),
            source: "AI Farming Plan",
            impact: `Tasks: ${planToShow.tasks.slice(0, 2).join(', ')}${planToShow.tasks.length > 2 ? '...' : ''}`,
            actionTaken: daysPassed >= 0 && daysIntoWeek > 3 ? `Week ${weekToShow} - ${Math.floor((daysIntoWeek / 7) * 100)}% complete` : null,
            expires: new Date(plantingDate.getTime() + (weekToShow * 7 + 7) * 24 * 60 * 60 * 1000).toISOString()
          });

        }
      }

      // Alert for harvest time (if it's the last week or close to it)
      if (daysPassed >= 0 && currentWeek >= territory.aiPlan.totalWeeks) {
        farmAlerts.push({
          id: alertId++,
          type: "harvest",
          event: `🌾 ${territory.name} - Harvest Time!`,
          location: territory.name,
          region: territory.crop || "Unknown crop",
          severity: "high",
          status: "active",
          timestamp: now.toISOString(),
          description: `Final week of growing season for ${territory.crop}. Prepare for harvest! ${daysPassed >= 0 ? `Day ${daysIntoWeek + 1} of final week.` : 'Harvest approaching.'}`,
          kpLevel: 10,
          source: "AI Farming Plan",
          impact: `Expected harvest date: ${territory.aiPlan.harvestDate}. Grain moisture check required.`,
          actionTaken: null,
          expires: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    return farmAlerts;
  };

  useEffect(() => {
    async function generateAlerts() {
      const newAlerts: Alert[] = [];
      let alertId = 1;

      // Add AI Plan alerts first
      const farmAlerts = generateAIPlanAlerts(alertId);
      newAlerts.push(...farmAlerts);
      alertId += farmAlerts.length;

      try {
        // 1. Check Kp-index for geomagnetic storms
        const kpRes = await fetch(
          "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json"
        );
        if (kpRes.ok) {
          const kpData: KpForecastRow[] = await kpRes.json();
          const rows = kpData.slice(1);

          // Check forecast for next 24 hours
          const next24h = rows.slice(0, 8);
          const maxKp = Math.max(...next24h.map(r => parseFloat(r[1])).filter(v => !isNaN(v)));

          if (maxKp >= 5) {
            const timeTag = next24h[0][0];
            const minutesAgo = Math.floor((Date.now() - new Date(timeTag).getTime()) / (1000 * 60));

            newAlerts.push({
              id: alertId++,
              type: "geomagnetic",
              event: "Geomagnetic Storm Watch",
              location: "Global",
              region: "Worldwide",
              severity: maxKp >= 7 ? "high" : "medium",
              status: "active",
              timestamp: timeTag,
              description: `Strong geomagnetic activity expected. Kp-index forecast to reach ${Math.round(maxKp)}. ${maxKp >= 7 ? "Power grid operators advised to monitor systems." : "Minor fluctuations possible."}`,
              kpLevel: Math.round(maxKp),
              source: "NOAA SWPC",
              impact: `${maxKp >= 7 ? "Power grid fluctuations, satellite operations affected, " : ""}Aurora visible down to ${Math.round(60 - maxKp * 2)}°N latitude`,
              actionTaken: null,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });
          }
        }

        // 2. Check X-Ray for solar flares
        const xrayRes = await fetch(
          "https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json"
        );
        if (xrayRes.ok) {
          const xrayData: XRayRow[] = await xrayRes.json();
          const longWave = xrayData
            .filter((d) => d.energy === "0.1-0.8nm")
            .sort((a, b) => new Date(b.time_tag).getTime() - new Date(a.time_tag).getTime());

          if (longWave.length > 0) {
            const flux = longWave[0].flux;
            let flareClass = "";
            let severity = "low";

            if (flux >= 1e-5) {
              flareClass = "X";
              severity = "high";
            } else if (flux >= 1e-6) {
              flareClass = "M";
              severity = "high";
            } else if (flux >= 1e-7) {
              flareClass = "C";
              severity = "medium";
            }

          }
        }

        // 3. Aurora Alert based on current Kp
        const currentKpRes = await fetch(
          "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
        );
        if (currentKpRes.ok) {
          const kpData: KpForecastRow[] = await currentKpRes.json();
          const rows = kpData.slice(1);
          const latestKp = parseFloat(rows[rows.length - 1][1]);

          if (latestKp >= 5) {
            const latitude = Math.round(60 - latestKp * 2);
            const timeTag = rows[rows.length - 1][0];
            const minutesAgo = Math.floor((Date.now() - new Date(timeTag).getTime()) / (1000 * 60));

            newAlerts.push({
              id: alertId++,
              type: "aurora",
              event: "Aurora Visibility Alert",
              location: "Northern Hemisphere",
              region: `${latitude + 10}°N - ${latitude}°N`,
              severity: "medium",
              status: "monitoring",
              timestamp: timeTag,
              description: `Aurora borealis visible down to ${latitude}°N latitude due to elevated Kp-index (${latestKp.toFixed(1)}).`,
              kpLevel: Math.round(latestKp),
              source: "Aurora Forecast",
              impact: "Excellent aurora viewing conditions for photographers",
              actionTaken: "Aurora photographers and tour operators notified",
              expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
            });
          }
        }

        setAlerts(newAlerts);
        setLoading(false);
      } catch (error) {
        console.error("Error generating alerts:", error);
        setLoading(false);
      }
    }

    generateAlerts();
    const interval = setInterval(generateAlerts, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const spaceWeatherAlerts = alerts;
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "geomagnetic": return Activity;
      case "solar": return Sun;
      case "aurora": return Eye;
      case "radiation": return Zap;
      case "satellite": return Satellite;
      case "farming": return Sprout;
      case "harvest": return Calendar;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "success";
      case "monitoring": return "warning";
      case "active": return "destructive";
      default: return "secondary";
    }
  };


  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeLeft = (expiresTimestamp: string) => {
    const now = new Date();
    const expires = new Date(expiresTimestamp);
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs <= 0) return "Expired";
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m remaining`;
    return `${diffMinutes}m remaining`;
  };

  const activeAlerts = spaceWeatherAlerts.filter(alert => alert.status === "active");
  const resolvedAlerts = spaceWeatherAlerts.filter(alert => alert.status === "resolved");
  const monitoringAlerts = spaceWeatherAlerts.filter(alert => alert.status === "monitoring");
  const criticalAlerts = spaceWeatherAlerts.filter(alert => alert.severity === "high");

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Space Weather Alerts & Notifications
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring of space weather events, solar storms, and geomagnetic activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="glow-button">
            <Bell className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </motion.div>

      {/* Summary removed per requirements */}

      {/* Alerts Tabs (reduced) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {spaceWeatherAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${alert.severity === 'high' ? 'bg-destructive/20' :
                          alert.severity === 'medium' ? 'bg-warning/20' : 'bg-success/20'
                          }`}>
                          {(() => {
                            const Icon = getAlertIcon(alert.type);
                            return <Icon className={`w-5 h-5 ${alert.severity === 'high' ? 'text-destructive' :
                              alert.severity === 'medium' ? 'text-warning' : 'text-success'
                              }`} />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{alert.event}</h3>
                          </div>
                          <p className="text-muted-foreground mb-3">{alert.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {alert.location} ({alert.region})
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDate(alert.timestamp)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Satellite className="w-4 h-4" />
                                Source: {alert.source}
                              </div>
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                {formatTimeLeft(alert.expires)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-1">Impact:</p>
                            <p className="text-sm text-muted-foreground">{alert.impact}</p>
                          </div>
                          {alert.actionTaken && (
                            <div className="mt-2 p-2 bg-green-500/10 rounded-lg">
                              <p className="text-sm text-green-400">✓ Action Taken: {alert.actionTaken}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {alert.status === 'unresolved' && (
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border-destructive/20">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-destructive/20">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{alert.event}</h3>
                          </div>
                          <p className="text-muted-foreground mb-3">{alert.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {alert.location} ({alert.region})
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDate(alert.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-red-500/10 rounded-lg">
                            <p className="text-sm font-medium text-red-400 mb-1">Active Impact:</p>
                            <p className="text-sm text-muted-foreground">{alert.impact}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button className="bg-red-500 hover:bg-red-500/90">
                          Monitor Event
                        </Button>
                        <span className="text-xs text-muted-foreground text-center">
                          {formatTimeLeft(alert.expires)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Monitoring tab removed to simplify UI */}

          <TabsContent value="resolved" className="space-y-4">
            {resolvedAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border-success/20">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-success/20">
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{alert.plant}</h3>
                            <Badge variant="outline">RESOLVED</Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {alert.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(alert.timestamp)}
                            </div>
                          </div>
                          <div className="mt-2 p-2 bg-success/10 rounded-lg">
                            <p className="text-sm text-success">✓ {alert.actionTaken}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}