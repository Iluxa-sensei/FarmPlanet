import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface NDVIRealLayerProps {
  instanceId: string;
  date: string;
  onDataLoaded?: (success: boolean, data?: any) => void;
}

export default function NDVIRealLayer({ instanceId, date, onDataLoaded }: NDVIRealLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRealData, setHasRealData] = useState(false);

  useEffect(() => {
    const loadNDVIData = async () => {
      setIsLoading(true);
      
      try {
        // Проверяем доступность данных
        const checkUrl = `https://services.sentinel-hub.com/api/v1/process/check`;
        
        const checkResponse = await fetch(checkUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: {
              bounds: {
                bbox: [37.3, 55.5, 38.0, 56.0], // Москва область
                properties: {
                  crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
                }
              },
              data: [{
                type: "sentinel-2-l2a",
                dataFilter: {
                  timeRange: {
                    from: `${date}T00:00:00Z`,
                    to: `${date}T23:59:59Z`
                  },
                  maxCloudCoverage: 20
                }
              }],
              output: {
                width: 512,
                height: 512,
                responses: [{
                  identifier: "default",
                  format: {
                    type: "image/tiff"
                  }
                }]
              }
            },
            evalscript: `
              //VERSION=3
              function setup() {
                return {
                  input: ["B04", "B08"],
                  output: { bands: 1, sampleType: "FLOAT32" }
                };
              }
              
              function evaluatePixel(sample) {
                let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
                return [ndvi];
              }
            `
          })
        });

        if (checkResponse.ok) {
          const checkResult = await checkResponse.json();
          
          if (checkResult.data && checkResult.data.length > 0) {
            // Данные доступны, создаем WMS слой
            setHasRealData(true);
            
            // Удаляем предыдущий слой
            if (layerRef.current) {
              map.removeLayer(layerRef.current);
            }

            // Создаем WMS слой с реальными данными
            const wmsLayer = L.tileLayer.wms(`https://services.sentinel-hub.com/ogc/wms/${instanceId}`, {
              layers: 'NDVI',
              format: 'image/png',
              transparent: true,
              opacity: 0.7,
              attribution: '&copy; <a href="https://www.sentinel-hub.com/">Sentinel Hub</a>',
              time: `${date}/${date}`,
              maxcc: 20
            });

            wmsLayer.addTo(map);
            layerRef.current = wmsLayer;
            
            onDataLoaded?.(true, checkResult.data);
          } else {
            // Данные недоступны, используем демо слой
            setHasRealData(false);
            createDemoLayer();
            onDataLoaded?.(false, null);
          }
        } else {
          // API недоступен, используем демо слой
          setHasRealData(false);
          createDemoLayer();
          onDataLoaded?.(false, null);
        }
      } catch (error) {
        console.error('Failed to load NDVI data:', error);
        setHasRealData(false);
        createDemoLayer();
        onDataLoaded?.(false, null);
      } finally {
        setIsLoading(false);
      }
    };

    const createDemoLayer = () => {
      // Удаляем предыдущий слой
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }

      // Создаем демо слой с CSS градиентами
      const demoOverlay = document.createElement('div');
      demoOverlay.style.position = 'absolute';
      demoOverlay.style.top = '0';
      demoOverlay.style.left = '0';
      demoOverlay.style.width = '100%';
      demoOverlay.style.height = '100%';
      demoOverlay.style.pointerEvents = 'none';
      demoOverlay.style.zIndex = '1000';
      demoOverlay.style.background = `
        radial-gradient(circle at 20% 30%, rgba(0, 150, 0, 0.6) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 200, 0, 0.5) 0%, transparent 40%),
        radial-gradient(circle at 40% 70%, rgba(100, 200, 0, 0.4) 0%, transparent 60%),
        radial-gradient(circle at 70% 80%, rgba(200, 200, 0, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 10% 80%, rgba(150, 100, 0, 0.4) 0%, transparent 45%),
        linear-gradient(45deg, 
          rgba(0, 100, 0, 0.3) 0%, 
          rgba(0, 200, 0, 0.2) 25%, 
          rgba(100, 200, 0, 0.3) 50%, 
          rgba(200, 200, 0, 0.2) 75%, 
          rgba(150, 100, 0, 0.3) 100%
        )
      `;
      demoOverlay.id = 'ndvi-demo-overlay';

      // Добавляем в контейнер карты
      const mapContainer = map.getContainer();
      const existingOverlay = mapContainer.querySelector('#ndvi-demo-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      mapContainer.appendChild(demoOverlay);

      // Создаем фиктивный слой для управления
      const demoLayer = L.layerGroup();
      layerRef.current = demoLayer as any;
    };

    loadNDVIData();

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      
      const mapContainer = map.getContainer();
      const existingOverlay = mapContainer.querySelector('#ndvi-demo-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
    };
  }, [instanceId, date, map, onDataLoaded]);

  return null;
}
