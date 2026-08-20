import { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, IndianRupee, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

// Global client-side cache for resolved images
const imageCache = {
  goa: "https://upload.wikimedia.org/wikipedia/commons/f/fc/BeachFun.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  puducherry: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Pondicherry-Rock_beach_aerial_view.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  pondicherry: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Pondicherry-Rock_beach_aerial_view.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  pune: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Pune_West_skyline_-_March_2017.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  mumbai: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  delhi: "https://upload.wikimedia.org/wikipedia/commons/4/40/Jama_Masjid_2011.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  "new delhi": "https://upload.wikimedia.org/wikipedia/commons/4/40/Jama_Masjid_2011.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  paris: "https://upload.wikimedia.org/wikipedia/commons/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  tokyo: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  beijing: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  chicago: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Chicago_River_ferry_b.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  mussoorie: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Mussoorie_Snow_Over_Dehradun_%2814831297545%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  barcelona: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Evening_light_over_Barcelona.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  kyoto: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Kyoto%2C_Japan_%2849667780482%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  dubai: "https://upload.wikimedia.org/wikipedia/en/c/c7/Burj_Khalifa_2021.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
  amsterdam: "https://upload.wikimedia.org/wikipedia/commons/5/57/Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original"
};

const normalizeDestination = (dest) => {
  if (!dest) return '';
  return dest.toLowerCase().trim().split(',')[0].trim();
};

function TripCard({ trip, onClick }) {
  if (!trip) return null;

  const {
    destination = 'Unknown Destination',
    startDate,
    endDate,
    budget = 0,
  } = trip;

  const normDest = normalizeDestination(destination);

  const [imgUrl, setImgUrl] = useState(() => {
    return trip.image || trip.imageUrl || trip.coverImage || imageCache[normDest] || null;
  });
  const [imgState, setImgState] = useState(() => {
    const defaultImg = trip.image || trip.imageUrl || trip.coverImage || imageCache[normDest];
    return defaultImg ? 'success' : 'loading';
  });

  useEffect(() => {
    const staticOverride = trip.image || trip.imageUrl || trip.coverImage;
    if (staticOverride) {
      setImgUrl(staticOverride);
      setImgState('success');
      return;
    }

    if (imageCache[normDest]) {
      setImgUrl(imageCache[normDest]);
      setImgState('success');
      return;
    }

    let active = true;
    const fetchImage = async () => {
      try {
        setImgState('loading');
        const query = encodeURIComponent(normDest);
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=5&prop=pageimages&piprop=original&format=json&origin=*`;
        
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'OdysseusAITravelPlanner/1.0 (contact@odysseusai.com)'
          }
        });
        const data = await res.json();
        if (!active) return;

        const pages = data.query?.pages;
        if (!pages) {
          throw new Error('No pages found');
        }

        // Sort pages ascending by the search relevance index rank (1-indexed)
        const pageList = Object.values(pages).sort((a, b) => (a.index || 0) - (b.index || 0));
        
        // Find the first result containing a valid original image URL
        const bestPage = pageList.find(p => p.original && p.original.source);
        const resolvedUrl = bestPage?.original?.source || null;

        if (resolvedUrl) {
          imageCache[normDest] = resolvedUrl;
          setImgUrl(resolvedUrl);
          setImgState('success');
        } else {
          throw new Error('No valid representative image found in results');
        }
      } catch (err) {
        if (active) {
          setImgState('error');
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
    };
  }, [normDest, trip.image, trip.imageUrl, trip.coverImage]);

  const title = trip.title || `Trip to ${destination}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card
      padding="sm"
      hoverable={true}
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '240px',
        justifyContent: 'flex-end',
        padding: 0,
      }}
    >
      {/* Background Image / Cover */}
      {imgState !== 'error' && imgUrl ? (
        <>
          <img
            src={imgUrl}
            alt={destination}
            onLoad={() => setImgState('success')}
            onError={() => setImgState('error')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
              opacity: imgState === 'success' ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
          {imgState === 'loading' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, var(--color-surface-light), var(--color-surface))',
                zIndex: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="animate-pulse"
            />
          )}
        </>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, var(--color-surface-light), var(--color-surface))',
            zIndex: 0,
          }}
        />
      )}

      {/* Shadow Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 15%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content details */}
      <div style={{ position: 'relative', zIndex: 2, padding: '1.25rem', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
          {title}
        </h3>
        
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <MapPin size={12} color="var(--color-secondary)" />
          {destination}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Dates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <Calendar size={12} />
            <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
          </div>

          {/* Budget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
            {trip?.currency === 'USD' ? <DollarSign size={12} /> : <IndianRupee size={12} />}
            <span>{formatCurrency(budget, trip?.currency || 'INR')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TripCard;
