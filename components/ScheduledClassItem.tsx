
import React from 'react';
import { ScheduledClass } from '../types';

interface ScheduledClassItemProps {
  sClass: ScheduledClass;
}

const ScheduledClassItem: React.FC<ScheduledClassItemProps> = ({ sClass }) => {
  const spotRatio = sClass.spotsFilled / sClass.totalSpots;
  let progressBarColor = 'bg-green-500';
  if (spotRatio > 0.8) progressBarColor = 'bg-yellow-500';
  if (spotRatio === 1) progressBarColor = 'bg-red-500';


  return (
    <div className="bg-dark-card p-4 rounded-lg shadow flex justify-between items-center mb-3">
      <div>
        <h4 className="font-semibold text-brand-purple">{sClass.name}</h4>
        <p className="text-sm text-medium-text">{sClass.teacher} - {sClass.time}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-light-text">{sClass.spotsFilled}/{sClass.totalSpots} vagas</p>
        <div className="w-24 h-2 bg-gray-700 rounded-full mt-1">
          <div 
            className={`h-full rounded-full ${progressBarColor}`} 
            style={{ width: `${(sClass.spotsFilled / sClass.totalSpots) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledClassItem;
