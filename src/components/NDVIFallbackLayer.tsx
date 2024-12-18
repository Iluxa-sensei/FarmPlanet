import React from 'react';
import { TileLayer } from 'react-leaflet';

interface NDVIFallbackLayerProps {
  instanceId: string;
  date: string;
}

export default function NDVIFallbackLayer({ instanceId, date }: NDVIFallbackLayerProps) {
  // Создаем простой NDVI паттерн как data URL
  const createNDVIPattern = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Создаем градиент NDVI
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#0c0c0c');     // Вода
    gradient.addColorStop(0.2, '#eaeaea');  // Голая земля
    gradient.addColorStop(0.4, '#ccc682');   // Редкая растительность
    gradient.addColorStop(0.6, '#91bf51');    // Умеренная
    gradient.addColorStop(0.8, '#4f892d');    // Здоровая
    gradient.addColorStop(1, '#004400');      // Очень густая
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Добавляем шум для реалистичности
    const imageData = ctx.getImageData(0, 0, 256, 256);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL('image/png');
  };

  const ndviPattern = createNDVIPattern();

  return (
    <TileLayer
      url={ndviPattern}
      opacity={0.7}
      attribution='&copy; <a href="https://www.sentinel-hub.com/">Sentinel Hub</a> Demo NDVI'
      tileSize={256}
      zoomOffset={0}
    />
  );
}
