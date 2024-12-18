import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface NDVITileLayerSimpleProps {
  instanceId: string;
  date: string;
  onDataLoaded?: (success: boolean, data?: any) => void;
}

export default function NDVITileLayerSimple({ instanceId, date, onDataLoaded }: NDVITileLayerSimpleProps) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    const loadNDVITiles = async () => {
      try {
        // Удаляем предыдущий слой
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
        }

        // Создаем кастомный TileLayer с правильной обработкой bbox
        const ndviLayer = L.tileLayer('', {
          opacity: 0.7,
          attribution: '&copy; <a href="https://www.sentinel-hub.com/">Sentinel Hub</a>',
          tileSize: 256,
          zoomOffset: 0
        });

        // Переопределяем метод getTileUrl для правильной обработки bbox
        (ndviLayer as any).getTileUrl = function(coords: any) {
          const bounds = this._tileCoordsToBounds(coords);
          const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
          
          return `https://services.sentinel-hub.com/ogc/wms/${instanceId}?` +
            `SERVICE=WMS&` +
            `REQUEST=GetMap&` +
            `LAYERS=NDVI&` +
            `FORMAT=image/png&` +
            `TRANSPARENT=true&` +
            `WIDTH=256&` +
            `HEIGHT=256&` +
            `BBOX=${bbox}&` +
            `TIME=${date}/${date}&` +
            `MAXCC=20&` +
            `VERSION=1.3.0&` +
            `SRS=EPSG:4326`;
        };

        // Добавляем обработчик ошибок
        ndviLayer.on('tileerror', (error) => {
          console.warn('NDVI tile error:', error);
          onDataLoaded?.(false, null);
        });

        // Добавляем обработчик успешной загрузки
        ndviLayer.on('tileload', () => {
          console.log('NDVI tile loaded successfully');
          onDataLoaded?.(true, { instanceId, date });
        });

        // Добавляем слой на карту
        ndviLayer.addTo(map);
        layerRef.current = ndviLayer;
        
        // Тестируем доступность через простой запрос
        const testUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}?SERVICE=WMS&REQUEST=GetMap&LAYERS=NDVI&FORMAT=image/png&WIDTH=256&HEIGHT=256&BBOX=37.3,55.5,38.0,56.0&TIME=${date}/${date}&MAXCC=20&VERSION=1.3.0&SRS=EPSG:4326`;
        
        try {
          const testResponse = await fetch(testUrl);
          if (testResponse.ok) {
            console.log('NDVI service is available');
            onDataLoaded?.(true, { instanceId, date });
          } else {
            console.warn(`NDVI service test failed: ${testResponse.status}`);
            onDataLoaded?.(false, null);
          }
        } catch (error) {
          console.warn('NDVI service test failed:', error);
          onDataLoaded?.(false, null);
        }

      } catch (error) {
        console.error('Failed to load NDVI tiles:', error);
        onDataLoaded?.(false, null);
      }
    };

    loadNDVITiles();

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [instanceId, date, map, onDataLoaded]);

  return null;
}
