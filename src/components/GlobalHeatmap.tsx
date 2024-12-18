import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface GlobalHeatmapProps {
  currentKp?: number;
}

const GlobalHeatmap: React.FC<GlobalHeatmapProps> = ({ currentKp = 4.2 }) => {
  // Aurora oval zones based on Kp index
  const getAuroraZones = () => {
    const zones = [];

    // Arctic zone (always visible for high Kp)
    if (currentKp >= 3) {
      zones.push({
        center: [70, 0] as [number, number],
        radius: 2000000,
        color: currentKp >= 6 ? '#ef4444' : currentKp >= 4 ? '#facc15' : '#22c55e',
        label: 'Arctic Circle',
        risk: currentKp >= 6 ? 'High' : currentKp >= 4 ? 'Moderate' : 'Low'
      });
    }

    // Northern latitudes
    if (currentKp >= 4) {
      zones.push({
        center: [60, 0] as [number, number],
        radius: 3000000,
        color: currentKp >= 7 ? '#ef4444' : currentKp >= 5 ? '#facc15' : '#22c55e',
        label: 'Northern High Latitudes',
        risk: currentKp >= 7 ? 'High' : currentKp >= 5 ? 'Moderate' : 'Low'
      });
    }

    // Mid-northern latitudes (only for extreme Kp)
    if (currentKp >= 6) {
      zones.push({
        center: [45, 0] as [number, number],
        radius: 3500000,
        color: currentKp >= 8 ? '#ef4444' : '#facc15',
        label: 'Northern Mid-Latitudes',
        risk: currentKp >= 8 ? 'High' : 'Moderate'
      });
    }

    // Antarctic zone
    if (currentKp >= 3) {
      zones.push({
        center: [-70, 0] as [number, number],
        radius: 2000000,
        color: currentKp >= 6 ? '#ef4444' : currentKp >= 4 ? '#facc15' : '#22c55e',
        label: 'Antarctic Circle',
        risk: currentKp >= 6 ? 'High' : currentKp >= 4 ? 'Moderate' : 'Low'
      });
    }

    // Southern latitudes
    if (currentKp >= 4) {
      zones.push({
        center: [-60, 0] as [number, number],
        radius: 3000000,
        color: currentKp >= 7 ? '#ef4444' : currentKp >= 5 ? '#facc15' : '#22c55e',
        label: 'Southern High Latitudes',
        risk: currentKp >= 7 ? 'High' : currentKp >= 5 ? 'Moderate' : 'Low'
      });
    }

    return zones;
  };

  const zones = getAuroraZones();

  return (
    <div className="relative w-full">
      <Card className="glass-card p-6 overflow-hidden">
        <div className="h-[500px] rounded-lg overflow-hidden">
          <MapContainer
            center={[30, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {zones.map((zone, index) => (
              <Circle
                key={index}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  fillColor: zone.color,
                  fillOpacity: 0.4,
                  color: zone.color,
                  weight: 2,
                  opacity: 0.8
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold text-foreground mb-2">{zone.label}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <Badge
                          variant={
                            zone.risk === 'High' ? 'destructive' :
                              zone.risk === 'Moderate' ? 'default' :
                                'secondary'
                          }
                        >
                          {zone.risk}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Current Kp:</span>
                        <span className="font-semibold">{currentKp}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-muted-foreground">High Risk (Kp ≥ 6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-muted-foreground">Moderate Risk (Kp 4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-muted-foreground">Low Risk (Kp &lt; 4)</span>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-4 flex justify-center">
          <Badge variant="outline" className="text-lg px-6 py-2">
            <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
            Current Kp-Index: <span className="font-bold ml-2 text-primary">{currentKp}</span>
          </Badge>
        </div>
      </Card>
    </div>
  );
};

export default GlobalHeatmap;
