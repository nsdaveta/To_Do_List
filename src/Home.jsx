import React, { useState, useEffect } from 'react';
import api from './api';
import { Link, useNavigate } from 'react-router-dom';
import './home.css';
import ToDoItem from './To-Do_Item';
import { toast } from 'react-toastify';
import { useDialog } from './components/Dialog/DialogContext';
import { hapticImpact, hapticNotification } from './hooks/useHaptics';
import { FiCheckCircle, FiLogIn, FiUserPlus, FiPlus, FiArrowRightCircle } from 'react-icons/fi';

const Home = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();
    const { ask } = useDialog();

    useEffect(() => {
        const handleAuthChange = () => {
            setToken(localStorage.getItem('token'));
        };
        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    useEffect(() => {
        if (token) {
            fetchTodos();
        } else {
            setTodos([]);
        }
    }, [token]);

    const fetchTodos = async () => {
        try {
            const res = await api.get('/');
            // Map _id or id for ToDoItem compatibility
            setTodos(res.data.map(item => ({...item, id: item._id || item.id})));
        } catch (err) {
            console.error("Error fetching todos", err);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) {
            return;
        }
        try {
            const res = await api.post('/add', { title: newTodo });
            const todoData = res.data.todo || res.data;
            const addedTodo = { ...todoData, id: todoData._id || todoData.id };
            setTodos(prev => [...prev, addedTodo]);
            setNewTodo('');
            hapticImpact('medium');
        } catch (err) {
            console.error('Task Addition Error:', err);
            const msg = (typeof err.response?.data === 'object' ? err.response?.data?.message : err.response?.data) || (err.message === 'Network Error' ? 'Cannot connect to server.' : 'Failed to add task.');
            if (typeof toast !== 'undefined') {
                toast.error(msg, { theme: 'colored', position: 'top-center', draggable: false });
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/delete/${id}`);
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error("Error deleting todo", err);
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            await api.put(`/update/${id}`, { title: data });
            setTodos(prev => prev.map(item => item.id === id ? { ...item, title: data } : item));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDone = async (id) => {
        try {
            await api.put(`/update/${id}`, { IsCompleted: true });
            setTodos(prev => prev.map(item => item.id === id ? { ...item, IsCompleted: true } : item));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUndo = async (id) => {
        try {
            await api.put(`/update/${id}`, { IsCompleted: false });
            setTodos(prev => prev.map(item => item.id === id ? { ...item, IsCompleted: false } : item));
        } catch (err) {
            console.error(err);
        }
    };

    if (!token) {
        return (
            <>
            <title>To Do App - Home</title>
            <div className="home-landing glass-card">
                <div className="landing-icon">
                    <FiCheckCircle size={60} color="var(--primary)" />
                </div>
                <h1>Organize Your Life</h1>
                <p>A simple, elegant way to keep track of your daily tasks and boost your productivity.</p>
                <div className="landing-actions">
                    <Link to="/login" className="primary-btn landing-btn">
                        <FiLogIn size={18} /> Get Started
                    </Link>
                    <Link to="/register" className="secondary-btn landing-btn">
                        <FiUserPlus size={18} /> Create Account
                    </Link>
                </div>
                <div className="landing-features">
                    <div className="feature-item">
                        <span className="feature-dot"></span> Secure Authentication
                    </div>
                    <div className="feature-item">
                        <span className="feature-dot"></span> Cloud Sync
                    </div>
                    <div className="feature-item">
                        <span className="feature-dot"></span> Responsive Design
                    </div>
                </div>
            </div>
            </>
        );
    }

    return (
        <>
        <title>To Do App - Home</title>
        <div className="home-container glass-panel">
            <div className="home-header">
                <div>
                    <h1>My Tasks</h1>
                    <p className="task-count-label">
                        You have {todos.length} task{todos.length !== 1 ? 's' : ''} in total
                    </p>
                </div>
                <Link to="/todos" className="view-all-link">
                    Manage All <FiArrowRightCircle size={18} />
                </Link>
            </div>
            
            <form onSubmit={handleAddTodo} className="todo-form">
                <div className="input-wrapper">
                    <input 
                        type="text" 
                        value={newTodo} 
                        onChange={(e) => setNewTodo(e.target.value)} 
                        placeholder="What needs to be done?" 
                        className="todo-input"
                    />
                </div>
                <button type="submit" className="add-btn">
                    <FiPlus size={20} /> Add
                </button>
            </form>

            <div className="todo-list-preview">
                {todos.length > 0 ? (
                    todos.map((todo, index) => (
                        <ToDoItem 
                            key={todo.id}
                            index={index + 1}
                            todo={todo}
                            Delete_From_List={handleDelete}
                            isSimple={true}
                            hideDeleteToast={true}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No tasks yet. Add one to get started!</p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default Home;

