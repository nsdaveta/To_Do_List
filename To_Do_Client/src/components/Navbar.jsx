import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDialog } from './Dialog/DialogContext';
import { VscHome, VscChecklist, VscAccount, VscSignOut, VscMenu } from 'react-icons/vsc';
import './navbar.css';

const Navbar = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [isCollapsed, setIsCollapsed] = useState(false);
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
        <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-top">
                <div className="menu-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <VscMenu />
                </div>
                <div className="nav-brand">
                    <span>To-Do</span>
                </div>
            </div>
            
            <div className="sidebar-links">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <VscHome className="nav-icon" />
                    {!isCollapsed && <span>Home</span>}
                </NavLink>
                
                {token && (
                    <NavLink to="/todos" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <VscChecklist className="nav-icon" />
                        {!isCollapsed && <span>My Tasks</span>}
                    </NavLink>
                )}
            </div>

            {token ? (
                <div className="sidebar-footer">
                    <div className={`user-profile ${isCollapsed ? 'collapsed' : ''}`}>
                        <div className="user-avatar">
                            <VscAccount />
                        </div>
                        {!isCollapsed && (
                            <div className="user-details">
                                <span className="username">{username || 'User'}</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className={`nav-item logout-btn ${isCollapsed ? 'collapsed' : ''}`}
                        title="Logout"
                    >
                        <VscSignOut className="nav-icon" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            ) : (
                <div className="sidebar-footer">
                    <NavLink to="/login" className="nav-item">
                        <VscAccount className="nav-icon" />
                        {!isCollapsed && <span>Sign In</span>}
                    </NavLink>
                    <NavLink to="/register" className="nav-item">
                        <VscAccount className="nav-icon" />
                        {!isCollapsed && <span>Sign Up</span>}
                    </NavLink>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
