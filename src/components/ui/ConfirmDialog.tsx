import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: { bg: 'bg-red-100', icon: 'text-red-600' },
    primary: { bg: 'bg-blue-100', icon: 'text-blue-600' },
    warning: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
  };

  const buttonVariant = variant === 'warning' ? 'primary' : variant;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variantStyles[variant].bg}`}
        >
          <AlertTriangle className={`w-6 h-6 ${variantStyles[variant].icon}`} />
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            className="flex-1"
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
