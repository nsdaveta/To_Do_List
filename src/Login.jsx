import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './auth.css';

// A simple spinner component for loading states
const Spinner = () => <div className="spinner"></div>;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userEmail', response.data.user.email);
            localStorage.setItem('username', response.data.user.username);

            // Dispatch event so Navbar updates
            window.dispatchEvent(new Event('authChange'));

            // Redirect to your main app page
            navigate('/todos');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyRedirect = async () => {
        if (!email) {
            setError("Please enter your email address above to verify OTP.");
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const trimmedEmail = email.trim();
            // Trigger OTP resend so the user actually receives the email
            const response = await api.post('/resend-otp', { email: trimmedEmail, source: 'login' });
            
            // Navigate to independent VerifyOtp page with email and success message
            navigate('/verify-otp', { state: { email: trimmedEmail, message: response.data.message } });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send verification OTP';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <title>To Do App - Login</title>
        <div className="auth-page">
            <div className="auth-container glass-card">
                <h2>Welcome Back</h2>
                <p>Login to manage your tasks effectively.</p>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                            <span
                                onClick={() => navigate('/forgot-password')}
                                style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                            >
                                Forgot?
                            </span>
                        </div>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Sign In'}
                    </button>

                    {error && <p className="error-message">{error}</p>}
                </form>

                <div className="divider"></div>

                <div className="auth-footer">
                    <p style={{ marginBottom: '15px' }}>Don't have an account? <span onClick={() => navigate('/register')}>Sign Up</span></p>
                    <p style={{ fontSize: '0.85rem' }}>Did you miss your verification?</p>
                    <button type="button" onClick={handleVerifyRedirect} disabled={isLoading} className="secondary-btn" style={{ marginTop: '10px' }}>
                        {isLoading ? <Spinner /> : 'Verify OTP'}
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default Login;