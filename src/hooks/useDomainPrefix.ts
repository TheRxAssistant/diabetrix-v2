import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to get domain prefix from current URL pathname
 * Returns the domain prefix (e.g., '/goodrx', '/onapgo') if present, otherwise empty string
 * 
 * @returns Domain prefix string (e.g., '/goodrx' or '')
 */
export function useDomainPrefix(): string {
    const location = useLocation();
    
    const domainPrefix = useMemo(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        // Check if first segment is a domain (goodrx, onapgo, etc.)
        if (pathSegments.length > 0 && ['goodrx', 'onapgo'].includes(pathSegments[0])) {
            return `/${pathSegments[0]}`;
        }
        return '';
    }, [location.pathname]);
    
    return domainPrefix;
}
