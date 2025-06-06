

import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, name, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && React.isValidElement(icon) && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement<any>, { 
              ...((icon as React.ReactElement<any>).props || {}), 
              className: `h-5 w-5 text-slate-400 ${((icon as React.ReactElement<any>).props?.className || '')}`.trim() 
            })}
          </div>
        )}
        <input
          id={name}
          name={name}
          className={`
            block w-full 
            ${icon && React.isValidElement(icon) ? 'pl-10' : 'pl-3'} 
            pr-3 py-2.5 
            border 
            ${error ? 'border-red-500 text-red-400 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-primary-purple focus:border-primary-purple'} 
            bg-slate-700 
            rounded-lg 
            text-sm 
            focus:outline-none
            transition-colors duration-150 ease-in-out
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;