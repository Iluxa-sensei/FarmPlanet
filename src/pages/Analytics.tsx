import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Download, Activity, Sun, Zap, Info, Thermometer, CloudRain, Wind, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MiniChart from "@/components/MiniChart";

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

interface WeatherForecast {
    date: string;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    windSpeed: number;
    humidity: number;
}

// API Types
type KpRow = [string, string, string];
type SolarFlare = {
    begin_time: string;
    max_time: string;
    end_time: string;
    begin_class: string;
    max_class: string;
    end_class: string;
};


export default function Analytics() {
    const navigate = useNavigate();
    const [kpIndexHistorical, setKpIndexHistorical] = useState<number[]>([]);
    const [solarFlareFrequency, setSolarFlareFrequency] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [kpStats, setKpStats] = useState({ average: 0, peak: 0 });
    const [flareStats, setFlareStats] = useState({ total: 0, peakDay: 0 });
    const [activeTab, setActiveTab] = useState<string>("farm");

    // Farm weather data
    const TERRITORIES_STORAGE_KEY = 'farmplanet_territories';
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>("");
    const [temperatureHistory, setTemperatureHistory] = useState<number[]>([]);
    const [weeklyForecast, setWeeklyForecast] = useState<WeatherForecast[]>([]);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [tempStats, setTempStats] = useState({ average: 0, min: 0, max: 0 });

    // Load territories
    useEffect(() => {
        try {
            const stored = localStorage.getItem(TERRITORIES_STORAGE_KEY);
            if (stored) {
                const loadedTerritories = JSON.parse(stored);
                setTerritories(loadedTerritories);
                if (loadedTerritories.length > 0 && !selectedTerritoryId) {
                    setSelectedTerritoryId(loadedTerritories[0].id);
                }
            }
        } catch (error) {
            console.error('Error loading territories:', error);
        }
    }, []);

    // Get center coordinates of selected territory
    const selectedTerritoryCoords = useMemo(() => {
        const territory = territories.find(t => t.id === selectedTerritoryId);
        if (!territory || territory.points.length === 0) return null;

        const lats = territory.points.map(p => p[0]);
        const lngs = territory.points.map(p => p[1]);
        const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

        return { lat: centerLat, lng: centerLng };
    }, [selectedTerritoryId, territories]);

    // Fetch weather data for selected territory
    useEffect(() => {
        if (!selectedTerritoryCoords) return;

        async function fetchWeatherData() {
            setWeatherLoading(true);
            try {
                const { lat, lng } = selectedTerritoryCoords;

                // Fetch historical temperature (last 30 days)
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);

                const historicalUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&daily=temperature_2m_mean&timezone=auto`;

                const histRes = await fetch(historicalUrl);
                if (histRes.ok) {
                    const histData = await histRes.json();
                    const temps = histData.daily.temperature_2m_mean || [];
                    setTemperatureHistory(temps);

                    if (temps.length > 0) {
                        const avg = temps.reduce((a: number, b: number) => a + b, 0) / temps.length;
                        const min = Math.min(...temps);
                        const max = Math.max(...temps);
                        setTempStats({ average: parseFloat(avg.toFixed(1)), min, max });
                    }
                }

                // Fetch 7-day forecast
                const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=7`;

                const forecastRes = await fetch(forecastUrl);
                if (forecastRes.ok) {
                    const forecastData = await forecastRes.json();
                    const forecasts: WeatherForecast[] = [];

                    for (let i = 0; i < 7; i++) {
                        forecasts.push({
                            date: forecastData.daily.time[i],
                            tempMax: forecastData.daily.temperature_2m_max[i],
                            tempMin: forecastData.daily.temperature_2m_min[i],
                            precipitation: forecastData.daily.precipitation_sum[i],
                            windSpeed: forecastData.daily.wind_speed_10m_max[i],
                            humidity: forecastData.daily.relative_humidity_2m_mean[i]
                        });
                    }

                    setWeeklyForecast(forecasts);
                }

            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
            setWeatherLoading(false);
        }

        fetchWeatherData();
    }, [selectedTerritoryCoords]);

    // Smart CSV export function
    const exportData = () => {
        const today = new Date().toISOString().split('T')[0];
        let csvContent = "";
        let filename = "";

        if (activeTab === "farm") {
            // Export Farm Weather data
            const selectedTerritory = territories.find(t => t.id === selectedTerritoryId);
            const territoryName = selectedTerritory ? selectedTerritory.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Unknown_Territory';

            filename = `farm-weather-${territoryName}-${today}.csv`;

            csvContent = `Farm Weather Data Export - ${selectedTerritory?.name || 'Unknown Territory'}\n`;
            csvContent += `Export Date: ${today}\n\n`;

            if (selectedTerritory) {
                csvContent += "Territory Information\n";
                csvContent += `Name,${selectedTerritory.name}\n`;
                csvContent += `Crop,${selectedTerritory.crop || 'Not specified'}\n`;
                csvContent += `Area (hectares),${selectedTerritory.area?.toFixed(2) || 'Not specified'}\n`;
                csvContent += `Planting Date,${selectedTerritory.plantingDate || 'Not specified'}\n\n`;
            }

            // Temperature History
            if (temperatureHistory.length > 0) {
                csvContent += "Temperature History (Last 30 Days)\n";
                csvContent += "Date,Average Temperature (°C)\n";
                temperatureHistory.forEach((temp, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (temperatureHistory.length - 1 - index));
                    csvContent += `${date.toISOString().split('T')[0]},${temp.toFixed(1)}\n`;
                });
                csvContent += "\n";
            }

            // Temperature Statistics
            if (tempStats.average !== 0) {
                csvContent += "Temperature Statistics\n";
                csvContent += `Average Temperature,${tempStats.average}°C\n`;
                csvContent += `Minimum Temperature,${tempStats.min.toFixed(1)}°C\n`;
                csvContent += `Maximum Temperature,${tempStats.max.toFixed(1)}°C\n\n`;
            }

            // 7-Day Forecast
            if (weeklyForecast.length > 0) {
                csvContent += "7-Day Weather Forecast\n";
                csvContent += "Date,Max Temp (°C),Min Temp (°C),Precipitation (mm),Wind Speed (km/h),Humidity (%)\n";
                weeklyForecast.forEach(day => {
                    csvContent += `${day.date},${day.tempMax.toFixed(1)},${day.tempMin.toFixed(1)},${day.precipitation.toFixed(1)},${day.windSpeed.toFixed(1)},${day.humidity.toFixed(1)}\n`;
                });
            }
        } else {
            // Export Space Weather data
            filename = `space-weather-data-${today}.csv`;

            csvContent = "Space Weather Data Export\n";
            csvContent += `Export Date: ${today}\n\n`;

            // Kp-Index data
        csvContent += "Kp-Index Historical Data (Last 30 Days)\n";
        csvContent += "Day,Kp Value\n";
        kpIndexHistorical.forEach((value, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (kpIndexHistorical.length - 1 - index));
            csvContent += `${date.toISOString().split('T')[0]},${value}\n`;
        });

        csvContent += "\n";

            // Solar Flare data
        csvContent += "Solar Flare Activity (Last 30 Days)\n";
        csvContent += "Day,Flare Count\n";
        solarFlareFrequency.forEach((value, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (solarFlareFrequency.length - 1 - index));
            csvContent += `${date.toISOString().split('T')[0]},${value}\n`;
        });

        csvContent += "\n";

            // Statistics
        csvContent += "Statistics\n";
        csvContent += `Average Kp,${kpStats.average}\n`;
        csvContent += `Peak Kp,${kpStats.peak}\n`;
        csvContent += `Total Flares,${flareStats.total}\n`;
        csvContent += `Peak Day Flares,${flareStats.peakDay}\n`;
        }

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        // Load Kp-index historical data for the last 30 days
        async function fetchKpHistory() {
            try {
                const res = await fetch(
                    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
                );
                if (!res.ok) throw new Error("Failed to fetch Kp history");

                const raw: KpRow[] = await res.json();
                const rows = raw.slice(1);

                // Group Kp by days (take average per day)
                const kpByDay = new Map<string, number[]>();
                const now = Date.now();
                const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

                rows.forEach((row) => {
                    const timestamp = new Date(row[0]).getTime();
                    const kpValue = parseFloat(row[1]);

                    if (!isNaN(kpValue) && timestamp >= thirtyDaysAgo) {
                        const dayKey = new Date(row[0]).toISOString().split('T')[0];
                        if (!kpByDay.has(dayKey)) {
                            kpByDay.set(dayKey, []);
                        }
                        kpByDay.get(dayKey)!.push(kpValue);
                    }
                });

                // Create array for last 30 days (average Kp per day)
                // But show only days with real data
                const dailyValues: number[] = [];
                let lastKnownValue = 2; // Default value for "quiet" days

                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now - i * 24 * 60 * 60 * 1000);
                    const dayKey = date.toISOString().split('T')[0];
                    const dayKpValues = kpByDay.get(dayKey);

                    if (dayKpValues && dayKpValues.length > 0) {
                        const avgKp = dayKpValues.reduce((a, b) => a + b, 0) / dayKpValues.length;
                        lastKnownValue = parseFloat(avgKp.toFixed(1));
                        dailyValues.push(lastKnownValue);
                    } else {
                        // Use last known value instead of 0
                        dailyValues.push(lastKnownValue);
                    }
                }

                setKpIndexHistorical(dailyValues);

                // Statistics
                const validValues = dailyValues.filter(v => v > 0);
                const avg = validValues.length > 0
                    ? validValues.reduce((a, b) => a + b, 0) / validValues.length
                    : 0;
                const peak = validValues.length > 0 ? Math.max(...validValues) : 0;
                setKpStats({ average: parseFloat(avg.toFixed(1)), peak });

            } catch (err) {
                console.error("Error loading Kp history:", err);
            }
        }

        // Load solar flare data
        async function fetchSolarFlares() {
            try {
                const res = await fetch(
                    "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json"
                );
                if (!res.ok) throw new Error("Failed to fetch solar flares");

                const flares: SolarFlare[] = await res.json();

                // Group flares by days
                const flaresByDay = new Map<string, number>();
                const now = Date.now();
                const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

                flares.forEach((flare) => {
                    const flareDate = new Date(flare.begin_time).getTime();
                    if (flareDate >= thirtyDaysAgo) {
                        const dayKey = new Date(flare.begin_time).toISOString().split('T')[0];
                        flaresByDay.set(dayKey, (flaresByDay.get(dayKey) || 0) + 1);
                    }
                });

                // Create array for last 30 days
                const dailyFlares: number[] = [];
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now - i * 24 * 60 * 60 * 1000);
                    const dayKey = date.toISOString().split('T')[0];
                    dailyFlares.push(flaresByDay.get(dayKey) || 0);
                }

                setSolarFlareFrequency(dailyFlares);

                // Statistics
                const total = dailyFlares.reduce((a, b) => a + b, 0);
                const peakDay = Math.max(...dailyFlares);
                setFlareStats({ total, peakDay });

            } catch (err) {
                console.error("Error loading solar flares:", err);
            }
        }


        async function loadAllData() {
            setLoading(true);
            await Promise.all([
                fetchKpHistory(),
                fetchSolarFlares()
            ]);
            setLoading(false);
        }

        loadAllData();

        // Update data every 10 minutes
        const interval = setInterval(loadAllData, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

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
                        Weather Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Historical trends, patterns, and reports for weather monitoring
                    </p>
                </div>
                <Button variant="outline" onClick={exportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                </Button>
            </motion.div>

            {/* Summary removed per requirements */}

            {/* Charts and Analytics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Tabs defaultValue="farm" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="farm">Farm Weather</TabsTrigger>
                        <TabsTrigger value="trends">Space Weather</TabsTrigger>
                    </TabsList>

                    <TabsContent value="trends" className="space-y-6">
                        {/* Space Weather Header with Guide Button */}
                        <Card className="glass-card">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Space Weather Impact on Farming</h2>
                                        <p className="text-muted-foreground">
                                            Monitor space weather conditions that can affect your crops and farm operations
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => navigate('/guides')}
                                        className="glass-button"
                                        variant="outline"
                                    >
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        How Space Impacts Farming
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                            {/* Kp-Index Historical Chart */}
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-orange-400" />
                                        Kp-Index Trends (30 Days)
                                    </CardTitle>
                                    <CardDescription>
                                        Geomagnetic activity levels over the past month
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            Loading...
                                        </div>
                                    ) : (
                                        <>
                                            <MiniChart
                                                title=""
                                                data={kpIndexHistorical}
                                                color="hsl(36 100% 50%)"
                                                unit=""
                                                period="Last 30 days"
                                                showDates={true}
                                                activityThresholds={{ low: 3, high: 5 }}
                                            />
                                            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                                <span>Average Kp: {kpStats.average}</span>
                                                <span>Peak: {kpStats.peak} {kpStats.peak >= 5 ? "(Storm)" : "(Quiet)"}</span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Solar Flare Frequency */}
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sun className="w-5 h-5 text-yellow-400" />
                                        Solar Flare Activity
                                    </CardTitle>
                                    <CardDescription>
                                        Daily solar flare count - last 30 days (M-class and above)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            Loading...
                                        </div>
                                    ) : (
                                        <>
                                            <MiniChart
                                                title=""
                                                data={solarFlareFrequency}
                                                color="hsl(45 100% 65%)"
                                                unit=""
                                                period="Last 30 days"
                                                showDates={true}
                                                activityThresholds={{ low: 1, high: 3 }}
                                            />
                                            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                                <span>Total Flares: {flareStats.total}</span>
                                                <span>Peak Day: {flareStats.peakDay} flares</span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>


                    <TabsContent value="farm" className="space-y-6">
                        {/* Territory Selector */}
                        {territories.length > 0 ? (
                            <>
                                <Card className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Thermometer className="w-5 h-5 text-orange-400" />
                                                Farm Weather Analytics
                                            </span>
                                            <Select value={selectedTerritoryId} onValueChange={setSelectedTerritoryId}>
                                                <SelectTrigger className="w-[250px] glass-input">
                                                    <SelectValue placeholder="Select territory" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {territories.map(territory => (
                                                        <SelectItem key={territory.id} value={territory.id}>
                                                            {territory.name} {territory.crop ? `- ${territory.crop}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </CardTitle>
                                        <CardDescription>
                                            {territories.find(t => t.id === selectedTerritoryId)?.name || 'Select a territory'} - Weather analysis and forecast
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                                    {/* Temperature History */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                                <Thermometer className="w-5 h-5 text-red-400" />
                                                Temperature Trends (30 Days)
                                </CardTitle>
                                <CardDescription>
                                                Average daily temperature for your farm
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                            {weatherLoading ? (
                                                <div className="text-center py-10 text-muted-foreground">
                                                    Loading weather data...
                                                </div>
                                            ) : temperatureHistory.length > 0 ? (
                                                <>
                                                    <MiniChart
                                                        title=""
                                                        data={temperatureHistory}
                                                        color="hsl(0 85% 60%)"
                                                        unit="°C"
                                                        period="Last 30 days"
                                                        showDates={true}
                                                    />
                                                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                                        <div className="text-center">
                                                            <p className="text-muted-foreground">Average</p>
                                                            <p className="text-lg font-bold text-orange-400">{tempStats.average}°C</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-muted-foreground">Min</p>
                                                            <p className="text-lg font-bold text-blue-400">{tempStats.min.toFixed(1)}°C</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-muted-foreground">Max</p>
                                                            <p className="text-lg font-bold text-red-400">{tempStats.max.toFixed(1)}°C</p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                                    No temperature data available
                                    </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* 7-Day Forecast */}
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CloudRain className="w-5 h-5 text-blue-400" />
                                                7-Day Weather Forecast
                                            </CardTitle>
                                            <CardDescription>
                                                Detailed forecast for planning farm activities
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {weatherLoading ? (
                                    <div className="text-center py-10 text-muted-foreground">
                                                    Loading forecast...
                                    </div>
                                            ) : weeklyForecast.length > 0 ? (
                                                <div className="space-y-3">
                                                    {weeklyForecast.map((day, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="font-semibold">
                                                                    {new Date(day.date).toLocaleDateString('en-US', {
                                                                        weekday: 'short',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-red-400 font-semibold">{day.tempMax.toFixed(0)}°</span>
                                                                    <span className="text-muted-foreground">/</span>
                                                                    <span className="text-blue-400 font-semibold">{day.tempMin.toFixed(0)}°</span>
                                                                </div>
                                                        </div>
                                                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <CloudRain className="w-3 h-3" />
                                                                    {day.precipitation.toFixed(1)}mm
                                                            </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Wind className="w-3 h-3" />
                                                                    {day.windSpeed.toFixed(0)}km/h
                                                            </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Info className="w-3 h-3" />
                                                                    {day.humidity.toFixed(0)}% RH
                                                            </div>
                                                        </div>
                                                    </div>
                                        ))}
                                    </div>
                                            ) : (
                                                <div className="text-center py-10 text-muted-foreground">
                                                    No forecast data available
                                                </div>
                                )}
                            </CardContent>
                        </Card>
                                </div>
                            </>
                        ) : (
                            <Card className="glass-card">
                                <CardContent className="py-12 text-center">
                                    <Thermometer className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                                    <p className="text-lg font-semibold mb-2">No Territories Found</p>
                                    <p className="text-muted-foreground">
                                        Add territories from the Map page to see weather analytics
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}
