import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDialog } from './Dialog/DialogContext';
import { VscHome, VscChecklist, VscAccount, VscSignOut } from 'react-icons/vsc';
import './top-navbar.css';

const TopNavbar = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const navigate = useNavigate();
    const { ask } = useDialog();

    useEffect(() => { 
        const handleAuthChange = () => {
            setToken(localStorage.getItem('token'));
            setUsername(localStorage.getItem('username'));
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => {
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    const handleLogout = async () => {
        const confirmed = await ask('Are you sure you want to logout?', {
            title: 'Logout',
            kind: 'info'
        });
        
        if (!confirmed) return;

        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
    };

    return (
        <nav className="top-navbar glass-panel">
            <div className="nav-container">
                <div className="nav-top-row">
                    <div className="nav-left">
                        <NavLink to="/" className="nav-brand">
                            <img src="/icons/32x32.png" alt="logo" className="nav-logo" />
                            <span>To-Do App</span>
                        </NavLink>
                    </div>

                    <div className="nav-links-section">
                        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                            <VscHome /> <span>Home</span>
                        </NavLink>
                        {token && (
                            <NavLink to="/todos" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                                <VscChecklist /> <span>Tasks</span>
                            </NavLink>
                        )}
                    </div>
                </div>

                <div className="nav-bottom-row">
                    {token ? (
                        <div className="user-section">
                            <div className="user-info">
                                <VscAccount className="user-icon" />
                                <span className="username-display">
                                    <span className="welcome-text">Hello, </span>{username || 'User'}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="top-logout-btn" title="Logout">
                                <VscSignOut /> <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <NavLink to="/login" className="nav-link">Login</NavLink>
                            <NavLink to="/register" className="nav-link auth-btn">Sign Up</NavLink>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;
