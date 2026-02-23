import React from 'react';
import { MapPin, Phone, Star } from 'lucide-react';
import type { Facility } from '../../services/provider-search/useProviderSearch';

export interface LabCardProps {
    facility: Facility;
    getInitials: (name: string) => string;
    onViewOnMap: () => void;
    isSelectedOnMap?: boolean;
}

export function LabCard({
    facility,
    getInitials,
    onViewOnMap,
    isSelectedOnMap,
}: LabCardProps) {
    const name = facility.facility_name || 'Lab';
    const address = facility.facility_address;
    const phone = facility.facility_phone;
    const rating = facility.facility_rating;
    const reviewCount = facility.facility_review_count;
    const anyF = facility as any;
    const lat = facility.facility_full_address_obj?.lat ?? anyF.latitude;
    const lng = facility.facility_full_address_obj?.long ?? anyF.longitude;
    const hasCoords = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
    const description = facility.facility_description;
    const mapsUrl = address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        : hasCoords
          ? `https://www.google.com/maps?q=${lat},${lng}`
          : null;

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-3 last:mb-0">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                    {facility.facility_image ? (
                        <img
                            src={facility.facility_image}
                            alt={name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        getInitials(name)
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base">{name}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{description}</p>
                    {address && (
                        <p className="text-sm text-gray-500 mt-1.5 flex items-start gap-1.5">
                            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                            <span>{address}</span>
                        </p>
                    )}
                    {phone && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                            <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                            <a href={`tel:${phone}`} className="text-[#0078D4] hover:underline">
                                {phone}
                            </a>
                        </p>
                    )}
                    {(rating != null || (reviewCount != null && reviewCount !== 0)) && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            {rating != null && <span>{rating}</span>}
                            {reviewCount != null && reviewCount !== 0 && (
                                <span>({reviewCount} reviews)</span>
                            )}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {mapsUrl && (
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#0078D4] border border-[#0078D4] rounded-lg hover:bg-[#0078D4] hover:text-white transition-colors"
                            >
                                <MapPin className="w-4 h-4" />
                                Open in Google Maps
                            </a>
                        )}
                        {(hasCoords || mapsUrl) && (
                            <button
                                type="button"
                                onClick={onViewOnMap}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${isSelectedOnMap ? 'bg-[#0078D4] text-white border-[#0078D4]' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                <MapPin className="w-4 h-4" />
                                View on Map
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LabCard;
