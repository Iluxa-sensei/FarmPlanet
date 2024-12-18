import { motion } from "framer-motion";
import { Info, Activity, Sun, Zap, Shield, Radio, Satellite, Globe, Eye, Heart, Lightbulb, Sprout, TrendingUp, MapPin, Smartphone, Plane, CheckCircle, AlertTriangle, AlertCircle, Calendar, Wifi, Telescope, Tractor, Droplets, BarChart3, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Guides() {
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
            FarmPlanet Guides
          </h1>
          <p className="text-muted-foreground">
            Learn about vegetation monitoring, NDVI, and space weather data for agriculture
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="ndvi-guide" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ndvi-guide">
              <Sprout className="w-4 h-4 mr-2" />
              NDVI Guide
            </TabsTrigger>
            <TabsTrigger value="kp-guide">
              <Activity className="w-4 h-4 mr-2" />
              K-Index
            </TabsTrigger>
            <TabsTrigger value="solar-wind">
              <Sun className="w-4 h-4 mr-2" />
              Solar Data
            </TabsTrigger>
            <TabsTrigger value="impact">
              <Shield className="w-4 h-4 mr-2" />
              Impact
            </TabsTrigger>
          </TabsList>

          {/* NDVI Guide Tab */}
          <TabsContent value="ndvi-guide" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
              {/* What is NDVI */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-primary" />
                    What is NDVI?
                  </CardTitle>
                  <CardDescription>Normalized Difference Vegetation Index</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    NDVI is a numerical indicator that uses the visible and near-infrared bands of the electromagnetic spectrum to analyze remote sensing measurements.
                  </p>
                  <p>
                    <strong>Formula:</strong> NDVI = (NIR - Red) / (NIR + Red)
                  </p>
                  <p>
                    Where NIR is Near-Infrared light reflected by vegetation and Red is visible red light absorbed by chlorophyll.
                  </p>
                  <p>
                    NDVI values range from -1 to +1, where higher values indicate healthier, denser vegetation.
                  </p>
                </CardContent>
              </Card>

              {/* NDVI Scale */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    NDVI Value Scale
                  </CardTitle>
                  <CardDescription>Understanding NDVI ranges</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">-1.0 to 0.0</span>
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Water
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Water bodies, snow, ice, clouds</p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="font-medium">0.0 to 0.2</span>
                      <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        Barren
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Rocks, sand, bare soil, urban areas</p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="font-medium">0.2 to 0.5</span>
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Sparse
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Grasslands, shrubs, senescing crops</p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="font-medium">0.5 to 0.7</span>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Moderate
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Healthy crops, moderate forest</p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="font-medium">0.7 to 1.0</span>
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Dense
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Dense vegetation, tropical forests, peak crop growth</p>
                  </div>
                </CardContent>
              </Card>

              {/* Agricultural Applications */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-primary" />
                    Agricultural Uses
                  </CardTitle>
                  <CardDescription>How farmers use NDVI</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <div>
                    <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-primary" /> Crop Health Monitoring
                    </p>
                    <p>Track vegetation vigor throughout growing season. Detect stress before visible to naked eye.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-primary" /> Irrigation Management
                    </p>
                    <p>Identify areas with water stress. Optimize irrigation schedules and water usage.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" /> Yield Prediction
                    </p>
                    <p>Estimate crop yields before harvest. Plan logistics and market strategies.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" /> Precision Agriculture
                    </p>
                    <p>Variable rate application of fertilizers. Target specific areas needing attention.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Sources Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-primary" />
                  NDVI Data Sources
                </CardTitle>
                <CardDescription>NASA and ESA satellite missions providing NDVI data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        MODIS (Terra & Aqua)
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Resolution:</strong> 250m, 500m, 1km
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Frequency:</strong> Daily (2 satellites)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Best for: Large-scale monitoring, global vegetation trends, daily updates
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Sentinel-2 (ESA)
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Resolution:</strong> 10m, 20m
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Frequency:</strong> Every 5 days (2 satellites)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Best for: Individual field analysis, precision agriculture, detailed crop monitoring
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Landsat 8/9
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Resolution:</strong> 30m
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Frequency:</strong> Every 8 days (combined)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Best for: Long-term historical analysis (40+ years), medium-scale monitoring
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        VIIRS (NOAA)
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Resolution:</strong> 375m, 750m
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Frequency:</strong> Daily
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Best for: Regional monitoring, weather-adjusted vegetation indices
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interpretation Tips */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Interpretation Tips
                </CardTitle>
                <CardDescription>How to read NDVI values for your crops</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 text-sm">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Good Signs (NDVI 0.6-0.8+)
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Dense, healthy green canopy</li>
                        <li>• Active photosynthesis</li>
                        <li>• Adequate water and nutrients</li>
                        <li>• Expected growth stage development</li>
                        <li>• Uniform values across field</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Watch Carefully (NDVI 0.4-0.6)
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Early growth stages (normal)</li>
                        <li>• Possible water stress developing</li>
                        <li>• Check for nutrient deficiencies</li>
                        <li>• Monitor pest/disease emergence</li>
                        <li>• Consider increasing irrigation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Action Needed (NDVI &lt; 0.4)
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Severe water stress</li>
                        <li>• Nutrient deficiency (N, P, K)</li>
                        <li>• Disease or pest infestation</li>
                        <li>• Soil compaction issues</li>
                        <li>• Immediate intervention required</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Seasonal Patterns
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Spring: Rising from 0.2 to 0.6+</li>
                        <li>• Summer: Peak 0.7-0.9 (healthy crops)</li>
                        <li>• Fall: Declining to 0.3-0.5 (senescence)</li>
                        <li>• Winter: Low 0.1-0.3 (dormant/bare)</li>
                        <li>• Track trends, not just single values</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kp Guide Tab */}
          <TabsContent value="kp-guide" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
              {/* What is Kp */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    What is Kp?
                  </CardTitle>
                  <CardDescription>Planetary index of geomagnetic activity (0–9)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Global index derived from ground magnetometers worldwide; 3‑hour cadence and quasi‑logarithmic scale.</p>
                  <p>Preliminary Kp from NOAA SWPC updates every 3 hours using near real‑time stations.</p>
                </CardContent>
              </Card>

              {/* Scale quick reference */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Kp Scale (quick)</CardTitle>
                  <CardDescription>Value • NOAA G‑scale • Typical description</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Kp 0–2</span><span className="text-green-400">G0 • Quiet</span></div>
                    <div className="flex justify-between"><span>Kp 3</span><span className="text-green-400">G0 • Unsettled</span></div>
                    <div className="flex justify-between"><span>Kp 4</span><span className="text-yellow-400">G0 • Active</span></div>
                    <div className="flex justify-between"><span>Kp 5</span><span className="text-yellow-400">G1 • Minor storm</span></div>
                    <div className="flex justify-between"><span>Kp 6</span><span className="text-yellow-400">G2 • Moderate storm</span></div>
                    <div className="flex justify-between"><span>Kp 7</span><span className="text-red-400">G3 • Strong storm</span></div>
                    <div className="flex justify-between"><span>Kp 8</span><span className="text-red-400">G4 • Severe storm</span></div>
                    <div className="flex justify-between"><span>Kp 9</span><span className="text-red-400">G5 • Extreme storm</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* Aurora latitude hints */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    Aurora Visibility
                  </CardTitle>
                  <CardDescription>Lower latitude limit at midnight</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between"><span>Kp 5</span><span>~56° geomagnetic</span></div>
                  <div className="flex justify-between"><span>Kp 6</span><span>~54° geomagnetic</span></div>
                  <div className="flex justify-between"><span>Kp 7</span><span>~52° geomagnetic</span></div>
                  <div className="flex justify-between"><span>Kp 8</span><span>~50° geomagnetic</span></div>
                  <div className="flex justify-between"><span>Kp 9</span><span>≤48° geomagnetic</span></div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Impacts by Kp band</CardTitle>
                <CardDescription>Short, practical guidance</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-muted/20">
                  <h4 className="font-semibold mb-2 text-green-400">Kp 0–2</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Quiet geomagnetic conditions</li>
                    <li>Aurora confined to high latitudes</li>
                    <li>No significant impacts</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/20">
                  <h4 className="font-semibold mb-2 text-yellow-400">Kp 3–5</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Active to minor storm levels</li>
                    <li>Possible aurora at mid‑high latitudes</li>
                    <li>Minor satellite operations impact</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/20">
                  <h4 className="font-semibold mb-2 text-red-400">Kp ≥6</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Moderate to extreme storms</li>
                    <li>Power grid, satellites, HF/GNSS disruptions</li>
                    <li>Aurora visible at low latitudes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Solar Wind & Activity Tab */}
          <TabsContent value="solar-wind" className="space-y-6">
            {/* Solar Wind Basics */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-400" />
                  What is Solar Wind?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Solar wind is a stream of charged particles (plasma) released from the Sun's upper atmosphere.
                  It carries magnetic fields and travels at speeds of 300-800 km/s, reaching Earth in 1-5 days.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-cyan-500/10">
                    <h4 className="font-semibold text-cyan-400 mb-2">Normal Speed</h4>
                    <p className="text-2xl font-bold text-cyan-400">300-500 km/s</p>
                    <p className="text-sm text-muted-foreground mt-2">Typical solar wind conditions, minimal impact</p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-500/10">
                    <h4 className="font-semibold text-orange-400 mb-2">High Speed</h4>
                    <p className="text-2xl font-bold text-orange-400">500-800+ km/s</p>
                    <p className="text-sm text-muted-foreground mt-2">Can trigger geomagnetic storms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* X-Ray Flares */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  Solar Flares Classification
                </CardTitle>
                <CardDescription>X-ray intensity from the Sun</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <motion.div
                    className="p-4 rounded-lg bg-gray-500/10 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-bold text-gray-400 mb-2">A</div>
                    <Badge variant="outline" className="mb-2">Background</Badge>
                    <p className="text-xs text-muted-foreground">Minimal impact</p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-green-500/10 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-bold text-green-400 mb-2">B</div>
                    <Badge variant="outline" className="mb-2">Small</Badge>
                    <p className="text-xs text-muted-foreground">No noticeable impact</p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-yellow-500/10 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-bold text-yellow-400 mb-2">C</div>
                    <Badge variant="outline" className="mb-2">Common</Badge>
                    <p className="text-xs text-muted-foreground">Minor radio effects</p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-orange-500/10 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-bold text-orange-400 mb-2">M</div>
                    <Badge variant="destructive" className="mb-2">Medium</Badge>
                    <p className="text-xs text-muted-foreground">Radio blackouts</p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-red-500/10 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-bold text-red-400 mb-2">X</div>
                    <Badge variant="destructive" className="mb-2">Intense</Badge>
                    <p className="text-xs text-muted-foreground">Major impacts</p>
                  </motion.div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Each class is 10x more powerful than the previous.
                    M5 flare is 5 times stronger than M1, X1 is 10 times stronger than M1.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impact on Earth Tab - Agriculture Focus */}
          <TabsContent value="impact" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-primary" />
                  Why Space Weather Matters for Agriculture
                </CardTitle>
                <CardDescription>Understanding the connection between K-Index and modern farming</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-foreground font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Many ask: "How is space weather related to farming?"
                  </p>
                  <p className="text-muted-foreground">
                    Modern precision agriculture relies heavily on space-based technology. K-Index and solar activity directly affect
                    the satellites, GPS systems, and communication networks that farmers use every day. Monitoring space weather
                    helps farmers anticipate potential disruptions to their high-tech farming operations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Direct Impacts on Agriculture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Satellite className="w-5 h-5 text-primary" />
                      Satellite Data for Farming
                    </CardTitle>
                    <CardDescription>How space weather affects vegetation monitoring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <Satellite className="w-4 h-4" /> NDVI Data Collection
                      </h4>
                      <p className="text-muted-foreground">
                        <strong>MODIS, Sentinel-2, Landsat</strong> provide NDVI data. During K≥6 storms, satellite electronics can malfunction,
                        causing data gaps or corrupted vegetation indices. This affects crop health monitoring.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <Radio className="w-4 h-4" /> Data Transmission
                      </h4>
                      <p className="text-muted-foreground">
                        Satellite-to-ground communication disrupted during solar flares. Real-time NDVI updates may be delayed
                        by hours or days, affecting time-sensitive farming decisions.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <Telescope className="w-4 h-4" /> Orbital Changes
                      </h4>
                      <p className="text-muted-foreground">
                        Strong geomagnetic storms cause atmospheric expansion, increasing satellite drag. This affects satellite
                        positioning and timing of data collection passes over your fields.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-orange-400" />
                      Precision Agriculture Systems
                    </CardTitle>
                    <CardDescription>GPS and automated equipment impacts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> GPS Accuracy Loss
                      </h4>
                      <p className="text-muted-foreground">
                        During K≥5 storms, GPS accuracy drops from <strong>2-5cm to 10-100 meters</strong>. This is critical for:
                        auto-steering tractors, variable rate fertilizer application, and precision planting systems.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                        <Tractor className="w-4 h-4" /> Automated Equipment
                      </h4>
                      <p className="text-muted-foreground">
                        GPS-guided harvesters, sprayers, and planters may <strong>overlap passes or miss rows</strong> during
                        geomagnetic disturbances, wasting fuel, seeds, and chemicals.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <Wifi className="w-4 h-4" /> RTK Base Stations
                      </h4>
                      <p className="text-muted-foreground">
                        Real-Time Kinematic (RTK) correction networks rely on stable satellite signals. Solar activity causes
                        ionospheric interference, reducing RTK effectiveness for precise field operations.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Communication and IoT */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Farm Communications & IoT Sensors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" /> Remote Monitoring
                    </h4>
                    <p className="text-muted-foreground">
                      Soil moisture sensors, weather stations, and irrigation controllers use cellular/satellite communication.
                      Radio blackouts during solar flares can disrupt data transmission from fields.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Internet Connectivity
                    </h4>
                    <p className="text-muted-foreground">
                      Cloud-based farm management systems require stable internet. Major geomagnetic storms can cause
                      power outages affecting rural internet infrastructure and data access.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Plane className="w-4 h-4" /> Drone Operations
                    </h4>
                    <p className="text-muted-foreground">
                      Agricultural drones for crop scouting and spraying rely on GPS navigation. Reduced accuracy during
                      storms makes autonomous flight unreliable and risky.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Planning Around Space Weather */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Practical Farming Recommendations
                </CardTitle>
                <CardDescription>How to use K-Index forecasts for farm operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h4 className="font-semibold mb-2 text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Low Activity (Kp 0-3)
                    </h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Optimal for precision operations</li>
                      <li>• GPS-guided planting safe</li>
                      <li>• Variable rate applications accurate</li>
                      <li>• Drone flights reliable</li>
                      <li>• Real-time NDVI data available</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <h4 className="font-semibold mb-2 text-yellow-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Moderate (Kp 4-6)
                    </h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Monitor GPS accuracy closely</li>
                      <li>• Increase overlap buffers</li>
                      <li>• Delay critical precision tasks</li>
                      <li>• Check RTK correction status</li>
                      <li>• Verify sensor data transmission</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="font-semibold mb-2 text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> High Activity (Kp ≥7)
                    </h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Postpone GPS-dependent work</li>
                      <li>• Switch to manual operations</li>
                      <li>• Expect satellite data delays</li>
                      <li>• Ground autonomous equipment</li>
                      <li>• Use local sensor backups</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real Example */}
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Info className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg text-foreground">Real-World Example</h4>
                    <p className="text-muted-foreground">
                      During the <strong>May 2024 G5 geomagnetic storm</strong>, farmers in the US and Europe reported GPS guidance
                      system failures on their tractors. Many had to <strong>pause planting operations</strong> for 24-48 hours until
                      the storm subsided. Some who continued without GPS experienced <strong>overlapping passes and wasted seeds/fertilizer</strong>.
                    </p>
                    <p className="text-muted-foreground">
                      Additionally, <strong>MODIS and Sentinel-2 satellites</strong> experienced temporary communication issues,
                      delaying NDVI data updates that farmers use for irrigation decisions. This is why FarmPlanet includes
                      K-Index monitoring—so you can <strong>plan field operations</strong> around space weather forecasts!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

