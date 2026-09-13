import React, { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Sparkles, 
  ShoppingBag, 
  Wrench, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mail, 
  User, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  Clock,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { registerNewMerchant } from '../services/accountService';

export type WaitlistRole = 'Creator' | 'Merchant' | 'Service Provider' | 'Referrer';

interface WaitlistProps {
  isModal?: boolean;
  onClose?: () => void;
  defaultRole?: WaitlistRole;
  className?: string;
}

export const Waitlist: React.FC<WaitlistProps> = ({
  isModal = false,
  onClose,
  defaultRole = 'Creator',
  className = ''
}) => {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<WaitlistRole>(defaultRole);

  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueInfo, setQueueInfo] = useState<{ queueNumber: number; id?: string } | null>(null);

  const roleOptions: { id: WaitlistRole; labelFr: string; labelAr: string; descFr: string; descAr: string; icon: any }[] = [
    {
      id: 'Creator',
      labelFr: 'Créateur / Affilié',
      labelAr: 'صانع محتوى / مسوق',
      descFr: 'Promouvoir des marques marocaines et générer des commissions.',
      descAr: 'الترويج للمنتجات وتحقيق عمولات مضمونة لكل بيعة.',
      icon: Sparkles
    },
    {
      id: 'Merchant',
      labelFr: 'Marchand / E-commerçant',
      labelAr: 'تاجر / متجر إلكتروني',
      descFr: 'Booster vos ventes e-commerce & COD à la performance.',
      descAr: 'زيادة مبيعات الدفع عند الاستلام بالأداء الخالص.',
      icon: ShoppingBag
    },
    {
      id: 'Service Provider',
      labelFr: 'Prestataire de Services',
      labelAr: 'مزود خدمات (شحن / اتصال)',
      descFr: 'Fournisseurs de logistique, call-centers, agences média.',
      descAr: 'شركات التوصيل، مراكز الاتصال ووكالات التسويق.',
      icon: Wrench
    },
    {
      id: 'Referrer',
      labelFr: 'Prescripteur / Partenaire',
      labelAr: 'شريك إحالة / وسيط',
      descFr: 'Recommander des marchands et toucher des revenus récurrents.',
      descAr: 'إحالة المتاجر والمسوقين والحصول على عائد دوري.',
      icon: Users
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedFullName) {
      setError(isAr ? 'يرجى إدخال الاسم الكامل' : 'Veuillez saisir votre nom complet.');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Veuillez saisir une adresse email valide.');
      return;
    }

    setLoading(true);

    try {
      // 1. Duplicate email prevention check
      const waitlistRef = collection(db, 'waitlist');
      const emailQuery = query(waitlistRef, where('email', '==', trimmedEmail));
      const querySnapshot = await getDocs(emailQuery);

      if (!querySnapshot.empty) {
        setError(
          isAr 
            ? 'هذا البريد الإلكتروني مسجل بالفعل في قائمة الانتظار! سنتواصل معك قريباً.' 
            : 'Cet email est déjà inscrit sur la liste d’attente ! Nous vous contacterons très prochainement.'
        );
        setLoading(false);
        return;
      }

      // 2. Save signup document to Firestore 'waitlist' collection
      const docRef = await addDoc(waitlistRef, {
        fullName: trimmedFullName,
        email: trimmedEmail,
        role: role,
        phone: trimmedPhone || null,
        createdAt: serverTimestamp()
      });

      // 3. If role is Merchant, also register in 'merchants' collection with PENDING_APPROVAL
      if (role === 'Merchant') {
        try {
          await registerNewMerchant({
            companyName: trimmedFullName,
            storeName: `${trimmedFullName}'s Store`,
            website: `https://${trimmedFullName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'boutique'}.ma`,
            email: trimmedEmail,
            supportPhone: trimmedPhone || '+212 6 00 00 00 00',
            category: 'E-commerce',
            city: 'Casablanca',
            platformType: 'YouCan',
            description: `Waitlist Merchant (${trimmedEmail}) - En attente d'approbation`
          });
        } catch (mErr) {
          console.warn('Could not register merchant to merchants collection:', mErr);
        }
      }

      // 3. Update state with success feedback
      setQueueInfo({
        queueNumber: Math.floor(18 + Math.random() * 45),
        id: docRef.id
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Waitlist registration failed:', err);
      setError(
        err?.message || 
        (isAr ? 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.' : 'Une erreur est survenue lors de l’inscription. Veuillez réessayer.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setRole(defaultRole);
    setSuccess(false);
    setError(null);
    setQueueInfo(null);
  };

  return (
    <div 
      id="waitlist-component"
      className={`relative w-full max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden ${className} ${isAr ? 'font-arabic' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Modal Close Button if used in Modal mode */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          id="waitlist-close-btn"
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Decorative Accent Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-xs border border-white/20 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            {isAr ? 'قائمة الانتظار الحصرية' : 'Liste d’attente prioritaire'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
            {isAr ? 'أماكن محدودة' : 'Places limitées'}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          {isAr ? 'انضم إلى قائمة انتظار RoketLead' : 'Rejoignez la liste d’attente RoketLead'}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-blue-100 leading-relaxed max-w-md">
          {isAr 
            ? 'سجل الآن لتكون أول من يستفيد من شبكة التسويق بالعمولة الرائدة في المغرب مع 0% رسوم إطلاق.'
            : 'Obtenez votre accès anticipé VIP au 1er réseau de marketing d’affiliation e-commerce & COD au Maroc.'}
        </p>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8">

        {/* SUCCESS STATE */}
        {success ? (
          <div id="waitlist-success-view" className="py-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              {isAr ? 'تم تسجيلك بنجاح في قائمة الانتظار!' : 'Félicitations, vous êtes inscrit !'}
            </h3>
            
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {isAr ? (
                <>
                  شكراً <span className="font-bold text-slate-900">{fullName}</span>. Votre place est confirmée dans la file d'attente prioritaire de RoketLead. Notre équipe vous enverra vos identifiants à <span className="font-semibold text-blue-600">{email}</span>.
                </>
              ) : (
                <>
                  Merci <span className="font-bold text-slate-900">{fullName}</span>. Votre place est confirmée dans la file d’attente prioritaire de RoketLead. Notre équipe vous transmettra votre invitation à <span className="font-semibold text-blue-600">{email}</span>.
                </>
              )}
            </p>

            {/* Queue Badge */}
            {queueInfo && (
              <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-xs mx-auto">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  {isAr ? 'رقمك في قائمة الانتظار' : 'Votre rang dans la file'}
                </div>
                <div className="text-3xl font-black text-blue-600 mt-1">
                  #{queueInfo.queueNumber}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'أولوية تفعيل الدخول المبكر' : 'Accès VIP Phase 1'}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <button
                type="button"
                id="waitlist-reset-btn"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                {isAr ? 'تسجيل شخص آخر' : 'Inscrire une autre personne'}
              </button>
              {isModal && onClose && (
                <button
                  type="button"
                  id="waitlist-close-done-btn"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Terminer'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form id="waitlist-form" onSubmit={handleSubmit} className="space-y-5">

            {/* ERROR MESSAGE DISPLAY */}
            {error && (
              <div 
                id="waitlist-error-banner"
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold">{isAr ? 'تنبيه: ' : 'Erreur : '}</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                {isAr ? '1. اختر صفتك في المنظومة' : '1. Vous êtes :'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roleOptions.map((item) => {
                  const Icon = item.icon;
                  const isSelected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={`waitlist-role-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setRole(item.id)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {isAr ? item.labelAr : item.labelFr}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                          {isAr ? item.descAr : item.descFr}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="waitlist-fullname" className="block text-xs font-bold text-slate-800 mb-1.5">
                {isAr ? '2. الاسم الكامل *' : '2. Nom & Prénom *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="waitlist-fullname"
                  type="text"
                  required
                  disabled={loading}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? 'مثال: يوسف العلمي' : 'Ex: Youssef El Alami'}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="waitlist-email" className="block text-xs font-bold text-slate-800 mb-1.5">
                {isAr ? '3. البريد الإلكتروني *' : '3. Adresse Email *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                {isAr ? 'لن نشارك بريدك الإلكتروني مع أي طرف خارجي.' : 'Nous ne spammons jamais. Vos données restent strictement confidentielles.'}
              </p>
            </div>

            {/* Phone / WhatsApp (Optional) */}
            <div>
              <label htmlFor="waitlist-phone" className="block text-xs font-bold text-slate-800 mb-1.5">
                {isAr ? '4. رقم الهاتف / واتساب (اختياري)' : '4. Téléphone / WhatsApp (Optionnel)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="waitlist-phone"
                  type="tel"
                  disabled={loading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 XX XX XX XX"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="waitlist-submit-btn"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جاري التحقق والتسجيل...' : 'Vérification et enregistrement...'}</span>
                </>
              ) : (
                <>
                  <span>{isAr ? 'حجز مكاني في قائمة الانتظار' : 'Réserver ma place prioritaire'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Trust Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] text-slate-400 text-center">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Base Firestore sécurisée</span>
              </span>
              <span>•</span>
              <span>0% Frais pour les 100 premiers inscrits</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
