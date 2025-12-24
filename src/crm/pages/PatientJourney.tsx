import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCalendar, FaCheckCircle, FaChevronDown, FaChevronUp, FaClock, FaComment, FaFacebook, FaGoogle, FaInfoCircle, FaPhone, FaPills, FaRobot, FaSearch, FaShoppingCart, FaUser, FaSpinner } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Tag from '../components/ui/Tag';
import { postAPI, CAPABILITIES_API_URLS } from '../../services/api';

type JourneyStage = 'AD_CLICK' | 'ENGAGEMENT' | 'QUALIFICATION' | 'FILLED';
type Channel = 'chat' | 'text' | 'voice' | 'none';

interface JourneyEvent {
    id: string;
    stage: JourneyStage;
    timestamp: string;
    description: string;
    type: 'ad' | 'chat' | 'call' | 'sms' | 'appointment' | 'prescription' | 'fill' | 'followup';
    channel?: Channel;
    campaign?: {
        platform: 'meta' | 'google' | 'other';
        adType: 'find_doctor' | 'market_access' | 'awareness' | 'education';
        campaignId: string;
        campaignName: string;
    };
    visitDetails?: any;
    details?: any;
}

interface ApiJourneyStage {
    stage_name: string;
    stage_date: string | null;
    is_completed: boolean;
    is_current: boolean;
}

interface ApiTimelineEntry {
    timeline_id: string;
    created_at: Date | string;
    user_id?: string | null;
    anonymous_id?: string | null;
    visit_id?: string | null;
    conversation_id?: string | null;
    tool_name: string;
    tool_arguments?: any;
    tool_result?: any;
    decision_summary?: string | null;
    timeline_description: string;
    timeline_title: string | null;
    conversation_summary?: string | null;
    visit?: {
        visit_id: string;
        created_at: Date | string;
        user_id?: string | null;
        anonymous_id: string;
        utm_source?: string | null;
        utm_medium?: string | null;
        utm_campaign?: string | null;
        utm_term?: string | null;
        utm_content?: string | null;
        landing_page: string;
        referrer?: string | null;
        domain: string;
        device_type?: string | null;
        user_agent?: string | null;
        ip_address?: string | null;
    } | null;
}

