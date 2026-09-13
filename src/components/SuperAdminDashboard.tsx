import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  SlidersHorizontal, 
  Eye, 
  Key, 
  Send, 
  ChevronRight, 
  Check, 
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  ExternalLink,
  Settings,
  FileText,
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  ShoppingBag,
  MapPin,
  ArrowUpDown,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MerchantProfile, SystemAuditLog, Conversion, EarlyAccessLead } from '../types';
import { INITIAL_MERCHANTS, INITIAL_AUDIT_LOGS, INITIAL_CONVERSIONS, INITIAL_EARLY_ACCESS_LEADS } from '../data/mockData';
import { StoreLogo } from './StoreLogo';
import { AdminContentEditor } from './AdminContentEditor';
import { AdminEarlyAccessLeads } from './AdminEarlyAccessLeads';
import { useLanguage } from '../context/LanguageContext';
import { 
  subscribeMerchants, 
  approveMerchant, 
  registerNewMerchant, 
  subscribeEarlyAccessLeads, 
  updateEarlyAccessLeadStatus 
} from '../services/accountService';

const REVENUE_TIMELINE_DATA = [
  { day: 'Mon', gmv: 42000, saasCut: 2100, deliveredOrders: 84 },
  { day: 'Tue', gmv: 58000, saasCut: 2900, deliveredOrders: 112 },
  { day: 'Wed', gmv: 63000, saasCut: 3150, deliveredOrders: 128 },
  { day: 'Thu', gmv: 89000, saasCut: 4450, deliveredOrders: 174 },
  { day: 'Fri', gmv: 114000, saasCut: 5700, deliveredOrders: 230 },
  { day: 'Sat', gmv: 142000, saasCut: 7100, deliveredOrders: 290 },
  { day: 'Sun', gmv: 128000, saasCut: 6400, deliveredOrders: 260 },
];

const MOROCCO_CITY_DATA = [
  { city: 'Casablanca', percentage: 44, gmv: 278000, color: '#2563eb' },
  { city: 'Rabat & Salé', percentage: 22, gmv: 142000, color: '#4f46e5' },
  { city: 'Marrakech', percentage: 14, gmv: 89000, color: '#7c3aed' },
  { city: 'Tangier & Tetouan', percentage: 12, gmv: 76000, color: '#06b6d4' },
  { city: 'Agadir & Fes', percentage: 8, gmv: 51000, color: '#10b981' },
];

