// src/features/plots/components/MapboxTileLayer.tsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type MapboxTileLayerProps = {
    type?: "vector" | "satellite";
};

const MapboxTileLayer = ({ type = "vector" }: MapboxTileLayerProps) => {
    const map = useMap();

    useEffect(() => {
        if (!MAPBOX_TOKEN) {
            console.error("❌ VITE_MAPBOX_TOKEN is missing!");
            // Fallback to OpenStreetMap
            const osmLayer = L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }
            );
            osmLayer.addTo(map);
            return () => {
                map.removeLayer(osmLayer);
            };
        }

        const username = "ducnguyen120404";
        const styleId = type === "satellite" ? "satellite-streets-v12" : "cmhw3fmeh007e01r453h00pet";
        const baseStyle = type === "satellite" ? "mapbox" : username;

        // Build the URL - Leaflet will replace {z}, {x}, {y} automatically
        const url = `https://api.mapbox.com/styles/v1/${baseStyle}/${styleId}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`;

        console.log("🗺️ Creating tile layer with URL:", url);

        // Create Leaflet TileLayer directly
        const tileLayer = L.tileLayer(url, {
            attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
            tileSize: 512,
            zoomOffset: -1,
            maxZoom: 22,
        });

        // Add to map
        tileLayer.addTo(map);

        // Cleanup function
        return () => {
            map.removeLayer(tileLayer);
        };
    }, [map, type, MAPBOX_TOKEN]);

    return null;
};

export default MapboxTileLayer;