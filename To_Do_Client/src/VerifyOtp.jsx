import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate, useLocation } from 'react-router-dom';
import OtpInput from './components/OtpInput';
import './auth.css';

const Spinner = () => <div className="spinner"></div>;

const VerifyOtp = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.email) {
            setEmail(location.state.email);
            if (location.state.message) {
                setSuccessMessage(location.state.message);
            }
        }
    }, [location.state]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await api.post('/verify-otp', { 
                email: email.trim(), 
                otp: otp.trim() 
            });
            setSuccessMessage(response.data.message + ' Redirecting to login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred during OTP verification.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await api.post('/resend-otp', { email: email.trim() });
            setSuccessMessage(response.data.message);
            setResendCooldown(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <title>To Do App - Verify OTP</title>
        <div className="auth-page">
            <div className="auth-container glass-card">
                <h2>Verify OTP</h2>
                <p>Enter the 6-digit OTP sent to <strong>{email || 'your email'}</strong></p>
                
                <form onSubmit={handleVerifySubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading || !!location.state?.email}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="otp">6-Digit OTP</label>
                        <OtpInput value={otp} onChange={setOtp} />
                    </div>

                    <button type="submit" disabled={isLoading || otp.length !== 6} className="primary-btn">
                        {isLoading ? <Spinner /> : 'Verify Email'}
                    </button>
                    
                    <div className="resend-container">
                        <button type="button" onClick={handleResendOtp} disabled={isLoading || resendCooldown > 0} className="secondary-btn">
                            {resendCooldown > 0 ? `Resend Available in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                    </div>
                </form>

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                
                <div className="auth-footer">
                    <p>Back to <span onClick={() => navigate('/login')}>Login</span></p>
                </div>
            </div>
        </div>
        </>
    );
};

export default VerifyOtp;