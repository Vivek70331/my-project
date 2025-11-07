import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { getFlags } from '../services/api';
import { FeatureFlag } from '../types';
import FlagListItem from '../components/FlagListItem';
import Spinner from '../components/Spinner';

const DashboardPage: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchFlags = async () => {
      setLoading(true);
      try {
        const data = await getFlags();
        setFlags(data);
      } catch (error) {
        console.error("Failed to fetch flags", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlags();
  }, []);

  const filteredFlags = useMemo(() => {
    return flags.filter(flag =>
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flags, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-secondary dark:text-secondary-dark">Feature Flags</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search flags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-2.5 border border-gray-300/50 dark:border-gray-700 bg-white/80 dark:bg-gray-800/50 rounded-lg shadow-soft focus:ring-2 focus:ring-brand-start/50 focus:border-brand-start transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="w-12 h-12" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlags.length > 0 ? (
            filteredFlags.map(flag => (
              <FlagListItem key={flag.id} flag={flag} />
            ))
          ) : (
            <div className="text-center py-16 bg-white/60 dark:bg-gray-800/50 rounded-xl shadow-soft border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No flags found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No flags match your search term. Try a different query or create a new flag.
                </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;