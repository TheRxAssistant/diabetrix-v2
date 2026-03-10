export interface PopupButton {
    text: string;
    action: string;
    icon?: string; // Optional icon class (e.g., 'fas fa-user-md')
}

// Home page content customization interfaces
export interface HomePageHeroConfig {
    bg_color?: string;
    bg_gradient?: string;
    text_color?: string;
    headline?: string;
    description?: string;
    hero_image?: string;
    header_links?: { label: string; url: string }[];
    cta_buttons?: { label: string; path: string; variant: 'primary' | 'secondary' | 'outline' }[];
}

export interface HomePageBenefitsConfig {
    bg_color?: string;
    heading_color?: string;
    body_color?: string;
    title?: string;
    subtitle?: string;
    features?: { title: string; description: string; icon?: string }[];
    cta_text?: string;
    cta_path?: string;
}

export interface HomePageTestimonialsConfig {
    bg_color?: string;
    heading_color?: string;
    body_color?: string;
    title?: string;
    subtitle?: string;
    testimonials?: { quote: string; name: string; descriptor: string; avatar_url?: string }[];
    disclaimer?: string;
}

export interface HomePageResourcesConfig {
    bg_color?: string;
    title?: string;
    subtitle?: string;
}

export interface HomePageCtaConfig {
    bg_color?: string;
    text_color?: string;
    title?: string;
    description?: string;
    buttons?: { label: string; path: string }[];
}

export interface HomePageConfig {
    hero?: HomePageHeroConfig;
    benefits?: HomePageBenefitsConfig;
    testimonials?: HomePageTestimonialsConfig;
    resources?: HomePageResourcesConfig;
    cta?: HomePageCtaConfig;
}

export interface ThemeConfig {
    domain: string;
    brand_name: string;
    condition?: string; // Medical condition (e.g., 'diabetes', 'obesity')
    logo?: string; // Optional logo image URL
    bg_color: string;
    bg_image?: string; // Optional background image URL
    primary_color: string;
    secondary_color: string;
    tertiary_color: string;
    text_color: string;
    button_bg_color: string;
    button_text_color: string;
    button_hover_color: string;
    icon_container_color: string;
    icon_container_text_color: string;
    learn_overlay_bg: string;
    learn_overlay_title_gradient: string;
    learn_question_card_border: string;
    learn_question_card_shadow: string;
    sidebar_active_color: string;
    header_bg_color: string;
    header_text_color: string;
    popup_btns?: PopupButton[]; // Optional array of popup buttons
    home_page?: HomePageConfig;
}

// Default theme config
const defaultTheme: ThemeConfig = {
    domain: 'default',
    brand_name: 'Diabetrix',
    condition: 'diabetes',
    logo: '/assets/images/diabetrix_logo_2.png',
    bg_color: '#ffffff',
    primary_color: '#0078D4',
    secondary_color: '#006bb3',
    tertiary_color: '#005a9e',
    text_color: '#1f2937',
    button_bg_color: '#0078D4',
    button_text_color: '#ffffff',
    button_hover_color: '#006bb3',
    icon_container_color: '#0078D4',
    icon_container_text_color: '#ffffff',
    learn_overlay_bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(139, 92, 246, 0.04) 100%)',
    learn_overlay_title_gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
    learn_question_card_border: 'rgba(59, 130, 246, 0.3)',
    learn_question_card_shadow: '0 4px 20px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
    sidebar_active_color: '#0078D4',
    header_bg_color: '#ffffff',
    header_text_color: '#0078D4',
    popup_btns: [
        { text: 'Find/Schedule Doctor', action: 'doctor', icon: 'fas fa-user-md' },
        { text: 'Cost Support / Insurance Help', action: 'insurance', icon: 'fas fa-hand-holding-usd' },
        { text: 'Find In-Stock Pharmacy', action: 'pharmacy', icon: 'fas fa-map-marker-alt' },
        { text: 'Learn About Diabetrix', action: 'learn', icon: 'fas fa-book-medical' },
        { text: 'Talk to Live Concierge', action: 'chat', icon: 'fas fa-headset' },
    ],
};

