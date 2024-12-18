import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface NDVIDemoLayerProps {
  instanceId: string;
  date: string;
  bounds: L.LatLngBounds;
}

export default function NDVIDemoLayer({ instanceId, date, bounds }: NDVIDemoLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.ImageOverlay | null>(null);

  useEffect(() => {
    // Создаем демо NDVI изображение
    const createDemoNDVI = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;

      // Создаем реалистичный NDVI паттерн
      const imageData = ctx.createImageData(512, 512);
      const data = imageData.data;

      for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
          const index = (y * 512 + x) * 4;
          
          // Создаем паттерн с различными зонами NDVI
          const centerX = 256;
          const centerY = 256;
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          const angle = Math.atan2(y - centerY, x - centerX);
          
          // Создаем зоны с разными NDVI значениями
          let ndviValue = 0;
          
          if (distance < 50) {
            // Центр - вода (низкий NDVI)
            ndviValue = -0.1 + Math.random() * 0.2;
          } else if (distance < 100) {
            // Ближняя зона - голая земля
            ndviValue = 0.1 + Math.random() * 0.2;
          } else if (distance < 150) {
            // Средняя зона - умеренная растительность
            ndviValue = 0.3 + Math.random() * 0.2;
          } else if (distance < 200) {
            // Внешняя зона - здоровая растительность
            ndviValue = 0.5 + Math.random() * 0.3;
          } else {
            // Край - очень густая растительность
            ndviValue = 0.7 + Math.random() * 0.2;
          }
          
          // Добавляем шум и паттерны
          const noise = (Math.random() - 0.5) * 0.1;
          ndviValue = Math.max(-1, Math.min(1, ndviValue + noise));
          
          // Добавляем сезонные вариации
          const seasonalFactor = Math.sin(angle * 3) * 0.1;
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

    const dataUrl = createDemoNDVI();
    if (!dataUrl) return;

    // Удаляем предыдущий слой
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Создаем новый ImageOverlay
    const imageOverlay = L.imageOverlay(dataUrl, bounds, {
      opacity: 0.7,
      interactive: false
    });

    // Добавляем слой на карту
    imageOverlay.addTo(map);
    layerRef.current = imageOverlay;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [instanceId, date, bounds, map]);

  return null;
}
