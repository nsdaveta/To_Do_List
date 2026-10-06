export const hapticImpact = async (style = 'light') => {
    try {
        if (window.__TAURI__) {
            // Check if we are on a mobile platform in Tauri
            // navigator.vibrate is a good fallback for basic haptics on Android
            if (navigator.vibrate) {
                const duration = style === 'heavy' ? 20 : (style === 'medium' ? 15 : 10);
                navigator.vibrate(duration);
            }
        }
    } catch (e) {
        // Silently fail if not on a mobile device or plugin not available
    }
};

export const hapticNotification = async (type = 'success') => {
    try {
        if (window.__TAURI__ && navigator.vibrate) {
            if (type === 'success') {
                navigator.vibrate([10, 50, 10]);
            } else if (type === 'warning') {
                navigator.vibrate([15, 100, 15]);
            } else if (type === 'error') {
                navigator.vibrate([20, 50, 20, 50, 20]);
            }
        }
    } catch (e) {
        // Silently fail
    }
};

export const hapticVibrate = async () => {
    try {
        if (window.__TAURI__ && navigator.vibrate) {
            navigator.vibrate(200);
        }
    } catch (e) {
        // Silently fail
    }
};
