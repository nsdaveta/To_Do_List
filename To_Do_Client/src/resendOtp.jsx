import React, { useState } from 'react';
import api from './api';
import './auth.css';

const ResendOtp = ({ email }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResend = async () => {
        if (!email) {
            setMessage("Email is required to resend OTP.");
            return;
        }

        setIsLoading(true);
        setMessage('');
        try {
            const res = await api.post('/resend-otp', { email: email.trim() });
            setMessage(res.data.message || 'OTP resent successfully!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <title>To Do App - Resend OTP</title>
        <div className="resend-container">
            <button 
                onClick={handleResend} 
                disabled={isLoading}
                className="secondary-btn"
            >
                {isLoading ? 'Sending...' : 'Resend OTP'}
            </button>
            {message && <p className={message.includes('Failed') ? 'error-message' : 'success-message'}>{message}</p>}
        </div>
        </>
    );
};

export default ResendOtp;
