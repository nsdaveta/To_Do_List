/**
 * Robust Connectivity Check Utility
 * Used to verify actual server reachability before triggering offline states.
 */

async function checkActualConnectivity(targetUrl) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        
        // Mode no-cors is used to allow opaque responses from servers that don't allow CORS for HEAD
        await fetch(targetUrl, { 
            method: 'HEAD', 
            mode: 'no-cors', 
            cache: 'no-store',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return true;
    } catch (e) {
        // Fallback check to a reliable global endpoint
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            await fetch('https://www.google.com/favicon.ico', { 
                method: 'HEAD', 
                mode: 'no-cors', 
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return true;
        } catch (e2) {
            return false;
        }
    }
}

function initConnectivityTracker(targetUrl, offlinePage = 'offline.html') {
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) return;

    window.addEventListener('offline', () => {
        // Wait 2000ms to confirm the offline state is persistent
        setTimeout(async () => {
            if (navigator.onLine === false) {
                const isOnline = await checkActualConnectivity(targetUrl);
                if (!isOnline) {
                    console.log('Confirmed truly offline. Redirecting to:', offlinePage);
                    window.location.href = offlinePage;
                } else {
                    console.log('Browser reported offline, but server is reachable. Ignoring.');
                }
            }
        }, 2000);
    });

    // Initial check on load
    window.addEventListener('load', async () => {
        if (navigator.onLine === false) {
            const isOnline = await checkActualConnectivity(targetUrl);
            if (!isOnline) window.location.href = offlinePage;
        }
    });
}
