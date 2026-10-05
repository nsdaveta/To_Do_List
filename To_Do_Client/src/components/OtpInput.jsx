import React, { useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, value, onChange }) => {
    const inputs = useRef([]);

    useEffect(() => {
        // Clear any leftover values if the parent resets the value
        if (value === '') {
            inputs.current.forEach(input => {
                if (input) input.value = '';
            });
        }
    }, [value]);

    const handleInput = (e, index) => {
        const val = e.target.value;
        if (!/^[0-9]$/.test(val) && val !== '') {
            e.target.value = '';
            return;
        }

        const currentOtp = value || '';
        const newOtp = currentOtp.split('');
        newOtp[index] = val;
        const combined = newOtp.join('');
        onChange(combined);

        if (val !== '' && index < length - 1) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        // Trim spaces before and after the actual OTP
        const rawData = e.clipboardData.getData('text').trim();
        const pastedData = rawData.slice(0, length);
        
        // Ensure only digits are processed
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        onChange(pastedData);
        
        // Fill the fields and focus last filled
        newOtp.forEach((char, idx) => {
            if (inputs.current[idx]) {
                inputs.current[idx].value = char;
            }
        });
        
        const nextIdx = Math.min(newOtp.length, length - 1);
        if (inputs.current[nextIdx]) {
            inputs.current[nextIdx].focus();
        }
    };

    return (
        <div className="otp-inputs" onPaste={handlePaste}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputs.current[index] = el)}
                    className="otp-box"
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    required
                />
            ))}
        </div>
    );
};

export default OtpInput;
