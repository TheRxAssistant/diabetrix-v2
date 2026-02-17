export interface PopupButton {
    text: string;
    action: string;
    icon?: string; // Optional icon class (e.g., 'fas fa-user-md')
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
};

// Onapgo theme config (based on rx-demo config)
const onapgoTheme: ThemeConfig = {
    domain: 'onapgo',
    brand_name: 'Onapgo',
    condition: `Parkinson's Disease`,
    logo: 'https://www.onapgo.com/sites/g/files/othskp1891/files/ONAPGO_LOGO_2025_RGB-DarkSlate%20(2).png',
    bg_color: '#ffffff',
    bg_image: '/onapgo-bg.png',
    primary_color: '#0F4C81',
    secondary_color: '#bcdaeb',
    tertiary_color: '#5cd695',
    text_color: '#1f2937',
    button_bg_color: '#ffffff',
    button_text_color: '#0F4C81',
    button_hover_color: '#f7fafc',
    icon_container_color: '#0F4C81',
    icon_container_text_color: '#ffffff',
    learn_overlay_bg: 'linear-gradient(135deg, rgba(15, 76, 129, 0.08) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(92, 214, 149, 0.04) 100%)',
    learn_overlay_title_gradient: 'linear-gradient(135deg, #0F4C81 0%, #5cd695 50%, #0F4C81 100%)',
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
