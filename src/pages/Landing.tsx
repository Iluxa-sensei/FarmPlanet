import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SpaceSunModel from '@/components/SpaceSunModel';
import FeatureCard from '@/components/FeatureCard';
import InteractiveChip from '@/components/InteractiveChip';
import MiniChart from '@/components/MiniChart';
import GlobalHeatmap from '@/components/GlobalHeatmap';
import {
  Sun,
  Zap,
  Satellite,
  Shield,
  Plane,
  Smartphone,
  Eye,
  Github,
  MessageCircle,
  ArrowRight,
  Activity,
  Globe,
  Radar,
  AlertTriangle,
  Radio,
  Telescope,
  Target,
  Leaf,
  Sprout,
  Droplets,
  Cloud,
  TrendingUp
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8 }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8 }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Landing = () => {
  const [selectedReason, setSelectedReason] = useState('electronics');
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  const reasons = {
    electronics: {
      title: 'Optimize Crop Planning',
      description: 'Real-time NDVI data helps you understand vegetation health and predict optimal planting and harvesting times. Make data-driven decisions to maximize yield and reduce waste.'
    },
    safety: {
      title: 'Water Management',
      description: 'Monitor soil moisture levels and rainfall patterns to optimize irrigation schedules. Save water resources while ensuring your crops get exactly what they need, when they need it.'
    },
    communications: {
      title: 'Climate Adaptation',
      description: 'Track temperature changes, frost risk, and extreme weather patterns. Adapt your farming practices to climate variability and protect your crops from environmental stress.'
    },
    aurora: {
      title: 'Bloom Forecasting',
      description: 'Predict blooming periods for your crops and orchards using AI-powered analysis of temperature, sunlight, and vegetation indices. Perfect for fruit growers and flower farmers.'
    }
  };

  // Mock data for charts
  const solarActivityData = [2, 4, 3, 5, 7, 6, 8, 5, 4, 6, 3, 2, 4, 5, 6, 7, 8, 9, 7, 5, 4, 3, 5, 6];
  const kpIndexData = [1, 2, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 4, 5, 6, 5, 4, 3, 2, 1, 2, 3, 4];

  return (
    <div className="min-h-screen bg-background starfield">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 px-4 relative overflow-hidden">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[50vh]">
            {/* Left side - 3D Sun Model */}
            <motion.div
              className="flex justify-center "
              variants={fadeInLeft}
            >
              <SpaceSunModel />
            </motion.div>

            {/* Right side - Hero content */}
            <motion.div
              className="text-center lg:text-left space-y-8"
              variants={fadeInRight}
            >
              <div className="space-y-4">
                <Badge variant="outline" className="text-primary border-primary/50 glass-card">
                  <Leaf className="w-4 h-4 mr-2 glow-icon" />
                  Real-Time Vegetation Monitoring
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                  Monitor Earth's Vegetation in{' '}
                  <span className="gradient-text">
                    Real-Time
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                  Track crop health, predict blooming periods, and optimize farming with NASA satellite data.
                  Make smarter decisions for sustainable agriculture.
                </p>
              </div>

              <div className="flex justify-center lg:justify-start lg:ml-32">
                <Button
                  size="lg"
                  className="glow-button text-primary-foreground font-semibold px-8 text-2xl rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
                  style={{ paddingTop: '26px', paddingBottom: '26px' }}
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <Globe className="w-20 h-20 mr-6" />
                  Try now
                  <ArrowRight className="w-20 h-20 ml-6" />
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-background/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid lg:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInLeft} className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                NASA-Powered Vegetation Intelligence
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                FarmPlanet provides comprehensive, real-time monitoring of Earth's vegetation and agricultural conditions.
                We aggregate data from NASA and ESA satellites — MODIS, Sentinel-2, ECOSTRESS, and GPM — to deliver
                accurate insights about crop health, soil moisture, and climate patterns.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're a farmer planning your next harvest, an ecologist tracking ecosystem health, or a
                researcher studying climate impacts on agriculture, our AI-powered analytics and interactive maps
                keep you informed about vegetation conditions worldwide, 24/7.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-4xl font-bold gradient-text">24/7</div>
                  <div className="text-sm text-muted-foreground">Satellite Updates</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold gradient-text">NASA</div>
                  <div className="text-sm text-muted-foreground">Data Sources</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold gradient-text">AI</div>
                  <div className="text-sm text-muted-foreground">Bloom Advisor</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold gradient-text">Global</div>
                  <div className="text-sm text-muted-foreground">NDVI Maps</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInRight} className="relative">
              <Card className="glass-card p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Satellite className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Multi-Satellite Data Fusion</h3>
                    <p className="text-sm text-muted-foreground">MODIS, Sentinel-2, ECOSTRESS, GPM combined</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">NDVI Vegetation Tracking</h3>
                    <p className="text-sm text-muted-foreground">Real-time crop health monitoring</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Bloom Advisor</h3>
                    <p className="text-sm text-muted-foreground">Custom planting and irrigation plans</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Historical Climate Data</h3>
                    <p className="text-sm text-muted-foreground">Track long-term vegetation trends</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Interactive Bloom Map</h3>
                    <p className="text-sm text-muted-foreground">Global vegetation visualization</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Global Heatmap Section */}
      <section id="heatmap" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Global Vegetation Health Map
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Vegetation health doesn't just exist in isolation — it's influenced by temperature, rainfall, and soil conditions worldwide.
              Explore this interactive bloom map to see real-time NDVI data, understand where crops are thriving,
              and identify regions experiencing environmental stress.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Card className="glass-card p-6 overflow-hidden">
              <div className="rounded-lg overflow-hidden mb-6 max-w-4xl mx-auto">
                <img
                  src="/Aurora.jpg"
                  alt="Global NDVI Vegetation Health Map"
                  className="w-full h-auto object-cover max-h-[400px]"
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-muted-foreground">Healthy (NDVI ≥ 0.6)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span className="text-muted-foreground">Moderate (NDVI 0.3-0.6)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-muted-foreground">Stressed (NDVI &lt; 0.3)</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="text-center mt-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <p className="text-lg text-muted-foreground mb-6">
              Check today's vegetation health and see bloom predictions for your region
            </p>
            <Button
              size="lg"
              className="glow-button"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Leaf className="w-5 h-5 mr-2" />
              View Bloom Map
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What We Monitor Section */}
      <section id="features" className="py-24 px-4 bg-background/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Comprehensive Vegetation Tracking
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Monitor critical agricultural parameters that directly impact crop yields, water usage, and farming decisions
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <FeatureCard
              icon={Sprout}
              title="NDVI Live Tracking"
              description="Real-time vegetation health monitoring with daily satellite updates and AI-powered analysis of crop conditions and growth patterns."
              delay={0}
            />
            <FeatureCard
              icon={Droplets}
              title="Soil Moisture Data"
              description="Track rainfall patterns and soil moisture levels with GPM satellite data to optimize irrigation and water management strategies."
              delay={0.1}
            />
            <FeatureCard
              icon={Cloud}
              title="Temperature & Climate"
              description="Monitor land surface temperature with ECOSTRESS data, detect frost risks, and track climate patterns affecting your crops."
              delay={0.2}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Bloom Predictions"
              description="AI-powered forecasting for optimal planting times, harvest periods, and bloom cycles based on historical and real-time data."
              delay={0.3}
            />
          </motion.div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 px-4 bg-background/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Platform Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our intuitive interface designed for farmers and agricultural professionals
            </p>
          </motion.div>

          <motion.div
            className="relative"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-6"
                animate={{ x: -currentScreenshot * 100 + '%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {[
                  { src: "/dashboard.png", title: "Farm Dashboard", description: "Personalized farming analytics with crop data and field management" },
                  { src: "/map.png", title: "Interactive Bloom Map", description: "Interactive global NDVI map showing vegetation health and bloom potential" },
                  { src: "/aichat.png", title: "AI Farm Assistant", description: "AI-powered planting recommendations and irrigation scheduling" },
                  { src: "/notifications.png", title: "Farm Notifications", description: "Real-time farm alerts and crop monitoring notifications" }
                ].map((screenshot, index) => (
                  <div key={index} className="flex-shrink-0 w-full">
                    <Card className="glass-card overflow-hidden">
                      <div className="h-[450px] relative">
                        <img
                          src={screenshot.src}
                          alt={screenshot.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {screenshot.title}
                          </h3>
                          <p className="text-white/90 text-sm">
                            {screenshot.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </motion.div>

              <button
                onClick={() => setCurrentScreenshot((prev) => (prev > 0 ? prev - 1 : 3))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <ArrowRight className="w-6 h-6 rotate-180" />
              </button>

              <button
                onClick={() => setCurrentScreenshot((prev) => (prev < 3 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentScreenshot(index)}
                  className={`w-2 h-2 rounded-full transition-all ${currentScreenshot === index ? 'bg-primary w-8' : 'bg-primary/30'
                    }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section id="why-matters" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Why Vegetation Monitoring Matters
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore how NASA satellite data and AI-powered insights help farmers adapt to climate change and optimize agricultural practices
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {Object.entries(reasons).map(([key, reason]) => (
              <InteractiveChip
                key={key}
                id={key}
                title={reason.title}
                isSelected={selectedReason === key}
                onClick={setSelectedReason}
              />
            ))}
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            key={selectedReason}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card p-8 text-center">
              <div className="space-y-6">
                <div className="flex justify-center mb-4">
                  {selectedReason === 'electronics' && <Sprout className="w-16 h-16 text-primary glow-icon" />}
                  {selectedReason === 'safety' && <Droplets className="w-16 h-16 text-primary glow-icon" />}
                  {selectedReason === 'communications' && <Cloud className="w-16 h-16 text-primary glow-icon" />}
                  {selectedReason === 'aurora' && <Leaf className="w-16 h-16 text-primary glow-icon" />}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  {reasons[selectedReason].title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {reasons[selectedReason].description}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Data Visualization Section */}

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Badge variant="outline" className="text-primary border-primary/50 glass-card mx-auto">
              <Leaf className="w-4 h-4 mr-2" />
              Join the Smart Farming Revolution
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of farmers, ecologists, and agricultural researchers who rely on FarmPlanet
              for NASA-powered vegetation intelligence and AI-driven farming insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Button
                size="lg"
                className="glow-button px-12 py-6 text-lg rounded-full hover:scale-105 transition-transform shadow-2xl"
                onClick={() => window.location.href = '/dashboard'}
              >
                <Sprout className="w-6 h-6 mr-2" />
                Explore Bloom Map
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="glass-button px-12 py-6 text-lg rounded-full hover:scale-105 transition-transform"
                onClick={() => window.location.href = '/sign-up'}
              >
                Start Free Trial
              </Button>
            </div>
            <div className="pt-8 text-sm text-muted-foreground">
              No credit card required • NASA satellite data • AI-powered insights
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-4 border-t border-border bg-background/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <Leaf className="h-8 w-8 text-primary glow-icon" />
                <span className="text-2xl font-bold gradient-text">FarmPlanet</span>
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                NASA-powered vegetation monitoring platform delivering real-time NDVI data, soil moisture insights,
                and AI-driven agricultural intelligence for sustainable farming and climate adaptation.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Platform</h3>
              <div className="space-y-2">
                <a href="#home" className="block text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
                <a href="#about" className="block text-muted-foreground hover:text-primary transition-colors">
                  About
                </a>
                <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
                <a href="/dashboard" className="block text-muted-foreground hover:text-primary transition-colors">
                  Map
                </a>
                <a href="#contact" className="block text-muted-foreground hover:text-primary transition-colors">
                  Articles
                </a>
              </div>
            </div>

            {/* API & Legal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Resources</h3>
              <div className="space-y-2">
                <a href="/api" className="block text-muted-foreground hover:text-primary transition-colors">
                  API
                </a>
                <a href="/privacy" className="block text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="block text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
                <a href="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border space-y-4 md:space-y-0">
            <div className="text-muted-foreground">
              © 2024 FarmPlanet. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              <a href="https://github.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://t.me" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;