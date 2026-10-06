import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import OtpInput from './components/OtpInput';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/forgot-password', { email: email.trim() });
            toast.success('OTP sent to your email.');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPasswordError('');
        try {
            await api.post('/reset-password', { 
                email: email.trim(), 
                otp: otp.trim(), 
                newPassword 
            });
            toast.success('Password reset successful. Please login.');
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset password.';
            if (msg.toLowerCase().includes('password')) {
                setPasswordError(msg);
            } else {
                toast.error(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <title>To Do App - Forgot Password?</title>
        <div className="auth-page">
            <div className="auth-container glass-card">
                <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
                <p>{step === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code and your new password.'}</p>
                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="primary-btn">
                            {isLoading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>Reset Code</label>
                            <OtpInput value={otp} onChange={setOtp} />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                                </button>
                            </div>
                            
                            {/* Password Requirements List */}
                            <ul className="password-requirements" style={{ marginTop: '15px' }}>
                                {[
                                    { label: 'At least 8 characters long', regex: /.{8,}/ },
                                    { label: 'At least one lowercase letter', regex: /[a-z]/ },
                                    { label: 'At least one uppercase letter', regex: /[A-Z]/ },
                                    { label: 'At least one number', regex: /[0-9]/ },
                                    { label: 'At least one special character (@$!%*?&)', regex: /[@$!%*?&]/ },
                                ].map((req, index) => (
                                    <li key={index} className={`requirement-item ${req.regex.test(newPassword) ? 'met' : ''}`}>
                                        <span className="requirement-icon">
                                            {req.regex.test(newPassword) ? '●' : '○'}
                                        </span>
                                        {req.label}
                                    </li>
                                ))}
                            </ul>

                            {passwordError && <p className="error-message" style={{ marginTop: '5px', fontSize: '0.8rem' }}>{passwordError}</p>}
                        </div>
                        <button type="submit" disabled={isLoading || otp.length !== 6} className="primary-btn">
                            {isLoading ? 'Resetting...' : 'Update Password'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setStep(1)} 
                            className="secondary-btn"
                            style={{ marginTop: '15px' }}
                        >
                            Back
                        </button>
                    </form>
                )}
                
                <div className="auth-footer" style={{ marginTop: '30px' }}>
                    <p>Remembered? <span onClick={() => navigate('/login')}>Back to Login</span></p>
                </div>
            </div>
        </div>
        </>
    );
};

export default ForgotPassword;
