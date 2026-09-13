import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  MousePointerClick, 
  ShoppingBag, 
  Percent, 
  Clock, 
  Wallet, 
  Link2, 
  Tag, 
  Copy, 
  Check, 
  Search, 
  ExternalLink, 
  Building2, 
  Send, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Smartphone, 
  ArrowUpRight,
  Filter,
  History,
  QrCode,
  Share2,
  CheckCircle,
  FileText,
  UploadCloud,
  Video,
  CreditCard,
  Lock,
  Download,
  XCircle,
  AlertCircle,
  Edit3,
  Camera,
  User,
  Image as ImageIcon,
  Database,
  Loader2,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import confetti from 'canvas-confetti';
import { 
  MerchantProfile, 
  AffiliateLink, 
  PromoCode, 
  AffiliateProfile,
  UGCSubmission,
  WithdrawalRequest
} from '../types';
import { 
  INITIAL_AFFILIATE_PROFILE, 
  INITIAL_MERCHANTS, 
  INITIAL_AFFILIATE_LINKS, 
  INITIAL_PROMO_CODES, 
  INITIAL_UGC_SUBMISSIONS,
  INITIAL_PAYOUT_REQUESTS, 
  MOROCCAN_BANKS 
} from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { StoreLogo } from './StoreLogo';
import { subscribeAffiliateProfile, saveAffiliateProfile } from '../services/accountService';

const PROMOTER_PERFORMANCE_DATA = [
  { day: 'Lun 26', clicks: 240, leads: 9, earningsMAD: 315 },
  { day: 'Mar 27', clicks: 310, leads: 14, earningsMAD: 490 },
  { day: 'Mer 28', clicks: 420, leads: 18, earningsMAD: 630 },
  { day: 'Jeu 29', clicks: 390, leads: 16, earningsMAD: 560 },
  { day: 'Ven 30', clicks: 580, leads: 24, earningsMAD: 840 },
  { day: 'Sam 31', clicks: 640, leads: 29, earningsMAD: 1015 },
  { day: 'Dim 01', clicks: 490, leads: 21, earningsMAD: 735 },
];

