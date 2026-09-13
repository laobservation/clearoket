import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const REQUIRED_ADMIN_EMAIL = 'ceo@roketlead.com';
const REQUIRED_ADMIN_PASSWORD = 'Ayoub1994??%%';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Reset fields and errors whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setErrorMessage(null);
      setIsLoading(false);
      setIsSuccess(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();

    // Strict credential check
    if (trimmedEmail !== REQUIRED_ADMIN_EMAIL.toLowerCase() || password !== REQUIRED_ADMIN_PASSWORD) {
      setErrorMessage(
        isAr 
          ? 'بيانات الاعتماد غير صحيحة. الوصول مخصص للإدارة فقط.' 
          : 'Identifiants incorrects. Accès strictement réservé à l’administration.'
      );
      return;
    }

    // Credentials valid
    setIsLoading(true);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
      onClose();
    }, 600);
  };

  return (
    <div 
      id="admin-login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="admin-login-modal-card"
        className="relative w-full max-w-md bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 p-7 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          id="admin-login-modal-close"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Minimal Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-3.5 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isAr ? 'تسجيل الدخول للإدارة' : 'Administration RoketLead'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {isAr 
              ? 'الرجاء إدخال بيانات الاعتماد الخاصة بحساب المسؤول' 
              : 'Veuillez saisir vos identifiants pour accéder à l’espace administration.'}
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div 
            id="admin-login-error"
            className="mb-5 p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in slide-in-from-top-1"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success message */}
        {isSuccess && (
          <div 
            id="admin-login-success"
            className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {isAr ? 'تم التحقق من الحساب بنجاح. جاري الدخول...' : 'Authentification réussie. Redirection en cours...'}
            </span>
          </div>
        )}

        {/* Simple Login Form */}
        <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input */}
          <div>
            <label 
              htmlFor="admin-email-input" 
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              {isAr ? 'البريد الإلكتروني' : 'Adresse Email'}
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
              <input 
                id="admin-email-input"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="ceo@roketlead.com"
                className={`w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                }`}
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label 
              htmlFor="admin-password-input" 
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              {isAr ? 'كلمة المرور' : 'Mot de passe'}
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
              <input 
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••••••"
                className={`w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isRTL ? 'pr-10 pl-11 text-right' : 'pl-10 pr-11 text-left'
                }`}
              />
              <button
                type="button"
                id="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className={`absolute top-2.5 p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer ${
                  isRTL ? 'left-3' : 'right-3'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="admin-login-submit-btn"
            disabled={isLoading || isSuccess}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>{isAr ? 'جاري التحقق...' : 'Vérification en cours...'}</span>
            ) : (
              <>
                <span>{isAr ? 'تسجيل الدخول' : 'Se connecter'}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

        </form>

        {/* Minimal Subtle Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>RoketLead Control Panel • Accès restreint</span>
          </span>
        </div>

      </div>
    </div>
  );
};
