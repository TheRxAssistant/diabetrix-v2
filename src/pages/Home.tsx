import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ChartBarIcon, BeakerIcon, HeartIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
// import { ClockIcon } from '@heroicons/react/24/outline';
import ChatButton from '../components/chat/chat-button/chat-button';
import { UnifiedModal } from '../components/unified-modal/unified-modal';
// import { useApprovedRequests } from '../services/crm/hooks-approved-requests';
// import { useAuthStore } from '../store/authStore';

const Home = () => {
    const [showChat, setShowChat] = useState(false);
    const [showUnifiedModal, setShowUnifiedModal] = useState(false);
    const [unifiedModalInitialStep, setUnifiedModalInitialStep] = useState<'intro' | 'service_selection' | 'home'>('intro');

    // const { approved_requests, is_loading, error, fetch_approved_requests } = useApprovedRequests();

    useEffect(() => {
        // Automatically open UnifiedModal after 1 second
        const timer = setTimeout(() => {
            setShowUnifiedModal(true);
            setUnifiedModalInitialStep('intro');
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

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

    return (
        <main>
            {/* Hero Section */}
            <section className="bg-gradient-blue text-white py-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Top-right links */}
                    <div className="absolute top-4 sm:top-6 lg:top-0 right-4 sm:right-6 lg:right-8 flex flex-wrap justify-end gap-3 sm:gap-4 z-10">
                        <a 
                            href="https://drive.google.com/file/d/1XXdfzRJJS8K1bRUNeELMK5112CcGlcec/view?usp=sharing&t=71" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white text-sm sm:text-base hover:underline transition-all duration-300 whitespace-nowrap"
                        >
                            Benefits Check
                        </a>
                        <a 
                            href="https://drive.google.com/file/d/1HD1hCvCIhPYZAj4EYkEcsRX4hiHlj6Ry/view?usp=sharing&t=132" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white text-sm sm:text-base hover:underline transition-all duration-300 whitespace-nowrap"
                        >
                            Copay Automation
                        </a>
                        <a 
                            href="https://drive.google.com/file/d/1UUlSyi_Oiixq13nDQOhM5BUesM7hIU7B/view?usp=sharing" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white text-sm sm:text-base hover:underline transition-all duration-300 whitespace-nowrap"
                        >
                            Scheduling Appointment
                        </a>
                        <a 
                            href="https://drive.google.com/file/d/1HB9heWTV9oPJoTTpVmZ5Lm-QsQ8avD92/view" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white text-sm sm:text-base hover:underline transition-all duration-300 whitespace-nowrap"
                        >
                            Find Stock Call
                        </a>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-16 sm:pt-20 lg:pt-0">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="lg:pr-10">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">Transform Your Diabetes Management with Diabetrix®</h1>
                            <p className="text-xl mb-8 text-white">A revolutionary once-daily oral treatment for adults with Type 2 Diabetes, designed to help achieve better glycemic control.</p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/medication-info" className="bg-white text-[#0066cc] font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                                    Learn About Diabetrix®
                                </Link>
                                <Link to="/patient-support" className="bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-full hover:bg-white hover:text-[#0066cc] transition-all duration-300">
                                    Patient Support
                                </Link>
                                <Link to="/quiz" className="bg-[#0066cc] border-2 border-[#0066cc] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#0055aa] hover:border-[#0055aa] transition-all duration-300 flex items-center gap-2">
                                    <AcademicCapIcon className="h-5 w-5 text-white" />
                                    Take Knowledge Quiz
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
                            {/* Happy couple image with white background */}
                            <div className="w-full h-96 bg-[#0099dd] bg-opacity-30 rounded-full flex items-center justify-center">
                                <div className="bg-white rounded-3xl w-[420px] h-72 shadow-xl flex items-center justify-center p-4">
                                    <img src="/images/diabetrixpeopleimage.png" alt="Happy couple managing diabetes with Diabetrix" className="w-full h-full object-cover rounded-2xl" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Key Benefits Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">A New Standard in Diabetes Care</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">Diabetrix® (metformelate) helps adults with Type 2 Diabetes achieve better glycemic control with a convenient once-daily dosing regimen.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <motion.div whileHover={{ y: -5 }} className="card p-8">
                            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                                <ChartBarIcon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Improved Glycemic Control</h3>
                            <p className="text-gray-600">In clinical trials, Diabetrix® demonstrated significant reductions in HbA1c compared to placebo, helping patients reach their glycemic goals.</p>
                        </motion.div>

                        {/* Benefit 2 */}
                        <motion.div whileHover={{ y: -5 }} className="card p-8">
                            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                                <BeakerIcon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Once-Daily Convenience</h3>
                            <p className="text-gray-600">A simple once-daily oral tablet that fits easily into your routine, helping to simplify your diabetes management.</p>
                        </motion.div>

                        {/* Benefit 3 */}
                        <motion.div whileHover={{ y: -5 }} className="card p-8">
                            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                                <HeartIcon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Well-Studied Safety Profile</h3>
                            <p className="text-gray-600">Backed by extensive clinical research and built on the foundation of trusted diabetes treatments.</p>
                        </motion.div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/medication-info" className="inline-flex items-center text-primary font-semibold hover:text-secondary transition-colors">
                            Learn more about Diabetrix® benefits
                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Patient testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">Real Stories from Real Patients*</h2>
                        <p className="text-gray-600 max-w-3xl mx-auto">Hear how Diabetrix® has helped people with Type 2 Diabetes take control of their condition.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-md">
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <p className="text-gray-600 italic mb-4">"Since starting Diabetrix®, my blood sugar levels have been more consistent, and I feel like I have more energy throughout the day. It's been a real game-changer for me."</p>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-primary"></div>
                                    <div className="ml-4">
                                        <p className="font-semibold">Michael T.</p>
                                        <p className="text-sm text-gray-500">Living with T2D for 8 years</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-md">
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <p className="text-gray-600 italic mb-4">"What I appreciate most is the once-daily dosing. It fits perfectly into my morning routine, and I don't have to worry about taking multiple pills throughout the day."</p>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-primary"></div>
                                    <div className="ml-4">
                                        <p className="font-semibold">Sarah L.</p>
                                        <p className="text-sm text-gray-500">Living with T2D for 5 years</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-md">
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <p className="text-gray-600 italic mb-4">"After discussing with my doctor, we decided to try Diabetrix®. My A1C has improved significantly, and I've experienced fewer spikes in my glucose levels."</p>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-primary"></div>
                                    <div className="ml-4">
                                        <p className="font-semibold">Robert J.</p>
                                        <p className="text-sm text-gray-500">Living with T2D for 12 years</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-8 text-center">*Individual results may vary. These testimonials represent the experiences of specific individuals. Consult your healthcare provider to determine if Diabetrix® is right for you.</p>
                </div>
            </section>

            {/* Resources Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">Important Resources</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">Access important information about Diabetrix®, including prescribing information, side effects, and patient assistance programs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* PI & Medication Guide */}
                        <Link to="/pi-medication-guide" className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                        <Link to="/side-effects" className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                        <Link to="/savings-assistance" className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                        <Link to="/quiz" className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left">
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
            <section className="py-16 bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to Take Control of Your Type 2 Diabetes?</h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto">Talk to your healthcare provider to see if Diabetrix® is right for you.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/medication-info" className="bg-white text-primary font-semibold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                            Learn More
                        </Link>
                        <Link to="/patient-support" className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-primary transition-all duration-300">
                            Patient Support Resources
                        </Link>
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
