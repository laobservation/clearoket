import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Key, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  ShieldCheck, 
  Download, 
  Play, 
  RefreshCw, 
  Globe, 
  FileCode2, 
  Layers, 
  ArrowRight,
  Info,
  ChevronDown,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle,
  FileText,
  UploadCloud,
  Send,
  Sliders,
  HelpCircle,
  Share2,
  Calendar,
  Lock,
  Smartphone,
  CreditCard,
  Percent,
  Database,
  CloudCheck,
  Loader2,
  CheckCheck,
  ShieldAlert,
  ArrowUpRight,
  Eye,
  FileSpreadsheet,
  Edit3,
  Camera,
  User,
  Image as ImageIcon,
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
  Campaign, 
  PromoCode, 
  CommissionType,
  CreatorDiscoveryItem,
  ContentAsset,
  EscrowWallet,
  LeadValidationItem,
  WithdrawalRequest
} from '../types';
import { 
  INITIAL_MERCHANTS, 
  INITIAL_PROMO_CODES,
  INITIAL_CREATORS,
  INITIAL_CONTENT_ASSETS,
  INITIAL_ESCROW_WALLET,
  INITIAL_LEAD_VALIDATIONS,
  INITIAL_PAYOUT_REQUESTS,
  MOROCCAN_BANKS
} from '../data/mockData';
import { TRACKER_JS_CODE } from '../integrations/trackerSource';
import { WOOCOMMERCE_PLUGIN_CODE } from '../integrations/woocommercePluginSource';
import { useLanguage } from '../context/LanguageContext';
import { StoreLogo } from './StoreLogo';
import { subscribeMerchants, saveMerchantProfile } from '../services/accountService';

interface MerchantDashboardProps {
  onSwitchToAffiliateView?: () => void;
}

