import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getThemeConfig, ThemeConfig } from '../config/theme-config';

/**
 * Custom hook to get theme configuration based on current pathname
 * Extracts domain from URL pathname and returns corresponding theme config
 * 
 * @returns ThemeConfig object for the current domain
 */
export function useThemeConfig(): ThemeConfig {
    const location = useLocation();
    
    const themeConfig = useMemo(() => {
        return getThemeConfig(location.pathname);
    }, [location.pathname]);
    
    return themeConfig;
}
