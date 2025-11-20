import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
// Import Provider interface from useProviderSearch
import { Provider } from '../../../hooks/useProviderSearch';
import styles from './healthcare-provider-search.module.scss';

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (will be overridden by provider locations)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

// Extended Provider interface with required lat/lng for map
interface MapProvider extends Provider {
  provider_lat?: number;
  provider_lng?: number;
}

interface ProviderMapProps {
  providers: MapProvider[];
  onBackToList: () => void;
  singleProviderView?: boolean;
  selectedProvider?: MapProvider | null;
  embedded?: boolean;
}

const ProviderMap: React.FC<ProviderMapProps> = ({ providers, onBackToList, singleProviderView = false, selectedProvider: initialSelectedProvider = null, embedded = false }) => {
  const [selectedProvider, setSelectedProvider] = useState<MapProvider | null>(
    initialSelectedProvider || (singleProviderView && providers.length === 1 ? providers[0] : null)
  );

  // Calculate map center based on providers
  const calculateCenter = () => {
    if (providers.length === 1 && providers[0].provider_lat && providers[0].provider_lng) {
      return { lat: providers[0].provider_lat, lng: providers[0].provider_lng };
    }
    
    // If we have multiple providers, calculate the center point
    if (providers.length > 1) {
      const validProviders = providers.filter(p => p.provider_lat && p.provider_lng);
      
      if (validProviders.length > 0) {
        const latSum = validProviders.reduce((sum, p) => sum + (p.provider_lat || 0), 0);
        const lngSum = validProviders.reduce((sum, p) => sum + (p.provider_lng || 0), 0);
        
        return {
          lat: latSum / validProviders.length,
          lng: lngSum / validProviders.length
        };
      }
    }
    
    return defaultCenter;
  };
  
  const center = calculateCenter();
  
  // Calculate appropriate zoom level
  const calculateZoom = () => {
    if (singleProviderView || providers.length === 1) return 14;
    if (providers.length <= 5) return 12;
    if (providers.length <= 20) return 11;
    return 10;
  };

  // Extract coordinates from provider's full_address_obj if available
  const getProviderCoordinates = (provider: MapProvider) => {
    // Check if provider has valid numeric lat/lng
    if (typeof provider.provider_lat === 'number' && typeof provider.provider_lng === 'number') {
      return { lat: provider.provider_lat, lng: provider.provider_lng };
    }
    
    // Check if provider has valid address object with coordinates
    if (typeof provider.provider_full_address_obj?.lat === 'number' && 
        typeof provider.provider_full_address_obj?.long === 'number') {
      return { 
        lat: provider.provider_full_address_obj.lat, 
        lng: provider.provider_full_address_obj.long 
      };
    }
    
    // Log the provider that's missing coordinates
    console.log('Provider missing coordinates:', provider.provider_name);
    
    // Default coordinates if none available
    return { lat: defaultCenter.lat + (Math.random() * 0.05), lng: defaultCenter.lng + (Math.random() * 0.05) };
  };

  return (
    <div className={styles.map_container}>
      <div className={styles.map_header}>
        <button className={styles.back_btn} onClick={onBackToList}>
          ← Show List
        </button>
        <h2>{singleProviderView ? 'Provider Location' : 'Healthcare Providers'}</h2>
      </div>
      
      <LoadScript googleMapsApiKey="AIzaSyA0PMa5_XTyo_pLZ5PIDN_IE4eIVVyDPIU">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={calculateZoom()}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true
          }}
        >
          {providers.map((provider) => {
            const position = getProviderCoordinates(provider);
            return (
              <Marker
                key={provider.provider_id}
                position={position}
                onClick={() => setSelectedProvider(provider)}
                // @ts-ignore
                animation={singleProviderView ? google.maps.Animation.DROP : undefined}
              />
            );
          })}

          {selectedProvider && (
            <InfoWindow
              position={getProviderCoordinates(selectedProvider)}
              onCloseClick={() => setSelectedProvider(null)}
            >
              <div className={styles.info_window}>
                <h3>{selectedProvider.provider_name}</h3>
                <p>{selectedProvider.provider_specialty}</p>
                <p>{selectedProvider.provider_address}</p>
                <div className={styles.provider_rating}>
                  <span className={styles.star_icon}>★</span>
                  <span>{selectedProvider.provider_rating || 5}</span>
                  <span>({selectedProvider.provider_review_count || 0} reviews)</span>
                </div>
                {selectedProvider.provider_phone && (
                  <p>Phone: {selectedProvider.provider_phone}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default ProviderMap;
