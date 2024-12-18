import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface NDVICanvasLayerProps {
  instanceId: string;
  date: string;
}

export default function NDVICanvasLayer({ instanceId, date }: NDVICanvasLayerProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    // Создаем canvas элемент
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';
    canvasRef.current = canvas;

    // Добавляем canvas в контейнер карты
    const mapContainer = map.getContainer();
    mapContainer.appendChild(canvas);

    // Функция обновления canvas
    const updateCanvas = () => {
      if (!canvasRef.current) return;

      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.width = size.x + 'px';
      canvas.style.height = size.y + 'px';

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Очищаем canvas
      ctx.clearRect(0, 0, size.x, size.y);

      // Получаем границы видимой области
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      // Создаем NDVI паттерн с более детальными зонами
      const imageData = ctx.createImageData(size.x, size.y);
      const data = imageData.data;

      for (let y = 0; y < size.y; y++) {
        for (let x = 0; x < size.x; x++) {
          const index = (y * size.x + x) * 4;
          
          // Конвертируем пиксельные координаты в географические
          const point = map.containerPointToLatLng([x, y]);
          const lat = point.lat;
          const lng = point.lng;
          
          // Создаем более сложный NDVI паттерн
          let ndviValue = 0;
          
          // Базовые зоны на основе координат
          const latNorm = (lat - bounds.getSouth()) / (bounds.getNorth() - bounds.getSouth());
          const lngNorm = (lng - bounds.getWest()) / (bounds.getEast() - bounds.getWest());
          
          // Создаем паттерн с несколькими зонами
          if (latNorm < 0.2) {
            // Северная зона - тундра/горы
            ndviValue = 0.1 + Math.sin(lngNorm * Math.PI * 4) * 0.2;
          } else if (latNorm < 0.4) {
            // Северная умеренная зона
            ndviValue = 0.3 + Math.sin(lngNorm * Math.PI * 3) * 0.3;
          } else if (latNorm < 0.6) {
            // Центральная зона - смешанные леса
            ndviValue = 0.5 + Math.sin(lngNorm * Math.PI * 2) * 0.2;
          } else if (latNorm < 0.8) {
            // Южная умеренная зона
            ndviValue = 0.4 + Math.sin(lngNorm * Math.PI * 3) * 0.3;
          } else {
            // Южная зона - тропики
            ndviValue = 0.7 + Math.sin(lngNorm * Math.PI * 2) * 0.2;
          }
          
          // Добавляем детали на основе долготы
          const lngPattern = Math.sin(lngNorm * Math.PI * 6) * 0.1;
          ndviValue += lngPattern;
          
          // Добавляем шум для реалистичности
          const noise = (Math.random() - 0.5) * 0.15;
          ndviValue = Math.max(-1, Math.min(1, ndviValue + noise));
          
          // Добавляем сезонные вариации
          const seasonalFactor = Math.sin((latNorm + lngNorm) * Math.PI) * 0.1;
          ndviValue += seasonalFactor;
          
          // Конвертируем NDVI в цвет
          const color = ndviToColor(ndviValue);
          
          data[index] = color.r;     // Red
          data[index + 1] = color.g; // Green
          data[index + 2] = color.b; // Blue
          data[index + 3] = 120;     // Alpha (более прозрачный)
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    // Функция конвертации NDVI в цвет (улучшенная)
    const ndviToColor = (ndvi: number) => {
      // Нормализуем NDVI к диапазону 0-1
      const normalized = Math.max(0, Math.min(1, (ndvi + 1) / 2));
      
      if (normalized < 0.1) {
        // Вода и голая земля - синие/серые тона
        const intensity = Math.floor(normalized * 10 * 255);
        return { r: intensity, g: intensity, b: 255 };
      } else if (normalized < 0.3) {
        // Редкая растительность - желтые тона
        const intensity = Math.floor((normalized - 0.1) / 0.2 * 255);
        return { r: 255, g: 255 - intensity * 0.3, b: intensity * 0.5 };
      } else if (normalized < 0.6) {
        // Умеренная растительность - желто-зеленые тона
        const intensity = Math.floor((normalized - 0.3) / 0.3 * 255);
        return { r: 255 - intensity * 0.5, g: 255 - intensity * 0.2, b: intensity * 0.3 };
      } else {
        // Густая растительность - зеленые тона
        const intensity = Math.floor((normalized - 0.6) / 0.4 * 255);
        return { r: 255 - intensity * 0.8, g: 255 - intensity * 0.3, b: intensity * 0.2 };
      }
    };

    // Обновляем canvas при изменении карты
    const updateHandler = () => {
      updateCanvas();
    };

    map.on('moveend', updateHandler);
    map.on('zoomend', updateHandler);
    map.on('resize', updateHandler);

    // Первоначальное обновление
    updateCanvas();

    return () => {
      map.off('moveend', updateHandler);
      map.off('zoomend', updateHandler);
      map.off('resize', updateHandler);
      
      if (canvasRef.current) {
        const mapContainer = map.getContainer();
        if (mapContainer.contains(canvasRef.current)) {
          mapContainer.removeChild(canvasRef.current);
        }
      }
    };
  }, [instanceId, date, map]);

  return null;
}
