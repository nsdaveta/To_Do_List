/**
 * Minimalist UI sound player for premium feel with a singleton AudioContext.
 * Uses synthesized tones to avoid external dependencies.
 */

let audioCtx = null;

const playTone = (frequency, duration, type = 'sine', volume = 0.1) => {
    try {
        // Initialize AudioContext lazily on first interaction
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume context if suspended (common in modern browsers)
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
        // Silently fail if audio is blocked or fails - prevents console spam in production
        // console.debug('Audio feedback blocked by browser:', e);
    }
};

export const playSuccessSound = () => {
    // Upward chime
    playTone(523.25, 0.4); // C5
    setTimeout(() => playTone(659.25, 0.5), 120); // E5
};

export const playClickSound = () => {
    // Subtle tick
    playTone(850, 0.08, 'square', 0.04);
};

export const playDeleteSound = () => {
    // Downward zip
    playTone(400, 0.25, 'sine', 0.1);
    setTimeout(() => playTone(250, 0.4, 'sine', 0.06), 60);
};

export const playCompleteAllSound = () => {
    // Triad celebration
    playTone(523.25, 0.4); // C5
    setTimeout(() => playTone(659.25, 0.4), 120); // E5
    setTimeout(() => playTone(783.99, 0.6), 240); // G5
};

export const playUpdateStartSound = () => {
    // Sharp but subtle mechanical blip
    playTone(600, 0.1, 'sine', 0.08);
    setTimeout(() => playTone(900, 0.05, 'sine', 0.05), 50);
};

export const playUpdateSuccessSound = () => {
    // Quick rising harmonic sequence
    playTone(440, 0.15, 'sine', 0.08); // A4
    setTimeout(() => playTone(554.37, 0.15, 'sine', 0.07), 80); // C#5
    setTimeout(() => playTone(659.25, 0.25, 'sine', 0.25), 160); // E5
};

export const playClearAllSound = () => {
    // Elegant sweeping "whoosh" sound for clearing items
    playTone(500, 0.3, 'sine', 0.08);
    playTone(400, 0.3, 'sine', 0.06);
    setTimeout(() => playTone(300, 0.4, 'sine', 0.04), 100);
};

export const playDialogAppearSound = () => {
    // Soft, welcoming dual-tone chime for dialogs
    playTone(660, 0.1, 'sine', 0.06);
    setTimeout(() => playTone(880, 0.15, 'sine', 0.04), 60);
};
