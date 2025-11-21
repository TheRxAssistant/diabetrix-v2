import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import {
  MAPS_API_KEY,
  Provider,
  Facility,
} from "../../../services/types/healthcare/types";

interface ProviderMapProps {
  list: Provider[] | Facility[];
  on_provider_select?: (provider: Provider) => void;
  selected_id?: string;
}

// Function to create an info window for a provider
const create_info_window = (
  item: any,
  map: google.maps.Map,
  on_provider_select_callback?: (provider: Provider) => void,
  on_close_callback?: () => void
) => {
  // Create and open InfoWindow for selected marker
  const info_window = new google.maps.InfoWindow({
    position: {
      lat:
        item.latitude ||
        item.provider_full_address_obj?.lat ||
        item.facility_full_address_obj?.lat ||
        0,
      lng:
        item.longitude ||
        item.provider_full_address_obj?.long ||
        item.facility_full_address_obj?.long ||
        0,
    },
    pixelOffset: new google.maps.Size(0, -5),
    maxWidth: 320,
  });

  // Add close listener to reset selected marker
  google.maps.event.addListener(info_window, "closeclick", () => {
    if (on_close_callback) on_close_callback();
  });

  // Create content for InfoWindow
  const content_element = document.createElement("div");
  content_element.className = "p-4 max-w-xs rounded-lg shadow-inner bg-white";

  // Provider image/avatar section
  const image_section = document.createElement("div");
  image_section.className = "flex justify-center mb-3";

  if (item.provider_image || item.facility_image) {
    const img = document.createElement("img");
    img.src = item.provider_image || item.facility_image;
    img.alt = item.provider_name || item.facility_name || "";
    img.className =
      "w-24 h-24 object-cover rounded-full border-2 border-blue-500 shadow-md";
    image_section.appendChild(img);
  } else {
    const avatar = document.createElement("div");
    avatar.className =
      "w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-md";

    const initials = document.createElement("span");
    initials.className = "text-blue-600 text-xl font-bold";
    const name = ('provider_name' in item ? item.provider_name : item.facility_name) || "";
    initials.textContent = name
      .split(" ")
      .map((n: string) => n[0] || "")
      .join("")
      .substring(0, 2)
      .toUpperCase();

    avatar.appendChild(initials);
    image_section.appendChild(avatar);
  }

  content_element.appendChild(image_section);

  // Provider details section
  const details_section = document.createElement("div");
  details_section.className = "text-center";

  const name = document.createElement("h3");
  name.className = "font-semibold text-base text-gray-800";
  name.textContent = item.provider_name || item.facility_name || "";
  details_section.appendChild(name);

  if (item.provider_specialty) {
    const specialty = document.createElement("p");
    specialty.className = "text-sm text-blue-600 font-medium mt-1";
    specialty.textContent =
      item.provider_specialty || item.facility_specialty || "";
    details_section.appendChild(specialty);
  }

  content_element.appendChild(details_section);

  // Provider address section
  if (item.provider_address || item.facility_address) {
    const address_section = document.createElement("div");
    address_section.className =
      "flex items-start mt-3 bg-gray-50 p-2 rounded-md";

    // Create SVG element for map pin icon (inline SVG as fallback if file doesn't exist)
    const icon = document.createElement("div");
    icon.className = "flex-shrink-0 mt-0.5 mr-2 text-blue-500";
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `;

    const address_text = document.createElement("p");
    address_text.className = "text-xs text-gray-700";
    address_text.textContent =
      item.provider_address || item.facility_address || "";

    address_section.appendChild(icon);
    address_section.appendChild(address_text);
    content_element.appendChild(address_section);
  }

  // Set content and open the info window
  info_window.setContent(content_element);
  info_window.open(map);

  return null; // Return null to fix React rendering issue
};

const PlotMap: React.FC<ProviderMapProps> = ({
  list,
  on_provider_select,
  selected_id,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY || "",
    libraries: ["marker"],
  });

  const [selected_marker, set_selected_marker] = useState<Provider | null>(
    null
  );
  const map_container_ref = useRef<HTMLDivElement>(null);
  const map_instance_ref = useRef<google.maps.Map | null>(null);
  const markers_ref = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const info_windows_ref = useRef<google.maps.InfoWindow[]>([]);

  // Handle marker click
  const handle_marker_click = useCallback(
    (item: any) => {
      set_selected_marker(item);
      if (on_provider_select) {
        on_provider_select(item);
      }
    },
    [on_provider_select]
  );

  // Initialize map when component loads
  useEffect(() => {
    if (isLoaded && map_container_ref.current && window.google) {
      initialize_map();
    }
  }, [isLoaded]);

  // Update markers when providers or selected provider changes
  useEffect(() => {
    if (isLoaded && map_instance_ref.current && window.google) {
      update_markers(selected_id);
    }
  }, [isLoaded, list, selected_id]);

  // Initialize the map
  const initialize_map = () => {
    if (!map_container_ref.current || !window.google) return;

    const map = new google.maps.Map(map_container_ref.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 6,
      mapId: "8f541e0f9c4c2d1a", // Required for AdvancedMarkerElement
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
    });

    map_instance_ref.current = map;

    // Initial marker creation
    update_markers();
  };

  const update_markers = (selected_id?: string) => {
    if (!map_instance_ref.current || !window.google) return;

    // Clear existing markers
    markers_ref.current.forEach((marker) => (marker.map = null));
    markers_ref.current = [];

    // Clear existing info windows
    info_windows_ref.current.forEach((window) => window.close());
    info_windows_ref.current = [];

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds();
    let has_valid_coordinates = false;

    // Create new markers for each provider
    list.forEach((item) => {
      // Type guard to check if it's a Provider or Facility
      const isProvider = 'provider_id' in item;
      const isFacility = 'facility_id' in item;
      const providerItem = item as any;
      const facilityItem = item as any;
      
      // Ensure we have valid coordinates - check new API format first (latitude/longitude), then legacy format
      const lat =
        (isProvider && (providerItem.latitude || providerItem.provider_full_address_obj?.lat)) ||
        (isFacility && facilityItem.facility_full_address_obj?.lat);
      const lng =
        (isProvider && (providerItem.longitude || providerItem.provider_full_address_obj?.long)) ||
        (isFacility && facilityItem.facility_full_address_obj?.long);

      if (typeof lat !== "number" || typeof lng !== "number") {
        const name = (isProvider ? providerItem.provider_name : facilityItem.facility_name) || 'Unknown';
        console.warn(
          "Invalid coordinates for provider:",
          name
        );
        return;
      }

      const position = { lat, lng };
      const is_selected =
        (isProvider && selected_id === providerItem.provider_id) ||
        (isFacility && selected_id === facilityItem.facility_id);

      try {
        const itemName = (isProvider ? providerItem.provider_name : facilityItem.facility_name) || 'Unknown';
        // Create the advanced marker with enhanced visibility
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position,
          map: map_instance_ref.current,
          title: itemName,
          content: new google.maps.marker.PinElement({
            background: is_selected ? "#EA4335" : "#4285F4",
            glyph: is_selected ? "★" : "",
            borderColor: "#FFFFFF",
            scale: is_selected ? 1.5 : 1.2,
          }).element,
          zIndex: is_selected ? 1000 : 1, // Ensure selected marker appears on top
        });

        // Add click listener
        marker.addListener("click", () => handle_marker_click(item));

        // Store the marker reference
        markers_ref.current.push(marker);

        // Extend bounds
        bounds.extend(position);
        has_valid_coordinates = true;
      } catch (error) {
        console.error("Error creating marker:", error);
      }
    });

    // Center the map precisely on the plotted markers
    if (has_valid_coordinates && !bounds.isEmpty()) {
      // Apply padding to bounds for better visualization
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };

      // Use fitBounds with padding to center the map on the markers
      map_instance_ref.current.fitBounds(bounds);

      // Adjust viewport to account for padding
      const currentBounds = map_instance_ref.current.getBounds();
      if (currentBounds) {
        const ne = currentBounds.getNorthEast();
        const sw = currentBounds.getSouthWest();
        const center = map_instance_ref.current.getCenter();

        // Limit zoom level to avoid excessive zoom on multiple close markers
        const zoom = map_instance_ref.current.getZoom();
        if (zoom && zoom > 15) {
          map_instance_ref.current.setZoom(15);
        } else if (zoom && zoom < 4) {
          // Ensure we're not zoomed out too far
          map_instance_ref.current.setZoom(4);
        }
      }
    }

    // Center on selected provider if available with smooth animation
    if (selected_id) {
      const selected_provider: any = list.find(
        (p: any) =>
          p.provider_id === selected_id || p.facility_id === selected_id
      );
      if (
        selected_provider &&
        (selected_provider.latitude ||
          selected_provider.provider_full_address_obj?.lat ||
          selected_provider.facility_full_address_obj?.lat) &&
        (selected_provider.longitude ||
          selected_provider.provider_full_address_obj?.long ||
          selected_provider.facility_full_address_obj?.long)
      ) {
        // Get the position of the selected provider - check new API format first
        const position = {
          lat:
            selected_provider.latitude ||
            selected_provider.provider_full_address_obj?.lat ||
            selected_provider.facility_full_address_obj?.lat,
          lng:
            selected_provider.longitude ||
            selected_provider.provider_full_address_obj?.long ||
            selected_provider.facility_full_address_obj?.long,
        };

        // Use smooth pan animation to center on the selected provider
        map_instance_ref.current.panTo(position);

        // Set appropriate zoom level for detailed view
        map_instance_ref.current.setZoom(14); // Closer zoom for selected provider

        // Update selected marker state to show info window
        set_selected_marker(selected_provider);

        // Create a small delay before showing the info window to ensure smooth animation
        setTimeout(() => {
          if (map_instance_ref.current) {
            // Make sure the map is still centered on the selected provider
            map_instance_ref.current.panTo(position);
          }
        }, 300);
      }
    }
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Clear markers
      markers_ref.current.forEach((marker) => (marker.map = null));
      markers_ref.current = [];

      // Clear info windows
      info_windows_ref.current.forEach((window) => window.close());
      info_windows_ref.current = [];
    };
  }, []);

  if (loadError) return <div className="text-red-500">Error loading maps</div>;
  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-full">
        Loading map...
      </div>
    );

  return (
    <div
      style={{
        height: "100vh", // Use viewport height for full height
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        minHeight: "600px", // Increased minimum height
        flex: "1 1 auto", // Flex grow, shrink, and basis auto
        display: "flex",
        flexDirection: "column",
        position: "relative", // Ensure proper stacking context
      }}
    >
      <div
        ref={map_container_ref}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "600px",
          flex: "1 1 auto",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* InfoWindow for selected marker */}
      {selected_marker && map_instance_ref.current && (
        <div style={{ display: "none" }}>
          {create_info_window(
            selected_marker,
            map_instance_ref.current,
            on_provider_select,
            () => set_selected_marker(null)
          )}
        </div>
      )}
    </div>
  );
};

export default PlotMap;
