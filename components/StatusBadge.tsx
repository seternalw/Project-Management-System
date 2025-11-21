import React from 'react';
import { ProjectStatus } from '../types';

export const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const colors = {
    [ProjectStatus.NEW]: 'bg-purple-100 text-purple-700 border-purple-200',
    [ProjectStatus.ASSIGNED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ProjectStatus.IN_PROGRESS]: 'bg-green-100 text-green-700 border-green-200',
    [ProjectStatus.PAUSED]: 'bg-amber-100 text-amber-700 border-amber-200', // Critical for this user
    [ProjectStatus.COMPLETED]: 'bg-slate-100 text-slate-700 border-slate-200',
    [ProjectStatus.ARCHIVED]: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};