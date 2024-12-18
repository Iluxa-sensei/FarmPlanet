import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface NDVIWMSLayerProps {
  instanceId: string;
  date: string;
  onDataLoaded?: (success: boolean, data?: any) => void;
}

export default function NDVIWMSLayer({ instanceId, date, onDataLoaded }: NDVIWMSLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer.WMS | null>(null);
  const demoOverlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadNDVIWMS = async () => {
      try {
        // Удаляем предыдущие слои
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
        }
        if (demoOverlayRef.current) {
          demoOverlayRef.current.remove();
        }

        // Создаем WMS URL для NDVI
        const wmsUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}`;
        
        // Пробуем создать WMS слой с правильными параметрами
        const wmsLayer = L.tileLayer.wms(wmsUrl, {
          layers: 'NDVI',
          format: 'image/png',
          transparent: true,
          opacity: 0.7,
          attribution: '&copy; <a href="https://www.sentinel-hub.com/">Sentinel Hub</a>',
          time: `${date}/${date}`,
          maxcc: 20,
          // Убираем crs параметр - Leaflet сам определит CRS
          version: '1.3.0'
        });

        // Добавляем обработчик ошибок
        wmsLayer.on('tileerror', (error) => {
          console.warn('WMS tile error, falling back to demo data:', error);
          // Переключаемся на демо данные при ошибке
          createDemoOverlay();
          onDataLoaded?.(false, null);
        });

        // Добавляем слой на карту
        wmsLayer.addTo(map);
        layerRef.current = wmsLayer;
        
        // Проверяем доступность через тестовый запрос
        const testUrl = `${wmsUrl}?SERVICE=WMS&REQUEST=GetMap&LAYERS=NDVI&FORMAT=image/png&WIDTH=256&HEIGHT=256&BBOX=37.3,55.5,38.0,56.0&TIME=${date}/${date}&MAXCC=20&VERSION=1.3.0&SRS=EPSG:4326`;
        
        try {
          const testResponse = await fetch(testUrl);
          if (testResponse.ok) {
            console.log('WMS service is available');
            onDataLoaded?.(true, { wmsUrl, date });
          } else {
            throw new Error(`WMS test failed: ${testResponse.status}`);
          }
        } catch (error) {
          console.warn('WMS test failed, using demo data:', error);
          createDemoOverlay();
          onDataLoaded?.(false, null);
        }

      } catch (error) {
        console.error('Failed to load NDVI WMS:', error);
        createDemoOverlay();
        onDataLoaded?.(false, null);
      }
    };

    const createDemoOverlay = () => {
      // Создаем демо overlay с CSS градиентами
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
      demoOverlayRef.current = demoOverlay;

      // Добавляем в контейнер карты
      const mapContainer = map.getContainer();
      const existingOverlay = mapContainer.querySelector('#ndvi-demo-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      mapContainer.appendChild(demoOverlay);
    };

    loadNDVIWMS();

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      if (demoOverlayRef.current) {
        demoOverlayRef.current.remove();
      }
    };
  }, [instanceId, date, map, onDataLoaded]);

  return null;
}
