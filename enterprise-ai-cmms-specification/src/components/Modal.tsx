import { useEffect, type ReactNode } from 'react';
import { I } from './Icon';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;
  const maxW = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`surface ring-gold rounded-2xl w-full ${maxW} relative max-h-[92vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/15">
          <h3 className="font-bold text-lg text-gold-gradient">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-300/70 hover:text-amber-300">
            <I.X />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-amber-500/15 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={onClose}>انصراف</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={() => { onConfirm(); onClose(); }}>تأیید</button>
        </>
      }
    >
      <p className="text-sm text-ink-200">{message}</p>
    </Modal>
  );
}
