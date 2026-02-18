import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import BookAppointment from './pages/BookAppointment';
import RequestCopay from './pages/RequestCopay';
import SavingsAssistance from './pages/SavingsAssistance';
import FindDoctor from './pages/FindDoctor';
import MedicationInfo from './pages/MedicationInfo';
import PatientSupport from './pages/PatientSupport';
import Quiz from './pages/Quiz';
import Campaigns from './crm/pages/Campaigns';
import Patients from './crm/pages/Patients';
import PatientJourney from './crm/pages/PatientJourney';
import Analytics from './crm/pages/Analytics';
import ProtectedRoute from './crm/components/ProtectedRoute';
import { useThemeConfig } from './hooks/useThemeConfig';
import { getBrandName } from './config/theme-config';

// Component to handle background image application - must be inside BrowserRouter
function BackgroundImageHandler() {
    const themeConfig = useThemeConfig();

    useEffect(() => {
        // Debug logging
        console.log('BackgroundImageHandler - pathname:', window.location.pathname);
        console.log('BackgroundImageHandler - themeConfig:', themeConfig);
        console.log('BackgroundImageHandler - bg_image:', themeConfig.bg_image);

        // Create or get style element - use a more persistent approach
        let styleElement = document.getElementById('theme-background-style') as HTMLStyleElement;

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'theme-background-style';
            // Insert at the end of head to ensure it has high specificity
            document.head.appendChild(styleElement);
        }

        if (themeConfig.bg_image) {
            // Inject CSS with !important to override Tailwind and any other styles
            // Apply to both html and body to ensure it shows
            // Use a more specific selector to ensure it persists
            const imageUrl = themeConfig.bg_image.startsWith('/') 
                ? themeConfig.bg_image 
                : `/${themeConfig.bg_image}`;
            
            const css = `
                html {
                    background-image: url(${imageUrl}) !important;
                    background-size: cover !important;
                    background-position: center !important;
                    background-repeat: no-repeat !important;
                    background-attachment: fixed !important;
                    background-color: transparent !important;
                    min-height: 100vh !important;
                }
                body {
                    background-image: url(${imageUrl}) !important;
                    background-size: cover !important;
                    background-position: center !important;
                    background-repeat: no-repeat !important;
                    background-attachment: fixed !important;
                    background-color: transparent !important;
                    min-height: 100vh !important;
                }
                /* Ensure background persists even when body styles are modified */
                body[style*="position"] {
                    background-image: url(${imageUrl}) !important;
                    background-size: cover !important;
                    background-position: center !important;
                    background-repeat: no-repeat !important;
                    background-attachment: fixed !important;
                }
            `;
            styleElement.textContent = css;
            console.log('BackgroundImageHandler - Style tag created with CSS:', css);
            console.log('BackgroundImageHandler - Image URL:', imageUrl);
            
            // Also set inline styles as backup (though style tag should work)
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                document.body.style.setProperty('background-image', `url(${imageUrl})`, 'important');
                document.body.style.setProperty('background-size', 'cover', 'important');
                document.body.style.setProperty('background-position', 'center', 'important');
                document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
                document.body.style.setProperty('background-attachment', 'fixed', 'important');
                console.log('BackgroundImageHandler - Inline styles applied');
                
                // Check computed styles
                const computedStyle = window.getComputedStyle(document.body);
                console.log('BackgroundImageHandler - Computed background-image:', computedStyle.backgroundImage);
                console.log('BackgroundImageHandler - Computed background-size:', computedStyle.backgroundSize);
                console.log('BackgroundImageHandler - Computed background-color:', computedStyle.backgroundColor);
                
                // Verify image exists
                const img = new Image();
                img.onload = () => console.log('BackgroundImageHandler - Image loaded successfully:', imageUrl);
                img.onerror = () => console.error('BackgroundImageHandler - Image failed to load:', imageUrl);
                img.src = imageUrl;
            });
        } else {
            // Only clear if explicitly no bg_image (not on unmount)
            styleElement.textContent = '';
            document.body.style.removeProperty('background-image');
            document.body.style.removeProperty('background-size');
            document.body.style.removeProperty('background-position');
            document.body.style.removeProperty('background-repeat');
            document.body.style.removeProperty('background-attachment');
        }

        // Don't cleanup on unmount - let it persist
        return () => {
            // Intentionally empty - we want the background to persist
        };
    }, [themeConfig.bg_image]);

    // Re-apply background after modal interactions to ensure it persists
    useEffect(() => {
        if (!themeConfig.bg_image) return;

        const reapplyBackground = () => {
            // Check if background is still set, if not, reapply it
            const currentBg = window.getComputedStyle(document.body).backgroundImage;
            if (!currentBg || currentBg === 'none' || !currentBg.includes(themeConfig.bg_image!)) {
                requestAnimationFrame(() => {
                    document.body.style.setProperty('background-image', `url(${themeConfig.bg_image})`, 'important');
                    document.body.style.setProperty('background-size', 'cover', 'important');
                    document.body.style.setProperty('background-position', 'center', 'important');
                    document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
                    document.body.style.setProperty('background-attachment', 'fixed', 'important');
                });
            }
        };

        // Re-apply on various events that might indicate modal close or style changes
        window.addEventListener('focus', reapplyBackground);
        // Use a MutationObserver to watch for style changes on body
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Small delay to let other code finish modifying styles
                    setTimeout(reapplyBackground, 100);
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style'],
        });

        return () => {
            window.removeEventListener('focus', reapplyBackground);
            observer.disconnect();
        };
    }, [themeConfig.bg_image]);

    return null;
}

// Component to handle document title updates based on theme config
function DocumentTitleHandler() {
    const themeConfig = useThemeConfig();

    useEffect(() => {
        const brandName = getBrandName(themeConfig);
        const capitalizedBrandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
        document.title = `${capitalizedBrandName}`;
    }, [themeConfig]);

    return null;
}

function AppRoutes() {
    return (
        <>
            <BackgroundImageHandler />
            <DocumentTitleHandler />
            <Routes>
                {/* Routes with domain prefixes */}
                <Route path="/:domain">
                    <Route path="book-appointment" element={<BookAppointment />} />
                    <Route path="request-copay" element={<RequestCopay />} />
                    <Route path="savings-assistance" element={<SavingsAssistance />} />
                    <Route path="find-doctor" element={<FindDoctor />} />
                    <Route path="medication-info" element={<MedicationInfo />} />
                    <Route path="patient-support" element={<PatientSupport />} />
                    <Route path="quiz" element={<Quiz />} />
                    <Route path="crm" element={<ProtectedRoute />}>
                        <Route index element={<Navigate to="patients" replace />} />
                        <Route path="marketing/campaigns" element={<Campaigns />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="patients" element={<Patients />} />
                        <Route path="patients/journey" element={<PatientJourney />} />
                    </Route>
                    <Route index element={<Home />} />
                </Route>

                {/* Default routes without domain prefix */}
                <Route path="/" element={<Home />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/request-copay" element={<RequestCopay />} />
                <Route path="/savings-assistance" element={<SavingsAssistance />} />
                <Route path="/find-doctor" element={<FindDoctor />} />
                <Route path="/medication-info" element={<MedicationInfo />} />
                <Route path="/patient-support" element={<PatientSupport />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/crm" element={<ProtectedRoute />}>
                    <Route index element={<Navigate to="/crm/patients" replace />} />
                    <Route path="marketing/campaigns" element={<Campaigns />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="patients" element={<Patients />} />
                    <Route path="patients/journey" element={<PatientJourney />} />
                </Route>
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
