/**
 * Utility functions for detecting and handling media URLs
 */

/**
 * Check if a URL is a video file
 */
export function isVideoUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v'];
    const videoMimeTypes = ['video/', 'application/vnd.apple.mpegurl'];
    
    try {
        const urlLower = url.toLowerCase();
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        
        // Check file extension
        if (videoExtensions.some(ext => pathname.endsWith(ext))) {
            return true;
        }
        
        // Check for video hosting domains
        const videoHosts = [
            'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
            'twitch.tv', 'facebook.com/watch', 'instagram.com/reel',
            'tiktok.com', 'streamable.com', 'wistia.com'
        ];
        
        if (videoHosts.some(host => urlLower.includes(host))) {
            return true;
        }
        
        // Check query params for video indicators
        if (urlObj.searchParams.has('v') || urlObj.searchParams.has('video')) {
            return true;
        }
    } catch {
        // Invalid URL, check if it contains video keywords
        const urlLower = url.toLowerCase();
        return videoExtensions.some(ext => urlLower.includes(ext)) ||
               videoMimeTypes.some(mime => urlLower.includes(mime));
    }
    
    return false;
}

/**
 * Check if a URL is an image file
 */
export function isImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif'];
    const imageMimeTypes = ['image/'];
    
    try {
        const urlLower = url.toLowerCase();
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        
        // Check file extension
        if (imageExtensions.some(ext => pathname.endsWith(ext))) {
            return true;
        }
        
        // Check for image hosting domains
        const imageHosts = [
            'imgur.com', 'flickr.com', 'unsplash.com', 'pexels.com',
            'pixabay.com', 'cloudinary.com', 's3.amazonaws.com'
        ];
        
        if (imageHosts.some(host => urlLower.includes(host))) {
            return true;
        }
    } catch {
        // Invalid URL, check if it contains image keywords
        const urlLower = url.toLowerCase();
        return imageExtensions.some(ext => urlLower.includes(ext)) ||
               imageMimeTypes.some(mime => urlLower.includes(mime));
    }
    
    return false;
}

/**
 * Extract URLs from text/markdown content
 */
export function extractUrls(text: string): string[] {
    if (!text) return [];
    
    // Match URLs in markdown links [text](url) and plain URLs
    const urlRegex = /(?:https?:\/\/[^\s\)]+|\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\))/g;
    const urls: string[] = [];
    let match;
    
    while ((match = urlRegex.exec(text)) !== null) {
        // If it's a markdown link, use the URL part
        if (match[2]) {
            urls.push(match[2]);
        } else {
            urls.push(match[0]);
        }
    }
    
    return urls;
}

/**
 * Get YouTube embed URL from various YouTube URL formats
 */
export function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    
    try {
        const urlObj = new URL(url);
        let videoId: string | null = null;
        
        // youtube.com/watch?v=VIDEO_ID
        if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
            videoId = urlObj.searchParams.get('v');
        }
        // youtube.com/shorts/VIDEO_ID
        else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/shorts/')) {
            videoId = urlObj.pathname.split('/shorts/')[1]?.split('?')[0] || null;
        }
        // youtu.be/VIDEO_ID
        else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1).split('?')[0];
        }
        // youtube.com/embed/VIDEO_ID
        else if (urlObj.pathname.includes('/embed/')) {
            videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0] || null;
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch {
        // Invalid URL
    }
    
    return null;
}

/**
 * Get Vimeo embed URL from Vimeo URL
 */
export function getVimeoEmbedUrl(url: string): string | null {
    if (!url) return null;
    
    try {
        const urlObj = new URL(url);
        
        if (urlObj.hostname.includes('vimeo.com')) {
            const videoId = urlObj.pathname.split('/').filter(Boolean).pop();
            if (videoId) {
                return `https://player.vimeo.com/video/${videoId}`;
            }
        }
    } catch {
        // Invalid URL
    }
    
    return null;
}
