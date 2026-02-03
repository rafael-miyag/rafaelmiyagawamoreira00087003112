import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
    },
  };

  const { bg, border, text, icon: Icon } = styles[type];

  return (
    <div
      className={cn(
        'rounded-lg border p-4 flex items-start gap-3',
        bg,
        border,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', text)} />
      <div className="flex-1">
        {title && <p className={cn('font-medium', text)}>{title}</p>}
        <p className={cn('text-sm', text)}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn('p-1 rounded-lg hover:bg-black/5', text)}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
