import axios from 'axios';
    
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.protocol === 'tauri:';

const api = axios.create({
    baseURL: 'https://to-do-server-1yuc.onrender.com/todos',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to automatically add the auth token from localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            // Ensure headers object exists
            config.headers = config.headers || {};
            
            // Use config.headers.set if it's an AxiosHeaders object (Axios 1.0+)
            if (typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            console.log(`Request [${config.method?.toUpperCase() || 'GET'}] ${config.url} - Token attached`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized request (401). Cleaning up session...');
            
            // Clear auth data on 401
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('username');
            
            // Trigger authChange event for components (like Navbar) to react
            window.dispatchEvent(new Event('authChange'));
            
            // Redirect to login if not already there or at root
            const hash = window.location.hash;
            if (hash !== '#/login' && hash !== '#/register' && hash !== '#/forgot-password') {
                console.log('Redirecting to login page...');
                window.location.hash = '#/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

 