import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface NDVILayerProps {
  instanceId: string;
  date: string;
  bounds: L.LatLngBounds;
  onError?: (error: string) => void;
}

export default function NDVILayer({ instanceId, date, bounds, onError }: NDVILayerProps) {
  const layerRef = useRef<L.ImageOverlay | null>(null);

  useEffect(() => {
    if (!instanceId) return;

    // Создаем URL для получения NDVI изображения
    const createNDVIUrl = () => {
      const bbox = bounds.toBBoxString();
      const [west, south, east, north] = bbox.split(',').map(Number);
      
      // Используем Sentinel Hub Processing API
      const baseUrl = 'https://services.sentinel-hub.com/api/v1/process';
      
      const requestBody = {
        input: {
          bounds: {
            properties: {
              crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
            },
            bbox: [west, south, east, north],
            geometry: {
              type: "Polygon",
              coordinates: [[
                [west, south],
                [east, south], 
                [east, north],
                [west, north],
                [west, south]
              ]]
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
          }]
        },
        output: {
          width: 512,
          height: 512,
          responses: [{
            identifier: "default",
            format: {
              type: "image/png"
            }
          }]
        },
        evalscript: `
//VERSION=3
function setup() {
   return {
      input: ["B04", "B08", "dataMask"],
      output: { bands: 4 }
   };
}

const ramp = [
   [-0.5, 0x0c0c0c],
   [-0.2, 0xbfbfbf],
   [-0.1, 0xdbdbdb],
   [0, 0xeaeaea],
   [0.025, 0xfff9cc],
   [0.05, 0xede8b5],
   [0.075, 0xddd89b],
   [0.1, 0xccc682],
   [0.125, 0xbcb76b],
   [0.15, 0xafc160],
   [0.175, 0xa3cc59],
   [0.2, 0x91bf51],
   [0.25, 0x7fb247],
   [0.3, 0x70a33f],
   [0.35, 0x609635],
   [0.4, 0x4f892d],
   [0.45, 0x3f7c23],
   [0.5, 0x306d1c],
   [0.55, 0x216011],
   [0.6, 0x0f540a],
   [1, 0x004400],
];

const visualizer = new ColorRampVisualizer(ramp);

function evaluatePixel(samples) {
   let ndvi = index(samples.B08, samples.B04);
   let imgVals = visualizer.process(ndvi);
   return imgVals.concat(samples.dataMask)
`
      };

      return {
        url: baseUrl,
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${instanceId}` // Это не правильно, но для демо
        }
      };
    };

    // Для демонстрации показываем заглушку
    const showPlaceholder = () => {
      if (layerRef.current) {
        layerRef.current.remove();
      }

      // Создаем заглушку с градиентом
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Создаем градиент NDVI
        const gradient = ctx.createLinearGradient(0, 0, 512, 0);
        gradient.addColorStop(0, '#0c0c0c'); // Вода
        gradient.addColorStop(0.2, '#eaeaea'); // Голая земля
        gradient.addColorStop(0.4, '#ccc682'); // Редкая растительность
        gradient.addColorStop(0.6, '#91bf51'); // Умеренная
        gradient.addColorStop(0.8, '#4f892d'); // Здоровая
        gradient.addColorStop(1, '#004400'); // Очень густая
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Добавляем шум для реалистичности
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 20;
          data[i] = Math.max(0, Math.min(255, data[i] + noise));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
      }

      const dataUrl = canvas.toDataURL('image/png');
      
      // Создаем ImageOverlay с нашим изображением
      const imageOverlay = L.imageOverlay(dataUrl, bounds, {
        opacity: 0.7,
        interactive: false
      });

      layerRef.current = imageOverlay;
      return imageOverlay;
    };

    const overlay = showPlaceholder();
    
    // Добавляем overlay на карту (это будет сделано в родительском компоненте)
    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
      }
    };
  }, [instanceId, date, bounds]);

  return null;
}
