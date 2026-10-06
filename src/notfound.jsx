import React from 'react';
import { Link } from "react-router-dom";
import './home.css'; // Reuse home styles for landing-like feel

const NotFound = () => {
  return (
    <>
    <title>To Do App - Page Not Found</title>
    <div className="home-landing glass-card">
        <h1 style={{ fontSize: '8rem', opacity: '0.2', marginBottom: '-2rem' }}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="landing-actions">
            <Link to={'/'} className="primary-btn" style={{ padding: '14px 40px', borderRadius: '12px' }}>
                Go Back Home
            </Link>
        </div>
    </div>
    </>
  );
}

export default NotFound;