const PERFORMANCE_DATA_7D = [
  { day: 'Lun 26', clicks: 1420, leads: 48, rate: '3.38%', spendMAD: 1680 },
  { day: 'Mar 27', clicks: 1890, leads: 64, rate: '3.39%', spendMAD: 2240 },
  { day: 'Mer 28', clicks: 2150, leads: 76, rate: '3.53%', spendMAD: 2660 },
  { day: 'Jeu 29', clicks: 2400, leads: 82, rate: '3.41%', spendMAD: 2870 },
  { day: 'Ven 30', clicks: 2890, leads: 98, rate: '3.39%', spendMAD: 3430 },
  { day: 'Sam 31', clicks: 3120, leads: 114, rate: '3.65%', spendMAD: 3990 },
  { day: 'Dim 01', clicks: 2650, leads: 89, rate: '3.35%', spendMAD: 3115 },
];

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  onSwitchToAffiliateView
}) => {
  const { language, t, isRTL } = useLanguage();
  const isAr = language === 'ar';

  // Store Selection
  const [merchants, setMerchants] = useState<MerchantProfile[]>(INITIAL_MERCHANTS);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('merch-01');

  // 6 Core Modules: overview | creators | campaigns | lead-validation | content-library | payments
  const [activeTab, setActiveTab] = useState<'overview' | 'creators' | 'campaigns' | 'lead-validation' | 'content-library' | 'payments' | 'pixel'>('overview');

  // Lead Validation / Anti-Fraud State
  const [leads, setLeads] = useState<LeadValidationItem[]>(INITIAL_LEAD_VALIDATIONS);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('ALL');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeLeadForFlag, setActiveLeadForFlag] = useState<LeadValidationItem | null>(null);
  const [flagReason, setFlagReason] = useState('Numéro non joignable / faux lead bot');

  // Creator Marketplace State
  const [creators, setCreators] = useState<CreatorDiscoveryItem[]>(INITIAL_CREATORS);
  const [creatorSearch, setCreatorSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [invitingCreator, setInvitingCreator] = useState<CreatorDiscoveryItem | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteCommissionMAD, setInviteCommissionMAD] = useState(35);

  // Content Library State
  const [assets, setAssets] = useState<ContentAsset[]>(INITIAL_CONTENT_ASSETS);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('ALL');
  const [isUploadAssetModalOpen, setIsUploadAssetModalOpen] = useState(false);
  const [newAssetTitle, setNewAssetTitle] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<ContentAsset['category']>('High-Res Photos');
  const [newAssetDescription, setNewAssetDescription] = useState('');

  // Escrow & Payments State
  const [escrowWallet, setEscrowWallet] = useState<EscrowWallet>(INITIAL_ESCROW_WALLET);
  const [payouts, setPayouts] = useState<WithdrawalRequest[]>(INITIAL_PAYOUT_REQUESTS);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmountMAD, setTopUpAmountMAD] = useState(10000);

  // Campaigns & Links State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignLandingUrl, setCampaignLandingUrl] = useState('https://atlasbotanicals.ma/products/serum-argan');
  const [commissionType, setCommissionType] = useState<CommissionType>('FIXED_MAD');
  const [commissionVal, setCommissionVal] = useState(35);
  const [holdPeriodSetting, setHoldPeriodSetting] = useState(48);
  const [assignedPromoterName, setAssignedPromoterName] = useState('Amine Benjelloun');

  // Link Generator Tool
  const [linkChannel, setLinkChannel] = useState<'Instagram' | 'TikTok' | 'WhatsApp' | 'YouTube'>('Instagram');
  const [linkSlug, setLinkSlug] = useState('amine-argan');
  const [generatedShortLink, setGeneratedShortLink] = useState('rkt.ma/c/amine-argan');

  // Pixel / Integrations Code Tab
  const [pixelCodeTab, setPixelCodeTab] = useState<'tracker' | 'woocommerce'>('tracker');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Toast Feedback
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Selected Merchant
  const currentMerchant = useMemo(() => {
    return merchants.find(m => m.id === selectedMerchantId) || merchants[0];
  }, [merchants, selectedMerchantId]);

  // Real-time Firestore synchronization
  useEffect(() => {
    const unsubscribe = subscribeMerchants((fetchedMerchants) => {
      if (fetchedMerchants && fetchedMerchants.length > 0) {
        setMerchants(fetchedMerchants);
      }
    });
    return () => unsubscribe();
  }, []);

  // Merchant Store Profile Edit State
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isEditStoreModalOpen, setIsEditStoreModalOpen] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [editStoreName, setEditStoreName] = useState(currentMerchant.storeName);
  const [editCategory, setEditCategory] = useState(currentMerchant.category);
  const [editCity, setEditCity] = useState(currentMerchant.city);
  const [editWebsite, setEditWebsite] = useState(currentMerchant.website);
  const [editPhone, setEditPhone] = useState(currentMerchant.supportPhone || '+212 5 22 34 56 78');
  const [editLogoUrl, setEditLogoUrl] = useState(currentMerchant.logoUrl || '');
  const [editDefaultPayoutMAD, setEditDefaultPayoutMAD] = useState(currentMerchant.defaultPayoutMAD);
  const [editHoldPeriodHours, setEditHoldPeriodHours] = useState(currentMerchant.holdPeriodHours || 48);

  const handleOpenEditStore = () => {
    setEditStoreName(currentMerchant.storeName);
    setEditCategory(currentMerchant.category);
    setEditCity(currentMerchant.city);
    setEditWebsite(currentMerchant.website);
    setEditPhone(currentMerchant.supportPhone || '+212 5 22 34 56 78');
    setEditLogoUrl(currentMerchant.logoUrl || '');
    setEditDefaultPayoutMAD(currentMerchant.defaultPayoutMAD);
    setEditHoldPeriodHours(currentMerchant.holdPeriodHours || 48);
    setIsEditStoreModalOpen(true);
  };

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStore(true);

    const updatedFields = {
      storeName: editStoreName,
      category: editCategory as any,
      city: editCity,
      website: editWebsite,
      supportPhone: editPhone,
      logoUrl: editLogoUrl,
      defaultPayoutMAD: editDefaultPayoutMAD,
      holdPeriodHours: editHoldPeriodHours
    };

    // Optimistic local update
    setMerchants(prev => prev.map(m => {
      if (m.id === currentMerchant.id) {
        return {
          ...m,
          ...updatedFields
        };
      }
      return m;
    }));

    try {
      await saveMerchantProfile(currentMerchant.id, updatedFields);
      showToast('Boutique mise à jour et enregistrée dans Firebase Firestore !');
      setIsEditStoreModalOpen(false);
    } catch (error) {
      console.error('Failed to save store to Firestore:', error);
      showToast('Profil mis à jour localement (sauvegarde Firebase en attente)');
      setIsEditStoreModalOpen(false);
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image trop volumineuse (max 5 Mo)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Lead Validation Actions
  const handleApproveLead = (leadId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, status: 'APPROVED' };
      }
      return l;
    }));
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    showToast(isAr ? 'تم تأكيد وتحرير عمولة الليد بنجاح' : 'Lead validé avec succès ! Commission débloquée.');
  };

  const handleFlagLeadFake = (leadId: string, reason: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { 
          ...l, 
          status: 'FLAGGED_FAKE', 
          fraudFlags: [...l.fraudFlags, reason] 
        };
      }
      return l;
    }));
    setActiveLeadForFlag(null);
    showToast(isAr ? 'تم حظر وإلغاء الليد الاحتيالي بنجاح' : 'Fake lead signalé et rejeté du calcul des commissions.');
  };

  const handleBulkApprove = () => {
    if (selectedLeadIds.length === 0) return;
    setLeads(prev => prev.map(l => {
      if (selectedLeadIds.includes(l.id)) {
        return { ...l, status: 'APPROVED' };
      }
      return l;
    }));
    setSelectedLeadIds([]);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    showToast(isAr ? `تم تأكيد ${selectedLeadIds.length} ليد بنجاح` : `${selectedLeadIds.length} leads validés en lot.`);
  };

  const handleBulkFlagFake = () => {
    if (selectedLeadIds.length === 0) return;
    setLeads(prev => prev.map(l => {
      if (selectedLeadIds.includes(l.id)) {
        return { ...l, status: 'FLAGGED_FAKE', fraudFlags: [...l.fraudFlags, 'Rejet groupé par le marchand'] };
      }
      return l;
    }));
    setSelectedLeadIds([]);
    showToast(isAr ? `تم حظر ${selectedLeadIds.length} ليد مشبوه` : `${selectedLeadIds.length} fake leads rejetés.`);
  };

  // Invite Creator
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitingCreator) return;
    confetti({ particleCount: 50, spread: 60 });
    showToast(isAr 
      ? `تم إرسال دعوة الشراكة إلى ${invitingCreator.fullName} بنجاح` 
      : `Invitation de partenariat envoyée à ${invitingCreator.fullName} (${inviteCommissionMAD} MAD / Lead Thank You Page).`
    );
    setInvitingCreator(null);
    setInviteMessage('');
  };

  // Create Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCampaignModalOpen(false);
    confetti({ particleCount: 60, spread: 70 });
    showToast(isAr 
      ? `تم إنشاء الحملة "${campaignTitle}" وتوليد الروابط بنجاح` 
      : `Nouvelle campagne "${campaignTitle}" créée (${commissionVal} ${commissionType === 'PERCENTAGE' ? '%' : 'MAD'} par Thank You Page).`
    );
  };

  // Upload Content Asset
  const handleUploadAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsset: ContentAsset = {
      id: `asset-${Date.now()}`,
      merchantId: currentMerchant.id,
      title: newAssetTitle,
      category: newAssetCategory,
      fileFormat: 'ZIP / HD Files',
      fileSize: '45 MB',
      downloadUrl: '#',
      description: newAssetDescription,
      downloadsCount: 0,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setAssets([newAsset, ...assets]);
    setIsUploadAssetModalOpen(false);
    setNewAssetTitle('');
    setNewAssetDescription('');
    showToast(isAr ? 'تم إضافة الملف إلى مكتبة المحتوى بنجاح' : 'Nouvel asset ajouté à la bibliothèque créative.');
  };

  // Top up escrow
  const handleTopUpEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    setEscrowWallet(prev => ({
      ...prev,
      availableEscrowMAD: prev.availableEscrowMAD + Number(topUpAmountMAD)
    }));
    setIsTopUpModalOpen(false);
    confetti({ particleCount: 70, spread: 80 });
    showToast(isAr ? `تم شحن رصيد الضمان بـ +${topUpAmountMAD} د.م بنجاح` : `Recharge de +${topUpAmountMAD} MAD créditée sur votre compte séquestre.`);
  };

  // Approve Payout
  const handleApprovePayout = (payoutId: string) => {
    setPayouts(prev => prev.map(p => {
      if (p.id === payoutId) {
        return { 
          ...p, 
          status: 'PROCESSED', 
          transactionReference: `VIR-CIH-${Date.now().toString().slice(-8)}`,
          paidAt: new Date().toISOString().substring(0, 16)
        };
      }
      return p;
    }));
    showToast(isAr ? 'تم اعتماد التحويل البنكي للمسوق بنجاح' : 'Virement RIB validé et marqué comme exécuté.');
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = 
        l.leadReference.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.promoterName.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.customerCity.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.trackingLinkCode.toLowerCase().includes(leadSearch.toLowerCase());
      const matchStatus = leadStatusFilter === 'ALL' || l.status === leadStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  // Filtered Creators
  const filteredCreators = useMemo(() => {
    return creators.filter(c => {
      const matchSearch = 
        c.fullName.toLowerCase().includes(creatorSearch.toLowerCase()) ||
        c.handle.toLowerCase().includes(creatorSearch.toLowerCase()) ||
        c.bio.toLowerCase().includes(creatorSearch.toLowerCase());
      const matchNiche = selectedNiche === 'ALL' || c.niche === selectedNiche;
      const matchPlatform = selectedPlatform === 'ALL' || c.primaryPlatform === selectedPlatform;
      return matchSearch && matchNiche && matchPlatform;
    });
  }, [creators, creatorSearch, selectedNiche, selectedPlatform]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      return assetCategoryFilter === 'ALL' || a.category === assetCategoryFilter;
    });
  }, [assets, assetCategoryFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{actionSuccessToast}</span>
        </div>
      )}

      {/* Top Banner: Brand Store Selector & Pixel Status */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        {currentMerchant.status === 'PENDING_APPROVAL' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-950">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Boutique en Attente de Validation Super Admin :</strong> Cette boutique est soumise à la file Brand Approvals. Dès approbation, la synchronisation des ventes et des commissions sera activée.
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-300 whitespace-nowrap">
                Statut : PENDING_APPROVAL
              </span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Store Identity */}
            <div className="flex items-center gap-3.5">
              <div 
                onClick={handleOpenEditStore}
                className="relative group cursor-pointer shrink-0"
                title="Modifier le logo de la boutique"
              >
                {currentMerchant.logoUrl ? (
                  <img 
                    src={currentMerchant.logoUrl} 
                    alt={currentMerchant.storeName} 
                    className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500/40 shadow-xs group-hover:opacity-85 transition-opacity" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
                    <StoreLogo slug={currentMerchant.slug} storeName={currentMerchant.storeName} size="md" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                    {currentMerchant.storeName}
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold bg-blue-100 text-blue-800 rounded-full">
                    {currentMerchant.category}
                  </span>
                  <button
                    onClick={handleOpenEditStore}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Modifier profil</span>
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5 flex-wrap">
                  <span>{currentMerchant.city}, Maroc</span>
                  <span>•</span>
                  <a href={currentMerchant.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                    {currentMerchant.website.replace('https://', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Live Pixel Status + Escrow Quick Balance */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              
              {/* Thank You Page Pixel Indicator */}
              {currentMerchant.status === 'PENDING_APPROVAL' ? (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>En attente Super Admin</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>Pixel Actif</span>
                </div>
              )}

              {/* Escrow Quick Pill */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Séquestre : <strong className="text-blue-600 text-sm font-black">{(escrowWallet?.availableEscrowMAD ?? 0).toLocaleString()} MAD</strong></span>
              </div>

              {/* Store Switcher Dropdown */}
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
              >
                {merchants.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.storeName} ({m.city})
                  </option>
                ))}
              </select>

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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{language === 'ar' ? 'لوحة التحكم' : 'Dashboard Overview'}</span>
            </button>

            <button
              onClick={() => setActiveTab('creators')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'creators'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'ar' ? 'سوق صناع المحتوى' : 'Marketplace Créateurs'}</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-blue-100 text-blue-700 rounded-full font-bold">
                {creators.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'campaigns'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{language === 'ar' ? 'الحملات والروابط' : 'Gestion Campagnes & Liens'}</span>
            </button>

            <button
              onClick={() => setActiveTab('lead-validation')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'lead-validation'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'التحقق ومكافحة الاحتيال' : 'Validation Leads (Anti-Fraude)'}</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded-full font-bold">
                {leads.filter(l => l.status === 'PENDING_HOLD').length} En attente
              </span>
            </button>

            <button
              onClick={() => setActiveTab('content-library')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'content-library'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{language === 'ar' ? 'مكتبة المحتوى' : 'Bibliothèque de Contenu'}</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{language === 'ar' ? 'المدفوعات والحساب البنكي' : 'Paiements & RIB'}</span>
            </button>

            <button
              onClick={() => setActiveTab('pixel')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'pixel'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Code Pixel JS</span>
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
              
              {/* Total Clics */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Clics Générés</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  16,520
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  <span>+18.4% cette semaine</span>
                </div>
              </div>

              {/* Leads Trackés (Thank You Page) */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Leads Trackés (Thank You)</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  571
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Attribution 100% automatisée pixel</span>
                </div>
              </div>

              {/* Taux de Conversion */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-colors">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Taux de Conversion</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Percent className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  3.46%
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-purple-700 font-semibold">
                  <span>Moyenne créateurs : 4.2%</span>
                </div>
              </div>

              {/* Commissions Dues & Payées */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-200 transition-colors">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Commissions Dues (MAD)</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  19,985 <span className="text-sm font-bold text-slate-500">MAD</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
                  <span>148,500 MAD déjà payés aux affiliés</span>
                </div>
              </div>

            </div>

            {/* Performance Chart & Live Pixel Stream Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Performance Chart (2 cols) */}
              <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      Évolution des Clics & Leads Trackés (Page de Remerciement)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Suivi quotidien des conversions générées par vos affiliés
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                    7 derniers jours
                  </span>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERFORMANCE_DATA_7D}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1D61FF" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#1D61FF" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
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
                      <Area type="monotone" dataKey="clicks" name="Clics" stroke="#1D61FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
                      <Area type="monotone" dataKey="leads" name="Leads (Thank You)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-slate-600">Clics Affiliés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Leads Confirmés (Thank You Page)</span>
                  </div>
                </div>
              </div>

              {/* Anti-Fraud Hold Status & Quick Actions (1 col) */}
              <div className="space-y-6">
                
                {/* Hold Summary Card */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-md border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Bouclier Anti-Fraude (Hold 48h)</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded-md font-mono">
                      Actif
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Les commissions restent en rétention 48h pour vous permettre de vérifier les faux numéros et commandes tests avant déblocage.
                  </p>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <div>
                      <div className="text-xl font-bold text-amber-400">
                        {leads.filter(l => l.status === 'PENDING_HOLD').length}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">En Rétention</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-400">
                        {leads.filter(l => l.status === 'APPROVED').length}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Validés</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('lead-validation')}
                    className="w-full mt-4 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Inspecter les leads en attente</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Actions Card */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Actions Rapides Marchand
                  </h3>
                  <button
                    onClick={() => setIsCampaignModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span>Créer une nouvelle campagne</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 -rotate-90 text-slate-400 ${isRTL ? 'rotate-90' : ''}`} />
                  </button>

                  <button
                    onClick={() => setActiveTab('creators')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Découvrir et inviter des créateurs</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 -rotate-90 text-slate-400 ${isRTL ? 'rotate-90' : ''}`} />
                  </button>

                  <button
                    onClick={() => setIsUploadAssetModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                      <span>Ajouter un asset dans la bibliothèque</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 -rotate-90 text-slate-400 ${isRTL ? 'rotate-90' : ''}`} />
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: MARKETPLACE CRÉATEURS (DISCOVERY) */}
        {/* ========================================================================= */}
        {activeTab === 'creators' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header & Filters */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950 tracking-tight">
                    Marketplace des Créateurs & Influenceurs Marocains
                  </h2>
                  <p className="text-xs text-slate-500">
                    Découvrez des créateurs de contenu vérifiés avec score anti-fraude et invitez-les à promouvoir vos produits.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    {filteredCreators.length} Créateurs disponibles
                  </span>
                </div>
              </div>

              {/* Search & Select Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={creatorSearch}
                    onChange={(e) => setCreatorSearch(e.target.value)}
                    placeholder="Rechercher par nom, @handle ou mot-clé..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Niche Filter */}
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="ALL">Toutes les thématiques</option>
                  <option value="Beauty & Skincare">Cosmétique & Skincare</option>
                  <option value="Tech & Electronics">Tech & Électronique</option>
                  <option value="Fashion & Caftan">Mode & Caftan Artisanal</option>
                  <option value="Home & Artisanal">Maison & Décoration</option>
                  <option value="Fitness & Nutrition">Santé & Nutrition</option>
                </select>

                {/* Platform Filter */}
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="ALL">Toutes les plateformes</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="WhatsApp">WhatsApp Groups</option>
                </select>
              </div>
            </div>

            {/* Creators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map(creator => (
                <div key={creator.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  
                  <div className="p-5 space-y-4">
                    {/* Header: Avatar, Name & Handle */}
                    <div className="flex items-start gap-3">
                      <img 
                        src={creator.avatarUrl} 
                        alt={creator.fullName} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-950 truncate">{creator.fullName}</h3>
                          {creator.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-blue-600 font-semibold">{creator.handle}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {creator.niche}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {creator.bio}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{creator.audienceSize.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-500">{creator.primaryPlatform}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-600">{creator.fraudQualityScore}/100</div>
                        <div className="text-[10px] text-slate-500">Score Qualité</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-600">{creator.avgConversionRate}%</div>
                        <div className="text-[10px] text-slate-500">Conv. Lead</div>
                      </div>
                    </div>

                    {/* Top Cities */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Villes :</span>
                      <span>{creator.topCities.join(', ')}</span>
                    </div>

                  </div>

                  {/* Footer Card Action */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Commission suggérée</div>
                      <div className="text-xs font-black text-slate-900">
                        {creator.suggestedPayoutMAD} MAD <span className="text-[10px] font-normal text-slate-500">/ Lead Thank You</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setInvitingCreator(creator);
                        setInviteCommissionMAD(creator.suggestedPayoutMAD);
                        setInviteMessage(`Bonjour ${creator.fullName}, nous souhaitons vous proposer de tester et promouvoir notre gamme ${currentMerchant.storeName} avec une commission de ${creator.suggestedPayoutMAD} MAD par prospect confirmé sur notre page de remerciement.`);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Inviter</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: GESTION DES CAMPAGNES & LIENS */}
        {/* ========================================================================= */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Bar with New Campaign CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <h2 className="text-lg font-black text-slate-950 tracking-tight">
                  Gestion des Campagnes & Rémunérations par Lead
                </h2>
                <p className="text-xs text-slate-500">
                  Définissez votre commission (MAD fixe ou %) par prospect atteignant la Thank You Page et générez des liens d’affiliation personnalisés.
                </p>
              </div>
              <button
                onClick={() => setIsCampaignModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Créer une Campagne</span>
              </button>
            </div>

            {/* Campaign Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Campaign Card 1 */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                    <h3 className="text-base font-bold text-slate-950 mt-1.5">
                      Offre Vedette — Sérum d’Argan Pur Bio (Souss-Massa)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lien court : <strong className="text-blue-600 font-mono">rkt.ma/c/atlas-argan</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-950">35 MAD</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Par Lead Confirmé</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-xs font-bold text-slate-900">42</div>
                    <div className="text-[10px] text-slate-500">Affiliés Actifs</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-600">8,420</div>
                    <div className="text-[10px] text-slate-500">Clics</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-600">294</div>
                    <div className="text-[10px] text-slate-500">Leads (Thank You)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Fenêtre Anti-Fraude : <strong>48 heures</strong></span>
                  <button 
                    onClick={() => handleCopy('https://roketlead.com/r/atlas-argan', 'c1')}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'c1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'c1' ? 'Copié !' : 'Copier lien racine'}</span>
                  </button>
                </div>
              </div>

              {/* Campaign Card 2 */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                    <h3 className="text-base font-bold text-slate-950 mt-1.5">
                      Coffret Anti-Âge Figue de Barbarie & Argan
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lien court : <strong className="text-blue-600 font-mono">rkt.ma/c/atlas-coffret</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-950">50 MAD</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Par Lead Confirmé</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-xs font-bold text-slate-900">28</div>
                    <div className="text-[10px] text-slate-500">Affiliés Actifs</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-600">5,190</div>
                    <div className="text-[10px] text-slate-500">Clics</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-600">172</div>
                    <div className="text-[10px] text-slate-500">Leads (Thank You)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Fenêtre Anti-Fraude : <strong>48 heures</strong></span>
                  <button 
                    onClick={() => handleCopy('https://roketlead.com/r/atlas-coffret', 'c2')}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'c2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'c2' ? 'Copié !' : 'Copier lien racine'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Generator for Specific Creator Links */}
            <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>Générateur Instantané de Liens de Tracking Promoteur</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Promoteur Assigné</label>
                  <input
                    type="text"
                    value={assignedPromoterName}
                    onChange={(e) => {
                      setAssignedPromoterName(e.target.value);
                      const slug = e.target.value.toLowerCase().replace(/\s+/g, '-');
                      setLinkSlug(slug);
                      setGeneratedShortLink(`rkt.ma/c/${slug}`);
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Canal de Diffusion</label>
                  <select
                    value={linkChannel}
                    onChange={(e: any) => setLinkChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Instagram" className="text-slate-900">Instagram Bio / Story</option>
                    <option value="TikTok" className="text-slate-900">TikTok Bio Link</option>
                    <option value="WhatsApp" className="text-slate-900">Groupe WhatsApp VIP</option>
                    <option value="YouTube" className="text-slate-900">Description YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Lien Court Généré</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedShortLink}
                      className="w-full px-3 py-2 bg-blue-950/60 border border-blue-500/40 rounded-xl text-xs font-mono font-bold text-blue-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(`https://roketlead.com/r/${linkSlug}?utm_source=${linkChannel.toLowerCase()}`, 'genlink')}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'genlink' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: VALIDATION DES LEADS (ANTI-FRAUD HUB) */}
        {/* ========================================================================= */}
        {activeTab === 'lead-validation' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header Hub */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-950 tracking-tight">
                      Hub de Validation des Leads & Détection Anti-Fraude
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      Rétention 48h active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Visualisez chaque lead issu de la Thank You Page avec métadonnées client masquées, score de risque IP et compte à rebours d’approbation.
                  </p>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={selectedLeadIds.length === 0}
                    onClick={handleBulkApprove}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Valider la sélection ({selectedLeadIds.length})</span>
                  </button>

                  <button
                    disabled={selectedLeadIds.length === 0}
                    onClick={handleBulkFlagFake}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Signaler Fake ({selectedLeadIds.length})</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Rechercher par référence, affilié, ville..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  {['ALL', 'PENDING_HOLD', 'APPROVED', 'FLAGGED_FAKE'].map(st => (
                    <button
                      key={st}
                      onClick={() => setLeadStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        leadStatusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'ALL' && 'Tous'}
                      {st === 'PENDING_HOLD' && 'En Attente (Hold)'}
                      {st === 'APPROVED' && 'Validés'}
                      {st === 'FLAGGED_FAKE' && 'Fake Rejetés'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeadIds(filteredLeads.map(l => l.id));
                            } else {
                              setSelectedLeadIds([]);
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Réf Lead & Timestamp</th>
                      <th className="p-4">Client (Masqué) & Ville</th>
                      <th className="p-4">Affilié & Canal</th>
                      <th className="p-4">Commission</th>
                      <th className="p-4">Score Risque IP</th>
                      <th className="p-4">Statut / Hold</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map(lead => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      return (
                        <tr key={lead.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                          
                          {/* Checkbox */}
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                                } else {
                                  setSelectedLeadIds([...selectedLeadIds, lead.id]);
                                }
                              }}
                              className="rounded border-slate-300 text-blue-600 cursor-pointer"
                            />
                          </td>

                          {/* Ref & Date */}
                          <td className="p-4">
                            <div className="font-bold text-slate-900 font-mono">{lead.leadReference}</div>
                            <div className="text-[11px] text-slate-500">{lead.createdAt}</div>
                          </td>

                          {/* Customer Phone & City */}
                          <td className="p-4">
                            <div className="font-bold text-slate-800 font-mono flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-slate-400" />
                              <span>{lead.customerPhoneMasked}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">{lead.customerCity}</div>
                          </td>

                          {/* Promoter & Link */}
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{lead.promoterName}</div>
                            <div className="text-[10px] text-blue-600 font-mono">{lead.trackingLinkCode} ({lead.channel})</div>
                          </td>

                          {/* Commission */}
                          <td className="p-4">
                            <div className="font-bold text-slate-950">{lead.commissionMAD.toFixed(2)} MAD</div>
                            <div className="text-[10px] text-slate-500">Panier: {lead.orderValueMAD} MAD</div>
                          </td>

                          {/* Risk Score Meter */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                lead.fraudRiskScore > 50 ? 'bg-red-500' : lead.fraudRiskScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="font-bold text-slate-800">{lead.fraudRiskScore}%</span>
                              <span className="text-[10px] text-slate-400 font-mono">({lead.ipAddress})</span>
                            </div>
                            {lead.fraudFlags.length > 0 && (
                              <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                                {lead.fraudFlags[0]}
                              </div>
                            )}
                          </td>

                          {/* Status / Hold Countdown */}
                          <td className="p-4">
                            {lead.status === 'PENDING_HOLD' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                                <Clock className="w-3 h-3" />
                                <span>Hold (48h)</span>
                              </span>
                            )}
                            {lead.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                                <CheckCircle className="w-3 h-3" />
                                <span>Validé</span>
                              </span>
                            )}
                            {lead.status === 'FLAGGED_FAKE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-900">
                                <XCircle className="w-3 h-3" />
                                <span>Fake Rejeté</span>
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {lead.status === 'PENDING_HOLD' && (
                                <>
                                  <button
                                    onClick={() => handleApproveLead(lead.id)}
                                    title="Valider immédiatement ce lead"
                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition-colors cursor-pointer"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setActiveLeadForFlag(lead)}
                                    title="Signaler comme faux lead / bot"
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold transition-colors cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 5: BIBLIOTHÈQUE DE CONTENU (ASSET HUB) */}
        {/* ========================================================================= */}
        {activeTab === 'content-library' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header & Upload CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <h2 className="text-lg font-black text-slate-950 tracking-tight">
                  Bibliothèque de Contenu & Ressources Créateurs
                </h2>
                <p className="text-xs text-slate-500">
                  Mettez à disposition de vos affiliés des photos HD studio, des scripts TikTok en Darija et vos guidelines officielles.
                </p>
              </div>
              <button
                onClick={() => setIsUploadAssetModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Téléverser un Asset</span>
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['ALL', 'High-Res Photos', 'Ad Scripts (Darija/FR)', 'Brand Guidelines', 'B-Roll Packs'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setAssetCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    assetCategoryFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'ALL' ? 'Tous les assets' : cat}
                </button>
              ))}
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  
                  {asset.previewUrl && (
                    <div className="h-40 w-full overflow-hidden bg-slate-100">
                      <img src={asset.previewUrl} alt={asset.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {asset.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{asset.fileSize}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-950 leading-snug">{asset.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{asset.description}</p>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      <strong>{asset.downloadsCount}</strong> téléchargements
                    </span>
                    <button
                      onClick={() => {
                        showToast(isAr ? 'بدأ تحميل الملف...' : 'Téléchargement de l’asset initié.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 6: PAIEMENTS & RIB (ESCROW & SETTLEMENT) */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Escrow Wallet Overview */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950 tracking-tight">
                    Compte Séquestre & Règlement des Virement RIB
                  </h2>
                  <p className="text-xs text-slate-500">
                    Fonds garantis pour le déblocage automatisé des commissions aux affiliés marocains.
                  </p>
                </div>
                <button
                  onClick={() => setIsTopUpModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Recharger le Séquestre</span>
                </button>
              </div>

              {/* 3 Escrow Stat Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                    Solde Séquestre Disponible
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-950">
                    {(escrowWallet?.availableEscrowMAD ?? 0).toLocaleString()} <span className="text-sm">MAD</span>
                  </div>
                  <div className="text-[11px] text-blue-700 mt-1 font-medium">Prêt pour les virements programmés</div>
                </div>

                <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                    Commissions en Période de Hold
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-950">
                    {(escrowWallet?.lockedInHoldMAD ?? 0).toLocaleString()} <span className="text-sm">MAD</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1 font-medium">Bloquées jusqu’à expiration du délai 48h</div>
                </div>

                <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    Total Versé aux Créateurs
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                    {(escrowWallet?.totalPaidOutMAD ?? 0).toLocaleString()} <span className="text-sm">MAD</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1 font-medium">Virement direct RIB (CIH, Attijariwafa, etc.)</div>
                </div>
              </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Demandes de Retrait & Historique des Virements RIB</h3>
                  <p className="text-xs text-slate-500">Traitement des gains affiliés (minimum 200 DH atteint)</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">ID Demande</th>
                      <th className="p-4">Affilié / Promoteur</th>
                      <th className="p-4">Montant (MAD)</th>
                      <th className="p-4">Banque Marocaine & RIB (24 Chiffres)</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Réf Virement</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payouts.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">{pay.id}</td>
                        <td className="p-4 font-bold text-slate-900">{pay.promoterName}</td>
                        <td className="p-4 font-black text-slate-950">{(pay.amountMAD ?? 0).toLocaleString()} MAD</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{pay.bankName}</div>
                          <div className="font-mono text-[11px] text-slate-500">{pay.bankRib}</div>
                        </td>
                        <td className="p-4">
                          {pay.status === 'PROCESSED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              <span>Exécuté</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              <span>En attente</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-600">
                          {pay.transactionReference || '—'}
                        </td>
                        <td className="p-4 text-right">
                          {pay.status === 'PENDING' ? (
                            <button
                              onClick={() => handleApprovePayout(pay.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Approuver Virement
                            </button>
                          ) : (
                            <button
                              onClick={() => showToast(isAr ? 'تم تحميل إشعار التحويل البنكي' : 'Reçu de virement RIB téléchargé.')}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Reçu RIB
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PIXEL CODE MODAL / TAB */}
        {/* ========================================================================= */}
        {activeTab === 'pixel' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-emerald-400" />
                    <span>Intégration du Pixel JavaScript sur votre Thank You Page</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Collez ce snippet sur la page de confirmation de commande de votre boutique (YouCan, Shopify, WooCommerce).
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(TRACKER_JS_CODE, 'pixelcode')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedKey === 'pixelcode' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'pixelcode' ? 'Code Copié !' : 'Copier le Snippet'}</span>
                </button>
              </div>

              {/* API Key Box */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Clé API Publique du Marchand</div>
                  <div className="text-xs font-mono text-emerald-400 font-bold">{currentMerchant.pixelApiKey}</div>
                </div>
                <button
                  onClick={() => handleCopy(currentMerchant.pixelApiKey, 'apikey')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Code Snippet Box */}
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                {TRACKER_JS_CODE}
              </pre>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      
      {/* Flag Fake Lead Modal */}
      {activeLeadForFlag && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Signaler et Rejeter le Lead</span>
            </div>
            <p className="text-xs text-slate-600">
              Indiquez la raison du rejet pour {activeLeadForFlag.leadReference} ({activeLeadForFlag.customerPhoneMasked}). La commission de {activeLeadForFlag.commissionMAD} MAD sera annulée.
            </p>
            <select
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="Numéro non joignable / faux lead bot">Numéro non joignable / faux lead bot</option>
              <option value="IP Cluster suspect (Plusieurs clics simultanés)">IP Cluster suspect (Plusieurs clics simultanés)</option>
              <option value="Commande test annulée par le client">Commande test annulée par le client</option>
              <option value="Adresse de livraison invalide">Adresse de livraison invalide</option>
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveLeadForFlag(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleFlagLeadFake(activeLeadForFlag.id, flagReason)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Confirmer le Rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Creator Modal */}
      {invitingCreator && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={invitingCreator.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Inviter {invitingCreator.fullName}</h3>
                  <span className="text-xs text-blue-600 font-semibold">{invitingCreator.handle}</span>
                </div>
              </div>
              <button onClick={() => setInvitingCreator(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commission Proposée (MAD par Lead Thank You Page)</label>
                <input
                  type="number"
                  value={inviteCommissionMAD}
                  onChange={(e) => setInviteCommissionMAD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message d’invitation personnalisé</label>
                <textarea
                  rows={4}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInvitingCreator(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer la proposition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Créer une Nouvelle Campagne d’Affiliation</h3>
              <button onClick={() => setIsCampaignModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la Campagne / Produit</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gamme Skincare Bio 2026"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL de la Page Produit / Landing Page</label>
                <input
                  type="url"
                  required
                  value={campaignLandingUrl}
                  onChange={(e) => setCampaignLandingUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de Rémunération</label>
                  <select
                    value={commissionType}
                    onChange={(e: any) => setCommissionType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="FIXED_MAD">Montant Fixe (MAD / Lead)</option>
                    <option value="PERCENTAGE">Pourcentage (% de la vente)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valeur de la Commission</label>
                  <input
                    type="number"
                    value={commissionVal}
                    onChange={(e) => setCommissionVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Délai Anti-Fraude (Hold avant déblocage)</label>
                <select
                  value={holdPeriodSetting}
                  onChange={(e) => setHoldPeriodSetting(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value={24}>24 Heures (Express)</option>
                  <option value={48}>48 Heures (Recommandé E-commerce)</option>
                  <option value={72}>72 Heures (Sécurité Maximale)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Lancer la Campagne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Asset Modal */}
      {isUploadAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Téléverser un Asset Créatif</h3>
              <button onClick={() => setIsUploadAssetModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadAsset} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la ressource</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pack Rushs 4K Reels & Hooks Darija"
                  value={newAssetTitle}
                  onChange={(e) => setNewAssetTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                <select
                  value={newAssetCategory}
                  onChange={(e: any) => setNewAssetCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="High-Res Photos">Photos Haute Définition</option>
                  <option value="Ad Scripts (Darija/FR)">Scripts Publicitaires (Darija / FR)</option>
                  <option value="Brand Guidelines">Charte Graphique & Logos</option>
                  <option value="UGC Video Hooks">Hooks & Idées Vidéo UGC</option>
                  <option value="B-Roll Packs">Packs B-Roll & Vidéos Produits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Conseils d’utilisation</label>
                <textarea
                  rows={3}
                  value={newAssetDescription}
                  onChange={(e) => setNewAssetDescription(e.target.value)}
                  placeholder="Expliquez comment les créateurs doivent utiliser ce pack..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-800">Glissez-déposez vos fichiers ici (ZIP, MP4, PDF, PNG)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Jusqu’à 500 MB par fichier</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadAssetModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Enregistrer l’Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Up Escrow Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Recharger le Compte Séquestre</h3>
              <button onClick={() => setIsTopUpModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopUpEscrow} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Montant à créditer (MAD)</label>
                <input
                  type="number"
                  required
                  min={500}
                  value={topUpAmountMAD}
                  onChange={(e) => setTopUpAmountMAD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                <div className="font-bold">Moyen de paiement :</div>
                <div>• Virement direct vers le compte séquestre RoketLead (CIH Bank)</div>
                <div>• Paiement par carte bancaire marocaine CMI sécurisé</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Confirmer le Rechargement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Profile & Logo Modal */}
      {isEditStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-950">Modifier le Profil de la Boutique</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Database className="w-3 h-3 text-emerald-600" />
                      Firebase Firestore
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Mettez à jour le logo, le nom et les coordonnées enregistrés en base de données</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditStoreModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              
              {/* Logo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Logo de la marque</label>
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    {editLogoUrl ? (
                      <img 
                        src={editLogoUrl} 
                        alt="Logo preview" 
                        className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500 shadow-sm" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-blue-50 border-2 border-blue-300 flex items-center justify-center text-blue-600 font-bold text-lg">
                        <StoreLogo slug={currentMerchant.slug} storeName={editStoreName || currentMerchant.storeName} size="lg" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleLogoFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>Téléverser un logo</span>
                      </button>
                      {editLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditLogoUrl('')}
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

              {/* Nom & Catégorie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom de la Boutique</label>
                  <input
                    type="text"
                    required
                    value={editStoreName}
                    onChange={(e) => setEditStoreName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="ex: Atlas Botanicals"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secteur d’Activité</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Cosmétiques & Bio">Cosmétiques & Bio</option>
                    <option value="High-Tech & Gadgets">High-Tech & Gadgets</option>
                    <option value="Mode & Caftans">Mode & Caftans</option>
                    <option value="Artisanat & Décoration">Artisanat & Décoration</option>
                    <option value="Santé & Nutrition">Santé & Nutrition</option>
                  </select>
                </div>
              </div>

              {/* Ville & Site Web */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ville Siège</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="ex: Casablanca"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Site Web (Boutique en ligne)</label>
                  <input
                    type="url"
                    required
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="https://votreboutique.ma"
                  />
                </div>
              </div>

              {/* Téléphone & Commission par défaut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Numéro Téléphone Support</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="+212 5 22 00 00 00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Commission par Lead (MAD)</label>
                  <input
                    type="number"
                    min={5}
                    value={editDefaultPayoutMAD}
                    onChange={(e) => setEditDefaultPayoutMAD(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditStoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingStore}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold cursor-pointer shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingStore ? (
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
