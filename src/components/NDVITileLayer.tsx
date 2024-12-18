import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface NDVITileLayerProps {
  instanceId: string;
  date: string;
}

export default function NDVITileLayer({ instanceId, date }: NDVITileLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    // Создаем демо NDVI тайлы
    const createNDVITile = (x: number, y: number, z: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;

      // Создаем паттерн NDVI для тайла
      const imageData = ctx.createImageData(256, 256);
      const data = imageData.data;

      for (let py = 0; py < 256; py++) {
        for (let px = 0; px < 256; px++) {
          const index = (py * 256 + px) * 4;
          
          // Создаем паттерн на основе позиции тайла
          const centerX = 128;
          const centerY = 128;
          const distance = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2);
          const angle = Math.atan2(py - centerY, px - centerX);
          
          // Добавляем вариации на основе координат тайла
          const tileVariation = (x + y + z) % 3;
          let ndviValue = 0;
          
          if (distance < 30) {
            // Центр - вода
            ndviValue = -0.1 + Math.random() * 0.2;
          } else if (distance < 60) {
            // Ближняя зона - голая земля
            ndviValue = 0.1 + Math.random() * 0.2;
          } else if (distance < 90) {
            // Средняя зона - умеренная растительность
            ndviValue = 0.3 + Math.random() * 0.2;
          } else if (distance < 120) {
            // Внешняя зона - здоровая растительность
            ndviValue = 0.5 + Math.random() * 0.3;
          } else {
            // Край - очень густая растительность
            ndviValue = 0.7 + Math.random() * 0.2;
          }
          
          // Добавляем вариации на основе тайла
          ndviValue += (tileVariation - 1) * 0.1;
          
          // Добавляем шум
          const noise = (Math.random() - 0.5) * 0.1;
          ndviValue = Math.max(-1, Math.min(1, ndviValue + noise));
          
          // Добавляем сезонные вариации
          const seasonalFactor = Math.sin(angle * 2) * 0.05;
          ndviValue += seasonalFactor;
          
          // Конвертируем NDVI в цвет
          const color = ndviToColor(ndviValue);
          
          data[index] = color.r;     // Red
          data[index + 1] = color.g; // Green
          data[index + 2] = color.b; // Blue
          data[index + 3] = 255;     // Alpha
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL('image/png');
    };

    // Функция конвертации NDVI в цвет
    const ndviToColor = (ndvi: number) => {
      if (ndvi < -0.5) return { r: 12, g: 12, b: 12 };      // Вода
      if (ndvi < -0.2) return { r: 191, g: 191, b: 191 };  // Серая зона
      if (ndvi < -0.1) return { r: 219, g: 219, b: 219 }; // Светло-серая
      if (ndvi < 0) return { r: 234, g: 234, b: 234 };     // Очень светло-серая
      if (ndvi < 0.025) return { r: 255, g: 249, b: 204 }; // Светло-желтая
      if (ndvi < 0.05) return { r: 237, g: 232, b: 181 };  // Желтая
      if (ndvi < 0.075) return { r: 221, g: 216, b: 155 }; // Желто-зеленая
      if (ndvi < 0.1) return { r: 204, g: 198, b: 130 };   // Светло-зеленая
      if (ndvi < 0.125) return { r: 188, g: 183, b: 107 }; // Зелено-желтая
      if (ndvi < 0.15) return { r: 175, g: 193, b: 96 };   // Зеленая
      if (ndvi < 0.175) return { r: 163, g: 204, b: 89 };  // Светло-зеленая
      if (ndvi < 0.2) return { r: 145, g: 191, b: 81 };    // Зеленая
      if (ndvi < 0.25) return { r: 127, g: 178, b: 71 };    // Средне-зеленая
      if (ndvi < 0.3) return { r: 112, g: 163, b: 63 };    // Темно-зеленая
      if (ndvi < 0.35) return { r: 96, g: 150, b: 53 };    // Очень темно-зеленая
      if (ndvi < 0.4) return { r: 79, g: 137, b: 45 };    // Темная зеленая
      if (ndvi < 0.45) return { r: 63, g: 124, b: 35 };    // Очень темная
      if (ndvi < 0.5) return { r: 48, g: 109, b: 28 };     // Почти черная зеленая
      if (ndvi < 0.55) return { r: 33, g: 96, b: 17 };     // Черно-зеленая
      if (ndvi < 0.6) return { r: 15, g: 84, b: 10 };      // Очень темная зеленая
      return { r: 0, g: 68, b: 0 };                        // Самая темная зеленая
    };

    // Удаляем предыдущий слой
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Создаем кастомный TileLayer
    const ndviLayer = L.tileLayer('', {
      opacity: 0.7,
      attribution: '&copy; <a href="https://www.sentinel-hub.com/">Sentinel Hub</a> Demo NDVI'
    });

    // Переопределяем метод getTileUrl для генерации наших тайлов
    (ndviLayer as any).getTileUrl = function(coords: any) {
      const tile = createNDVITile(coords.x, coords.y, coords.z);
      return tile || '';
    };

    // Добавляем слой на карту
    ndviLayer.addTo(map);
    layerRef.current = ndviLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [instanceId, date, map]);

  return null;
}
