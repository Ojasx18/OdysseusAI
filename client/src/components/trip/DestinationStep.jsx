import { useEffect } from 'react';
import PlaceSearch from '../maps/PlaceSearch';
import MapView from '../maps/MapView';

function DestinationStep({ register, errors, setValue, watch }) {
  const destination = watch('destination') || '';
  const coordinates = watch('coordinates');

  const handleSelectLocation = (loc) => {
    // Save geocoded values into react-hook-form state via setValue only.
    // Do NOT use register() on a hidden <input> for these fields because:
    //   - 'coordinates' is an object {lat, lng} — a DOM input serializes it
    //     to "[object Object]", corrupting the value and crashing Leaflet.
    //   - 'destination' is set programmatically by PlaceSearch, not by user
    //     typing into a registered input.
    setValue('destination', loc.name, { shouldValidate: true });
    setValue('coordinates', { lat: loc.latitude, lng: loc.longitude });
  };

  // Register destination for validation only (no DOM binding)
  useEffect(() => {
    register('destination', {
      required: 'Destination is required',
      minLength: { value: 2, message: 'Destination name must be at least 2 characters' },
    });
  }, [register]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        Where are you heading?
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Enter your dream travel destination. We will curate the best local guides, routes, and itineraries.
      </p>

      {/* Place search input */}
      <PlaceSearch
        defaultValue={destination}
        onSelectLocation={handleSelectLocation}
        label="Destination"
        placeholder="Search destinations (e.g. Goa, Paris, Tokyo...)"
      />

      {/* Form error display */}
      {errors.destination && (
        <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'left' }}>
          {errors.destination.message}
        </p>
      )}

      {/* Live Map Preview — only renders when coordinates is a valid object with lat/lng */}
      {coordinates && typeof coordinates === 'object' && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number' && (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'left' }}>
            Selected Location Preview
          </p>
          <MapView
            center={[coordinates.lat, coordinates.lng]}
            zoom={10}
            markers={[
              {
                id: 'destination_preview',
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                popupContent: destination,
              },
            ]}
            style={{ height: '240px' }}
          />
        </div>
      )}
    </div>
  );
}

export default DestinationStep;