// GoodRx theme config
const goodrxTheme: ThemeConfig = {
    domain: 'goodrx',
    brand_name: 'GoodRx',
    condition: 'diabetes',
    logo: '/assets/images/diabetrix_logo_2.png', // TODO: Add GoodRx logo when available
    bg_color: '#f5f6f6',
    primary_color: '#fddb00',
    secondary_color: '#fddb00',
    tertiary_color: '#000000',
    text_color: '#000000',
    button_bg_color: '#ffffff',
    button_text_color: '#000000',
    button_hover_color: '#f7fafc',
    icon_container_color: '#fddb00',
    icon_container_text_color: '#000000',
    learn_overlay_bg: 'linear-gradient(135deg, rgba(253, 219, 0, 0.08) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(253, 219, 0, 0.04) 100%)',
    learn_overlay_title_gradient: 'linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%)',
    learn_question_card_border: 'rgba(253, 219, 0, 0.3)',
    learn_question_card_shadow: '0 4px 20px rgba(253, 219, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
    sidebar_active_color: '#fddb00',
    header_bg_color: '#ffffff',
    header_text_color: '#000000',
    popup_btns: [
        { text: 'Find/Schedule Doctor', action: 'doctor', icon: 'fas fa-user-md' },
        { text: 'Cost Support / Insurance Help', action: 'insurance', icon: 'fas fa-hand-holding-usd' },
        { text: 'Find In-Stock Pharmacy', action: 'pharmacy', icon: 'fas fa-map-marker-alt' },
        { text: 'Learn About Diabetrix', action: 'learn', icon: 'fas fa-book-medical' },
        { text: 'Talk to Live Concierge', action: 'chat', icon: 'fas fa-headset' },
    ],
    home_page: {
        hero: {
            bg_gradient: 'linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%)',
            text_color: '#ffffff',
            headline: 'Transform Your Diabetes Management with GoodRx',
            description: "A revolutionary once-daily oral treatment for adults with Type 2 Diabetes, designed to help achieve better glycemic control.",
            cta_buttons: [
                { label: 'Learn About GoodRx', path: 'medication-info', variant: 'primary' },
                { label: 'Patient Support', path: 'patient-support', variant: 'secondary' },
                { label: 'Take Knowledge Quiz', path: 'quiz', variant: 'outline' },
            ],
        },
        benefits: {
            title: 'A New Standard in Diabetes Care',
            subtitle: 'GoodRx helps adults with Type 2 Diabetes achieve better glycemic control with a convenient once-daily dosing regimen.',
            cta_text: 'Learn more about GoodRx benefits',
        },
        testimonials: {
            subtitle: 'Hear how GoodRx has helped people with Type 2 Diabetes take control of their condition.',
            disclaimer: '*Individual results may vary. These testimonials represent the experiences of specific individuals. Consult your healthcare provider to determine if GoodRx is right for you.',
        },
        resources: {
            title: 'Important Resources',
            subtitle: 'Access important information about GoodRx, including prescribing information, side effects, and patient assistance programs.',
        },
        cta: {
            title: 'Ready to Take Control of Your Type 2 Diabetes?',
            description: 'Talk to your healthcare provider to see if GoodRx is right for you.',
        },
    },
};

