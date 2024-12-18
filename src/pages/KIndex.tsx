import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Info } from "lucide-react";
import MiniChart from "@/components/MiniChart";

// Тип строки из NOAA API
type KpRow = [string, string, string]; // [time_tag, kp_index, source]
type ForecastRow = [string, string, string, string]; // [time_tag, kp, observed, noaa_scale]
type SolarWindPlasmaRow = [string, string, string, string]; // [time_tag, density, speed, temperature]
type XRayRow = {
    time_tag: string;
    satellite: number;
    flux: number;
    observed_flux: number;
    electron_correction: number;
    electron_contaminaton: boolean;
    energy: string;
};

function kpColor(value: number) {
    if (value <= 3) return "text-green-400";
    if (value <= 5) return "text-yellow-400";
    return "text-red-400";
}

interface ForecastItem {
    date: string;
    min: number;
    max: number;
}

export default function KIndex() {
    const navigate = useNavigate();
    const [currentKp, setCurrentKp] = useState<number | null>(null);
    const [kpHistory24h, setKpHistory24h] = useState<number[]>([]);
    const [solarWindSpeed, setSolarWindSpeed] = useState<number | null>(null);
    const [solarWindHistory, setSolarWindHistory] = useState<number[]>([]);
    const [xRayFlux, setXRayFlux] = useState<string>("");
    const [xRayClass, setXRayClass] = useState<string>("A");
    const [forecast, setForecast] = useState<ForecastItem[]>([
        { date: "Today", min: 3, max: 5 },
        { date: "Tomorrow", min: 2, max: 4 },
        { date: "+2 days", min: 1, max: 3 },
        { date: "+3 days", min: 2, max: 5 },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchKp() {
            try {
                const res = await fetch(
                    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
                );
                if (!res.ok) throw new Error("Failed to fetch Kp index");

                const raw: KpRow[] = await res.json();

                // Первая строка — заголовки, убираем
                const rows = raw.slice(1);

                // Забираем только значения Kp
                const values = rows.map((r) => parseFloat(r[1]));

                // Последние 8 точек = 24 часа (каждая по 3 часа)
                const last24 = values.slice(-8);

                const current = last24[last24.length - 1];

                setKpHistory24h(last24);
                setCurrentKp(current);
                setLoading(false);
            } catch (err) {
                console.error("Error loading Kp:", err);
                setLoading(false);
            }
        }

        async function fetchForecast() {
            try {
                const res = await fetch(
                    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json"
                );
                if (!res.ok) throw new Error("Failed to fetch forecast");

                const raw: ForecastRow[] = await res.json();
                const rows = raw.slice(1); // Убираем заголовки

                // Группируем по дням
                const dayGroups = new Map<string, number[]>();

                rows.forEach((row) => {
                    const date = new Date(row[0]);
                    const kp = parseFloat(row[1]);
                    if (isNaN(kp)) return;

                    const dayKey = date.toISOString().split('T')[0];
                    if (!dayGroups.has(dayKey)) {
                        dayGroups.set(dayKey, []);
                    }
                    dayGroups.get(dayKey)!.push(kp);
                });

                // Берём первые 4 дня для прогноза
                const sortedDays = Array.from(dayGroups.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(0, 4);

                const labels = ["Today", "Tomorrow", "+2 days", "+3 days"];
                const forecastData: ForecastItem[] = sortedDays.map(([_, values], idx) => ({
                    date: labels[idx] || `+${idx} days`,
                    min: Math.round(Math.min(...values)),
                    max: Math.round(Math.max(...values)),
                }));

                if (forecastData.length > 0) {
                    setForecast(forecastData);
                }
            } catch (err) {
                console.error("Error loading forecast:", err);
            }
        }

        async function fetchSolarWind() {
            try {
                const res = await fetch(
                    "https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json"
                );
                if (!res.ok) throw new Error("Failed to fetch solar wind");

                const raw: SolarWindPlasmaRow[] = await res.json();
                const rows = raw.slice(1); // Убираем заголовки

                // Берём последние 24 точки (по одной в час)
                const last24Hours = rows.slice(-24);
                const speeds = last24Hours
                    .map((r) => parseFloat(r[2]))
                    .filter((v) => !isNaN(v) && v > 0);

                if (speeds.length > 0) {
                    setSolarWindSpeed(speeds[speeds.length - 1]);
                    setSolarWindHistory(speeds);
                }
            } catch (err) {
                console.error("Error loading solar wind:", err);
            }
        }

        async function fetchXRay() {
            try {
                const res = await fetch(
                    "https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json"
                );
                if (!res.ok) throw new Error("Failed to fetch X-ray data");

                const data: XRayRow[] = await res.json();

                // Берём последнее значение для длинноволнового канала (0.1-0.8 nm)
                const longWave = data
                    .filter((d) => d.energy === "0.1-0.8nm")
                    .sort((a, b) => new Date(b.time_tag).getTime() - new Date(a.time_tag).getTime());

                if (longWave.length > 0) {
                    const flux = longWave[0].flux;

                    // Определяем класс вспышки
                    let flareClass = "A";
                    let flareValue = 0;

                    if (flux < 1e-8) {
                        flareClass = "A";
                        flareValue = flux * 1e8;
                    } else if (flux < 1e-7) {
                        flareClass = "B";
                        flareValue = flux * 1e7;
                    } else if (flux < 1e-6) {
                        flareClass = "C";
                        flareValue = flux * 1e6;
                    } else if (flux < 1e-5) {
                        flareClass = "M";
                        flareValue = flux * 1e5;
                    } else {
                        flareClass = "X";
                        flareValue = flux * 1e4;
                    }

                    setXRayFlux(flareValue.toFixed(1));
                    setXRayClass(flareClass);
                }
            } catch (err) {
                console.error("Error loading X-ray data:", err);
            }
        }

        fetchKp();
        fetchForecast();
        fetchSolarWind();
        fetchXRay();
        const interval = setInterval(() => {
            fetchKp();
            fetchForecast();
            fetchSolarWind();
            fetchXRay();
        }, 60_000); // Обновление каждую минуту
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    K-Index Monitor
                </h1>
                <p className="text-muted-foreground">
                    Geomagnetic activity data and space weather information
                </p>
            </motion.div>

            {/* Current Kp Gauge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Current Kp</CardTitle>
                            <CardDescription>Geomagnetic activity index</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="glass-button"
                            onClick={() => navigate('/guides')}
                        >
                            <Info className="w-4 h-4 mr-2" />
                            Learn More
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-10 text-muted-foreground">
                                Loading...
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-center py-6">
                                    {/* SVG semicircle gauge */}
                                    <svg width="320" height="180" viewBox="0 0 320 180">
                                        <defs>
                                            <linearGradient id="kpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#22c55e" />
                                                <stop offset="50%" stopColor="#facc15" />
                                                <stop offset="100%" stopColor="#ef4444" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M20 160 A140 140 0 0 1 300 160" fill="none" stroke="url(#kpGrad)" strokeWidth="18" strokeLinecap="round" />
                                        {currentKp !== null && (() => {
                                            const angle = (-180 + (currentKp / 9) * 180) * (Math.PI / 180);
                                            const cx = 160, cy = 160, r = 115;
                                            const x = cx + r * Math.cos(angle);
                                            const y = cy + r * Math.sin(angle);
                                            return (
                                                <g>
                                                    <line x1={cx} y1={cy} x2={x} y2={y} stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                                                    <circle cx={cx} cy={cy} r="6" fill="#94a3b8" />
                                                </g>
                                            );
                                        })()}
                                        {/* Ticks and Labels */}
                                        {Array.from({ length: 10 }).map((_, i) => {
                                            const angle = (-180 + (i / 9) * 180) * (Math.PI / 180);
                                            const cx = 160, cy = 160, r1 = 130, r2 = 140, r3 = 155;
                                            const x1 = cx + r1 * Math.cos(angle);
                                            const y1 = cy + r1 * Math.sin(angle);
                                            const x2 = cx + r2 * Math.cos(angle);
                                            const y2 = cy + r2 * Math.sin(angle);
                                            const x3 = cx + r3 * Math.cos(angle);
                                            const y3 = cy + r3 * Math.sin(angle);
                                            return (
                                                <g key={i}>
                                                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="2" />
                                                    <text
                                                        x={x3}
                                                        y={y3}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="text-[10px] fill-muted-foreground font-medium"
                                                    >
                                                        {i}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <div className={`text-6xl font-bold ${kpColor(currentKp ?? 0)}`}>{currentKp}</div>
                                    <div className="text-sm text-muted-foreground mt-1">0 (quiet) – 9 (extreme)</div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Forecast + 24h history */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Forecast</CardTitle>
                            <CardDescription>Today and next 2–3 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-muted-foreground">
                                            <th className="text-left font-medium pb-2">Date</th>
                                            <th className="text-left font-medium pb-2">Min Kp</th>
                                            <th className="text-left font-medium pb-2">Max Kp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forecast.map((row) => (
                                            <tr key={row.date} className="border-t border-border/50">
                                                <td className="py-2 pr-4">{row.date}</td>
                                                <td
                                                    className={`py-2 pr-4 font-semibold ${kpColor(
                                                        row.min
                                                    )}`}
                                                >
                                                    {row.min}
                                                </td>
                                                <td
                                                    className={`py-2 pr-4 font-semibold ${kpColor(
                                                        row.max
                                                    )}`}
                                                >
                                                    {row.max}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Last 24h Kp</CardTitle>
                            <CardDescription>Real-time history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    Loading...
                                </div>
                            ) : (
                                <MiniChart title="" data={kpHistory24h} color="hsl(36 100% 50%)" unit="" period="Last 24 hours" />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Solar Wind Speed & X-Ray Flux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                {/* Solar Wind Speed */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Solar Wind Speed</CardTitle>
                                <CardDescription>Current speed and 24h history</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="glass-button"
                                onClick={() => navigate('/guides')}
                            >
                                <Info className="w-4 h-4 mr-2" />
                                Learn More
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    Loading...
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-4">
                                        <div className="text-5xl font-bold text-cyan-400">
                                            {solarWindSpeed ? Math.round(solarWindSpeed) : "—"}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">km/s</div>
                                    </div>
                                    {solarWindHistory.length > 0 && (
                                        <MiniChart
                                            title=""
                                            data={solarWindHistory}
                                            color="hsl(180 100% 50%)"
                                            unit=" km/s"
                                            period="Last 24 hours"
                                        />
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* X-Ray Flux */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>X-Ray Flux</CardTitle>
                                <CardDescription>Current solar X-ray activity</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="glass-button"
                                onClick={() => navigate('/guides')}
                            >
                                <Info className="w-4 h-4 mr-2" />
                                Learn More
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    Loading...
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl font-bold mb-2">
                                        <span className={
                                            xRayClass === "X" ? "text-red-500" :
                                                xRayClass === "M" ? "text-orange-400" :
                                                    xRayClass === "C" ? "text-yellow-400" :
                                                        xRayClass === "B" ? "text-green-400" :
                                                            "text-gray-400"
                                        }>
                                            {xRayClass}{xRayFlux}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-4">Flare Class</div>
                                    <div className="grid grid-cols-5 gap-2 text-xs max-w-md mx-auto">
                                        <div className="text-center">
                                            <div className="text-gray-400 font-bold">A</div>
                                            <div className="text-muted-foreground">Quiet</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-green-400 font-bold">B</div>
                                            <div className="text-muted-foreground">Low</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-yellow-400 font-bold">C</div>
                                            <div className="text-muted-foreground">Moderate</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-orange-400 font-bold">M</div>
                                            <div className="text-muted-foreground">Strong</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-red-500 font-bold">X</div>
                                            <div className="text-muted-foreground">Extreme</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}


