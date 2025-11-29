"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export type MapType = "vector" | "satellite";

export type MapboxMapProps = {
    center?: [number, number];
    zoom?: number;
    mapType?: MapType;
    enableDrawing?: boolean;
    drawingControls?: {
        polygon?: boolean;
        trash?: boolean;
        line_string?: boolean;
        point?: boolean;
    };
    onMapLoad?: (map: mapboxgl.Map) => void;
    onDrawCreate?: (e: any) => void;
    onDrawUpdate?: (e: any) => void;
    onDrawDelete?: (e: any) => void;
    className?: string;
    children?: React.ReactNode;
};

export const MapboxMap = ({
    center = [106.6297, 10.8231],
    zoom = 10,
    mapType = "satellite",
    enableDrawing = false,
    drawingControls = { polygon: true, trash: true },
    onMapLoad,
    onDrawCreate,
    onDrawUpdate,
    onDrawDelete,
    className = "",
    children,
}: MapboxMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const draw = useRef<MapboxDraw | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initialize map
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !MAPBOX_TOKEN || !mapContainer.current || map.current)
            return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style:
                mapType === "satellite"
                    ? "mapbox://styles/mapbox/satellite-streets-v12"
                    : "mapbox://styles/mapbox/streets-v12",
            center,
            zoom,
            attributionControl: false,
            logoPosition: "bottom-left",
        });

        map.current.on("load", () => {
            setMapLoaded(true);

            // Setup drawing if enabled
            if (enableDrawing && map.current) {
                draw.current = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: drawingControls,
                    defaultMode: "simple_select",
                });

                map.current.addControl(draw.current, "top-left");

                if (onDrawCreate) {
                    map.current.on("draw.create", onDrawCreate);
                }
                if (onDrawUpdate) {
                    map.current.on("draw.update", onDrawUpdate);
                }
                if (onDrawDelete) {
                    map.current.on("draw.delete", onDrawDelete);
                }
            }

            // Add navigation controls
            map.current!.addControl(
                new mapboxgl.NavigationControl(),
                "bottom-right"
            );

            // Callback when map is ready
            if (onMapLoad && map.current) {
                onMapLoad(map.current);
            }

            // Ensure proper sizing
            setTimeout(() => {
                if (map.current) {
                    map.current.resize();
                }
            }, 100);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
            setMapLoaded(false);
        };
    }, [isClient, MAPBOX_TOKEN]);

    // Handle map type changes
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        const newStyle =
            mapType === "satellite"
                ? "mapbox://styles/mapbox/satellite-streets-v12"
                : "mapbox://styles/mapbox/streets-v12";

        map.current.setStyle(newStyle);

        map.current.once("style.load", () => {
            if (onMapLoad && map.current) {
                onMapLoad(map.current);
            }
        });
    }, [mapType, mapLoaded]);

    // Expose map and draw instances
    useEffect(() => {
        if (mapLoaded && map.current) {
            // Store refs globally if needed
            (window as any).__mapboxMap = map.current;
            (window as any).__mapboxDraw = draw.current;
        }
    }, [mapLoaded]);

    if (!isClient) {
        return null;
    }

    return (
        <div className={`relative ${className}`} style={{ width: "100%", height: "100%" }}>
            <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
            {mapLoaded && children}
        </div>
    );
};

// Hook to access map instance
export const useMapboxMap = () => {
    return {
        map: (window as any).__mapboxMap as mapboxgl.Map | null,
        draw: (window as any).__mapboxDraw as MapboxDraw | null,
    };
};