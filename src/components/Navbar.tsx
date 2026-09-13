import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  LogOut, 
  ArrowRight,
  Globe,
  Menu,
  X,
  Sparkles,
  User,
  LogIn,
  UserPlus,
  Store,
  ChevronRight,
  Home,
  Info,
  Zap,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { MerchantProfile, AffiliateProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentView: 'landing' | 'admin' | 'merchant' | 'affiliate' | 'earlyaccess';
  onViewChange: (view: 'landing' | 'admin' | 'merchant' | 'affiliate' | 'earlyaccess') => void;
  onOpenSignIn?: (initialTab?: 'seller' | 'promoter') => void;
  onOpenSignUp?: (initialTab?: 'seller' | 'promoter') => void;
  onOpenWaitlist?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  currentUserRole?: 'GUEST' | 'MERCHANT' | 'AFFILIATE' | 'SUPER_ADMIN';
  activeMerchant?: MerchantProfile | null;
  activeAffiliate?: AffiliateProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onViewChange, 
  onOpenSignIn,
  onOpenSignUp,
  onOpenWaitlist,
  onNavigateSection,
  currentUserRole = 'GUEST',
  activeMerchant,
  activeAffiliate,
  onLogout
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      onViewChange('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      if (sectionId === 'home-top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Logo - RoketLead */}
            <div className="flex items-center shrink-0">
              <button 
                id="nav-logo-btn"
                onClick={() => {
                  onViewChange('landing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1 py-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 hover:opacity-90 transition-opacity cursor-pointer group"
              >
                <span className="font-extrabold tracking-tighter text-slate-950 group-hover:text-blue-600 transition-colors">
                  roketlead<span className="text-blue-600">.</span>
                </span>
              </button>
            </div>

            {/* Center: Primary Centered Navigation Links (Desktop) */}
            <nav className="hidden md:flex flex-1 items-center justify-center gap-8 lg:gap-10 text-[15px] lg:text-base font-semibold text-slate-700 px-4">
              <button 
                id="nav-home-btn"
                onClick={() => handleNavClick('home-top')}
                className="hover:text-blue-600 transition-colors py-2 cursor-pointer"
              >
                {t('nav.home')}
              </button>

              <button 
                id="nav-about-btn"
                onClick={() => handleNavClick('section-about')}
                className="hover:text-blue-600 transition-colors py-2 cursor-pointer"
              >
                {t('nav.whoWeAre')}
              </button>

              <button 
                id="nav-how-btn"
                onClick={() => handleNavClick('section-how-it-works')}
                className="hover:text-blue-600 transition-colors py-2 cursor-pointer"
              >
                {t('nav.howItWorks')}
              </button>

              <button 
                id="nav-contact-btn"
                onClick={() => handleNavClick('section-contact')}
                className="hover:text-blue-600 transition-colors py-2 cursor-pointer"
              >
                {t('nav.contact')}
              </button>
            </nav>

            {/* Controls: Language Selector, Desktop Auth, Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Language Switcher Button (Desktop & Mobile quick access) */}
              <button
                id="lang-toggle-btn"
                type="button"
                onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer shrink-0"
                title={language === 'fr' ? 'Changer en العربية' : 'Passer en Français'}
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold text-xs">{language === 'fr' ? 'FR' : 'العربية'}</span>
              </button>

              {/* Active Merchant Portal Badge (Desktop) */}
              {currentUserRole === 'MERCHANT' && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    id="nav-active-merchant-portal-btn"
                    onClick={() => onViewChange('merchant')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      currentView === 'merchant'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="truncate max-w-[130px]">
                      {activeMerchant ? activeMerchant.companyName : t('nav.sellerPortal')}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-indigo-600 text-white rounded-md uppercase tracking-wider">
                      {t('nav.seller')}
                    </span>
                  </button>

                  <button
                    id="nav-seller-logout-btn"
                    onClick={onLogout}
                    title={t('nav.switchAccount')}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Active Affiliate Portal Badge (Desktop) */}
              {currentUserRole === 'AFFILIATE' && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    id="nav-active-affiliate-portal-btn"
                    onClick={() => onViewChange('affiliate')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      currentView === 'affiliate'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="truncate max-w-[130px]">
                      {activeAffiliate ? activeAffiliate.fullName : t('nav.promoterPortal')}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-emerald-600 text-white rounded-md uppercase tracking-wider">
                      {t('nav.promoter')}
                    </span>
                  </button>

                  <button
                    id="nav-affiliate-logout-btn"
                    onClick={onLogout}
                    title={t('nav.switchAccount')}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Super Admin Status (Desktop) */}
              {currentUserRole === 'SUPER_ADMIN' && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    id="nav-active-admin-portal-btn"
                    onClick={() => onViewChange('admin')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      currentView === 'admin'
                        ? 'bg-purple-950 border-purple-800 text-purple-200 shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span className="hidden sm:inline">SaaS Console</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-purple-600 text-white rounded-md uppercase tracking-wider">
                      ROOT
                    </span>
                  </button>

                  <button
                    id="nav-admin-logout-btn"
                    onClick={onLogout}
                    title="Exit SaaS Admin Session"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Desktop Guest Actions (Sign In / Sign Up) */}
              {currentUserRole === 'GUEST' && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    id="header-signin-btn"
                    onClick={() => onOpenSignIn ? onOpenSignIn('seller') : onViewChange('merchant')}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    {t('nav.signIn')}
                  </button>

                  <button
                    id="header-signup-btn"
                    onClick={() => onOpenSignUp ? onOpenSignUp('seller') : onViewChange('affiliate')}
                    className="px-4.5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{t('nav.signUp')}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}

              {/* Mobile Slide-Out Drawer Trigger (Hamburger Button) */}
              <button
                id="mobile-drawer-btn"
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Ouvrir le menu de navigation"
                className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 border border-slate-200/70 text-slate-800 transition-all cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OUT DRAWER */}
      {/* ========================================================================= */}
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <aside 
        id="mobile-navigation-drawer"
        aria-label="Navigation mobile"
        className={`fixed top-0 bottom-0 ${isRTL ? 'left-0' : 'right-0'} z-50 w-[320px] max-w-[86vw] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen 
            ? 'translate-x-0' 
            : isRTL ? '-translate-x-full' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button 
            onClick={() => {
              handleNavClick('home-top');
            }}
            className="flex items-center gap-1 text-2xl font-black tracking-tight text-slate-950 cursor-pointer"
          >
            <span className="font-extrabold tracking-tighter">
              roketlead<span className="text-blue-600">.</span>
            </span>
          </button>

          <button
            id="mobile-drawer-close-btn"
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fermer le menu"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Main Navigation Links */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
              {language === 'ar' ? 'القائمة الرئيسية' : 'Navigation'}
            </div>
            <div className="space-y-1">
              <button 
                id="drawer-link-home"
                onClick={() => handleNavClick('home-top')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-blue-600 hover:bg-blue-50/70 font-semibold text-sm transition-colors text-left cursor-pointer"
              >
                <Home className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="flex-1">{t('nav.home')}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              <button 
                id="drawer-link-about"
                onClick={() => handleNavClick('section-about')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-blue-600 hover:bg-blue-50/70 font-semibold text-sm transition-colors text-left cursor-pointer"
              >
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="flex-1">{t('nav.whoWeAre')}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              <button 
                id="drawer-link-how"
                onClick={() => handleNavClick('section-how-it-works')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-blue-600 hover:bg-blue-50/70 font-semibold text-sm transition-colors text-left cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="flex-1">{t('nav.howItWorks')}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              <button 
                id="drawer-link-contact"
                onClick={() => handleNavClick('section-contact')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-blue-600 hover:bg-blue-50/70 font-semibold text-sm transition-colors text-left cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="flex-1">{t('nav.contact')}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Account / Portals Section */}
          <div className="pt-2 border-t border-slate-100">
            {currentUserRole === 'GUEST' ? (
              <div className="space-y-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  {language === 'ar' ? 'بوابات المنصة' : 'Espaces & Inscription'}
                </div>

                {/* Seller Option Card */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {language === 'ar' ? 'أصحاب المتاجر (Vendeurs)' : 'Espace Vendeurs'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {language === 'ar' ? 'YouCan, Shopify, WooCommerce' : 'YouCan, Shopify, Dropify'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenSignIn ? onOpenSignIn('seller') : onViewChange('merchant');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold text-center cursor-pointer"
                    >
                      {t('nav.signIn')}
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenSignUp ? onOpenSignUp('seller') : onViewChange('merchant');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center cursor-pointer shadow-2xs"
                    >
                      {language === 'ar' ? 'ابدأ كبائع' : 'Créer compte'}
                    </button>
                  </div>
                </div>

                {/* Promoter Option Card */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950">
                        {language === 'ar' ? 'المسوقون والمؤثرون (Promoteurs)' : 'Espace Promoteurs'}
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        {language === 'ar' ? 'عمولة لكل ليد وسحب مباشر RIB' : 'Gains par Lead & Retrait RIB'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenSignIn ? onOpenSignIn('promoter') : onViewChange('affiliate');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold text-center cursor-pointer"
                    >
                      {t('nav.signIn')}
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenSignUp ? onOpenSignUp('promoter') : onViewChange('affiliate');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center cursor-pointer shadow-2xs"
                    >
                      {language === 'ar' ? 'انضم كمسوق' : 'Rejoindre'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {currentUserRole === 'MERCHANT' ? (
                      <Building2 className="w-5 h-5" />
                    ) : currentUserRole === 'AFFILIATE' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {currentUserRole === 'MERCHANT' 
                        ? (activeMerchant?.companyName || 'Boutique Partenaire')
                        : currentUserRole === 'AFFILIATE'
                          ? (activeAffiliate?.fullName || 'Compte Promoteur')
                          : 'Administrateur SaaS'}
                    </div>
                    <div className="text-[11px] font-semibold text-blue-600">
                      {currentUserRole === 'MERCHANT' ? 'Espace Vendeur Actif' : currentUserRole === 'AFFILIATE' ? 'Espace Promoteur Actif' : 'Session SaaS Admin'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (currentUserRole === 'MERCHANT') onViewChange('merchant');
                    else if (currentUserRole === 'AFFILIATE') onViewChange('affiliate');
                    else if (currentUserRole === 'SUPER_ADMIN') onViewChange('admin');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{language === 'ar' ? 'الدخول للوحة التحكم' : 'Accéder au Dashboard'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-red-50 text-xs font-semibold text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('nav.switchAccount')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Language Selector Inside Drawer */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
              {language === 'ar' ? 'لغة العرض' : 'Langue'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  language === 'fr'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Français (FR)</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  language === 'ar'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>العربية (AR)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Drawer Footer Status */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700">
              {language === 'ar' ? 'روكيت ليد — التتبع اللحظي 100%' : 'RoketLead Maroc — 100% Temps Réel'}
            </span>
          </div>
        </div>

      </aside>
    </>
  );
};

