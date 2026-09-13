import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Activity, 
  Layers, 
  Scale, 
  ShoppingBag, 
  Calculator, 
  Phone, 
  Compass, 
  Shield, 
  LayoutDashboard, 
  Save, 
  RotateCcw, 
  Check, 
  Search, 
  Eye, 
  Download, 
  Upload, 
  Languages, 
  FileText, 
  AlertCircle, 
  ExternalLink,
  Copy,
  CheckCheck,
  Filter,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { EDITABLE_SECTIONS, EditableSectionConfig, EditableFieldConfig } from '../i18n/sectionsConfig';
import { useLanguage, Language } from '../context/LanguageContext';

interface AdminContentEditorProps {
  onPreviewLiveSite?: () => void;
}

export const AdminContentEditor: React.FC<AdminContentEditorProps> = ({ onPreviewLiveSite }) => {
  const { 
    language: activeAppLang, 
    setLanguage: setActiveAppLang, 
    customTexts, 
    updateCustomText, 
    batchUpdateCustomTexts,
    resetCustomKey, 
    resetSection, 
    resetAllCustomTexts, 
    getDefaultText,
    isCustomized,
    customCount
  } = useLanguage();

  const [selectedSectionId, setSelectedSectionId] = useState<string>('hero');
  const [editingLang, setEditingLang] = useState<Language>('fr');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlyModified, setShowOnlyModified] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'sideBySide'>('single');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  // Icon map
  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      case 'Scale': return <Scale className="w-4 h-4" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
      case 'Calculator': return <Calculator className="w-4 h-4" />;
      case 'Phone': return <Phone className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Shield': return <Shield className="w-4 h-4" />;
      case 'LayoutDashboard': return <LayoutDashboard className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Find active section
  const currentSection = useMemo(() => {
    return EDITABLE_SECTIONS.find(s => s.id === selectedSectionId) || EDITABLE_SECTIONS[0];
  }, [selectedSectionId]);

  // Count modified fields per section
  const sectionModifiedCounts = useMemo(() => {
    const counts: Record<string, { fr: number; ar: number; total: number }> = {};
    EDITABLE_SECTIONS.forEach(sec => {
      let frCount = 0;
      let arCount = 0;
      sec.fields.forEach(f => {
        if (isCustomized('fr', f.key)) frCount++;
        if (isCustomized('ar', f.key)) arCount++;
      });
      counts[sec.id] = { fr: frCount, ar: arCount, total: frCount + arCount };
    });
    return counts;
  }, [customTexts, isCustomized]);

  // Filter fields based on search and "modified only"
  const filteredFields = useMemo(() => {
    return currentSection.fields.filter(field => {
      const defaultFr = getDefaultText('fr', field.key).toLowerCase();
      const defaultAr = getDefaultText('ar', field.key).toLowerCase();
      const customFr = (customTexts.fr[field.key] || '').toLowerCase();
      const customAr = (customTexts.ar[field.key] || '').toLowerCase();
      const keyMatch = field.key.toLowerCase().includes(searchQuery.toLowerCase());
      const labelMatch = field.labelFr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         field.labelAr.toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = defaultFr.includes(searchQuery.toLowerCase()) || 
                           defaultAr.includes(searchQuery.toLowerCase()) ||
                           customFr.includes(searchQuery.toLowerCase()) ||
                           customAr.includes(searchQuery.toLowerCase());

      const matchesSearch = searchQuery.trim() === '' || keyMatch || labelMatch || contentMatch;

      if (!matchesSearch) return false;

      if (showOnlyModified) {
        if (viewMode === 'single') {
          return isCustomized(editingLang, field.key);
        } else {
          return isCustomized('fr', field.key) || isCustomized('ar', field.key);
        }
      }

      return true;
    });
  }, [currentSection, searchQuery, showOnlyModified, viewMode, editingLang, customTexts, getDefaultText, isCustomized]);

  const handleFieldChange = (lang: Language, key: string, value: string) => {
    updateCustomText(lang, key, value);
    setSaveSuccessMessage('Modifications enregistrées automatiquement');
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  const handleResetField = (lang: Language, key: string) => {
    resetCustomKey(lang, key);
    setSaveSuccessMessage('Champ réinitialisé à sa valeur par défaut');
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  const handleResetCurrentSection = () => {
    const keys = currentSection.fields.map(f => f.key);
    if (window.confirm(`Voulez-vous vraiment réinitialiser tous les textes de la section "${currentSection.titleFr}" pour la langue ${editingLang === 'fr' ? 'Français' : 'Arabe'} ?`)) {
      resetSection(keys, editingLang);
      setSaveSuccessMessage(`Section ${currentSection.titleFr} réinitialisée !`);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  const handleResetAll = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser l'ensemble des textes personnalisés sur toute la plateforme ? Toutes les sections reprendront leur texte d'origine.")) {
      resetAllCustomTexts();
      setSaveSuccessMessage('Tous les textes de la plateforme ont été réinitialisés aux valeurs par défaut.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customTexts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `roketlead-textes-cms-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (typeof parsed !== 'object' || (!parsed.fr && !parsed.ar)) {
        throw new Error("Le format JSON doit contenir au minimum un objet 'fr' ou 'ar'.");
      }
      batchUpdateCustomTexts(parsed);
      setShowImportModal(false);
      setImportJsonText('');
      setImportError(null);
      setSaveSuccessMessage('Configuration des textes importée avec succès !');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err: any) {
      setImportError(err.message || 'Fichier JSON invalide');
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6" id="admin-content-editor">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Éditeur de Textes & Titres (CMS Plateforme)
                  {customCount > 0 && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {customCount} texte{customCount > 1 ? 's' : ''} personnalisé{customCount > 1 ? 's' : ''}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Modifiez instantanément n'importe quel titre, description, bouton ou texte de la plateforme section par section en Français et en Arabe.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & View Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'single'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vue Simple
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sideBySide')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'sideBySide'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Côte-à-Côte (FR & AR)
              </button>
            </div>

            {/* Language Selector (when in single view) */}
            {viewMode === 'single' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setEditingLang('fr')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    editingLang === 'fr'
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🇫🇷</span>
                  <span>Français</span>
                  {sectionModifiedCounts[selectedSectionId]?.fr > 0 && (
                    <span className={`text-[10px] px-1.5 rounded-full ${editingLang === 'fr' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {sectionModifiedCounts[selectedSectionId]?.fr}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLang('ar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    editingLang === 'ar'
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🇲🇦</span>
                  <span>العربية</span>
                  {sectionModifiedCounts[selectedSectionId]?.ar > 0 && (
                    <span className={`text-[10px] px-1.5 rounded-full ${editingLang === 'ar' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {sectionModifiedCounts[selectedSectionId]?.ar}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Live Preview Button */}
            {onPreviewLiveSite && (
              <button
                type="button"
                onClick={onPreviewLiveSite}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                title="Visualiser les textes modifiés sur la page d'accueil"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Voir sur le site</span>
              </button>
            )}

            {/* Import / Export dropdown buttons */}
            <button
              type="button"
              onClick={handleExportJson}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              title="Exporter les textes au format JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              title="Importer des textes depuis un JSON"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              disabled={customCount === 0}
              className={`p-2 rounded-xl border transition-colors ${
                customCount > 0 
                  ? 'text-rose-600 hover:bg-rose-50 border-rose-200' 
                  : 'text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
              title="Réinitialiser tous les textes par défaut"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
            <span className="text-[11px] text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              Sauvegardé en mémoire locale
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Section Navigation Sidebar + Fields Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sections List (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sections de la Plateforme
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {EDITABLE_SECTIONS.length} sections
            </span>
          </div>

          <div className="space-y-1">
            {EDITABLE_SECTIONS.map(section => {
              const isActive = section.id === selectedSectionId;
              const modifiedStats = sectionModifiedCounts[section.id];
              const hasModifications = modifiedStats?.total > 0;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-medium'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`p-2 rounded-lg shrink-0 transition-colors ${
                      isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      {getSectionIcon(section.iconName)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {section.titleFr}
                      </div>
                      <div className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {section.fields.length} champs de texte
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {hasModifications && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-white text-blue-700' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {modifiedStats.total} modif{modifiedStats.total > 1 ? 's' : ''}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Fields of Selected Section (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Section Subheader Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {currentSection.badge}
                  </span>
                  <span className="text-xs text-slate-400">ID: {currentSection.id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {currentSection.titleFr}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentSection.descriptionFr}
                </p>
              </div>

              {/* Action Buttons for this Section */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCurrentSection}
                  disabled={(viewMode === 'single' ? sectionModifiedCounts[currentSection.id]?.[editingLang] : sectionModifiedCounts[currentSection.id]?.total) === 0}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
                  title="Réinitialiser cette section aux textes par défaut"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser la section</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Rechercher un texte dans "${currentSection.titleFr}"...`}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition-colors shrink-0">
                  <input
                    type="checkbox"
                    checked={showOnlyModified}
                    onChange={(e) => setShowOnlyModified(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Modifiés uniquement</span>
                </label>
              </div>
            </div>
          </div>

          {/* Fields List */}
          {filteredFields.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Aucun champ ne correspond à votre filtre
              </p>
              <p className="text-xs text-slate-400">
                {showOnlyModified 
                  ? "Aucun texte n'a encore été modifié dans cette section." 
                  : "Essayez avec d'autres termes de recherche."}
              </p>
              {(searchQuery || showOnlyModified) && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setShowOnlyModified(false); }}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Effacer les filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFields.map(field => {
                const isModifiedFr = isCustomized('fr', field.key);
                const isModifiedAr = isCustomized('ar', field.key);
                const defaultFr = getDefaultText('fr', field.key);
                const defaultAr = getDefaultText('ar', field.key);
                const currentValFr = customTexts.fr[field.key] ?? defaultFr;
                const currentValAr = customTexts.ar[field.key] ?? defaultAr;

                return (
                  <div
                    key={field.key}
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      (isModifiedFr || isModifiedAr)
                        ? 'border-emerald-300/80 shadow-sm bg-gradient-to-r from-white to-emerald-50/20'
                        : 'border-slate-200/80 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    {/* Field Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {field.labelFr}
                        </span>
                        <span className="text-xs text-slate-400">/</span>
                        <span className="text-xs font-medium text-slate-500" dir="rtl">
                          {field.labelAr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Key Badge with Copy */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(field.key, field.key)}
                          className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Copier la clé de traduction"
                        >
                          {copiedKey === field.key ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>{field.key}</span>
                            </>
                          )}
                        </button>

                        {/* Modified Status Pill */}
                        {(viewMode === 'single' ? isCustomized(editingLang, field.key) : (isModifiedFr || isModifiedAr)) ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Modifié
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                            Par défaut
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Field Inputs */}
                    {viewMode === 'sideBySide' ? (
                      /* Side-by-side mode: French & Arabic simultaneously */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* French Input Card */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1">
                              <span>🇫🇷</span> Français
                            </span>
                            {isModifiedFr && (
                              <button
                                type="button"
                                onClick={() => handleResetField('fr', field.key)}
                                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                                title="Restaurer la valeur par défaut"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Rétablir</span>
                              </button>
                            )}
                          </div>

                          {field.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              value={currentValFr}
                              onChange={(e) => handleFieldChange('fr', field.key, e.target.value)}
                              placeholder={defaultFr}
                              className={`w-full p-2.5 text-xs text-slate-900 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                                isModifiedFr 
                                  ? 'border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500' 
                                  : 'border-slate-200 bg-slate-50/60 focus:ring-blue-500 focus:bg-white'
                              }`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={currentValFr}
                              onChange={(e) => handleFieldChange('fr', field.key, e.target.value)}
                              placeholder={defaultFr}
                              className={`w-full px-3 py-2 text-xs text-slate-900 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                                isModifiedFr 
                                  ? 'border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500' 
                                  : 'border-slate-200 bg-slate-50/60 focus:ring-blue-500 focus:bg-white'
                              }`}
                            />
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span className="truncate max-w-[200px]" title={`Défaut: ${defaultFr}`}>
                              Défaut: {defaultFr}
                            </span>
                            <span>{currentValFr.length} car.</span>
                          </div>
                        </div>

                        {/* Arabic Input Card */}
                        <div className="space-y-1.5" dir="rtl">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1">
                              <span>🇲🇦</span> العربية
                            </span>
                            {isModifiedAr && (
                              <button
                                type="button"
                                onClick={() => handleResetField('ar', field.key)}
                                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                                title="استعادة النص الافتراضي"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>استعادة</span>
                              </button>
                            )}
                          </div>

                          {field.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              value={currentValAr}
                              onChange={(e) => handleFieldChange('ar', field.key, e.target.value)}
                              placeholder={defaultAr}
                              className={`w-full p-2.5 text-xs text-slate-900 rounded-xl border focus:outline-none focus:ring-2 transition-all text-right ${
                                isModifiedAr 
                                  ? 'border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500' 
                                  : 'border-slate-200 bg-slate-50/60 focus:ring-blue-500 focus:bg-white'
                              }`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={currentValAr}
                              onChange={(e) => handleFieldChange('ar', field.key, e.target.value)}
                              placeholder={defaultAr}
                              className={`w-full px-3 py-2 text-xs text-slate-900 rounded-xl border focus:outline-none focus:ring-2 transition-all text-right ${
                                isModifiedAr 
                                  ? 'border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500' 
                                  : 'border-slate-200 bg-slate-50/60 focus:ring-blue-500 focus:bg-white'
                              }`}
                            />
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span className="truncate max-w-[200px]" title={`الافتراضي: ${defaultAr}`}>
                              الافتراضي: {defaultAr}
                            </span>
                            <span>{currentValAr.length} حرف</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Single Language Mode */
                      <div className="space-y-2">
                        {editingLang === 'fr' ? (
                          <div className="space-y-1.5">
                            {field.type === 'textarea' ? (
                              <textarea
                                rows={3}
                                value={currentValFr}
                                onChange={(e) => handleFieldChange('fr', field.key, e.target.value)}
                                placeholder={defaultFr}
                                className={`w-full p-3 text-sm text-slate-900 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                                  isModifiedFr 
                                    ? 'border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500' 
                                    : 'border-slate-200 bg-slate-50/60 focus:ring-blue-500 focus:bg-white'
                                }`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValFr}
                                onChange={(e) => handleFieldChange('fr', field.key, e.target.value)}
                                placeholder={defaultFr}
                                className={`w-full px-3.5 py-2.5 text-sm text-slate-900 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                                  isModifiedFr 
                                    ? 'border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500' 
                                    : 'border-slate-200 bg-slate-50/60 focus:ring-blue-500 focus:bg-white'
                                }`}
                              />
                            )}

                            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-500">Texte par défaut :</span>
                                <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded italic">
                                  {defaultFr}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span>{currentValFr.length} caractères</span>
                                {isModifiedFr && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetField('fr', field.key)}
                                    className="text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Rétablir par défaut</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5" dir="rtl">
                            {field.type === 'textarea' ? (
                              <textarea
                                rows={3}
                                value={currentValAr}
                                onChange={(e) => handleFieldChange('ar', field.key, e.target.value)}
                                placeholder={defaultAr}
                                className={`w-full p-3 text-sm text-slate-900 rounded-xl border focus:outline-none focus:ring-2 transition-all text-right ${
                                  isModifiedAr 
                                    ? 'border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500' 
                                    : 'border-slate-200 bg-slate-50/60 focus:ring-blue-500 focus:bg-white'
                                }`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={currentValAr}
                                onChange={(e) => handleFieldChange('ar', field.key, e.target.value)}
                                placeholder={defaultAr}
                                className={`w-full px-3.5 py-2.5 text-sm text-slate-900 rounded-xl border focus:outline-none focus:ring-2 transition-all text-right ${
                                  isModifiedAr 
                                    ? 'border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500' 
                                    : 'border-slate-200 bg-slate-50/60 focus:ring-blue-500 focus:bg-white'
                                }`}
                              />
                            )}

                            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-500">النص الأصلي :</span>
                                <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded italic">
                                  {defaultAr}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span>{currentValAr.length} حرف</span>
                                {isModifiedAr && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetField('ar', field.key)}
                                    className="text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>استعادة الافتراضي</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Upload className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Importer une configuration de textes (JSON)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportError(null); }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Collez ci-dessous le contenu JSON exporté d'une autre session ou d'une sauvegarde pour appliquer tous les textes personnalisés en une seule fois.
            </p>

            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{ "fr": { "hero.title1": "..." }, "ar": { "hero.title1": "..." } }'
              className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportError(null); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
              >
                Appliquer les textes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
