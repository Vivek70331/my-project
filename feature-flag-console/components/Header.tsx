import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useContext(ThemeContext);
    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

const Header: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/flags" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                            <Rocket className="text-brand-start" size={28} />
                            <span className="text-2xl font-bold bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
                                Flagship
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 font-bold text-lg hover:ring-2 hover:ring-brand-start/50 transition-all"
                                    aria-haspopup="true"
                                    aria-expanded={dropdownOpen}
                                >
                                    {user.email.charAt(0).toUpperCase()}
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-2 border border-gray-200/50 dark:border-gray-700/50">
                                        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                                            <p className="text-sm text-medium dark:text-medium-dark">Signed in as</p>
                                            <p className="text-sm font-medium text-secondary dark:text-secondary-dark truncate">{user.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <UserIcon size={16} className="mr-2" />
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <LogOut size={16} className="mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <Link
                                to="/login"
                                className="rounded-lg bg-gradient-to-r from-brand-start to-brand-end px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lifted hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;