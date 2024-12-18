// Прокси для обхода CORS при запросах к Sentinel Hub API
export class SentinelHubProxy {
  private static readonly PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
  private static readonly SENTINEL_HUB_URL = 'https://services.sentinel-hub.com/api/v1/process/check';
  
  static async checkNDVIData(date: string, bbox: number[] = [37.3, 55.5, 38.0, 56.0]) {
    try {
      // Используем публичный CORS прокси
      const proxyUrl = `${this.PROXY_URL}${this.SENTINEL_HUB_URL}`;
      
      const requestBody = {
        input: {
          bounds: {
            bbox: bbox,
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
      };

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Proxy request failed: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result,
        message: `NDVI data check completed for ${date}`
      };

    } catch (error) {
      console.error('Sentinel Hub proxy error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      };
    }
  }

  // Альтернативный метод - прямая проверка через WMS
  static async checkWMSAvailability(instanceId: string, date: string) {
    try {
      // Проверяем доступность через WMS GetCapabilities
      const wmsUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}?SERVICE=WMS&REQUEST=GetCapabilities`;
      
      const response = await fetch(wmsUrl);
      
      if (response.ok) {
        return {
          success: true,
          message: `WMS service available for ${date}`,
          wmsUrl: `https://services.sentinel-hub.com/ogc/wms/${instanceId}`
        };
      } else {
        throw new Error(`WMS service unavailable: ${response.status}`);
      }
    } catch (error) {
      console.error('WMS check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WMS unavailable',
        fallback: true
      };
    }
  }

  // Метод для создания WMS URL с параметрами
  static createWMSUrl(instanceId: string, date: string, bbox: number[], width: number = 512, height: number = 512) {
    const [minLng, minLat, maxLng, maxLat] = bbox;
    const bboxParam = `${minLng},${minLat},${maxLng},${maxLat}`;
    
    return `https://services.sentinel-hub.com/ogc/wms/${instanceId}?` +
      `SERVICE=WMS&` +
      `REQUEST=GetMap&` +
      `LAYERS=NDVI&` +
      `FORMAT=image/png&` +
      `TRANSPARENT=true&` +
      `WIDTH=${width}&` +
      `HEIGHT=${height}&` +
      `BBOX=${bboxParam}&` +
      `TIME=${date}/${date}&` +
      `MAXCC=20&` +
      `CRS=EPSG:4326`;
  }
}
