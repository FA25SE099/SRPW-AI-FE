import { useEffect, useState } from 'react';
import { MapboxMap } from '@/components/ui/mapbox-map';
import { GroupPreviewResult } from '../../types';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

type GroupMapPreviewProps = {
  preview: GroupPreviewResult;
  hoveredGroupId?: string | null;
  expandedGroups?: Set<string>;
  onGroupClick?: (groupId: string) => void;
};

const GROUP_COLORS = [
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

const parseCoordinate = (coordinate: any): [number, number] | null => {
  try {
    if (typeof coordinate === 'string') {
      // Try parsing WKT POINT
      const pointMatch = coordinate.match(/POINT\s*\(\s*([0-9.-]+)\s+([0-9.-]+)\s*\)/i);
      if (pointMatch) {
        return [parseFloat(pointMatch[1]), parseFloat(pointMatch[2])];
      }
      
      // Try parsing JSON
      const parsed = JSON.parse(coordinate);
      if (parsed.type === 'Point' && parsed.coordinates) {
        return [parsed.coordinates[0], parsed.coordinates[1]];
      }
    } else if (coordinate?.type === 'Point' && coordinate.coordinates) {
      return [coordinate.coordinates[0], coordinate.coordinates[1]];
    }
    return null;
  } catch {
    return null;
  }
};

const parseGeoJSON = (geoJsonString: string): any | null => {
  try {
    if (!geoJsonString) return null;
    
    // Parse JSON string
    const parsed = JSON.parse(geoJsonString);
    
    // Validate it's a valid GeoJSON geometry
    if (parsed && parsed.type && parsed.coordinates) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing GeoJSON:', error);
    return null;
  }
};

const parseWKTPolygon = (wkt: string): any | null => {
  try {
    if (!wkt || !wkt.startsWith('POLYGON')) return null;
    
    const coordsMatch = wkt.match(/POLYGON\s*\(\s*\(([^)]+)\)\s*\)/i);
    if (!coordsMatch) return null;
    
    const coordPairs = coordsMatch[1].split(',').map(pair => {
      const [lng, lat] = pair.trim().split(/\s+/).map(Number);
      return [lng, lat];
    });
    
    return {
      type: 'Polygon',
      coordinates: [coordPairs]
    };
  } catch (error) {
    console.error('Error parsing WKT:', error);
    return null;
  }
};

