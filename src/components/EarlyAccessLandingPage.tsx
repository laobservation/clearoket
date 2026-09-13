import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Sparkles, 
  Store, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  CreditCard, 
  Check, 
  Copy, 
  Send, 
  Lock, 
  Star,
  ExternalLink,
  ChevronRight,
  Code2,
  Percent,
  Layers,
  PhoneCall,
  Flame,
  AlertCircle,
  Sliders,
  Link2,
  MousePointerClick,
  BadgeDollarSign,
  HelpCircle,
  Scale,
  Calculator
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { registerNewMerchant } from '../services/accountService';

interface EarlyAccessLandingPageProps {
  onNavigateHome?: () => void;
  onOpenSignIn?: (tab?: 'seller' | 'promoter') => void;
  onOpenSignUp?: (tab?: 'seller' | 'promoter') => void;
}

export const EarlyAccessLandingPage: React.FC<EarlyAccessLandingPageProps> = ({
  onNavigateHome,
  onOpenSignIn,
  onOpenSignUp
}) => {
  const { language, setLanguage, isRTL } = useLanguage();
  
  // Local state for early access lead form
  const [activeTab, setActiveTab] = useState<'seller' | 'promoter'>('seller');
  
  // Interactive How It Works tab toggle
  const [howItWorksTab, setHowItWorksTab] = useState<'merchant' | 'affiliate'>('merchant');
  
  // Form states
  const [sellerForm, setSellerForm] = useState({
    fullName: '',
    whatsapp: '',
    storeUrl: '',
    platform: 'YouCan',
    monthlyOrders: '100 - 500 commandes / mois',
    city: 'Casablanca'
  });

  const [promoterForm, setPromoterForm] = useState({
    fullName: '',
    whatsapp: '',
    socialHandle: '',
    niche: 'Fashion & Beauté',
    audienceSize: '10k - 50k followers',
    city: 'Casablanca'
  });

  // Interactive Simulator State (ROI en Dirhams MAD)
  const [affiliateCount, setAffiliateCount] = useState<number>(35);
  const [avgOrderValueMAD, setAvgOrderValueMAD] = useState<number>(450);
  const [salesPerAffiliateMonth, setSalesPerAffiliateMonth] = useState<number>(20);

  // Calculated estimates for Moroccan Dirhams
  const estimatedMonthlyOrders = affiliateCount * salesPerAffiliateMonth;
  const estimatedMonthlyVolumeMAD = estimatedMonthlyOrders * avgOrderValueMAD;
  const estimatedAffiliatePayoutMAD = estimatedMonthlyVolumeMAD * 0.12; // 12% avg commission
  const estimatedNetNewRevenueMAD = estimatedMonthlyVolumeMAD - estimatedAffiliatePayoutMAD;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<null | {
    role: 'seller' | 'promoter';
    name: string;
    queueNumber: number;
    accessCode: string;
  }>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  // Smooth scroll to lead form
  const scrollToForm = (tab: 'seller' | 'promoter') => {
    setActiveTab(tab);
    const element = document.getElementById('early-access-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.fullName || !sellerForm.whatsapp || !sellerForm.storeUrl) return;

    setIsSubmitting(true);
    try {
      const waitlistEmail = `${sellerForm.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@waitlist.roketlead.ma`;
      
      // 1. Add to waitlist collection
      await addDoc(collection(db, 'waitlist'), {
        fullName: sellerForm.fullName.trim(),
        email: waitlistEmail,
        role: 'Merchant',
        phone: sellerForm.whatsapp.trim(),
        storeUrl: sellerForm.storeUrl.trim(),
        platform: sellerForm.platform,
        monthlyOrders: sellerForm.monthlyOrders,
        city: sellerForm.city,
        createdAt: serverTimestamp()
      });

      // 2. Add to merchants collection in Firestore with PENDING_APPROVAL so it appears in Brand Approvals
      const storeNameFromUrl = sellerForm.storeUrl
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/^www\./, '') || sellerForm.fullName;

      await registerNewMerchant({
        companyName: sellerForm.fullName.trim(),
        storeName: storeNameFromUrl,
        website: sellerForm.storeUrl.trim(),
        category: 'E-commerce',
        city: sellerForm.city || 'Casablanca',
        platformType: (['YouCan', 'Shopify', 'WooCommerce'].includes(sellerForm.platform) ? sellerForm.platform : 'YouCan') as any,
        supportPhone: sellerForm.whatsapp.trim(),
        email: waitlistEmail,
        description: `Early Access VIP - ${sellerForm.monthlyOrders} commandes/mois (${sellerForm.platform})`
      });
    } catch (err) {
      console.warn('Could not save early access seller to Firestore:', err);
    }

    setIsSubmitting(false);
    setSubmitSuccess({
      role: 'seller',
      name: sellerForm.fullName,
      queueNumber: Math.floor(Math.random() * 20) + 12,
      accessCode: `RKT-VIP-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const handlePromoterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoterForm.fullName || !promoterForm.whatsapp || !promoterForm.socialHandle) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'waitlist'), {
        fullName: promoterForm.fullName.trim(),
        email: `${promoterForm.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@waitlist.roketlead.ma`,
        role: 'Creator',
        phone: promoterForm.whatsapp.trim(),
        socialHandle: promoterForm.socialHandle.trim(),
        niche: promoterForm.niche,
        audienceSize: promoterForm.audienceSize,
        city: promoterForm.city,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Could not save early access promoter to Firestore:', err);
    }

    setIsSubmitting(false);
    setSubmitSuccess({
      role: 'promoter',
      name: promoterForm.fullName,
      queueNumber: Math.floor(Math.random() * 25) + 18,
      accessCode: `RKT-AFF-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isAr = language === 'ar';

  return (
    <div 
      className={`min-h-screen bg-[#F8FAFC] text-[#0B0F19] selection:bg-blue-600 selection:text-white font-sans ${isAr ? 'font-arabic' : ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Sub-header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-semibold py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            {isAr ? 'عرض الإطلاق الحصري' : 'Offre VIP Lancement'}
          </span>
          <span>
            {isAr 
              ? '🔥 استفد من 0% عمولة للمتاجر ووصول مبكر لأعلى العروض للمسوقين لأول 100 مسجل.'
              : '🔥 0% de commission plateforme pendant 3 mois pour les 100 premiers vendeurs inscrits.'}
          </span>
          <button 
            onClick={() => scrollToForm('seller')} 
            className="underline font-bold hover:text-blue-100 transition-colors ml-1 cursor-pointer"
          >
            {isAr ? 'سجل الآن' : 'Réserver ma place'} &rarr;
          </button>
        </div>
      </div>

      {/* Dedicated Minimal Brand Header (Logo & Language Switcher Only - No Links, No Login) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              roketlead<span className="text-blue-600">.</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-full">
              {isAr ? 'وصول مبكر' : 'Early Access'}
            </span>
          </div>

          {/* Language Switcher Only */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === 'fr' 
                    ? 'bg-white text-blue-600 shadow-xs' 
                    : 'hover:text-slate-900'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === 'ar' 
                    ? 'bg-white text-blue-600 shadow-xs' 
                    : 'hover:text-slate-900'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* ===================== HERO SECTION ===================== */}
        <section className="text-center max-w-4xl mx-auto pt-4 sm:pt-10 pb-16 sm:pb-20">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-2xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>
              {isAr 
                ? 'أول منصة مغربية ذكية للتسويق بالعمولة والتجارة الإلكترونية' 
                : 'Plateforme d\'Affiliation E-commerce N°1 au Maroc'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] mb-6">
            {isAr ? (
              <>
                ضاعف مبيعات متجرك وأرباحك{' '}
                <span className="relative whitespace-nowrap text-blue-600">
                  <span className="relative z-10">بدون مخاطرة إعلانية</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-blue-100 -rotate-1 rounded-sm -z-10" />
                </span>{' '}
                في المغرب.
              </>
            ) : (
              <>
                Multipliez vos ventes et vos commissions e-commerce{' '}
                <span className="relative whitespace-nowrap text-blue-600">
                  <span className="relative z-10">au Maroc</span>
                  <span className="absolute bottom-1.5 left-0 right-0 h-3 bg-blue-100 -rotate-1 rounded-sm -z-10" />
                </span>.
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            {isAr 
              ? 'المنصة الذكية التي تمكّن المتاجر الإلكترونية من إنشاء روابط أفيلييت خاصة وتحديد عمولة كل ليد بحرية. خلص غير فاش يوصل الزبون لصفحة الشكر (Thank You Page).'
              : 'La plateforme qui connecte les marques e-commerce aux meilleurs affiliés. Créez vos propres liens, fixez vos commissions et payez uniquement lorsqu\'un prospect atteint votre page de remerciement (Thank You Page).'}
          </p>

          {/* Dual Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              id="early-hero-seller-btn"
              onClick={() => scrollToForm('seller')}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-2xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <Store className="w-5 h-5 text-blue-200" />
              <span>{isAr ? 'ابدأ كبائع (متجر إلكتروني)' : 'Démarrer en tant que Vendeur'}</span>
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </button>

            <button
              id="early-hero-promoter-btn"
              onClick={() => scrollToForm('promoter')}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-900 bg-white hover:bg-slate-50 active:scale-98 border border-slate-200/90 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'انضم كمسوق / مؤثّر' : 'Devenir Promoteur / Affilié'}</span>
            </button>
          </div>

          {/* Social Proof & Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 border-t border-slate-200/60 text-xs sm:text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isAr ? 'تتبع فوري على صفحة الشكر (Thank You Page)' : 'Tracking Pixel Thank You Page'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isAr ? 'روابط مخصصة وعمولة محددة' : 'Liens personnalisés & Commissions libres'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isAr ? 'تحويل بنكي مباشر (RIB Maroc)' : 'Paiements directs RIB Maroc'}</span>
            </div>
          </div>

        </section>

        {/* ===================== SECTION: HOW IT WORKS (COMMENT ÇA MARCHE ?) ===================== */}
        <section className="mb-24 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4 shadow-2xs">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'بساطة مطلقة وسرعة في التنفيذ' : 'Processus Simple & 100% Automatisé'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {isAr ? 'كيف يعمل RoketLead ؟' : 'Comment fonctionne RoketLead ?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              {isAr 
                ? '3 خطوات مباشرة لإطلاق برنامج الأفيلييت الخاص بمتجرك أو لبدء الربح كمسوق معتمد.'
                : '3 étapes simples pour lancer l\'affiliation de votre boutique ou générer des gains en tant qu\'affilié.'}
            </p>

            {/* Interactive Toggle Switch */}
            <div className="inline-flex p-1.5 bg-slate-200/70 rounded-2xl mt-8 border border-slate-300/60 shadow-inner">
              <button
                type="button"
                onClick={() => setHowItWorksTab('merchant')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  howItWorksTab === 'merchant'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>{isAr ? 'لأصحاب المتاجر (Vendeurs)' : 'Pour les Vendeurs'}</span>
              </button>
              <button
                type="button"
                onClick={() => setHowItWorksTab('affiliate')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  howItWorksTab === 'affiliate'
                    ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{isAr ? 'للمسوقين (Affiliés)' : 'Pour les Affiliés'}</span>
              </button>
            </div>
          </div>

          {/* Tab Content: For Merchants */}
          {howItWorksTab === 'merchant' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-200">
              
              {/* Step 1: Merchant */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {isAr ? 'الخطوة 01' : 'Étape 01'}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                      <Sliders className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    {isAr ? 'أضف منتجك وحدد عمولتك بحرية' : 'Créez votre lien & Fixez votre commission'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isAr 
                      ? 'أضف منتجك وحدد بحرية العمولة التي ترغب بدفعها: من 5 دراهم إلى أكثر من 200 درهم لكل ليد (أو نسبة مئوية) حسب هامش ربحك.'
                      : 'Ajoutez votre produit & fixez librement votre commission: de 5 DH à 200+ DH par Lead (ou % personnalisé selon votre marge).'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-600">
                  <BadgeDollarSign className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'تحكم كامل من 5 دراهم إلى 200+ درهم' : 'Liberté totale : 5 DH à 200+ DH/lead'}</span>
                </div>
              </div>

              {/* Step 2: Merchant */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {isAr ? 'الخطوة 02' : 'Étape 02'}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                      <Link2 className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    {isAr ? 'شارك الروابط مع المسوقين' : 'Partagez vos liens avec les affiliés'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isAr 
                      ? 'أنشئ روابط أفيلييت فريدة وشاركها مباشرة مع صناع المحتوى والمسوقين المعتمدين والمؤثرين لجلب زوار مهتمين بمنتجاتك.'
                      : 'Générez vos liens d\'affiliation uniques et donnez-les aux créateurs, influenceurs et spécialistes média pour promouvoir votre offre.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-600">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'شبكة مسوقين جاهزة في المغرب' : 'Réseau de promoteurs qualifiés'}</span>
                </div>
              </div>

              {/* Step 3: Merchant */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600/30 bg-gradient-to-b from-blue-50/30 to-white shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-600 text-white">
                      {isAr ? 'الخطوة 03' : 'Étape 03'}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    {isAr ? 'ادفع فقط عند صفحة الشكر (Thank You Page)' : 'Payez uniquement à la Thank You Page'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isAr 
                      ? 'ادفع العمولة فقط عندما يملأ الزبون استمارة الطلب ويصل إلى صفحة الشكر (Thank You Page). 0% مخاطرة وصفر درهم ضائع.'
                      : 'Payez uniquement quand le prospect valide le formulaire et atteint la Thank You Page. 0% risque, zéro budget publicitaire gaspillé.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-100 flex items-center gap-2 text-xs font-bold text-blue-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{isAr ? 'تتبع بيكسل دقيق بنقرة واحدة' : 'Pixel Thank You Page 1-clic'}</span>
                </div>
              </div>

            </div>
          )}

          {/* Tab Content: For Affiliates */}
          {howItWorksTab === 'affiliate' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-200">
              
              {/* Step 1: Affiliate */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {isAr ? 'الخطوة 01' : 'Étape 01'}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
                      <Store className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    {isAr ? 'اختر المتجر واحصل على رابطك' : 'Choisissez une marque & Prenez votre lien'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isAr 
                      ? 'تصفح المتاجر الشريكة، تحقق من العمولة المحددة من طرف البائع (من 5 دراهم إلى 200+ درهم/ليد) واحصل على رابط التتبع الخاص بك.'
                      : 'Choisissez une marque, vérifiez la commission fixée par le vendeur (de 5 DH à 200+ DH par Lead) et récupérez votre lien tracké.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'عروض حصرية بنسب تحويل عالية' : 'Offres à forte conversion'}</span>
                </div>
              </div>

              {/* Step 2: Affiliate */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {isAr ? 'الخطوة 02' : 'Étape 02'}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
                      <MousePointerClick className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    {isAr ? 'روّج بحرية لجمهورك' : 'Promouvez où vous voulez'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isAr 
                      ? 'شارك الرابط مع جمهورك ومتابعيك على تيك توك، إنستغرام، واتساب، فيسبوك أو عبر حملاتك الإعلانية الخاصة.'
                      : 'Partagez le lien avec votre audience sur TikTok, Instagram, WhatsApp, vos groupes ou via vos campagnes Ads.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'حرية تامة في قنوات التسويق' : 'Liberté de diffusion totale'}</span>
                </div>
              </div>

              {/* Step 3: Affiliate */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-50/30 to-white shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600 text-white">
                      {isAr ? 'الخطوة 03' : 'Étape 03'}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    {isAr ? 'تتبع أرباحك واسحب لحسابك البنكي' : 'Suivez vos gains & Encaissez sur votre RIB'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isAr 
                      ? 'كل ليد يصل لصفحة الشكر (Thank You Page) يحتسب في رصيدك مباشرة. اسحب أرباحك بضغطة زر عبر تحويل بنكي مغربي RIB.'
                      : 'Chaque prospect arrivé sur la Thank You Page crédite votre solde instantanément. Retrait direct vers votre compte bancaire (RIB Maroc).'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{isAr ? 'سحب بنكي دوري وموثوق' : 'Paiements réguliers par virement'}</span>
                </div>
              </div>

            </div>
          )}
        </section>

        {/* ===================== SECTION: COMPARISON — ROKETLEAD VS META ADS ===================== */}
        <section className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-4 shadow-2xs">
              <Scale className="w-3.5 h-3.5 text-rose-600" />
              <span>{isAr ? 'مقارنة الجدوى المالية والربحية' : 'Comparatif Rentabilité & Risque'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {isAr ? 'RoketLead مقابل إعلانات Meta Ads' : 'RoketLead vs Meta Ads (Facebook / Instagram)'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              {isAr 
                ? 'توقف عن حرق ميزانيتك الإعلانية على المشاهدات والنقرات العشوائية. ادفع فقط على النتائج الحقيقية.'
                : 'Arrêtez de payer pour des clics et des impressions inutiles. Payez uniquement pour des résultats réels sur votre Thank You Page.'}
            </p>
          </div>

          {/* Desktop & Tablet Comparison Table */}
          <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden hidden md:block">
            <table className="w-full text-left border-collapse" dir={isAr ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-5 px-6 text-sm font-black text-slate-900 w-1/3">
                    {isAr ? 'المعيار / نوع التكلفة' : 'Métrique / Coût'}
                  </th>
                  <th className="py-5 px-6 text-sm font-bold text-rose-700 bg-rose-50/50 border-x border-slate-200 w-1/3">
                    <div className="flex items-center gap-2">
                      <span>Meta Ads (Facebook / Instagram) 💸</span>
                    </div>
                  </th>
                  <th className="py-5 px-6 text-sm font-black text-blue-700 bg-blue-50/50 w-1/3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>RoketLead 🚀</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                
                {/* Row 1: CPM */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div>
                      <span>{isAr ? 'تكلفة الألف ظهور (CPM)' : 'CPM (Coût par 1 000 impressions)'}</span>
                      <p className="text-xs font-normal text-slate-500 mt-0.5">
                        {isAr ? 'تكلفة عرض الإعلان للمشاهدين' : 'Facturation sur les vues'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-rose-600 font-semibold bg-rose-50/20 border-x border-slate-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{isAr ? 'تدفع على المشاهدات بدون أي ضمان للبيع' : 'Payez pour des vues sans garantie de résultat'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-blue-700 font-bold bg-blue-50/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="font-extrabold text-emerald-700">0 DH</span>
                      <span className="text-slate-600 font-normal">({isAr ? 'ظهور مجاني بالكامل' : 'Impressions gratuites'})</span>
                    </div>
                  </td>
                </tr>

                {/* Row 2: CPC */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div>
                      <span>{isAr ? 'تكلفة النقرة (CPC)' : 'CPC (Coût par Clic)'}</span>
                      <p className="text-xs font-normal text-slate-500 mt-0.5">
                        {isAr ? 'النقرات على الروابط والزيارات' : 'Trafic et clics vers la boutique'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-rose-600 font-semibold bg-rose-50/20 border-x border-slate-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{isAr ? 'تدفع على النقرات العشوائية والزيارات غير الجادة' : 'Payez pour les clics accidentels et bots'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-blue-700 font-bold bg-blue-50/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="font-extrabold text-emerald-700">0 DH</span>
                      <span className="text-slate-600 font-normal">({isAr ? 'زيارات وترافيك مجاني 100%' : 'Trafic gratuit'})</span>
                    </div>
                  </td>
                </tr>

                {/* Row 3: CPA & Risk */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div>
                      <span>{isAr ? 'مستوى المخاطرة المالية (Risk & CPA)' : 'CPA & Risque Financier'}</span>
                      <p className="text-xs font-normal text-slate-500 mt-0.5">
                        {isAr ? 'ضمان العائد على الاستثمار' : 'Garantie de rentabilité'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-rose-600 font-semibold bg-rose-50/20 border-x border-slate-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{isAr ? 'مخاطرة بـ 100% من ميزانيتك حتى لو لم يشترِ أحد' : '100% du risque sur votre budget si 0 vente'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-blue-700 font-bold bg-blue-50/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="font-extrabold text-emerald-700">{isAr ? '0% مخاطرة' : '0% Risque'}</span>
                      <span className="text-slate-600 font-normal">({isAr ? 'تدفع فقط على كل ليد مؤكد' : 'Payez uniquement par Lead validé'})</span>
                    </div>
                  </td>
                </tr>

                {/* Row 4: Ad Taxes */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div>
                      <span>{isAr ? 'الضرائب والرسوم الإعلانية الإضافية' : 'Taxes Publicitaires Obligatoires'}</span>
                      <p className="text-xs font-normal text-slate-500 mt-0.5">
                        {isAr ? 'الضرائب المفروضة على البطاقات' : 'Frais et taxes supplémentaires'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-rose-600 font-semibold bg-rose-50/20 border-x border-slate-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{isAr ? 'ضريبة إعلانات إضافية إجبارية +20%' : 'Taxe publicitaire obligatoire +20%'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-blue-700 font-bold bg-blue-50/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="font-extrabold text-emerald-700">0 DH</span>
                      <span className="text-slate-600 font-normal">({isAr ? 'بدون أي ضرائب إعلانية إضافية' : '0 DH de taxe pub'})</span>
                    </div>
                  </td>
                </tr>

                {/* Row 5: Payment Trigger */}
                <tr className="hover:bg-slate-50/50 transition-colors bg-blue-50/10">
                  <td className="py-4 px-6 font-black text-slate-950">
                    <div>
                      <span>{isAr ? 'شرط ولحظة الدفع' : 'Déclencheur de Paiement'}</span>
                      <p className="text-xs font-normal text-slate-500 mt-0.5">
                        {isAr ? 'متى يخرج الدرهم من جيبك' : 'Quand payez-vous réellement ?'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-rose-600 font-semibold bg-rose-50/30 border-x border-slate-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{isAr ? 'تدفع مسبقاً لميتا قبل رؤية أي نتيجة' : 'Paiement d\'avance sans garantie'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-blue-700 font-black bg-blue-100/40">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                      <span className="text-slate-950 font-bold">
                        {isAr ? 'خلص غير فاش يوصل الزبون لـ Thank You Page' : 'Payez UNIQUEMENT à la Thank You Page'}
                      </span>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Mobile Comparison Cards */}
          <div className="md:hidden space-y-4 max-w-md mx-auto">
            
            {/* Card 1: CPM */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm">
                {isAr ? 'تكلفة المشاهدات (CPM)' : 'CPM (Impressions)'}
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Meta: </span>
                  <span>{isAr ? 'تدفع للمشاهدات بدون أي ضمان للبيع' : 'Payez pour des vues sans garantie'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs flex items-start gap-2 border border-blue-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">RoketLead: </span>
                  <span className="font-extrabold text-emerald-700">0 DH </span>
                  <span>({isAr ? 'ظهور مجاني' : 'Gratuit'})</span>
                </div>
              </div>
            </div>

            {/* Card 2: CPC */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm">
                {isAr ? 'تكلفة النقرات (CPC)' : 'CPC (Clics)'}
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Meta: </span>
                  <span>{isAr ? 'تدفع للنقرات العشوائية والزيارات التائهة' : 'Payez les clics inutiles'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs flex items-start gap-2 border border-blue-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">RoketLead: </span>
                  <span className="font-extrabold text-emerald-700">0 DH </span>
                  <span>({isAr ? 'ترافيك مجاني 100%' : 'Trafic 100% gratuit'})</span>
                </div>
              </div>
            </div>

            {/* Card 3: Risk & CPA */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm">
                {isAr ? 'مستوى المخاطرة المالية (Risk)' : 'CPA & Risque'}
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Meta: </span>
                  <span>{isAr ? '100% مخاطرة على ميزانيتك' : '100% du risque sur vous'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs flex items-start gap-2 border border-blue-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">RoketLead: </span>
                  <span className="font-extrabold text-emerald-700">{isAr ? '0% مخاطرة' : '0% Risque'}</span>
                  <span> ({isAr ? 'الدفع على كل ليد مؤكد فقط' : 'Paiement au Lead'})</span>
                </div>
              </div>
            </div>

            {/* Card 4: Ad Taxes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm">
                {isAr ? 'الضرائب الإعلانية' : 'Taxes Publicitaires'}
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Meta: </span>
                  <span>{isAr ? 'ضريبة إجبارية +20%' : 'Taxe obligatoire +20%'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs flex items-start gap-2 border border-blue-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">RoketLead: </span>
                  <span className="font-extrabold text-emerald-700">0 DH </span>
                  <span>({isAr ? 'بدون ضريبة إضافية' : '0 DH de taxe pub'})</span>
                </div>
              </div>
            </div>

            {/* Card 5: Payment Trigger */}
            <div className="bg-white p-5 rounded-2xl border-2 border-blue-600/40 shadow-sm space-y-3">
              <div className="font-black text-slate-950 text-sm">
                {isAr ? 'شرط الدفع الفعلي' : 'Déclencheur de Paiement'}
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Meta: </span>
                  <span>{isAr ? 'دفع مسبق بدون أي ضمان' : 'Paiement d\'avance obligatoire'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-600 text-white text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">RoketLead: </span>
                  <span className="font-black">
                    {isAr ? 'خلص غير فاش يوصل الزبون لصفحة الشكر (Thank You Page)' : 'Payez UNIQUEMENT à la Thank You Page'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ===================== SECTION: INTERACTIVE SIMULATOR (SIMULATEUR DE REVENUS EN MAD) ===================== */}
        <section className="mb-24 scroll-mt-24">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {isAr ? 'محاكي نمو المبيعات بالدرهم المغربي' : 'Simulateur de Croissance Chiffre d’Affaires MAD'}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {isAr ? 'قدّر أرباحك ومبيعاتك الإضافية عبر شبكة المسوقين' : 'Estimez votre chiffre d’affaires additionnel avec RoketLead'}
              </h3>
              <p className="text-slate-400 text-sm mb-10">
                {isAr ? 'حرّك المؤشرات لمعرفة الحجم الشهري المتوقع بالدرهم المغربي بتكلفة 0% عمولة منصة في مرحلة الإطلاق.' : 'Ajustez les curseurs ci-dessous pour simuler votre volume mensuel en Dirhams (MAD) avec 0% de frais plateforme.'}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Sliders */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Slider 1: Affiliates */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-300">
                        {isAr ? 'عدد المسوقين والمؤثرين النشطين' : 'Promoteurs & Créateurs actifs'}
                      </label>
                      <span className="text-lg font-bold text-blue-400">
                        {affiliateCount} {isAr ? 'مسوق' : 'créateurs'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      step="5"
                      value={affiliateCount}
                      onChange={(e) => setAffiliateCount(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Slider 2: Average Order Value (AOV) in MAD */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-300">
                        {isAr ? 'متوسط قيمة السلة (AOV)' : 'Panier Moyen (AOV)'}
                      </label>
                      <span className="text-lg font-bold text-emerald-400">
                        {avgOrderValueMAD.toLocaleString()} {isAr ? 'د.م' : 'MAD'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="2000"
                      step="50"
                      value={avgOrderValueMAD}
                      onChange={(e) => setAvgOrderValueMAD(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Slider 3: Sales per promoter / month */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-300">
                        {isAr ? 'متوسط الليدات/المبيعات لكل مسوق / شهر' : 'Leads générés par promoteur / mois'}
                      </label>
                      <span className="text-lg font-bold text-purple-400">
                        {salesPerAffiliateMonth} {isAr ? 'ليد' : 'leads'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="5"
                      value={salesPerAffiliateMonth}
                      onChange={(e) => setSalesPerAffiliateMonth(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                </div>

                {/* Calculation Output Card */}
                <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-7 border border-white/20 text-center">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    {isAr ? 'إجمالي مبيعات الإحالة الشهرية المتوقعة' : 'Volume Mensuel Affiliation Estimé (GMV)'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                    {estimatedMonthlyVolumeMAD.toLocaleString()} <span className="text-sm font-bold text-blue-300">{isAr ? 'د.م' : 'MAD'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    {isAr 
                      ? `توليد حوالي ${estimatedMonthlyOrders.toLocaleString()} ليد جديد شهرياً عبر صفحة الشكر (Thank You Page).` 
                      : `Générant environ ${estimatedMonthlyOrders.toLocaleString()} nouveaux Leads qualifiés (Thank You Page) par mois.`}
                  </p>

                  <div className="bg-black/30 rounded-xl p-4 space-y-2 text-left text-xs mb-6 border border-white/5" dir="ltr">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Commissions Affiliés (~12%):</span>
                      <span className="font-bold text-slate-200">{estimatedAffiliatePayoutMAD.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                      <span className="text-blue-300">Chiffre d’Affaires Net Marque:</span>
                      <span className="text-white text-sm">{estimatedNetNewRevenueMAD.toLocaleString()} MAD</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollToForm('seller')}
                    className="w-full py-3 text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <span>{isAr ? 'احجز مكانك في الوصول المبكر (0% عمولة)' : 'Réserver mon Accès VIP (0% commission)'}</span>
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ===================== EARLY ACCESS LEAD FORM SECTION ===================== */}
        <section id="early-access-form-section" className="scroll-mt-24 mb-24">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            
            {/* Form Top Switcher Tabs */}
            <div className="grid grid-cols-2 p-2 bg-slate-100/80 border-b border-slate-200">
              <button
                type="button"
                onClick={() => { setActiveTab('seller'); setSubmitSuccess(null); }}
                className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'seller'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{isAr ? 'أصحاب المتاجر (Vendeurs)' : 'E-commerçants & Vendeurs'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('promoter'); setSubmitSuccess(null); }}
                className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'promoter'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{isAr ? 'المسوقون والمؤثرون (Affiliés)' : 'Affiliés & Créateurs'}</span>
              </button>
            </div>

            {/* Form Content Area */}
            <div className="p-6 sm:p-10">
              
              {/* Submission Success State */}
              {submitSuccess ? (
                <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-2">
                      {isAr ? 'تم تأكيد تسجيلك في القائمة ذات الأولوية 🎉' : 'Inscription Prioritaire Validée 🎉'}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
                      {isAr ? `مرحباً بك، ${submitSuccess.name} !` : `Félicitations, ${submitSuccess.name} !`}
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                      {isAr 
                        ? `لقد حجزت مكانك في قائمة الوصول المبكر (الرقم #${submitSuccess.queueNumber}). سيتواصل معك فريق روكيت ليد عبر الواتساب لتفعيل حسابك مجاناً.`
                        : `Vous êtes en position VIP #${submitSuccess.queueNumber} sur notre liste d'attente. Notre équipe vous contactera sous 24h sur WhatsApp pour activer votre compte.`}
                    </p>
                  </div>

                  {/* Priority VIP Pass Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>{isAr ? 'رمز الأولوية الحصري' : 'Code d\'accès VIP'}</span>
                      <span className="text-emerald-600 font-bold">0% Commission Activée</span>
                    </div>
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                      <span className="font-mono font-black text-base tracking-wider text-slate-900">
                        {submitSuccess.accessCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(submitSuccess.accessCode)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copié') : (isAr ? 'نسخ' : 'Copier')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(null)}
                      className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      {isAr ? 'تسجيل متجر أو حساب آخر' : 'Inscrire un autre profil'}
                    </button>
                    {onNavigateHome && (
                      <button
                        type="button"
                        onClick={onNavigateHome}
                        className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
                      >
                        {isAr ? 'العودة للرئيسية' : 'Découvrir la plateforme'}
                      </button>
                    )}
                  </div>
                </div>
              ) : activeTab === 'seller' ? (
                
                /* ================= TAB 1: BUSINESS OWNERS / VENDEURS ================= */
                <form onSubmit={handleSellerSubmit} className="space-y-5">
                  <div className="border-b border-slate-100 pb-4 mb-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                      <Percent className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isAr ? 'عرض الإطلاق: 0% عمولة منصة لأول 3 أشهر' : 'Offre VIP : 0% de commission pendant 3 mois'}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                      {isAr ? 'أنشئ روابطك وخلص غير فاش يوصل الزبون لصفحة الشكر' : 'Créez vos liens & payez uniquement à la Thank You Page'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {isAr 
                        ? 'أنشئ روابط أفيلييت خاصة بمنتجاتك وحدد قيمة العمولة لي بغيتي تعطي على كل ليد. تتبع دقيق بالبيكسل.'
                        : 'Créez vos propres liens d\'affiliation et fixez librement la commission (en DH ou %) à payer par prospect qualifié (Lead).'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'الاسم الكامل أو اسم المسؤول *' : 'Nom et Prénom *'}
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder={isAr ? 'مثال: مهدي بنجلون' : 'ex. Mehdi Alaoui'}
                        value={sellerForm.fullName}
                        onChange={e => setSellerForm({ ...sellerForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'رقم الواتساب للتواصل والتفعيل *' : 'Numéro WhatsApp (Maroc) *'}
                      </label>
                      <input 
                        type="tel" 
                        required
                        placeholder="06 XX XX XX XX / +212"
                        value={sellerForm.whatsapp}
                        onChange={e => setSellerForm({ ...sellerForm, whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'رابط المتجر الإلكتروني *' : 'Lien de votre Boutique / Site Web *'}
                      </label>
                      <input 
                        type="url" 
                        required
                        placeholder="https://maboutique.ma"
                        value={sellerForm.storeUrl}
                        onChange={e => setSellerForm({ ...sellerForm, storeUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'منصة المتجر' : 'Plateforme E-commerce'}
                      </label>
                      <select
                        value={sellerForm.platform}
                        onChange={e => setSellerForm({ ...sellerForm, platform: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all bg-slate-50/50 cursor-pointer"
                      >
                        <option value="YouCan">YouCan.shop</option>
                        <option value="Shopify">Shopify</option>
                        <option value="WooCommerce">WooCommerce / WordPress</option>
                        <option value="Custom">Boutique Sur-Mesure / Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'حجم الطلبات الشهري الحالي' : 'Volume de commandes mensuel'}
                      </label>
                      <select
                        value={sellerForm.monthlyOrders}
                        onChange={e => setSellerForm({ ...sellerForm, monthlyOrders: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all bg-slate-50/50 cursor-pointer"
                      >
                        <option value="Moins de 50">{isAr ? 'أقل من 50 طلب / شهر' : 'Moins de 50 commandes / mois'}</option>
                        <option value="50 - 200">{isAr ? '50 إلى 200 طلب / شهر' : '50 à 200 commandes / mois'}</option>
                        <option value="200 - 1000">{isAr ? '200 إلى 1,000 طلب / شهر' : '200 à 1,000 commandes / mois'}</option>
                        <option value="+1000">{isAr ? '+1,000 طلب / شهر (حجم عالي)' : '+1 000 commandes / mois (Scale)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'المدينة / المقر' : 'Ville au Maroc'}
                      </label>
                      <input 
                        type="text" 
                        placeholder={isAr ? 'الدار البيضاء، مراكش، طنجة...' : 'Casablanca, Rabat, Marrakech...'}
                        value={sellerForm.city}
                        onChange={e => setSellerForm({ ...sellerForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{isAr ? 'انضم لقائمة انتظار المتاجر (0% عمولة)' : 'Rejoindre la liste d\'attente Vendeurs (0% Commission)'}</span>
                          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{isAr ? 'بياناتك محمية 100% ولن تتم مشاركتها أبداً.' : 'Données confidentielles et sécurisées. Sans engagement.'}</span>
                    </p>
                  </div>
                </form>

              ) : (

                /* ================= TAB 2: PROMOTERS / AFFILIÉS ================= */
                <form onSubmit={handlePromoterSubmit} className="space-y-5">
                  <div className="border-b border-slate-100 pb-4 mb-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'عمولات مضمونة على كل ليد (Thank You Page)' : 'Gagnez des commissions garanties sur chaque Lead'}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                      {isAr ? 'سوق لبراندات مغربية بروابط تتبع مخصصة' : 'Rejoindre la liste d\'attente Promoteurs & Affiliés'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {isAr 
                        ? 'احصل على روابط تتبع ذكية بعمولات يحددها أصحاب المتاجر، تتبع فوري للطلبات، وسحب بنكي مباشر.'
                        : 'Accédez à des liens d\'affiliation exclusifs avec commissions fixées par les marques et encaissez vos gains sur votre compte bancaire.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'الاسم الكامل *' : 'Nom complet *'}
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder={isAr ? 'مثال: سارة القباج' : 'ex. Sara Kabbaj'}
                        value={promoterForm.fullName}
                        onChange={e => setPromoterForm({ ...promoterForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'رقم الواتساب للتواصل *' : 'Numéro WhatsApp (Maroc) *'}
                      </label>
                      <input 
                        type="tel" 
                        required
                        placeholder="06 XX XX XX XX / +212"
                        value={promoterForm.whatsapp}
                        onChange={e => setPromoterForm({ ...promoterForm, whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'حسابك على إنستغرام أو تيك توك / موقعك *' : 'Profil Social / Instagram / TikTok / Site *'}
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="@username ou https://..."
                        value={promoterForm.socialHandle}
                        onChange={e => setPromoterForm({ ...promoterForm, socialHandle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'المجال / النيش المفضل' : 'Niche / Catégorie principale'}
                      </label>
                      <select
                        value={promoterForm.niche}
                        onChange={e => setPromoterForm({ ...promoterForm, niche: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all bg-slate-50/50 cursor-pointer"
                      >
                        <option value="Fashion & Beauté">{isAr ? 'الموضة والجمال (Fashion & Beauty)' : 'Mode, Cosmétique & Beauté'}</option>
                        <option value="Tech & Gadgets">{isAr ? 'الإلكترونيات والتقنية (Electronics & Tech)' : 'Tech, Gadgets & Électronique'}</option>
                        <option value="Artisanat & Terroir">{isAr ? 'المنتجات التقليدية والمحلية' : 'Artisanat & Produits du Terroir'}</option>
                        <option value="Maison & Déco">{isAr ? 'المنزل والديكور' : 'Maison & Cuisine'}</option>
                        <option value="Media Buying">{isAr ? 'ميديا بايينغ وإعلانات مدفوعة (Media Buyer)' : 'Media Buyer / Trafic Payant'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'حجم الجمهور / المتابعين التقريبي' : 'Taille d\'audience ou canaux de diffusion'}
                      </label>
                      <select
                        value={promoterForm.audienceSize}
                        onChange={e => setPromoterForm({ ...promoterForm, audienceSize: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all bg-slate-50/50 cursor-pointer"
                      >
                        <option value="1k - 10k">1,000 - 10,000 followers / visiteurs</option>
                        <option value="10k - 50k">10,000 - 50,000 followers</option>
                        <option value="+50k">+50,000 followers</option>
                        <option value="MediaBuyer">Media Buyer / WhatsApp Groups / Telegram</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isAr ? 'المدينة' : 'Ville'}
                      </label>
                      <input 
                        type="text" 
                        placeholder={isAr ? 'الدار البيضاء، فاس، طنجة...' : 'Casablanca, Marrakech, Agadir...'}
                        value={promoterForm.city}
                        onChange={e => setPromoterForm({ ...promoterForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{isAr ? 'انضم لقائمة انتظار المسوقين (VIP Access)' : 'Rejoindre la liste d\'attente Promoteurs'}</span>
                          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{isAr ? 'قبول فوري ومجاني لأوائل المسوقين المعتمدين.' : 'Accès gratuit sans abonnement. Vos informations restent privées.'}</span>
                    </p>
                  </div>
                </form>

              )}

            </div>
          </div>
        </section>

        {/* ===================== VALUE PROPOSITION GRID ===================== */}
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {isAr ? 'لماذا تختار منصة RoketLead ؟' : 'Pourquoi choisir RoketLead ?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              {isAr 
                ? 'حلول مصممة ومبنية خصيصاً لسوق التجارة الإلكترونية بالمغرب بنظام التتبع الفوري للّيدات والتحكم في العمولات.'
                : 'Conçu spécifiquement pour le marché e-commerce marocain : tracking instantané par Lead et maîtrise absolue de vos liens.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column 1: For Sellers */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 text-lg">
                      {isAr ? 'مزايا أصحاب المتاجر الإلكترونية' : 'Avantages pour les Vendeurs'}
                    </h3>
                    <span className="text-xs font-semibold text-blue-600">
                      {isAr ? 'تتبع فوري للّيدات وتحكم كامل في العمولات' : 'Tracking Instantané & Maîtrise des Coûts'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {isAr ? 'الدفع فقط عند الوصول لصفحة الشكر (Thank You Page)' : 'Paiement Uniquement à la Thank You Page'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isAr 
                          ? 'خلص غير فاش يوصل الزبون لصفحة الشكر (Thank You Page). تتبع فوري عبر بيكسل فائق الدقة بنقرة واحدة.'
                          : 'Payez uniquement lorsqu\'un prospect atteint votre page de remerciement (Thank You Page). Tracking Pixel ultra-précis en 1-clic.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {isAr ? 'إنشاء روابط أفيلييت وتحديد العمولة بحرية' : 'Liens Personnalisés & Commission par Lead'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isAr 
                          ? 'أنشئ روابط أفيلييت خاصة بمنتجاتك وحدد قيمة العمولة لي بغيتي تعطي على كل ليد.'
                          : 'Créez vos propres liens d\'affiliation et fixez librement la commission (en DH ou %) à payer par prospect qualifié (Lead).'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {isAr ? 'تركيب بيكسل فوري بدون أي برمجة' : 'Intégration No-Code 1-Clic'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isAr 
                          ? 'تكامل سلس وسريع مع YouCan و Shopify و WooCommerce لتفعيل شبكة المسوقين بضغطة زر.'
                          : 'Installation instantanée de notre script pixel sur votre boutique YouCan, Shopify ou WooCommerce sans développeur.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => scrollToForm('seller')}
                  className="w-full py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isAr ? 'طلب وصول مبكر لمتجري' : 'Demander l\'accès Vendeur'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Column 2: For Promoters */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 text-lg">
                      {isAr ? 'مزايا المسوقين وصناع المحتوى' : 'Avantages pour les Affiliés'}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-600">
                      {isAr ? 'عمولات مباشرة ومضمونة على كل ليد' : 'Monétisation Directe par Prospect (Lead)'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {isAr ? 'عمولات مؤكدة فور وصول العميل لصفحة الشكر' : 'Commissions Validées à la Thank You Page'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isAr 
                          ? 'تحتسب عمولتك فور وصول الزائر لصفحة تأكيد الطلب، مع روابط تتبع حصرية وعروض مباشرة من المتاجر.'
                          : 'Chaque prospect qui valide sa commande sur la Thank You Page déclenche immédiatement votre commission garantie.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {isAr ? 'تحويل بنكي مباشر لحسابك (RIB Maroc)' : 'Paiements Directs sur Compte Bancaire'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isAr 
                          ? 'سحب دوري سريع لأرباحك عبر تحويل بنكي لجميع البنوك المغربية (CIH, Attijariwafa, Bank of Africa وغيرها).'
                          : 'Virement bancaire direct vers toutes les banques marocaines (CIH, Attijariwafa, BOA...) pour récupérer vos gains.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {isAr ? 'لوحة تحكم شفافة وتتبع دقيق للروابط' : 'Dashboard Temps Réel & Liens Trackés'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isAr 
                          ? 'شاهد كل نقرة وكل ليد محقق في الوقت الفعلي مع إحصائيات دقيقة وشفافة بنسبة 100%.'
                          : 'Générez vos liens d\'affiliation avec vos paramètres de campagne et suivez chaque prospect en temps réel.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => scrollToForm('promoter')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isAr ? 'الانضمام كمسوق معتمد' : 'Rejoindre en tant qu\'Affilié'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ===================== INTEGRATION ECOSYSTEM BADGES ===================== */}
        <section className="mb-20 text-center">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-6">
            {isAr ? 'متوافق ومتكامل مع كبرى المنصات والبنوك المغربية' : 'Compatible avec l\'écosystème E-commerce & Bancaire Marocain'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              YouCan.shop
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              Shopify
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              WooCommerce
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              CIH Bank
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              Attijariwafa bank
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              Bank of Africa
            </span>
            <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              Thank You Page Pixel
            </span>
          </div>
        </section>

      </div>

      {/* ===================== MINIMALIST FOOTER ===================== */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-slate-950">
              roketlead<span className="text-blue-600">.</span>
            </span>
            <span className="text-xs text-slate-400 border-l border-slate-200 pl-3">
              Early Access Program
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
            {onNavigateHome && (
              <button 
                onClick={onNavigateHome}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                {isAr ? 'الرئيسية' : 'Accueil'}
              </button>
            )}
            <button 
              onClick={() => scrollToForm('seller')} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {isAr ? 'قائمة المتاجر' : 'Vendeurs'}
            </button>
            <button 
              onClick={() => scrollToForm('promoter')} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {isAr ? 'قائمة المسوقين' : 'Affiliés'}
            </button>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} RoketLead Inc. {isAr ? 'جميع الحقوق محفوظة بالمغرب.' : 'Tous droits réservés.'}
          </div>

        </div>
      </footer>
    </div>
  );
};