// Onapgo theme config - aligned with https://www.onapgo.com/
// Colors: navy (#0F4C81), teal accent (#2E8B8C), light blue (#bcdaeb), white
const onapgoTheme: ThemeConfig = {
    domain: 'onapgo',
    brand_name: 'Onapgo',
    condition: `Parkinson's Disease`,
    logo: 'https://www.onapgo.com/sites/g/files/othskp1891/files/ONAPGO_LOGO_2025_RGB-DarkSlate%20(2).png',
    bg_color: '#ffffff',
    bg_image: '/onapgo-bg.png',
    primary_color: '#0F4C81',
    secondary_color: '#2E8B8C',
    tertiary_color: '#5cd695',
    text_color: '#1f2937',
    button_bg_color: '#ffffff',
    button_text_color: '#0F4C81',
    button_hover_color: '#f7fafc',
    icon_container_color: '#0F4C81',
    icon_container_text_color: '#ffffff',
    learn_overlay_bg: 'linear-gradient(135deg, rgba(15, 76, 129, 0.08) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(46, 139, 140, 0.04) 100%)',
    learn_overlay_title_gradient: 'linear-gradient(135deg, #0F4C81 0%, #2E8B8C 50%, #0F4C81 100%)',
    learn_question_card_border: 'rgba(15, 76, 129, 0.3)',
    learn_question_card_shadow: '0 4px 20px rgba(15, 76, 129, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
    sidebar_active_color: '#0F4C81',
    header_bg_color: '#ffffff',
    header_text_color: '#0F4C81',
    popup_btns: [
        { text: 'Start My ONAPGO Journey', action: 'chat', icon: 'fas fa-rocket' },
        { text: 'Track My Therapy Status', action: 'chat', icon: 'fas fa-chart-line' },
        { text: 'Pump & Patch Support', action: 'chat', icon: 'fas fa-tools' },
        { text: 'Talk to My Care Team', action: 'chat', icon: 'fas fa-users' },
        { text: 'Insurance & Cost Help', action: 'chat', icon: 'fas fa-hand-holding-usd' },
    ],
    home_page: {
        hero: {
            bg_gradient: 'linear-gradient(135deg, #0F4C81 0%, #1a5f8a 40%, #2E8B8C 100%)',
            text_color: '#ffffff',
            headline: 'All-day off time control is possible with ONAPGO™',
            description: "ONAPGO, continuous apomorphine infusion, is for the treatment of motor fluctuations (OFF episodes) in adults with advanced Parkinson's disease (PD).",
            hero_image: '/images/diabetrixpeopleimage.png',
            cta_buttons: [
                { label: 'Learn About ONAPGO', path: 'medication-info', variant: 'primary' },
                { label: 'Patient Stories', path: 'patient-support', variant: 'secondary' },
                { label: 'Sign Up for Updates', path: 'patient-support', variant: 'outline' },
            ],
        },
        benefits: {
            bg_color: '#ffffff',
            heading_color: '#0F4C81',
            body_color: '#4b5563',
            title: 'Help make your days with Parkinson\'s more predictable',
            subtitle: 'In a clinical trial, ONAPGO provided more consistent control of OFF time. Continuous treatment with ONAPGO can help you achieve more predictable days.',
            features: [
                { title: 'Proven Results', description: 'In a clinical trial, ONAPGO provided more consistent control of OFF time. Help make your days with Parkinson\'s more predictable with less OFF time.', icon: 'chart' },
                { title: 'Continuous Treatment', description: 'ONAPGO provides continuous apomorphine infusion for the treatment of motor fluctuations in adults with advanced Parkinson\'s disease.', icon: 'beaker' },
                { title: 'The Circle of Care™ Program', description: 'Providing ongoing support for you and your care partner from the moment ONAPGO is prescribed.', icon: 'heart' },
            ],
            cta_text: 'Learn more about ONAPGO benefits',
            cta_path: 'medication-info',
        },
        testimonials: {
            bg_color: '#f0f9fa',
            heading_color: '#0F4C81',
            body_color: '#4b5563',
            title: 'Real Stories from Real Patients*',
            subtitle: 'Meet real people with Parkinson\'s who go ON with ONAPGO.',
            testimonials: [
                { quote: "With Parkinson's Disease, every day can be different. I needed more consistency. ONAPGO has helped make my days more predictable.", name: 'Susie', descriptor: 'Living with PD' },
                { quote: "The pump and patch support has made a real difference. I finally feel like I understand my therapy options.", name: 'Patricia K.', descriptor: 'Living with Parkinson\'s for 4 years' },
                { quote: "ONAPGO helped me navigate insurance and get the support I needed. The Circle of Care program has been invaluable.", name: 'David R.', descriptor: 'Living with Parkinson\'s for 10 years' },
            ],
            disclaimer: '*Individual results may vary. These testimonials represent the experiences of specific individuals. Consult your healthcare provider to determine if ONAPGO is right for you.',
        },
        resources: {
            bg_color: '#f0f9fa',
            title: 'Important Resources',
            subtitle: 'Access important information about ONAPGO, including prescribing information, patient information, instructions for use, and patient assistance programs.',
        },
        cta: {
            bg_color: '#0F4C81',
            text_color: '#ffffff',
            title: 'Stay in the know with ONAPGO™',
            description: 'Get the latest information on ONAPGO delivered right to your inbox. Sign up for updates.',
            buttons: [
                { label: 'Sign Up for Updates', path: 'patient-support' },
                { label: 'Patient Support Resources', path: 'patient-support' },
            ],
        },
    },
};

// Theme config dictionary mapping pathnames to config objects
export const themeConfig: Record<string, ThemeConfig> = {
    '/goodrx': goodrxTheme,
    '/onapgo': onapgoTheme,
};

