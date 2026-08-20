import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '../components/common/Modal';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  IndianRupee,
  Share2,
  Compass,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  Lightbulb,
  Wallet,
  ArrowLeft,
  Loader2,
  Utensils,
  Coffee,
  Edit2,
  Trash2,
  Bookmark,
  Sparkles,
  Map,
  ShoppingBag,
  Eye,
  Hotel,
} from 'lucide-react';
import api from '../services/api';
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

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Tab and filter states
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' or 'map'
  const [activeDay, setActiveDay] = useState(1);
  const [shareText, setShareText] = useState('Share Itinerary');
  const [copied, setCopied] = useState(false);
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

  // Edit / Delete dialog states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: 50000,
    travelStyle: 'balanced',
    accommodation: 'Hotel',
    transportation: 'Metro',
    foodPreferences: '',
    interests: '',
  });
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch Trip Details
  const { data: trip, isLoading: loading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const res = await api.get(`/trips/${id}`);
      return res.data.data.trip;
    },
  });

  // Handle setting checked packing items and map center when trip changes
  useEffect(() => {
    if (!trip) return;

    if (trip.packingList) {
      const initialChecked = {};
      trip.packingList.forEach((item, index) => {
        initialChecked[index] = false;
      });
      setCheckedPackingItems(initialChecked);
    }

    if (trip.coordinates && trip.coordinates.lat && trip.coordinates.lng) {
      setMapCenter([trip.coordinates.lat, trip.coordinates.lng]);
    } else {
      let found = false;
      for (let d of trip.itinerary) {
        for (let act of d.activities) {
          if (act.coordinates && act.coordinates.lat && act.coordinates.lng) {
            setMapCenter([act.coordinates.lat, act.coordinates.lng]);
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) setMapCenter([15.2993, 74.1240]);
    }
  }, [trip]);

  // Recenter map when changing active day inside Map tab
  useEffect(() => {
    if (!trip || activeTab !== 'map') return;

    if (activeDay === 'all') {
      // Fit to trip coordinates
      if (trip.coordinates && trip.coordinates.lat && trip.coordinates.lng) {
        setMapCenter([trip.coordinates.lat, trip.coordinates.lng]);
        setMapZoom(11);
      }
    } else {
      // Find first activity coordinates of the selected day
      const dayActs = trip.itinerary.find((d) => d.dayNumber === activeDay)?.activities || [];
      const validCoords = dayActs.find((act) => act.coordinates && act.coordinates.lat && act.coordinates.lng);
      if (validCoords) {
        setMapCenter([validCoords.coordinates.lat, validCoords.coordinates.lng]);
        setMapZoom(13);
      }
    }
  }, [activeDay, activeTab, trip]);

  // Calculate day-specific route geometry via backend OSRM
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

  const handleOpenEdit = () => {
    if (!trip) return;
    setEditFormData({
      destination: trip.destination || '',
      startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
      endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
      travelers: trip.travelers || 1,
      budget: trip.budget || 0,
      travelStyle: trip.travelStyle || 'balanced',
      accommodation: trip.accommodation || 'Hotel',
      transportation: trip.transportation || 'Metro',
      foodPreferences: Array.isArray(trip.foodPreferences) ? trip.foodPreferences.join(', ') : '',
      interests: Array.isArray(trip.interests) ? trip.interests.join(', ') : '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setEditError('');

    try {
      const payload = {
        ...editFormData,
        startDate: editFormData.startDate ? new Date(editFormData.startDate).toISOString() : '',
        endDate: editFormData.endDate ? new Date(editFormData.endDate).toISOString() : '',
        travelers: Number(editFormData.travelers),
        budget: Number(editFormData.budget),
        coordinates: trip?.coordinates || { lat: 15.2993, lng: 74.1240 },
        foodPreferences: editFormData.foodPreferences
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        interests: editFormData.interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await api.put(`/trips/${id}`, payload);
      
      // Invalidate queries to refresh values
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update trip details');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrip = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/trips/${id}`);
      
      // Invalidate query to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      setShowDeleteModal(false);
      navigate('/dashboard');
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete trip');
    } finally {
      setIsDeleting(false);
    }
  };

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

  const handleShare = async () => {
    if (!trip) return;
    try {
      if (!trip.isPublic) {
        const res = await api.put(`/trips/${trip._id}`, {
          ...trip,
          isPublic: true,
        });
        setTrip(res.data.data.trip);
        navigator.clipboard.writeText(`${window.location.origin}/share/${res.data.data.trip.shareId}`);
      } else {
        navigator.clipboard.writeText(`${window.location.origin}/share/${trip.shareId}`);
      }
      
      setCopied(true);
      setShareText('Link Copied!');
      setTimeout(() => {
        setCopied(false);
        setShareText('Share Itinerary');
      }, 3000);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const togglePackingItem = (idx) => {
    setCheckedPackingItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Safe tab switcher ensuring activeDay is valid when returning to schedule list view
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
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{error?.message || 'This travel plan does not exist or you lack permission to view it.'}</p>
        <Button onClick={() => navigate('/dashboard')} variant="primary">Back to Dashboard</Button>
      </div>
    );
  }

  const daysCount = getDaysCount();
  const currentDayData = trip.itinerary.find((d) => d.dayNumber === activeDay) || trip.itinerary[0];

  // Map markers mapping: Combine numbered itinerary dots and nearby places dots
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
        padding: '1.5rem 0 5rem',
      }}
    >
      {/* Back to Dashboard link */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseOver={(e) => (e.target.style.color = 'white')}
          onMouseOut={(e) => (e.target.style.color = 'var(--color-text-muted)')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      {/* Top Banner Summary Card */}
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
                <Compass size={14} />
                AI Generated Itinerary
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

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                onClick={handleShare}
                variant={copied ? 'success' : 'outline'}
                icon={copied ? CheckCircle2 : Share2}
              >
                {shareText}
              </Button>
              <Button
                onClick={handleOpenEdit}
                variant="outline"
                icon={Edit2}
              >
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="danger"
                icon={Trash2}
              >
                Delete
              </Button>
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

      {/* Tab Selector Links */}
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
          {/* Left Side: Leaflet Map and POI Results */}
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

            {/* POI Search Result List */}
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
            {/* Day Filter panel */}
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
                    style={{
                      flex: '1 1 auto',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor: activeDay === 'all' ? 'var(--color-surface-light)' : 'transparent',
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
                      style={{
                        flex: '1 1 auto',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        backgroundColor: activeDay === d.dayNumber ? 'var(--color-surface-light)' : 'transparent',
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
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: activeDay === d.dayNumber ? 'var(--color-surface-light)' : 'transparent',
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

      {/* Edit Trip Modal */}
      {showEditModal && (
        <Modal
          title="Edit Trip Settings"
          onClose={() => setShowEditModal(false)}
          footer={
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="ghost"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {editError && (
              <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}>
                {editError}
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Destination</label>
              <input
                type="text"
                required
                value={editFormData.destination}
                onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Start Date</label>
                <input
                  type="date"
                  required
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>End Date</label>
                <input
                  type="date"
                  required
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Travelers</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editFormData.travelers}
                  onChange={(e) => setEditFormData({ ...editFormData, travelers: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Budget ({trip?.currency})</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editFormData.budget}
                  onChange={(e) => setEditFormData({ ...editFormData, budget: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Travel Style</label>
                <select
                  value={editFormData.travelStyle}
                  onChange={(e) => setEditFormData({ ...editFormData, travelStyle: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
                >
                  <option value="balanced">Balanced</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="active">Active</option>
                  <option value="luxury">Luxury</option>
                  <option value="budget">Budget</option>
                  <option value="fast-paced">Fast-paced</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Accommodation</label>
                <select
                  value={editFormData.accommodation}
                  onChange={(e) => setEditFormData({ ...editFormData, accommodation: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Resort">Resort</option>
                  <option value="Guesthouse">Guesthouse</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Transit Mode</label>
                <select
                  value={editFormData.transportation}
                  onChange={(e) => setEditFormData({ ...editFormData, transportation: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
                >
                  <option value="Metro">Metro</option>
                  <option value="Rental Car">Rental Car</option>
                  <option value="Bus">Bus</option>
                  <option value="Walking">Walking</option>
                  <option value="Private Driver">Private Driver</option>
                  <option value="Train">Train</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Visibility</label>
                <select
                  value={editFormData.isPublic ? 'public' : 'private'}
                  onChange={(e) => setEditFormData({ ...editFormData, isPublic: e.target.value === 'public' })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
                >
                  <option value="private">Private</option>
                  <option value="public">Public (Shared)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Food Preferences (comma-separated)</label>
              <input
                type="text"
                value={editFormData.foodPreferences}
                onChange={(e) => setEditFormData({ ...editFormData, foodPreferences: e.target.value })}
                placeholder="e.g. Vegetarian, Local, Seafood"
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>Interests (comma-separated)</label>
              <input
                type="text"
                value={editFormData.interests}
                onChange={(e) => setEditFormData({ ...editFormData, interests: e.target.value })}
                placeholder="e.g. Sightseeing, Adventure, Food Tour"
                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text)' }}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete Trip Plan"
          onClose={() => setShowDeleteModal(false)}
          footer={
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteTrip}
                loading={isDeleting}
                disabled={isDeleting}
              >
                Delete Plan
              </Button>
            </div>
          }
        >
          <div style={{ textAlign: 'left' }}>
            {deleteError && (
              <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {deleteError}
              </div>
            )}
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
              Are you sure you want to delete this trip to <strong style={{ color: 'var(--color-primary)' }}>{trip?.destination}</strong>?
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>
              This action will permanently remove the trip, budget breakdown, and packing list from your account. This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}

export default TripDetail;
