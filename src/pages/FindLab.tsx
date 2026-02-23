import React, { useMemo, useState } from 'react';
import { FlaskConical, MapPin, Search } from 'lucide-react';
import { useLabFinder } from '../services/provider-search/useLabFinder';
import type { Facility } from '../services/provider-search/useProviderSearch';
import PlotMap from '../components/healthcare/provider-search/plot-map';
import type { Facility as PlotMapFacility } from '../services/types/healthcare/types';
import { LabCard } from '../components/lab-finder/LabCard';

const DISTANCE_OPTIONS = [5, 10, 20, 25, 50];
const US_ZIPCODE_REGEX = /^\d{5}$/;
const LABS_PER_PAGE = 5;

function validateZipcode(zip: string): boolean {
    return US_ZIPCODE_REGEX.test(zip.trim());
}

/** Normalize facility for PlotMap: ensure facility_full_address_obj has lat/long (API may return latitude/longitude at top level). */
function facilitiesForMap(facilities: Facility[]): PlotMapFacility[] {
    return facilities.map((f) => {
        const anyF = f as any;
        const latRaw = f.facility_full_address_obj?.lat ?? anyF.latitude;
        const lngRaw = f.facility_full_address_obj?.long ?? anyF.longitude;
        const lat =
            latRaw != null
                ? typeof latRaw === 'number'
                    ? latRaw
                    : parseFloat(latRaw)
                : undefined;
        const long =
            lngRaw != null
                ? typeof lngRaw === 'number'
                    ? lngRaw
                    : parseFloat(lngRaw)
                : undefined;
        const numLat = lat != null && !isNaN(lat) ? lat : undefined;
        const numLng = long != null && !isNaN(long) ? long : undefined;
        return {
            ...f,
            facility_full_address_obj:
                f.facility_full_address_obj || (numLat != null && numLng != null ? { lat: numLat, long: numLng } : undefined),
        } as PlotMapFacility;
    });
}

const FindLab: React.FC = () => {
    const { facilities, isLoading, error, search } = useLabFinder();
    const [zipcode, setZipcode] = useState('');
    const [distance, setDistance] = useState(10);
    const [distanceOpen, setDistanceOpen] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

    const mapList = useMemo(() => facilitiesForMap(facilities), [facilities]);
    const facilitiesWithCoords = useMemo(
        () =>
            mapList.filter((f) => {
                const lat = f.facility_full_address_obj?.lat;
                const lng = f.facility_full_address_obj?.long;
                return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
            }),
        [mapList]
    );
    const hasResults = facilities.length > 0;
    const totalPages = Math.ceil(facilities.length / LABS_PER_PAGE) || 1;
    const startIdx = (page - 1) * LABS_PER_PAGE;
    const endIdx = Math.min(startIdx + LABS_PER_PAGE, facilities.length);
    const pageLabs = facilities.slice(startIdx, endIdx);

    // Reset to page 1 when results change
    React.useEffect(() => {
        setPage(1);
    }, [facilities.length]);

    const handleSearch = () => {
        setSearchError(null);
        const trimmed = zipcode.trim();
        if (!trimmed) {
            setSearchError('Please enter a zipcode');
            return;
        }
        if (!validateZipcode(trimmed)) {
            setSearchError('Please enter a valid 5-digit US zipcode');
            return;
        }
        setHasSearched(true);
        search(trimmed, distance);
    };

    const getInitials = (name: string) =>
        name
            .split(/\s+/)
            .map((n) => n[0] || '')
            .join('')
            .substring(0, 2)
            .toUpperCase();

    const showEmptyState = hasSearched && !isLoading && !hasResults;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-white">
                        <div className="flex gap-3 items-end">
                            <div className="flex-1 min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={5}
                                        placeholder="e.g. 10012"
                                        value={zipcode}
                                        onChange={(e) => setZipcode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                                <button
                                    type="button"
                                    onClick={() => setDistanceOpen((o) => !o)}
                                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                                >
                                    <span>{distance} miles</span>
                                    <svg
                                        className="w-4 h-4 text-gray-500 transition-transform"
                                        style={{ transform: distanceOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {distanceOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                        {DISTANCE_OPTIONS.map((miles) => (
                                            <button
                                                key={miles}
                                                type="button"
                                                onClick={() => {
                                                    setDistance(miles);
                                                    setDistanceOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                style={{
                                                    background: distance === miles ? 'var(--color-primary-light, #e3f2fd)' : undefined,
                                                    color: distance === miles ? 'var(--color-primary, #0078D4)' : '#374151',
                                                }}
                                            >
                                                {miles} miles
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0078D4] text-white rounded-lg font-medium hover:bg-[#106ebe] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Search className="w-4 h-4" />
                                Search
                            </button>
                        </div>
                        {(searchError || error) && (
                            <p className="mt-2 text-sm text-red-600">{searchError || error}</p>
                        )}
                    </div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-16 text-gray-500">
                            <span>Loading labs...</span>
                        </div>
                    )}

                    {showEmptyState && (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <FlaskConical className="w-24 h-24 text-gray-300 mb-4" strokeWidth={1.25} />
                            <p className="text-gray-600 text-center">
                                No labs found for this zipcode and distance. Try a larger distance or another zipcode.
                            </p>
                        </div>
                    )}

                    {!hasSearched && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <FlaskConical className="w-24 h-24 text-gray-300 mb-4" strokeWidth={1.25} />
                            <p className="text-gray-600 text-center">
                                Enter zipcode and distance to find labs near you.
                            </p>
                        </div>
                    )}

                    {hasResults && !isLoading && (
                        <div className="flex flex-col-reverse lg:flex-row min-h-0 lg:min-h-[40vh] max-h-none lg:max-h-[80vh]">
                            <div className="flex flex-col flex-1 min-w-0 lg:w-[55%] lg:flex-none border-r border-gray-200 min-h-0 max-h-[400px] lg:max-h-none">
                                <h2 className="text-lg font-bold text-gray-900 px-4 pt-4 pb-2 flex-shrink-0">Labs Found</h2>
                                <div className="px-4 pb-4 flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
                                    {pageLabs.map((facility) => (
                                        <LabCard
                                            key={facility.facility_id || facility.facility_name}
                                            facility={facility}
                                            getInitials={getInitials}
                                            onViewOnMap={() => setSelectedLabId((facility.facility_id ?? facility.facility_name) ?? null)}
                                            isSelectedOnMap={selectedLabId === (facility.facility_id ?? facility.facility_name)}
                                        />
                                    ))}
                                </div>
                                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 flex-shrink-0">
                                    <span>
                                        Showing {startIdx + 1}-{endIdx} of {facilities.length} labs
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            className="px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full lg:w-[45%] lg:flex-none flex flex-col min-h-[280px] lg:min-h-0 flex-1 shrink-0 lg:shrink">
                                <div className="flex-1 min-h-0 w-full h-full">
                                    <PlotMap
                                        list={facilitiesWithCoords}
                                        fillContainer
                                        selected_id={selectedLabId ?? undefined}
                                        on_provider_select={(item: any) => setSelectedLabId((item.facility_id ?? item.provider_id) ?? null)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindLab;