/**
 * Get theme config based on pathname
 * @param pathname - The current pathname (e.g., '/goodrx', '/onapgo', '/goodrx/crm/patients')
 * @returns ThemeConfig object, falls back to default if no match found
 */
export function getThemeConfig(pathname: string): ThemeConfig {
    // Normalize pathname (remove trailing slash)
    const normalizedPathname = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

    // Extract the first segment of the pathname
    const segments = normalizedPathname.split('/').filter(Boolean);
    const firstSegment = segments.length > 0 ? `/${segments[0]}` : '/';

    // Debug logging
    console.log('getThemeConfig - pathname:', pathname);
    console.log('getThemeConfig - normalizedPathname:', normalizedPathname);
    console.log('getThemeConfig - segments:', segments);
    console.log('getThemeConfig - firstSegment:', firstSegment);
    console.log('getThemeConfig - themeConfig keys:', Object.keys(themeConfig));
    console.log('getThemeConfig - match found:', !!themeConfig[firstSegment]);

    // Check if we have a config for this domain
    if (themeConfig[firstSegment]) {
        console.log('getThemeConfig - returning theme:', themeConfig[firstSegment].domain);
        return themeConfig[firstSegment];
    }

    // Fallback to default theme
    console.log('getThemeConfig - returning default theme');
    return defaultTheme;
}

/**
 * Get brand name from theme config - shows domain if present, else shows 'diabetrix'
 * @param themeConfig - ThemeConfig object
 * @returns Brand name string
 */
export function getBrandName(themeConfig: ThemeConfig): string {
    // If domain is not 'default', use the brand_name from theme config
    // Otherwise, fallback to 'diabetrix'
    return themeConfig.domain !== 'default' ? themeConfig.brand_name : 'diabetrix';
}

/**
 * Get domain value from theme config - shows domain if present, else shows 'diabetrix'
 * @param themeConfig - ThemeConfig object
 * @returns Domain string
 */
export function getDomain(themeConfig: ThemeConfig): string {
    // If domain is not 'default', use the domain from theme config
    // Otherwise, fallback to 'diabetrix'
    return themeConfig.domain !== 'default' ? themeConfig.domain : 'diabetrix';
}

/**
 * Get condition from theme config - returns condition if present, else 'diabetes'
 * @param themeConfig - ThemeConfig object
 * @returns Condition string
 */
export function getCondition(themeConfig: ThemeConfig): string {
    return themeConfig.condition || 'diabetes';
}

/**
 * Get logo from theme config - returns logo if present, else default Diabetrix logo
 * @param themeConfig - ThemeConfig object
 * @returns Logo URL string
 */
export function getLogo(themeConfig: ThemeConfig): string {
    return themeConfig.logo || '/assets/images/diabetrix_logo_2.png';
}

// Default home page content (Diabetrix) - used when theme does not override
const defaultHomePageHero: HomePageHeroConfig = {
    bg_gradient: 'linear-gradient(135deg, #0066cc 0%, #0077cc 50%, #0099dd 100%)',
    text_color: '#ffffff',
    headline: 'Transform Your Diabetes Management with Diabetrix®',
    description: "A revolutionary once-daily oral treatment for adults with Type 2 Diabetes, designed to help achieve better glycemic control.",
    hero_image: '/images/diabetrixpeopleimage.png',
    header_links: [
        { label: 'Benefits Check', url: 'https://drive.google.com/file/d/1XXdfzRJJS8K1bRUNeELMK5112CcGlcec/view?usp=sharing&t=71' },
        { label: 'Copay Automation', url: 'https://drive.google.com/file/d/1HD1hCvCIhPYZAj4EYkEcsRX4hiHlj6Ry/view?usp=sharing&t=132' },
        { label: 'Scheduling Appointment', url: 'https://drive.google.com/file/d/1UUlSyi_Oiixq13nDQOhM5BUesM7hIU7B/view?usp=sharing' },
        { label: 'Find Stock Call', url: 'https://drive.google.com/file/d/1HB9heWTV9oPJoTTpVmZ5Lm-QsQ8avD92/view' },
    ],
    cta_buttons: [
        { label: 'Learn About Diabetrix®', path: 'medication-info', variant: 'primary' },
        { label: 'Patient Support', path: 'patient-support', variant: 'secondary' },
        { label: 'Take Knowledge Quiz', path: 'quiz', variant: 'outline' },
    ],
};

