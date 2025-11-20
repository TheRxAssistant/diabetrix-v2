export interface ServiceContent {
    title: string;
    subtitle: string;
    icon: string;
    benefit: string;
    stats?: string;
    animation: string;
}

export const serviceContents: Record<string, ServiceContent> = {
    doctor: {
        title: 'Find Your Perfect Doctor',
        subtitle: "We've found 47 diabetes specialists in your area accepting new patients",
        icon: 'fas fa-user-md',
        benefit: 'Get matched with top-rated endocrinologists near you',
        stats: '• 15 doctors within 5 miles\n• Average rating: 4.8/5 stars\n• Next available: Tomorrow',
        animation: 'doctor',
    },
    insurance: {
        title: 'Maximize Your Coverage',
        subtitle: 'Save up to $2,400/year with personalized insurance assistance',
        icon: 'fas fa-hand-holding-usd',
        benefit: 'Get help with prior authorizations and copay assistance',
        stats: '• Average savings: $200/month\n• 94% approval rate\n• Fast-track processing',
        animation: 'insurance',
    },
    pharmacy: {
        title: 'Find In-Stock Pharmacies',
        subtitle: '8 pharmacies near you have Diabetrix® in stock right now',
        icon: 'fas fa-map-marker-alt',
        benefit: 'Skip the waiting - get your medication today',
        stats: '• Real-time inventory\n• Best prices guaranteed\n• Free delivery available',
        animation: 'pharmacy',
    },
    learn: {
        title: 'Personalized Diabetrix® Guide',
        subtitle: 'Get custom information based on your health profile',
        icon: 'fas fa-capsules',
        benefit: 'Tailored guidance for your diabetes management',
        stats: '• Dosage calculator\n• Side effect tracker\n• Progress monitoring',
        animation: 'learn',
    },
    chat: {
        title: 'Priority Support Access',
        subtitle: 'Skip the queue - connect with Alex in under 30 seconds',
        icon: 'fas fa-headset',
        benefit: 'Get instant answers from our diabetes specialists',
        stats: '• Average response: 15 seconds\n• 24/7 availability\n• Expert certified team',
        animation: 'chat',
    },
};

