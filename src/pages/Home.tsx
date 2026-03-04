import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ChartBarIcon, BeakerIcon, HeartIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
// import { ClockIcon } from '@heroicons/react/24/outline';
import ChatButton from '../components/chat/chat-button/chat-button';
import { UnifiedModal } from '../components/unified-modal/unified-modal';
import AuthModal from '../crm/components/ui/AuthModal';
import { isAuthenticated, setAuthenticated } from '../store/authStore';
import { useThemeConfig } from '../hooks/useThemeConfig';
import { useDomainPrefix } from '../hooks/useDomainPrefix';
import { getHomePageConfig } from '../config/theme-config';
// import { useApprovedRequests } from '../services/crm/hooks-approved-requests';
// import { useAuthStore } from '../store/authStore';

const Home = () => {
    const [showChat, setShowChat] = useState(false);
    const [showUnifiedModal, setShowUnifiedModal] = useState(false);
    const [unifiedModalInitialStep, setUnifiedModalInitialStep] = useState<'intro' | 'service_selection' | 'home'>('intro');
    const [is_authenticated, setIsAuthenticated] = useState(false);
    const [show_auth_modal, setShowAuthModal] = useState(false);

    const themeConfig = useThemeConfig();
    const domainPrefix = useDomainPrefix();
    const homePageConfig = getHomePageConfig(themeConfig);

    // const { approved_requests, is_loading, error, fetch_approved_requests } = useApprovedRequests();

    useEffect(() => {
        const authenticated = isAuthenticated();
        setIsAuthenticated(authenticated);
        setShowAuthModal(!authenticated);
    }, []);

    useEffect(() => {
        if (!is_authenticated) return;
        // Automatically open UnifiedModal after 1 second when authenticated
        const timer = setTimeout(() => {
            setShowUnifiedModal(true);
            setUnifiedModalInitialStep('intro');
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, [is_authenticated]);

    const handleAuthSuccess = () => {
        setAuthenticated(true);
        setIsAuthenticated(true);
        setShowAuthModal(false);
    };

    // Fetch approved requests when component mounts if user is authenticated
    // useEffect(() => {
    //     const authStore = useAuthStore.getState();
    //     const user = authStore.user;
    //     const user_id = user?.userData?.user_id;

    //     if (user_id) {
    //         fetch_approved_requests(user_id, 5);
    //     }
    // }, [fetch_approved_requests]);

    const handleOpenChatFromUnified = () => {
        // Keep modal open and it will show chat
        // The UnifiedModal handles the chat step internally
    };

    if (!is_authenticated) {
        return <AuthModal isOpen={show_auth_modal} onSuccess={handleAuthSuccess} />;
    }

    const { hero, benefits, testimonials, resources, cta } = homePageConfig;
    const primaryColor = themeConfig.primary_color;
    const secondaryColor = themeConfig.secondary_color;

    return (
        <main>
            <style>{`
                .hero-secondary-btn:hover { background-color: white !important; color: ${primaryColor} !important; }
                .hero-outline-btn:hover { background-color: ${secondaryColor || primaryColor} !important; border-color: ${secondaryColor || primaryColor} !important; }
                .cta-secondary-btn:hover { background-color: white !important; color: ${primaryColor} !important; border-color: white !important; }
            `}</style>
            {/* Hero Section */}
            <section
                className="py-20 overflow-hidden"
                style={{
                    background: hero.bg_gradient ?? hero.bg_color,
                    backgroundColor: !hero.bg_gradient ? hero.bg_color : undefined,
                    color: hero.text_color ?? '#ffffff',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Top-right links */}
                    {hero.header_links && hero.header_links.length > 0 && (
                        <div className="absolute top-4 sm:top-6 lg:top-0 right-4 sm:right-6 lg:right-8 flex flex-wrap justify-end gap-3 sm:gap-4 z-10">
                            {hero.header_links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm sm:text-base hover:underline transition-all duration-300 whitespace-nowrap"
                                    style={{ color: hero.text_color ?? '#ffffff' }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-16 sm:pt-20 lg:pt-0">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="lg:pr-10">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">{hero.headline}</h1>
                            <p className="text-xl mb-8" style={{ color: hero.text_color ?? '#ffffff' }}>{hero.description}</p>
                            <div className="flex flex-wrap gap-4">
                                {hero.cta_buttons?.map((btn) => {
                                    const path = `${domainPrefix}/${btn.path}`.replace(/\/+/g, '/');
                                    if (btn.variant === 'primary') {
                                        return (
                                            <Link key={btn.label} to={path} className="bg-white font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300" style={{ color: primaryColor }}>
                                                {btn.label}
                                            </Link>
                                        );
                                    }
                                    if (btn.variant === 'secondary') {
                                        return (
                                            <Link key={btn.label} to={path} className="hero-secondary-btn bg-transparent border-2 font-semibold py-3 px-6 rounded-full transition-all duration-300" style={{ borderColor: hero.text_color ?? '#ffffff', color: hero.text_color ?? '#ffffff' }}>
                                                {btn.label}
                                            </Link>
                                        );
                                    }
                                    return (
                                        <Link key={btn.label} to={path} className="border-2 font-semibold py-3 px-6 rounded-full flex items-center gap-2 transition-all duration-300 hero-outline-btn" style={{ borderColor: primaryColor, backgroundColor: primaryColor, color: hero.text_color ?? '#ffffff' }}>
                                            <AcademicCapIcon className="h-5 w-5" style={{ color: hero.text_color ?? '#ffffff' }} />
                                            {btn.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
                            <div className="w-full h-96 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}4D` }}>
                                <div className="bg-white rounded-3xl w-[420px] h-72 shadow-xl flex items-center justify-center p-4">
                                    <img src={hero.hero_image ?? '/images/diabetrixpeopleimage.png'} alt={hero.headline} className="w-full h-full object-cover rounded-2xl" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Key Benefits Section */}
            <section className="py-20" style={{ backgroundColor: benefits.bg_color ?? '#ffffff' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" style={{ color: benefits.heading_color ?? primaryColor }}>{benefits.title}</h2>
                        <p className="text-lg max-w-3xl mx-auto" style={{ color: benefits.body_color ?? '#4b5563' }}>{benefits.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.features?.map((feature, idx) => {
                            const IconComponent = feature.icon === 'beaker' ? BeakerIcon : feature.icon === 'heart' ? HeartIcon : ChartBarIcon;
                            return (
                                <motion.div key={idx} whileHover={{ y: -5 }} className="card p-8">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}20` }}>
                                        <IconComponent className="h-8 w-8" style={{ color: primaryColor }} />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3" style={{ color: benefits.body_color ?? '#1f2937' }}>{feature.title}</h3>
                                    <p style={{ color: benefits.body_color ?? '#4b5563' }}>{feature.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {benefits.cta_text && benefits.cta_path && (
                        <div className="mt-12 text-center">
                            <Link to={`${domainPrefix}/${benefits.cta_path}`.replace(/\/+/g, '/')} className="inline-flex items-center font-semibold hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>
                                {benefits.cta_text}
                                <ArrowRightIcon className="ml-2 h-5 w-5" style={{ color: primaryColor }} />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Patient testimonials */}
            <section className="py-20" style={{ backgroundColor: testimonials.bg_color ?? '#f9fafb' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" style={{ color: testimonials.heading_color ?? primaryColor }}>{testimonials.title}</h2>
                        <p className="max-w-3xl mx-auto" style={{ color: testimonials.body_color ?? '#4b5563' }}>{testimonials.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.testimonials?.map((t, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-xl shadow-md">
                                <div className="flex flex-col h-full">
                                    <div className="flex-1">
                                        <p className="italic mb-4" style={{ color: testimonials.body_color ?? '#4b5563' }}>&quot;{t.quote}&quot;</p>
                                    </div>
                                    <div className="mt-6 flex items-center">
                                        {t.avatar_url ? (
                                            <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                        )}
                                        <div className="ml-4">
                                            <p className="font-semibold" style={{ color: testimonials.body_color ?? '#1f2937' }}>{t.name}</p>
                                            <p className="text-sm" style={{ color: testimonials.body_color ?? '#6b7280' }}>{t.descriptor}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {testimonials.disclaimer && (
                        <p className="text-xs mt-8 text-center" style={{ color: testimonials.body_color ?? '#6b7280' }}>{testimonials.disclaimer}</p>
                    )}
                </div>
            </section>

            {/* Resources Section */}
            <section className="py-20" style={{ backgroundColor: resources.bg_color ?? '#f9fafb' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" style={{ color: primaryColor }}>{resources.title}</h2>
                        <p className="text-lg max-w-3xl mx-auto" style={{ color: '#4b5563' }}>{resources.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* PI & Medication Guide */}
                        <Link to={`${domainPrefix}/pi-medication-guide`.replace(/\/+/g, '/')} className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">PI & Medication Guide</h3>
                                <p className="text-sm text-gray-600">Download prescribing information and medication guides</p>
                            </div>
                        </Link>

                        {/* Side Effects */}
                        <Link to={`${domainPrefix}/side-effects`.replace(/\/+/g, '/')} className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-2">Side Effects</h3>
                                <p className="text-sm text-gray-600">Learn about potential side effects and what to watch for</p>
                            </div>
                        </Link>

                        {/* Savings & Assistance */}
                        <Link to={`${domainPrefix}/savings-assistance`.replace(/\/+/g, '/')} className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">Savings</h3>
                                <p className="text-sm text-gray-600">Get help with prescription costs and patient assistance</p>
                            </div>
                        </Link>

                        {/* Patient Support */}
                        <Link to="/patient-support" className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">Patient Support</h3>
                                <p className="text-sm text-gray-600">Comprehensive support for your treatment journey</p>
                            </div>
                        </Link>

                        {/* Knowledge Quiz */}
                        <Link to={`${domainPrefix}/quiz`.replace(/\/+/g, '/')} className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                                    <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">Knowledge Quiz</h3>
                                <p className="text-sm text-gray-600">Test your understanding of Diabetrix® with our interactive quiz</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Your Recent Requests Section */}
            {/* Commented out - This section is now handled in the UnifiedModal's home-page component */}
            {/* <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">Your Recent Requests</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">View your recent service requests and their current status</p>
                    </div>

                    {is_loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-600">Loading your requests...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">Error loading requests: {error}</p>
                            <button
                                onClick={() => {
                                    const authStore = useAuthStore.getState();
                                    const user = authStore.user;
                                    const user_id = user?.userData?.user_id;
                                    if (user_id) {
                                        fetch_approved_requests(user_id, 5);
                                    }
                                }}
                                className="text-primary hover:text-secondary font-semibold">
                                Try again
                            </button>
                        </div>
                    ) : approved_requests.length === 0 ? (
                        <div className="text-center py-12">
                            <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">You don't have any recent requests yet.</p>
                            <p className="text-gray-500 text-sm mt-2">Start by requesting a service through the chat.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {approved_requests.map((request) => {
                                const created_date = new Date(request.created_at);
                                const formatted_date = created_date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                });

                                // Determine status color
                                const get_status_color = (status_name: string) => {
                                    const status_lower = status_name.toLowerCase();
                                    if (status_lower.includes('completed')) return 'text-green-600 bg-green-50';
                                    if (status_lower.includes('progress')) return 'text-blue-600 bg-blue-50';
                                    if (status_lower.includes('failed')) return 'text-red-600 bg-red-50';
                                    return 'text-gray-600 bg-gray-50';
                                };

                                return (
                                    <motion.div key={request.request_id} whileHover={{ y: -5 }} className="card p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{request.request_name}</h3>
                                                {request.task_type_name && <p className="text-sm text-gray-500 mb-2">{request.task_type_name}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Status:</span>
                                                <span className={`text-sm font-medium px-2 py-1 rounded ${get_status_color(request.request_status_name)}`}>{request.request_status_name}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Created:</span>
                                                <span className="text-sm text-gray-900">{formatted_date}</span>
                                            </div>
                                        </div>

                                        {request.request_details && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-sm text-gray-600 line-clamp-2">{request.request_details}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section> */}

            {/* Call to Action */}
            <section className="py-16" style={{ backgroundColor: cta.bg_color ?? primaryColor, color: cta.text_color ?? '#ffffff' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">{cta.title}</h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto">{cta.description}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {cta.buttons?.map((btn, idx) => (
                            <Link
                                key={btn.label}
                                to={`${domainPrefix}/${btn.path}`.replace(/\/+/g, '/')}
                                className={`font-semibold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ${idx === 0 ? '' : 'cta-secondary-btn'}`}
                                style={idx === 0
                                    ? { backgroundColor: '#ffffff', color: primaryColor }
                                    : { backgroundColor: 'transparent', border: `2px solid ${cta.text_color ?? '#ffffff'}`, color: cta.text_color ?? '#ffffff' }
                                }
                            >
                                {btn.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Unified Modal */}
            {showUnifiedModal && <UnifiedModal onClose={() => setShowUnifiedModal(false)} onChatOpen={handleOpenChatFromUnified} initialStep={unifiedModalInitialStep} />}

            {/* Chat Button - Opens UnifiedModal */}
            {!showUnifiedModal && (
                <ChatButton
                    toggle_chat={() => {
                        setShowUnifiedModal(true);
                        setUnifiedModalInitialStep('intro');
                    }}
                    show_chat={showChat}
                    new_url={window.location.pathname}
                />
            )}
        </main>
    );
};

export default Home;
