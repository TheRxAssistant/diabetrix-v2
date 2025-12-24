import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaCalendar, FaTag } from 'react-icons/fa';
import Card from './ui/Card';
import Tag from './ui/Tag';
import Badge from './ui/Badge';

interface VisitTimelineNodeProps {
    visit: {
        visit_id: string;
        created_at: string | Date;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
        utm_term?: string;
        utm_content?: string;
        landing_page?: string;
        referrer?: string;
        domain: string;
        device_type?: string;
    };
    events: Array<{
        timeline_id: string;
        created_at: string | Date;
        event_type: string;
        event_name: string;
        event_payload?: any;
        source?: 'ui' | 'chat' | 'system';
    }>;
}

export default function VisitTimelineNode({ visit, events }: VisitTimelineNodeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
    
    const eventCount = events.length;
    const showExpandButton = eventCount > 3;
    const visibleEvents = isExpanded ? events : events.slice(0, 3);
    const hiddenEventCount = eventCount - 3;
    
    const hasUTM = visit.utm_source || visit.utm_medium || visit.utm_campaign;
    
    const formatTimestamp = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            }),
        };
    };
    
    const truncateUrl = (url: string, maxLength: number = 50) => {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            if (path.length <= maxLength) return path;
            return path.substring(0, maxLength) + '...';
        } catch {
            if (url.length <= maxLength) return url;
            return url.substring(0, maxLength) + '...';
        }
    };
    
    const visitTime = formatTimestamp(visit.created_at);
    
    return (
        <div className="relative mb-5 pl-12 sm:pl-16">
            {/* Visit Node Dot */}
            <div className="absolute left-3.5 top-2.5 w-8 h-8 rounded-full bg-blue-600 border-4 border-white z-10 shadow-lg flex items-center justify-center">
                <FaCalendar className="text-white text-sm" />
            </div>
            
            {/* Visit Header Card */}
            <Card 
                className="rounded-xl ml-1 border border-blue-200 shadow-sm bg-blue-50"
                bodyStyle={{ padding: '16px 20px' }}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-gray-900 text-sm font-semibold">Visit Session</span>
                            <Badge 
                                status="processing" 
                                text={<span className="text-xs font-semibold">{eventCount} {eventCount === 1 ? 'event' : 'events'}</span>} 
                            />
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaCalendar className="text-xs" />
                                <span>{visitTime.date}</span>
                                <span>{visitTime.time}</span>
                            </div>
                        </div>
                        
                        {/* UTM Parameters */}
                        {hasUTM && (
                            <div className="mb-2 p-2 bg-white rounded-lg border border-blue-200">
                                <div className="text-xs font-semibold text-blue-900 mb-1.5 flex items-center gap-1">
                                    <FaTag className="text-xs" />
                                    Ad Attribution
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {visit.utm_source && (
                                        <span className="text-gray-700">
                                            <strong>Source:</strong> {visit.utm_source}
                                        </span>
                                    )}
                                    {visit.utm_medium && (
                                        <span className="text-gray-700">
                                            <strong>Medium:</strong> {visit.utm_medium}
                                        </span>
                                    )}
                                    {visit.utm_campaign && (
                                        <span className="text-gray-700">
                                            <strong>Campaign:</strong> {visit.utm_campaign}
                                        </span>
                                    )}
                                    {visit.utm_term && (
                                        <span className="text-gray-700">
                                            <strong>Term:</strong> {visit.utm_term}
                                        </span>
                                    )}
                                    {visit.utm_content && (
                                        <span className="text-gray-700">
                                            <strong>Content:</strong> {visit.utm_content}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Landing Page & Referrer */}
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                            {visit.landing_page && (
                                <div className="flex items-center gap-1">
                                    <FaExternalLinkAlt className="text-xs" />
                                    <span className="truncate" title={visit.landing_page}>
                                        Landing: {truncateUrl(visit.landing_page)}
                                    </span>
                                </div>
                            )}
                            {visit.referrer && (
                                <div className="text-gray-500">
                                    Referrer: {truncateUrl(visit.referrer, 40)}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Expand/Collapse Button */}
                    {eventCount > 0 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="ml-2 p-1.5 rounded hover:bg-blue-100 transition-colors flex-shrink-0"
                            aria-label={isExpanded ? 'Collapse events' : 'Expand events'}
                        >
                            {isExpanded ? (
                                <FaChevronUp className="text-blue-600" />
                            ) : (
                                <FaChevronDown className="text-blue-600" />
                            )}
                        </button>
                    )}
                </div>
                
                {/* Events Section */}
                {eventCount > 0 && (
                    <div className={`mt-3 pt-3 border-t border-blue-200 ${isExpanded ? '' : ''}`}>
                        {visibleEvents.map((event, index) => {
                            const eventTime = formatTimestamp(event.created_at);
                            const isEventExpanded = expandedEventId === event.timeline_id;
                            
                            return (
                                <div 
                                    key={event.timeline_id} 
                                    className={`mb-2 last:mb-0 pl-3 border-l-2 border-blue-200 ${index < visibleEvents.length - 1 ? 'pb-2' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <Tag 
                                                    className="text-[10px] px-2 py-0.5 border-0 bg-gray-500 text-white"
                                                >
                                                    {event.event_type.replace(/_/g, ' ')}
                                                </Tag>
                                                <span className="text-xs font-semibold text-gray-900">
                                                    {event.event_name.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    {eventTime.time}
                                                </span>
                                            </div>
                                            
                                            {/* Event Payload */}
                                            {event.event_payload && Object.keys(event.event_payload).length > 0 && (
                                                <div className="mt-1">
                                                    <button
                                                        onClick={() => setExpandedEventId(isEventExpanded ? null : event.timeline_id)}
                                                        className="text-[10px] text-blue-600 hover:text-blue-800"
                                                    >
                                                        {isEventExpanded ? 'Hide' : 'Show'} details
                                                    </button>
                                                    {isEventExpanded && (
                                                        <div className="mt-1 text-[10px] text-gray-500 bg-white p-2 rounded border border-gray-200">
                                                            <pre className="whitespace-pre-wrap break-words text-[10px]">
                                                                {JSON.stringify(event.event_payload, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Show More Button */}
                        {showExpandButton && !isExpanded && (
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Show {hiddenEventCount} more {hiddenEventCount === 1 ? 'event' : 'events'}
                            </button>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}

