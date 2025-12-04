import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type PlotMapSnapshotProps = {
  boundaryGeoJson?: string;
  coordinateGeoJson?: string;
  plotName?: string;
};

const parseWKTtoGeoJSON = (wkt: string): any => {
  const polygonMatch = wkt.match(/POLYGON\s*\(\((.*?)\)\)/);
  if (polygonMatch) {
    const coordsStr = polygonMatch[1];
    const coords = coordsStr.split(',').map((pair) => {
      const parts = pair.trim().split(/\s+/);
      const lng = Number(parts[0]);
      const lat = Number(parts[1]);
      return [lng, lat];
    });
    return { type: 'Polygon', coordinates: [coords] };
  }

  const pointMatch = wkt.match(/POINT\s*\((.*?)\)/);
  if (pointMatch) {
    const parts = pointMatch[1].trim().split(/\s+/);
    const lng = Number(parts[0]);
    const lat = Number(parts[1]);
    return { type: 'Point', coordinates: [lng, lat] };
  }

  throw new Error('Unsupported WKT format');
};

export const PlotMapSnapshot = ({
  boundaryGeoJson,
  coordinateGeoJson,
  plotName,
}: PlotMapSnapshotProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    const geoJsonString = boundaryGeoJson || coordinateGeoJson;
    if (!geoJsonString) return;

    let geoJson: any;
    try {
      geoJson = JSON.parse(geoJsonString);
    } catch {
      try {
        geoJson = parseWKTtoGeoJSON(geoJsonString);
      } catch (error) {
        console.error('Failed to parse geographic data:', error);
        return;
      }
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Calculate center from geometry
    let center: [number, number] = [106.6297, 10.8231]; // Default Vietnam center
    if (geoJson.type === 'Point' && geoJson.coordinates) {
      center = geoJson.coordinates as [number, number];
    } else if (geoJson.type === 'Polygon' && geoJson.coordinates?.[0]) {
      const coords = geoJson.coordinates[0];
      const lngs = coords.map((c: number[]) => c[0]);
      const lats = coords.map((c: number[]) => c[1]);
      center = [
        (Math.max(...lngs) + Math.min(...lngs)) / 2,
        (Math.max(...lats) + Math.min(...lats)) / 2,
      ];
    }

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: geoJson.type === 'Point' ? 15 : 14,
      interactive: false, // Make it static
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add source
      map.current.addSource('plot-data', {
        type: 'geojson',
        data: geoJson,
      });

      const color = '#10b981'; // Emerald green

      if (geoJson.type === 'Point') {
        // Add point marker
        map.current.addLayer({
          id: 'plot-point',
          type: 'circle',
          source: 'plot-data',
          paint: {
            'circle-radius': 10,
            'circle-color': color,
            'circle-opacity': 0.8,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
          },
        });
      } else {
        // Add polygon fill
        map.current.addLayer({
          id: 'plot-fill',
          type: 'fill',
          source: 'plot-data',
          paint: {
            'fill-color': color,
            'fill-opacity': 0.4,
          },
        });

        // Add polygon outline
        map.current.addLayer({
          id: 'plot-outline',
          type: 'line',
          source: 'plot-data',
          paint: {
            'line-color': color,
            'line-width': 3,
          },
        });
      }

      // Fit bounds for polygon
      if (geoJson.type === 'Polygon' && geoJson.coordinates?.[0]) {
        const coords = geoJson.coordinates[0];
        const bounds = coords.reduce(
          (bounds: mapboxgl.LngLatBounds, coord: number[]) => {
            return bounds.extend(coord as [number, number]);
          },
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        map.current.fitBounds(bounds, {
          padding: 40,
          maxZoom: 16,
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [boundaryGeoJson, coordinateGeoJson]);

  if (!boundaryGeoJson && !coordinateGeoJson) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
        <p className="text-sm text-neutral-500">No geographic data available</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-neutral-200 shadow-md">
      <div
        ref={mapContainer}
        className="h-[300px] w-full"
        style={{ minHeight: '300px' }}
      />
      {plotName && (
        <div className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-xs font-semibold text-neutral-900">{plotName}</p>
        </div>
      )}
    </div>
  );
};
