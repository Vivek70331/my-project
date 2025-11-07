import React from 'react';

interface BadgeProps {
  color: 'green' | 'red' | 'gray' | 'blue' | 'yellow';
  children: React.ReactNode;
  className?: string;
}

const colorClasses = {
  green: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700/50',
  red: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
  gray: 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600/50',
  blue: 'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700/50',
  yellow: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700/50',
};

const Badge: React.FC<BadgeProps> = ({ color, children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;