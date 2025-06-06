import React from 'react';
import Button from './Button';
import Card from './Card'; // Assuming Card can be used as a base for the modal structure
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // For danger variant example

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
  confirmButtonVariant = "primary",
  icon
}) => {
  if (!isOpen) return null;

  const defaultIcon = confirmButtonVariant === 'danger' 
    ? <ExclamationTriangleIcon className="h-10 w-10 text-red-500" /> 
    : null;
  const displayIcon = icon !== undefined ? icon : defaultIcon;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out">
      <Card 
        title={title} 
        className="w-full max-w-md bg-slate-800 shadow-2xl"
        titleClassName="border-b border-slate-700"
      >
        <div className="p-6 text-center">
          {displayIcon && (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-700 mb-4">
              {displayIcon}
            </div>
          )}
          <p className="text-sm text-slate-300 whitespace-pre-line">{message}</p>
        </div>
        <div className="flex justify-end space-x-3 p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-xl">
          <Button variant="ghost" onClick={onClose}>
            {cancelButtonText}
          </Button>
          <Button variant={confirmButtonVariant} onClick={onConfirm}>
            {confirmButtonText}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationModal;