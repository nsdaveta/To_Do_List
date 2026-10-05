import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import OtpInput from './components/OtpInput';
import './auth.css';

// A simple spinner component for loading states
const Spinner = () => <div className="spinner"></div>;

const Register = () => {
    // State for form inputs
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // State to manage UI flow and feedback
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const [isEmailDomainValid, setIsEmailDomainValid] = useState(false);
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Check if we were redirected here to verify OTP
    useEffect(() => {
        if (location.state && location.state.email && location.state.showOtp) {
            setEmail(location.state.email);
            setIsRegistered(true);
        }
    }, [location.state]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    // Real-time DNS verification for email domain
    useEffect(() => {
        // Reset valid state immediately as soon as user types
        setIsEmailDomainValid(false);

        const verifyDomain = async () => {
            const domainParts = email.split('@');
            if (domainParts.length === 2) {
                const domain = domainParts[1];
                if (domain && domain.includes('.') && domain.split('.')[1]?.length >= 2) {
                    setIsCheckingDomain(true);
                    try {
                        const response = await api.post('/validate-email-domain', { email });
                        setIsEmailDomainValid(response.data.valid);
                    } catch (err) {
                        setIsEmailDomainValid(false);
                    } finally {
                        setIsCheckingDomain(false);
                    }
                    return;
                }
            }
        };

        const debounceTimer = setTimeout(verifyDomain, 800);
        return () => clearTimeout(debounceTimer);
    }, [email]);

    // Handles the initial registration form submission
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation check
        const isUsernameValid = usernameRequirements.every(req => isRequirementMet(req, username));
        const isEmailValid = emailRequirements.every(req => isRequirementMet(req, email));
        const isPasswordValid = passwordRequirements.every(req => isRequirementMet(req, password));

        if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
            setError('Please fulfill all field requirements highlighted above before proceeding.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await api.post('/register', {
                username,
                email: email.trim(),
                password
            });
            setSuccessMessage(response.data.message);
            setIsRegistered(true); // Move to OTP verification step
        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred during registration.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handles the OTP verification form submission
    const handleOtpSubmit = async (e) => {
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

            // Redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred during OTP verification.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handles the OTP resend
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await api.post('/resend-otp', { email: email.trim() });
            setSuccessMessage(response.data.message);
            setResendCooldown(60); // Start 60-second cooldown
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    // Field requirement checks
    const usernameRequirements = [
        { label: 'At least 3 characters long', regex: /.{3,}/ },
    ];

    const emailRequirements = [
        { label: 'Must be a real, existing email domain (e.g., gmail.com)', regex: /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, isDomainCheck: true },
    ];

    const passwordRequirements = [
        { label: 'At least 8 characters long', regex: /.{8,}/ },
        { label: 'At least one lowercase letter', regex: /[a-z]/ },
        { label: 'At least one uppercase letter', regex: /[A-Z]/ },
        { label: 'At least one number', regex: /[0-9]/ },
        { label: 'At least one special character (@$!%*?&)', regex: /[@$!%*?&]/ },
    ];

    const isRequirementMet = (req, value) => {
        if (req.isDomainCheck) {
            return req.regex.test(value) && isEmailDomainValid;
        }
        return req.regex.test(value);
    };

    // Renders the initial registration form
    const renderRegisterForm = () => (
        <form onSubmit={handleRegisterSubmit}>
            <p>Join us to start organizing your tasks today.</p>
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError('');
                    }}
                    required
                    disabled={isLoading}
                />
                {/* Username Requirements List */}
                <ul className="field-requirements">
                    {usernameRequirements.map((req, index) => (
                        <li key={index} className={`requirement-item ${isRequirementMet(req, username) ? 'met' : ''}`}>
                            <span className="requirement-icon">
                                {isRequirementMet(req, username) ? '●' : '○'}
                            </span>
                            {req.label}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setIsEmailDomainValid(false);
                        setIsCheckingDomain(false);
                        if (error) setError('');
                    }}
                    required
                    disabled={isLoading}
                />
                {/* Email Requirements List */}
                <ul className="field-requirements">
                    {emailRequirements.map((req, index) => (
                        <li key={index} className={`requirement-item ${isRequirementMet(req, email) ? 'met' : ''}`}>
                            <span className="requirement-icon">
                                {isRequirementMet(req, email) ? '●' : '○'}
                            </span>
                            {req.label}
                            {isCheckingDomain && <span className="checking-domain"> (Checking...)</span>}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError('');
                        }}
                        required
                        disabled={isLoading}
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
                <ul className="field-requirements">
                    {passwordRequirements.map((req, index) => (
                        <li key={index} className={`requirement-item ${isRequirementMet(req, password) ? 'met' : ''}`}>
                            <span className="requirement-icon">
                                {isRequirementMet(req, password) ? '●' : '○'}
                            </span>
                            {req.label}
                        </li>
                    ))}
                </ul>
            </div>

            <button type="submit" disabled={isLoading} className="primary-btn">
                {isLoading ? <Spinner /> : 'Create Account'}
            </button>
            <div className="auth-footer">
                <p>Already have an account? <span onClick={() => navigate('/login')}>Sign In</span></p>
            </div>
        </form>
    );

    // Renders the OTP verification form
    const renderOtpForm = () => (
        <form onSubmit={handleOtpSubmit}>
            <p>Enter the 6-digit OTP sent to <strong>{email}</strong></p>
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
    );

    return (
        <>
            <title>To Do App - Sign Up</title>
            <div className="auth-page">
                <div className="auth-container glass-card">
                    <h2>{isRegistered ? 'Verify OTP' : 'Create Account'}</h2>

                    {/* Conditionally render the correct form */}
                    {!isRegistered ? renderRegisterForm() : renderOtpForm()}

                    {/* Display loading, error, or success messages - Moved below both forms */}
                    <div className="message-container">
                        {error && <p className="error-message">{error}</p>}
                        {successMessage && <p className="success-message">{successMessage}</p>}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;