const defaultHomePageBenefits: HomePageBenefitsConfig = {
    bg_color: '#ffffff',
    heading_color: undefined, // uses primary
    body_color: '#4b5563',
    title: 'A New Standard in Diabetes Care',
    subtitle: 'Diabetrix® (metformelate) helps adults with Type 2 Diabetes achieve better glycemic control with a convenient once-daily dosing regimen.',
    features: [
        { title: 'Improved Glycemic Control', description: "In clinical trials, Diabetrix® demonstrated significant reductions in HbA1c compared to placebo, helping patients reach their glycemic goals.", icon: 'chart' },
        { title: 'Once-Daily Convenience', description: 'A simple once-daily oral tablet that fits easily into your routine, helping to simplify your diabetes management.', icon: 'beaker' },
        { title: 'Well-Studied Safety Profile', description: 'Backed by extensive clinical research and built on the foundation of trusted diabetes treatments.', icon: 'heart' },
    ],
    cta_text: 'Learn more about Diabetrix® benefits',
    cta_path: 'medication-info',
};

const defaultHomePageTestimonials: HomePageTestimonialsConfig = {
    bg_color: '#f9fafb',
    heading_color: undefined,
    body_color: '#4b5563',
    title: 'Real Stories from Real Patients*',
    subtitle: 'Hear how Diabetrix® has helped people with Type 2 Diabetes take control of their condition.',
    testimonials: [
        { quote: "Since starting Diabetrix®, my blood sugar levels have been more consistent, and I feel like I have more energy throughout the day. It's been a real game-changer for me.", name: 'Michael T.', descriptor: 'Living with T2D for 8 years' },
        { quote: "What I appreciate most is the once-daily dosing. It fits perfectly into my morning routine, and I don't have to worry about taking multiple pills throughout the day.", name: 'Sarah L.', descriptor: 'Living with T2D for 5 years' },
        { quote: "After discussing with my doctor, we decided to try Diabetrix®. My A1C has improved significantly, and I've experienced fewer spikes in my glucose levels.", name: 'Robert J.', descriptor: 'Living with T2D for 12 years' },
    ],
    disclaimer: '*Individual results may vary. These testimonials represent the experiences of specific individuals. Consult your healthcare provider to determine if Diabetrix® is right for you.',
};

const defaultHomePageResources: HomePageResourcesConfig = {
    bg_color: '#f9fafb',
    title: 'Important Resources',
    subtitle: 'Access important information about Diabetrix®, including prescribing information, side effects, and patient assistance programs.',
};

const defaultHomePageCta: HomePageCtaConfig = {
    bg_color: undefined, // uses primary_color
    text_color: '#ffffff',
    title: 'Ready to Take Control of Your Type 2 Diabetes?',
    description: 'Talk to your healthcare provider to see if Diabetrix® is right for you.',
    buttons: [
        { label: 'Learn More', path: 'medication-info' },
        { label: 'Patient Support Resources', path: 'patient-support' },
    ],
};

/**
 * Get merged home page config - theme overrides merged with default Diabetrix content
 * @param themeConfig - ThemeConfig object
 * @returns HomePageConfig with all sections populated
 */
export function getHomePageConfig(themeConfig: ThemeConfig): Required<HomePageConfig> {
    const hp = themeConfig.home_page;

    const hero: HomePageHeroConfig = {
        ...defaultHomePageHero,
        ...hp?.hero,
        header_links: defaultHomePageHero.header_links,
        cta_buttons: hp?.hero?.cta_buttons ?? defaultHomePageHero.cta_buttons,
    };

    // Replace {brand} placeholder in defaults when theme overrides use it
    const benefits: HomePageBenefitsConfig = {
        ...defaultHomePageBenefits,
        ...hp?.benefits,
        features: hp?.benefits?.features ?? defaultHomePageBenefits.features,
    };

    const testimonials: HomePageTestimonialsConfig = {
        ...defaultHomePageTestimonials,
        ...hp?.testimonials,
        testimonials: hp?.testimonials?.testimonials ?? defaultHomePageTestimonials.testimonials,
    };

    const resources: HomePageResourcesConfig = {
        ...defaultHomePageResources,
        ...hp?.resources,
    };

    const cta: HomePageCtaConfig = {
        ...defaultHomePageCta,
        ...hp?.cta,
        buttons: hp?.cta?.buttons ?? defaultHomePageCta.buttons,
    };

    return { hero, benefits, testimonials, resources, cta };
}
