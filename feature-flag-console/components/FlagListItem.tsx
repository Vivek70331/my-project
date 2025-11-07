import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, ToggleRight, ChevronsRight } from 'lucide-react';
import { FeatureFlag, FlagStatus, FlagType } from '../types';
import Badge from './Badge';

interface FlagListItemProps {
  flag: FeatureFlag;
}

const statusMap: { [key in FlagStatus]: { color: 'green' | 'red' | 'gray'; text: string } } = {
  [FlagStatus.ACTIVE]: { color: 'green', text: 'Active' },
  [FlagStatus.INACTIVE]: { color: 'red', text: 'Inactive' },
  [FlagStatus.ARCHIVED]: { color: 'gray', text: 'Archived' },
};

const FlagListItem: React.FC<FlagListItemProps> = ({ flag }) => {
  const { color, text } = statusMap[flag.status];
  
  return (
    <Link 
      to={`/flags/${flag.key}`}
      className="block bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-soft hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           {flag.type === FlagType.BOOLEAN ? 
            <ToggleRight className="text-indigo-500" size={24} /> :
            <ChevronsRight className="text-purple-500" size={24} />
          }
          <div>
            <p className="font-semibold text-lg text-secondary dark:text-secondary-dark">{flag.name}</p>
            <p className="text-sm text-medium dark:text-medium-dark font-mono">{flag.key}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <Tag size={16} className="text-medium dark:text-medium-dark"/>
            {flag.tags.slice(0, 2).map(tag => (
              <Badge key={tag} color="blue">{tag}</Badge>
            ))}
            {flag.tags.length > 2 && <span className="text-xs text-medium dark:text-medium-dark">+{flag.tags.length - 2} more</span>}
          </div>
          <Badge color={color}>{text}</Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-medium dark:text-medium-dark truncate">{flag.description}</p>
    </Link>
  );
};

export default FlagListItem;