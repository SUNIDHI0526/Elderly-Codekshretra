import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { fetchOverpassNearbyPlaces, NearbyPlace } from '../services/mapService';
import { Phone, Navigation, MapPin, AlertCircle, RefreshCw, Filter, ShieldCheck } from 'lucide-react';

interface EmergencyMapProps {
  userLocation: { lat: number; lng: number } | null;
  locationPermission: 'granted' | 'denied' | 'prompt';
  onRequestLocation: () => void;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  userLocation,
  locationPermission,
  onRequestLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'hospital' | 'clinic' | 'pharmacy'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  // Default coordinates (e.g. Nagpur / Central India if user denies or prompts)
  const activeLat = userLocation?.lat ?? 21.1458;
  const activeLng = userLocation?.lng ?? 79.0882;

  // Load nearby places from Overpass API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchOverpassNearbyPlaces(activeLat, activeLng, 6000)
      .then((data) => {
        if (isMounted) {
          setPlaces(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeLat, activeLng]);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeLat, activeLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([activeLat, activeLng], 14);
    }

    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    // Add Patient / User location pin
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="background-color: #059669; border: 3px solid white; border-radius: 9999px; width: 22px; height: 22px; box-shadow: 0 0 12px rgba(5, 150, 105, 0.7); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; background: white; border-radius: 9999px;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker([activeLat, activeLng], { icon: userIcon })
      .bindPopup(`<b>Patient Current Location</b><br/>Lat: ${activeLat.toFixed(4)}, Lng: ${activeLng.toFixed(4)}`)
      .addTo(markersGroup);

    // Filter places
    const filtered = filterType === 'all' ? places : places.filter((p) => p.type === filterType);

    filtered.forEach((place) => {
      let pinColor = '#EF4444'; // Red for hospitals
      if (place.type === 'clinic') pinColor = '#2563EB'; // Blue
      if (place.type === 'pharmacy') pinColor = '#10B981'; // Green
      if (place.type === 'ambulance') pinColor = '#F59E0B'; // Amber

      const placeIcon = L.divIcon({
        className: 'custom-place-marker',
        html: `
          <div style="background-color: ${pinColor}; border: 2px solid white; border-radius: 9999px; width: 28px; height: 28px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${place.type === 'hospital' ? 'H' : place.type === 'pharmacy' ? 'Rx' : '+' }
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([place.lat, place.lng], { icon: placeIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
            <b style="color: #1c1917;">${place.name}</b><br/>
            <span style="color: #78716c;">${place.address}</span><br/>
            <b>${place.distanceKm} km away</b> | Tel: <b>${place.phone}</b><br/>
            <div style="margin-top: 6px;">
              <a href="${place.googleMapsDirectionUrl}" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 600; text-decoration: underline;">
                Open Navigation &rarr;
              </a>
            </div>
          </div>
        `)
        .addTo(markersGroup);

      marker.on('click', () => {
        setSelectedPlace(place);
      });
    });
  }, [activeLat, activeLng, places, filterType]);

  const filteredPlaces = filterType === 'all' ? places : places.filter((p) => p.type === filterType);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Location Status Bar */}
      <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-700" />
          <div>
            <div className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <span>Nearby Emergency Services & Verified Facilities</span>
              {locationPermission === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> GPS Location Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Approximate City Center (GPS Denied/Default)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600">
              Real OpenStreetMap facilities via Overpass API • One-tap call & directions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {locationPermission !== 'granted' && (
            <button
              onClick={onRequestLocation}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5" /> Enable Exact GPS
            </button>
          )}

          <div className="flex bg-stone-200/80 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterType === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              All ({places.length})
            </button>
            <button
              onClick={() => setFilterType('hospital')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterType === 'hospital' ? 'bg-white text-red-700 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Hospitals
            </button>
            <button
              onClick={() => setFilterType('clinic')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterType === 'clinic' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Clinics
            </button>
            <button
              onClick={() => setFilterType('pharmacy')}
              className={`px-2.5 py-1 rounded-md transition-colors ${filterType === 'pharmacy' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Pharmacies
            </button>
          </div>
        </div>
      </div>

      {/* Map & Facility List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-7 h-[340px] lg:h-full relative min-h-[350px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          {loading && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 shadow-sm flex items-center gap-2 z-10">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              Scanning nearby facilities...
            </div>
          )}
        </div>

        {/* Real Nearby Places List */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-stone-200 p-4 max-h-[500px] overflow-y-auto space-y-3 bg-stone-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Found {filteredPlaces.length} Facilities Nearby
            </span>
            <span className="text-xs text-stone-500">Sorted by distance</span>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">
              No matching medical facilities found within search radius.
            </div>
          ) : (
            filteredPlaces.map((place) => {
              const isSelected = selectedPlace?.id === place.id;
              return (
                <div
                  key={place.id}
                  onClick={() => {
                    setSelectedPlace(place);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([place.lat, place.lng], 16, { animate: true });
                    }
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/60 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            place.type === 'hospital'
                              ? 'bg-red-100 text-red-800'
                              : place.type === 'pharmacy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {place.type}
                        </span>
                        {place.emergency24x7 && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                            24x7
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-stone-900 text-sm mt-1 leading-snug">
                        {place.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">{place.address}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-emerald-700">{place.distanceKm} km</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-emerald-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Call {place.phone}</span>
                    </a>

                    <a
                      href={place.googleMapsDirectionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline px-2 py-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
