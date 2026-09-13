import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Store, 
  Instagram, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Globe,
  User,
  Database,
  Loader2,
  Clock,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import { MerchantProfile, AffiliateProfile } from '../types';
import { INITIAL_MERCHANTS, INITIAL_AFFILIATE_PROFILE } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { StoreLogo } from './StoreLogo';
import { 
  signInWithGoogle, 
  saveUserAccount, 
  saveMerchantProfile, 
  saveAffiliateProfile,
  registerNewMerchant,
  findMerchantByEmailOrId,
  getMerchantsList
} from '../services/accountService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'seller' | 'promoter';
  initialMode?: 'signin' | 'signup';
  onLoginSeller: (merchant: MerchantProfile) => void;
  onLoginPromoter: (affiliate: AffiliateProfile) => void;
  onOpenAdminLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'seller',
  initialMode = 'signin',
  onLoginSeller,
  onLoginPromoter,
  onOpenAdminLogin
}) => {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'seller' | 'promoter'>(initialTab);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAuthMode(initialMode);
    }
  }, [isOpen, initialTab, initialMode]);

  // Seller Form State
  const [sellerEmail, setSellerEmail] = useState<string>('contact@caftanroyal.ma');
  const [sellerPassword, setSellerPassword] = useState<string>('••••••••••••');
  const [sellerStoreUrl, setSellerStoreUrl] = useState<string>('https://caftanroyal.ma');
  const [sellerStoreName, setSellerStoreName] = useState<string>('Caftan Royal Casablanca');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('merch-02');

  // Promoter Form State
  const [promoterEmail, setPromoterEmail] = useState<string>('amine@benjelloun.ma');
  const [promoterPassword, setPromoterPassword] = useState<string>('••••••••••••');
  const [promoterHandle, setPromoterHandle] = useState<string>('@amine_tech_deals');
  const [promoterFullName, setPromoterFullName] = useState<string>('Amine Benjelloun');

  // Loading States
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Option 2 States: Signup confirmation & Pending Approval Gate
  const [signupSuccessNotice, setSignupSuccessNotice] = useState<{
    role: 'seller' | 'promoter';
    name: string;
    email: string;
    storeUrl?: string;
    isPendingApproval?: boolean;
  } | null>(null);

  const [pendingApprovalGate, setPendingApprovalGate] = useState<{
    merchant: MerchantProfile;
  } | null>(null);

  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAuthMode(initialMode);
      setSignupSuccessNotice(null);
      setPendingApprovalGate(null);
      setStatusFeedback(null);
    }
  }, [isOpen, initialTab, initialMode]);

  if (!isOpen) return null;

  const handleCheckApprovalStatus = async () => {
    if (!pendingApprovalGate) return;
    setIsCheckingStatus(true);
    setStatusFeedback(null);
    try {
      const refreshed = await findMerchantByEmailOrId(pendingApprovalGate.merchant.id);
      if (refreshed && refreshed.status === 'ACTIVE') {
        setStatusFeedback(isAr ? 'تهانينا! تمت الموافقة على متجرك بنجاح.' : 'Félicitations ! Votre boutique a été approuvée par le Super Admin.');
        setTimeout(() => {
          onLoginSeller(refreshed);
          onClose();
        }, 800);
      } else {
        setStatusFeedback(isAr ? 'لا تزال البوابة قيد المراجعة في قائمة الانتظار.' : "Votre boutique est toujours en attente de vérification par l'équipe administrative.");
      }
    } catch (err) {
      console.warn('Error checking approval status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSwitchToApprovedDemo = () => {
    const approved = INITIAL_MERCHANTS.find(m => m.status === 'ACTIVE') || INITIAL_MERCHANTS[0];
    setPendingApprovalGate(null);
    onLoginSeller(approved);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      if (!user) {
        setIsGoogleLoading(false);
        return;
      }

      // Save user account in Firestore
      await saveUserAccount({
        id: user.uid,
        email: user.email || '',
        name: user.displayName || 'Utilisateur',
        role: activeTab === 'seller' ? 'SELLER' : 'PROMOTER',
        avatarUrl: user.photoURL || undefined,
        createdAt: new Date().toISOString()
      });

      if (authMode === 'signup') {
        if (activeTab === 'seller') {
          const storeName = user.displayName ? `${user.displayName}'s Store` : 'Boutique Partenaire';
          await registerNewMerchant({
            userId: user.uid,
            companyName: storeName,
            storeName: storeName,
            website: 'https://votre-boutique.ma',
            category: 'Health & Beauty',
            city: 'Casablanca',
            platformType: 'Shopify',
            email: user.email || '',
            logo: user.photoURL || '🛍️',
            description: `Inscription Google (${user.email || 'partenaire'}) - En attente d'approbation`
          });

          setIsGoogleLoading(false);
          setSignupSuccessNotice({
            role: 'seller',
            name: storeName,
            email: user.email || '',
            storeUrl: 'https://votre-boutique.ma',
            isPendingApproval: true
          });
          return;
        } else {
          const affiliateId = `aff-${user.uid.slice(0, 8)}`;
          const affiliateData: Partial<AffiliateProfile> = {
            fullName: user.displayName || 'Promoteur Partenaire',
            email: user.email || '',
            avatarUrl: user.photoURL || undefined,
            socialHandle: `@${(user.displayName || 'promoter').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            niche: 'High-Tech & Gadgets',
            bankName: 'CIH Bank',
            bankRib: '230 780 0000000000000000 00',
            accountHolderName: user.displayName || 'Promoteur Partenaire'
          };
          await saveAffiliateProfile(affiliateId, affiliateData);

          setIsGoogleLoading(false);
          setSignupSuccessNotice({
            role: 'promoter',
            name: user.displayName || 'Promoteur Partenaire',
            email: user.email || '',
            isPendingApproval: false
          });
          return;
        }
      }

      // If Sign-in with Google
      if (activeTab === 'seller') {
        let merchant = await findMerchantByEmailOrId(user.email || '');
        if (!merchant) {
          merchant = INITIAL_MERCHANTS.find(m => m.id === selectedMerchantId) || INITIAL_MERCHANTS[1];
        }

        if (merchant && merchant.status === 'PENDING_APPROVAL') {
          setIsGoogleLoading(false);
          setPendingApprovalGate({ merchant });
          return;
        }

        onLoginSeller(merchant);
      } else {
        const affiliateId = `aff-${user.uid.slice(0, 8)}`;
        const fullAffiliate: AffiliateProfile = {
          ...INITIAL_AFFILIATE_PROFILE,
          id: affiliateId,
          fullName: user.displayName || INITIAL_AFFILIATE_PROFILE.fullName,
          email: user.email || INITIAL_AFFILIATE_PROFILE.email,
          avatarUrl: user.photoURL || undefined,
          socialHandle: `@${(user.displayName || 'promoter').toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        };
        onLoginPromoter(fullAffiliate);
      }
      onClose();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (authMode === 'signup') {
      try {
        const cleanStoreName = (sellerStoreName || 'Boutique Partenaire').trim();
        const cleanStoreUrl = (sellerStoreUrl || 'https://votre-boutique.ma').trim();
        const cleanEmail = (sellerEmail || 'contact@votre-boutique.ma').trim();

        // 1. Create brand in Firestore database with PENDING_APPROVAL status
        const newMerchant = await registerNewMerchant({
          companyName: cleanStoreName,
          storeName: cleanStoreName,
          website: cleanStoreUrl,
          category: 'E-commerce',
          city: 'Casablanca',
          platformType: 'YouCan',
          email: cleanEmail,
          supportPhone: '+212 6 00 00 00 00',
          description: `Inscription directe vendeur (${cleanEmail}) - En attente d'approbation`
        });

        // 2. Save User account in Firestore
        await saveUserAccount({
          id: newMerchant.userId,
          email: cleanEmail,
          name: cleanStoreName,
          role: 'MERCHANT',
          createdAt: new Date().toISOString()
        });

        setIsSubmitting(false);
        // Do NOT log in automatically! Display confirmation notice with Option 2
        setSignupSuccessNotice({
          role: 'seller',
          name: cleanStoreName,
          email: cleanEmail,
          storeUrl: cleanStoreUrl,
          isPendingApproval: true
        });
        return;
      } catch (err) {
        console.error('Failed to register brand in database:', err);
      }
    }

    // Sign-in flow: check if account/merchant is pending approval
    let matched: MerchantProfile | null = null;
    try {
      matched = await findMerchantByEmailOrId(sellerEmail);
    } catch (err) {
      console.warn('Could not find merchant by email, falling back to id:', err);
    }
    if (!matched) {
      const all = await getMerchantsList();
      matched = all.find(m => m.id === selectedMerchantId) || all.find(m => m.id === 'merch-02') || INITIAL_MERCHANTS[1];
    }

    setIsSubmitting(false);

    // Option 2: Pending Approval Gate
    if (matched && matched.status === 'PENDING_APPROVAL') {
      setPendingApprovalGate({ merchant: matched });
      return;
    }

    onLoginSeller(matched);
    onClose();
  };

  const handlePromoterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanName = promoterFullName.trim() || INITIAL_AFFILIATE_PROFILE.fullName;
    const cleanEmail = promoterEmail.trim() || 'promoter@gmail.com';
    const cleanHandle = promoterHandle.trim() || '@createur';

    try {
      const affId = `aff-${Date.now().toString(36)}`;
      await saveAffiliateProfile(affId, {
        fullName: cleanName,
        email: cleanEmail,
        socialHandle: cleanHandle
      });
    } catch (err) {
      console.warn('Firestore affiliate save deferred:', err);
    }

    setIsSubmitting(false);

    if (authMode === 'signup') {
      // Do NOT log in automatically!
      setSignupSuccessNotice({
        role: 'promoter',
        name: cleanName,
        email: cleanEmail,
        isPendingApproval: false
      });
      return;
    }

    onLoginPromoter({
      ...INITIAL_AFFILIATE_PROFILE,
      fullName: cleanName,
      email: cleanEmail,
      socialHandle: cleanHandle
    });
    onClose();
  };

  const handleQuickDemoSeller = (merchant: MerchantProfile) => {
    setSelectedMerchantId(merchant.id);
    setSellerEmail(merchant.email || merchant.website.replace('https://', 'admin@'));
    setSellerStoreName(merchant.companyName);
    setSellerStoreUrl(merchant.website);

    // Option 2: If merchant is pending approval, trigger the gate!
    if (merchant.status === 'PENDING_APPROVAL') {
      setPendingApprovalGate({ merchant });
      return;
    }

    onLoginSeller(merchant);
    onClose();
  };

  const handleQuickDemoPromoter = (handle: string, name: string) => {
    setPromoterHandle(handle);
    setPromoterFullName(name);
    setPromoterEmail(name.toLowerCase().replace(' ', '.') + '@gmail.com');
    onLoginPromoter(INITIAL_AFFILIATE_PROFILE);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-slate-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">
              roketlead<span className="text-blue-500">.</span>
            </span>
            <span className="text-[10px] uppercase font-bold bg-blue-600/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
              {isAr ? 'منصة الأداء والتسويق' : 'E-commerce Affiliate'}
            </span>
          </div>
          <button 
            id="auth-modal-close-btn"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          
          {/* ========================================================================= */}
          {/* OPTION 2 VIEW A: SIGNUP SUCCESS NOTIFICATION (NO AUTO-LOGIN) */}
          {/* ========================================================================= */}
          {signupSuccessNotice ? (
            <div className="py-2 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/90 text-emerald-800 rounded-full text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Compte créé avec succès</span>
              </div>

              <h2 className="text-xl font-black text-slate-950 tracking-tight mb-2">
                {signupSuccessNotice.role === 'seller' 
                  ? (isAr ? 'تم تسجيل متجرك بنجاح' : 'Boutique Enregistrée avec Succès !')
                  : (isAr ? 'تم إنشاء حساب المسوق بنجاح' : 'Profil Promoteur Enregistré !')}
              </h2>

              <p className="text-xs text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
                {signupSuccessNotice.role === 'seller' ? (
                  isAr 
                    ? 'تم حفظ بيانات متجرك في قاعدة البيانات. وفقًا لبروتوكول الأمان، لن يتم تسجيل دخولك تلقائيًا، ومتجرك معروض الآن في قائمة مراجعة المدير العام (Brand Approvals).'
                    : 'Votre boutique a bien été enregistrée dans la base de données. Conformément aux directives de sécurité, vous n’êtes pas connecté automatiquement. Votre boutique a été soumise à la file de vérification Super Admin (Brand Approvals).'
                ) : (
                  isAr
                    ? 'تم تسجيل حسابك كصانع محتوى / مسوق بالعمولة. لم يتم تسجيل دخولك تلقائيًا، يرجى تسجيل الدخول يدويًا للوصول إلى لوحة التحكم.'
                    : 'Votre compte créateur / affilié a bien été initialisé. Vous n’êtes pas connecté automatiquement, veuillez vous connecter avec vos identifiants pour démarrer.'
                )}
              </p>

              {/* Account summary card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-left mb-5 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{signupSuccessNotice.role === 'seller' ? 'Boutique :' : 'Nom :'}</span>
                  <span className="font-bold text-slate-900">{signupSuccessNotice.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Email :</span>
                  <span className="font-mono text-slate-700">{signupSuccessNotice.email}</span>
                </div>
                {signupSuccessNotice.isPendingApproval && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Statut initial :</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      En attente de validation Super Admin
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  id="auth-go-to-signin-btn"
                  onClick={() => {
                    const email = signupSuccessNotice.email;
                    setSignupSuccessNotice(null);
                    setAuthMode('signin');
                    if (signupSuccessNotice.role === 'seller') {
                      setSellerEmail(email);
                    } else {
                      setPromoterEmail(email);
                    }
                  }}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <span>{isAr ? 'الانتقال إلى تسجيل الدخول' : 'Se connecter avec mes identifiants'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {isAr ? 'إغلاق النافذة' : 'Fermer la fenêtre'}
                </button>
              </div>
            </div>
          ) : pendingApprovalGate ? (
            /* ========================================================================= */
            /* OPTION 2 VIEW B: PENDING APPROVAL GATE (STRICT SECURITY RESTRICTION) */
            /* ========================================================================= */
            <div className="py-2 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <Clock className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-amber-900 rounded-full text-xs font-bold mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Accès Restreint • Validation Requise</span>
              </div>

              <h2 className="text-xl font-black text-slate-950 tracking-tight mb-2">
                {isAr ? 'المتجر قيد المراجعة والتدقيق' : 'Boutique en Attente de Validation'}
              </h2>

              <p className="text-xs text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
                {isAr
                  ? 'متجرك مسجل حالياً بحالة قيد الانتظار. وفقاً لقواعد الأمان، يجب مراجعة وتأكيد المتجر بواسطة المشرف العام (Super Admin) قبل تفعيل الروابط ولوحة القيادة.'
                  : 'Votre boutique a bien été créée mais son accès opérationnel est restreint jusqu\'à sa validation par un Super Admin dans la file Brand Approvals.'}
              </p>

              {/* Store Identity Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-left mb-5 text-xs space-y-3">
                <div className="flex items-center gap-3">
                  <StoreLogo 
                    logo={pendingApprovalGate.merchant.logo} 
                    name={pendingApprovalGate.merchant.companyName} 
                    category={pendingApprovalGate.merchant.category}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">{pendingApprovalGate.merchant.companyName}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{pendingApprovalGate.merchant.website}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                    PENDING_APPROVAL
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                  🛡️ <strong>Mesure de sécurité :</strong> Les pixels de conversion, les webhooks YouCan/Shopify et les liens d'affiliés seront débloqués automatiquement dès l'approbation par le Super Admin.
                </div>
              </div>

              {statusFeedback && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 text-center animate-in fade-in">
                  {statusFeedback}
                </div>
              )}

              <div className="space-y-2">
                {/* Button 1: Check status in Firestore */}
                <button
                  type="button"
                  id="auth-recheck-approval-btn"
                  disabled={isCheckingStatus}
                  onClick={handleCheckApprovalStatus}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm disabled:opacity-60"
                >
                  {isCheckingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{isAr ? 'التحقق من حالة الموافقة الآن' : 'Vérifier l\'état d\'approbation'}</span>
                </button>

                {/* Button 2: Test with an approved demo store */}
                <button
                  type="button"
                  onClick={handleSwitchToApprovedDemo}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tester avec une boutique validée (Démo)</span>
                </button>

                {/* Button 3: Return to sign-in form */}
                <button
                  type="button"
                  onClick={() => {
                    setPendingApprovalGate(null);
                    setStatusFeedback(null);
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {isAr ? 'الرجوع إلى نموذج تسجيل الدخول' : 'Retour à la page de connexion'}
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* NORMAL FORM VIEW (SIGNIN / SIGNUP) */
            /* ========================================================================= */
            <>
              {/* Main User Selection Switcher (Sellers vs Promoters) */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {isAr ? 'اختر نوع الحساب' : 'Type de Compte'}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
                  
                  {/* Option 1: Sellers / Brand Owners */}
                  <button
                    type="button"
                    id="auth-tab-seller"
                    onClick={() => setActiveTab('seller')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      activeTab === 'seller'
                        ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'seller' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="leading-tight">{isAr ? 'بائع / متجر' : 'Vendeur'}</div>
                    </div>
                  </button>

                  {/* Option 2: Promoters / Affiliates */}
                  <button
                    type="button"
                    id="auth-tab-promoter"
                    onClick={() => setActiveTab('promoter')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      activeTab === 'promoter'
                        ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'promoter' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="leading-tight">{isAr ? 'مسوق / صانع محتوى' : 'Promoteur'}</div>
                    </div>
                  </button>

                </div>
              </div>

              {/* Form Mode Indicator & Toggle Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-950">
                  {authMode === 'signup' 
                    ? (activeTab === 'seller' ? (isAr ? 'إنشاء حساب بائع جديد' : 'Inscription Vendeur / E-commerce') : (isAr ? 'إنشاء حساب مسوق جديد' : 'Inscription Promoteur / Affilié'))
                    : (activeTab === 'seller' ? (isAr ? 'تسجيل الدخول كبائع' : 'Connexion Espace Vendeur') : (isAr ? 'تسجيل الدخول كمسوق' : 'Connexion Espace Promoteur'))
                  }
                </h3>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {authMode === 'signin' 
                    ? (isAr ? 'إنشاء حساب جديد' : 'Créer un compte')
                    : (isAr ? 'لدي حساب بالفعل' : 'Se connecter')
                  }
                </button>
              </div>

              {/* Context Banner */}
          <div className={`mb-5 p-3 rounded-2xl border flex items-center gap-2.5 ${
            activeTab === 'seller' 
              ? 'bg-indigo-50/70 border-indigo-100 text-indigo-950' 
              : 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
          }`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'seller' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {activeTab === 'seller' ? <Store className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">
                {activeTab === 'seller' 
                  ? (isAr ? 'مساحة البائعين:' : 'Espace Vendeur :') 
                  : (isAr ? 'مساحة المسوقين:' : 'Espace Promoteur :')}
              </span>{' '}
              {activeTab === 'seller' 
                ? (isAr ? 'أنشئ روابط تتبع لمتجرك وتابع المبيعات والعمولات في الوقت الفعلي.' : 'Générez des liens de tracking et suivez chaque vente réalisée.') 
                : (isAr ? 'احصل على روابط تتبع العروض واكسب عمولات مباشرة على حسابك البنكي.' : 'Accédez aux liens de tracking et retirez vos commissions par virement (RIB).')
              }
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 mb-3.5 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span>Connexion avec Firebase Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isAr ? 'المتابعة بواسطة Google (Firebase)' : 'Continuer avec Google (Firebase)'}</span>
              </>
            )}
          </button>

          <div className="relative flex py-1 items-center mb-3">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {isAr ? 'أو عبر البريد الإلكتروني' : 'ou par email & mot de passe'}
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* ========================================================================= */}
          {/* SELLER FORM */}
          {/* ========================================================================= */}
          {activeTab === 'seller' && (
            <form onSubmit={handleSellerSubmit} className="space-y-3.5">
              
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isAr ? 'اسم المتجر / العلامة التجارية' : 'Nom de la Boutique / Marque'} *
                  </label>
                  <div className="relative">
                    <Store className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3`} />
                    <input 
                      type="text"
                      required
                      value={sellerStoreName}
                      onChange={(e) => setSellerStoreName(e.target.value)}
                      placeholder={isAr ? 'مثال: قفطان رويال الدار البيضاء' : 'Ex: Caftan Royal Casablanca'}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'البريد الإلكتروني للعمل' : 'Email Professionnel'} *
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3`} />
                  <input 
                    type="email"
                    required
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    placeholder="contact@votre-boutique.ma"
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all`}
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isAr ? 'رابط المتجر الإلكتروني (YouCan, Shopify, WooCommerce)' : 'Lien du Site (YouCan, Shopify, WooCommerce)'} *
                  </label>
                  <div className="relative">
                    <Globe className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3`} />
                    <input 
                      type="url"
                      required
                      value={sellerStoreUrl}
                      onChange={(e) => setSellerStoreUrl(e.target.value)}
                      placeholder="https://votre-boutique.ma"
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all`}
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {isAr ? 'كلمة المرور' : 'Mot de passe'} *
                  </label>
                  {authMode === 'signin' && (
                    <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                      {isAr ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3`} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={sellerPassword}
                    onChange={(e) => setSellerPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} top-3 text-slate-400 hover:text-slate-600`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-seller-auth-btn"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>
                  {authMode === 'signin' 
                    ? (isAr ? 'تسجيل الدخول كبائع' : 'Se connecter comme Vendeur')
                    : (isAr ? 'إنشاء حساب بائع مجاناً' : 'Créer mon compte Vendeur')
                  }
                </span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              {/* Demo 1-Click Seller Accounts */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>{isAr ? 'حسابات تجريبية سريعة (1-نقرة)' : 'Comptes Démo (Accès Rapide) :'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSeller(INITIAL_MERCHANTS[1])}
                    className="p-2 text-left bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 rounded-xl transition-colors cursor-pointer group flex items-center gap-2"
                  >
                    <StoreLogo
                      logo={INITIAL_MERCHANTS[1].logo}
                      name={INITIAL_MERCHANTS[1].companyName}
                      category={INITIAL_MERCHANTS[1].category}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                        Caftan Royal
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold truncate">Actif • Casablanca</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoSeller(INITIAL_MERCHANTS[0])}
                    className="p-2 text-left bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 rounded-xl transition-colors cursor-pointer group flex items-center gap-2"
                  >
                    <StoreLogo
                      logo={INITIAL_MERCHANTS[0].logo}
                      name={INITIAL_MERCHANTS[0].companyName}
                      category={INITIAL_MERCHANTS[0].category}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                        Atlas Botanicals
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold truncate">Actif • Agadir</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoSeller(INITIAL_MERCHANTS[2])}
                    className="p-2 text-left bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/80 rounded-xl transition-colors cursor-pointer group flex items-center gap-2"
                    title="Tester la passerelle de vérification Option 2"
                  >
                    <StoreLogo
                      logo={INITIAL_MERCHANTS[2].logo}
                      name={INITIAL_MERCHANTS[2].companyName}
                      category={INITIAL_MERCHANTS[2].category}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                        Zellige Cuir
                      </div>
                      <div className="text-[10px] text-amber-700 font-bold truncate">⏳ En attente (Test)</div>
                    </div>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* ========================================================================= */}
          {/* PROMOTER FORM */}
          {/* ========================================================================= */}
          {activeTab === 'promoter' && (
            <form onSubmit={handlePromoterSubmit} className="space-y-3.5">
              
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isAr ? 'الاسم الكامل (للتحويل البنكي)' : 'Nom Complet (Pour Virements RIB)'} *
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3`} />
                    <input 
                      type="text"
                      required
                      value={promoterFullName}
                      onChange={(e) => setPromoterFullName(e.target.value)}
                      placeholder={isAr ? 'مثال: أمين بنجلون' : 'Ex: Amine Benjelloun'}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Adresse Email'} *
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3`} />
                  <input 
                    type="email"
                    required
                    value={promoterEmail}
                    onChange={(e) => setPromoterEmail(e.target.value)}
                    placeholder="amine@createur.ma"
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all`}
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isAr ? 'حساب إنستغرام أو تيك توك أو القناة' : 'Compte Instagram / TikTok / Réseau'} *
                  </label>
                  <div className="relative">
                    <Instagram className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3`} />
                    <input 
                      type="text"
                      required
                      value={promoterHandle}
                      onChange={(e) => setPromoterHandle(e.target.value)}
                      placeholder="@votre_compte"
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all`}
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {isAr ? 'كلمة المرور' : 'Mot de passe'} *
                  </label>
                  {authMode === 'signin' && (
                    <span className="text-[11px] text-emerald-600 hover:underline cursor-pointer">
                      {isAr ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3`} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={promoterPassword}
                    onChange={(e) => setPromoterPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} top-3 text-slate-400 hover:text-slate-600`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-promoter-auth-btn"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>
                  {authMode === 'signin' 
                    ? (isAr ? 'تسجيل الدخول كمسوق' : 'Se connecter comme Promoteur')
                    : (isAr ? 'الانضمام كمسوق مجاناً' : 'Rejoindre comme Promoteur')
                  }
                </span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              {/* Demo 1-Click Promoter Accounts */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>{isAr ? 'حسابات مسوقين تجريبية (1-نقرة)' : 'Comptes Démo (Accès Rapide) :'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoPromoter('@amine_tech_deals', 'Amine Benjelloun')}
                    className="p-2 text-left bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 flex items-center gap-1 truncate">
                      <span>⚡</span> Amine Deals
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">CIH Bank • Pro</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoPromoter('@sarah_beauty_ma', 'Sarah Kabbaj')}
                    className="p-2 text-left bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 flex items-center gap-1 truncate">
                      <span>💄</span> Sarah Glam
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">Attijariwafa • Beauty</div>
                  </button>
                </div>
              </div>

            </form>
          )}
        </>
      )}

          {/* Security Guarantee Note */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 text-[10px] sm:text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Chiffrement TLS 256-bit • Données sécurisées au Maroc</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Database className="w-3 h-3 text-emerald-600" />
              Firebase Firestore
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
