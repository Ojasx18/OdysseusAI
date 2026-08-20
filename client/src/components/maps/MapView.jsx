import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Resolve leaflet default icon assets issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/**
 * Recenter helper component that pans the Leaflet instance on props updates
 */
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

/**
 * Custom inline DivIcon generator for itinerary markers (e.g. 1, 2, 3)
 */
const createItineraryIcon = (index) => {
  return L.divIcon({
    html: `<div style="background-color: var(--color-primary); color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid white; box-shadow: 0 2px 6px rgba(15,118,110,0.35);">${index}</div>`,
    className: 'custom-numbered-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

/**
 * Custom inline DivIcon generator for nearby categories (e.g. restaurants, museums)
 */
const createNearbyIcon = (category) => {
  const colors = {
    attractions: 'var(--color-primary)',
    restaurants: 'var(--color-success)',
    cafes: 'var(--color-secondary)',
    museums: '#ec4899', // Pink
    beaches: '#3b82f6', // Blue
    parks: '#22c55e', // Green
    hotels: '#a855f7', // Purple
    shopping: '#eab308', // Amber
    temples: '#f97316', // Orange
    viewpoints: '#06b6d4', // Cyan
  };
  const color = colors[category] || '#10b981';

  return L.divIcon({
    html: `<div style="background-color: ${color}; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(23,32,51,0.15);"><div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div></div>`,
    className: 'custom-category-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

function MapView({
  center = [15.2993, 74.1240], // Default: Goa
  zoom = 12,
  markers = [],
  route = null,
  style = {},
}) {
  const cleanCenter = Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])
    ? center
    : [15.2993, 74.1240];

  return (
    <div
      style={{
        height: '420px',
        width: '100%',
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)',
        position: 'relative',
        zIndex: 1,
        ...style,
      }}
    >
      <MapContainer
        center={cleanCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic markers */}
        {markers.map((m, idx) => {
          if (!m || isNaN(m.latitude) || isNaN(m.longitude)) {
            return null;
          }

          // Choose appropriate DivIcon based on m.type
          let icon = undefined;
          if (m.type === 'itinerary') {
            icon = createItineraryIcon(m.index || (idx + 1));
          } else if (m.type === 'nearby') {
            icon = createNearbyIcon(m.category);
          }

          const markerProps = {
            position: [m.latitude, m.longitude],
          };
          if (icon) {
            markerProps.icon = icon;
          }

          return (
            <Marker
              key={m.id || `marker_${idx}`}
              {...markerProps}
            >
              {m.popupContent && (
                <Popup className="leaflet-dark-popup">
                  <div style={{ color: 'var(--color-text)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    {m.popupContent}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}

        {/* Polylines for driving routes */}
        {route && Array.isArray(route) && route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: 'var(--color-primary)',
              weight: 4,
              opacity: 0.8,
              dashArray: '2, 6',
            }}
          />
        )}

        {/* Programmatic panning hook */}
        <MapRecenter center={cleanCenter} zoom={zoom} />
      </MapContainer>
    </div>
  );
}

export default MapView;
