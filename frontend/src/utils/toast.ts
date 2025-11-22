/**
 * Simple toast notification utility
 * Used across all UX enhancement features for user feedback
 */

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  duration?: number; // Duration in milliseconds (default: 3000)
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

let toastContainer: HTMLDivElement | null = null;

/**
 * Initialize toast container
 */
const initToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

/**
 * Show toast notification
 */
const showToast = (message: string, type: ToastType = 'info', options: ToastOptions = {}) => {
  const container = initToastContainer();
  const duration = options.duration || 3000;

  const toast = document.createElement('div');
  toast.className = `
    px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium
    transform transition-all duration-300 ease-in-out
    ${type === 'success' ? 'bg-green-600' : ''}
    ${type === 'error' ? 'bg-red-600' : ''}
    ${type === 'info' ? 'bg-blue-600' : ''}
    opacity-0 translate-x-full
  `;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-x-full');
  }, 10);

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, duration);
};

export const toast = {
  success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
  info: (message: string, options?: ToastOptions) => showToast(message, 'info', options),
};

export { showToast };
