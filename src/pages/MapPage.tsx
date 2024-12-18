import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Sparkles,
  Trash2,
  Play,
  Calendar,
  Droplets,
  Sun,
  Sprout,
  TrendingUp,
  CheckCircle2,
  Loader2,
  Thermometer,
  AlertCircle,
  Maximize2,
  Edit3,
  Move,
  Camera,
  Brain,
  List,
  X,
  Leaf,
  RefreshCw,
  Wind,
  Cloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import NDVIDemoLayer from "@/components/NDVIDemoLayer";
import NDVITileLayer from "@/components/NDVITileLayer";
import NDVICanvasLayer from "@/components/NDVICanvasLayer";
import NDVISimpleLayer from "@/components/NDVISimpleLayer";
import NDVICSSLayer from "@/components/NDVICSSLayer";
import NDVIRealLayer from "@/components/NDVIRealLayer";
import NDVIWMSLayer from "@/components/NDVIWMSLayer";
import NDVITileLayerSimple from "@/components/NDVITileLayerSimple";
import WindyMapComponent from "@/components/WindyMapComponent";
import { SentinelHubProxy } from "@/lib/sentinelHubProxy";
import * as tf from '@tensorflow/tfjs';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Функция для запроса NDVI данных через прокси (обход CORS)
const fetchNDVIData = async (date: string) => {
  try {
    // Сначала пробуем WMS проверку (более надежно)
    const wmsCheck = await SentinelHubProxy.checkWMSAvailability("6171865c-a9c0-4f4c-9c21-eaba962536d8", date);

    if (wmsCheck.success) {
      return {
        success: true,
        data: wmsCheck,
        message: `WMS service available for ${date}`,
        wmsUrl: wmsCheck.wmsUrl
      };
    }

    // Если WMS недоступен, пробуем API через прокси
    const apiCheck = await SentinelHubProxy.checkNDVIData(date, [37.3, 55.5, 38.0, 56.0]);

    if (apiCheck.success) {
      return {
        success: true,
        data: apiCheck.data,
        message: `NDVI data available for ${date}`
      };
    } else {
      // Данные недоступны, используем демо данные
      return {
        success: false,
        error: "No satellite data available for this date",
        fallback: true
      };
    }

  } catch (error) {
    console.error('NDVI data check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    };
  }
};

interface Territory {
  id: string;
  points: [number, number][];
  name: string;
  crop?: string;
  plantingDate?: string;
  soilType?: string;
  aiPlan?: AIPlan;
  area?: number; // area in hectares
}

interface WeekPlan {
  week: number;
  title: string;
  tasks: string[];
  irrigation: string;
  fertilizer: string;
  monitoring: string;
}

interface AIPlan {
  crop: string;
  territory: string;
  plantingDate: string;
  harvestDate: string;
  totalWeeks: number;
  weeklyPlans: WeekPlan[];
}

interface TempPoint {
  lat: number;
  lng: number;
  value: number;
  location?: string;
}

// Soil Type Detection Component
interface SoilTypeDetectionProps {
  onSoilTypeDetected: (soilType: string, confidence: number) => void;
  onManualSelect: (soilType: string) => void;
}

function SoilTypeDetection({ onSoilTypeDetected, onManualSelect }: SoilTypeDetectionProps) {
  const { toast } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<'ai' | 'manual'>('ai');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [model, setModel] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{ soilType: string, confidence: number } | null>(null);
  const [classLabels, setClassLabels] = useState<string[]>([]);

  // Load TensorFlow model with metadata
  useEffect(() => {
    const loadModel = async () => {
      if (detectionMethod !== 'ai') return;

      setIsModelLoading(true);
      try {
        // Load Teachable Machine model and metadata
        const modelUrl = 'https://teachablemachine.withgoogle.com/models/y4sHd0CVt/';

        // Load model and metadata in parallel
        const [model, metadataResponse] = await Promise.all([
          tf.loadLayersModel(modelUrl + 'model.json'),
          fetch(modelUrl + 'metadata.json')
        ]);

        if (!metadataResponse.ok) {
          throw new Error('Failed to load metadata');
        }

        const metadata = await metadataResponse.json();

        // Extract class labels from metadata
        const labels = metadata.labels || [];
        setClassLabels(labels);
        setModel(model);

        console.log('Model and metadata loaded successfully', { labels });
        toast({
          title: "AI Model Loaded",
          description: `TensorFlow model ready with ${labels.length} soil types`,
          variant: "default"
        });
      } catch (error) {
        console.error('Error loading model:', error);
        toast({
          title: "Model Loading Error",
          description: "Could not load AI model. Please use manual selection.",
          variant: "destructive"
        });
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, [detectionMethod, toast]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      setCameraStream(stream);

      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef) {
          videoRef.srcObject = stream;
          videoRef.play().catch(console.error);
        }
      }, 100);

    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please use manual selection.",
        variant: "destructive"
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Capture and analyze image
  const captureAndAnalyze = async () => {
    if (!videoRef || !canvasRef || !model) return;

    setIsDetecting(true);
    try {
      // Capture frame from video
      const canvas = canvasRef;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = videoRef.videoWidth;
      canvas.height = videoRef.videoHeight;
      ctx.drawImage(videoRef, 0, 0);

      // Convert to tensor with proper normalization [-1, 1]
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const tensor = tf.browser.fromPixels(imageData)
        .resizeNearestNeighbor([224, 224])
        .expandDims(0)
        .div(127.5)
        .sub(1);

      // Make prediction
      const prediction = await model.predict(tensor);
      const probabilities = await prediction.data();

      // Clean up tensors to prevent memory leaks
      tensor.dispose();
      prediction.dispose();

      console.log('Prediction probabilities:', probabilities);

      // Get the class with highest probability
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[maxIndex];

      // Map index to soil type using class labels from metadata
      const detectedSoilType = classLabels[maxIndex] || 'Unknown';

      console.log('Detected soil type:', detectedSoilType, 'Confidence:', confidence);

      setDetectionResult({ soilType: detectedSoilType, confidence });
      onSoilTypeDetected(detectedSoilType, confidence);

      toast({
        title: "Soil Type Detected",
        description: `${detectedSoilType} (${(confidence * 100).toFixed(1)}% confidence)`
      });

    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  // Test model without camera
  const testModel = async () => {
    if (!model || classLabels.length === 0) {
      toast({
        title: "Model Not Ready",
        description: "Please wait for model to load completely",
        variant: "destructive"
      });
      return;
    }

    setIsDetecting(true);
    try {
      // Create a test tensor (random noise for testing)
      const testTensor = tf.randomNormal([1, 224, 224, 3])
        .div(127.5)
        .sub(1);

      const prediction = await model.predict(testTensor);
      const probabilities = await prediction.data();

      // Clean up tensors
      testTensor.dispose();
      prediction.dispose();

      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[maxIndex];
      const detectedSoilType = classLabels[maxIndex];

      setDetectionResult({ soilType: detectedSoilType, confidence });
      onSoilTypeDetected(detectedSoilType, confidence);

      toast({
        title: "Test Prediction",
        description: `${detectedSoilType} (${(confidence * 100).toFixed(1)}% confidence)`
      });

    } catch (error) {
      console.error('Error testing model:', error);
      toast({
        title: "Test Error",
        description: "Could not test model. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="flex gap-2">
        <Button
          variant={detectionMethod === 'ai' ? 'default' : 'outline'}
          onClick={() => setDetectionMethod('ai')}
          className="flex-1"
        >
          <Brain className="w-4 h-4 mr-2" />
          AI Detection
        </Button>
        <Button
          variant={detectionMethod === 'manual' ? 'default' : 'outline'}
          onClick={() => setDetectionMethod('manual')}
          className="flex-1"
        >
          <List className="w-4 h-4 mr-2" />
          Manual Selection
        </Button>
      </div>


      {detectionMethod === 'ai' && (
        <div className="space-y-4">
          {isModelLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading AI model...</span>
            </div>
          )}

          {model && !cameraStream && (
            <div className="space-y-2">
              <Button onClick={startCamera} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
              <Button onClick={testModel} variant="outline" className="w-full">
                <Brain className="w-4 h-4 mr-2" />
                Test Model
              </Button>
            </div>
          )}

          {cameraStream && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={(el) => {
                    if (el) {
                      setVideoRef(el);
                      el.srcObject = cameraStream;
                      el.play().catch(console.error);
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-48 object-cover"
                  style={{ transform: 'scaleX(-1)' }} // Mirror the video
                />
                <canvas
                  ref={setCanvasRef}
                  className="hidden"
                />
                <Button
                  onClick={stopCamera}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Point camera at soil sample
                </div>
              </div>

              <Button
                onClick={captureAndAnalyze}
                disabled={isDetecting}
                className="w-full"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture & Analyze
                  </>
                )}
              </Button>

              {detectionResult && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">✅ {detectionResult.soilType}</p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(detectionResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant="secondary">AI Detected</Badge>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {detectionMethod === 'manual' && (
        <div className="space-y-2">
          <Label>Select Soil Type</Label>
          <Select onValueChange={onManualSelect}>
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Choose soil type" />
            </SelectTrigger>
            <SelectContent>
              {classLabels.map((soilType) => (
                <SelectItem key={soilType} value={soilType}>
                  {soilType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

function MapClickHandler({
  isDrawing,
  onAddPoint
}: {
  isDrawing: boolean;
  onAddPoint: (latlng: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onAddPoint(e.latlng);
      }
    },
  });
  return null;
}

// Create beautiful icon for draggable points
function createDraggablePointIcon(index: number, isHovered: boolean = false) {
  const size = isHovered ? 20 : 16;
  const pulseAnimation = isHovered ? 'animation: pulse 1.5s infinite;' : '';

  return L.divIcon({
    className: 'custom-draggable-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
          @keyframes ripple {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        </style>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size * 2}px;
          height: ${size * 2}px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          ${isHovered ? 'animation: ripple 1.5s infinite;' : ''}
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4), 0 0 0 4px rgba(34, 197, 94, 0.2);
          cursor: move;
          ${pulseAnimation}
          transition: all 0.2s ease;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: 10px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          pointer-events: none;
        ">${index + 1}</div>
      </div>
    `,
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
    popupAnchor: [0, -(size + 8) / 2]
  });
}

// Polygon self-intersection check
function doSegmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number]
): boolean {
  const ccw = (A: [number, number], B: [number, number], C: [number, number]) => {
    return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
  };

  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

function isPolygonSelfIntersecting(points: [number, number][]): boolean {
  if (points.length < 4) return false;

  const n = points.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      // Don't check adjacent segments
      if (i === 0 && j === n - 1) continue;
      if (Math.abs(i - j) === 1) continue;

      const p1 = points[i];
      const p2 = points[(i + 1) % n];
      const p3 = points[j];
      const p4 = points[(j + 1) % n];

      if (doSegmentsIntersect(p1, p2, p3, p4)) {
        return true;
      }
    }
  }
  return false;
}

// Calculate polygon area in hectares
function calculatePolygonArea(points: [number, number][]): number {
  if (points.length < 3) return 0;

  // Use formula for calculating area on sphere
  // Earth radius in meters
  const R = 6371000;

  // Convert coordinates to radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = toRad(points[i][0]);
    const lat2 = toRad(points[j][0]);
    const lng1 = toRad(points[i][1]);
    const lng2 = toRad(points[j][1]);

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs(area * R * R / 2);

  // Convert from square meters to hectares (1 ha = 10000 m²)
  return area / 10000;
}

// Temperature color scale
function tempToColor(temp: number): string {
  if (temp < -20) return "#000080";
  if (temp < -10) return "#0000CD";
  if (temp < 0) return "#4169E1";
  if (temp < 5) return "#1E90FF";
  if (temp < 10) return "#00BFFF";
  if (temp < 15) return "#87CEEB";
  if (temp < 20) return "#98FB98";
  if (temp < 25) return "#FFD700";
  if (temp < 30) return "#FFA500";
  if (temp < 35) return "#FF8C00";
  if (temp < 40) return "#FF4500";
  return "#DC143C";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : { r: 0, g: 0, b: 0 };
}

function interpolateTemp(x: number, y: number, grid: { [key: string]: number }, gridSize: number): number | null {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.ceil(x);
  const y1 = Math.ceil(y);

  const points = [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x0, y: y1 },
    { x: x1, y: y1 },
  ];

  let totalWeight = 0;
  let weightedSum = 0;

  for (const point of points) {
    const key = `${point.x},${point.y}`;
    if (grid[key] !== undefined) {
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      const weight = distance === 0 ? 1 : 1 / (distance + 0.01);
      weightedSum += grid[key] * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) {
    const radius = 3;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const key = `${Math.floor(x) + dx},${Math.floor(y) + dy}`;
        if (grid[key] !== undefined) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          const weight = 1 / (distance + 0.1);
          weightedSum += grid[key] * weight;
          totalWeight += weight;
        }
      }
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

// Component for automatic zoom to selected territory
function ZoomToTerritory({ territory }: { territory: Territory | null }) {
  const map = useMap();

  useEffect(() => {
    if (territory && territory.points.length > 0) {
      // Create bounds from territory points
      const bounds = L.latLngBounds(territory.points as L.LatLngExpression[]);
      // Zoom to territory with padding
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true, duration: 0.5 });
    }
  }, [territory, map]);

  return null;
}

function HeatmapCanvas({ tempPoints }: { tempPoints: TempPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (tempPoints.length === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    const gridSize = 50;
    const grid: { [key: string]: number } = {};

    tempPoints.forEach(point => {
      const x = Math.floor(((point.lng + 180) / 360) * gridSize);
      const y = Math.floor(((90 - point.lat) / 180) * gridSize);
      const key = `${x},${y}`;
      grid[key] = point.value;
    });

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const gx = (x / canvas.width) * gridSize;
        const gy = (y / canvas.height) * gridSize;

        let temp = interpolateTemp(gx, gy, grid, gridSize);

        if (temp !== null) {
          const color = tempToColor(temp);
          const rgb = hexToRgb(color);

          const idx = (y * canvas.width + x) * 4;
          data[idx] = rgb.r;
          data[idx + 1] = rgb.g;
          data[idx + 2] = rgb.b;
          data[idx + 3] = 200;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const bounds = new L.LatLngBounds(
      new L.LatLng(-90, -180),
      new L.LatLng(90, 180)
    );

    const overlay = L.imageOverlay(canvas.toDataURL(), bounds, {
      opacity: 0.7,
      interactive: false,
    });

    overlay.addTo(map);

    return () => {
      overlay.remove();
    };
  }, [tempPoints, map]);

  return null;
}

export default function MapPage() {
  const { toast } = useToast();
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

  const [mapType, setMapType] = useState<"normal" | "temperature" | "ndvi" | "windy">("normal");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [territories, setTerritories] = useState<Territory[]>(loadTerritories);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAIPlan] = useState<AIPlan | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isEditingTerritory, setIsEditingTerritory] = useState(false);
  const [hasIntersection, setHasIntersection] = useState(false);
  const [showIntersectionWarning, setShowIntersectionWarning] = useState(false);

  // Temperature map states
  const [tempPoints, setTempPoints] = useState<TempPoint[]>([]);
  const [tempLoading, setTempLoading] = useState(false);
  const [tempError, setTempError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // NDVI map states
  const [ndviDate, setNdviDate] = useState(new Date().toISOString().split('T')[0]);
  const [ndviLoading, setNdviLoading] = useState(false);

  const [formData, setFormData] = useState({
    territoryName: "",
    crop: "",
    plantingDate: "",
    soilType: "",
    estimatedDuration: "16" // weeks
  });

  // Calculate area of currently drawn territory
  const currentArea = useMemo(() => {
    if (currentPoints.length < 3) return 0;
    return calculatePolygonArea(currentPoints);
  }, [currentPoints]);

  // Check line intersection when points change
  useEffect(() => {
    if (currentPoints.length >= 4) {
      const intersecting = isPolygonSelfIntersecting(currentPoints);
      setHasIntersection(intersecting);
      if (intersecting && !showIntersectionWarning) {
        setShowIntersectionWarning(true);
      }
    } else {
      setHasIntersection(false);
    }
  }, [currentPoints]);

  // Global coordinates for temperature sampling
  const globalCoords = useMemo(() => {
    const coords = [];
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lng = -180; lng <= 180; lng += 30) {
        coords.push({ lat, lng, name: `${lat},${lng}` });
      }
    }

    const cities = [
      { lat: 51.51, lng: -0.13, name: "London" },
      { lat: 40.71, lng: -74.01, name: "New York" },
      { lat: 35.68, lng: 139.65, name: "Tokyo" },
      { lat: -33.87, lng: 151.21, name: "Sydney" },
      { lat: 55.75, lng: 37.62, name: "Moscow" },
      { lat: 28.61, lng: 77.21, name: "Delhi" },
      { lat: -23.55, lng: -46.63, name: "São Paulo" },
      { lat: 1.35, lng: 103.82, name: "Singapore" },
      { lat: 34.05, lng: -118.24, name: "Los Angeles" },
      { lat: 64.13, lng: -21.94, name: "Reykjavik" },
    ];

    return [...coords, ...cities];
  }, []);

  // Fetch temperature from Open-Meteo API
  const fetchOpenMeteo = async (lat: number, lng: number, name: string) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m&timezone=auto`;
      const response = await fetch(url);

      if (!response.ok) return null;

      const data = await response.json();

      if (data.current?.temperature_2m !== undefined) {
        return { lat, lng, value: data.current.temperature_2m, location: name };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Load temperature data when temperature map is selected
  useEffect(() => {
    if (mapType !== "temperature") return;

    let isMounted = true;

    async function loadTemperatureData() {
      setTempLoading(true);
      setTempError(null);

      const batchSize = 15;
      const allPromises: Promise<TempPoint | null>[] = [];

      for (let i = 0; i < globalCoords.length; i += batchSize) {
        const batch = globalCoords.slice(i, i + batchSize);
        const batchPromises = batch.map(coord =>
          fetchOpenMeteo(coord.lat, coord.lng, coord.name)
        );
        allPromises.push(...batchPromises);

        if (i + batchSize < globalCoords.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      const results = await Promise.all(allPromises);
      const validResults = results.filter(r => r !== null) as TempPoint[];

      if (isMounted) {
        if (validResults.length === 0) {
          setTempError("Unable to fetch temperature data. Please try again later.");
        }

        setTempPoints(validResults);
        setTempLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    }

    loadTemperatureData();

    return () => {
      isMounted = false;
    };
  }, [mapType, globalCoords]);

  // Update last updated time
  useEffect(() => {
    const id = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Temperature statistics
  const tempStats = useMemo(() => {
    if (tempPoints.length === 0) return null;
    const temps = tempPoints.map(p => p.value);
    return {
      min: Math.min(...temps),
      max: Math.max(...temps),
      avg: temps.reduce((a, b) => a + b, 0) / temps.length,
    };
  }, [tempPoints]);

  // Get temperature for territory
  const getTerritoryTemperature = (territory: Territory): number | null => {
    if (tempPoints.length === 0 || !territory.points || territory.points.length === 0) return null;

    // Calculate center of territory
    const lats = territory.points.map(p => p[0]);
    const lngs = territory.points.map(p => p[1]);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    // Find nearest temperature point
    let nearestPoint = tempPoints[0];
    let minDistance = Infinity;

    tempPoints.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.lat - centerLat, 2) + Math.pow(point.lng - centerLng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    return nearestPoint.value;
  };

  // Save territories to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(TERRITORIES_STORAGE_KEY, JSON.stringify(territories));
    } catch (error) {
      console.error('Error saving territories:', error);
    }
  }, [territories]);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCurrentPoints([]);
    toast({
      title: "🎨 Drawing Mode Active",
      description: "Click to add points • Drag points to move them • Need at least 3 points",
      duration: 5000
    });
  };

  const handleAddPoint = (latlng: LatLng) => {
    setCurrentPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
  };

  const handleUpdatePoint = (index: number, newLat: number, newLng: number) => {
    setCurrentPoints(prev => {
      const updated = [...prev];
      updated[index] = [newLat, newLng];
      return updated;
    });
  };

  const handleRemovePoint = (index: number) => {
    if (currentPoints.length <= 3) {
      toast({
        title: "Cannot Remove Point",
        description: "A territory must have at least 3 points",
        variant: "destructive"
      });
      return;
    }
    setCurrentPoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinishDrawing = () => {
    if (currentPoints.length < 3) {
      toast({
        title: "Not Enough Points",
        description: "Please add at least 3 points to create a territory",
        variant: "destructive"
      });
      return;
    }

    if (hasIntersection) {
      setShowIntersectionWarning(true);
      toast({
        title: "❌ Invalid Territory Shape",
        description: "Territory lines are crossing. Please fix the shape before saving.",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    setIsDrawing(false);
    setIsFormOpen(true);
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPoints([]);
    toast({
      title: "Drawing Cancelled",
      description: "Territory drawing has been cancelled"
    });
  };

  const handleSoilTypeDetected = (soilType: string, confidence: number) => {
    setFormData({ ...formData, soilType });
  };

  const handleManualSoilSelect = (soilType: string) => {
    setFormData({ ...formData, soilType });
  };

  const handleSaveTerritory = () => {
    if (!formData.territoryName || !formData.crop) {
      toast({
        title: "Missing Information",
        description: "Please fill in territory name and crop type",
        variant: "destructive"
      });
      return;
    }

    // Calculate territory area
    const area = calculatePolygonArea(currentPoints);

    const territory: Territory = {
      id: Date.now().toString(),
      points: currentPoints,
      name: formData.territoryName,
      crop: formData.crop,
      plantingDate: formData.plantingDate,
      soilType: formData.soilType,
      area: area
    };

    setTerritories(prev => [...prev, territory]);
    setSelectedTerritory(territory);
    setCurrentPoints([]);
    setIsFormOpen(false);

    toast({
      title: "Territory Saved",
      description: `${territory.name} has been added to your farm (${area.toFixed(2)} ha)`
    });
  };

  const handleDeleteTerritory = (id: string) => {
    setTerritories(prev => prev.filter(t => t.id !== id));
    if (selectedTerritory?.id === id) {
      setSelectedTerritory(null);
    }
    toast({
      title: "Territory Deleted",
      description: "Territory has been removed from your farm"
    });
  };

  const handleUpdateTerritoryPoint = (territoryId: string, pointIndex: number, newLat: number, newLng: number) => {
    setTerritories(prev => prev.map(territory => {
      if (territory.id === territoryId) {
        const updatedPoints = [...territory.points];
        updatedPoints[pointIndex] = [newLat, newLng];
        const updatedArea = calculatePolygonArea(updatedPoints);
        return { ...territory, points: updatedPoints, area: updatedArea };
      }
      return territory;
    }));

    // Update selected territory if it's this one
    if (selectedTerritory?.id === territoryId) {
      const updated = territories.find(t => t.id === territoryId);
      if (updated) {
        const updatedPoints = [...updated.points];
        updatedPoints[pointIndex] = [newLat, newLng];
        const updatedArea = calculatePolygonArea(updatedPoints);
        setSelectedTerritory({ ...updated, points: updatedPoints, area: updatedArea });
      }
    }
  };

  const handleGenerateAIPlan = async () => {
    if (!selectedTerritory || !selectedTerritory.crop || !selectedTerritory.plantingDate) {
      toast({
        title: "Missing Information",
        description: "Please select a territory with crop and planting date",
        variant: "destructive"
      });
      return;
    }

    // If territory already has a plan, just show it
    if (selectedTerritory.aiPlan) {
      setAIPlan(selectedTerritory.aiPlan);
      setCurrentWeek(1);
      setIsPlanOpen(true);
      return;
    }

    // Generate new plan
    setIsGenerating(true);
    setIsPlanOpen(true);

    try {
      const plan = await generateAIPlanWithAI(selectedTerritory);
      setAIPlan(plan);
      setCurrentWeek(1);

      // Save plan to territory
      const updatedTerritories = territories.map(t =>
        t.id === selectedTerritory.id ? { ...t, aiPlan: plan } : t
      );
      setTerritories(updatedTerritories);

      // Update selected territory
      setSelectedTerritory({ ...selectedTerritory, aiPlan: plan });

      toast({
        title: "AI Plan Generated",
        description: "Your farming plan has been created and saved"
      });
    } catch (error) {
      console.error('Error generating AI plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI plan. Please try again.",
        variant: "destructive"
      });
      setIsPlanOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIPlanWithAI = async (territory: Territory): Promise<AIPlan> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback to mock data if no API key
      return generateAIPlan(territory);
    }

    try {
      const plantingDate = new Date(territory.plantingDate || Date.now());
      const prompt = `Create a detailed week-by-week farming plan for growing ${territory.crop} on a farm field called "${territory.name}".

Planting date: ${plantingDate.toLocaleDateString()}
Crop: ${territory.crop}

Please provide:
1. Estimated harvest date (calculate appropriate growing period for ${territory.crop})
2. Total number of weeks from planting to harvest
3. For EACH week, provide:
   - Week number and growth stage title
   - 3-4 specific tasks for that week
   - Irrigation schedule (frequency and amount in mm)
   - Fertilizer recommendations (type and amount)
   - What to monitor (NDVI values, pests, diseases, etc.)

Format the response as JSON with this exact structure:
{
  "harvestDate": "MM/DD/YYYY",
  "totalWeeks": number,
  "weeklyPlans": [
    {
      "week": 1,
      "title": "Week 1: Stage Name",
      "tasks": ["task1", "task2", "task3"],
      "irrigation": "irrigation schedule",
      "fertilizer": "fertilizer recommendation",
      "monitoring": "what to monitor"
    }
  ]
}

Base recommendations on real agricultural science and satellite data monitoring principles.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert agricultural advisor. Provide detailed, scientifically accurate farming plans in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content);

      return {
        crop: territory.crop || "Unknown",
        territory: territory.name,
        plantingDate: plantingDate.toLocaleDateString(),
        harvestDate: aiResponse.harvestDate,
        totalWeeks: aiResponse.totalWeeks,
        weeklyPlans: aiResponse.weeklyPlans
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      // Fallback to mock data on error
      return generateAIPlan(territory);
    }
  };

  const generateAIPlan = (territory: Territory): AIPlan => {
    const cropData: Record<string, {
      duration: number;
      harvestOffset: number;
      tasks: string[][];
    }> = {
      "Wheat": {
        duration: 16,
        harvestOffset: 16,
        tasks: [
          ["Prepare soil with deep plowing", "Apply base fertilizer (NPK 10-10-10)", "Check soil pH (target 6.0-7.0)"],
          ["Sow wheat seeds at 120-140 kg/ha", "Ensure proper seed depth (4-5 cm)", "Light irrigation after sowing"],
          ["Monitor germination (should appear in 5-7 days)", "Light irrigation if soil is dry", "Scout for early pests"],
          ["First nitrogen application (30% of total)", "Weed control - mechanical or herbicide", "Check for disease symptoms"],
          ["Monitor crop growth", "Irrigation based on rainfall", "Continue pest monitoring"],
          ["Second nitrogen application (30% of total)", "Ensure adequate moisture", "Disease prevention spray if needed"],
          ["Monitor heading stage development", "Increase irrigation frequency", "Scout for rust and other diseases"],
          ["Continue irrigation (critical for grain filling)", "Apply fungicide if disease detected", "Monitor for aphids"],
          ["Grain filling stage - maintain moisture", "Reduce nitrogen input", "Continue disease monitoring"],
          ["Monitor grain maturity", "Reduce irrigation gradually", "Prepare for harvest"],
          ["Check grain moisture content", "Plan harvest timing", "Inspect for lodging"],
          ["Continue monitoring", "Final disease check", "Equipment preparation"],
          ["Grain moisture check (target 13-14%)", "Weather forecast review", "Combine harvester ready"],
          ["Harvest when grain moisture is optimal", "Immediate drying if needed", "Quality assessment"],
          ["Complete harvest", "Field cleanup", "Residue management"],
          ["Post-harvest soil analysis", "Plan crop rotation", "Store grain properly"]
        ]
      },
      "Corn": {
        duration: 18,
        harvestOffset: 18,
        tasks: [
          ["Deep tillage and soil preparation", "Apply base fertilizer", "Check soil temperature (min 10°C)"],
          ["Plant corn seeds at 60-75 cm row spacing", "Seeding rate: 60,000-85,000 seeds/ha", "Light irrigation"],
          ["Monitor emergence (5-7 days)", "Bird control measures", "Check for seedling diseases"],
          ["First nitrogen application (20% of total)", "Weed control - pre-emergence herbicide", "Ensure adequate moisture"],
          ["Monitor V4-V6 stage", "Second nitrogen application (30%)", "Post-emergence weed control"],
          ["Continue nitrogen application (30%)", "Increase irrigation", "Scout for corn borer"],
          ["Monitor rapid growth stage", "Side-dress fertilization if needed", "Disease scouting"],
          ["Tasseling stage begins", "Maintain high moisture levels", "Monitor for European corn borer"],
          ["Pollination period - critical moisture", "Minimal field operations", "Disease prevention"],
          ["Grain filling begins", "Continue irrigation", "Monitor for foliar diseases"],
          ["Grain filling continues", "Check for ear rot", "Maintain moisture"],
          ["Dent stage monitoring", "Reduce irrigation", "Assess maturity"],
          ["Continue maturity monitoring", "Weather check", "Harvest planning"],
          ["Grain moisture check (target 20-25%)", "Combine preparation", "Final scouting"],
          ["Harvest when moisture is 20-25%", "Immediate drying to 15%", "Quality check"],
          ["Complete harvest", "Yield mapping", "Residue management"],
          ["Field cleanup", "Soil sampling", "Equipment maintenance"],
          ["Post-harvest analysis", "Storage monitoring", "Plan next season"]
        ]
      },
      "Soybeans": {
        duration: 14,
        harvestOffset: 14,
        tasks: [
          ["Soil preparation with tillage", "Inoculate seeds with Rhizobium", "Apply base fertilizer (P&K)"],
          ["Plant soybeans at 45-75 cm rows", "Seeding rate: 300,000-400,000 seeds/ha", "Light irrigation"],
          ["Monitor emergence (7-10 days)", "Check for seedling diseases", "Scout for early pests"],
          ["Pre-emergence weed control", "Minimal nitrogen (rhizobia will fix)", "Ensure good moisture"],
          ["V3-V4 stage monitoring", "Post-emergence herbicide if needed", "Check nodulation"],
          ["Monitor rapid vegetative growth", "Irrigation based on rainfall", "Scout for soybean aphids"],
          ["Flowering begins (R1-R2)", "Maintain consistent moisture", "Disease scouting"],
          ["Pod formation stage", "Critical irrigation period", "Monitor for pod feeders"],
          ["Seed development in pods", "Continue moisture management", "Check for diseases"],
          ["Seed filling stage", "Reduce irrigation gradually", "Monitor maturity"],
          ["Continue maturity monitoring", "Check leaf yellowing", "Plan harvest"],
          ["Leaves dropping (R7-R8)", "Allow field to dry", "Harvest preparation"],
          ["Check grain moisture (target 13-14%)", "Weather forecast", "Combine ready"],
          ["Harvest when pods are mature", "Quick harvest to prevent shattering", "Quality assessment"],
        ]
      }
    };

    const crop = territory.crop || "Wheat";
    const cropInfo = cropData[crop] || cropData["Wheat"];
    const plantingDate = new Date(territory.plantingDate || Date.now());
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + cropInfo.harvestOffset * 7);

    const weeklyPlans: WeekPlan[] = [];
    for (let i = 0; i < cropInfo.duration; i++) {
      const weekStart = new Date(plantingDate);
      weekStart.setDate(weekStart.getDate() + i * 7);

      weeklyPlans.push({
        week: i + 1,
        title: `Week ${i + 1}: ${getGrowthStage(crop, i + 1, cropInfo.duration)}`,
        tasks: cropInfo.tasks[i] || ["Monitor crop development", "Regular field inspection", "Adjust care as needed"],
        irrigation: getIrrigationSchedule(crop, i + 1, cropInfo.duration),
        fertilizer: getFertilizerSchedule(crop, i + 1),
        monitoring: getMonitoringFocus(crop, i + 1, cropInfo.duration)
      });
    }

    return {
      crop,
      territory: territory.name,
      plantingDate: plantingDate.toLocaleDateString(),
      harvestDate: harvestDate.toLocaleDateString(),
      totalWeeks: cropInfo.duration,
      weeklyPlans
    };
  };

  const getGrowthStage = (crop: string, week: number, total: number): string => {
    const progress = week / total;
    if (progress < 0.15) return "Preparation & Planting";
    if (progress < 0.3) return "Germination & Emergence";
    if (progress < 0.5) return "Vegetative Growth";
    if (progress < 0.7) return "Flowering & Pollination";
    if (progress < 0.85) return "Grain Filling";
    return "Maturation & Harvest";
  };

  const getIrrigationSchedule = (crop: string, week: number, total: number): string => {
    const progress = week / total;
    if (progress < 0.2) return "Light irrigation - 2x per week (15-20mm each)";
    if (progress < 0.5) return "Moderate irrigation - 2-3x per week (20-25mm each)";
    if (progress < 0.75) return "Heavy irrigation - 3x per week (25-30mm each) - Critical period";
    if (progress < 0.9) return "Moderate irrigation - 2x per week (15-20mm each)";
    return "Minimal irrigation - allow field to dry before harvest";
  };

  const getFertilizerSchedule = (crop: string, week: number): string => {
    if (week === 1) return "Base fertilizer: NPK 10-10-10 at 200 kg/ha";
    if (week === 4) return "Nitrogen top-dress: Urea 100 kg/ha (30% of total N)";
    if (week === 6) return "Second nitrogen application: Urea 100 kg/ha (30% of total N)";
    if (week === 8) return "Final nitrogen boost: Urea 50 kg/ha if needed";
    return "No fertilizer application this week - monitor crop status";
  };

  const getMonitoringFocus = (crop: string, week: number, total: number): string => {
    const progress = week / total;
    if (progress < 0.2) return "Focus: Germination rate, seedling health, weed emergence";
    if (progress < 0.4) return "Focus: Growth uniformity, nutrient deficiency, early pest detection";
    if (progress < 0.6) return "Focus: Disease scouting, pest pressure, weed control effectiveness";
    if (progress < 0.8) return "Focus: Flowering success, grain development, disease management";
    return "Focus: Grain maturity, moisture content, harvest readiness";
  };

  const getTerritoryColor = (index: number): string => {
    const colors = [
      "#22c55e", // green
      "#3b82f6", // blue
      "#f59e0b", // orange
      "#ec4899", // pink
      "#8b5cf6", // purple
      "#06b6d4", // cyan
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 h-[calc(100vh-80px)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Interactive Bloom Map
          </h1>
          <p className="text-muted-foreground mt-1">
            {mapType === "normal"
              ? "Draw your territory, select crops, and get AI-powered farming plans"
              : mapType === "temperature"
                ? "Real-time global temperature visualization using Open-Meteo API"
                : mapType === "ndvi"
                  ? "Satellite vegetation health monitoring with NDVI (Sentinel-2)"
                  : "Interactive wind and weather visualization from Windy.com"
            }
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Map Type Selector */}
          <Select value={mapType} onValueChange={(v: "normal" | "temperature" | "ndvi" | "windy") => setMapType(v)}>
            <SelectTrigger className="w-48 glass-input">
              <SelectValue placeholder="Select map type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Normal Map
                </div>
              </SelectItem>
              <SelectItem value="temperature">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Temperature Map
                </div>
              </SelectItem>
              <SelectItem value="ndvi">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  NDVI Vegetation Map
                </div>
              </SelectItem>
              <SelectItem value="windy">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Windy.com Weather
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {mapType === "normal" && (
            <>
              {!isDrawing ? (
                <>
                  <Button onClick={handleStartDrawing} className="glow-button">
                    <MapPin className="w-4 h-4 mr-2" />
                    Draw Territory
                  </Button>
                  {selectedTerritory && (
                    <Button onClick={handleGenerateAIPlan} variant="outline" className="glass-button">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {selectedTerritory.aiPlan ? "View AI Plan" : "Get AI Plan"}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {currentPoints.length >= 3 && currentArea > 0 && (
                    <Badge
                      variant="outline"
                      className={`glass-card px-3 py-2 ${hasIntersection ? 'border-red-500 bg-red-500/10' : ''}`}
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{currentArea.toFixed(2)} ha</span>
                      <span className="text-muted-foreground ml-1">({currentPoints.length} points)</span>
                    </Badge>
                  )}
                  {hasIntersection && (
                    <Badge variant="destructive" className="px-3 py-2 animate-pulse">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Fix crossing lines!
                    </Badge>
                  )}
                  <Button
                    onClick={handleFinishDrawing}
                    className={hasIntersection ? "bg-red-600 hover:bg-red-700" : "glow-button"}
                    disabled={hasIntersection}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Finish Drawing
                  </Button>
                  <Button onClick={handleCancelDrawing} variant="destructive">
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}

          {mapType === "ndvi" && (
            <div className="flex gap-2 items-center">
              <Input
                type="date"
                value={ndviDate}
                onChange={(e) => setNdviDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-40 glass-input"
              />
              <Button
                onClick={async () => {
                  setNdviLoading(true);
                  try {
                    // Реальный запрос к Sentinel Hub API
                    const response = await fetchNDVIData(ndviDate);
                    if (response.success) {
                      toast({
                        title: "NDVI Updated",
                        description: `Satellite data loaded for ${ndviDate}`,
                      });
                    } else {
                      throw new Error(response.error);
                    }
                  } catch (error) {
                    console.error('NDVI update failed:', error);
                    toast({
                      title: "Update Failed",
                      description: "Satellite data not available for this date",
                      variant: "destructive",
                    });
                  } finally {
                    setNdviLoading(false);
                  }
                }}
                disabled={ndviLoading}
                className="glow-button"
              >
                {ndviLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Update NDVI
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6 h-[calc(100%-100px)]">
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 relative"
        >
          {/* Drawing Instructions Overlay */}
          <AnimatePresence>
            {isDrawing && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-none"
              >
                <Card className="glass-card border-primary/40 shadow-xl pointer-events-auto">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="font-semibold text-sm">Drawing Mode</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👆</span>
                        <span>Click to add points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✊</span>
                        <span>Drag to move points</span>
                      </div>
                    </div>
                    {currentPoints.length > 0 && (
                      <div className="pt-2 border-t border-primary/20 text-xs text-muted-foreground">
                        Points added: <span className="font-bold text-primary">{currentPoints.length}</span>
                        {currentPoints.length < 3 && <span className="text-yellow-600 ml-2">Need {3 - currentPoints.length} more</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="glass-card h-full overflow-hidden relative">
            {/* Red Overlay when intersecting */}
            {hasIntersection && (
              <div className="absolute inset-0 z-[999] pointer-events-none">
                <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="glass-card border-red-500/50 p-4 shadow-2xl pointer-events-auto">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />
                      <div>
                        <h3 className="font-bold text-red-600 text-lg">Lines Crossing!</h3>
                        <p className="text-sm text-muted-foreground">Drag points to fix the shape</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <CardContent className="p-0 h-full">
              {mapType === "windy" ? (
                <WindyMapComponent territories={territories} />
              ) : (
                <MapContainer
                  center={mapType === "temperature" ? [20, 0] : mapType === "ndvi" ? [55.7558, 37.6173] : [40.0, -100.0]}
                  zoom={mapType === "temperature" ? 3 : mapType === "ndvi" ? 10 : 4}
                  className="h-full w-full"
                  style={{ minHeight: '500px' }}
                >
                  {mapType === "temperature" ? (
                    /* Temperature Map Layers */
                    <>
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      {tempPoints.length > 0 && <HeatmapCanvas tempPoints={tempPoints} />}

                      {/* Show territories on temperature map */}
                      {territories.map((territory, index) => {
                        const territoryTemp = getTerritoryTemperature(territory);
                        return (
                          <React.Fragment key={`temp-${territory.id}`}>
                            <Polygon
                              positions={territory.points}
                              pathOptions={{
                                color: getTerritoryColor(index),
                                fillColor: getTerritoryColor(index),
                                fillOpacity: 0.3,
                                weight: 3
                              }}
                              eventHandlers={{
                                click: () => setSelectedTerritory(territory)
                              }}
                            >
                              <Popup>
                                <div className="p-2 min-w-[200px]">
                                  <h3 className="font-bold text-lg mb-2">{territory.name}</h3>

                                  {territoryTemp !== null && (
                                    <div className="mb-2 p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-red-500/20">
                                      <div className="flex items-center gap-2">
                                        <Thermometer className="w-5 h-5" />
                                        <div>
                                          <p className="text-xs text-muted-foreground">Current Temperature</p>
                                          <p className="text-2xl font-bold" style={{
                                            color: tempToColor(territoryTemp)
                                          }}>
                                            {territoryTemp.toFixed(1)}°C
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {territory.area && (
                                    <p className="text-sm mb-1">
                                      <Maximize2 className="w-3 h-3 inline mr-1" />
                                      Area: {territory.area.toFixed(2)} ha
                                    </p>
                                  )}

                                  {territory.crop && (
                                    <p className="text-sm mb-1">
                                      <Sprout className="w-3 h-3 inline mr-1" />
                                      {territory.crop}
                                    </p>
                                  )}

                                  {territory.soilType && (
                                    <p className="text-sm mb-1">
                                      <Droplets className="w-3 h-3 inline mr-1" />
                                      {territory.soilType}
                                    </p>
                                  )}

                                  {territory.plantingDate && (
                                    <p className="text-sm">
                                      <Calendar className="w-3 h-3 inline mr-1" />
                                      {new Date(territory.plantingDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </Popup>
                            </Polygon>
                          </React.Fragment>
                        );
                      })}
                    </>
                  ) : mapType === "ndvi" ? (
                    /* NDVI Map Layers */
                    <>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {/* NDVI Real Satellite Data - реальные спутниковые данные */}
                      <NDVITileLayerSimple
                        instanceId="6171865c-a9c0-4f4c-9c21-eaba962536d8"
                        date={ndviDate}
                        onDataLoaded={(success, data) => {
                          if (success) {
                            console.log('NDVI satellite data loaded:', data);
                          } else {
                            console.log('NDVI satellite data not available');
                          }
                        }}
                      />

                      {/* Show territories on NDVI map */}
                      {territories.map((territory, index) => (
                        <Polygon
                          key={`ndvi-${territory.id}`}
                          positions={territory.points}
                          pathOptions={{
                            color: getTerritoryColor(index),
                            fillColor: getTerritoryColor(index),
                            fillOpacity: 0.1,
                            weight: 2
                          }}
                          eventHandlers={{
                            click: () => setSelectedTerritory(territory)
                          }}
                        >
                          <Popup>
                            <div className="p-2 min-w-[200px]">
                              <h3 className="font-bold text-lg mb-2">{territory.name}</h3>
                              {territory.area && (
                                <p className="text-sm mb-1">
                                  <Maximize2 className="w-3 h-3 inline mr-1" />
                                  Area: {territory.area.toFixed(2)} ha
                                </p>
                              )}
                              {territory.crop && (
                                <p className="text-sm mb-1">
                                  <Sprout className="w-3 h-3 inline mr-1" />
                                  {territory.crop}
                                </p>
                              )}
                              <div className="mt-2 pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground">
                                  NDVI data from Sentinel-2 satellite
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Date: {ndviDate}
                                </p>
                              </div>
                            </div>
                          </Popup>
                        </Polygon>
                      ))}
                    </>
                  ) : (
                    /* Normal Map Layers */
                    <>
                      {/* Satellite imagery layer */}
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
                        maxZoom={19}
                      />
                      {/* Labels and boundaries overlay */}
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        maxZoom={19}
                      />
                      <MapClickHandler isDrawing={isDrawing} onAddPoint={handleAddPoint} />
                      <ZoomToTerritory territory={selectedTerritory} />

                      {/* Current drawing polygon */}
                      {currentPoints.length > 0 && (
                        <>
                          <Polygon
                            positions={currentPoints}
                            pathOptions={{
                              color: hasIntersection ? '#ef4444' : '#22c55e',
                              fillColor: hasIntersection ? '#ef4444' : '#22c55e',
                              fillOpacity: hasIntersection ? 0.5 : 0.3,
                              weight: hasIntersection ? 4 : 3,
                              dashArray: '10, 5',
                              className: hasIntersection ? 'animate-pulse' : ''
                            }}
                          />
                          {/* Draggable vertex points during drawing */}
                          {currentPoints.map((point, index) => (
                            <Marker
                              key={`drawing-point-${index}`}
                              position={point}
                              icon={createDraggablePointIcon(index)}
                              draggable={true}
                              eventHandlers={{
                                dragend: (e) => {
                                  const marker = e.target;
                                  const position = marker.getLatLng();
                                  handleUpdatePoint(index, position.lat, position.lng);
                                  toast({
                                    title: "Point Updated",
                                    description: `Point ${index + 1} moved to new position`,
                                    duration: 2000
                                  });
                                },
                                mouseover: (e) => {
                                  e.target.setIcon(createDraggablePointIcon(index, true));
                                },
                                mouseout: (e) => {
                                  e.target.setIcon(createDraggablePointIcon(index, false));
                                }
                              }}
                            >
                              <Popup>
                                <div className="text-xs space-y-2">
                                  <div>
                                    <strong className="text-primary">📍 Point {index + 1}</strong>
                                  </div>
                                  <div className="space-y-1 text-muted-foreground">
                                    <div>🌐 Latitude: {point[0].toFixed(6)}</div>
                                    <div>🌍 Longitude: {point[1].toFixed(6)}</div>
                                  </div>
                                  <div className="pt-2 border-t">
                                    <p className="text-xs text-green-600 font-semibold">
                                      💡 Click and drag to move point
                                    </p>
                                  </div>
                                  {currentPoints.length > 3 && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="w-full h-6 text-xs"
                                      onClick={() => handleRemovePoint(index)}
                                    >
                                      🗑️ Delete Point
                                    </Button>
                                  )}
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </>
                      )}

                      {/* Saved territories */}
                      {territories.map((territory, index) => (
                        <React.Fragment key={territory.id}>
                          <Polygon
                            positions={territory.points}
                            pathOptions={{
                              color: getTerritoryColor(index),
                              fillColor: getTerritoryColor(index),
                              fillOpacity: selectedTerritory?.id === territory.id ? 0.5 : 0.2,
                              weight: selectedTerritory?.id === territory.id ? 4 : 2
                            }}
                            eventHandlers={{
                              click: () => setSelectedTerritory(territory)
                            }}
                          >
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-bold">{territory.name}</h3>
                                {territory.area && (
                                  <p className="text-sm text-primary font-semibold">
                                    <Maximize2 className="w-3 h-3 inline mr-1" />
                                    Area: {territory.area.toFixed(2)} ha
                                  </p>
                                )}
                                {territory.crop && (
                                  <p className="text-sm">
                                    <Sprout className="w-3 h-3 inline mr-1" />
                                    {territory.crop}
                                  </p>
                                )}
                                {territory.soilType && (
                                  <p className="text-sm">
                                    <Droplets className="w-3 h-3 inline mr-1" />
                                    {territory.soilType}
                                  </p>
                                )}
                                {territory.plantingDate && (
                                  <p className="text-sm">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {new Date(territory.plantingDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </Popup>
                          </Polygon>
                          {/* Draggable vertex points for saved territories */}
                          {selectedTerritory?.id === territory.id && isEditingTerritory && territory.points.map((point, pointIndex) => (
                            <Marker
                              key={`${territory.id}-point-${pointIndex}`}
                              position={point}
                              icon={L.divIcon({
                                className: 'custom-marker',
                                html: `
                                <div style="position: relative; width: 18px; height: 18px;">
                                  <div style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    width: 24px;
                                    height: 24px;
                                    background: radial-gradient(circle, ${getTerritoryColor(index)}40 0%, transparent 70%);
                                    border-radius: 50%;
                                  "></div>
                                  <div style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    width: 14px;
                                    height: 14px;
                                    background: linear-gradient(135deg, ${getTerritoryColor(index)} 0%, ${getTerritoryColor(index)}dd 100%);
                                    border: 2px solid white;
                                    border-radius: 50%;
                                    box-shadow: 0 3px 8px rgba(0,0,0,0.25), 0 0 0 3px ${getTerritoryColor(index)}30;
                                    cursor: move;
                                    transition: all 0.2s ease;
                                  "></div>
                                  <div style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    color: white;
                                    font-weight: bold;
                                    font-size: 8px;
                                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                                    pointer-events: none;
                                  ">${pointIndex + 1}</div>
                                </div>
                              `,
                                iconSize: [18, 18],
                                iconAnchor: [9, 9],
                                popupAnchor: [0, -9]
                              })}
                              draggable={true}
                              eventHandlers={{
                                dragend: (e) => {
                                  const marker = e.target;
                                  const position = marker.getLatLng();
                                  handleUpdateTerritoryPoint(territory.id, pointIndex, position.lat, position.lng);
                                  toast({
                                    title: "Territory Updated",
                                    description: `${territory.name} - Point ${pointIndex + 1} moved`,
                                    duration: 2000
                                  });
                                }
                              }}
                            >
                              <Popup>
                                <div className="text-xs space-y-2">
                                  <div>
                                    <strong className="text-primary">📍 {territory.name} - Point {pointIndex + 1}</strong>
                                  </div>
                                  <div className="space-y-1 text-muted-foreground">
                                    <div>🌐 Latitude: {point[0].toFixed(6)}</div>
                                    <div>🌍 Longitude: {point[1].toFixed(6)}</div>
                                  </div>
                                  <div className="pt-2 border-t">
                                    <p className="text-xs font-semibold" style={{ color: getTerritoryColor(index) }}>
                                      💡 Drag to modify territory
                                    </p>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </MapContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar - Territories List or Temperature Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          {mapType === "temperature" ? (
            /* Temperature Info Sidebar */
            <div className="space-y-4">
              {/* Territories Temperature List */}
              {territories.length > 0 && (
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Territories Temperature</CardTitle>
                    <CardDescription>Current temperature for your farms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {territories.map((territory, index) => {
                          const temp = getTerritoryTemperature(territory);
                          return (
                            <div
                              key={territory.id}
                              className="p-2 rounded-lg glass-card hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => setSelectedTerritory(territory)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getTerritoryColor(index) }}
                                  />
                                  <div>
                                    <p className="font-semibold text-sm">{territory.name}</p>
                                    <p className="text-xs text-muted-foreground">{territory.crop || 'No crop'}</p>
                                  </div>
                                </div>
                                {temp !== null && (
                                  <div className="text-right">
                                    <p
                                      className="text-lg font-bold"
                                      style={{ color: tempToColor(temp) }}
                                    >
                                      {temp.toFixed(1)}°C
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
              {tempError && (
                <Card className="glass-card border-yellow-600">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>{tempError}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Status</span>
                    {tempLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Points</span>
                    <Badge variant="outline">{tempPoints.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Update</span>
                    <Badge variant="outline">{lastUpdated}</Badge>
                  </div>
                </CardContent>
              </Card>

              {tempStats && (
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Global Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Minimum</span>
                      <span className="font-bold text-blue-400">{tempStats.min.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Average</span>
                      <span className="font-bold text-green-400">{tempStats.avg.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Maximum</span>
                      <span className="font-bold text-red-400">{tempStats.max.toFixed(1)}°C</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Temperature Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {[
                      { color: "#000080", label: "< -20°C" },
                      { color: "#4169E1", label: "0°C" },
                      { color: "#87CEEB", label: "15°C" },
                      { color: "#FFD700", label: "25°C" },
                      { color: "#FFA500", label: "30°C" },
                      { color: "#FF4500", label: "40°C" },
                      { color: "#DC143C", label: "> 40°C" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : mapType === "ndvi" ? (
            /* NDVI Info Sidebar */
            <div className="space-y-4">
              <Card className="glass-card border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-500" />
                    NDVI Legend
                  </CardTitle>
                  <CardDescription>Vegetation Index Values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {[
                      { range: "0.6 - 1.0", color: "#004400", label: "Very Dense" },
                      { range: "0.5 - 0.6", color: "#0f540a", label: "Dense" },
                      { range: "0.4 - 0.5", color: "#306d1c", label: "Healthy" },
                      { range: "0.3 - 0.4", color: "#4f892d", label: "Moderate" },
                      { range: "0.2 - 0.3", color: "#70a33f", label: "Light" },
                      { range: "0.1 - 0.2", color: "#91bf51", label: "Sparse" },
                      { range: "0.0 - 0.1", color: "#ccc682", label: "Very Sparse" },
                      { range: "< 0", color: "#eaeaea", label: "Bare/Water" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: item.color }}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono">{item.range}</span>
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {territories.length > 0 && (
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Your Territories</CardTitle>
                    <CardDescription>Click to view on map</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {territories.map((territory, index) => (
                          <div
                            key={territory.id}
                            className="p-2 rounded-lg glass-card hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => setSelectedTerritory(territory)}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getTerritoryColor(index) }}
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{territory.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {territory.crop || 'No crop'} • {territory.area?.toFixed(1)} ha
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">About NDVI</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">NDVI</strong> (Normalized Difference Vegetation Index) measures vegetation health and density.
                  </p>
                  <p className="font-mono text-[10px]">
                    NDVI = (NIR - RED) / (NIR + RED)
                  </p>
                  <div className="pt-2 space-y-1">
                    <p><strong>Source:</strong> Sentinel-2 satellite</p>
                    <p><strong>Resolution:</strong> 10m per pixel</p>
                    <p><strong>Update:</strong> Every 5 days</p>
                    <p><strong>Date:</strong> {ndviDate}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-yellow-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Applications</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1 text-muted-foreground">
                  <p>✓ Crop health monitoring</p>
                  <p>✓ Irrigation optimization</p>
                  <p>✓ Disease detection</p>
                  <p>✓ Biomass estimation</p>
                  <p>✓ Yield prediction</p>
                </CardContent>
              </Card>
            </div>
          ) : mapType === "windy" ? (
            /* Windy.com Weather Info Sidebar */
            <div className="space-y-4">
              {/* Windy.com Map Info */}
              <Card className="glass-card border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-400" />
                    Windy.com Weather Map
                  </CardTitle>
                  <CardDescription>Interactive wind and weather visualization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-300">Live Weather Data</span>
                    </div>
                    <p className="text-xs text-blue-200">
                      Real-time wind patterns, temperature, precipitation, and cloud coverage from Windy.com
                    </p>
                  </div>

                  <div className="space-y-2 text-sm mt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Source:</span>
                      <span className="font-medium">Windy.com API</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Update Frequency:</span>
                      <span className="font-medium">Real-time</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coverage:</span>
                      <span className="font-medium">Global</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Layers:</span>
                      <span className="font-medium">Wind, Temp, Precip, Clouds</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Capabilities */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weather Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Real-time wind patterns and speed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Temperature visualization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Precipitation radar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Cloud coverage analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Territory overlay integration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Territory Weather Monitoring */}
              {territories.length > 0 && (
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-blue-400" />
                      Monitored Territories
                    </CardTitle>
                    <CardDescription>Areas under weather surveillance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {territories.map((territory, index) => (
                          <div
                            key={territory.id}
                            className="p-2 rounded-lg glass-card hover:bg-muted/30 transition-colors cursor-pointer border border-blue-500/20"
                            onClick={() => setSelectedTerritory(territory)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full border border-blue-400"
                                  style={{ backgroundColor: '#3b82f630' }}
                                />
                                <div>
                                  <p className="font-semibold text-sm">{territory.name}</p>
                                  <p className="text-xs text-muted-foreground">{territory.crop || 'No crop specified'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium text-green-400">Monitoring</p>
                                <p className="text-xs text-muted-foreground">{territory.area?.toFixed(2)} ha</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Territories List Sidebar */
            <div className="space-y-4 h-full flex flex-col">
              {selectedTerritory && (
                <Card className="glass-card border-primary/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Selected Territory</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={isEditingTerritory ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            setIsEditingTerritory(!isEditingTerritory);
                            toast({
                              title: isEditingTerritory ? "Edit Mode Disabled" : "🎯 Edit Mode Enabled",
                              description: isEditingTerritory ? "Territory locked" : "Drag points to reshape territory",
                              duration: 3000
                            });
                          }}
                          className="h-6 px-2"
                        >
                          {isEditingTerritory ? <Move className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTerritory(null);
                            setIsEditingTerritory(false);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <h3 className="font-bold text-lg">{selectedTerritory.name}</h3>
                    </div>
                    {isEditingTerritory && (
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2">
                          <Move className="w-4 h-4 text-blue-500 animate-pulse" />
                          <p className="text-xs font-semibold text-blue-600">
                            Edit mode active - drag points on map
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedTerritory.area && (
                      <div className="p-2 rounded bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2">
                          <Maximize2 className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Area</p>
                            <p className="text-lg font-bold text-primary">{selectedTerritory.area.toFixed(2)} ha</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedTerritory.crop && (
                      <div className="flex items-center gap-2 text-sm">
                        <Sprout className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Crop</p>
                          <p className="font-semibold">{selectedTerritory.crop}</p>
                        </div>
                      </div>
                    )}
                    {selectedTerritory.plantingDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Planting Date</p>
                          <p className="font-semibold">{new Date(selectedTerritory.plantingDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    {selectedTerritory.aiPlan && (
                      <Badge variant="secondary" className="w-full justify-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Plan Available
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card flex-1 min-h-0">
                <CardHeader>
                  <CardTitle className="text-lg">Your Territories</CardTitle>
                  <CardDescription>{territories.length} territories mapped</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-450px)]">
                    <div className="space-y-3">
                      {territories.map((territory, index) => (
                        <motion.div
                          key={territory.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 rounded-lg glass-card cursor-pointer transition-all ${selectedTerritory?.id === territory.id ? 'border-2 border-primary' : ''
                            }`}
                          onClick={() => setSelectedTerritory(territory)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getTerritoryColor(index) }}
                                />
                                <h4 className="font-semibold text-sm">{territory.name}</h4>
                              </div>
                              {territory.area && (
                                <p className="text-xs font-semibold text-primary flex items-center gap-1">
                                  <Maximize2 className="w-3 h-3" />
                                  {territory.area.toFixed(2)} ha
                                </p>
                              )}
                              {territory.crop && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Sprout className="w-3 h-3" />
                                  {territory.crop}
                                </p>
                              )}
                              {territory.soilType && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Droplets className="w-3 h-3" />
                                  {territory.soilType}
                                </p>
                              )}
                              {territory.plantingDate && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(territory.plantingDate).toLocaleDateString()}
                                </p>
                              )}
                              {territory.aiPlan && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Plan Ready
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTerritory(territory.id);
                              }}
                              className="hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      {territories.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No territories yet</p>
                          <p className="text-xs">Click "Draw Territory" to start</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>

      {/* Intersection Warning Dialog */}
      <Dialog open={showIntersectionWarning} onOpenChange={setShowIntersectionWarning}>
        <DialogContent className="sm:max-w-[500px] glass-card border-red-500/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6 animate-pulse" />
              Territory Lines Are Crossing!
            </DialogTitle>
            <DialogDescription>
              The territory boundaries are intersecting, which creates an invalid shape.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/30">
              <div className="flex items-start gap-3">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-600 mb-2">Invalid Territory Shape</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your territory lines are crossing each other. This creates an invalid shape that cannot be saved.
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-red-600">How to fix:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Drag the points to uncross the lines</li>
                      <li>Make sure no lines intersect</li>
                      <li>The territory should form a simple polygon</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Move className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-blue-600 font-semibold">
                Drag the points on the map to fix the shape
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowIntersectionWarning(false)}
              className="w-full"
            >
              OK, I'll Fix It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Territory Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Territory Details</DialogTitle>
            <DialogDescription>
              Enter information about your territory
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {currentArea > 0 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Calculated Area</p>
                    <p className="text-2xl font-bold text-primary">{currentArea.toFixed(2)} ha</p>
                    <p className="text-xs text-muted-foreground">
                      {(currentArea * 10000).toFixed(0)} m² | {(currentArea / 100).toFixed(4)} km²
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="territoryName">Territory Name</Label>
                <Input
                  id="territoryName"
                  value={formData.territoryName}
                  onChange={(e) => setFormData({ ...formData, territoryName: e.target.value })}
                  placeholder="e.g., North Field"
                  className="glass-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="crop">Crop Type</Label>
                <Select
                  value={formData.crop}
                  onValueChange={(value) => setFormData({ ...formData, crop: value })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="🌾 Wheat">🌾 Wheat</SelectItem>
                    <SelectItem value="🌽 Corn">🌽 Corn</SelectItem>
                    <SelectItem value="🫘 Soybeans">🫘 Soybeans</SelectItem>
                    <SelectItem value="🍚 Rice">🍚 Rice</SelectItem>
                    <SelectItem value="🌱 Cotton">🌱 Cotton</SelectItem>
                    <SelectItem value="🌾 Barley">🌾 Barley</SelectItem>
                    <SelectItem value="🥔 Potatoes">🥔 Potatoes</SelectItem>
                    <SelectItem value="🍅 Tomatoes">🍅 Tomatoes</SelectItem>
                    <SelectItem value="🥕 Carrots">🥕 Carrots</SelectItem>
                    <SelectItem value="🥬 Cabbage">🥬 Cabbage</SelectItem>
                    <SelectItem value="🌻 Sunflower">🌻 Sunflower</SelectItem>
                    <SelectItem value="🫑 Peppers">🫑 Peppers</SelectItem>
                    <SelectItem value="🥒 Cucumbers">🥒 Cucumbers</SelectItem>
                    <SelectItem value="🍓 Strawberries">🍓 Strawberries</SelectItem>
                    <SelectItem value="🍉 Watermelon">🍉 Watermelon</SelectItem>
                    <SelectItem value="🍇 Grapes">🍇 Grapes</SelectItem>
                    <SelectItem value="🍎 Apples">🍎 Apples</SelectItem>
                    <SelectItem value="🍊 Oranges">🍊 Oranges</SelectItem>
                    <SelectItem value="🫐 Blueberries">🫐 Blueberries</SelectItem>
                    <SelectItem value="🌿 Herbs">🌿 Herbs</SelectItem>
                    <SelectItem value="🌼 Flowers">🌼 Flowers</SelectItem>
                    <SelectItem value="🥜 Peanuts">🥜 Peanuts</SelectItem>
                    <SelectItem value="🫛 Peas">🫛 Peas</SelectItem>
                    <SelectItem value="🧅 Onions">🧅 Onions</SelectItem>
                    <SelectItem value="🧄 Garlic">🧄 Garlic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={formData.plantingDate}
                  onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="grid gap-2">
                <Label>Soil Type Detection</Label>
                <SoilTypeDetection
                  onSoilTypeDetected={handleSoilTypeDetected}
                  onManualSelect={handleManualSoilSelect}
                />
                {formData.soilType && (
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Selected: {formData.soilType}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTerritory} className="glow-button">
              Save Territory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Plan Dialog */}
      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent className="sm:max-w-[1000px] lg:max-w-[1200px] glass-card max-h-[90vh] overflow-hidden flex flex-col w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Farming Plan
            </DialogTitle>
            <DialogDescription>
              Week-by-week intelligent farming recommendations
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-semibold">Generating AI Plan...</p>
                <p className="text-sm text-muted-foreground">Analyzing NASA satellite data and climate patterns</p>
              </div>
            ) : aiPlan && (
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                {/* Plan Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg glass-card">
                  <div>
                    <p className="text-sm text-muted-foreground">Territory</p>
                    <p className="font-semibold text-base">{aiPlan.territory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Crop</p>
                    <p className="font-semibold text-base">{aiPlan.crop}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Planting Date</p>
                    <p className="font-semibold text-base">{aiPlan.plantingDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Harvest</p>
                    <p className="font-semibold text-base">{aiPlan.harvestDate}</p>
                  </div>
                </div>

                {/* Week Slider */}
                <div className="space-y-4 p-4 rounded-lg glass-card">
                  <div className="flex items-center justify-between">
                    <Label>Week {currentWeek} of {aiPlan.totalWeeks}</Label>
                    <Badge variant="outline">
                      {Math.round((currentWeek / aiPlan.totalWeeks) * 100)}% Complete
                    </Badge>
                  </div>
                  <Slider
                    value={[currentWeek]}
                    onValueChange={(value) => setCurrentWeek(value[0])}
                    min={1}
                    max={aiPlan.totalWeeks}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Week 1</span>
                    <span>Week {Math.floor(aiPlan.totalWeeks / 2)}</span>
                    <span>Week {aiPlan.totalWeeks}</span>
                  </div>
                </div>

                {/* Week Plan Details */}
                <ScrollArea className="flex-1 overflow-auto">
                  <AnimatePresence mode="wait">
                    {aiPlan.weeklyPlans[currentWeek - 1] && (
                      <motion.div
                        key={currentWeek}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                          <h3 className="text-lg font-bold mb-2">
                            {aiPlan.weeklyPlans[currentWeek - 1].title}
                          </h3>
                        </div>

                        {/* Tasks - Full Width */}
                        <Card className="glass-card">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                              Tasks for This Week
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {aiPlan.weeklyPlans[currentWeek - 1].tasks.map((task, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary mt-0.5 text-base">✓</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        {/* Bottom Cards Grid - 3 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Irrigation */}
                          <Card className="glass-card">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-blue-400" />
                                Irrigation Schedule
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{aiPlan.weeklyPlans[currentWeek - 1].irrigation}</p>
                            </CardContent>
                          </Card>

                          {/* Fertilizer */}
                          <Card className="glass-card">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Sprout className="w-4 h-4 text-green-400" />
                                Fertilizer Application
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{aiPlan.weeklyPlans[currentWeek - 1].fertilizer}</p>
                            </CardContent>
                          </Card>

                          {/* Monitoring */}
                          <Card className="glass-card">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-400" />
                                Monitoring Focus
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{aiPlan.weeklyPlans[currentWeek - 1].monitoring}</p>
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
