import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, UserPlus } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await register(email, password);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "mt-1 block w-full rounded-lg border-gray-300/80 dark:border-gray-600 bg-white/80 dark:bg-gray-700/50 shadow-sm focus:border-brand-start focus:ring-brand-start/50 sm:text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                 <div className="flex justify-center items-center gap-2 mb-8">
                     <Rocket className="text-brand-start" size={32} />
                    <span className="text-3xl font-bold bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
                        Flagship
                    </span>
                 </div>

                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm p-8 rounded-xl shadow-soft border border-gray-200/50 dark:border-gray-700/50">
                    <h2 className="text-2xl font-bold text-center text-secondary dark:text-secondary-dark mb-6">Create an Account</h2>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className={labelClasses}>Email Address</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} autoComplete="email" />
                        </div>
                        <div>
                            <label htmlFor="password" className={labelClasses}>Password</label>
                            {/* FIX: Corrected typo from `e.targe` to `e.target` and completed the component. */}
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} autoComplete="new-password" />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className={labelClasses}>Confirm Password</label>
                            <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClasses} autoComplete="new-password" />
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-brand-start to-brand-end text-white font-semibold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                                {isLoading ? <Spinner className="w-5 h-5" /> : <UserPlus size={18} />}
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-brand-start hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