interface SuperAdminDashboardProps {
  onSwitchToAffiliateView?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onSwitchToAffiliateView }) => {
  const { customCount } = useLanguage();
  const [merchants, setMerchants] = useState<MerchantProfile[]>(INITIAL_MERCHANTS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [conversions, setConversions] = useState<Conversion[]>(INITIAL_CONVERSIONS);
  const [activeTab, setActiveTab] = useState<'overview' | 'merchants' | 'earlyaccess' | 'audit' | 'content' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantProfile | null>(null);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [platformTakeRate, setPlatformTakeRate] = useState<number>(5.0); // 5% SaaS take rate

  // Early Access / Waitlist State Management
  const [earlyAccessLeads, setEarlyAccessLeads] = useState<EarlyAccessLead[]>(INITIAL_EARLY_ACCESS_LEADS);
  const [eaSearchQuery, setEaSearchQuery] = useState('');
  const [eaRoleFilter, setEaRoleFilter] = useState<'ALL' | 'SELLER' | 'CREATOR'>('ALL');
  const [eaStatusFilter, setEaStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [eaSortBy, setEaSortBy] = useState<'NAME_ASC' | 'NAME_DESC' | 'DATE_DESC' | 'DATE_ASC' | 'CITY'>('NAME_ASC');
  const [selectedLead, setSelectedLead] = useState<EarlyAccessLead | null>(null);
  const [leadNotesInput, setLeadNotesInput] = useState('');
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);
  const [convertSuccessMsg, setConvertSuccessMsg] = useState<string | null>(null);

  // Manual Brand Registration Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreUrl, setNewStoreUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'E-commerce' | 'Health & Beauty' | 'Fashion & Artisanal' | 'Electronics' | 'SaaS' | 'Services'>('Health & Beauty');
  const [newPlatform, setNewPlatform] = useState<'YouCan' | 'Shopify' | 'WooCommerce' | 'Custom API'>('YouCan');
  const [newCity, setNewCity] = useState('Casablanca');
  const [newCommissionRate, setNewCommissionRate] = useState(15);
  const [newPhone, setNewPhone] = useState('+212 6 00 00 00 00');
  const [isRegisteringBrand, setIsRegisteringBrand] = useState(false);

  // Key platform metrics calculation
  const totalPlatformVolumeMAD = merchants.reduce((sum, m) => sum + m.totalSalesMAD, 0);
  const totalActiveBrands = merchants.filter(m => m.status === 'ACTIVE').length;
  const totalPendingBrands = merchants.filter(m => m.status === 'PENDING_APPROVAL').length;
  const totalActiveAffiliates = merchants.reduce((sum, m) => sum + m.activeAffiliatesCount, 0) + 145;
  const totalSaasRevenueMAD = Math.round(totalPlatformVolumeMAD * (platformTakeRate / 100));

  // Early access metrics
  const pendingLeadsCount = earlyAccessLeads.filter(l => l.status === 'PENDING').length;
  const sellerLeadsCount = earlyAccessLeads.filter(l => l.userType === 'SELLER').length;
  const creatorLeadsCount = earlyAccessLeads.filter(l => l.userType === 'CREATOR').length;

  // Subscribe to real-time merchants from Firestore
  useEffect(() => {
    const unsubscribe = subscribeMerchants((fetchedMerchants) => {
      if (fetchedMerchants && fetchedMerchants.length > 0) {
        setMerchants(fetchedMerchants);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time early access / waitlist leads from Firestore
  useEffect(() => {
    const unsubscribe = subscribeEarlyAccessLeads((fetchedLeads) => {
      if (fetchedLeads && fetchedLeads.length > 0) {
        setEarlyAccessLeads(fetchedLeads);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle approving a newly submitted merchant in Firestore
  const handleApproveMerchant = async (merchantId: string) => {
    // Optimistic UI update
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return { ...m, status: 'ACTIVE' as const };
      }
      return m;
    }));

    try {
      await approveMerchant(merchantId);
    } catch (err) {
      console.error('Failed to approve merchant in Firestore:', err);
    }

    const merchant = merchants.find(m => m.id === merchantId);
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      type: 'MERCHANT_SIGNUP',
      title: `Brand Approved: ${merchant?.companyName || 'Merchant'}`,
      details: `Super Admin verified and approved store for live tracking. Status updated in Firestore.`,
      timestamp: 'Just now',
      severity: 'success',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handle manual creation of a brand directly into Firestore
  const handleCreateNewBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStoreUrl.trim()) return;

    setIsRegisteringBrand(true);
    try {
      const created = await registerNewMerchant({
        companyName: newStoreName.trim(),
        storeName: newStoreName.trim(),
        website: newStoreUrl.trim(),
        category: newCategory,
        city: newCity,
        platformType: newPlatform,
        commissionRate: Number(newCommissionRate) || 15,
        commissionOffer: `${newCommissionRate}% par vente confirmée (COD)`,
        supportPhone: newPhone.trim(),
        description: `Boutique marocaine inscrite via le panneau Super Admin - En attente d'approbation`
      });

      const newLog: SystemAuditLog = {
        id: `log-${Date.now()}`,
        type: 'MERCHANT_SIGNUP',
        title: `Nouvelle Marque Enregistrée: ${created.companyName}`,
        details: `Créée dans la base Firestore avec le statut PENDING_APPROVAL. Prête pour validation.`,
        timestamp: 'Just now',
        severity: 'info',
      };
      setAuditLogs(prev => [newLog, ...prev]);

      setIsAddModalOpen(false);
      setNewStoreName('');
      setNewStoreUrl('');
    } catch (err) {
      console.error('Failed to create brand in Firestore:', err);
    } finally {
      setIsRegisteringBrand(false);
    }
  };

  // Simulate an incoming Courier COD Delivery webhook
  const handleSimulateDeliveryWebhook = () => {
    setIsSimulatingWebhook(true);
    setTimeout(() => {
      const orderNum = `MA-${Math.floor(10000 + Math.random() * 90000)}`;
      const amount = Math.floor(400 + Math.random() * 1200);
      const commission = Math.round(amount * 0.15);
      const saasCut = Math.round(amount * 0.05);

      const newConversion: Conversion = {
        id: `conv-${Date.now()}`,
        orderNumber: orderNum,
        merchantId: 'merch-01',
        merchantName: 'Atlas Botanicals',
        affiliateId: 'aff-001',
        affiliateName: 'Amine Benjelloun',
        channel: 'Instagram Bio',
        promoCode: 'AMINE10',
        orderAmountMAD: amount,
        commissionMAD: commission,
        saasCutMAD: saasCut,
        status: 'DELIVERED',
        customerCity: 'Casablanca',
        courier: 'Cathedis',
        trackingNumber: `CTH-${Math.floor(1000000 + Math.random() * 9000000)}-CAS`,
        createdAt: 'Just now',
        deliveredAt: 'Just now',
      };

      setConversions(prev => [newConversion, ...prev]);

      const newLog: SystemAuditLog = {
        id: `log-${Date.now()}`,
        type: 'COD_STATUS_UPDATE',
        title: `⚡ Live Webhook: Cathedis Marked Order #${orderNum} DELIVERED`,
        details: `Customer paid ${amount} MAD in Casablanca. Commission +${commission} MAD instantly credited to affiliate wallet. SaaS Cut +${saasCut} MAD captured.`,
        timestamp: 'Just now',
        severity: 'success',
      };
      setAuditLogs(prev => [newLog, ...prev]);
      setIsSimulatingWebhook(false);
    }, 800);
  };

  // Handle updating an early access lead status
  const handleUpdateLeadStatus = async (
    leadId: string, 
    newStatus: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED',
    notes?: string
  ) => {
    setIsUpdatingLead(true);
    setEarlyAccessLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus, ...(notes !== undefined ? { notes } : {}) } : l));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus, ...(notes !== undefined ? { notes } : {}) } : null);
    }

    try {
      await updateEarlyAccessLeadStatus(leadId, newStatus, notes);
    } catch (e) {
      console.error('Error updating lead status in Firestore:', e);
    } finally {
      setIsUpdatingLead(false);
    }

    const lead = earlyAccessLeads.find(l => l.id === leadId);
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      type: 'MERCHANT_SIGNUP',
      title: `Early Access Lead ${newStatus}: ${lead?.fullName || 'Applicant'}`,
      details: `Admin marked ${lead?.role || 'user'} (${lead?.email}) as ${newStatus}.`,
      timestamp: 'Just now',
      severity: newStatus === 'APPROVED' ? 'success' : (newStatus === 'REJECTED' ? 'warning' : 'info'),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Convert early access seller directly to live merchant in Firestore
  const handleConvertSellerToMerchant = async (lead: EarlyAccessLead) => {
    try {
      setIsUpdatingLead(true);
      const cleanStore = lead.storeName || lead.fullName + ' Store';
      const cleanSlug = cleanStore.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      const newMerch = await registerNewMerchant({
        companyName: cleanStore,
        storeName: cleanStore,
        website: lead.storeUrl || 'https://roketlead.ma',
        category: 'E-commerce',
        platformType: (lead.platform as any) || 'YouCan',
        city: lead.city || 'Casablanca',
        email: lead.email,
        supportPhone: lead.phone,
        commissionRate: 15,
        description: `Boutique inscrite via la campagne d'accès anticipé. ${lead.notes || ''}`
      });

      // Also mark lead as APPROVED
      await handleUpdateLeadStatus(lead.id, 'APPROVED', `Converti en Marque Partenaire (ID: ${newMerch.id})`);
      setConvertSuccessMsg(`La marque "${cleanStore}" a été créée avec succès et ajoutée aux Brand Approvals !`);
      setTimeout(() => setConvertSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to convert early access seller to merchant:', err);
    } finally {
      setIsUpdatingLead(false);
    }
  };

  // Export leads to CSV
  const handleExportLeadsCSV = () => {
    const headers = ['Nom Complet', 'Type/Role', 'Email', 'Telephone (WhatsApp)', 'Boutique/Reseaux', 'Plateforme/Niche', 'Commandes/Audience', 'Ville', 'Statut', 'Date'];
    const rows = filteredAndSortedLeads.map(l => [
      `"${(l.fullName || '').replace(/"/g, '""')}"`,
      `"${l.userType === 'SELLER' ? 'Vendeur (E-commerce)' : (l.userType === 'CREATOR' ? 'Createur de contenu' : l.role)}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${(l.userType === 'SELLER' ? l.storeUrl : l.socialHandle) || ''}"`,
      `"${(l.userType === 'SELLER' ? l.platform : l.niche) || ''}"`,
      `"${(l.userType === 'SELLER' ? l.monthlyOrders : l.audienceSize) || ''}"`,
      `"${l.city || ''}"`,
      `"${l.status}"`,
      `"${l.createdDateFormatted || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roketlead-early-access-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered and sorted early access leads
  const filteredAndSortedLeads = useMemo(() => {
    return earlyAccessLeads
      .filter((lead) => {
        if (eaRoleFilter === 'SELLER' && lead.userType !== 'SELLER') return false;
        if (eaRoleFilter === 'CREATOR' && lead.userType !== 'CREATOR') return false;
        if (eaStatusFilter !== 'ALL' && lead.status !== eaStatusFilter) return false;
        if (eaSearchQuery.trim()) {
          const q = eaSearchQuery.toLowerCase();
          const matches = 
            lead.fullName.toLowerCase().includes(q) ||
            lead.email.toLowerCase().includes(q) ||
            lead.phone.toLowerCase().includes(q) ||
            (lead.storeName && lead.storeName.toLowerCase().includes(q)) ||
            (lead.storeUrl && lead.storeUrl.toLowerCase().includes(q)) ||
            (lead.socialHandle && lead.socialHandle.toLowerCase().includes(q)) ||
            (lead.niche && lead.niche.toLowerCase().includes(q)) ||
            (lead.city && lead.city.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (eaSortBy === 'NAME_ASC') {
          return a.fullName.localeCompare(b.fullName, 'fr', { sensitivity: 'base' });
        }
        if (eaSortBy === 'NAME_DESC') {
          return b.fullName.localeCompare(a.fullName, 'fr', { sensitivity: 'base' });
        }
        if (eaSortBy === 'DATE_ASC') {
          return (a.queueNumber || 999) - (b.queueNumber || 999);
        }
        if (eaSortBy === 'CITY') {
          return (a.city || '').localeCompare(b.city || '', 'fr');
        }
        // Default: DATE_DESC
        return (b.queueNumber || 0) - (a.queueNumber || 0);
      });
  }, [earlyAccessLeads, eaRoleFilter, eaStatusFilter, eaSearchQuery, eaSortBy]);

  const filteredMerchants = [...merchants]
    .sort((a, b) => {
      // Pending approvals always first so admin immediately sees newly registered brands
      if (a.status === 'PENDING_APPROVAL' && b.status !== 'PENDING_APPROVAL') return -1;
      if (a.status !== 'PENDING_APPROVAL' && b.status === 'PENDING_APPROVAL') return 1;
      return 0;
    })
    .filter(m => 
      (m.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.website || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div dir="ltr" className="min-h-screen bg-slate-50 flex flex-col font-sans text-left text-slate-900">
      
      {/* Top Breadcrumb & Status Banner */}
      <div className="bg-slate-900 text-white px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-lg text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Admin Control Center</span>
          </div>
          <span className="text-slate-400 text-xs hidden sm:inline">•</span>
          <span className="text-xs text-slate-300 hidden sm:inline">
            Morocco Performance Marketing SaaS Architecture
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-simulate-webhook-btn"
            onClick={handleSimulateDeliveryWebhook}
            disabled={isSimulatingWebhook}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-blue-500/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingWebhook ? 'animate-spin' : ''}`} />
            <span>{isSimulatingWebhook ? 'Simulating...' : 'Simulate COD Delivery Webhook'}</span>
          </button>

          {onSwitchToAffiliateView && (
            <button
              onClick={onSwitchToAffiliateView}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Promoter Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              SaaS Overview & Ecosystem Health
            </h1>
            <p className="text-sm text-slate-500">
              Live metrics across Moroccan merchants, active affiliate promoters, and Cash-on-Delivery pipelines.
            </p>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('merchants')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'merchants' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Brand Approvals</span>
              {totalPendingBrands > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                  {totalPendingBrands}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('earlyaccess')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'earlyaccess' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Accès Anticipé (Waitlist)</span>
              {pendingLeadsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                  {pendingLeadsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'audit' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              System Audit Log
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'content' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Éditeur de Textes (CMS)</span>
              {customCount > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeTab === 'content' ? 'bg-white text-blue-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {customCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Platform Settings
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* 4 Key Metrics Cards (Mandatory from Section 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Metric 1: Total Platform Volume (MAD) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Platform Volume
                  </span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-1">
                  {totalPlatformVolumeMAD.toLocaleString()} <span className="text-sm font-bold text-slate-500">MAD</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+34.8% vs last month</span>
                </div>
              </div>

              {/* Metric 2: Total Active Brands */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Moroccan Brands
                  </span>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-1">
                  {totalActiveBrands} <span className="text-sm font-medium text-slate-400">stores</span>
                </div>
                <div 
                  onClick={() => setActiveTab('merchants')}
                  className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold cursor-pointer hover:text-amber-700 transition-colors"
                >
                  <span>{totalPendingBrands} brand(s) awaiting verification &rarr;</span>
                </div>
              </div>

              {/* Metric 3: Total Active Affiliates */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Promoters
                  </span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-1">
                  {totalActiveAffiliates} <span className="text-sm font-medium text-slate-400">creators</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+28 creators this week</span>
                </div>
              </div>

              {/* Metric 4: SaaS Revenue / Platform Cut (MAD) */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    SaaS Platform Revenue
                  </span>
                  <div className="p-2 bg-white/10 text-white rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                  {totalSaasRevenueMAD.toLocaleString()} <span className="text-sm font-bold text-blue-300">MAD</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span>Take Rate: {platformTakeRate}% of delivered GMV</span>
                </div>
              </div>

            </div>

            {/* Real-time Analytics Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Area Chart: Platform GMV & SaaS Cut */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Daily Platform Gross Volume & SaaS Cut (MAD)</h3>
                    <p className="text-xs text-slate-500">Live 7-day performance tracking across all connected YouCan & Shopify stores.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                      <span className="text-slate-700">Gross Volume</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-purple-600" />
                      <span className="text-slate-700">SaaS Cut</span>
                    </div>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_TIMELINE_DATA}>
                      <defs>
                        <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorSaas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                      <Tooltip 
                        formatter={(val: any) => [`${Number(val).toLocaleString()} MAD`]}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      />
                      <Area type="monotone" dataKey="gmv" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGmv)" name="Platform GMV" />
                      <Area type="monotone" dataKey="saasCut" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaas)" name="SaaS Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* City Breakdown Heatmap / Donut */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-1">COD Orders by Moroccan Region</h3>
                  <p className="text-xs text-slate-500 mb-6">Delivery completion rate by geographic hub.</p>

                  <div className="space-y-4">
                    {MOROCCO_CITY_DATA.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>{item.city}</span>
                          <span className="font-mono text-slate-900">{item.percentage}% ({item.gmv.toLocaleString()} MAD)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Amana & Cathedis 92.4% Delivery
                  </span>
                  <span className="font-bold text-slate-800">Morocco National</span>
                </div>
              </div>

            </div>

            {/* Recent Live COD Conversions Stream Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Live COD Conversion Stream</h3>
                  <p className="text-xs text-slate-500">Real-time status updates received from Moroccan couriers and merchant webhooks.</p>
                </div>
                <button
                  onClick={handleSimulateDeliveryWebhook}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Emit Test Webhook</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Merchant Store</th>
                      <th className="py-3 px-4">Promoter / Channel</th>
                      <th className="py-3 px-4">City & Courier</th>
                      <th className="py-3 px-4">Order Amount</th>
                      <th className="py-3 px-4">Promoter Commission</th>
                      <th className="py-3 px-4">SaaS Cut (5%)</th>
                      <th className="py-3 px-4">COD Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {conversions.slice(0, 5).map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {conv.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-semibold">
                          {conv.merchantName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{conv.affiliateName}</div>
                          <div className="text-[10px] text-slate-400">{conv.channel} {conv.promoCode ? `• Code: ${conv.promoCode}` : ''}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800">{conv.customerCity}</div>
                          <div className="text-[10px] text-blue-600 font-semibold">{conv.courier}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-950">
                          {conv.orderAmountMAD.toLocaleString()} MAD
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          +{conv.commissionMAD} MAD
                        </td>
                        <td className="py-3 px-4 font-bold text-purple-600">
                          +{conv.saasCutMAD} MAD
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            conv.status === 'DELIVERED' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : conv.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : conv.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}>
                            {conv.status === 'DELIVERED' ? '✓ LIVRÉ (Delivered)' : conv.status}
                          </span>
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
        {/* TAB 2: MERCHANT APPROVALS & VERIFICATION QUEUE (Mandatory from Section 2) */}
        {/* ========================================================================= */}
        {activeTab === 'merchants' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Merchant Approvals & Integration Queue</h3>
                  <p className="text-xs text-slate-500">Newly signed-up Moroccan brand stores awaiting API & webhook integration verification.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search brands, cities, categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Inscrire une Marque</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Brand / Company</th>
                      <th className="py-3 px-4">Category & Location</th>
                      <th className="py-3 px-4">Store Platform</th>
                      <th className="py-3 px-4">Affiliate Offer</th>
                      <th className="py-3 px-4">Total Sales (MAD)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredMerchants.map((merchant) => (
                      <tr key={merchant.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <StoreLogo
                              logo={merchant.logo}
                              name={merchant.companyName}
                              category={merchant.category}
                              size="sm"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <span>{merchant.companyName}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{merchant.website}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900">{merchant.category}</div>
                          <div className="text-[10px] text-slate-500">{merchant.city}, Morocco</div>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            merchant.platformType === 'YouCan' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : merchant.platformType === 'Shopify'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {merchant.platformType}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{merchant.commissionOffer}</div>
                          <div className="text-[10px] text-slate-400">{merchant.cookieDurationDays} days cookie duration</div>
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-950">
                          {merchant.totalSalesMAD.toLocaleString()} MAD
                        </td>

                        <td className="py-4 px-4">
                          {merchant.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Awaiting Verification</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {merchant.status === 'PENDING_APPROVAL' ? (
                              <button
                                onClick={() => handleApproveMerchant(merchant.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Verify & Approve</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedMerchant(merchant)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Key className="w-3.5 h-3.5 text-slate-500" />
                                <span>Inspect Keys</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Merchant API Secret Inspection Modal */}
            {selectedMerchant && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedMerchant.logo}</span>
                      <h3 className="font-bold text-slate-950 text-base">{selectedMerchant.companyName} API Config</h3>
                    </div>
                    <button
                      onClick={() => setSelectedMerchant(null)}
                      className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-500 font-semibold block mb-1">Integration Secret Key</label>
                      <div className="p-2.5 bg-slate-50 font-mono text-slate-800 rounded-xl border border-slate-200 break-all select-all">
                        {selectedMerchant.integrationSecretKey}
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-500 font-semibold block mb-1">Registered Webhook Endpoint</label>
                      <div className="p-2.5 bg-slate-50 font-mono text-slate-800 rounded-xl border border-slate-200 break-all select-all">
                        {selectedMerchant.webhookUrl}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
                      <div className="font-bold mb-1">Store Engine: {selectedMerchant.platformType}</div>
                      <p className="text-[11px] text-blue-700 leading-relaxed">
                        Webhooks automatically listen to order fulfillment & Amana/Cathedis delivery scans to unlock promoter Dirham payouts.
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedMerchant(null)}
                      className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      Close Inspector
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Brand Registration Modal */}
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-950 text-sm">Inscrire une Nouvelle Marque</h3>
                        <p className="text-[11px] text-slate-500">Ajout immédiat dans Firestore avec statut En attente</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateNewBrand} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">Nom de la Marque / Boutique *</label>
                      <input
                        type="text"
                        required
                        value={newStoreName}
                        onChange={(e) => setNewStoreName(e.target.value)}
                        placeholder="Ex: Bio Argan Atlas"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">URL de la Boutique *</label>
                      <input
                        type="url"
                        required
                        value={newStoreUrl}
                        onChange={(e) => setNewStoreUrl(e.target.value)}
                        placeholder="https://bio-argan.youcan.store"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Plateforme</label>
                        <select
                          value={newPlatform}
                          onChange={(e) => setNewPlatform(e.target.value as any)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                        >
                          <option value="YouCan">YouCan</option>
                          <option value="Shopify">Shopify</option>
                          <option value="WooCommerce">WooCommerce</option>
                          <option value="Custom API">Custom API</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Catégorie</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                        >
                          <option value="Health & Beauty">Santé & Beauté</option>
                          <option value="Fashion & Artisanal">Mode & Artisanal</option>
                          <option value="Electronics">Électronique</option>
                          <option value="E-commerce">E-commerce Général</option>
                          <option value="SaaS">SaaS & Services</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Ville</label>
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="Casablanca"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Commission (%)</label>
                        <input
                          type="number"
                          min="5"
                          max="50"
                          value={newCommissionRate}
                          onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">WhatsApp Support</label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+212 6 00 00 00 00"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                      💡 La marque sera enregistrée dans Firestore avec le statut <span className="font-bold">Awaiting Verification</span> et apparaîtra en haut de la liste pour être approuvée.
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isRegisteringBrand}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {isRegisteringBrand ? (
                          <span>Enregistrement...</span>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Créer la Marque</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: EARLY ACCESS & WAITLIST MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'earlyaccess' && (
          <AdminEarlyAccessLeads
            leads={earlyAccessLeads}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onConvertSellerToMerchant={handleConvertSellerToMerchant}
            isUpdating={isUpdatingLead}
            convertSuccessMsg={convertSuccessMsg}
            onClearSuccessMsg={() => setConvertSuccessMsg(null)}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SYSTEM AUDIT LOG (Mandatory from Section 2) */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">System Audit Log & Moroccan COD Tracking Stream</h3>
                  <p className="text-xs text-slate-500">Live operational ledger of webhook events, COD status changes (Pending - Delivered), and payout dispatches.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-slate-600">Audit Stream Active</span>
                </div>
              </div>

              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all flex items-start gap-3.5"
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      log.severity === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      log.severity === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {log.severity === 'success' ? <CheckCircle className="w-4 h-4" /> :
                       log.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-slate-900">{log.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PLATFORM SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-3xl">
            <h3 className="text-lg font-bold text-slate-950 mb-2">Platform Monetization & Commission Configuration</h3>
            <p className="text-xs text-slate-500 mb-8">Configure your SaaS business model parameters, take-rate percentages, and local payout settlement rules.</p>

            <div className="space-y-6 text-xs">
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">SaaS Platform Take Rate (%)</div>
                    <div className="text-slate-500">Percentage charged automatically on every successfully delivered COD order.</div>
                  </div>
                  <span className="text-base font-extrabold text-blue-600">{platformTakeRate}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="0.5"
                  value={platformTakeRate}
                  onChange={(e) => setPlatformTakeRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Minimum Affiliate Payout (MAD)</div>
                  <div className="text-slate-500 mb-3">Minimum Dirhams required before an affiliate can trigger a Bank RIB transfer.</div>
                  <input
                    type="number"
                    defaultValue={500}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Cookie Attribution Window</div>
                  <div className="text-slate-500 mb-3">Standard attribution window across all Moroccan influencer referral links.</div>
                  <select className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold">
                    <option>30 Days (Recommended)</option>
                    <option>45 Days</option>
                    <option>60 Days</option>
                    <option>90 Days</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <div className="font-bold mb-1">Moroccan Bank Verification Rule</div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  RIBs are automatically validated with the Bank Al-Maghrib 24-digit checksum algorithm (Clé RIB = 97 - ((89 * CodeBanque + 15 * CodeGuichet + 3 * NumeroCompte) mod 97)).
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CMS & TEXTS CONTENT EDITOR */}
        {/* ========================================================================= */}
        {activeTab === 'content' && (
          <AdminContentEditor onPreviewLiveSite={onSwitchToAffiliateView} />
        )}

      </div>
    </div>
  );
};
