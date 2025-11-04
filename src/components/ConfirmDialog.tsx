import { createPortal } from 'react-dom';
import { AlertTriangle, X, Loader } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  onClose,
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      iconBg: 'bg-orange-100 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
    default: {
      iconBg: 'bg-gray-100 dark:bg-gray-900/20',
      iconColor: 'text-gray-600 dark:text-gray-400',
      buttonBg: 'bg-gray-600 hover:bg-gray-700',
    },
  };

  const styles = variantStyles[variant];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleCancel}
        />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in overflow-hidden">
        {/* Decorative gradient at top */}
        <div className={`h-1 bg-gradient-to-r ${
          variant === 'danger' ? 'from-red-500 to-orange-500' :
          variant === 'warning' ? 'from-orange-500 to-yellow-500' :
          'from-blue-500 to-cyan-500'
        }`} />

        {/* Content */}
        <div className="p-6">
          {/* Icon and Close */}
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <AlertTriangle size={24} className={styles.iconColor} strokeWidth={2} />
            </div>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
              disabled={isLoading}
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Children content (e.g., form fields) */}
          {children}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white ${styles.buttonBg} transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

