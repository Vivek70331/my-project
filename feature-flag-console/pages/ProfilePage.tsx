import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="text-center mt-20">
                <p>You must be logged in to view this page.</p>
                <Link to="/login" className="text-brand-start hover:underline">Go to Login</Link>
            </div>
        );
    }
    
    const cardClasses = "p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm shadow-soft";

    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/flags" className="flex items-center gap-2 text-brand-start font-semibold hover:underline mb-6 transition-all">
                <ArrowLeft size={16} /> Back to dashboard
            </Link>
            
            <div className={cardClasses}>
                <div className="flex items-center gap-4">
                     <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-start to-brand-end rounded-full text-white text-3xl font-bold">
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-secondary dark:text-secondary-dark">Profile</h1>
                        <p className="text-lg text-medium dark:text-medium-dark mt-1">{user.email}</p>
                    </div>
                </div>
                
                <div className="mt-8 border-t border-gray-200/80 dark:border-gray-700/80 pt-6">
                    <h2 className="text-xl font-semibold text-secondary dark:text-secondary-dark mb-4">Account Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">User ID</label>
                            <p className="text-md text-gray-900 dark:text-gray-200 font-mono">{user.id}</p>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                            <p className="text-md text-gray-900 dark:text-gray-200">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