export default function PatientJourney() {
    const params = useParams<{ id: string }>();
    const patientId = params.id || '1';
    const [lastEngagementExpanded, setLastEngagementExpanded] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [journeyStages, setJourneyStages] = useState<ApiJourneyStage[]>([]);
    const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([]);
    const [lastEngagement, setLastEngagement] = useState<JourneyEvent | null>(null);
    const [eventsData, setEventsData] = useState<any[]>([]);
    const [visitsMap, setVisitsMap] = useState<Map<string, any>>(new Map());
    const [combinedTimeline, setCombinedTimeline] = useState<any[]>([]);
    const [expandedTimelineEntries, setExpandedTimelineEntries] = useState<Set<string>>(new Set());
    const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set());
    const [allTimelineEntries, setAllTimelineEntries] = useState<ApiTimelineEntry[]>([]);
    const [patient, setPatient] = useState({
        id: patientId,
        name: 'Loading...',
        age: null as number | null,
        location: 'Loading...',
        insurance: 'Loading...',
        phone: null as string | null,
        email: null as string | null,
    });

    const primaryColor = '#0078D4';
    const secondaryColor = '#00B7C3';
    const tertiaryColor = '#83C995';
    const successColor = '#52c41a';

    const stages: { key: JourneyStage; label: string; icon: React.ReactNode }[] = [
        { key: 'AD_CLICK', label: 'Ad Clicked', icon: <FaShoppingCart /> },
        { key: 'ENGAGEMENT', label: 'Engaged', icon: <FaRobot /> },
        { key: 'QUALIFICATION', label: 'Benefits Check', icon: <FaSearch /> },
        { key: 'FILLED', label: 'Prescription Filled', icon: <FaPills /> },
    ];

    // Map API stage name to UI stage key
    const mapStageNameToKey = (stageName: string): JourneyStage => {
        const mapping: Record<string, JourneyStage> = {
            'Ad Clicked': 'AD_CLICK',
            Engaged: 'ENGAGEMENT',
            'Benefits Check': 'QUALIFICATION',
            'Prescription Filled': 'FILLED',
        };
        return mapping[stageName] || 'ENGAGEMENT';
    };

    // Map tool name to event type
    const mapToolNameToEventType = (toolName: string): JourneyEvent['type'] => {
        const toolLower = toolName.toLowerCase();
        if (toolLower.includes('call') || toolLower === 'place_outgoing_call' || toolLower === 'post_call_analysis') {
            return 'call';
        }
        if (toolLower.includes('sms') || toolLower === 'send_sms') {
            return 'sms';
        }
        if (toolLower.includes('appointment') || toolLower.includes('schedule') || toolLower.includes('book')) {
            return 'appointment';
        }
        if (toolLower.includes('prescription') || toolLower.includes('pharmacy') || toolLower.includes('fill')) {
            return toolLower.includes('fill') ? 'fill' : 'prescription';
        }
        if (toolLower.includes('followup') || toolLower.includes('follow_up')) {
            return 'followup';
        }
        if (toolLower.includes('authenticate') || toolLower.includes('ad') || toolLower.includes('referrer')) {
            return 'ad';
        }
        return 'chat';
    };

    // Map tool name to channel
    const mapToolNameToChannel = (toolName: string): Channel => {
        const toolLower = toolName.toLowerCase();
        if (toolLower.includes('call') || toolLower === 'place_outgoing_call' || toolLower === 'post_call_analysis') {
            return 'voice';
        }
        if (toolLower.includes('sms') || toolLower === 'send_sms') {
            return 'text';
        }
        if (toolLower.includes('chat') || toolLower.includes('conversation')) {
            return 'chat';
        }
        return 'none';
    };

    // Function to get visit/ad details for a timeline entry
    const getVisitDetailsForTimelineEntry = (timelineEntry: ApiTimelineEntry) => {
        // If timeline entry has visit_id, get visit details
        if (timelineEntry.visit_id) {
            return visitsMap.get(timelineEntry.visit_id);
        }
        
        // Otherwise, find the visit that contains events around this timeline entry's time
        const timelineTime = new Date(timelineEntry.created_at).getTime();
        const visit = Array.from(visitsMap.values()).find((v: any) => {
            const visitTime = new Date(v.created_at).getTime();
            // Check if timeline entry is within 1 hour of visit creation
            return Math.abs(timelineTime - visitTime) < 3600000;
        });
        
        return visit;
    };

    // Extract attribution tags from timeline entry
    const extractAttributionTags = (entry: ApiTimelineEntry): string[] => {
        const tags: string[] = [];
        const toolArgs = entry.tool_arguments || {};
        const toolResult = entry.tool_result || {};

        if (toolArgs.referrer || toolArgs.source) {
            tags.push('Ad Click');
            if (toolArgs.referrer === 'meta' || toolArgs.source === 'meta' || toolArgs.referrer_id?.toLowerCase().includes('meta')) {
                tags.push('META - Find Doctor');
            }
        }

        return tags;
    };

    // Map timeline entry to journey event
    const mapTimelineEntryToJourneyEvent = (entry: ApiTimelineEntry, index: number): JourneyEvent => {
        const createdDate = new Date(entry.created_at);
        const attributionTags = extractAttributionTags(entry);

        // Determine stage based on tool name
        let stage: JourneyStage = 'ENGAGEMENT';
        const toolLower = entry.tool_name.toLowerCase();
        if (toolLower.includes('ad') || toolLower.includes('referrer') || toolLower.includes('authenticate')) {
            stage = 'AD_CLICK';
        } else if (toolLower.includes('insurance') || toolLower.includes('benefits') || toolLower.includes('copay') || toolLower.includes('prior_auth')) {
            stage = 'QUALIFICATION';
        } else if (toolLower.includes('pharmacy') || toolLower.includes('prescription') || toolLower.includes('fill')) {
            stage = 'FILLED';
        }

        const eventType = mapToolNameToEventType(entry.tool_name);
        const channel = mapToolNameToChannel(entry.tool_name);

        // Get visit details for ad attribution
        const visitDetails = getVisitDetailsForTimelineEntry(entry);

        // Build campaign info from visit if available, otherwise from attribution tags
        let campaign: JourneyEvent['campaign'] = undefined;
        if (visitDetails && (visitDetails.utm_source || visitDetails.utm_campaign)) {
            const isMeta = visitDetails.utm_source?.toLowerCase().includes('meta') || 
                          visitDetails.utm_source?.toLowerCase().includes('facebook');
            const isGoogle = visitDetails.utm_source?.toLowerCase().includes('google');
            
            campaign = {
                platform: isMeta ? 'meta' : isGoogle ? 'google' : 'other',
                adType: (visitDetails.utm_content || 'find_doctor') as 'find_doctor' | 'market_access' | 'awareness' | 'education',
                campaignId: visitDetails.utm_campaign || 'unknown',
                campaignName: visitDetails.utm_campaign || 'Unknown Campaign',
            };
        } else if (attributionTags.length > 0) {
            const isMeta = attributionTags.some((tag) => tag.includes('META'));
            campaign = {
                platform: isMeta ? 'meta' : 'google',
                adType: 'find_doctor',
                campaignId: isMeta ? 'META-FD-2025-Q1' : 'GOOGLE-MA-2025-Q1',
                campaignName: isMeta ? 'Find Doctor Q1 2025' : 'Market Access Q1 2025',
            };
        }

        // Build details from tool_result and decision_summary
        const details: any = {};
        if (entry.decision_summary) {
            details.outcome = entry.decision_summary;
        }
        if (entry.conversation_summary) {
            details.conversation_summary = entry.conversation_summary;
        }
        if (entry.tool_result) {
            if (entry.tool_result.duration) {
                details.duration = entry.tool_result.duration;
            }
            if (entry.tool_result.copay) {
                details.copay = entry.tool_result.copay;
            }
            if (entry.tool_result.pharmacy) {
                details.pharmacy = entry.tool_result.pharmacy;
            }
            if (entry.tool_result.cost) {
                details.cost = entry.tool_result.cost;
            }
        }

        return {
            id: entry.timeline_id,
            stage,
            timestamp: createdDate.toISOString(),
            description: entry.timeline_title || entry.timeline_description || entry.tool_name.replace(/_/g, ' '),
            type: eventType,
            channel,
            campaign,
            visitDetails,
            details: Object.keys(details).length > 0 ? details : undefined,
        };
    };

    // Fetch journey data
    useEffect(() => {
        const fetchJourneyData = async () => {
            if (!patientId) return;

            setLoading(true);
            setError(null);

            try {
                // Fetch journey stages, timeline, and user details in parallel
                const [journeyResponse, timelineResponse, userDetailsResponse] = await Promise.all([
                    postAPI(CAPABILITIES_API_URLS.GET_USER_JOURNEY, { user_id: patientId }),
                    postAPI(CAPABILITIES_API_URLS.GET_USER_TIMELINE, { user_id: patientId }),
                    postAPI(CAPABILITIES_API_URLS.GET_USER_DETAILS_BY_ID, { user_id: patientId }),
                ]);

                if (journeyResponse.statusCode !== 200) {
                    throw new Error(journeyResponse.message || 'Failed to fetch journey data');
                }

                if (timelineResponse.statusCode !== 200) {
                    throw new Error(timelineResponse.message || 'Failed to fetch timeline data');
                }

                // Process visits map from timeline entries (visit data is now included in timeline response)
                const timelineEntries: ApiTimelineEntry[] = timelineResponse.data?.timeline_entries || [];
                setAllTimelineEntries(timelineEntries);
                const visitsMap = new Map<string, any>();
                timelineEntries.forEach((entry: any) => {
                    if (entry.visit && entry.visit_id) {
                        visitsMap.set(entry.visit_id, entry.visit);
                    }
                });
                setVisitsMap(visitsMap);

                // Set journey stages
                const stagesData = journeyResponse.data?.journey_stages || [];
                setJourneyStages(stagesData);

                // Map timeline entries to journey events
                const mappedEvents = timelineEntries.map((entry, index) => mapTimelineEntryToJourneyEvent(entry, index));
                setJourneyEvents(mappedEvents);

                // Build timeline using ONLY timeline entries
                // Track which visit_ids have been shown to show visit attributes only for first occurrence
                const combinedItems: any[] = [];
                const processedVisitIds = new Set<string>();

                timelineEntries.forEach((entry, index) => {
                    const isFirstVisitOccurrence = entry.visit_id && !processedVisitIds.has(entry.visit_id);
                    
                    if (isFirstVisitOccurrence && entry.visit_id) {
                        processedVisitIds.add(entry.visit_id);
                    }
                    
                    combinedItems.push({
                        type: 'timeline',
                        id: entry.timeline_id,
                        timestamp: entry.created_at,
                        data: entry,
                        isFirstVisitOccurrence,
                    });
                });
                
                setCombinedTimeline(combinedItems);

                // Extract last engagement from timeline
                const lastEntry = timelineEntries[timelineEntries.length - 1];
                if (lastEntry) {
                    const lastEvent = mapTimelineEntryToJourneyEvent(lastEntry, timelineEntries.length - 1);
                    // Only set as last engagement if it has a channel
                        setLastEngagement(lastEvent);
                }

                // Populate patient info from user details
                if (userDetailsResponse.statusCode === 200 && userDetailsResponse.data) {
                    const userData = userDetailsResponse.data;
                    const firstName = userData.first_name || '';
                    const lastName = userData.last_name || '';
                    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';

                    // Format location from address
                    const address = userData.address || {};
                    const locationParts = [];
                    if (address.city) locationParts.push(address.city);
                    if (address.state) locationParts.push(address.state);
                    if (address.zip_code) locationParts.push(address.zip_code);
                    const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown';

                    // Format insurance from insurance_details
                    const insuranceDetails = userData.insurance_details || {};
                    const insurance = insuranceDetails.provider || 'Unknown';

                    // Calculate age from date_of_birth if available
                    let age: number | null = null;
                    if (userData.date_of_birth) {
                        const birthDate = new Date(userData.date_of_birth);
                        if (!isNaN(birthDate.getTime())) {
                            const today = new Date();
                            age = today.getFullYear() - birthDate.getFullYear();
                            const monthDiff = today.getMonth() - birthDate.getMonth();
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                        }
                    }

                    setPatient({
                        id: patientId,
                        name: fullName,
                        age,
                        location,
                        insurance,
                        phone: userData.phone_number || userData.user_phone_number || null,
                        email: userData.email || null,
                    });
                } else {
                    // Fallback to placeholder if user details not found
                    setPatient({
                        id: patientId,
                        name: 'Unknown User',
                        age: null,
                        location: 'Unknown',
                        insurance: 'Unknown',
                        phone: null,
                        email: null,
                    });
                }
            } catch (err) {
                console.error('Error fetching journey data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load journey data');
            } finally {
                setLoading(false);
            }
        };

        fetchJourneyData();
    }, [patientId]);

    // Poll for new timeline entries every 25 seconds
    useEffect(() => {
        if (!patientId) return;

        const pollTimeline = async () => {
            try {
                const timelineResponse = await postAPI(CAPABILITIES_API_URLS.GET_USER_TIMELINE, {
                    user_id: patientId,
                });

                if (timelineResponse.statusCode === 200) {
                    const timelineEntries: ApiTimelineEntry[] = timelineResponse.data?.timeline_entries || [];

                    // Process visits map from timeline entries
                    const visitsMap = new Map<string, any>();
                    timelineEntries.forEach((entry: any) => {
                        if (entry.visit && entry.visit_id) {
                            visitsMap.set(entry.visit_id, entry.visit);
                        }
                    });
                    setVisitsMap(visitsMap);
                    setAllTimelineEntries(timelineEntries);

                    // Only append new entries to avoid re-render
                    setJourneyEvents((prevEvents) => {
                        const existingIds = new Set(prevEvents.map(e => e.id));
                        const newEntries = timelineEntries.filter(entry => !existingIds.has(entry.timeline_id));

                        if (newEntries.length === 0) {
                            return prevEvents;
                        }

                        const newEvents = newEntries.map((entry, index) =>
                            mapTimelineEntryToJourneyEvent(entry, prevEvents.length + index)
                        );

                        if (newEvents.length > 0) {
                            const lastEvent = newEvents[newEvents.length - 1];
                            if (lastEvent.channel && lastEvent.channel !== 'none') {
                                setLastEngagement(lastEvent);
                            }
                        }

                        const updatedEvents = [...prevEvents, ...newEvents];
                        
                        // Rebuild combined timeline using timeline entries
                        const combinedItems: any[] = [];
                        const processedVisitIds = new Set<string>();

                        timelineEntries.forEach((entry) => {
                            const isFirstVisitOccurrence = entry.visit_id && !processedVisitIds.has(entry.visit_id);
                            
                            if (isFirstVisitOccurrence && entry.visit_id) {
                                processedVisitIds.add(entry.visit_id);
                            }
                            
                            combinedItems.push({
                                type: 'timeline',
                                id: entry.timeline_id,
                                timestamp: entry.created_at,
                                data: entry,
                                isFirstVisitOccurrence,
                            });
                        });
                        
                        setCombinedTimeline(combinedItems);
                        
                        return updatedEvents;
                    });
                }
            } catch (err) {
                console.error('Error polling timeline:', err);
            }
        };

        const interval = setInterval(pollTimeline, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [patientId]);

    // Calculate current stage index from API journey stages
    const currentStageIndex = journeyStages.findIndex((s) => s.is_current) >= 0 ? journeyStages.findIndex((s) => s.is_current) : journeyStages.filter((s) => s.is_completed).length - 1;

    const getStageDate = (stageKey: JourneyStage) => {
        // Map stage key to stage name
        const stageNameMap: Record<JourneyStage, string> = {
            AD_CLICK: 'Ad Clicked',
            ENGAGEMENT: 'Engaged',
            QUALIFICATION: 'Benefits Check',
            FILLED: 'Prescription Filled',
        };
        const stageName = stageNameMap[stageKey];
        const apiStage = journeyStages.find((s) => s.stage_name === stageName);
        if (apiStage && apiStage.stage_date) {
            return new Date(apiStage.stage_date);
        }
        // Fallback to finding from events
        const firstEvent = journeyEvents.find((e) => e.stage === stageKey);
        if (firstEvent) return new Date(firstEvent.timestamp);
        return null;
    };

    const getCampaignBadge = (event: JourneyEvent) => {
        if (!event.campaign) return null;
        const isMeta = event.campaign.platform === 'meta';
        const isGoogle = event.campaign.platform === 'google';
        const adTypeLabels: Record<string, string> = {
            find_doctor: 'Find Doctor',
            market_access: 'Market Access',
            awareness: 'Awareness',
            education: 'Education',
        };

        return (
            <Tag color={isMeta ? '#4267B2' : isGoogle ? '#4285F4' : 'default'} icon={isMeta ? <FaFacebook /> : isGoogle ? <FaGoogle /> : null}>
                {event.campaign.platform.toUpperCase()} • {adTypeLabels[event.campaign.adType] || event.campaign.adType}
            </Tag>
        );
    };

    const renderEventDetails = (event: JourneyEvent) => {
        if (!event.details) return null;

        // Render conversation summary if available (appears for all event types)
        const renderConversationSummary = () => {
            if (event.details?.conversation_summary) {
                return (
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                            <FaComment className="text-[#0078D4]" />
                            <span className="font-semibold text-gray-900">Conversation Summary</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                            {event.details.conversation_summary}
                        </p>
                    </div>
                );
            }
            return null;
        };

        if (event.type === 'chat' && event.details.messages) {
            return (
                <>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="font-semibold mb-2">Conversation:</div>
                        {event.details.messages.map((msg: any, idx: number) => (
                            <div key={idx} className={`mb-2 p-2 rounded ${msg.sender === 'PATIENT' ? 'bg-blue-50 border-l-4 border-[#0078D4]' : 'bg-white border-l-4 border-gray-300'}`}>
                                <span className={`font-semibold ${msg.sender === 'PATIENT' ? 'text-[#0078D4]' : 'text-gray-600'}`}>{msg.sender}:</span>
                                <span className="ml-2 break-words">{msg.message}</span>
                            </div>
                        ))}
                    </div>
                    {renderConversationSummary()}
                </>
            );
        }

        if (event.type === 'call' || (event.type === 'followup' && event.details.channel === 'Voice')) {
            return (
                <>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {event.details.duration && (
                                <div className="min-w-0">
                                    <span className="font-semibold">Duration: </span>
                                    <span className="break-words">{event.details.duration}</span>
                                </div>
                            )}
                            {event.details.outcome && (
                                <div className="min-w-0">
                                    <span className="font-semibold">Outcome: </span>
                                    <Tag color="green">{event.details.outcome}</Tag>
                                </div>
                            )}
                            {event.details.copay && (
                                <div className="min-w-0">
                                    <span className="font-semibold">Copay: </span>
                                    <span className="break-words">{event.details.copay}</span>
                                </div>
                            )}
                            {event.details.requiresPA && (
                                <div className="col-span-3 mt-2">
                                    <Tag color="orange">Prior Authorization Required</Tag>
                                </div>
                            )}
                            {event.details.topics && (
                                <div className="col-span-3 mt-3">
                                    <span className="font-semibold">Topics Discussed: </span>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {event.details.topics.map((topic: string, idx: number) => (
                                            <Tag key={idx}>{topic}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {renderConversationSummary()}
                </>
            );
        }

        if (event.type === 'appointment') {
            return (
                <>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="min-w-0">
                                <span className="font-semibold">Doctor: </span>
                                <span className="break-words">{event.details.doctor}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="font-semibold">Date: </span>
                                <span className="break-words">
                                    {event.details.date} at {event.details.time}
                                </span>
                            </div>
                            {event.details.location && (
                                <div className="col-span-1 sm:col-span-2 mt-2 min-w-0">
                                    <span className="font-semibold">Location: </span>
                                    <span className="break-words">{event.details.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {renderConversationSummary()}
                </>
            );
        }

        if (event.type === 'prescription') {
            return (
                <>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="min-w-0">
                                <span className="font-semibold">Medication: </span>
                                <span className="break-words">{event.details.medication}</span>
                            </div>
                            <div className="min-w-0">
                                <span className="font-semibold">Frequency: </span>
                                <span className="break-words">{event.details.frequency}</span>
                            </div>
                            {event.details.prescriber && (
                                <div className="col-span-1 sm:col-span-2 mt-2 min-w-0">
                                    <span className="font-semibold">Prescriber: </span>
                                    <span className="break-words">{event.details.prescriber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {renderConversationSummary()}
                </>
            );
        }

        if (event.type === 'fill') {
            return (
                <>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {event.details.pharmacy && (
                                <div className="min-w-0">
                                    <span className="font-semibold">Pharmacy: </span>
                                    <span className="break-words">{event.details.pharmacy}</span>
                                </div>
                            )}
                            {event.details.cost && (
                                <div className="min-w-0">
                                    <span className="font-semibold">Cost: </span>
                                    <span className="break-words">{event.details.cost}</span>
                                </div>
                            )}
                            {event.details.refills && (
                                <div className="col-span-1 sm:col-span-2 mt-2 min-w-0">
                                    <span className="font-semibold">Refills Remaining: </span>
                                    <span className="break-words">{event.details.refills}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {renderConversationSummary()}
                </>
            );
        }

        if (event.type === 'followup') {
            return (
                <>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="min-w-0">
                                <span className="font-semibold">Channel: </span>
                                <Tag icon={event.details.channel === 'SMS' ? <FaComment /> : <FaPhone />}>{event.details.channel}</Tag>
                            </div>
                            <div className="min-w-0">
                                <span className="font-semibold">Status: </span>
                                <Tag color={event.details.status === 'sent' || event.details.status === 'completed' ? 'green' : 'default'}>{event.details.status}</Tag>
                            </div>
                            {event.details.message && (
                                <div className="col-span-1 sm:col-span-2 mt-2 min-w-0">
                                    <span className="font-semibold">Message: </span>
                                    <span className="break-words">{event.details.message}</span>
                                </div>
                            )}
                            {event.details.duration && (
                                <div className="col-span-1 sm:col-span-2 mt-2 min-w-0">
                                    <span className="font-semibold">Duration: </span>
                                    <span className="break-words">{event.details.duration}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {renderConversationSummary()}
                </>
            );
        }

        // For other event types, just show conversation summary if available
        return renderConversationSummary();
    };

    const getStageStatus = (stageKey: JourneyStage) => {
        const stageIndex = stages.findIndex((s) => s.key === stageKey);
        if (stageIndex < currentStageIndex) return 'completed';
        if (stageIndex === currentStageIndex) return 'current';
        return 'pending';
    };

    const getEventIcon = (event: JourneyEvent) => {
        switch (event.type) {
            case 'ad':
                return event.campaign?.platform === 'meta' ? <FaFacebook /> : <FaGoogle />;
            case 'chat':
                return <FaRobot />;
            case 'call':
                return <FaPhone />;
            case 'sms':
                return <FaComment />;
            case 'appointment':
                return <FaCalendar />;
            case 'prescription':
                return <FaPills />;
            case 'fill':
                return <FaCheckCircle />;
            case 'followup':
                return event.details?.channel === 'SMS' ? <FaComment /> : <FaPhone />;
            default:
                return <FaClock />;
        }
    };

    const getEventTypeLabel = (event: JourneyEvent) => {
        switch (event.type) {
            case 'ad':
                return 'Ad Click';
            case 'chat':
                return 'Chat';
            case 'call':
                return 'Call';
            case 'sms':
                return 'SMS';
            case 'appointment':
                return 'Appointment';
            case 'prescription':
                return 'Prescription';
            case 'fill':
                return 'Prescription Fill';
            case 'followup':
                return event.details?.channel === 'SMS' ? 'SMS Follow-up' : 'Voice Follow-up';
            default:
                return 'Event';
        }
    };

    const getChannelInfo = (channel?: Channel) => {
        if (!channel || channel === 'none') return null;

        const channelConfig = {
            chat: { icon: <FaRobot />, color: '#0078D4', label: 'Chat' },
            text: { icon: <FaComment />, color: '#0078D4', label: 'Text' },
            voice: { icon: <FaPhone />, color: '#0078D4', label: 'Voice' },
        };

        return channelConfig[channel] || null;
    };

    // Use the lastEngagement state if available, otherwise find from events
    const displayLastEngagement: JourneyEvent | null = lastEngagement || journeyEvents.filter((e) => e.stage === 'ENGAGEMENT' && e.channel && e.channel !== 'none').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const getLastEngagementContext = () => {
        if (!displayLastEngagement) return null;
        const lastEngagementIndex = journeyEvents.findIndex((e) => e.id === displayLastEngagement.id);
        const relatedEvents = journeyEvents.slice(0, lastEngagementIndex + 1).filter((e) => e.id !== displayLastEngagement.id);

        const relatedAppointment = journeyEvents.find((e) => e.type === 'appointment' && new Date(e.timestamp).getTime() <= new Date(displayLastEngagement.timestamp).getTime());
        const relatedPrescription = journeyEvents.find((e) => (e.type === 'prescription' || e.type === 'fill') && new Date(e.timestamp).getTime() >= new Date(displayLastEngagement.timestamp).getTime());

        return {
            previousEvent: relatedEvents[relatedEvents.length - 1],
            nextEvent: journeyEvents[lastEngagementIndex + 1],
            totalEngagements: journeyEvents.filter((e) => e.stage === 'ENGAGEMENT' && e.channel && e.channel !== 'none').length,
            relatedAppointment,
            relatedPrescription,
        };
    };

    const engagementContext = getLastEngagementContext();

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const eventTime = new Date(timestamp);
        const diffMs = now.getTime() - eventTime.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-[#0078D4] mx-auto mb-4" />
                        <p className="text-gray-600">Loading patient journey...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Error: {error}</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 bg-gray-50 min-h-screen overflow-x-hidden">
                {/* Header */}
                <div className="mb-5">
                    <Link to={`/crm/patients/${patientId}`}>
                        <Button type="link" icon={<FaArrowLeft />} className="pl-0 mb-3 text-sm h-auto text-[#0078D4]">
                            Back to Patient Details
                        </Button>
                    </Link>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-5 min-w-0">
                            <Avatar size={60} icon={<FaUser />} className="shadow-lg flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                            <div className="min-w-0">
                                <h2 className="text-2xl font-bold m-0 text-gray-900 break-words">{patient.name}</h2>
                                <div className="flex items-center gap-2 mt-1.5 text-sm">
                                    <span className="text-gray-600 font-medium break-words">{patient.location}</span>
                                    <span className="text-gray-300 flex-shrink-0">•</span>
                                    <span className="text-gray-600 font-medium break-words">{patient.insurance}</span>
                                </div>
                            </div>
                        </div>
                        <Badge status="processing" text={<span className="text-sm font-semibold">Active Journey</span>} />
                    </div>
                </div>

                {/* Journey Progress & Last Engagement - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Journey Progress Card */}
                    <div className="lg:col-span-2">
                        <Card className="rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col" bodyStyle={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="text-center mb-4">
                                <h4 className="text-lg font-bold m-0 text-gray-900">Patient Journey</h4>
                            </div>

                            {/* Enhanced Progress Bar */}
                            <div className="relative mb-0 flex-1 flex items-center overflow-x-hidden">
                                <div className="flex justify-between items-center relative w-full h-[120px] min-w-0">
                                    {/* Connection Lines */}
                                    <div className="absolute top-12 left-[10%] right-[10%] h-1 bg-gray-200 rounded z-0" />
                                    <div className="absolute top-12 left-[10%] h-1 bg-[#0078D4] rounded z-10 transition-all duration-300" style={{ width: `${(currentStageIndex / (stages.length - 1)) * 80}%` }} />

                                    {/* Stage Dots */}
                                    {stages.map((stage, index) => {
                                        const status = getStageStatus(stage.key);
                                        const isCompleted = status === 'completed';
                                        const isCurrent = status === 'current';
                                        const stageDate = getStageDate(stage.key);

                                        return (
                                            <div key={stage.key} className="relative z-20 flex flex-col items-center flex-1 min-w-0">
                                                <div className={`w-[70px] h-[70px] sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center text-3xl sm:text-2xl transition-all ${isCompleted ? `bg-[#52c41a] text-white shadow-lg` : isCurrent ? 'bg-white text-[#0078D4] border-4 border-[#0078D4] shadow-lg' : 'bg-gray-100 text-gray-400'}`} style={isCompleted ? { backgroundColor: '#52c41a' } : isCurrent ? { boxShadow: '0 0 0 5px rgba(0, 120, 212, 0.15), 0 4px 12px rgba(0,0,0,0.12)' } : {}}>
                                                    {isCompleted ? <FaCheckCircle className="text-4xl" /> : stage.icon}
                                                </div>
                                                <span className={`text-xs mt-2.5 text-center transition-all ${isCurrent ? 'text-gray-900 font-bold' : isCompleted ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>{stage.label}</span>
                                                {stageDate && (
                                                    <span className="text-[10px] mt-1 text-center text-gray-500">
                                                        {stageDate.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Last Engagement Card */}
                    <div className="lg:col-span-1">
                        <Card className="rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col" bodyStyle={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-[#0078D4] flex items-center justify-center">
                                        <FaComment className="text-white text-lg" />
                                    </div>
                                    <span className="text-gray-900 text-sm font-semibold">Last Engagement</span>
                                </div>
                                {displayLastEngagement && (
                                    <button onClick={() => setLastEngagementExpanded(!lastEngagementExpanded)} className="transition-transform" style={{ transform: lastEngagementExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        <FaChevronDown />
                                    </button>
                                )}
                            </div>

                            {displayLastEngagement ? (
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="mb-0 flex-1 flex flex-col min-w-0">
                                        <span className="text-gray-900 text-sm block mb-3 font-semibold leading-snug break-words">{ displayLastEngagement.description}</span>

                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex-1">
                                            <div className="mb-2.5">
                                                <span className="text-[11px] text-gray-600 block mb-1 font-semibold">Date: </span>
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {new Date(displayLastEngagement.timestamp).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                <span className="text-[11px] text-gray-400 block mt-0.5">{formatTimeAgo(displayLastEngagement.timestamp)}</span>
                                            </div>

                                            <hr className="my-2.5 border-gray-200" />

                                            <div className="mb-2.5">
                                                <span className="text-[11px] text-gray-600 block mb-1 font-semibold">Type: </span>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    {getChannelInfo(displayLastEngagement.channel)?.icon && (
                                                        <span className="flex-shrink-0" style={{ color: getChannelInfo(displayLastEngagement.channel)?.color }}>
                                                            {getChannelInfo(displayLastEngagement.channel)?.icon}
                                                        </span>
                                                    )}
                                                    <span className="text-sm text-gray-900 font-medium break-words">{getEventTypeLabel(displayLastEngagement)}</span>
                                                    {displayLastEngagement.channel && <Tag className="text-[10px] m-0 px-2 py-0.5 flex-shrink-0">{getChannelInfo(displayLastEngagement.channel)?.label}</Tag>}
                                                </div>
                                            </div>

                                            <hr className="my-2.5 border-gray-200" />

                                            <div>
                                                <span className="text-[11px] text-gray-600 block mb-1 font-semibold">Outcome: </span>
                                                {displayLastEngagement.details?.outcome ? (
                                                    <Tag color="green" className="text-xs px-2.5 py-0.5 m-0">
                                                        {displayLastEngagement.details.outcome}
                                                    </Tag>
                                                ) : (
                                                    <span className="text-sm text-gray-600">No outcome recorded</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Details Section */}
                                    {lastEngagementExpanded && (
                                        <div className="flex flex-col gap-3 mt-3">
                                            {displayLastEngagement.details && (
                                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    {displayLastEngagement.details.duration && (
                                                        <div className="mb-3">
                                                            <span className="text-xs text-gray-600 block mb-1 font-semibold">Duration: </span>
                                                            <span className="text-sm text-gray-900 font-medium">{displayLastEngagement.details.duration}</span>
                                                        </div>
                                                    )}
                                                    {displayLastEngagement.details.topics && (
                                                        <div className="mb-3">
                                                            <span className="text-xs text-gray-600 block mb-1.5 font-semibold">Topics Discussed: </span>
                                                            <div className="flex flex-col gap-1.5">
                                                                {displayLastEngagement.details.topics.map((topic: string, idx: number) => (
                                                                    <div key={idx} className="px-2.5 py-1.5 bg-white rounded border border-gray-200">
                                                                        <span className="text-xs text-gray-900">{topic}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {displayLastEngagement.details.messages && displayLastEngagement.details.messages.length > 0 && (
                                                        <div>
                                                            <span className="text-xs text-gray-600 block mb-1.5 font-semibold">Conversation Summary: </span>
                                                            <div className="p-2.5 bg-white rounded border border-gray-200">
                                                                <span className="text-xs text-gray-900 leading-relaxed break-words">{displayLastEngagement.details.messages[displayLastEngagement.details.messages.length - 1]?.message}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {engagementContext && (
                                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <span className="text-xs text-blue-900 block mb-2 font-semibold">Journey Context: </span>
                                                    {engagementContext.previousEvent && (
                                                        <div className="mb-2 min-w-0">
                                                            <span className="text-[11px] text-gray-600 block">Previous: </span>
                                                            <span className="text-xs text-gray-900 break-words">{engagementContext.previousEvent.description}</span>
                                                        </div>
                                                    )}
                                                    {engagementContext.nextEvent && (
                                                        <div className="min-w-0">
                                                            <span className="text-[11px] text-gray-600 block">Next Step: </span>
                                                            <span className="text-xs text-gray-900 break-words">{engagementContext.nextEvent.description}</span>
                                                        </div>
                                                    )}
                                                    {!engagementContext.nextEvent && (
                                                        <div>
                                                            <span className="text-[11px] text-gray-600 block">Status: </span>
                                                            <Tag color="blue" className="text-[11px] mt-1">
                                                                Most Recent Engagement
                                                            </Tag>
                                                        </div>
                                                    )}
                                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                                        <span className="text-[11px] text-gray-600">
                                                            Total Engagements: <strong className="text-blue-900">{engagementContext.totalEngagements}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-gray-600 text-sm">No engagement recorded yet</span>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Enhanced Journey Timeline */}
                <Card
                    title={
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-[#0078D4] flex items-center justify-center">
                                <FaClock className="text-white text-lg" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Journey Timeline</span>
                        </div>
                    }
                    className="rounded-2xl shadow-lg border border-gray-200"
                    bodyStyle={{ padding: '24px' }}>
                    <div className="relative overflow-x-hidden">
                        {/* Enhanced Vertical line */}
                        <div className="absolute left-7 top-0 bottom-0 w-1 bg-[#0078D4] rounded z-0" />

                        {/* Timeline Entries */}
                        {combinedTimeline.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FaClock className="text-4xl mx-auto mb-4 opacity-50" />
                                <p>No timeline events found</p>
                            </div>
                        ) : (
                            combinedTimeline.map((item, index) => {
                                const isLast = index === combinedTimeline.length - 1;
                                const entry = item.data as ApiTimelineEntry;
                                const isCompleted = !isLast;
                                
                                // Map tool name to channel for icon
                                const channelInfo = getChannelInfo(mapToolNameToChannel(entry.tool_name));
                                
                                // Get visit data if this is the first occurrence
                                const visitData = item.isFirstVisitOccurrence && entry.visit ? entry.visit : null;
                                
                                return (
                                    <div key={`timeline-${item.id}`} className="relative mb-5 pl-12 sm:pl-16">
                                        {/* Dot */}
                                        <div className={`absolute left-3.5 top-2.5 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm border-4 border-white z-10 transition-all ${isCompleted ? 'bg-[#0078D4] shadow-lg' : 'bg-gray-300'}`} style={isCompleted ? { boxShadow: '0 4px 12px rgba(0, 120, 212, 0.3), 0 0 0 2px rgba(0, 120, 212, 0.1)' } : {}}>
                                            {getEventIcon(mapTimelineEntryToJourneyEvent(entry, index))}
                                        </div>

                                        {/* Channel Badge on Dot */}
                                        {channelInfo && (
                                            <div className="absolute left-9 top-1.5 w-5 h-5 rounded-full border-[3px] border-white flex items-center justify-center z-20 shadow-md" style={{ backgroundColor: channelInfo.color }}>
                                                <span className="text-white text-[10px]">{channelInfo.icon}</span>
                                            </div>
                                        )}

                                        {/* Timeline Entry Card */}
                                        <Card className={`rounded-xl transition-all ml-1 border border-${isCompleted ? '[#0078D4]20' : 'gray-200'} shadow-sm`} bodyStyle={{ padding: '16px 20px' }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-2.5 mb-2.5 flex-wrap">
                                                        <div className="flex-1 min-w-0">
                                                            {/* Timeline Title */}
                                                            {entry.timeline_title && (
                                                                <div className="text-gray-900 text-sm font-semibold leading-snug break-words mb-1">
                                                                    {entry.timeline_title}
                                                                </div>
                                                            )}
                                                            {/* Timeline Description */}
                                                            {entry.timeline_description && (
                                                                <div className="text-gray-700 text-sm leading-relaxed break-words">
                                                                    {entry.timeline_description}
                                                                </div>
                                                            )}
                                                            {/* Fallback if neither title nor description */}
                                                            {!entry.timeline_title && !entry.timeline_description && (
                                                                <div className="text-gray-900 text-sm font-semibold leading-snug break-words">
                                                                    {entry.tool_name.replace(/_/g, ' ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {channelInfo && (
                                                                <Tag icon={channelInfo.icon} className="m-0 border text-[11px] px-2 py-0.5 h-auto leading-[18px]" style={{ color: channelInfo.color, borderColor: `${channelInfo.color}30` }}>
                                                                    {channelInfo.label}
                                                                </Tag>
                                                            )}
                                                            {/* Expand button - show if there are details or arguments */}
                                                            {((entry.tool_result && Object.keys(entry.tool_result).length > 0) || entry.decision_summary || entry.conversation_summary || (entry.tool_arguments && Object.keys(entry.tool_arguments).length > 0)) && (
                                                                <button
                                                                    onClick={() => {
                                                                        const newExpanded = new Set(expandedTimelineEntries);
                                                                        if (newExpanded.has(entry.timeline_id)) {
                                                                            newExpanded.delete(entry.timeline_id);
                                                                        } else {
                                                                            newExpanded.add(entry.timeline_id);
                                                                        }
                                                                        setExpandedTimelineEntries(newExpanded);
                                                                    }}
                                                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                                                                    title="Show details"
                                                                >
                                                                    {expandedTimelineEntries.has(entry.timeline_id) ? (
                                                                        <FaChevronUp className="text-gray-600" />
                                                                    ) : (
                                                                        <FaChevronDown className="text-gray-600" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Visit Attributes - Show only for first occurrence */}
                                                    {visitData && item.isFirstVisitOccurrence && (
                                                        <div className="mb-2.5 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="text-xs font-semibold text-blue-900 flex items-center gap-1">
                                                                    <FaCalendar className="text-xs" />
                                                                    Visit Attribution
                                                                </div>
                                                                {/* Expand button for visit events */}
                                                                {entry.visit_id && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const newExpanded = new Set(expandedVisits);
                                                                            if (newExpanded.has(entry.visit_id!)) {
                                                                                newExpanded.delete(entry.visit_id!);
                                                                            } else {
                                                                                newExpanded.add(entry.visit_id!);
                                                                            }
                                                                            setExpandedVisits(newExpanded);
                                                                        }}
                                                                        className="p-1 rounded hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        {expandedVisits.has(entry.visit_id!) ? (
                                                                            <FaChevronUp className="text-blue-600 text-xs" />
                                                                        ) : (
                                                                            <FaChevronDown className="text-blue-600 text-xs" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {/* UTM Parameters - Always show if available */}
                                                            {(visitData.utm_source || visitData.utm_medium || visitData.utm_campaign || visitData.utm_term || visitData.utm_content) ? (
                                                                <div className="mb-2">
                                                                    <div className="text-[11px] font-semibold text-gray-700 mb-1">UTM Parameters:</div>
                                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                                        {visitData.utm_source && (
                                                                            <span className="text-gray-700">
                                                                                <strong>Source:</strong> {visitData.utm_source}
                                                                            </span>
                                                                        )}
                                                                        {visitData.utm_medium && (
                                                                            <span className="text-gray-700">
                                                                                <strong>Medium:</strong> {visitData.utm_medium}
                                                                            </span>
                                                                        )}
                                                                        {visitData.utm_campaign && (
                                                                            <span className="text-gray-700">
                                                                                <strong>Campaign:</strong> {visitData.utm_campaign}
                                                                            </span>
                                                                        )}
                                                                        {visitData.utm_term && (
                                                                            <span className="text-gray-700">
                                                                                <strong>Term:</strong> {visitData.utm_term}
                                                                            </span>
                                                                        )}
                                                                        {visitData.utm_content && (
                                                                            <span className="text-gray-700">
                                                                                <strong>Content:</strong> {visitData.utm_content}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="mb-2 text-xs text-gray-500">No UTM parameters available</div>
                                                            )}
                                                            <div className="flex flex-col gap-1 text-xs text-gray-600">
                                                                {visitData.landing_page && (
                                                                    <div className="flex items-center gap-1">
                                                                        <FaInfoCircle className="text-xs" />
                                                                        <span className="truncate" title={visitData.landing_page}>
                                                                            Landing: {visitData.landing_page.length > 50 ? visitData.landing_page.substring(0, 50) + '...' : visitData.landing_page}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {visitData.referrer && (
                                                                    <div className="text-gray-500">
                                                                        Referrer: {visitData.referrer.length > 40 ? visitData.referrer.substring(0, 40) + '...' : visitData.referrer}
                                                                    </div>
                                                                )}
                                                                {visitData.device_type && (
                                                                    <div className="text-gray-500">
                                                                        Device: {visitData.device_type}
                                                                    </div>
                                                                )}
                                                                {visitData.domain && (
                                                                    <div className="text-gray-500">
                                                                        Domain: {visitData.domain}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Expanded Visit Events */}
                                                            {entry.visit_id && expandedVisits.has(entry.visit_id) && (
                                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                                    <div className="text-xs font-semibold text-blue-900 mb-3">Related Events:</div>
                                                                    {allTimelineEntries
                                                                        .filter(e => e.visit_id === entry.visit_id && e.timeline_id !== entry.timeline_id)
                                                                        .map((relatedEntry) => {
                                                                            const relatedTime = new Date(relatedEntry.created_at);
                                                                            const relatedChannelInfo = getChannelInfo(mapToolNameToChannel(relatedEntry.tool_name));
                                                                            return (
                                                                                <div key={relatedEntry.timeline_id} className="mb-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                                                                                    <div className="flex items-start gap-2 mb-2">
                                                                                        <div className="flex-1 min-w-0">
                                                                                            {relatedEntry.timeline_title && (
                                                                                                <div className="text-xs font-semibold text-gray-900 mb-1 break-words">
                                                                                                    {relatedEntry.timeline_title}
                                                                                                </div>
                                                                                            )}
                                                                                            {relatedEntry.timeline_description && (
                                                                                                <div className="text-xs text-gray-700 leading-relaxed break-words">
                                                                                                    {relatedEntry.timeline_description}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                        <Tag 
                                                                                            icon={getEventIcon(mapTimelineEntryToJourneyEvent(relatedEntry, 0))}
                                                                                            className="text-[10px] px-2 py-0.5 border-0 bg-gray-500 text-white"
                                                                                        >
                                                                                            {relatedEntry.tool_name.replace(/_/g, ' ')}
                                                                                        </Tag>
                                                                                        {relatedChannelInfo && (
                                                                                            <Tag icon={relatedChannelInfo.icon} className="text-[10px] px-2 py-0.5 border" style={{ color: relatedChannelInfo.color, borderColor: `${relatedChannelInfo.color}30` }}>
                                                                                                {relatedChannelInfo.label}
                                                                                            </Tag>
                                                                                        )}
                                                                                        <span className="text-[10px] text-gray-500">
                                                                                            {relatedTime.toLocaleTimeString('en-US', {
                                                                                                hour: 'numeric',
                                                                                                minute: '2-digit',
                                                                                            })}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    {allTimelineEntries.filter(e => e.visit_id === entry.visit_id && e.timeline_id !== entry.timeline_id).length === 0 && (
                                                                        <div className="text-xs text-gray-500 italic">No other events for this visit</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-2.5 flex-wrap">
                                                        <Tag
                                                            icon={getEventIcon(mapTimelineEntryToJourneyEvent(entry, index))}
                                                            className="text-xs px-3 py-1 h-auto rounded-md font-medium border-0"
                                                            style={{
                                                                backgroundColor: primaryColor,
                                                                color: 'white',
                                                            }}>
                                                            {entry.tool_name.replace(/_/g, ' ')}
                                                        </Tag>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <FaCalendar className="text-xs text-gray-600 flex-shrink-0" />
                                                            <span className="text-sm text-gray-600 font-semibold whitespace-nowrap">
                                                                {new Date(entry.created_at).toLocaleDateString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                                {new Date(entry.created_at).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Expanded Details and Arguments */}
                                                    {expandedTimelineEntries.has(entry.timeline_id) && (
                                                        <div className="mt-3 space-y-3">
                                                            {/* Decision Summary */}
                                                            {entry.decision_summary && (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    <span className="text-xs font-semibold text-gray-700 block mb-1">Outcome:</span>
                                                                    <Tag color="green" className="text-xs">{entry.decision_summary}</Tag>
                                                                </div>
                                                            )}
                                                            {/* Conversation Summary */}
                                                            {entry.conversation_summary && (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    <span className="text-xs font-semibold text-gray-700 block mb-1">Conversation Summary:</span>
                                                                    <p className="text-xs text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                                                                        {entry.conversation_summary}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {/* Tool Result */}
                                                            {entry.tool_result && typeof entry.tool_result === 'object' && Object.keys(entry.tool_result).length > 0 && (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    <span className="text-xs font-semibold text-gray-700 block mb-1">Details:</span>
                                                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words bg-white p-2 rounded border border-gray-200">
                                                                        {JSON.stringify(entry.tool_result, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {/* Tool Arguments */}
                                                            {entry.tool_arguments && Object.keys(entry.tool_arguments).length > 0 && (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                                    <span className="text-xs font-semibold text-gray-700 block mb-1">Tool Arguments:</span>
                                                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words bg-white p-2 rounded border border-gray-200">
                                                                        {JSON.stringify(entry.tool_arguments, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
