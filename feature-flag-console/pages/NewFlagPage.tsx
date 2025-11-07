import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Save, X, ArrowLeft } from 'lucide-react';
import { createFlag } from '../services/api';
import { FlagType, NewFlagPayload } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

const NewFlagPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<FlagType>(FlagType.BOOLEAN);
    const [tags, setTags] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        const newKey = newName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
        setKey(newKey);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !key || !user) {
            setError('Flag name and key are required.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const payload: NewFlagPayload = {
            name,
            key,
            description,
            type,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            owner: user.email,
        };

        try {
            const newFlag = await createFlag(payload, user.email);
            navigate(`/flags/${newFlag.key}`);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('An unknown error occurred.');
            setIsSubmitting(false);
        }
    };
    
    const inputClasses = "mt-1 block w-full rounded-lg border-gray-300/80 dark:border-gray-600 bg-white/80 dark:bg-gray-700/50 shadow-sm focus:border-brand-start focus:ring-brand-start/50 sm:text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/flags" className="flex items-center gap-2 text-brand-start font-semibold hover:underline mb-6 transition-all">
                <ArrowLeft size={16} /> Back to all flags
            </Link>
            
            <form onSubmit={handleSubmit} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-soft border border-gray-200/50 dark:border-gray-700/50">
                <h1 className="text-3xl font-bold text-secondary dark:text-secondary-dark mb-6">Create a New Feature Flag</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className={labelClasses}>Flag Name</label>
                        <input type="text" id="name" value={name} onChange={handleNameChange} required className={inputClasses} placeholder="e.g., New Checkout Experience" />
                    </div>
                    
                    <div>
                        <label htmlFor="key" className={labelClasses}>Flag Key</label>
                        <input type="text" id="key" value={key} onChange={(e) => setKey(e.target.value)} required className={`${inputClasses} font-mono`} placeholder="e.g., new-checkout-experience" />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">A unique key used to identify the flag in your code. Must be URL-safe.</p>
                    </div>

                    <div>
                        <label htmlFor="description" className={labelClasses}>Description</label>
                        <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClasses} placeholder="Describe the purpose of this flag." />
                    </div>
                    
                    <div>
                        <label className={labelClasses}>Flag Type</label>
                        <div className="mt-2 flex gap-6">
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="flagType" value={FlagType.BOOLEAN} checked={type === FlagType.BOOLEAN} onChange={() => setType(FlagType.BOOLEAN)} className="focus:ring-brand-start h-4 w-4 text-brand-start border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                                <span className="ml-2 text-sm text-gray-800 dark:text-gray-300">Boolean (On/Off)</span>
                            </label>
                             <label className="flex items-center cursor-pointer">
                                <input type="radio" name="flagType" value={FlagType.MULTIVARIATE} checked={type === FlagType.MULTIVARIATE} onChange={() => setType(FlagType.MULTIVARIATE)} className="focus:ring-brand-start h-4 w-4 text-brand-start border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                                <span className="ml-2 text-sm text-gray-800 dark:text-gray-300">Multivariate (A/B Test)</span>
                            </label>
                        </div>
                    </div>

                     <div>
                        <label htmlFor="tags" className={labelClasses}>Tags</label>
                        <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClasses} placeholder="e.g., ui, backend, experimental" />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Comma-separated list of tags.</p>
                    </div>
                </div>
                
                <div className="mt-8 pt-5 border-t border-gray-200/80 dark:border-gray-700 flex justify-end gap-3">
                    <Link to="/flags" className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-2 transition-colors">
                        <X size={16} /> Cancel
                    </Link>
                    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-start to-brand-end text-white hover:opacity-90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                        {isSubmitting ? <Spinner className="w-5 h-5" /> : <Save size={16} />} 
                        {isSubmitting ? 'Creating...' : 'Create Flag'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewFlagPage;