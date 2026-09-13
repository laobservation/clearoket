import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Sparkles, 
  Search, 
  Download, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileSpreadsheet, 
  ArrowUpDown, 
  Eye, 
  Share2, 
  UserCheck, 
  ShieldCheck, 
  TrendingUp, 
  Tag, 
  ShoppingBag,
  Send,
  Users
} from 'lucide-react';
import { EarlyAccessLead } from '../types';

interface AdminEarlyAccessLeadsProps {
  leads: EarlyAccessLead[];
  onUpdateLeadStatus: (leadId: string, status: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED', notes?: string) => Promise<void>;
  onConvertSellerToMerchant: (lead: EarlyAccessLead) => Promise<void>;
  isUpdating: boolean;
  convertSuccessMsg: string | null;
  onClearSuccessMsg: () => void;
}

export const AdminEarlyAccessLeads: React.FC<AdminEarlyAccessLeadsProps> = ({
  leads,
  onUpdateLeadStatus,
  onConvertSellerToMerchant,
  isUpdating,
  convertSuccessMsg,
  onClearSuccessMsg
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SELLER' | 'CREATOR'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'NAME_DESC' | 'DATE_DESC' | 'DATE_ASC' | 'CITY'>('NAME_ASC');
  
  // Modal for lead details
  const [selectedLead, setSelectedLead] = useState<EarlyAccessLead | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Stats calculation
  const totalLeads = leads.length;
  const sellerLeads = leads.filter(l => l.userType === 'SELLER');
  const creatorLeads = leads.filter(l => l.userType === 'CREATOR');
  const pendingLeads = leads.filter(l => l.status === 'PENDING');
  const approvedLeads = leads.filter(l => l.status === 'APPROVED');
  const contactedLeads = leads.filter(l => l.status === 'CONTACTED');

  // Filtered and sorted list
  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Role filter
        if (roleFilter === 'SELLER' && lead.userType !== 'SELLER') return false;
        if (roleFilter === 'CREATOR' && lead.userType !== 'CREATOR') return false;
        
        // Status filter
        if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
        
        // Search query across name, email, phone, store, handle, city, niche
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
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
        if (sortBy === 'NAME_ASC') {
          return a.fullName.localeCompare(b.fullName, 'fr', { sensitivity: 'base' });
        }
        if (sortBy === 'NAME_DESC') {
          return b.fullName.localeCompare(a.fullName, 'fr', { sensitivity: 'base' });
        }
        if (sortBy === 'DATE_ASC') {
          return (a.queueNumber || 999) - (b.queueNumber || 999);
        }
        if (sortBy === 'CITY') {
          return (a.city || '').localeCompare(b.city || '', 'fr');
        }
        // Default: DATE_DESC
        return (b.queueNumber || 0) - (a.queueNumber || 0);
      });
  }, [leads, roleFilter, statusFilter, searchQuery, sortBy]);

  // Open inspection modal
  const handleOpenLeadDetails = (lead: EarlyAccessLead) => {
    setSelectedLead(lead);
    setNotesInput(lead.notes || '');
  };

  // Save CRM notes
  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsSavingNotes(true);
    await onUpdateLeadStatus(selectedLead.id, selectedLead.status, notesInput);
    setIsSavingNotes(false);
    setSelectedLead(prev => prev ? { ...prev, notes: notesInput } : null);
  };

  // Format WhatsApp Link
  const getWhatsAppLink = (phone: string, lead: EarlyAccessLead) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const isSeller = lead.userType === 'SELLER';
    const message = isSeller 
      ? `Bonjour ${lead.fullName}, nous avons bien reçu votre demande d'accès anticipé pour votre boutique ${lead.storeName || ''} sur RoketLead Maroc. Nous aimerions échanger avec vous pour finaliser votre intégration.`
      : `Salam ${lead.fullName}, nous avons bien reçu votre inscription pour rejoindre le réseau de créateurs RoketLead Maroc (@${lead.socialHandle?.replace('@', '')}). Félicitations, votre profil a été retenu !`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Export CSV
  const handleExportCSV = () => {
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
    link.setAttribute('download', `roketlead-waitlist-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert if any action completed */}
      {convertSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{convertSuccessMsg}</span>
          </div>
          <button 
            onClick={onClearSuccessMsg}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inscrits */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Demandes VIP</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalLeads}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Campagne Accès Anticipé Maroc
          </div>
        </div>

        {/* Vendeurs / E-commerçants */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">🛒 Vendeurs & Marques</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{sellerLeads.length}</div>
          <div className="text-[11px] text-blue-700/80 mt-1 font-medium">
            {Math.round((sellerLeads.length / (totalLeads || 1)) * 100)}% des inscrits • YouCan / Shopify
          </div>
        </div>

        {/* Créateurs de Contenu */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">✨ Créateurs & Influenceurs</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{creatorLeads.length}</div>
          <div className="text-[11px] text-purple-700/80 mt-1 font-medium">
            {Math.round((creatorLeads.length / (totalLeads || 1)) * 100)}% des inscrits • TikTok / Instagram
          </div>
        </div>

        {/* En Attente de Revue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">⏳ En Attente de Validation</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingLeads.length}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Nécessitent un premier contact WhatsApp
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
        
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-950">Gestion des Inscriptions Accès Anticipé</h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] rounded-full font-bold">
                Waitlist VIP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Classement et gestion unifiée de tous les candidats (vendeurs et créateurs marocains)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Direct Link to Dedicated Page */}
            <button
              onClick={() => window.open('#earlyaccess', '_blank')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Voir la Page Dédiée (/earlyaccess)</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Exporter CSV ({filteredAndSortedLeads.length})</span>
            </button>
          </div>
        </div>

        {/* Filter & Sorting Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
          
          {/* Left: Role Filter Tabs (Tous / Vendeurs / Créateurs) */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                roleFilter === 'ALL' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({totalLeads})
            </button>
            <button
              onClick={() => setRoleFilter('SELLER')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                roleFilter === 'SELLER' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Vendeurs ({sellerLeads.length})</span>
            </button>
            <button
              onClick={() => setRoleFilter('CREATOR')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                roleFilter === 'CREATOR' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Créateurs ({creatorLeads.length})</span>
            </button>
          </div>

          {/* Right: Search, Status Filter & Sorting */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
            
            {/* Live Search Bar */}
            <div className="relative min-w-[220px] sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher nom, @handle, ville..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer focus:outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">⏳ En attente ({pendingLeads.length})</option>
              <option value="CONTACTED">💬 Contacté ({contactedLeads.length})</option>
              <option value="APPROVED">✅ Approuvé ({approvedLeads.length})</option>
              <option value="REJECTED">❌ Rejeté</option>
            </select>

            {/* Sort By Dropdown (arranged by name and info) */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="NAME_ASC">Nom (A → Z)</option>
                <option value="NAME_DESC">Nom (Z → A)</option>
                <option value="DATE_DESC">Plus récent d'abord</option>
                <option value="DATE_ASC">Plus ancien d'abord</option>
                <option value="CITY">Par Ville (Maroc)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Candidat & Contact</th>
                <th className="py-3.5 px-4 font-bold">Rôle / Type</th>
                <th className="py-3.5 px-4 font-bold">Boutique ou Profil Social</th>
                <th className="py-3.5 px-4 font-bold">Volume / Audience</th>
                <th className="py-3.5 px-4 font-bold">Ville</th>
                <th className="py-3.5 px-4 font-bold">Statut</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAndSortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm text-slate-600">Aucun candidat ne correspond à vos filtres.</p>
                    <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedLeads.map((lead) => {
                  const isSeller = lead.userType === 'SELLER';
                  const initials = lead.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'VIP';

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Column 1: Nom & Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSeller 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                              : 'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{lead.fullName}</span>
                              {lead.queueNumber && (
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-normal">
                                  #{lead.queueNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <a 
                                href={`mailto:${lead.email}`} 
                                className="hover:text-blue-600 flex items-center gap-1"
                                title="Envoyer un email"
                              >
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{lead.email}</span>
                              </a>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span className="font-mono">{lead.phone}</span>
                              <a
                                href={getWhatsAppLink(lead.phone, lead)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-200 transition-colors inline-flex items-center gap-0.5"
                                title="Ouvrir WhatsApp direct"
                              >
                                <MessageSquare className="w-2.5 h-2.5" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Rôle / Type (Seller vs Creator) */}
                      <td className="py-3.5 px-4">
                        {isSeller ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-xs">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Vendeur</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/80 font-bold text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Créateur</span>
                          </span>
                        )}
                      </td>

                      {/* Column 3: Store or Social Handle */}
                      <td className="py-3.5 px-4">
                        {isSeller ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900">
                              {lead.storeName || 'Boutique E-commerce'}
                            </div>
                            {lead.storeUrl && (
                              <a
                                href={lead.storeUrl.startsWith('http') ? lead.storeUrl : `https://${lead.storeUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
                              >
                                <span>{lead.storeUrl.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {lead.platform && (
                              <span className="inline-block px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                                {lead.platform}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-bold text-purple-900">
                              {lead.socialHandle ? `@${lead.socialHandle.replace('@', '')}` : 'Réseaux Sociaux'}
                            </div>
                            {lead.niche && (
                              <div className="text-[11px] text-slate-500 font-medium">
                                {lead.niche}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Volume / Audience */}
                      <td className="py-3.5 px-4">
                        {isSeller ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {lead.monthlyOrders || 'En lancement'}
                            </div>
                            <div className="text-[10px] text-slate-400">commandes / mois</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-purple-900">
                              {lead.audienceSize || '10 000+'}
                            </div>
                            <div className="text-[10px] text-slate-400">abonnés actifs</div>
                          </div>
                        )}
                      </td>

                      {/* Column 5: Ville (Maroc) */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{lead.city || 'Maroc'}</span>
                        </span>
                      </td>

                      {/* Column 6: Statut */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          disabled={isUpdating}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none ${
                            lead.status === 'APPROVED' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : lead.status === 'CONTACTED' 
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : lead.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="PENDING">⏳ En attente</option>
                          <option value="CONTACTED">💬 Contacté</option>
                          <option value="APPROVED">✅ Approuvé</option>
                          <option value="REJECTED">❌ Rejeté</option>
                        </select>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {lead.createdDateFormatted}
                        </div>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick WhatsApp message */}
                          <a
                            href={getWhatsAppLink(lead.phone, lead)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                            title="Discuter sur WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Quick Approve Button */}
                          {lead.status !== 'APPROVED' && (
                            <button
                              onClick={() => onUpdateLeadStatus(lead.id, 'APPROVED')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                              title="Approuver l'accès"
                            >
                              Valider
                            </button>
                          )}

                          {/* Details & CRM Notes */}
                          <button
                            onClick={() => handleOpenLeadDetails(lead)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Détails
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination / Count Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
          <div>
            Affichage de <span className="font-bold text-slate-800">{filteredAndSortedLeads.length}</span> sur{' '}
            <span className="font-bold text-slate-800">{totalLeads}</span> candidatures
          </div>
          <div className="text-[11px] text-slate-400">
            Données synchronisées en direct avec la collection Firestore <span className="font-mono text-slate-600">waitlist</span>
          </div>
        </div>

      </div>

      {/* Modal / Slide-over: Detailed Lead Inspection & CRM Notes */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  selectedLead.userType === 'SELLER' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {selectedLead.userType === 'SELLER' ? <Building2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-base">{selectedLead.fullName}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedLead.userType === 'SELLER' ? 'Candidat Vendeur / E-commerçant' : 'Candidat Créateur / Influenceur'} • #{selectedLead.queueNumber || '1'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Grid */}
            <div className="space-y-4 text-xs">
              
              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="text-slate-400 font-semibold mb-1">Email de contact</div>
                  <div className="font-bold text-slate-900 break-all">{selectedLead.email}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="text-slate-400 font-semibold mb-1">Téléphone / WhatsApp</div>
                  <div className="font-bold text-slate-900 font-mono flex items-center justify-between">
                    <span>{selectedLead.phone}</span>
                    <a
                      href={getWhatsAppLink(selectedLead.phone, selectedLead)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-200"
                    >
                      Ouvrir Chat
                    </a>
                  </div>
                </div>
              </div>

              {/* Specific Field Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedLead.userType === 'SELLER' ? 'Détails de la Boutique & E-commerce' : 'Profil Social & Audience'}
                </div>

                {selectedLead.userType === 'SELLER' ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 block font-medium">Nom de la Marque</span>
                      <span className="font-bold text-slate-800">{selectedLead.storeName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Plateforme E-commerce</span>
                      <span className="font-bold text-slate-800">{selectedLead.platform || 'YouCan'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Commandes Mensuelles</span>
                      <span className="font-bold text-slate-800">{selectedLead.monthlyOrders || 'En lancement'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Ville d'Expédition</span>
                      <span className="font-bold text-slate-800">{selectedLead.city || 'Maroc'}</span>
                    </div>
                    {selectedLead.storeUrl && (
                      <div className="col-span-2 pt-1">
                        <span className="text-slate-400 block font-medium">URL de la Boutique</span>
                        <a
                          href={selectedLead.storeUrl.startsWith('http') ? selectedLead.storeUrl : `https://${selectedLead.storeUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-mono break-all inline-flex items-center gap-1 font-semibold"
                        >
                          <span>{selectedLead.storeUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 block font-medium">Handle Principal</span>
                      <span className="font-bold text-purple-900">@{selectedLead.socialHandle?.replace('@', '') || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Taille de l'Audience</span>
                      <span className="font-bold text-purple-900">{selectedLead.audienceSize || '10k - 50k'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Niche & Contenu</span>
                      <span className="font-bold text-slate-800">{selectedLead.niche || 'Lifestyle & Mode'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Ville de Résidence</span>
                      <span className="font-bold text-slate-800">{selectedLead.city || 'Maroc'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Selector in Modal */}
              <div>
                <label className="text-slate-700 font-bold block mb-1.5">Statut de la Candidature</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateLeadStatus(selectedLead.id, st)}
                      className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                        selectedLead.status === st
                          ? st === 'APPROVED' ? 'bg-emerald-600 text-white border-emerald-600'
                          : st === 'CONTACTED' ? 'bg-blue-600 text-white border-blue-600'
                          : st === 'REJECTED' ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st === 'APPROVED' ? 'Approuvé' : st === 'CONTACTED' ? 'Contacté' : st === 'REJECTED' ? 'Rejeté' : 'En attente'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin CRM Private Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700 font-bold">Notes Privées de l'Administration</label>
                  <span className="text-[11px] text-slate-400">Visible uniquement par les Super Admins</span>
                </div>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Ex: Contacté via WhatsApp. Offre 18% commission. Boutique intégrée avec succès..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    {isSavingNotes ? 'Enregistrement...' : 'Enregistrer la Note'}
                  </button>
                </div>
              </div>

              {/* 1-Click Convert Seller to Active Merchant in System */}
              {selectedLead.userType === 'SELLER' && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="font-bold text-blue-950 mb-1">Convertir en Marque Partenaire Directe</div>
                  <p className="text-[11px] text-blue-800 mb-3 leading-relaxed">
                    Crée automatiquement un profil marchand actif dans la base de données Firestore avec les informations fournies.
                  </p>
                  <button
                    onClick={() => onConvertSellerToMerchant(selectedLead)}
                    disabled={isUpdating}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Créer le Compte Marchand Partenaire</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <a
                  href={getWhatsAppLink(selectedLead.phone, selectedLead)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuter sur WhatsApp</span>
                </a>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
