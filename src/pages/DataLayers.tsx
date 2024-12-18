import { motion } from "framer-motion";
import {
    Layers,
    TrendingUp,
    Activity,
    Sun,
    Globe,
    Thermometer,
    Wind,
    Eye,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function DataLayers() {
    const [enabledLayers, setEnabledLayers] = useState({
        kpIndex: true,
        auroralOval: true,
        tempo: false,
        solarWind: true,
        magnetosphere: false
    });

    const toggleLayer = (layer: keyof typeof enabledLayers) => {
        setEnabledLayers(prev => ({
            ...prev,
            [layer]: !prev[layer]
        }));
    };

    const dataLayers = [
        {
            id: 'kpIndex',
            title: 'Kp-Index Heatmap',
            description: 'Real-time geomagnetic activity levels across the globe',
            icon: Activity,
            color: 'text-orange-400',
            status: 'Active',
            coverage: 'Global',
            updateInterval: '3 hours'
        },
        {
            id: 'auroralOval',
            title: 'Auroral Oval',
            description: 'Live aurora visibility zones with intensity mapping',
            icon: Eye,
            color: 'text-cyan-400',
            status: 'Active',
            coverage: 'Polar Regions',
            updateInterval: '15 minutes'
        },
        {
            id: 'tempo',
            title: 'NASA TEMPO Data',
            description: 'Atmospheric temperature and air quality measurements',
            icon: Thermometer,
            color: 'text-green-400',
            status: 'Beta',
            coverage: 'North America',
            updateInterval: '1 hour'
        },
        {
            id: 'solarWind',
            title: 'Solar Wind Speed',
            description: 'Real-time solar wind velocity and density data',
            icon: Wind,
            color: 'text-yellow-400',
            status: 'Active',
            coverage: 'Earth Vicinity',
            updateInterval: '5 minutes'
        },
        {
            id: 'magnetosphere',
            title: 'Magnetosphere Distortion',
            description: 'Earth\'s magnetic field compression and disturbance levels',
            icon: Globe,
            color: 'text-purple-400',
            status: 'Coming Soon',
            coverage: 'Earth System',
            updateInterval: '30 minutes'
        }
    ];

    return (
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Data Layers
                </h1>
                <p className="text-muted-foreground">
                    Configure and manage space weather data visualization layers
                </p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="glass-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Layers</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {Object.values(enabledLayers).filter(Boolean).length}
                                    </p>
                                </div>
                                <Layers className="w-8 h-8 text-primary/60" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="glass-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Data Sources</p>
                                    <p className="text-2xl font-bold text-accent">5</p>
                                </div>
                                <Sun className="w-8 h-8 text-accent/60" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="glass-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Update Rate</p>
                                    <p className="text-2xl font-bold text-green-400">Live</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-400/60" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="glass-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Coverage</p>
                                    <p className="text-2xl font-bold text-cyan-400">Global</p>
                                </div>
                                <Globe className="w-8 h-8 text-cyan-400/60" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Data Layers List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Available Data Layers
                        </CardTitle>
                        <CardDescription>
                            Toggle data layers on/off and configure their display settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {dataLayers.map((layer, index) => (
                            <motion.div
                                key={layer.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-muted/50`}>
                                        <layer.icon className={`w-5 h-5 ${layer.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">{layer.title}</h3>
                                            <Badge
                                                variant={layer.status === 'Active' ? 'default' :
                                                    layer.status === 'Beta' ? 'secondary' : 'outline'}
                                                className="text-xs"
                                            >
                                                {layer.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{layer.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>Coverage: {layer.coverage}</span>
                                            <span>Updates: {layer.updateInterval}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={enabledLayers[layer.id as keyof typeof enabledLayers]}
                                        onCheckedChange={() => toggleLayer(layer.id as keyof typeof enabledLayers)}
                                        disabled={layer.status === 'Coming Soon'}
                                    />
                                    <Button variant="outline" size="sm" disabled={layer.status === 'Coming Soon'}>
                                        Configure
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Layer Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Display Settings</CardTitle>
                            <CardDescription>
                                Control how data layers appear on the map
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Layer Opacity</span>
                                <span className="text-sm text-muted-foreground">75%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Animation Speed</span>
                                <span className="text-sm text-muted-foreground">Normal</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Auto-refresh</span>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Data Sources</CardTitle>
                            <CardDescription>
                                Information about data providers and update frequencies
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm">
                                <div className="font-medium mb-1">NOAA Space Weather Prediction Center</div>
                                <div className="text-muted-foreground">Kp-index, Solar Wind, Magnetosphere</div>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium mb-1">NASA TEMPO Mission</div>
                                <div className="text-muted-foreground">Atmospheric composition and air quality</div>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium mb-1">SWPC Aurora Forecast</div>
                                <div className="text-muted-foreground">Real-time auroral oval predictions</div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

