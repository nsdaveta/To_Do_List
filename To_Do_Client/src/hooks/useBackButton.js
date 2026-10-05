import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { listen } from '@tauri-apps/api/event';

const useBackButton = () => {
    const location = useLocation();
    const lastPressTime = useRef(0);
    // Use a ref to always have the latest pathname without re-registering the listener
    const locationRef = useRef(location.pathname);

    // Keep the ref in sync with the current route
    useEffect(() => {
        locationRef.current = location.pathname;
    }, [location.pathname]);

    // Register the listener ONCE on mount only
    useEffect(() => {
        const handleBackButton = () => {
            const currentPath = locationRef.current;
            const rootPaths = ['/'];

            if (rootPaths.includes(currentPath)) {
                const currentTime = Date.now();
                if (currentTime - lastPressTime.current < 2000) {
                    // Double-tap within 2 seconds → exit the app
                    if (window.__TAURI__) {
                        window.close();
                    }
                } else {
                    lastPressTime.current = currentTime;
                    toast.info('Press back again to exit', {
                        position: 'bottom-center',
                        autoClose: 2000,
                        hideProgressBar: true,
                    });
                }
            } else {
                // On any non-root page, go back
                window.history.back();
            }
        };

        let unlistenTauri;
        const setupTauriListener = async () => {
            if (window.__TAURI__) {
                try {
                    unlistenTauri = await listen('tauri://back-button', handleBackButton);
                } catch (error) {
                    console.error('Failed to setup Tauri back button listener:', error);
                }
            }
        };
        setupTauriListener();

        return () => {
            if (unlistenTauri && typeof unlistenTauri === 'function') {
                unlistenTauri();
            }
        };
    }, []); // Empty deps: register once, refs handle dynamic values
};

export default useBackButton;
