import React from 'react';

interface VegBadgeProps {
  isVegetarian: boolean;
  className?: string;
  showLabel?: boolean;
}

export const VegBadge: React.FC<VegBadgeProps> = ({ isVegetarian, className = '', showLabel = false }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} title={isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}>
      <div
        className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center p-[2px] ${
          isVegetarian ? 'border-emerald-600 bg-white' : 'border-rose-600 bg-white'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        />
      </div>
      {showLabel && (
        <span
          className={`text-xs font-semibold ${
            isVegetarian ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {isVegetarian ? 'Veg' : 'Non-Veg'}
        </span>
      )}
    </div>
  );
};
