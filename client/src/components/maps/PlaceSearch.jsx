import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react';
import mapsService from '../../services/mapsService';

function PlaceSearch({
  onSelectLocation,
  defaultValue = '',
  placeholder = 'Search destinations (e.g. Paris, Tokyo...)',
  label = 'Destination',
}) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef(null);
  const debounceTimer = useRef(null);

  // Sync with defaultValue if it updates externally
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding search
  const performSearch = async (searchVal) => {
    if (!searchVal || searchVal.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Nominatim search helper
      const res = await mapsService.geocode(searchVal);
      if (res.success && res.data) {
        // Wrap single result in an array for dropdown interface compatibility
        setResults([res.data]);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    } catch (err) {
      // Handle no results/404 vs actual error
      if (err.response?.status === 404) {
        setResults([]);
        setIsOpen(true); // Open dropdown to show "No results"
      } else {
        setError(err.response?.data?.message || 'Failed to search places. Node offline?');
        setIsOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(val);
    }, 600);
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setIsOpen(false);
    if (onSelectLocation) {
      onSelectLocation(item);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', textAlign: 'left' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginBottom: '0.5rem',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            backgroundColor: 'var(--color-surface-light)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem 0.75rem 2.75rem',
            color: 'var(--color-text)',
            outline: 'none',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
        />
        
        {/* Search icon left */}
        <div
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            backgroundColor: 'var(--color-surface-light)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
            marginTop: '0.5rem',
            maxHeight: '220px',
            overflowY: 'auto',
            boxShadow: '0 8px 30px rgba(23, 32, 51, 0.08)',
            zIndex: 999,
          }}
        >
          {error ? (
            <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              No destinations found
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderBottom: idx < results.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-lighter)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                  <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem', margin: 0 }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {item.displayName}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PlaceSearch;
