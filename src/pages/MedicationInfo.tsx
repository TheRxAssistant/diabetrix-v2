import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, BeakerIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline';

const MedicationInfo: React.FC = () => {
    const keyFeatures = [
        {
            icon: <ChartBarIcon className="h-8 w-8" />,
            title: 'Improved Glycemic Control',
            description: 'Helps lower blood sugar levels and improve HbA1c in adults with Type 2 Diabetes',
        },
        {
            icon: <ClockIcon className="h-8 w-8" />,
            title: 'Once-Daily Dosing',
            description: 'Convenient once-daily oral tablet that fits easily into your daily routine',
        },
        {
            icon: <BeakerIcon className="h-8 w-8" />,
            title: 'Clinical Efficacy',
            description: 'Backed by extensive clinical research demonstrating significant improvements in glycemic control',
        },
        {
            icon: <HeartIcon className="h-8 w-8" />,
            title: 'Well-Studied Safety',
            description: 'Established safety profile based on years of clinical experience and research',
        },
    ];

    const howItWorks = [
        {
            step: '1',
            title: 'Take as Prescribed',
            description: 'Take Diabetrix® exactly as your healthcare provider prescribes, typically once daily with food',
        },
        {
            step: '2',
            title: 'Monitor Your Progress',
            description: 'Work with your healthcare provider to regularly monitor your blood sugar levels and HbA1c',
        },
        {
            step: '3',
            title: 'Maintain Healthy Lifestyle',
            description: 'Combine medication with a healthy diet and regular exercise for best results',
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
                    <h1 className="text-xl font-semibold text-gray-900">Learn About Diabetrix®</h1>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-4">Understanding Diabetrix®</h2>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                        Diabetrix® (metformelate) is a once-daily oral treatment designed to help adults with Type 2 Diabetes achieve better glycemic control.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Overview Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Diabetrix®?</h3>
                    <p className="text-lg text-gray-700 mb-4">
                        Diabetrix® is a prescription medication approved for the treatment of Type 2 Diabetes in adults. It works by helping your body respond better to insulin and reducing the amount of sugar your liver produces.
                    </p>
                    <p className="text-lg text-gray-700">
                        When used as part of a comprehensive diabetes management plan that includes diet and exercise, Diabetrix® can help you achieve better blood sugar control and improve your overall health.
                    </p>
                </div>

                {/* Key Features */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Features & Benefits</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {keyFeatures.map((feature, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How Diabetrix® Works</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {howItWorks.map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white font-bold text-xl">{item.step}</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-12">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Safety Information</h3>
                            <ul className="text-yellow-700 space-y-1">
                                <li>• Diabetrix® is a prescription medication and should only be taken under the supervision of a healthcare provider</li>
                                <li>• Do not take Diabetrix® if you have severe kidney problems or are allergic to any of its ingredients</li>
                                <li>• Tell your healthcare provider about all medications you are taking</li>
                                <li>• Follow your healthcare provider's instructions for dosing and monitoring</li>
                                <li>• Report any side effects to your healthcare provider immediately</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Additional Resources */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Additional Resources</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Link to="/patient-support" className="group block p-6 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition-all duration-200">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                                    <HeartIcon className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Patient Support</h4>
                                <p className="text-gray-600 mt-2">Get comprehensive support for your treatment journey</p>
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

export default MedicationInfo;
