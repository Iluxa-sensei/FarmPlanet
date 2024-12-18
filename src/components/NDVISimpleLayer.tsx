import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface NDVISimpleLayerProps {
  instanceId: string;
  date: string;
}

export default function NDVISimpleLayer({ instanceId, date }: NDVISimpleLayerProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

      // Создаем простой NDVI паттерн с градиентами
      const gradient = ctx.createLinearGradient(0, 0, size.x, size.y);
      gradient.addColorStop(0, 'rgba(0, 100, 0, 0.6)');      // Темно-зеленый
      gradient.addColorStop(0.2, 'rgba(0, 150, 0, 0.5)');   // Зеленый
      gradient.addColorStop(0.4, 'rgba(100, 200, 0, 0.4)'); // Желто-зеленый
      gradient.addColorStop(0.6, 'rgba(200, 200, 0, 0.3)'); // Желтый
      gradient.addColorStop(0.8, 'rgba(150, 100, 0, 0.4)'); // Коричневый
      gradient.addColorStop(1, 'rgba(100, 50, 0, 0.5)');    // Темно-коричневый

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size.x, size.y);

      // Добавляем круговые паттерны для имитации полей
      const centerX = size.x / 2;
      const centerY = size.y / 2;
      const maxRadius = Math.min(size.x, size.y) / 2;

      for (let i = 0; i < 5; i++) {
        const radius = (maxRadius / 5) * (i + 1);
        const alpha = 0.3 - (i * 0.05);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(0, ${150 + i * 20}, 0, ${alpha})`;
        ctx.fill();
      }

      // Добавляем случайные пятна для реалистичности
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * size.x;
        const y = Math.random() * size.y;
        const radius = Math.random() * 30 + 10;
        const alpha = Math.random() * 0.3 + 0.1;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(${Math.random() * 100}, ${150 + Math.random() * 100}, 0, ${alpha})`;
        ctx.fill();
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
