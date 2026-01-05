import React from 'react';
import { Link } from 'react-router-dom';

const PatientSupport: React.FC = () => {
    const supportServices = [
        {
            icon: '📞',
            title: '24/7 Support Hotline',
            description: 'Speak with our patient support specialists anytime, day or night',
            contact: '1-800-DIABETRIX',
        },
        {
            icon: '💬',
            title: 'Live Chat Support',
            description: 'Get instant answers to your questions through our online chat',
            contact: 'Available on website',
        },
        {
            icon: '📧',
            title: 'Email Support',
            description: 'Send us your questions and receive detailed responses',
            contact: 'support@diabetrix.com',
        },
        {
            icon: '📚',
            title: 'Educational Resources',
            description: 'Access guides, videos, and educational materials about diabetes management',
            contact: 'Available online',
        },
    ];

    const resources = [
        {
            title: 'Medication Guides',
            description: 'Downloadable guides on how to take Diabetrix® safely and effectively',
        },
        {
            title: 'Diabetes Management Tips',
            description: 'Practical tips for managing Type 2 Diabetes in your daily life',
        },
        {
            title: 'Nutrition Resources',
            description: 'Meal planning guides and nutrition tips to support your treatment',
        },
        {
            title: 'Exercise Guidelines',
            description: 'Safe exercise recommendations for people with Type 2 Diabetes',
        },
        {
            title: 'Blood Sugar Monitoring',
            description: 'Learn how to monitor and track your blood sugar levels effectively',
        },
        {
            title: 'Side Effect Management',
            description: 'Information on managing potential side effects and when to contact your doctor',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white">
                <div className="flex items-center p-4 border-b border-gray-200">
                    <Link to="/" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">Patient Support</h1>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-4">We're Here to Support You</h2>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                        Comprehensive support services to help you throughout your Diabetrix® treatment journey. Our team is dedicated to your success.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Support Services */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How We Can Help</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {supportServices.map((service, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h4>
                                <p className="text-gray-600 mb-4">{service.description}</p>
                                <p className="text-blue-600 font-semibold">{service.contact}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resources Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Educational Resources</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-600 hover:shadow-md transition-all duration-200">
                                <h4 className="font-semibold text-gray-900 mb-2">{resource.title}</h4>
                                <p className="text-gray-600 text-sm">{resource.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">How do I take Diabetrix®?</h4>
                            <p className="text-gray-600">
                                Diabetrix® is typically taken once daily with food. Always follow your healthcare provider's specific instructions for dosing.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">What should I do if I miss a dose?</h4>
                            <p className="text-gray-600">
                                If you miss a dose, take it as soon as you remember. If it's almost time for your next dose, skip the missed dose and continue with your regular schedule. Do not take two doses at once.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Can I take Diabetrix® with other medications?</h4>
                            <p className="text-gray-600">
                                Always inform your healthcare provider about all medications you are taking, including prescription drugs, over-the-counter medications, and supplements.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">What should I do if I experience side effects?</h4>
                            <p className="text-gray-600">
                                Contact your healthcare provider immediately if you experience any side effects. Some common side effects may include gastrointestinal symptoms, which often improve over time.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Get in Touch</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Call Support</h4>
                            <p className="text-gray-600 mb-3">Speak with a patient support specialist</p>
                            <a href="tel:1-800-DIABETRIX" className="text-blue-600 hover:text-blue-800 font-semibold">
                                1-800-DIABETRIX
                            </a>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                            <p className="text-gray-600 mb-3">Send us your questions</p>
                            <a href="mailto:support@diabetrix.com" className="text-blue-600 hover:text-blue-800 font-semibold">
                                support@diabetrix.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Additional Resources */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Additional Resources</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Link to="/medication-info" className="group block p-6 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all duration-200">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Learn About Diabetrix®</h4>
                                <p className="text-gray-600 mt-2">Comprehensive information about your medication</p>
                            </div>
                        </Link>
                        <Link to="/quiz" className="group block p-6 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all duration-200">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-700 transition-colors">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Knowledge Quiz</h4>
                                <p className="text-gray-600 mt-2">Test your understanding of Diabetrix®</p>
                            </div>
                        </Link>
                        <Link to="/savings-assistance" className="group block p-6 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all duration-200">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Savings & Assistance</h4>
                                <p className="text-gray-600 mt-2">Learn about cost savings programs</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientSupport;