export const GroupMapPreview = ({
  preview,
  hoveredGroupId,
  expandedGroups,
  onGroupClick,
}: GroupMapPreviewProps) => {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  const handleMapLoad = (map: mapboxgl.Map) => {
    setMapInstance(map);
    
    // Wait for map to be fully loaded
    setTimeout(() => {
      renderGroups(map);
    }, 100);
  };

  const renderGroups = (map: mapboxgl.Map) => {
    if (!map || !preview.proposedGroups) return;

    const allCoordinates: [number, number][] = [];

    // Render each proposed group
    preview.proposedGroups.forEach((group, index) => {
      const color = GROUP_COLORS[index % GROUP_COLORS.length];
      
      const groupCentroid: [number, number] | null = 
        (group.centroidLat && group.centroidLng) 
          ? [group.centroidLng, group.centroidLat] 
          : null;

      // Group boundary rendering disabled (backend issue)

      // Add individual plot boundaries and markers
      group.plots.forEach((plot, plotIndex) => {
          // Parse plot boundary (try GeoJSON first, then WKT)
          let plotBoundary = null;
          if (plot.boundaryGeoJson) {
            plotBoundary = parseGeoJSON(plot.boundaryGeoJson);
          } else if (plot.boundaryWkt) {
            plotBoundary = parseWKTPolygon(plot.boundaryWkt);
          }
          
          if (plotBoundary && plotBoundary.coordinates && plotBoundary.coordinates[0]) {
            // Calculate center of plot polygon
            const coords = plotBoundary.coordinates[0];
            const lngSum = coords.reduce((sum: number, c: [number, number]) => sum + c[0], 0);
            const latSum = coords.reduce((sum: number, c: [number, number]) => sum + c[1], 0);
            const plotCenter: [number, number] = [lngSum / coords.length, latSum / coords.length];
            
            // Add all plot boundary coordinates for accurate zoom bounds
            coords.forEach((coord: [number, number]) => {
              allCoordinates.push(coord);
            });
            
            // Add plot boundary to map
            try {
              const plotSourceId = `plot-boundary-${plot.plotId}`;
              if (!map.getSource(plotSourceId)) {
                map.addSource(plotSourceId, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: plotBoundary,
                    properties: {}
                  }
                });

                // Add plot fill
                map.addLayer({
                  id: `plot-fill-${plot.plotId}`,
                  type: 'fill',
                  source: plotSourceId,
                  paint: {
                    'fill-color': color,
                    'fill-opacity': 0.4
                  }
                });

                // Add plot border
                map.addLayer({
                  id: `plot-line-${plot.plotId}`,
                  type: 'line',
                  source: plotSourceId,
                  paint: {
                    'line-color': color,
                    'line-width': 2,
                    'line-opacity': 0.8
                  }
                });

                // Add click handler
                map.on('click', `plot-fill-${plot.plotId}`, (e) => {
                  e.originalEvent.stopPropagation();
                  
                  new mapboxgl.Popup({ offset: 15 })
                    .setLngLat(e.lngLat)
                    .setHTML(`
                      <div class="p-3">
                        <div class="font-semibold text-sm">${plot.farmerName}</div>
                        <div class="text-xs text-gray-600 mt-1">
                          ${group.riceVariety}
                        </div>
                        <div class="text-xs text-gray-600">
                          ${plot.area.toFixed(2)} ha
                        </div>
                        ${plot.soThua ? `
                          <div class="text-xs text-gray-500 mt-1">
                            Plot ${plot.soThua}/${plot.soTo}
                          </div>
                        ` : ''}
                      </div>
                    `)
                    .addTo(map);
                });

                // Hover effects
                map.on('mouseenter', `plot-fill-${plot.plotId}`, () => {
                  map.getCanvas().style.cursor = 'pointer';
                  map.setPaintProperty(`plot-fill-${plot.plotId}`, 'fill-opacity', 0.6);
                });

                map.on('mouseleave', `plot-fill-${plot.plotId}`, () => {
                  map.getCanvas().style.cursor = '';
                  map.setPaintProperty(`plot-fill-${plot.plotId}`, 'fill-opacity', 0.4);
                });
              }
            } catch (error) {
              console.error(`Error adding plot boundary for ${plot.plotId}:`, error);
            }
            // Add plot label marker at center
            const labelEl = document.createElement('div');
            labelEl.className = 'plot-label-marker';
            labelEl.style.backgroundColor = 'white';
            labelEl.style.color = color;
            labelEl.style.border = `2px solid ${color}`;
            labelEl.style.borderRadius = '50%';
            labelEl.style.width = '28px';
            labelEl.style.height = '28px';
            labelEl.style.display = 'flex';
            labelEl.style.alignItems = 'center';
            labelEl.style.justifyContent = 'center';
            labelEl.style.fontSize = '11px';
            labelEl.style.fontWeight = 'bold';
            labelEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            labelEl.style.pointerEvents = 'none'; // Don't interfere with plot clicks
            labelEl.textContent = plot.soThua ? `${plot.soThua}` : `${plotIndex + 1}`;

            new mapboxgl.Marker(labelEl)
              .setLngLat(plotCenter)
              .addTo(map);
          }
        });

      // Group label removed per user request
    });

    // Render ungrouped plots
    if (preview.ungroupedPlotsList && preview.ungroupedPlotsList.length > 0) {
      preview.ungroupedPlotsList.forEach((plot, index) => {
        // Parse ungrouped plot boundary
        let plotBoundary = null;
        if (plot.boundaryGeoJson) {
          plotBoundary = parseGeoJSON(plot.boundaryGeoJson);
        } else if (plot.boundaryWkt) {
          plotBoundary = parseWKTPolygon(plot.boundaryWkt);
        }
        
        let plotCenter: [number, number] | null = null;
        
        if (plotBoundary && plotBoundary.coordinates && plotBoundary.coordinates[0]) {
          // Calculate center from boundary
          const coords = plotBoundary.coordinates[0];
          const lngSum = coords.reduce((sum: number, c: [number, number]) => sum + c[0], 0);
          const latSum = coords.reduce((sum: number, c: [number, number]) => sum + c[1], 0);
          plotCenter = [lngSum / coords.length, latSum / coords.length];
          
          // Add all boundary coordinates for accurate zoom
          coords.forEach((coord: [number, number]) => {
            allCoordinates.push(coord);
          });
        } else if (plot.coordinate && typeof plot.coordinate === 'object') {
          // Fallback to coordinate point
          if ('lat' in plot.coordinate && 'lng' in plot.coordinate) {
            plotCenter = [plot.coordinate.lng, plot.coordinate.lat];
            allCoordinates.push(plotCenter);
          }
        }
        
        if (plotCenter) {
          
          // Add ungrouped plot boundary if available
          if (plotBoundary) {
            try {
              const ungroupedSourceId = `ungrouped-boundary-${plot.plotId}`;
              if (!map.getSource(ungroupedSourceId)) {
                map.addSource(ungroupedSourceId, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: plotBoundary,
                    properties: {}
                  }
                });

                // Add fill
                map.addLayer({
                  id: `ungrouped-fill-${plot.plotId}`,
                  type: 'fill',
                  source: ungroupedSourceId,
                  paint: {
                    'fill-color': '#F97316',
                    'fill-opacity': 0.3
                  }
                });

                // Add dashed border
                map.addLayer({
                  id: `ungrouped-line-${plot.plotId}`,
                  type: 'line',
                  source: ungroupedSourceId,
                  paint: {
                    'line-color': '#F97316',
                    'line-width': 3,
                    'line-dasharray': [3, 3]
                  }
                });

                // Click handler
                map.on('click', `ungrouped-fill-${plot.plotId}`, (e) => {
                  e.originalEvent.stopPropagation();
                  
                  new mapboxgl.Popup({ offset: 15 })
                    .setLngLat(e.lngLat)
                    .setHTML(`
                      <div class="p-3 max-w-xs">
                        <div class="font-semibold text-orange-600 mb-1">⚠️ Ungrouped Plot</div>
                        <div class="text-sm font-medium">${plot.farmerName}</div>
                        <div class="text-xs text-gray-600 mb-2">${plot.riceVarietyName} • ${plot.area.toFixed(2)}ha</div>
                        <div class="text-xs text-gray-700 mb-2">${plot.reasonDescription}</div>
                        ${plot.suggestions && plot.suggestions.length > 0 
                          ? `<div class="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">💡 ${plot.suggestions[0]}</div>` 
                          : ''
                        }
                      </div>
                    `)
                    .addTo(map);
                });

                // Hover effects
                map.on('mouseenter', `ungrouped-fill-${plot.plotId}`, () => {
                  map.getCanvas().style.cursor = 'pointer';
                  map.setPaintProperty(`ungrouped-fill-${plot.plotId}`, 'fill-opacity', 0.5);
                });

                map.on('mouseleave', `ungrouped-fill-${plot.plotId}`, () => {
                  map.getCanvas().style.cursor = '';
                  map.setPaintProperty(`ungrouped-fill-${plot.plotId}`, 'fill-opacity', 0.3);
                });
              }
            } catch (error) {
              console.error(`Error adding ungrouped plot boundary:`, error);
            }
          }
          
          // Add warning marker
          const el = document.createElement('div');
          el.className = 'ungrouped-plot-marker';
          el.style.backgroundColor = '#F97316';
          el.style.width = '28px';
          el.style.height = '28px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.fontSize = '14px';
          el.style.fontWeight = 'bold';
          el.style.color = 'white';
          el.style.pointerEvents = 'none';
          el.textContent = '!';

          new mapboxgl.Marker(el)
            .setLngLat(plotCenter)
            .addTo(map);
        } else {
          // Fallback positioning for plots without coordinates
          const fallbackCoord: [number, number] = [
            106.6297 + 0.15 + (index * 0.02),
            10.8231 - 0.05
          ];
          allCoordinates.push(fallbackCoord);

          const el = document.createElement('div');
          el.className = 'ungrouped-plot-marker';
          el.style.backgroundColor = '#F97316';
          el.style.width = '28px';
          el.style.height = '28px';
          el.style.borderRadius = '4px';
          el.style.border = '2px dashed white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.fontSize = '12px';
          el.style.fontWeight = 'bold';
          el.style.color = 'white';
          el.textContent = '!';

          new mapboxgl.Marker(el)
            .setLngLat(fallbackCoord)
            .setPopup(
              new mapboxgl.Popup({ offset: 15 }).setHTML(`
                <div class="p-3 max-w-xs">
                  <div class="font-semibold text-orange-600 mb-1">⚠️ Ungrouped Plot</div>
                  <div class="text-sm font-medium">${plot.farmerName}</div>
                  <div class="text-xs text-gray-600 mb-2">${plot.riceVarietyName} • ${plot.area.toFixed(2)}ha</div>
                  <div class="text-xs text-gray-700 mb-2">${plot.reasonDescription}</div>
                </div>
              `)
            )
            .addTo(map);
        }
      });
    }

    // Fit map to show all markers
    if (allCoordinates.length > 0) {
      // Filter out invalid coordinates (outside Vietnam bounds)
      const validCoordinates = allCoordinates.filter(coord => {
        const [lng, lat] = coord;
        // Vietnam approximate bounds: lng 102-110, lat 8-24
        return lng >= 102 && lng <= 110 && lat >= 8 && lat <= 24;
      });

      console.log(`Total coordinates: ${allCoordinates.length}, Valid: ${validCoordinates.length}`);
      console.log('Sample coordinates:', allCoordinates.slice(0, 3));

      if (validCoordinates.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validCoordinates.forEach(coord => bounds.extend(coord));
        
        setTimeout(() => {
          map.fitBounds(bounds, {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
            maxZoom: 15,
            minZoom: 10,
            duration: 1000
          });
        }, 300);
      } else {
        // Fallback to default Vietnam center if no valid coordinates
        map.flyTo({
          center: [106.6297, 10.8231], // Ho Chi Minh City
          zoom: 12,
          duration: 1000
        });
      }
    }
  };

  // Clean up map layers and sources when preview changes
  useEffect(() => {
    if (!mapInstance || !preview) return;

    // Clear existing layers and sources
    const style = mapInstance.getStyle();
    if (style && style.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith('plot-') || 
            layer.id.startsWith('group-') || 
            layer.id.startsWith('ungrouped-')) {
          try {
            mapInstance.removeLayer(layer.id);
          } catch (e) {
            // Layer might not exist
          }
        }
      });
    }

    if (style && style.sources) {
      Object.keys(style.sources).forEach((sourceId) => {
        if (sourceId.startsWith('plot-') || 
            sourceId.startsWith('group-') || 
            sourceId.startsWith('ungrouped-')) {
          try {
            mapInstance.removeSource(sourceId);
          } catch (e) {
            // Source might not exist
          }
        }
      });
    }

    // Re-render with new data
    renderGroups(mapInstance);
  }, [preview]);

  // Update group highlighting when hoveredGroupId changes
  useEffect(() => {
    if (!mapInstance) return;

    preview.proposedGroups?.forEach((group) => {
      const fillLayerId = `group-fill-${group.tempGroupId}`;
      const borderLayerId = `group-border-${group.tempGroupId}`;
      
      if (mapInstance.getLayer(fillLayerId)) {
        const isHovered = hoveredGroupId === group.tempGroupId;
        const isExpanded = expandedGroups?.has(group.tempGroupId);
        
        mapInstance.setPaintProperty(
          fillLayerId,
          'fill-opacity',
          isHovered || isExpanded ? 0.3 : 0.15
        );
        
        mapInstance.setPaintProperty(
          borderLayerId,
          'line-width',
          isHovered || isExpanded ? 4 : 3
        );
      }
    });
  }, [hoveredGroupId, expandedGroups, mapInstance, preview.proposedGroups]);

  return (
    <div className="relative h-full">
      <MapboxMap
        mapType="satellite"
        zoom={11}
        onMapLoad={handleMapLoad}
      >
        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-xs">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>📍</span> Groups Legend
          </h4>
          <div className="space-y-1">
            {preview.proposedGroups?.map((group, index) => {
              const color = GROUP_COLORS[index % GROUP_COLORS.length];
              return (
                <div 
                  key={group.tempGroupId} 
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                  onClick={() => onGroupClick?.(group.tempGroupId)}
                >
                  <div 
                    className="w-3 h-3 rounded-sm border border-white shadow-sm flex-shrink-0" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">{group.riceVariety}</span>
                  <span className="text-gray-500">({group.plotCount})</span>
                </div>
              );
            })}
            {preview.ungroupedPlots > 0 && (
              <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t">
                <div className="w-3 h-3 rounded-sm border-2 border-dashed border-white bg-orange-500 flex-shrink-0" />
                <span className="text-orange-600 font-medium">Ungrouped ({preview.ungroupedPlots})</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Click groups to expand details</span>
          </div>
        </div>
      </MapboxMap>
    </div>
  );
};

