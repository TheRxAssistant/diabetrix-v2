import React, { useState } from "react";
import { Link } from "react-router-dom";

type TabKey = "savings-card" | "patient-assistance" | "copay-assistance";

interface ProgramInfo {
  title: string;
  description: string;
  details: string[];
  eligibility: string[];
}

const SavingsAssistance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("savings-card");

  const savingsCardInfo: ProgramInfo = {
    title: "Diabetrix® Savings Card",
    description: "Get savings on your Diabetrix® prescription",
    details: [
      "Valid for up to 12 fills per year",
      "Available for commercially insured patients",
      "Easy to use at participating pharmacies",
      "No enrollment fees or restrictions",
    ],
    eligibility: [
      "Must have commercial insurance",
      "Not valid for Medicare, Medicaid, or other government programs",
      "Not valid for cash-paying patients",
      "Must be 18 years or older",
      "Valid in the United States only",
    ],
  };

  const patientAssistanceInfo: ProgramInfo = {
    title: "Patient Assistance Program",
    description:
      "Free medication for eligible patients who cannot afford their prescription",
    details: [
      "Free medication for eligible patients",
      "No income requirements for some programs",
      "Application assistance available",
      "Coverage for uninsured patients",
      "Support for Medicare patients",
    ],
    eligibility: [
      "Must be a US resident",
      "Must have a valid prescription",
      "Income requirements may apply",
      "Must demonstrate financial need",
      "Healthcare provider must complete application",
    ],
  };

  const copayAssistanceInfo: ProgramInfo = {
    title: "Copay Assistance Program",
    description: "Help with out-of-pocket costs for eligible patients",
    details: [
      "Assistance with copays and deductibles",
      "Available for commercially insured patients",
      "No income requirements",
      "Easy online application process",
      "Quick approval and activation",
    ],
    eligibility: [
      "Must have commercial insurance",
      "Not valid for Medicare, Medicaid, or other government programs",
      "Must be 18 years or older",
      "Valid prescription required",
      "US residents only",
    ],
  };

  const programs: Record<TabKey, ProgramInfo> = {
    "savings-card": savingsCardInfo,
    "patient-assistance": patientAssistanceInfo,
    "copay-assistance": copayAssistanceInfo,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center p-4 border-b border-gray-200">
          <Link to="/" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Savings & Assistance</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get help with the cost of your Diabetrix® prescription
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          {(Object.keys(programs) as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 mx-2 mb-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white hover:shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {programs[tab].title}
            </button>
          ))}
        </div>

        {/* Program Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {programs[activeTab].title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {programs[activeTab].description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Program Details */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Program Details
              </h3>
              <ul className="space-y-3">
                {programs[activeTab].details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-[#007bff] rounded-full mt-2"></div>
                    </div>
                    <p className="ml-3 text-gray-700">{detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Eligibility Requirements
              </h3>
              <ul className="space-y-3">
                {programs[activeTab].eligibility.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    </div>
                    <p className="ml-3 text-gray-700">{requirement}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/request-copay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Apply Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
              <button className="border-2 border-[#0077cc] text-[#0077cc] hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Download Application
              </button>
              <button className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How to Apply
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Download Application
              </h4>
              <p className="text-gray-600">
                Download and print the application form for your chosen program
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Complete Form
              </h4>
              <p className="text-gray-600">
                Fill out the application with your healthcare provider and
                include required documentation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Submit & Wait
              </h4>
              <p className="text-gray-600">
                Submit your application and wait for approval notification
              </p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-12">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Important Information
              </h3>
              <ul className="text-yellow-700 space-y-1">
                <li>
                  • Programs may have income restrictions and other eligibility
                  requirements
                </li>
                <li>
                  • Applications must be completed with your healthcare provider
                </li>
                <li>• Processing times may vary by program</li>
                <li>• Programs are subject to change or discontinuation</li>
                <li>
                  • Contact our support team for assistance with applications
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Need Help?
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Call Support</h4>
              <p className="text-gray-600 mb-3">
                Speak with a patient support specialist
              </p>
              <a
                href="tel:1-800-DIABETRIX"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                1-800-DIABETRIX
              </a>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Email Support
              </h4>
              <p className="text-gray-600 mb-3">
                Send us an email for assistance
              </p>
              <a
                href="mailto:support@diabetrix.com"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                support@diabetrix.com
              </a>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Additional Resources
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/"
              className="group block p-6 border border-gray-200 rounded-lg hover:border-green-600 hover:shadow-md transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  Patient Support
                </h4>
                <p className="text-gray-600 mt-2">
                  Get comprehensive support for your treatment journey
                </p>
              </div>
            </Link>
            <Link
              to="/"
              className="group block p-6 border border-gray-200 rounded-lg hover:border-green-600 hover:shadow-md transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  Side Effects
                </h4>
                <p className="text-gray-600 mt-2">
                  Learn about potential side effects and what to watch for
                </p>
              </div>
            </Link>
            <Link
              to="/"
              className="group block p-6 border border-gray-200 rounded-lg hover:border-green-600 hover:shadow-md transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  Prescribing Information
                </h4>
                <p className="text-gray-600 mt-2">
                  Download prescribing information and medication guides
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsAssistance;

