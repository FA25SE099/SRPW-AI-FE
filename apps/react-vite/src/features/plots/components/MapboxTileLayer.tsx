// src/features/plots/components/MapboxTileLayer.tsx
import { TileLayer } from "react-leaflet";
import { useEffect } from "react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type MapboxTileLayerProps = {
    type?: "vector" | "satellite";
};

const MapboxTileLayer = ({ type = "vector" }: MapboxTileLayerProps) => {
    console.log("🗺️ Mapbox Token:", MAPBOX_TOKEN ? "✅ Available" : "❌ Missing");

    useEffect(() => {
        // Test if the style is accessible
        const testUrl = `https://api.mapbox.com/styles/v1/ducnguyen120404/cmhw3fmeh007e01r453h00pet?access_token=${MAPBOX_TOKEN}`;
        fetch(testUrl)
            .then(res => {
                console.log("🗺️ Style API Response:", res.status);
                if (!res.ok) {
                    console.error("❌ Style not accessible. Status:", res.status);
                    console.error("💡 Make sure your style is set to PUBLIC in Mapbox Studio");
                }
                return res.json();
            })
            .then(data => console.log("✅ Style data:", data))
            .catch(err => console.error("❌ Style fetch error:", err));
    }, []);

    // ✅ Fallback to OpenStreetMap if no token
    if (!MAPBOX_TOKEN) {
        console.error("❌ VITE_MAPBOX_TOKEN is missing!");
        return (
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        );
    }

    // ✅ Try using Mapbox's standard styles first to verify token works
    const username = "ducnguyen120404";
    const customStyleId = "cmhw3fmeh007e01r453h00pet";

    // ✅ Choose style based on map type
    const styleId = type === "satellite"
        ? "satellite-streets-v12"  // Mapbox satellite with streets overlay
        : "streets-v12";           // Use standard Mapbox streets FIRST to test
    // : customStyleId;         // Try your custom style after confirming token works

    // ✅ Standard Mapbox Raster Tiles API v4 (more reliable)
    const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

    console.log("🗺️ Loading style:", styleId);
    console.log("🗺️ Tile URL template:", tileUrl);

    return (
        <TileLayer
            url={tileUrl}
            attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            tileSize={512}
            zoomOffset={-1}
            maxZoom={22}
        />
    );
};

export default MapboxTileLayer;