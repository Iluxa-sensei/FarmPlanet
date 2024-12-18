import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Cloud, Droplets, Thermometer, Eye, AlertCircle } from 'lucide-react';

interface WindyMapComponentProps {
    territories: any[];
}

export default function WindyMapComponent({ territories }: WindyMapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [windyLoaded, setWindyLoaded] = useState(false);
    const [windyError, setWindyError] = useState<string | null>(null);
    const [currentLayer, setCurrentLayer] = useState('wind');
    const [isFullscreen, setIsFullscreen] = useState(false);

  // Простая инициализация - iframe загружается напрямую в JSX
  useEffect(() => {
    setWindyLoaded(false);
    setWindyError(null);
  }, []);

  const changeLayer = (layer: string) => {
    setCurrentLayer(layer);
    // iframe автоматически обновится через getWindyUrl(currentLayer)
  };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const layers = [
        { id: 'wind', name: 'Wind', icon: Wind, color: 'text-blue-400' },
        { id: 'temp', name: 'Temperature', icon: Thermometer, color: 'text-red-400' },
        { id: 'precip', name: 'Precipitation', icon: Droplets, color: 'text-blue-500' },
        { id: 'clouds', name: 'Clouds', icon: Cloud, color: 'text-gray-400' },
    ];

    if (windyError) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center glass-card">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-medium">Failed to load Windy.com</p>
                    <p className="text-muted-foreground text-sm mt-2">{windyError}</p>
                    <Button
                        onClick={() => {
                            setWindyError(null);
                            setWindyLoaded(false);
                        }}
                        className="mt-4"
                        variant="outline"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

  // Простой подход с прямым iframe в JSX
  const getWindyUrl = (layer: string) => {
    let overlay = 'wind';
    switch (layer) {
      case 'temp':
        overlay = 'temp';
        break;
      case 'precip':
        overlay = 'rain';
        break;
      case 'clouds':
        overlay = 'clouds';
        break;
      default:
        overlay = 'wind';
    }
    
    return `https://embed.windy.com/embed2.html?lat=40.0&lon=-100.0&detailLat=40.0&detailLon=-100.0&width=650&height=450&zoom=4&level=surface&overlay=${overlay}&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;
  };

  return (
    <div className="w-full">
      {/* Windy Map Controls */}
      <div className="flex gap-2 mb-4 p-4 glass-card">
        <div className="flex gap-2 flex-wrap">
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <Button
                key={layer.id}
                variant={currentLayer === layer.id ? "default" : "outline"}
                size="sm"
                onClick={() => changeLayer(layer.id)}
                className="glass-input"
              >
                <Icon className={`w-4 h-4 mr-2 ${layer.color}`} />
                {layer.name}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="glass-input ml-auto"
        >
          <Eye className="w-4 h-4 mr-2" />
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
      </div>

      {/* Windy Map Container */}
      <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-[600px]'} rounded-lg overflow-hidden`}>
        <iframe
          src={getWindyUrl(currentLayer)}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none', borderRadius: '8px' }}
          title="Windy.com Weather Map"
          onLoad={() => {
            console.log('Windy iframe loaded successfully');
            setWindyLoaded(true);
            setWindyError(null);
          }}
          onError={() => {
            console.error('Windy iframe failed to load');
            setWindyError('Failed to load Windy.com weather map');
            setWindyLoaded(false);
          }}
        />
      </div>

            {/* Territory Information */}
            {territories.length > 0 && (
                <Card className="glass-card mt-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Wind className="w-4 h-4 text-blue-400" />
                            Territory Weather Monitoring
                        </CardTitle>
                        <CardDescription>
                            Real-time weather data for your agricultural territories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {territories.map((territory, index) => (
                                <div
                                    key={territory.id || index}
                                    className="p-3 rounded-lg glass-card border border-blue-500/20"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-sm">{territory.name || `Territory ${index + 1}`}</span>
                                        <div
                                            className="w-3 h-3 rounded-full border border-blue-400"
                                            style={{ backgroundColor: territory.color || '#3b82f630' }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <div className="flex justify-between">
                                            <span>Area:</span>
                                            <span>{territory.area?.toFixed(2)} ha</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Crop:</span>
                                            <span>{territory.crop || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <span className="text-green-400">Monitoring</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
