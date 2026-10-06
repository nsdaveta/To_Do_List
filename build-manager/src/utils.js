/**
 * Minimalist UI sound player for premium feel with a singleton AudioContext.
 * Reusing the context ensures consistency and prevents browser fatigue.
 */

let audioCtx = null;

export const playTone = (frequency, duration, type = 'sine', volume = 0.1) => {
    try {
        // Initialize AudioContext lazily on first interaction
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume context if suspended (policy requirement in many browsers)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        // Ensure volume is strictly positive for exponential ramp
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn('Audio feedback failed:', e);
    }
};

export const playSuccessSound = () => {
    // Upward melodic chime for success
    playTone(523.25, 0.4, 'sine', 0.1); // C5
    setTimeout(() => playTone(659.25, 0.6, 'sine', 0.08), 120); // E5
};

export const playErrorSound = () => {
    // Sharp warning tone for failure
    playTone(180, 0.3, 'square', 0.1);
    setTimeout(() => playTone(140, 0.5, 'square', 0.1), 180);
};

export const playStartSound = () => {
    // Professional start blip
    playTone(440, 0.15, 'sine', 0.1);
};
