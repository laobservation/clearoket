import React, { useEffect } from 'react';
import { Waitlist, WaitlistRole } from './Waitlist';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: WaitlistRole;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'Creator'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <Waitlist isModal onClose={onClose} defaultRole={defaultRole} />
      </div>
    </div>
  );
};
