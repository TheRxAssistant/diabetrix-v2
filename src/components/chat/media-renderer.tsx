import React, { useState } from 'react';
import { isVideoUrl, isImageUrl, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '../../lib/media-utils';
import { Play, X } from 'lucide-react';
import Button from '../../crm/components/ui/Button';

interface MediaRendererProps {
    url: string;
    className?: string;
    alt?: string;
}

/**
 * Component that renders media (video/image) from URLs
 */
export const MediaRenderer: React.FC<MediaRendererProps> = ({ url, className, alt }) => {
    const [error, setError] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);

    if (!url) return null;

    // Check for YouTube
    const youtubeEmbed = getYouTubeEmbedUrl(url);
    if (youtubeEmbed) {
        return (
            <div className={`my-2 rounded-lg overflow-hidden ${className || ''}`}>
                {showPlayer ? (
                    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                        <iframe src={youtubeEmbed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube video player" />
                        <Button type="text" size="small" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1" onClick={() => setShowPlayer(false)}>
                            <X size={16} />
                        </Button>
                    </div>
                ) : (
                    <div className="relative w-full cursor-pointer group" style={{ aspectRatio: '16/9' }} onClick={() => setShowPlayer(true)}>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                            <div className="text-center text-white">
                                <Play className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="currentColor" />
                                <p className="text-sm font-medium">Click to play YouTube video</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Check for Vimeo
    const vimeoEmbed = getVimeoEmbedUrl(url);
    if (vimeoEmbed) {
        return (
            <div className={`my-2 rounded-lg overflow-hidden ${className || ''}`}>
                {showPlayer ? (
                    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                        <iframe src={vimeoEmbed} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Vimeo video player" />
                        <Button type="text" size="small" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1" onClick={() => setShowPlayer(false)}>
                            <X size={16} />
                        </Button>
                    </div>
                ) : (
                    <div className="relative w-full cursor-pointer group" style={{ aspectRatio: '16/9' }} onClick={() => setShowPlayer(true)}>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <div className="text-center text-white">
                                <Play className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="currentColor" />
                                <p className="text-sm font-medium">Click to play Vimeo video</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Check if it's a video URL
    if (isVideoUrl(url)) {
        return (
            <div className={`my-2 rounded-lg overflow-hidden ${className || ''}`}>
                {showPlayer ? (
                    <div className="relative w-full">
                        <video src={url} controls className="w-full max-w-full rounded-lg" onError={() => setError(true)}>
                            Your browser does not support the video tag.
                        </video>
                        <Button type="text" size="small" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1" onClick={() => setShowPlayer(false)}>
                            <X size={16} />
                        </Button>
                    </div>
                ) : (
                    <div className="relative w-full cursor-pointer group" onClick={() => setShowPlayer(true)}>
                        <div className="bg-gray-900 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
                            <div className="text-center text-white">
                                <Play className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="currentColor" />
                                <p className="text-sm font-medium">Click to play video</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Check if it's an image URL
    if (isImageUrl(url)) {
        if (error) {
            return (
                <div className={`my-2 p-4 bg-gray-100 rounded-lg text-sm text-gray-500 ${className || ''}`}>
                    Failed to load image:{' '}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {url}
                    </a>
                </div>
            );
        }

        return (
            <div className={`my-2 rounded-lg overflow-hidden ${className || ''}`}>
                <img src={url} alt={alt || 'Image'} className="w-full max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onError={() => setError(true)} onClick={() => window.open(url, '_blank')} />
            </div>
        );
    }

    // Not a media URL, return null (will be handled as regular link)
    return null;
};
