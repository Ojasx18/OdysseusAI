import { useState, useEffect } from 'react';
import { useNavigate as useRNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  IndianRupee,
  Compass,
  AlertCircle,
  ListTodo,
  Lightbulb,
  Wallet,
  Sparkles,
  Loader2,
  Utensils,
  Coffee,
  Bookmark,
  Map,
  ShoppingBag,
  Eye,
  Hotel,
} from 'lucide-react';
import axios from 'axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/currency';
import Loader from '../components/common/Loader';
import MapView from '../components/maps/MapView';
import PlaceCard from '../components/maps/PlaceCard';
import mapsService from '../services/mapsService';
import WeatherCard from '../components/weather/WeatherCard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function PublicTripDetail() {
  const { shareId } = useParams();
  const navigate = useRNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab and filter states
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' or 'map'
  const [activeDay, setActiveDay] = useState(1);
  const [checkedPackingItems, setCheckedPackingItems] = useState({});

  // Maps / nearby locations states
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyCategory, setNearbyCategory] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState('');

  // Routing states
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [routeStats, setRouteStats] = useState({ distance: 0, duration: 0 });
  const [routeLoading, setRouteLoading] = useState(false);

  // Map viewport control states
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(12);

  // Fetch Shared Trip Details
  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        setLoading(true);
        // Note: Call directly to base url to avoid cookies/auth headers issues on unauthenticated sessions
        const res = await axios.get(`http://localhost:5000/api/trips/share/${shareId}`);
        const tripData = res.data.data.trip;
        setTrip(tripData);

        if (tripData.packingList) {
          const initialChecked = {};
          tripData.packingList.forEach((item, index) => {
            initialChecked[index] = false;
          });
          setCheckedPackingItems(initialChecked);
        }

        // Establish initial Map coordinates
        if (tripData.coordinates && tripData.coordinates.lat && tripData.coordinates.lng) {
          setMapCenter([tripData.coordinates.lat, tripData.coordinates.lng]);
        } else {
          let found = false;
          for (let d of tripData.itinerary) {
            for (let act of d.activities) {
              if (act.coordinates && act.coordinates.lat && act.coordinates.lng) {
                setMapCenter([act.coordinates.lat, act.coordinates.lng]);
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (!found) setMapCenter([15.2993, 74.1240]); // Default to Goa
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load shared trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTrip();
  }, [shareId]);

  // Recenter map when changing active day inside Map tab
  useEffect(() => {
    if (!trip || activeTab !== 'map') return;

    if (activeDay === 'all') {
      if (trip.coordinates && trip.coordinates.lat && trip.coordinates.lng) {
        setMapCenter([trip.coordinates.lat, trip.coordinates.lng]);
        setMapZoom(11);
      }
    } else {
      const dayActs = trip.itinerary.find((d) => d.dayNumber === activeDay)?.activities || [];
      const validCoords = dayActs.find((act) => act.coordinates && act.coordinates.lat && act.coordinates.lng);
      if (validCoords) {
        setMapCenter([validCoords.coordinates.lat, validCoords.coordinates.lng]);
        setMapZoom(13);
      }
    }
  }, [activeDay, activeTab, trip]);

  // Calculate day-specific route geometry via OSRM
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!trip || activeTab !== 'map' || activeDay === 'all') {
        setRouteGeometry(null);
        setRouteStats({ distance: 0, duration: 0 });
        return;
      }

      const dayActs = trip.itinerary.find((d) => d.dayNumber === activeDay)?.activities || [];
      const coordsList = dayActs
        .map((act) => act.coordinates)
        .filter((coord) => coord && coord.lat && coord.lng);

      if (coordsList.length < 2) {
        setRouteGeometry(null);
        setRouteStats({ distance: 0, duration: 0 });
        return;
      }

      setRouteLoading(true);
      try {
        let totalDistance = 0;
        let totalDuration = 0;
        const allGeometries = [];

        for (let i = 0; i < coordsList.length - 1; i++) {
          const origin = coordsList[i];
          const dest = coordsList[i + 1];
          const res = await mapsService.getRoute(origin.lat, origin.lng, dest.lat, dest.lng);
          if (res.success && res.data) {
            totalDistance += res.data.distance;
            totalDuration += res.data.duration;
            allGeometries.push(...res.data.geometry);
          }
        }

        setRouteGeometry(allGeometries);
        setRouteStats({
          distance: totalDistance,
          duration: totalDuration,
          distanceText: totalDistance < 1000 ? `${Math.round(totalDistance)} m` : `${(totalDistance / 1000).toFixed(1)} km`,
          durationText: Math.round(totalDuration / 60) < 60 ? `${Math.round(totalDuration / 60)} min` : `${Math.floor(Math.round(totalDuration / 60) / 60)} hr ${Math.round(totalDuration / 60) % 60} min`,
        });
      } catch (err) {
        console.error('Failed to load routing stats:', err);
        setRouteGeometry(null);
        setRouteStats({ distance: 0, duration: 0 });
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoutes();
  }, [activeDay, activeTab, trip]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysCount = () => {
    if (!trip?.startDate || !trip?.endDate) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = end - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const togglePackingItem = (idx) => {
    setCheckedPackingItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'itinerary' && activeDay === 'all') {
      setActiveDay(1);
    }
  };

  // Overpass search triggers
  const handleNearbySearch = async (category) => {
    if (!trip) return;

    setNearbyLoading(true);
    setNearbyError('');
    setNearbyCategory(category);

    try {
      let searchLat = 0;
      let searchLng = 0;

      if (activeDay !== 'all') {
        const dayActs = trip.itinerary.find((d) => d.dayNumber === activeDay)?.activities || [];
        const validCoords = dayActs.find((act) => act.coordinates && act.coordinates.lat && act.coordinates.lng);
        if (validCoords) {
          searchLat = validCoords.coordinates.lat;
          searchLng = validCoords.coordinates.lng;
        }
      }

      if (!searchLat && trip.coordinates && trip.coordinates.lat && trip.coordinates.lng) {
        searchLat = trip.coordinates.lat;
        searchLng = trip.coordinates.lng;
      }

      if (!searchLat) {
        for (let d of trip.itinerary) {
          const validCoords = d.activities.find((act) => act.coordinates && act.coordinates.lat && act.coordinates.lng);
          if (validCoords) {
            searchLat = validCoords.coordinates.lat;
            searchLng = validCoords.coordinates.lng;
            break;
          }
        }
      }

      if (!searchLat) {
        throw new Error('No coordinates found for this trip. Unable to query nearby POIs.');
      }

      const res = await mapsService.getNearby(searchLat, searchLng, category, 5000);
      if (res.success && res.data) {
        setNearbyPlaces(res.data);
        if (res.data.length > 0) {
          setMapCenter([searchLat, searchLng]);
          setMapZoom(13);
        } else {
          setNearbyError('No locations found within 5km for this category.');
        }
      } else {
        setNearbyPlaces([]);
        setNearbyError('Failed to load nearby places.');
      }
    } catch (err) {
      console.error(err);
      setNearbyPlaces([]);
      setNearbyError(err.message || 'Unable to load nearby places right now. Please try again.');
    } finally {
      setNearbyLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader size={40} />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <AlertCircle size={48} color="var(--color-error)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Itinerary Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{error || 'This travel plan does not exist.'}</p>
        <Button onClick={() => navigate('/')} variant="primary">Go to Homepage</Button>
      </div>
    );
  }

  const daysCount = getDaysCount();
  const currentDayData = trip.itinerary.find((d) => d.dayNumber === activeDay) || trip.itinerary[0];

  // Map markers mapping
  const itineraryMarkers = [];
  let markerCounter = 1;

  trip.itinerary.forEach((d) => {
    if (activeDay !== 'all' && d.dayNumber !== activeDay) return;

    d.activities.forEach((act) => {
      if (act.coordinates && act.coordinates.lat && act.coordinates.lng) {
        itineraryMarkers.push({
          id: `itinerary_${d.dayNumber}_${act.title}`,
          type: 'itinerary',
          index: markerCounter++,
          latitude: act.coordinates.lat,
          longitude: act.coordinates.lng,
          popupContent: (
            <div>
              <p style={{ fontWeight: 800, margin: '0 0 0.15rem', color: 'var(--color-primary)' }}>
                Day {d.dayNumber} — {act.time}
              </p>
              <h4 style={{ fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--color-text)' }}>{act.title}</h4>
              <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{act.description}</p>
              <p style={{ fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>Cost: {formatCurrency(act.cost, trip.currency)}</p>
            </div>
          ),
        });
      }
    });
  });

  const nearbyMarkers = nearbyPlaces.map((place) => ({
    id: place.id,
    type: 'nearby',
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    popupContent: (
      <div>
        <h4 style={{ fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--color-text)' }}>{place.name}</h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>{place.address}</p>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
          Category: {place.category}
        </span>
      </div>
    ),
  }));

  const allMarkers = [...itineraryMarkers, ...nearbyMarkers];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 0 5rem',
      }}
    >
      {/* Top Banner Summary Card */}
      <motion.div variants={item} style={{ marginBottom: '2rem' }}>
        <Card
          style={{
            padding: '2.5rem 2rem',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 20px rgba(23, 32, 51, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.50rem' }}>
                <Sparkles size={14} />
                Shared Travel Plan
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                {trip.destination}
              </h1>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.925rem', marginTop: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={16} color="var(--color-secondary)" />
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ({daysCount} Days)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={16} color="var(--color-primary)" />
                  {trip.travelers} {trip.travelers > 1 ? 'Travelers' : 'Traveler'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {trip.currency === 'USD' ? <DollarSign size={16} color="var(--color-primary)" /> : <IndianRupee size={16} color="var(--color-primary)" />}
                  Budget: {formatCurrency(trip.budget, trip.currency)} ({trip.travelStyle ? trip.travelStyle.toUpperCase() : 'BALANCED'})
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Summary paragraph */}
      {trip.summary && (
        <motion.div variants={item} style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
          <Card style={{ backgroundColor: 'var(--color-surface-light)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Overview</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{trip.summary}</p>
          </Card>
        </motion.div>
      )}

      {/* Tab Selector */}
      <motion.div
        variants={item}
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => handleTabChange('itinerary')}
          className="tab-button-hover"
          style={{
            padding: '0.5rem 1rem',
            color: activeTab === 'itinerary' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'itinerary' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            marginBottom: '-0.85rem',
            transition: 'all 0.2s',
          }}
        >
          Itinerary View
        </button>
        <button
          onClick={() => handleTabChange('map')}
          className="tab-button-hover"
          style={{
            padding: '0.5rem 1rem',
            color: activeTab === 'map' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'map' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            marginBottom: '-0.85rem',
            transition: 'all 0.2s',
          }}
        >
          Interactive Map
        </button>
        <button
          onClick={() => handleTabChange('weather')}
          className="tab-button-hover"
          style={{
            padding: '0.5rem 1rem',
            color: activeTab === 'weather' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'weather' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            marginBottom: '-0.85rem',
            transition: 'all 0.2s',
          }}
        >
          Weather
        </button>
      </motion.div>

      {/* Tab Contents */}
      {activeTab === 'map' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Side: Map and POIs list */}
          <motion.div variants={item} style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                    {activeDay === 'all' ? 'Entire Trip Locations' : `Day ${activeDay} Route`}
                  </h3>
                  {activeDay !== 'all' && routeStats && routeStats.distanceText && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', margin: '0.15rem 0 0', fontWeight: 600 }}>
                      Distance: {routeStats.distanceText} • Travel Time: {routeStats.durationText}
                    </p>
                  )}
                </div>

                {routeLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Calculating routes...</span>
                  </div>
                )}
              </div>

              <MapView
                center={mapCenter}
                zoom={mapZoom}
                markers={allMarkers}
                route={routeGeometry}
              />
            </Card>

            {/* Nearby Places Results panel */}
            {nearbyCategory && (
              <Card style={{ padding: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                    Nearby {nearbyCategory.charAt(0).toUpperCase() + nearbyCategory.slice(1)} ({nearbyPlaces.length})
                  </h3>
                  <button
                    onClick={() => {
                      setNearbyCategory(null);
                      setNearbyPlaces([]);
                    }}
                    style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear Results
                  </button>
                </div>

                {nearbyLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2.5rem 0' }}>
                    <Loader2 size={24} className="animate-spin" color="var(--color-primary)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Searching OpenStreetMap database...</span>
                  </div>
                ) : nearbyError ? (
                  <p style={{ color: 'var(--color-error)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0', margin: 0 }}>{nearbyError}</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {nearbyPlaces.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        onViewOnMap={(lat, lng) => {
                          setMapCenter([lat, lng]);
                          setMapZoom(16);
                        }}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}
          </motion.div>

          {/* Right Side: Map Controls & Local POIs Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
            {/* Day selector */}
            <motion.div variants={item}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Select Day Filter</h2>
              <Card style={{ padding: '1rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    backgroundColor: 'var(--color-surface-lighter)',
                    padding: '0.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--color-border)',
                    gap: '0.25rem',
                    width: '100%',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                  }}
                >
                  <button
                    onClick={() => setActiveDay('all')}
                    className="day-button-hover"
                    style={{
                      flex: '1 1 auto',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '0.5rem',
                      border: '1px solid',
                      borderColor: activeDay === 'all' ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: activeDay === 'all' ? 'var(--color-primary-light)' : 'var(--color-surface-light)',
                      color: activeDay === 'all' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      fontWeight: activeDay === 'all' ? 700 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      outline: 'none',
                      boxShadow: activeDay === 'all' ? '0 2px 6px rgba(15, 118, 110, 0.06)' : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Entire Trip
                  </button>
                  {trip.itinerary.map((d) => (
                    <button
                      key={d.dayNumber}
                      onClick={() => setActiveDay(d.dayNumber)}
                      className="day-button-hover"
                      style={{
                        flex: '1 1 auto',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '0.5rem',
                        border: '1px solid',
                        borderColor: activeDay === d.dayNumber ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: activeDay === d.dayNumber ? 'var(--color-primary-light)' : 'var(--color-surface-light)',
                        color: activeDay === d.dayNumber ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: activeDay === d.dayNumber ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        outline: 'none',
                        boxShadow: activeDay === d.dayNumber ? '0 2px 6px rgba(15, 118, 110, 0.06)' : 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Day {d.dayNumber}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* POI search categories panel */}
            <motion.div variants={item}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Explore Nearby Places</h2>
              <Card style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: 1.4, margin: 0 }}>
                  Select categories to find points of interest within 5km of daily itineraries. Locations will overlay on the map.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.25rem' }}>
                  {[
                    { category: 'attractions', label: 'Attractions', icon: Compass },
                    { category: 'restaurants', label: 'Restaurants', icon: Utensils },
                    { category: 'cafes', label: 'Cafes', icon: Coffee },
                    { category: 'museums', label: 'Museums', icon: Bookmark },
                    { category: 'beaches', label: 'Beaches', icon: Sparkles },
                    { category: 'parks', label: 'Parks', icon: Map },
                    { category: 'shopping', label: 'Shopping', icon: ShoppingBag },
                    { category: 'hotels', label: 'Hotels', icon: Hotel },
                    { category: 'temples', label: 'Temples', icon: Eye },
                    { category: 'viewpoints', label: 'Viewpoints', icon: Compass },
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = nearbyCategory === cat.category;
                    return (
                      <button
                        key={cat.category}
                        onClick={() => handleNearbySearch(cat.category)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '0.5rem',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-light)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          fontSize: '0.775rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          outline: 'none',
                        }}
                      >
                        <CatIcon size={13} style={{ flexShrink: 0 }} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === 'itinerary' && (
        /* Itinerary View (Schedule vs Cost Breakdown) */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Side: Schedule */}
          <motion.div variants={item} style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>Schedule</h2>
            </div>

            {/* Days Tabs selector */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--color-surface-lighter)',
                padding: '0.25rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--color-border)',
                gap: '0.25rem',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                scrollbarWidth: 'none',
              }}
            >
              {trip.itinerary.map((d) => (
                <button
                  key={d.dayNumber}
                  onClick={() => setActiveDay(d.dayNumber)}
                  className="day-button-hover"
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: activeDay === d.dayNumber ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: activeDay === d.dayNumber ? 'var(--color-primary-light)' : 'var(--color-surface-light)',
                    color: activeDay === d.dayNumber ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontWeight: activeDay === d.dayNumber ? 700 : 500,
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxShadow: activeDay === d.dayNumber ? '0 2px 6px rgba(15, 118, 110, 0.06)' : 'none',
                  }}
                >
                  Day {d.dayNumber}
                </button>
              ))}
            </div>

            {/* Day Theme */}
            {currentDayData && (
              <Card
                style={{
                  padding: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--color-primary)' }}>Day {activeDay}: </span>
                  {currentDayData.theme || `Tour of ${trip.destination}`}
                </h3>

                {/* Day Activities Timeline */}
                {currentDayData.activities && currentDayData.activities.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid var(--color-border)' }}>
                    {currentDayData.activities.map((act, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        {/* Timeline dot */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-26px',
                            top: '3px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-surface-light)',
                            border: '2px solid var(--color-primary)',
                          }}
                        />
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                            {act.time}
                          </span>
                          
                          {act.cost > 0 && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', backgroundColor: 'rgba(22, 163, 74, 0.08)', padding: '0.15rem 0.45rem', borderRadius: '0.45rem' }}>
                              Cost: {formatCurrency(act.cost, trip.currency)}
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.025rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                          {act.title}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '0.50rem' }}>
                          {act.description}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {act.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MapPin size={12} color="var(--color-secondary)" />
                              {act.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No activities configured for this day.</p>
                )}
              </Card>
            )}
          </motion.div>

          {/* Right Side: Sidebar Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
            {/* Budget Breakdown */}
            {trip.budgetBreakdown && (
              <motion.div variants={item}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Cost Breakdown</h2>
                <Card style={{ backgroundColor: 'var(--color-surface-light)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    {[
                      { label: 'Lodging & Hotels', val: trip.budgetBreakdown.accommodation, color: 'var(--color-secondary)' },
                      { label: 'Food & Meals', val: trip.budgetBreakdown.food, color: 'var(--color-success)' },
                      { label: 'Transportation', val: trip.budgetBreakdown.transportation, color: 'var(--color-accent)' },
                      { label: 'Activities & Fees', val: trip.budgetBreakdown.activities, color: 'var(--color-primary)' },
                      { label: 'Other Expenses', val: trip.budgetBreakdown.other, color: 'var(--color-text-ultra-muted)' },
                    ].map((cat) => {
                      const percent = trip.budget > 0 ? (cat.val / trip.budget) * 100 : 0;
                      return (
                        <div key={cat.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            <span>{cat.label}</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{formatCurrency(cat.val, trip.currency)} ({Math.round(percent)}%)</span>
                          </div>
                          {/* Progress Bar */}
                          <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--color-primary-light)', borderRadius: '3px' }}>
                            <div style={{ height: '100%', width: `${percent}%`, backgroundColor: cat.color, borderRadius: '3px' }} />
                          </div>
                        </div>
                      );
                    })}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem', fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Wallet size={16} color="var(--color-success)" />
                        Total Estimated
                      </span>
                      <span>{formatCurrency(trip.budgetBreakdown.total, trip.currency)}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Packing list Checklist */}
            {trip.packingList && trip.packingList.length > 0 && (
              <motion.div variants={item}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Packing Checklist</h2>
                <Card style={{ backgroundColor: 'var(--color-surface-light)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {trip.packingList.map((item, idx) => {
                      const isChecked = checkedPackingItems[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => togglePackingItem(idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            fontSize: '0.875rem',
                            color: isChecked ? 'var(--color-text-ultra-muted)' : 'var(--color-text)',
                            textDecoration: isChecked ? 'line-through' : 'none',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          <ListTodo
                            size={16}
                            color={isChecked ? 'var(--color-success)' : 'var(--color-text-muted)'}
                            style={{ flexShrink: 0 }}
                          />
                          <span>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Local Smart Tips */}
            {trip.tips && trip.tips.length > 0 && (
              <motion.div variants={item}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Travel Guidelines & Tips</h2>
                <Card style={{ backgroundColor: 'var(--color-surface-light)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(23, 32, 51, 0.06)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {trip.tips.map((tip, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--color-text-muted)' }}>
                        <Lightbulb size={16} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'weather' && (
        <motion.div variants={item} style={{ textAlign: 'left' }}>
          <WeatherCard 
            latitude={trip.coordinates?.lat} 
            longitude={trip.coordinates?.lng}
            locationName={trip.destination}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default PublicTripDetail;
