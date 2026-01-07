// frontend/editor-ui/src/components/GoogleMapPreview.jsx
import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "220px",
  border: "1px solid #e6e6e6",
};

export default function GoogleMapPreview({ coords }) {
  // Load API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY, // add your key in .env
  });

  const center = coords ? { lat: coords.lat, lng: coords.lng } : { lat: 24.8607, lng: 67.0011 };

  if (!isLoaded) return <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={coords ? 13 : 6}>
      {coords && <Marker position={coords} />}
    </GoogleMap>
  );
}
