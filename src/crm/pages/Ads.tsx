import React from 'react';
import { useSearchParams } from 'react-router-dom';

const XDEMVY_STAGE_URL = 'https://xdemvy-stage.healthbackend.com';
const XDEMVY_LOCALHOST_URL = 'http://localhost:5173';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

const DEFAULT_UTM = {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'promo_cmp',
    utm_content: 'ad_variant_a',
} as const;

function getXdemvyBaseUrl(): string {
    const envUrl = import.meta.env.VITE_XDEMVY_EMBED_URL;
    if (envUrl) return envUrl;
    return window.location.hostname === 'localhost' ? XDEMVY_LOCALHOST_URL : XDEMVY_STAGE_URL;
}

function getXdemvyRedirectUrl(isChatOpen: boolean, utmTerm: string, currentSearch: string): string {
    const baseUrl = getXdemvyBaseUrl();
    const params = new URLSearchParams();
    params.set('is_chat_open', isChatOpen ? 'true' : 'false');
    params.set('utm_source', DEFAULT_UTM.utm_source);
    params.set('utm_medium', DEFAULT_UTM.utm_medium);
    params.set('utm_campaign', DEFAULT_UTM.utm_campaign);
    params.set('utm_term', utmTerm);
    params.set('utm_content', DEFAULT_UTM.utm_content);

    const currentParams = new URLSearchParams(currentSearch);
    UTM_KEYS.forEach((key) => {
        const value = currentParams.get(key);
        if (value) params.set(key, value);
    });

    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
}

export default function AdsPage() {
    const [searchParams] = useSearchParams();
    const currentSearch = window.location.search || (searchParams.toString() ? `?${searchParams.toString()}` : '');

    const urlWithChatOpen = getXdemvyRedirectUrl(true, 'chat', currentSearch);
    const urlWithChatClosed = getXdemvyRedirectUrl(false, 'learn more', currentSearch);

    const handleAdClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-[#f5f3f0]">
            <header className="sticky top-0 z-50 flex items-center justify-between px-8 h-16 shadow-md border-b border-[#98482E]/20" style={{ backgroundColor: '#98482E' }}>
                <div className="flex items-center gap-4">
                    <img
                        src="https://xdemvy.com/themes/custom/heller/logo.svg"
                        alt="Xdemvy"
                        className="h-9 w-auto"
                    />
                    <span className="text-white/70 text-sm">|</span>
                    <h1 className="text-lg font-semibold text-white tracking-tight m-0">Xdemvy Ads</h1>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-6 py-10 md:py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    {/* Ad 1: Xdemvy Social Post creative */}
                    <button
                        type="button"
                        onClick={() => handleAdClick(urlWithChatOpen)}
                        className="group w-full text-left bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#98482E]/40 focus-visible:ring-offset-2"
                    >
                        <div className="aspect-[4/3] min-h-[320px] md:min-h-[380px] bg-neutral-100 flex items-center justify-center overflow-hidden">
                            <img
                                src="/ads/xdemvy-social-post.png"
                                alt="Xdemvy Social Post"
                                className="w-full h-full object-cover object-center"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.nextElementSibling) return;
                                    const fallback = document.createElement('div');
                                    fallback.className = 'text-neutral-500 text-center p-6';
                                    fallback.textContent = 'Xdemvy Social Post — Click to visit';
                                    target.parentNode?.appendChild(fallback);
                                }}
                            />
                        </div>
                        <div className="px-5 py-4 border-t border-neutral-100">
                            <span className="text-sm font-medium text-neutral-600 group-hover:text-[#98482E] transition-colors">Xdemvy Social Post</span>
                        </div>
                    </button>

                    {/* Ad 2: Learn more */}
                    <button
                        type="button"
                        onClick={() => handleAdClick(urlWithChatOpen)}
                        className="group w-full text-left bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#98482E]/40 focus-visible:ring-offset-2"
                    >
                        <div className="aspect-[4/3] min-h-[320px] md:min-h-[380px] bg-neutral-100 flex items-center justify-center overflow-hidden">
                            <img
                                src="/ads/learn-more.png"
                                alt="Learn more about Xdemvy"
                                className="w-full h-full object-cover object-center"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.nextElementSibling) return;
                                    const fallback = document.createElement('div');
                                    fallback.className = 'text-neutral-500 text-center p-6';
                                    fallback.textContent = 'Learn more — Click to visit';
                                    target.parentNode?.appendChild(fallback);
                                }}
                            />
                        </div>
                        <div className="px-5 py-4 border-t border-neutral-100">
                            <span className="text-sm font-medium text-neutral-600 group-hover:text-[#98482E] transition-colors">Learn more</span>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
}
