
import React from 'react';
import { StatCardData } from '../types';
import { IconArrowUp, IconArrowDown } from '../constants.tsx'; // Explicitly use .tsx

const StatCard: React.FC<StatCardData> = ({ title, value, change, changeType, icon, details }) => {
  const changeColor = changeType === 'positive' ? 'text-green-400' : changeType === 'negative' ? 'text-red-400' : 'text-medium-text';
  const ChangeIcon = changeType === 'positive' ? IconArrowUp : changeType === 'negative' ? IconArrowDown : null;

  return (
    <div className="bg-dark-card p-5 rounded-lg shadow-lg flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div className="text-brand-purple p-3 bg-brand-purple/10 rounded-full">
           {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-medium-text mb-1">{title}</h3>
        <p className="text-2xl font-semibold text-light-text mb-1">{value}</p>
        {change && (
          <div className={`text-xs flex items-center ${changeColor}`}>
            {ChangeIcon && <ChangeIcon className="w-4 h-4 mr-1" />}
            <span>{change}</span>
          </div>
        )}
        {details && (
          <p className="text-xs text-medium-text mt-1">{details}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