export const AffiliateDashboard: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const isAr = language === 'ar';

  // Promoter Profile State
  const [profile, setProfile] = useState<AffiliateProfile>(INITIAL_AFFILIATE_PROFILE);
  const [merchants] = useState<MerchantProfile[]>(INITIAL_MERCHANTS.filter(m => m.status === 'ACTIVE'));
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>(INITIAL_AFFILIATE_LINKS);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [ugcSubmissions, setUgcSubmissions] = useState<UGCSubmission[]>(INITIAL_UGC_SUBMISSIONS);
  const [payouts, setPayouts] = useState<WithdrawalRequest[]>(INITIAL_PAYOUT_REQUESTS);

  // Profile Edit State & Ref
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(profile.fullName);
  const [editNiche, setEditNiche] = useState(profile.niche || 'High-Tech & Gadgets');
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl || '');
  const [editSocialHandle, setEditSocialHandle] = useState(profile.socialHandle || '@amine_tech_deals');
  const [editInstagram, setEditInstagram] = useState(profile.instagramHandle || '@amine_tech_deals');
  const [editTiktok, setEditTiktok] = useState(profile.tiktokHandle || '@amine_reviews_ma');
  const [editYoutube, setEditYoutube] = useState(profile.youtubeChannel || 'Amine Tech Maroc');
  const [editWhatsapp, setEditWhatsapp] = useState(profile.whatsappNumber || '+212 6 61 23 45 67');
  const [editBankName, setEditBankName] = useState(profile.bankName);
  const [editBankRib, setEditBankRib] = useState(profile.bankRib);
  const [editAccountHolder, setEditAccountHolder] = useState(profile.accountHolderName);

  // Real-time Firestore sync for affiliate profile
  useEffect(() => {
    const unsubscribe = subscribeAffiliateProfile(profile.id, (savedProfile) => {
      if (savedProfile) {
        setProfile(savedProfile);
      }
    });
    return () => unsubscribe();
  }, [profile.id]);

  const handleOpenEditProfile = () => {
    setEditFullName(profile.fullName);
    setEditNiche(profile.niche || 'High-Tech & Gadgets');
    setEditAvatarUrl(profile.avatarUrl || '');
    setEditSocialHandle(profile.socialHandle || '@amine_tech_deals');
    setEditInstagram(profile.instagramHandle || '@amine_tech_deals');
    setEditTiktok(profile.tiktokHandle || '@amine_reviews_ma');
    setEditYoutube(profile.youtubeChannel || 'Amine Tech Maroc');
    setEditWhatsapp(profile.whatsappNumber || '+212 6 61 23 45 67');
    setEditBankName(profile.bankName);
    setEditBankRib(profile.bankRib);
    setEditAccountHolder(profile.accountHolderName);
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const updatedData = {
      fullName: editFullName,
      niche: editNiche,
      avatarUrl: editAvatarUrl,
      socialHandle: editSocialHandle,
      instagramHandle: editInstagram,
      tiktokHandle: editTiktok,
      youtubeChannel: editYoutube,
      whatsappNumber: editWhatsapp,
      bankName: editBankName,
      bankRib: editBankRib,
      accountHolderName: editAccountHolder
    };

    // Optimistic local update
    setProfile(prev => ({
      ...prev,
      ...updatedData
    }));

    try {
      await saveAffiliateProfile(profile.id, updatedData);
      showToast('Profil et RIB enregistrés dans Firebase Firestore avec succès !');
      setIsEditProfileModalOpen(false);
    } catch (error) {
      console.error('Error saving affiliate profile to Firestore:', error);
      showToast('Profil mis à jour localement (sauvegarde Firebase en attente)');
      setIsEditProfileModalOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image trop volumineuse (max 5 Mo)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 6 Core Modules: overview | marketplace | links | reports | content-delivery | payouts
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'links' | 'reports' | 'content-delivery' | 'payouts'>('overview');

  // Search & Filters
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // New Link Creation State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedBrandForLink, setSelectedBrandForLink] = useState<MerchantProfile | null>(null);
  const [customLinkSlug, setCustomLinkSlug] = useState('sarah-skincare');
  const [linkChannel, setLinkChannel] = useState<'Instagram' | 'TikTok' | 'WhatsApp' | 'YouTube'>('Instagram');

  // UGC Content Submission State
  const [isSubmitUgcModalOpen, setIsSubmitUgcModalOpen] = useState(false);
  const [ugcBrandId, setUgcBrandId] = useState(merchants[0]?.id || '');
  const [ugcContentUrl, setUgcContentUrl] = useState('https://tiktok.com/@sarah.morocco/video/72899482');
  const [ugcContentType, setUgcContentType] = useState<UGCSubmission['contentType']>('TikTok Reel');
  const [ugcNotes, setUgcNotes] = useState('Vidéo unboxing + test texture du sérum d’Argan avec mon lien en bio.');

  // Payout Request State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmountMAD, setPayoutAmountMAD] = useState<number>(profile.walletBalanceMAD);
  const [selectedBank, setSelectedBank] = useState<string>(profile.bankName);
  const [bankRib, setBankRib] = useState<string>(profile.bankRib);
  const [accountHolder, setAccountHolder] = useState<string>(profile.accountHolderName);

  // Toast & Copy State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calculations
  const totalClicks = affiliateLinks.reduce((sum, l) => sum + l.clicksCount, 0);
  const totalLeadsTracked = affiliateLinks.reduce((sum, l) => sum + l.conversionsCount, 0);

  // Generate New Tracking Link
  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandForLink) return;

    const slug = customLinkSlug.trim() || `promo-${Date.now().toString().slice(-4)}`;
    const newLink: AffiliateLink = {
      id: `link-${Date.now()}`,
      affiliateId: profile.id,
      campaignId: selectedBrandForLink.id,
      merchantName: selectedBrandForLink.storeName,
      originalUrl: selectedBrandForLink.website,
      shortCode: `rkt.ma/c/${slug}`,
      trackingUrl: `https://roketlead.com/r/${slug}?utm_source=${linkChannel.toLowerCase()}`,
      channel: linkChannel,
      clicksCount: 0,
      conversionsCount: 0,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setAffiliateLinks([newLink, ...affiliateLinks]);
    setIsLinkModalOpen(false);
    confetti({ particleCount: 50, spread: 60 });
    showToast(isAr ? 'تم توليد رابط التتبع المخصص بنجاح !' : 'Nouveau lien de tracking rkt.ma créé !');
  };

  // Submit UGC Content
  const handleCreateUgcSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    const brand = merchants.find(m => m.id === ugcBrandId) || merchants[0];
    const newSub: UGCSubmission = {
      id: `ugc-${Date.now()}`,
      promoterId: profile.id,
      promoterName: profile.fullName,
      merchantId: brand.id,
      merchantName: brand.storeName,
      contentType: ugcContentType,
      contentUrl: ugcContentUrl,
      notes: ugcNotes,
      status: 'PENDING_REVIEW',
      bountyRewardMAD: 250,
      submittedAt: new Date().toISOString().substring(0, 10),
    };

    setUgcSubmissions([newSub, ...ugcSubmissions]);
    setIsSubmitUgcModalOpen(false);
    confetti({ particleCount: 60, spread: 70 });
    showToast(isAr ? 'تم إرسال محتوى الفيديو للمراجعة من طرف المتجر' : 'Contenu UGC soumis avec succès pour validation et prime.');
  };

  // Request Payout
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmountMAD < 200) {
      alert(isAr ? 'الحد الأدنى لطلب السحب هو 200 درهم مغربي.' : 'Le montant minimum de retrait est de 200 MAD.');
      return;
    }
    if (payoutAmountMAD > profile.walletBalanceMAD) {
      alert(isAr ? 'المبلغ المطلوب يتجاوز رصيدك المتاح.' : 'Le montant dépasse votre solde disponible.');
      return;
    }

    const newReq: WithdrawalRequest = {
      id: `pay-${Date.now()}`,
      promoterId: profile.id,
      promoterName: profile.fullName,
      amountMAD: payoutAmountMAD,
      bankName: selectedBank,
      bankRib: bankRib,
      status: 'PENDING',
      requestedAt: new Date().toISOString().substring(0, 10),
    };

    setPayouts([newReq, ...payouts]);
    setProfile(prev => ({
      ...prev,
      walletBalanceMAD: prev.walletBalanceMAD - payoutAmountMAD,
    }));
    setIsPayoutModalOpen(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    showToast(isAr 
      ? `تم تقديم طلب سحب ${payoutAmountMAD.toLocaleString()} د.م بنجاح إلى حسابك في ${selectedBank}` 
      : `Demande de virement de ${payoutAmountMAD.toLocaleString()} MAD transmise vers ${selectedBank} !`
    );
  };

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    return merchants.filter(b => {
      const matchSearch = 
        b.storeName.toLowerCase().includes(brandSearch.toLowerCase()) ||
        b.category.toLowerCase().includes(brandSearch.toLowerCase()) ||
        b.city.toLowerCase().includes(brandSearch.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [merchants, brandSearch, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Promoter Profile & Balances */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Promoter Identity */}
            <div className="flex items-center gap-3.5">
              <div 
                onClick={handleOpenEditProfile}
                className="relative group cursor-pointer shrink-0"
                title="Modifier ma photo de profil"
              >
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.fullName} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40 shadow-xs group-hover:opacity-85 transition-opacity" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-500/30 flex items-center justify-center font-bold text-emerald-800 text-sm shrink-0 group-hover:bg-emerald-200 transition-colors">
                    {(profile.fullName || 'Amine B').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                    {profile.fullName}
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    {profile.niche || 'Créateur & Promoteur'}
                  </span>
                  <button
                    onClick={handleOpenEditProfile}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Modifier profil</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5 flex-wrap">
                  <span className="text-blue-600 font-bold">{profile.socialHandle || profile.instagramHandle || '@promoter'}</span>
                  <span>•</span>
                  <span>RIB : {profile.bankName} (****{(profile.bankRib || '0000').slice(-4)})</span>
                </div>
              </div>
            </div>

            {/* Balances & Quick Withdrawal CTA */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              
              {/* Available Balance Pill */}
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2 shadow-2xs">
                <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Solde Retirable : <strong className="text-emerald-700 text-sm font-black">{(profile.walletBalanceMAD ?? profile.availableBalanceMAD ?? 0).toLocaleString()} MAD</strong></span>
              </div>

              {/* Pending Anti-Fraud Hold Pill */}
              <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Hold (48h) : <strong>{(profile.pendingBalanceMAD ?? profile.pendingCommissionMAD ?? 0).toLocaleString()} MAD</strong></span>
              </div>

              {/* Withdraw Button */}
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Demander Virement</span>
              </button>

            </div>

          </div>
        </div>

        {/* 6 Core Module Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2.5">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{language === 'ar' ? 'لوحة التحكم' : 'Vue d’ensemble'}</span>
            </button>

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{language === 'ar' ? 'سوق المتاجر' : 'Marketplace Marques'}</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-bold">
                {merchants.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'links'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'روابطي وعروضي' : 'Mes Liens & Campagnes'}</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{language === 'ar' ? 'التقارير والأداء' : 'Rapports & Performance'}</span>
            </button>

            <button
              onClick={() => setActiveTab('content-delivery')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'content-delivery'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{language === 'ar' ? 'تسليم المحتوى UGC' : 'Livraisons de Contenu'}</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-blue-100 text-blue-800 rounded-full font-bold">
                Bounty Prime
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'payouts'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{language === 'ar' ? 'سحب الأرباح (RIB)' : 'Retrait des Gains (RIB)'}</span>
            </button>

          </div>
        </div>
      </div>

      {/* Main Module Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">

        {/* ========================================================================= */}
        {/* MODULE 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Solde Retirable */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Solde Disponible (MAD)</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Wallet className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                  {(profile.walletBalanceMAD ?? profile.availableBalanceMAD ?? 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">MAD</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Prêt pour virement bancaire RIB</span>
                </div>
              </div>

              {/* Solde en Période Anti-Fraude (Hold 48h) */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-200 transition-colors">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">En Rétention (Hold 48h)</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
                  {(profile.pendingBalanceMAD ?? profile.pendingCommissionMAD ?? 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">MAD</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span>Libéré automatiquement après 48h</span>
                </div>
              </div>

              {/* Total Commissions Générées */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Gains Cumulés</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {(profile.totalEarnedMAD ?? 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">MAD</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
                  <span>Depuis votre inscription</span>
                </div>
              </div>

              {/* Leads Confirmés (Thank You Page) */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-colors">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Leads Trackés (Thank You)</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <CheckCircle className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {totalLeadsTracked}
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-purple-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                  <span>Taux de conversion global : 4.4%</span>
                </div>
              </div>

            </div>

            {/* Performance Chart & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Performance Chart */}
              <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      Gains Quotidiens & Leads Trackés
                    </h2>
                    <p className="text-xs text-slate-500">
                      Attribution directe lors de la redirection Thank You Page
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                    7 derniers jours
                  </span>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PROMOTER_PERFORMANCE_DATA}>
                      <defs>
                        <linearGradient id="promoterEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          color: '#fff', 
                          borderRadius: '12px', 
                          border: 'none',
                          fontSize: '12px' 
                        }} 
                      />
                      <Area type="monotone" dataKey="earningsMAD" name="Gains (MAD)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#promoterEarnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sidebar: Hold explanation & Quick Generator */}
              <div className="space-y-6">
                
                {/* Hold Banner */}
                <div className="p-5 bg-gradient-to-br from-emerald-950 to-slate-950 text-white rounded-2xl shadow-md border border-emerald-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Règlement Garanti par Séquestre</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Vos gains sont pré-bloqués sous séquestre dès que le client valide sa commande sur la Thank You Page. Déblocage sous 48h sans aucun frais.
                  </p>
                  <button
                    onClick={() => setIsPayoutModalOpen(true)}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Demander un virement RIB</span>
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Actions Rapides Promoteur
                  </h3>
                  
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>Explorer les marques & offres</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedBrandForLink(merchants[0]);
                      setIsLinkModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Link2 className="w-4 h-4 text-blue-600" />
                      <span>Générer un lien court rkt.ma</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => setIsSubmitUgcModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span>Soumettre un Reel / TikTok (Prime)</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: MARKETPLACE MARQUES (BRAND DIRECTORY) */}
        {/* ========================================================================= */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Search & Filter Header */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950 tracking-tight">
                    Marketplace des Boutiques & Marques E-commerce Marocaines
                  </h2>
                  <p className="text-xs text-slate-500">
                    Rejoignez les programmes de marques vérifiées et touchez des commissions garanties sur chaque lead Thank You Page.
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  {filteredBrands.length} Marques Actives
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Rechercher par nom de marque, catégorie ou ville (Casablanca, Marrakech...)"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="ALL">Toutes les catégories</option>
                  <option value="Cosmétique & Beauté">Cosmétique & Beauté</option>
                  <option value="Artisanat & Déco">Artisanat & Déco</option>
                  <option value="High-Tech & Gadgets">High-Tech & Gadgets</option>
                  <option value="Mode & Habillement">Mode & Habillement</option>
                </select>
              </div>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrands.map(brand => (
                <div key={brand.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 shrink-0">
                        <StoreLogo slug={brand.slug} storeName={brand.storeName} size="md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-950 truncate">{brand.storeName}</h3>
                        <div className="text-xs text-slate-500">{brand.city}, Maroc</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {brand.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {brand.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div>
                        <div className="text-xs font-bold text-emerald-700">35 à 50 MAD</div>
                        <div className="text-[10px] text-slate-500">Par Lead Confirmé</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-600">30 Jours</div>
                        <div className="text-[10px] text-slate-500">Durée Cookie</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Pixel Thank You Actif</span>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedBrandForLink(brand);
                        setIsLinkModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Obtenir Mon Lien</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: MES LIENS & CAMPAGNES */}
        {/* ========================================================================= */}
        {activeTab === 'links' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <h2 className="text-lg font-black text-slate-950 tracking-tight">
                  Mes Liens de Tracking & Codes Promo Assignés
                </h2>
                <p className="text-xs text-slate-500">
                  Diffusez vos liens courts rkt.ma personnalisés sur Instagram, TikTok ou vos groupes WhatsApp.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedBrandForLink(merchants[0]);
                  setIsLinkModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Lien Court</span>
              </button>
            </div>

            {/* Links List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {affiliateLinks.map(link => (
                <div key={link.id} className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800">
                        {link.channel}
                      </span>
                      <h3 className="text-base font-bold text-slate-950 mt-1.5">{link.merchantName}</h3>
                      <div className="text-xs font-mono font-bold text-blue-600 mt-1">{link.shortCode}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(link.trackingUrl, link.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === link.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === link.id ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{link.clicksCount}</div>
                      <div className="text-[10px] text-slate-500">Clics Totaux</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-700">{link.conversionsCount}</div>
                      <div className="text-[10px] text-slate-500">Leads Thank You</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate">
                    Destination : <span className="font-mono text-slate-700">{link.originalUrl}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: RAPPORTS & PERFORMANCE */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-lg font-black text-slate-950 tracking-tight">
                Historique des Leads & Commissions Trackées
              </h2>
              <p className="text-xs text-slate-500">
                Transparence complète sur chaque événement Thank You Page généré par votre audience.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Réf Lead</th>
                      <th className="p-4">Boutique / Marque</th>
                      <th className="p-4">Date & Heure</th>
                      <th className="p-4">Ville Client</th>
                      <th className="p-4">Commission</th>
                      <th className="p-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-4 font-mono font-bold text-slate-900">#LEAD-8819</td>
                      <td className="p-4 font-bold text-slate-900">Atlas Botanicals</td>
                      <td className="p-4 text-slate-500">Aujourd’hui 14:22</td>
                      <td className="p-4 text-slate-700">Casablanca</td>
                      <td className="p-4 font-bold text-emerald-700">35.00 MAD</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          <span>Hold 48h (En attente)</span>
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-4 font-mono font-bold text-slate-900">#LEAD-8814</td>
                      <td className="p-4 font-bold text-slate-900">Atlas Botanicals</td>
                      <td className="p-4 text-slate-500">Hier 18:05</td>
                      <td className="p-4 text-slate-700">Rabat</td>
                      <td className="p-4 font-bold text-emerald-700">35.00 MAD</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span>Validé (Solde Disponible)</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 5: LIVRAISONS DE CONTENU (UGC SUBMISSIONS) */}
        {/* ========================================================================= */}
        {activeTab === 'content-delivery' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <h2 className="text-lg font-black text-slate-950 tracking-tight">
                  Livraisons de Contenu UGC & Primes Créateurs
                </h2>
                <p className="text-xs text-slate-500">
                  Soumettez vos vidéos TikTok/Reels publiées pour validation par les marques et débloquez des primes de création additionnelles.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitUgcModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Soumettre un Contenu</span>
              </button>
            </div>

            {/* UGC Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ugcSubmissions.map(sub => (
                <div key={sub.id} className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-800">
                        {sub.contentType}
                      </span>
                      <h3 className="text-sm font-bold text-slate-950 mt-1.5">{sub.merchantName}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">Soumis le {sub.submittedAt}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-purple-700">+{sub.bountyRewardMAD} MAD</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Prime Bounty</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{sub.notes}"
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="font-bold text-amber-700">En cours de révision par la marque</span>
                    <a href={sub.contentUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                      <span>Voir la vidéo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 6: RETRAIT DES GAINS (RIB) */}
        {/* ========================================================================= */}
        {activeTab === 'payouts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Balance Overview & Payout CTA */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950 tracking-tight">
                    Retrait des Gains vers votre RIB Marocain
                  </h2>
                  <p className="text-xs text-slate-500">
                    Virement bancaire direct sans frais vers CIH, Attijariwafa, Bank of Africa, Banque Populaire.
                  </p>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Demander un Virement</span>
                </button>
              </div>

              {/* Bank Account Info Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Compte Bancaire Enregistré</div>
                  <div className="text-sm font-bold text-slate-900">{profile.bankName} — {profile.accountHolderName}</div>
                  <div className="text-xs font-mono text-slate-600 font-bold mt-0.5">{profile.bankRib}</div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 w-fit">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>RIB Vérifié</span>
                </span>
              </div>
            </div>

            {/* Payout History Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-950">Historique des Virements Bancaires</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Réf Virement</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Montant (MAD)</th>
                      <th className="p-4">Banque & RIB</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Reçu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payouts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="p-4 font-mono font-bold text-slate-900">{p.transactionReference || p.id}</td>
                        <td className="p-4 text-slate-500">{p.requestedAt}</td>
                        <td className="p-4 font-black text-emerald-700">{p.amountMAD.toLocaleString()} MAD</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{p.bankName}</div>
                          <div className="font-mono text-[10px] text-slate-500">{p.bankRib}</div>
                        </td>
                        <td className="p-4">
                          {p.status === 'PROCESSED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              <span>Virement Effectué</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              <span>En attente de traitement</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => showToast(isAr ? 'تم تحميل إشعار التحويل البنكي' : 'Reçu de virement RIB téléchargé.')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Télécharger
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Create Link Modal */}
      {isLinkModalOpen && selectedBrandForLink && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Générer un Lien de Tracking</h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marque Sélectionnée</label>
                <input
                  type="text"
                  readOnly
                  value={selectedBrandForLink.storeName}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug Personnalisé (rkt.ma/c/...)</label>
                <input
                  type="text"
                  required
                  value={customLinkSlug}
                  onChange={(e) => setCustomLinkSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Canal de Promotion Principal</label>
                <select
                  value={linkChannel}
                  onChange={(e: any) => setLinkChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="Instagram">Instagram (Bio / Story)</option>
                  <option value="TikTok">TikTok Bio</option>
                  <option value="WhatsApp">WhatsApp Groups / Story</option>
                  <option value="YouTube">YouTube Description</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Générer le Lien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UGC Submission Modal */}
      {isSubmitUgcModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Soumettre une Vidéo UGC pour Prime</h3>
              <button onClick={() => setIsSubmitUgcModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUgcSubmission} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marque Cible</label>
                <select
                  value={ugcBrandId}
                  onChange={(e) => setUgcBrandId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.storeName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lien de la Vidéo Publiée (TikTok / Reel)</label>
                <input
                  type="url"
                  required
                  value={ugcContentUrl}
                  onChange={(e) => setUgcContentUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes ou statistiques d’engagement</label>
                <textarea
                  rows={3}
                  value={ugcNotes}
                  onChange={(e) => setUgcNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitUgcModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Envoyer la Soumission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Demande de Virement RIB (Maroc)</h3>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Montant à retirer (MAD)</label>
                <input
                  type="number"
                  min={200}
                  max={profile.walletBalanceMAD}
                  required
                  value={payoutAmountMAD}
                  onChange={(e) => setPayoutAmountMAD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  Solde disponible maximum : {(profile.walletBalanceMAD ?? profile.availableBalanceMAD ?? 0).toLocaleString()} MAD (Minimum 200 MAD)
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banque Marocaine</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  {MOROCCAN_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RIB (24 Chiffres)</label>
                <input
                  type="text"
                  required
                  value={bankRib}
                  onChange={(e) => setBankRib(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
                ⚡ <strong>Exécution sous 24-48h</strong> ouvrables directement sur votre compte bancaire.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Valider la Demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile & Photo Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-950">Modifier mon Profil Promoteur</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Database className="w-3 h-3 text-emerald-600" />
                      Firebase Firestore
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Mettez à jour vos coordonnées et votre RIB enregistrés en base de données</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditProfileModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Photo de profil Upload / Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Photo de profil / Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    {editAvatarUrl ? (
                      <img 
                        src={editAvatarUrl} 
                        alt="Avatar preview" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center font-bold text-emerald-800 text-xl">
                        {(editFullName || 'A').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      onChange={handleAvatarFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Téléverser une photo</span>
                      </button>
                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl('')}
                          className="px-2.5 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">Formats PNG, JPG ou WebP (max. 5 Mo)</p>
                  </div>
                </div>
              </div>

              {/* Nom complet & Niche */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="ex: Amine Benjelloun"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Niche / Domaine</label>
                  <select
                    value={editNiche}
                    onChange={(e) => setEditNiche(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="High-Tech & Gadgets">High-Tech & Gadgets</option>
                    <option value="Mode & Caftans">Mode & Caftans</option>
                    <option value="Santé & Cosmétiques">Santé & Cosmétiques</option>
                    <option value="Maison & Décoration">Maison & Décoration</option>
                    <option value="Lifestyle & Vlog">Lifestyle & Vlog</option>
                    <option value="Fitness & Nutrition">Fitness & Nutrition</option>
                  </select>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={editInstagram}
                    onChange={(e) => {
                      setEditInstagram(e.target.value);
                      setEditSocialHandle(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="@votre_compte"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TikTok Handle</label>
                  <input
                    type="text"
                    value={editTiktok}
                    onChange={(e) => setEditTiktok(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="@tiktok_user"
                  />
                </div>
              </div>

              {/* Coordonnées Bancaires (RIB Maroc) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coordonnées Bancaires pour les Virements (RIB)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Banque Partenaire</label>
                    <select
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                    >
                      {MOROCCAN_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Titulaire du compte (RIB)</label>
                    <input
                      type="text"
                      required
                      value={editAccountHolder}
                      onChange={(e) => setEditAccountHolder(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      placeholder="Nom exact du titulaire"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Numéro RIB (24 Chiffres)</label>
                  <input
                    type="text"
                    required
                    maxLength={24}
                    value={editBankRib}
                    onChange={(e) => setEditBankRib(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="230 780 0000000000000000 00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold cursor-pointer shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enregistrement dans Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Enregistrer dans la base de données</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
