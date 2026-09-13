export interface EditableFieldConfig {
  key: string;
  labelFr: string;
  labelAr: string;
  descriptionFr?: string;
  type: 'text' | 'textarea';
  placeholderFr?: string;
  placeholderAr?: string;
}

export interface EditableSectionConfig {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  badge: string;
  iconName: string;
  fields: EditableFieldConfig[];
}

export const EDITABLE_SECTIONS: EditableSectionConfig[] = [
  {
    id: 'hero',
    titleFr: 'En-tête & Hero Principal',
    titleAr: 'الترويسة والواجهة الرئيسية (Hero)',
    descriptionFr: 'Titres d’accroche, sous-titres, boutons d’action principaux et libellés des statistiques clés de la page d’accueil.',
    badge: 'Hero Section',
    iconName: 'Sparkles',
    fields: [
      {
        key: 'hero.badge',
        labelFr: 'Badge supérieur Hero',
        labelAr: 'الشارة العلوية',
        type: 'text',
        descriptionFr: 'Texte de la pastille située au-dessus du grand titre.'
      },
      {
        key: 'hero.title1',
        labelFr: 'Titre principal (Partie 1)',
        labelAr: 'العنوان الرئيسي (الجزء الأول)',
        type: 'text',
        descriptionFr: 'Première partie du titre principal de la page d’accueil.'
      },
      {
        key: 'hero.titleHighlight',
        labelFr: 'Titre principal (Accent mis en valeur)',
        labelAr: 'العنوان الرئيسي (الكلمة المميزة)',
        type: 'text',
        descriptionFr: 'Texte souligné ou mis en couleur bleue (ex: "au Maroc" / "في المغرب").'
      },
      {
        key: 'hero.subtitle',
        labelFr: 'Sous-titre explicatif Hero',
        labelAr: 'الوصف التوضيحي الرئيسي',
        type: 'textarea',
        descriptionFr: 'Paragraphe de présentation situé sous le titre principal.'
      },
      {
        key: 'hero.ctaSeller',
        labelFr: 'Bouton d’action : Vendeur',
        labelAr: 'زر البدء للبائعين',
        type: 'text',
        descriptionFr: 'Texte du bouton bleu principal d’inscription / démarrage vendeur.'
      },
      {
        key: 'hero.ctaPromoter',
        labelFr: 'Bouton d’action : Promoteur / Affilié',
        labelAr: 'زر الانضمام للمسوقين',
        type: 'text',
        descriptionFr: 'Texte du bouton blanc pour les créateurs de contenu.'
      },
      {
        key: 'hero.dashboardPreviewTitle',
        labelFr: 'Titre du sélecteur d’aperçu Dashboard',
        labelAr: 'عنوان مبدل المعاينة',
        type: 'text',
        descriptionFr: 'Texte précédant le basculeur Promoteur/Vendeur.'
      },
      {
        key: 'hero.togglePromoters',
        labelFr: 'Onglet Sélecteur : Promoteurs',
        labelAr: 'تبويب صناع المحتوى / مسوقين',
        type: 'text'
      },
      {
        key: 'hero.toggleSellers',
        labelFr: 'Onglet Sélecteur : Vendeurs',
        labelAr: 'تبويب أصحاب المتاجر / بائعين',
        type: 'text'
      },
      {
        key: 'hero.stats.merchants',
        labelFr: 'Statistique 1 : Libellé Vendeurs',
        labelAr: 'تسمية إحصائية المتاجر',
        type: 'text'
      },
      {
        key: 'hero.stats.affiliates',
        labelFr: 'Statistique 2 : Libellé Affiliés',
        labelAr: 'تسمية إحصائية المسوقين',
        type: 'text'
      },
      {
        key: 'hero.stats.volume',
        labelFr: 'Statistique 3 : Libellé Volume Leads',
        labelAr: 'تسمية إحصائية حجم المبيعات والليدات',
        type: 'text'
      },
      {
        key: 'hero.stats.deliveryRate',
        labelFr: 'Statistique 4 : Libellé Taux Conversion',
        labelAr: 'تسمية إحصائية معدل التحويل',
        type: 'text'
      }
    ]
  },
  {
    id: 'liveboard',
    titleFr: 'Showcase Live Board & Ticker',
    titleAr: 'لوحة الأداء المباشر وشريط العمليات',
    descriptionFr: 'Textes du tableau de bord animé en direct sur la page d’accueil, titres des cartes KPI et bannières d’état.',
    badge: 'Live Board',
    iconName: 'Activity',
    fields: [
      {
        key: 'liveboard.sellerTitle',
        labelFr: 'Titre du tableau : Vue Vendeur',
        labelAr: 'عنوان لوحة البائع',
        type: 'text'
      },
      {
        key: 'liveboard.sellerSubtitle',
        labelFr: 'Sous-titre du tableau : Vue Vendeur',
        labelAr: 'وصف لوحة البائع',
        type: 'text'
      },
      {
        key: 'liveboard.pixelBadge',
        labelFr: 'Pastille Pixel Actif',
        labelAr: 'شارة البيكسل النشط',
        type: 'text'
      },
      {
        key: 'liveboard.cardLeads',
        labelFr: 'Carte Vendeur 1 : Leads Trackés',
        labelAr: 'بطاقة 1: الليدات المحققة',
        type: 'text'
      },
      {
        key: 'liveboard.cardClicks',
        labelFr: 'Carte Vendeur 2 : Clics Trackés',
        labelAr: 'بطاقة 2: النقرات المسجلة',
        type: 'text'
      },
      {
        key: 'liveboard.cardAffiliates',
        labelFr: 'Carte Vendeur 3 : Promoteurs Actifs',
        labelAr: 'بطاقة 3: المسوقون النشطون',
        type: 'text'
      },
      {
        key: 'liveboard.cardCommissions',
        labelFr: 'Carte Vendeur 4 : Commissions Générées',
        labelAr: 'بطاقة 4: العمولات المستحقة',
        type: 'text'
      },
      {
        key: 'liveboard.promoterTitle',
        labelFr: 'Titre du tableau : Vue Promoteur',
        labelAr: 'عنوان لوحة المسوق',
        type: 'text'
      },
      {
        key: 'liveboard.promoterSubtitle',
        labelFr: 'Sous-titre du tableau : Vue Promoteur',
        labelAr: 'وصف لوحة المسوق',
        type: 'text'
      },
      {
        key: 'liveboard.cardPromoterLeads',
        labelFr: 'Carte Promoteur 1 : Mes Leads Validés',
        labelAr: 'بطاقة مسوق 1: ليداتي المؤكدة',
        type: 'text'
      },
      {
        key: 'liveboard.cardPromoterClicks',
        labelFr: 'Carte Promoteur 2 : Clics Liens Bio/Story',
        labelAr: 'بطاقة مسوق 2: نقرات روابطي',
        type: 'text'
      },
      {
        key: 'liveboard.cardPromoterOffers',
        labelFr: 'Carte Promoteur 3 : Campagnes Actives',
        labelAr: 'بطاقة مسوق 3: الحملات المشترك بها',
        type: 'text'
      },
      {
        key: 'liveboard.cardPromoterEarnings',
        labelFr: 'Carte Promoteur 4 : Gains Cumulés (MAD)',
        labelAr: 'بطاقة مسوق 4: الأرباح المحققة (درهم)',
        type: 'text'
      },
      {
        key: 'liveboard.statusBanner',
        labelFr: 'Titre de la bannière statut Pixel',
        labelAr: 'عنوان شريط حالة البيكسل',
        type: 'text'
      },
      {
        key: 'liveboard.statusBannerDesc',
        labelFr: 'Description de la bannière statut Pixel',
        labelAr: 'وصف شريط حالة البيكسل',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'how',
    titleFr: 'Comment ça marche (How It Works)',
    titleAr: 'كيف يعمل (خطوات البائع والمسوق)',
    descriptionFr: 'Titres des étapes, descriptions pédagogiques et points forts pour le vendeur et le promoteur.',
    badge: '3 Étapes',
    iconName: 'Layers',
    fields: [
      {
        key: 'how.badge',
        labelFr: 'Badge de la section',
        labelAr: 'شارة القسم',
        type: 'text'
      },
      {
        key: 'how.title',
        labelFr: 'Titre principal de la section',
        labelAr: 'العنوان الرئيسي للقسم',
        type: 'text'
      },
      {
        key: 'how.subtitle',
        labelFr: 'Sous-titre de la section',
        labelAr: 'الوصف الفرعي للقسم',
        type: 'text'
      },
      {
        key: 'how.sellerStep1.title',
        labelFr: 'Vendeur - Étape 1 : Titre',
        labelAr: 'البائع - الخطوة 1: العنوان',
        type: 'text'
      },
      {
        key: 'how.sellerStep1.desc',
        labelFr: 'Vendeur - Étape 1 : Description',
        labelAr: 'البائع - الخطوة 1: التفاصيل',
        type: 'textarea'
      },
      {
        key: 'how.sellerStep1.tag',
        labelFr: 'Vendeur - Étape 1 : Point fort (Pill)',
        labelAr: 'البائع - الخطوة 1: الشارة السفلية',
        type: 'text'
      },
      {
        key: 'how.sellerStep2.title',
        labelFr: 'Vendeur - Étape 2 : Titre',
        labelAr: 'البائع - الخطوة 2: العنوان',
        type: 'text'
      },
      {
        key: 'how.sellerStep2.desc',
        labelFr: 'Vendeur - Étape 2 : Description',
        labelAr: 'البائع - الخطوة 2: التفاصيل',
        type: 'textarea'
      },
      {
        key: 'how.sellerStep2.tag',
        labelFr: 'Vendeur - Étape 2 : Point fort (Pill)',
        labelAr: 'البائع - الخطوة 2: الشارة السفلية',
        type: 'text'
      },
      {
        key: 'how.sellerStep3.title',
        labelFr: 'Vendeur - Étape 3 : Titre',
        labelAr: 'البائع - الخطوة 3: العنوان',
        type: 'text'
      },
      {
        key: 'how.sellerStep3.desc',
        labelFr: 'Vendeur - Étape 3 : Description',
        labelAr: 'البائع - الخطوة 3: التفاصيل',
        type: 'textarea'
      },
      {
        key: 'how.sellerStep3.tag',
        labelFr: 'Vendeur - Étape 3 : Point fort (Pill)',
        labelAr: 'البائع - الخطوة 3: الشارة السفلية',
        type: 'text'
      },
      {
        key: 'how.promoterStep1.title',
        labelFr: 'Promoteur - Étape 1 : Titre',
        labelAr: 'المسوق - الخطوة 1: العنوان',
        type: 'text'
      },
      {
        key: 'how.promoterStep1.desc',
        labelFr: 'Promoteur - Étape 1 : Description',
        labelAr: 'المسوق - الخطوة 1: التفاصيل',
        type: 'textarea'
      },
      {
        key: 'how.promoterStep1.tag',
        labelFr: 'Promoteur - Étape 1 : Point fort (Pill)',
        labelAr: 'المسوق - الخطوة 1: الشارة السفلية',
        type: 'text'
      },
      {
        key: 'how.promoterStep2.title',
        labelFr: 'Promoteur - Étape 2 : Titre',
        labelAr: 'المسوق - الخطوة 2: العنوان',
        type: 'text'
      },
      {
        key: 'how.promoterStep2.desc',
        labelFr: 'Promoteur - Étape 2 : Description',
        labelAr: 'المسوق - الخطوة 2: التفاصيل',
        type: 'textarea'
      },
      {
        key: 'how.promoterStep2.tag',
        labelFr: 'Promoteur - Étape 2 : Point fort (Pill)',
        labelAr: 'المسوق - الخطوة 2: الشارة السفلية',
        type: 'text'
      },
      {
        key: 'how.promoterStep3.title',
        labelFr: 'Promoteur - Étape 3 : Titre',
        labelAr: 'المسوق - الخطوة 3: العنوان',
        type: 'text'
      },
      {
        key: 'how.promoterStep3.desc',
        labelFr: 'Promoteur - Étape 3 : Description',
        labelAr: 'المسوق - الخطوة 3: التفاصيل',
        type: 'textarea'
      },
      {
        key: 'how.promoterStep3.tag',
        labelFr: 'Promoteur - Étape 3 : Point fort (Pill)',
        labelAr: 'المسوق - الخطوة 3: الشارة السفلية',
        type: 'text'
      }
    ]
  },
  {
    id: 'compare',
    titleFr: 'Comparatif Meta Ads vs RoketLead',
    titleAr: 'مقارنة إعلانات ميتا ومبيعات روكيت ليد',
    descriptionFr: 'Tableau comparatif de rentabilité : CPM, CPC, CPA et gestion du risque financier.',
    badge: 'Comparatif',
    iconName: 'Scale',
    fields: [
      {
        key: 'compare.badge',
        labelFr: 'Badge du comparatif',
        labelAr: 'شارة جدول المقارنة',
        type: 'text'
      },
      {
        key: 'compare.title',
        labelFr: 'Titre principal du comparatif',
        labelAr: 'العنوان الرئيسي لجدول المقارنة',
        type: 'text'
      },
      {
        key: 'compare.subtitle',
        labelFr: 'Sous-titre explicatif',
        labelAr: 'الوصف الفرعي للمقارنة',
        type: 'text'
      },
      {
        key: 'compare.colCriteria',
        labelFr: 'Titre colonne 1 : Critères',
        labelAr: 'عمود معايير المقارنة',
        type: 'text'
      },
      {
        key: 'compare.colMeta',
        labelFr: 'Titre colonne 2 : Meta Ads',
        labelAr: 'عمود إعلانات فيسبوك وإنستغرام',
        type: 'text'
      },
      {
        key: 'compare.colRoket',
        labelFr: 'Titre colonne 3 : RoketLead',
        labelAr: 'عمود منصة روكيت ليد',
        type: 'text'
      },
      {
        key: 'compare.cpmTitle',
        labelFr: 'Ligne 1 : Titre CPM',
        labelAr: 'معيار تكلفة المشاهدات CPM',
        type: 'text'
      },
      {
        key: 'compare.cpmMeta',
        labelFr: 'Ligne 1 : Résultat Meta Ads',
        labelAr: 'نتيجة ميتا للظهور',
        type: 'text'
      },
      {
        key: 'compare.cpmRoket',
        labelFr: 'Ligne 1 : Résultat RoketLead',
        labelAr: 'نتيجة روكيت ليد للظهور',
        type: 'text'
      },
      {
        key: 'compare.cpcTitle',
        labelFr: 'Ligne 2 : Titre CPC',
        labelAr: 'معيار تكلفة النقرة CPC',
        type: 'text'
      },
      {
        key: 'compare.cpcMeta',
        labelFr: 'Ligne 2 : Résultat Meta Ads',
        labelAr: 'نتيجة ميتا للنقرات',
        type: 'text'
      },
      {
        key: 'compare.cpcRoket',
        labelFr: 'Ligne 2 : Résultat RoketLead',
        labelAr: 'نتيجة روكيت ليد للنقرات',
        type: 'text'
      },
      {
        key: 'compare.cpaTitle',
        labelFr: 'Ligne 3 : Titre Risque & CPA',
        labelAr: 'معيار المخاطرة والتكلفة CPA',
        type: 'text'
      },
      {
        key: 'compare.cpaMeta',
        labelFr: 'Ligne 3 : Résultat Meta Ads',
        labelAr: 'نتيجة ميتا للمخاطرة',
        type: 'text'
      },
      {
        key: 'compare.cpaRoket',
        labelFr: 'Ligne 3 : Résultat RoketLead',
        labelAr: 'نتيجة روكيت ليد للمخاطرة',
        type: 'text'
      },
      {
        key: 'compare.taxTitle',
        labelFr: 'Ligne 4 : Titre Taxe Publicitaire',
        labelAr: 'معيار ضريبة الإعلانات',
        type: 'text'
      },
      {
        key: 'compare.taxSub',
        labelFr: 'Ligne 4 : Sous-titre Taxe Publicitaire',
        labelAr: 'الوصف الفرعي لضريبة الإعلانات',
        type: 'text'
      },
      {
        key: 'compare.taxMeta',
        labelFr: 'Ligne 4 : Résultat Meta Ads',
        labelAr: 'نتيجة ميتا للضريبة',
        type: 'text'
      },
      {
        key: 'compare.taxRoket',
        labelFr: 'Ligne 4 : Résultat RoketLead',
        labelAr: 'نتيجة روكيت ليد للضريبة',
        type: 'text'
      },
      {
        key: 'compare.triggerTitle',
        labelFr: 'Ligne 5 : Titre Condition de Paiement',
        labelAr: 'معيار شرط وتوقيت الدفع',
        type: 'text'
      },
      {
        key: 'compare.triggerSub',
        labelFr: 'Ligne 5 : Sous-titre Condition de Paiement',
        labelAr: 'الوصف الفرعي لشرط الدفع',
        type: 'text'
      },
      {
        key: 'compare.triggerMeta',
        labelFr: 'Ligne 5 : Résultat Meta Ads',
        labelAr: 'نتيجة ميتا لتوقيت الدفع',
        type: 'text'
      },
      {
        key: 'compare.triggerRoket',
        labelFr: 'Ligne 5 : Résultat RoketLead',
        labelAr: 'نتيجة روكيت ليد لتوقيت الدفع',
        type: 'text'
      },
      {
        key: 'compare.ctaButton',
        labelFr: 'Bouton d’action (CTA)',
        labelAr: 'زر اتخاذ الإجراء (CTA)',
        type: 'text'
      }
    ]
  },
  {
    id: 'market',
    titleFr: 'Marketplace des Offres',
    titleAr: 'سوق العروض والمتاجر',
    descriptionFr: 'Titres, sous-titres, texte de recherche et labels des fiches de campagnes actives.',
    badge: 'Marketplace',
    iconName: 'ShoppingBag',
    fields: [
      {
        key: 'market.badge',
        labelFr: 'Badge de la marketplace',
        labelAr: 'شارة سوق العروض',
        type: 'text'
      },
      {
        key: 'market.title',
        labelFr: 'Titre de la marketplace',
        labelAr: 'العنوان الرئيسي لسوق العروض',
        type: 'text'
      },
      {
        key: 'market.subtitle',
        labelFr: 'Sous-titre descriptif',
        labelAr: 'الوصف الفرعي للعروض',
        type: 'text'
      },
      {
        key: 'market.searchPlaceholder',
        labelFr: 'Texte d’invite de recherche (Placeholder)',
        labelAr: 'نص حقل البحث التوضيحي',
        type: 'text'
      },
      {
        key: 'market.filterAll',
        labelFr: 'Libellé filtre : Toutes les catégories',
        labelAr: 'خيار جميع التصنيفات',
        type: 'text'
      },
      {
        key: 'market.commission',
        labelFr: 'Libellé : Commission',
        labelAr: 'تسمية العمولة',
        type: 'text'
      },
      {
        key: 'market.cookie',
        labelFr: 'Libellé : Durée cookie',
        labelAr: 'تسمية مدة ملف التتبع',
        type: 'text'
      },
      {
        key: 'market.exploreAll',
        labelFr: 'Bouton d’action : Explorer toutes les offres',
        labelAr: 'زر استعراض كافة العروض',
        type: 'text'
      }
    ]
  },
  {
    id: 'simulator',
    titleFr: 'Simulateur ROI & Gains en Dirhams (MAD)',
    titleAr: 'محاكي الأرباح والعوائد بالدرهم',
    descriptionFr: 'Titres du calculateur interactif, libellés des curseurs de simulation et textes de résultats.',
    badge: 'Calculateur ROI',
    iconName: 'Calculator',
    fields: [
      {
        key: 'simulator.badge',
        labelFr: 'Badge du simulateur',
        labelAr: 'شارة المحاكي',
        type: 'text'
      },
      {
        key: 'simulator.title',
        labelFr: 'Titre principal du simulateur',
        labelAr: 'العنوان الرئيسي لمحاكي المبيعات',
        type: 'text'
      },
      {
        key: 'simulator.subtitle',
        labelFr: 'Sous-titre explicatif',
        labelAr: 'الوصف التوضيحي للآلة الحاسبة',
        type: 'text'
      },
      {
        key: 'simulator.sliderAffiliates',
        labelFr: 'Curseur 1 : Promoteurs & Créateurs actifs',
        labelAr: 'مؤشر عدد المسوقين النشطين',
        type: 'text'
      },
      {
        key: 'simulator.sliderAOV',
        labelFr: 'Curseur 2 : Panier Moyen (AOV)',
        labelAr: 'مؤشر متوسط قيمة الطلب (AOV)',
        type: 'text'
      },
      {
        key: 'simulator.sliderSales',
        labelFr: 'Curseur 3 : Leads générés par mois',
        labelAr: 'مؤشر الليدات الشهرية لكل مسوق',
        type: 'text'
      },
      {
        key: 'simulator.resultVolume',
        labelFr: 'Label du résultat : Volume Mensuel Estimé',
        labelAr: 'تسمية نتيجة حجم المبيعات الإجمالي',
        type: 'text'
      },
      {
        key: 'simulator.btnCta',
        labelFr: 'Bouton d’action : Lancer le programme',
        labelAr: 'زر بدء البرنامج',
        type: 'text'
      }
    ]
  },
  {
    id: 'contact',
    titleFr: 'Contact & Support Casablanca',
    titleAr: 'الاتصال والدعم (كازابلانكا)',
    descriptionFr: 'Coordonnées de l’équipe marocaine, bouton WhatsApp direct, formulaire de contact et message de validation.',
    badge: 'Support Client',
    iconName: 'Phone',
    fields: [
      {
        key: 'contact.badge',
        labelFr: 'Badge de la section contact',
        labelAr: 'شارة قسم التواصل',
        type: 'text'
      },
      {
        key: 'contact.title',
        labelFr: 'Titre principal de la section contact',
        labelAr: 'العنوان الرئيسي للتواصل',
        type: 'text'
      },
      {
        key: 'contact.subtitle',
        labelFr: 'Sous-titre d’accompagnement',
        labelAr: 'الوصف الفرعي لخدمة العملاء',
        type: 'text'
      },
      {
        key: 'contact.channelsTitle',
        labelFr: 'Titre des canaux directs',
        labelAr: 'عنوان قنوات التواصل المباشر',
        type: 'text'
      },
      {
        key: 'contact.whatsappDirect',
        labelFr: 'Libellé WhatsApp direct',
        labelAr: 'نص المحادثة المباشرة عبر واتساب',
        type: 'text'
      },
      {
        key: 'contact.emailLabel',
        labelFr: 'Libellé Email Support',
        labelAr: 'تسمية البريد الإلكتروني للدعم',
        type: 'text'
      },
      {
        key: 'contact.officeLabel',
        labelFr: 'Libellé Siège Social',
        labelAr: 'تسمية المقر الرئيسي',
        type: 'text'
      },
      {
        key: 'contact.office',
        labelFr: 'Adresse du bureau au Maroc',
        labelAr: 'عنوان المقر الرئيسي بالمغرب',
        type: 'text'
      },
      {
        key: 'contact.officeHoursTitle',
        labelFr: 'Titre Horaires de travail',
        labelAr: 'عنوان ساعات العمل',
        type: 'text'
      },
      {
        key: 'contact.officeHoursDesc',
        labelFr: 'Description Horaires de travail',
        labelAr: 'تفاصيل ساعات العمل والمواكبة',
        type: 'text'
      },
      {
        key: 'contact.submit',
        labelFr: 'Bouton d’envoi du formulaire',
        labelAr: 'زر إرسال الرسالة',
        type: 'text'
      },
      {
        key: 'contact.success',
        labelFr: 'Message de succès après envoi',
        labelAr: 'رسالة التأكيد بنجاح الإرسال',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'nav',
    titleFr: 'Navigation & Barre Supérieure',
    titleAr: 'شريط التنقل والقائمة العلوية',
    descriptionFr: 'Liens de navigation, boutons des portails Vendeur et Promoteur, boutons de connexion et inscription.',
    badge: 'Header',
    iconName: 'Compass',
    fields: [
      {
        key: 'nav.home',
        labelFr: 'Lien : Accueil',
        labelAr: 'رابط: الرئيسية',
        type: 'text'
      },
      {
        key: 'nav.whoWeAre',
        labelFr: 'Lien : Qui sommes-nous',
        labelAr: 'رابط: من نحن',
        type: 'text'
      },
      {
        key: 'nav.howItWorks',
        labelFr: 'Lien : Comment ça marche',
        labelAr: 'رابط: كيف يعمل',
        type: 'text'
      },
      {
        key: 'nav.marketplace',
        labelFr: 'Lien : Marketplace des Offres',
        labelAr: 'رابط: سوق العروض',
        type: 'text'
      },
      {
        key: 'nav.contact',
        labelFr: 'Lien : Contact',
        labelAr: 'رابط: اتصل بنا',
        type: 'text'
      },
      {
        key: 'nav.sellerPortal',
        labelFr: 'Bouton : Espace Vendeur',
        labelAr: 'زر: بوابة البائع',
        type: 'text'
      },
      {
        key: 'nav.promoterPortal',
        labelFr: 'Bouton : Espace Promoteur',
        labelAr: 'زر: بوابة المسوق',
        type: 'text'
      },
      {
        key: 'nav.signIn',
        labelFr: 'Bouton : Connexion',
        labelAr: 'زر: تسجيل الدخول',
        type: 'text'
      },
      {
        key: 'nav.signUp',
        labelFr: 'Bouton : Inscription',
        labelAr: 'زر: إنشاء حساب',
        type: 'text'
      }
    ]
  },
  {
    id: 'footer',
    titleFr: 'Pied de page & Mentions Légales',
    titleAr: 'تذييل الصفحة والمعطيات القانونية',
    descriptionFr: 'Mentions de copyright, liens vers les conditions générales et avis de conformité CNDP Maroc.',
    badge: 'Footer',
    iconName: 'Shield',
    fields: [
      {
        key: 'footer.desc',
        labelFr: 'Description de la marque',
        labelAr: 'الوصف التعريفي بالمنصة',
        type: 'textarea'
      },
      {
        key: 'footer.location',
        labelFr: 'Adresses bureaux / villes',
        labelAr: 'عناوين المكاتب والمدن',
        type: 'text'
      },
      {
        key: 'footer.colPlatform',
        labelFr: 'Titre colonne : Plateforme',
        labelAr: 'عنوان عمود: المنصة',
        type: 'text'
      },
      {
        key: 'footer.colIntegrations',
        labelFr: 'Titre colonne : Intégrations',
        labelAr: 'عنوان عمود: التكامل والربط',
        type: 'text'
      },
      {
        key: 'footer.colSupport',
        labelFr: 'Titre colonne : Support',
        labelAr: 'عنوان عمود: الدعم الفني',
        type: 'text'
      },
      {
        key: 'footer.rights',
        labelFr: 'Texte des droits réservés',
        labelAr: 'نص جميع الحقوق محفوظة',
        type: 'text'
      },
      {
        key: 'footer.terms',
        labelFr: 'Lien : Conditions d’utilisation',
        labelAr: 'رابط: شروط الاستخدام',
        type: 'text'
      },
      {
        key: 'footer.privacy',
        labelFr: 'Lien : Politique de confidentialité',
        labelAr: 'رابط: سياسة الخصوصية',
        type: 'text'
      },
      {
        key: 'footer.security',
        labelFr: 'Notice de sécurité & CNDP Maroc',
        labelAr: 'إشعار الأمان وحماية المعطيات CNDP',
        type: 'text'
      }
    ]
  },
  {
    id: 'dashboards',
    titleFr: 'Titres des Espaces Vendeur & Promoteur',
    titleAr: 'عناوين بوابات البائعين والمسوقين',
    descriptionFr: 'Titres principaux affichés en haut des tableaux de bord Vendeur (Merchant) et Promoteur (Affiliate).',
    badge: 'Portails SaaS',
    iconName: 'LayoutDashboard',
    fields: [
      {
        key: 'merchant.title',
        labelFr: 'Titre principal du Portail Vendeur',
        labelAr: 'العنوان الرئيسي لبوابة البائع',
        type: 'text'
      },
      {
        key: 'merchant.grossSales',
        labelFr: 'Libellé : Chiffre d’affaires Affiliation',
        labelAr: 'تسمية: مبيعات الإحالة الإجمالية',
        type: 'text'
      },
      {
        key: 'merchant.deliveredSales',
        labelFr: 'Libellé : Leads Trackés (Thank You Page)',
        labelAr: 'تسمية: الليدات المحققة',
        type: 'text'
      },
      {
        key: 'affiliate.title',
        labelFr: 'Titre principal du Portail Promoteur',
        labelAr: 'العنوان الرئيسي لبوابة المسوق',
        type: 'text'
      },
      {
        key: 'affiliate.availableBalance',
        labelFr: 'Libellé : Solde Retirable Disponible',
        labelAr: 'تسمية: الرصيد المتاح للسحب',
        type: 'text'
      },
      {
        key: 'affiliate.pendingBalance',
        labelFr: 'Libellé : Solde en Période Anti-Fraude (48h)',
        labelAr: 'تسمية: رصيد قيد فترة التحقق (48 ساعة)',
        type: 'text'
      }
    ]
  }
];
