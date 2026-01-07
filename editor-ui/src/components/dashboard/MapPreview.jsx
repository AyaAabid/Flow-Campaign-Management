import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './MapPreview.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for assets
const createCustomIcon = (isActive) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="marker-icon ${isActive ? 'active' : 'inactive'}">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
             </svg>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  });
};

// Component to fit map bounds to show all markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, positions]);
  
  return null;
};

const MapPreview = ({ assets = [] }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  // Filter assets based on active status
  const filteredAssets = assets.filter(asset => showInactive || asset.isActive);
  
  // Get positions for bounds calculation
  const positions = filteredAssets.map(asset => [
    asset.coords?.lat || asset.coordinates?.lat || asset.latLng?.lat,
    asset.coords?.lng || asset.coordinates?.lng || asset.latLng?.lng
  ]).filter(pos => pos[0] && pos[1]);

  // Default center (Times Square)
  const defaultCenter = [40.7580, -73.9855];

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
  };

  const getAssetCoordinates = (asset) => {
    return [
      asset.coords?.lat || asset.coordinates?.lat || asset.latLng?.lat,
      asset.coords?.lng || asset.coordinates?.lng || asset.latLng?.lng
    ];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Map Preview</h3>
          <p className="text-sm text-gray-500 mt-1">
            Click an asset to view location ({filteredAssets.length} assets)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-3 py-1 text-xs rounded-md transition-colors ${
              showInactive 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {showInactive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={defaultCenter}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filteredAssets.map((asset) => {
              const coords = getAssetCoordinates(asset);
              if (!coords[0] || !coords[1]) return null;
              
              return (
                <Marker
                  key={asset.id}
                  position={coords}
                  icon={createCustomIcon(asset.isActive)}
                  eventHandlers={{
                    click: () => handleAssetClick(asset),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold text-gray-900">{asset.name}</h4>
                      <p className="text-sm text-gray-600">{asset.venue}</p>
                      <p className="text-xs text-gray-500">{asset.network}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          asset.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {asset.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {asset.type}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            <FitBounds positions={positions} />
          </MapContainer>
        </div>
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active Assets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Inactive Assets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Asset Details */}
      {selectedAsset && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{selectedAsset.name}</h4>
              <p className="text-sm text-gray-600">{selectedAsset.title}</p>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Venue:</span>
                  <p className="font-medium text-gray-900">{selectedAsset.venue}</p>
                </div>
                <div>
                  <span className="text-gray-500">Network:</span>
                  <p className="font-medium text-gray-900">{selectedAsset.network}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium text-gray-900">{selectedAsset.type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedAsset.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAsset.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {selectedAsset.meta && (
                <div className="mt-2">
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="text-sm text-gray-700">{selectedAsset.meta}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Asset List */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Asset Locations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAssets.slice(0, 6).map((asset) => {
            const coords = getAssetCoordinates(asset);
            return (
              <div
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{asset.name}</span>
                </div>
                <p className="text-xs text-gray-500">{asset.venue}</p>
                <p className="text-xs text-gray-400">
                  {coords[0]?.toFixed(4)}, {coords[1]?.toFixed(4)}
                </p>
              </div>
            );
          })}
        </div>
        {filteredAssets.length > 6 && (
          <p className="text-xs text-gray-500 mt-2">
            And {filteredAssets.length - 6} more assets...
          </p>
        )}
      </div>
    </div>
  );
};

export default MapPreview;
