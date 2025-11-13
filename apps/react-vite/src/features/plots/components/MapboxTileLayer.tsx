// src/features/plots/components/MapboxTileLayer.tsx
import { TileLayer } from "react-leaflet";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const CUSTOM_STYLE_ID = "cmhw3fmeh007e01r453h00pet";

type MapboxTileLayerProps = {
    type?: "vector" | "satellite";
};

const MapboxTileLayer = ({ type = "vector" }: MapboxTileLayerProps) => {
    console.log("🗺️ Mapbox Token:", MAPBOX_TOKEN ? "✅ Available" : "❌ Missing");

    // ✅ Fix: Đảm bảo có token
    if (!MAPBOX_TOKEN) {
        console.error("❌ VITE_MAPBOX_TOKEN is missing!");
        // ✅ Fallback to OpenStreetMap
        return (
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        );
    }

    // ✅ Fixed: Correct tile URL format for Mapbox styles
    const styleId = type === "satellite"
        ? "satellite-v9" // Mapbox default satellite
        : CUSTOM_STYLE_ID; // Your custom style

    // ✅ Correct format: /styles/v1/{username}/{style_id}/tiles/256/{z}/{x}/{y}@2x
    const tileUrl = `https://api.mapbox.com/styles/v1/ducnguyen120404/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`;

    console.log("🗺️ Tile URL:", tileUrl);

    return (
        <TileLayer
            url={tileUrl}
            attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
            errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        />
    );
};

export default MapboxTileLayer;