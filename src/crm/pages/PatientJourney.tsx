import React, { useState } from 'react';
import { FaArrowLeft, FaCalendar, FaCheckCircle, FaChevronDown, FaClock, FaComment, FaFacebook, FaGoogle, FaInfoCircle, FaPhone, FaPills, FaRobot, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Tag from '../components/ui/Tag';

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
    details?: any;
}

export default function PatientJourney() {
    const params = useParams<{ id: string }>();
    const patientId = params.id || '1';
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
    const [lastEngagementExpanded, setLastEngagementExpanded] = useState<boolean>(false);

    const primaryColor = '#0078D4';
    const secondaryColor = '#00B7C3';
    const tertiaryColor = '#83C995';
    const successColor = '#52c41a';

    const patient = {
        id: patientId,
        name: patientId === '1' ? 'John Smith' : patientId === '4' ? 'Anonymous User' : 'Sarah Johnson',
        age: patientId === '4' ? null : patientId === '1' ? 58 : 62,
        location: patientId === '4' ? 'Unknown' : patientId === '1' ? 'New York, NY' : 'Chicago, IL',
        insurance: patientId === '4' ? 'Unknown' : patientId === '1' ? 'Commercial' : 'Medicare',
        phone: patientId === '4' ? null : patientId === '1' ? '+1 (555) 123-4567' : '+1 (555) 987-6543',
        email: patientId === '4' ? null : patientId === '1' ? 'john.smith@example.com' : 'sarah.johnson@example.com',
    };

    const stages: { key: JourneyStage; label: string; icon: React.ReactNode }[] = [
        { key: 'AD_CLICK', label: 'Ad Clicked', icon: <FaShoppingCart /> },
        { key: 'ENGAGEMENT', label: 'Engaged', icon: <FaRobot /> },
        { key: 'QUALIFICATION', label: 'Benefits Check', icon: <FaSearch /> },
        { key: 'FILLED', label: 'Prescription Filled', icon: <FaPills /> },
    ];

    const journeyEvents: JourneyEvent[] =
        patientId === '1'
            ? [
                  {
                      id: '1',
                      stage: 'AD_CLICK',
                      timestamp: '2025-01-15 10:16',
                      description: 'Find doctor',
                      type: 'ad',
                      channel: 'none',
                      campaign: {
                          platform: 'meta',
                          adType: 'find_doctor',
                          campaignId: 'META-FD-2025-Q1',
                          campaignName: 'Find Doctor Q1 2025',
                      },
                  },
                  {
                      id: '2',
                      stage: 'ENGAGEMENT',
                      timestamp: '2025-01-15 10:20',
                      description: 'Discussed finding endocrinologist',
                      type: 'chat',
                      channel: 'chat',
                      details: {
                          messages: [
                              { sender: 'PATIENT', message: 'I need to find an endocrinologist near me' },
                              { sender: 'BOT', message: "I can help you find a doctor. What's your location?" },
                              { sender: 'PATIENT', message: 'New York, NY' },
                              {
                                  sender: 'BOT',
                                  message: 'I found 3 endocrinologists near you. Would you like me to help schedule an appointment?',
                              },
                          ],
                      },
                  },
                  {
                      id: '4',
                      stage: 'ENGAGEMENT',
                      timestamp: '2025-01-15 10:25',
                      description: 'Schedule doctors appointment',
                      type: 'appointment',
                      channel: 'text',
                      details: {
                          doctor: 'Dr. Robert Chen',
                          date: '2025-02-05',
                          time: '10:00 AM',
                          location: '123 Medical Center Dr, New York, NY',
                      },
                  },
                  {
                      id: '5',
                      stage: 'ENGAGEMENT',
                      timestamp: '2025-01-18 14:00',
                      description: 'Voice check in',
                      type: 'call',
                      channel: 'voice',
                      details: {
                          duration: '5:23',
                          outcome: 'Appointment confirmed',
                      },
                  },
                  {
                      id: '6',
                      stage: 'ENGAGEMENT',
                      timestamp: '2025-02-05 14:30',
                      description: 'Prescription written by doctor',
                      type: 'prescription',
                      channel: 'none',
                      details: {
                          medication: 'Diabetrix 500mg',
                          frequency: 'Once daily',
                          prescriber: 'Dr. Robert Chen',
                      },
                  },
                  {
                      id: '7',
                      stage: 'QUALIFICATION',
                      timestamp: '2025-02-06 10:30',
                      description: 'Benefits check',
                      type: 'call',
                      channel: 'voice',
                      details: {
                          duration: '3:42',
                          outcome: 'Coverage confirmed',
                          copay: '$25',
                          requiresPA: true,
                      },
                  },
                  {
                      id: '8',
                      stage: 'FILLED',
                      timestamp: '2025-02-08 11:20',
                      description: 'Prescription filled',
                      type: 'fill',
                      channel: 'none',
                      details: {
                          pharmacy: 'CVS Pharmacy #4872',
                          cost: '$25',
                          refills: 2,
                      },
                  },
                  {
                      id: '9',
                      stage: 'FILLED',
                      timestamp: '2025-02-09 09:00',
                      description: 'Follow-up with how to use',
                      type: 'followup',
                      channel: 'text',
                      details: {
                          channel: 'SMS',
                          message: "Here's how to take Diabetrix: Take once daily with food.",
                          status: 'sent',
                      },
                  },
                  {
                      id: '10',
                      stage: 'FILLED',
                      timestamp: '2025-02-12 14:30',
                      description: 'Voice check in',
                      type: 'followup',
                      channel: 'voice',
                      details: {
                          channel: 'Voice',
                          duration: '8 minutes',
                          topics: ['Administration instructions', 'Side effect management', 'When to contact doctor'],
                          status: 'completed',
                      },
                  },
              ]
            : patientId === '4'
              ? [
                    {
                        id: '1',
                        stage: 'AD_CLICK',
                        timestamp: '2025-03-20 14:21',
                        description: 'Check Insurance Coverage',
                        type: 'ad',
                        channel: 'none',
                        campaign: {
                            platform: 'google',
                            adType: 'market_access',
                            campaignId: 'GOOGLE-MA-2025-Q1',
                            campaignName: 'Market Access Q1 2025',
                        },
                    },
                    {
                        id: '2',
                        stage: 'ENGAGEMENT',
                        timestamp: '2025-03-20 14:23',
                        description: 'Discussed insurance coverage for Diabetrix',
                        type: 'chat',
                        channel: 'chat',
                        details: {
                            messages: [
                                { sender: 'PATIENT', message: 'Does my insurance cover Diabetrix?' },
                                { sender: 'BOT', message: 'I can help check your coverage. What insurance do you have?' },
                                { sender: 'PATIENT', message: 'I have Commercial insurance' },
                                { sender: 'BOT', message: 'Great! I can verify your benefits. Do you have your member ID?' },
                            ],
                        },
                    },
                    {
                        id: '3',
                        stage: 'QUALIFICATION',
                        timestamp: '2025-03-20 14:30',
                        description: 'Provided insurance information - verification in progress',
                        type: 'chat',
                        channel: 'chat',
                    },
                ]
              : [
                    {
                        id: '1',
                        stage: 'AD_CLICK',
                        timestamp: '2025-04-10 09:32',
                        description: 'Learn More',
                        type: 'ad',
                        channel: 'none',
                        campaign: {
                            platform: 'meta',
                            adType: 'education',
                            campaignId: 'META-EDU-2025-Q2',
                            campaignName: 'Education Q2 2025',
                        },
                    },
                    {
                        id: '2',
                        stage: 'ENGAGEMENT',
                        timestamp: '2025-04-10 09:35',
                        description: 'Discussed Diabetrix side effects',
                        type: 'chat',
                        channel: 'chat',
                    },
                    {
                        id: '3',
                        stage: 'QUALIFICATION',
                        timestamp: '2025-04-12 11:00',
                        description: 'Benefits verified - Medicare coverage, $15 copay',
                        type: 'call',
                        channel: 'voice',
                    },
                    {
                        id: '4',
                        stage: 'FILLED',
                        timestamp: '2025-04-15 10:30',
                        description: 'Prescription filled at Walgreens #3921',
                        type: 'fill',
                        channel: 'none',
                    },
                ];

    const currentStageIndex =
        journeyEvents.length > 0
            ? Math.max(
                  0,
                  stages.findIndex((s) => {
                      const eventStages = journeyEvents.map((e) => e.stage);
                      const lastStage = eventStages[eventStages.length - 1];
                      return s.key === lastStage;
                  }),
              )
            : 0;

    const getStageDate = (stageKey: JourneyStage) => {
        const firstEvent = journeyEvents.find((e) => e.stage === stageKey);
        if (!firstEvent) return null;
        return new Date(firstEvent.timestamp);
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

    const toggleEventDetails = (eventId: string) => {
        const newExpanded = new Set(expandedEvents);
        if (newExpanded.has(eventId)) {
            newExpanded.delete(eventId);
        } else {
            newExpanded.add(eventId);
        }
        setExpandedEvents(newExpanded);
    };

    const renderEventDetails = (event: JourneyEvent) => {
        if (!event.details) return null;

        if (event.type === 'chat' && event.details.messages) {
            return (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold mb-2">Conversation:</div>
                    {event.details.messages.map((msg: any, idx: number) => (
                        <div key={idx} className={`mb-2 p-2 rounded ${msg.sender === 'PATIENT' ? 'bg-blue-50 border-l-4 border-[#0078D4]' : 'bg-white border-l-4 border-gray-300'}`}>
                            <span className={`font-semibold ${msg.sender === 'PATIENT' ? 'text-[#0078D4]' : 'text-gray-600'}`}>{msg.sender}:</span>
                            <span className="ml-2 break-words">{msg.message}</span>
                        </div>
                    ))}
                </div>
            );
        }

        if (event.type === 'call' || (event.type === 'followup' && event.details.channel === 'Voice')) {
            return (
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
            );
        }

        if (event.type === 'appointment') {
            return (
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
            );
        }

        if (event.type === 'prescription') {
            return (
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
            );
        }

        if (event.type === 'fill') {
            return (
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
            );
        }

        if (event.type === 'followup') {
            return (
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
            );
        }

        return null;
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

    const lastEngagement = journeyEvents.filter((e) => e.stage === 'ENGAGEMENT' && e.channel && e.channel !== 'none').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const getLastEngagementContext = () => {
        if (!lastEngagement) return null;
        const lastEngagementIndex = journeyEvents.findIndex((e) => e.id === lastEngagement.id);
        const relatedEvents = journeyEvents.slice(0, lastEngagementIndex + 1).filter((e) => e.id !== lastEngagement.id);

        const relatedAppointment = journeyEvents.find((e) => e.type === 'appointment' && new Date(e.timestamp).getTime() <= new Date(lastEngagement.timestamp).getTime());
        const relatedPrescription = journeyEvents.find((e) => (e.type === 'prescription' || e.type === 'fill') && new Date(e.timestamp).getTime() >= new Date(lastEngagement.timestamp).getTime());

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
                                                <div className={`w-[70px] h-[70px] sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center text-3xl sm:text-2xl transition-all ${isCompleted ? `bg-[${successColor}] text-white shadow-lg` : isCurrent ? 'bg-white text-[#0078D4] border-4 border-[#0078D4] shadow-lg' : 'bg-gray-100 text-gray-400'}`} style={isCompleted ? { backgroundColor: successColor } : isCurrent ? { boxShadow: '0 0 0 5px rgba(0, 120, 212, 0.15), 0 4px 12px rgba(0,0,0,0.12)' } : {}}>
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
                                {lastEngagement && (
                                    <button onClick={() => setLastEngagementExpanded(!lastEngagementExpanded)} className="transition-transform" style={{ transform: lastEngagementExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        <FaChevronDown />
                                    </button>
                                )}
                            </div>

                            {lastEngagement ? (
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="mb-0 flex-1 flex flex-col min-w-0">
                                        <span className="text-gray-900 text-sm block mb-3 font-semibold leading-snug break-words">{lastEngagement.description}</span>

                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex-1">
                                            <div className="mb-2.5">
                                                <span className="text-[11px] text-gray-600 block mb-1 font-semibold">Date: </span>
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {new Date(lastEngagement.timestamp).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                <span className="text-[11px] text-gray-400 block mt-0.5">{formatTimeAgo(lastEngagement.timestamp)}</span>
                                            </div>

                                            <hr className="my-2.5 border-gray-200" />

                                            <div className="mb-2.5">
                                                <span className="text-[11px] text-gray-600 block mb-1 font-semibold">Type: </span>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    {getChannelInfo(lastEngagement.channel)?.icon && <span className="flex-shrink-0" style={{ color: getChannelInfo(lastEngagement.channel)?.color }}>{getChannelInfo(lastEngagement.channel)?.icon}</span>}
                                                    <span className="text-sm text-gray-900 font-medium break-words">{getEventTypeLabel(lastEngagement)}</span>
                                                    {lastEngagement.channel && <Tag className="text-[10px] m-0 px-2 py-0.5 flex-shrink-0">{getChannelInfo(lastEngagement.channel)?.label}</Tag>}
                                                </div>
                                            </div>

                                            <hr className="my-2.5 border-gray-200" />

                                            <div>
                                                <span className="text-[11px] text-gray-600 block mb-1 font-semibold">Outcome: </span>
                                                {lastEngagement.details?.outcome ? (
                                                    <Tag color="green" className="text-xs px-2.5 py-0.5 m-0">
                                                        {lastEngagement.details.outcome}
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
                                            {lastEngagement.details && (
                                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    {lastEngagement.details.duration && (
                                                        <div className="mb-3">
                                                            <span className="text-xs text-gray-600 block mb-1 font-semibold">Duration: </span>
                                                            <span className="text-sm text-gray-900 font-medium">{lastEngagement.details.duration}</span>
                                                        </div>
                                                    )}
                                                    {lastEngagement.details.topics && (
                                                        <div className="mb-3">
                                                            <span className="text-xs text-gray-600 block mb-1.5 font-semibold">Topics Discussed: </span>
                                                            <div className="flex flex-col gap-1.5">
                                                                {lastEngagement.details.topics.map((topic: string, idx: number) => (
                                                                    <div key={idx} className="px-2.5 py-1.5 bg-white rounded border border-gray-200">
                                                                        <span className="text-xs text-gray-900">{topic}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {lastEngagement.details.messages && lastEngagement.details.messages.length > 0 && (
                                                        <div>
                                                            <span className="text-xs text-gray-600 block mb-1.5 font-semibold">Conversation Summary: </span>
                                                            <div className="p-2.5 bg-white rounded border border-gray-200">
                                                                <span className="text-xs text-gray-900 leading-relaxed break-words">{lastEngagement.details.messages[lastEngagement.details.messages.length - 1]?.message}</span>
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

                        {/* Events */}
                        {journeyEvents.map((event, index) => {
                            const isExpanded = expandedEvents.has(event.id);
                            const status = getStageStatus(event.stage);
                            const isCompleted = status === 'completed' || index < journeyEvents.length - 1;
                            const channelInfo = getChannelInfo(event.channel);
                            return (
                                <React.Fragment key={event.id}>
                                    <div className="relative mb-5 pl-12 sm:pl-16">
                                        {/* Enhanced Dot */}
                                        <div className={`absolute left-3.5 top-2.5 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm border-4 border-white z-10 transition-all ${isCompleted ? 'bg-[#0078D4] shadow-lg' : 'bg-gray-300'}`} style={isCompleted ? { boxShadow: '0 4px 12px rgba(0, 120, 212, 0.3), 0 0 0 2px rgba(0, 120, 212, 0.1)' } : {}}>
                                            {getEventIcon(event)}
                                        </div>

                                        {/* Enhanced Channel Badge on Dot */}
                                        {channelInfo && (
                                            <div className="absolute left-9 top-1.5 w-5 h-5 rounded-full border-[3px] border-white flex items-center justify-center z-20 shadow-md" style={{ backgroundColor: channelInfo.color }}>
                                                <span className="text-white text-[10px]">{channelInfo.icon}</span>
                                            </div>
                                        )}

                                        {/* Enhanced Event Card */}
                                        <Card onClick={() => toggleEventDetails(event.id)} className={`rounded-xl transition-all cursor-pointer ml-1 ${isExpanded ? 'border-2 border-[#0078D4] shadow-lg' : `border border-${isCompleted ? '[#0078D4]20' : 'gray-200'} shadow-sm`}`} bodyStyle={{ padding: '16px 20px' }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                                                        <span className="text-gray-900 text-sm font-semibold leading-snug break-words">{event.description}</span>
                                                        {channelInfo && (
                                                            <Tag icon={channelInfo.icon} className="m-0 border text-[11px] px-2 py-0.5 h-auto leading-[18px]" style={{ color: channelInfo.color, borderColor: `${channelInfo.color}30` }}>
                                                                {channelInfo.label}
                                                            </Tag>
                                                        )}
                                                        {event.campaign && (
                                                            <Link to={`/crm/marketing/campaigns#${event.campaign.campaignId}`} onClick={(e) => e.stopPropagation()}>
                                                                <Button type="link" size="small" icon={<FaInfoCircle />} className="p-0 h-auto text-[11px]">
                                                                    View Attribution
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2.5 flex-wrap">
                                                        <Tag
                                                            icon={getEventIcon(event)}
                                                            className="text-xs px-3 py-1 h-auto rounded-md font-medium border-0"
                                                            style={{
                                                                backgroundColor: event.type === 'ad' ? (event.campaign?.platform === 'meta' ? '#4267B2' : '#4285F4') : event.type === 'followup' ? (event.details?.channel === 'SMS' ? secondaryColor : primaryColor) : primaryColor,
                                                                color: 'white',
                                                            }}>
                                                            {getEventTypeLabel(event)}
                                                        </Tag>
                                                        {getCampaignBadge(event)}
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <FaCalendar className="text-xs text-gray-600 flex-shrink-0" />
                                                            <span className="text-sm text-gray-600 font-semibold whitespace-nowrap">
                                                                {new Date(event.timestamp).toLocaleDateString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                                {new Date(event.timestamp).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isExpanded && renderEventDetails(event)}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleEventDetails(event.id);
                                                    }}
                                                    className="transition-transform"
                                                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                    <FaChevronDown />
                                                </button>
                                            </div>
                                        </Card>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
