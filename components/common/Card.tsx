import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, children, footer, className = '', titleClassName = '', bodyClassName = '', onClick }) => {
  return (
    <div
      className={`bg-card-dark shadow-lg rounded-xl overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-primary-purple/20 transition-shadow duration-300' : ''} ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className={`px-4 py-4 sm:px-6 border-b border-slate-700 ${titleClassName}`}>
          <h3 className="text-lg leading-6 font-semibold text-slate-100">{title}</h3>
        </div>
      )}
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-slate-700/50 border-t border-slate-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
