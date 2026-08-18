import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { classNames } from '@/lib/utils';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, description, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={classNames(
          'relative w-full bg-white rounded-3xl shadow-lift animate-scale-in max-h-[90vh] flex flex-col',
          sizeClass
        )}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                {title && <h3 className="text-h4">{title}</h3>}
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-ink transition-colors -mt-1 -mr-1 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5 flex-1 scrollbar-thin">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
