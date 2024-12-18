import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface NDVICSSLayerProps {
  instanceId: string;
  date: string;
}

export default function NDVICSSLayer({ instanceId, date }: NDVICSSLayerProps) {
  const map = useMap();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Создаем div элемент с CSS градиентом
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1000';
    overlay.style.background = `
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
    overlayRef.current = overlay;

    // Добавляем overlay в контейнер карты
    const mapContainer = map.getContainer();
    mapContainer.appendChild(overlay);

    // Обновляем размеры при изменении карты
    const updateSize = () => {
      if (overlayRef.current) {
        const size = map.getSize();
        overlayRef.current.style.width = size.x + 'px';
        overlayRef.current.style.height = size.y + 'px';
      }
    };

    map.on('resize', updateSize);
    updateSize();

    return () => {
      map.off('resize', updateSize);
      
      if (overlayRef.current) {
        const mapContainer = map.getContainer();
        if (mapContainer.contains(overlayRef.current)) {
          mapContainer.removeChild(overlayRef.current);
        }
      }
    };
  }, [instanceId, date, map]);

  return null;
}
