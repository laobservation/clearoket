import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  Code2, 
  Layers, 
  ShieldCheck, 
  FileCode, 
  Server
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PRISMA_SCHEMA_CODE = `// Prisma Schema for Roketlead (roketlead.com / rkt.ma)
// Moroccan E-Commerce Creator & Affiliate Attribution SaaS Engine
// Datasource: PostgreSQL

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  SUPER_ADMIN
  SELLER
  PROMOTER
}

enum CommissionType {
  PERCENTAGE
  FIXED_MAD
  RECURRING
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

enum TrackingStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}

enum PayoutStatus {
  REQUESTED
  PENDING
  PROCESSING
  PAID
  REJECTED
}

enum PlatformType {
  YOUCAN
  SHOPIFY
  WOOCOMMERCE
  CUSTOM_REACT_HTML
  CUSTOM_API
}

// ----------------------------------------------------
// 1. User Authentication & Multi-Tenant Profiles
// ----------------------------------------------------
model User {
  id               String            @id @default(uuid())
  email            String            @unique
  passwordHash     String
  name             String
  role             UserRole          @default(PROMOTER)
  phone            String?
  avatarUrl        String?
  sellerProfile    SellerProfile?
  promoterProfile  PromoterProfile?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  @@index([email])
}

// ----------------------------------------------------
// 2. Seller / Store Profile & Pixel Configuration
// ----------------------------------------------------
model SellerProfile {
  id                  String             @id @default(uuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  storeName           String
  storeUrl            String
  slug                String             @unique
  logoUrl             String?
  category            String             @default("E-commerce")
  city                String             @default("Casablanca")
  platformType        PlatformType       @default(YOUCAN)
  pixelApiKey         String             @unique // Unique Pixel API Key for Thank-You page
  commissionType      CommissionType     @default(PERCENTAGE)
  commissionRate      Decimal            @default(10.00) @db.Decimal(10, 2) // % or Fixed MAD (e.g. 30 DH)
  cookieDurationDays  Int                @default(30)
  isApproved          Boolean            @default(true)
  promoterRequests    PromoterRequest[]
  trackingLinks       TrackingLink[]
  conversions         Conversion[]
  withdrawalRequests  WithdrawalRequest[]
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  @@index([slug])
  @@index([pixelApiKey])
}

// ----------------------------------------------------
// 3. Creator / Promoter Profile & Moroccan Bank (RIB)
// ----------------------------------------------------
model PromoterProfile {
  id                  String             @id @default(uuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName            String
  instagramHandle     String?
  tiktokHandle        String?
  youtubeChannel      String?
  whatsappNumber      String?
  bankName            String             @default("CIH Bank")
  bankRib             String             // 24-digit Moroccan Bank Account (RIB)
  accountHolderName   String
  availableBalanceMAD Decimal            @default(0.00) @db.Decimal(12, 2) // Unlocks payout when >= 200 DH
  pendingBalanceMAD   Decimal            @default(0.00) @db.Decimal(12, 2)
  totalEarnedMAD      Decimal            @default(0.00) @db.Decimal(12, 2)
  lifetimePaidMAD     Decimal            @default(0.00) @db.Decimal(12, 2)
  promoterRequests    PromoterRequest[]
  trackingLinks       TrackingLink[]
  conversions         Conversion[]
  withdrawalRequests  WithdrawalRequest[]
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  @@index([bankRib])
}

// ----------------------------------------------------
// 4. Promoter Application & Seller Approval Flow
// ----------------------------------------------------
model PromoterRequest {
  id           String          @id @default(uuid())
  sellerId     String
  seller       SellerProfile   @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  promoterId   String
  promoter     PromoterProfile @relation(fields: [promoterId], references: [id], onDelete: Cascade)
  status       RequestStatus   @default(PENDING) // PENDING -> APPROVED | REJECTED
  pitchMessage String?
  decidedAt    DateTime?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@unique([sellerId, promoterId])
  @@index([sellerId])
  @@index([promoterId])
}

// ----------------------------------------------------
// 5. Shortlinks & Tracking Engine (rkt.ma/c/...)
// ----------------------------------------------------
model TrackingLink {
  id           String          @id @default(uuid())
  shortCode    String          @unique // e.g. "rkt.ma/c/amine" or "rkt.ma/saffron"
  targetUrl    String          // Destination store landing page
  sellerId     String
  seller       SellerProfile   @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  promoterId   String
  promoter     PromoterProfile @relation(fields: [promoterId], references: [id], onDelete: Cascade)
  channel      String          @default("Instagram")
  clicksCount  Int             @default(0)
  salesCount   Int             @default(0)
  totalSalesMAD Decimal        @default(0.00) @db.Decimal(12, 2)
  clicks       Click[]
  conversions  Conversion[]
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@index([shortCode])
  @@index([sellerId])
  @@index([promoterId])
}

model Click {
  id             String        @id @default(uuid())
  trackingLinkId String
  trackingLink   TrackingLink  @relation(fields: [trackingLinkId], references: [id], onDelete: Cascade)
  ipAddress      String?
  referrer       String?
  city           String?       // Casablanca, Rabat, Marrakech, etc.
  userAgent      String?
  isFraud        Boolean       @default(false)
  createdAt      DateTime      @default(now())

  @@index([trackingLinkId])
}

// ----------------------------------------------------
// 6. Thank-You Page Instant Pixel Conversions
// ----------------------------------------------------
model Conversion {
  id               String          @id @default(uuid())
  orderId          String          // Unique Merchant Order ID (e.g. "1001")
  sellerId         String
  seller           SellerProfile   @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  promoterId       String
  promoter         PromoterProfile @relation(fields: [promoterId], references: [id], onDelete: Cascade)
  trackingLinkId   String?
  trackingLink     TrackingLink?   @relation(fields: [trackingLinkId], references: [id], onDelete: SetNull)
  orderAmountMAD   Decimal         @db.Decimal(12, 2)
  commissionAmountMAD Decimal      @db.Decimal(12, 2)
  currency         String          @default("MAD")
  status           TrackingStatus  @default(CONFIRMED) // Instant Thank-You Page Confirmation
  customerCity     String?
  customerPhone    String?
  courierName      String?         // Amana Express, Cathedis, Sendit
  trackingNumber   String?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@unique([sellerId, orderId])
  @@index([sellerId])
  @@index([promoterId])
  @@index([status])
}

// ----------------------------------------------------
// 7. 200 DH+ Automated Withdrawal Requests (RIB Payouts)
// ----------------------------------------------------
model WithdrawalRequest {
  id                   String          @id @default(uuid())
  promoterId           String
  promoter             PromoterProfile @relation(fields: [promoterId], references: [id], onDelete: Cascade)
  sellerId             String?
  seller               SellerProfile?  @relation(fields: [sellerId], references: [id], onDelete: SetNull)
  amountMAD            Decimal         @db.Decimal(12, 2) // Must be >= 200.00 MAD
  bankName             String
  bankRib              String          // 24-digit Moroccan RIB
  status               PayoutStatus    @default(REQUESTED) // REQUESTED -> PAID
  transactionReference String?         // e.g. "VIR-CIH-20260830-9921"
  paidAt               DateTime?
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  @@index([promoterId])
  @@index([sellerId])
  @@index([status])
}
`;

const WEBHOOK_PAYLOAD_SAMPLE = `{
  "event": "order.delivery_status_updated",
  "merchantId": "merch-02",
  "orderId": "ORD-MA-884920",
  "orderNumber": "#CR-9921",
  "oldStatus": "SHIPPED",
  "newStatus": "DELIVERED",
  "normalizedStatus": "DELIVERED",
  "totalAmountMAD": 1850.00,
  "attributionToken": "rkt_aff_royal_caftan_casablanca_2026",
  "promoCode": "SARAHGLAM",
  "courier": "Amana Express (Poste Maroc)",
  "trackingNumber": "MA-AMN-99482103",
  "timestamp": "2026-08-30T16:45:00Z"
}`;

export const PrismaSchemaViewer: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'architecture' | 'webhooks'>('schema');
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const handleCopy = () => {
    navigator.clipboard.writeText(PRISMA_SCHEMA_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([PRISMA_SCHEMA_CODE], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.prisma';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={isEmbedded ? "space-y-6" : "min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8"}>
      <div className={isEmbedded ? "w-full" : "max-w-6xl mx-auto"}>
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                PostgreSQL • Prisma ORM
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-950">
              {isAr ? 'مخطط قاعدة بيانات وبنية RoketLead العلائقية' : 'Schéma de Base de Données & Architecture Relationnelle RoketLead'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr 
                ? 'نموذج قاعدة بيانات متكامل يدعم المتاجر، المسوقين، الروابط، أكواد الخصم، تسوية طلبات الدفع عند الاستلام (COD)، والتحويلات البنكية بالـ RIB.'
                : 'Modèle relationnel complet supportant les Vendeurs, Promoteurs, Liens, Codes Promo, Réconciliation COD et Virements bancaires RIB.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ بنجاح!' : 'Copié dans le presse-papier !') : (isAr ? 'نسخ المخطط' : 'Copier le Schéma')}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل schema.prisma' : 'Télécharger schema.prisma'}</span>
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs max-w-fit">
          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'schema' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'ملف Prisma Schema' : 'Code Prisma Schema'}
          </button>
          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'architecture' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'البنية والعلاقات (Entities)' : 'Architecture & Relations'}
          </button>
          <button
            onClick={() => setActiveSubTab('webhooks')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'webhooks' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'مواصفات Webhook التوصيل COD' : 'Spécification Webhook COD'}
          </button>
        </div>

        {/* TAB 1: CODE VIEWER */}
        {activeSubTab === 'schema' && (
          <div className="bg-[#0f172a] rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl text-slate-200" dir="ltr">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono text-slate-300">/prisma/schema.prisma</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">PostgreSQL • Decimal(12,2) MAD</span>
            </div>

            <pre className="font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-slate-300 select-all max-h-[550px] overflow-y-auto">
              <code>{PRISMA_SCHEMA_CODE}</code>
            </pre>
          </div>
        )}

        {/* TAB 2: RELATIONAL ARCHITECTURE */}
        {activeSubTab === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isAr ? 'العلاقات الأساسية والأدوار' : 'Entités Principales & Rôles'}
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-0.5">User ↔ MerchantProfile / AffiliateProfile:</strong>
                  {isAr 
                    ? 'علاقة 1 إلى 1 تدعم تجارب تسجيل مخصصة للتجار وأصحاب المتاجر من جهة، ولصناع المحتوى والمسوقين من جهة أخرى.'
                    : 'Relation polymorphique 1-à-1 permettant des flux d\'inscription distincts pour les e-commerçants et les créateurs de contenu.'}
                </li>
                <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-0.5">MerchantProfile ↔ Campaigns ↔ Links / Codes:</strong>
                  {isAr
                    ? 'يحدد البائع نسب العمولة (% أو دراهم ثابتة). يولد المسوق روابط تتبع ذكية أو أكواد خصم خاصة.'
                    : 'Le vendeur définit ses commissions (% ou montant fixe en Dirhams). Les promoteurs génèrent leurs liens trackés ou codes promo.'}
                </li>
                <li className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-0.5">Click ↔ Conversion ↔ TrackingStatus:</strong>
                  {isAr
                    ? 'تتبع النقرات مع التحقق من المدينة المغربية والحماية من التكرار والاحتيال، وربطها بالطلب.'
                    : 'Enregistre les clics, IP, ville marocaine et drapeaux anti-fraude avec liaison directe aux commandes.'}
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isAr ? 'دورة التسوية المالية لطلبات الدفع عند الاستلام (COD)' : 'Cycle Financier COD au Maroc'}
                </h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-900 w-5">1.</span>
                  <div>
                    <strong className="text-slate-900">{isAr ? 'تسجيل الطلب:' : 'Commande Passée :'}</strong>{' '}
                    {isAr ? 'تسجيل الحالة كـ PENDING وتسجيل العمولة في الرصيد المعلق.' : 'Statut initial PENDING, commission enregistrée dans le solde en attente.'}
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-900 w-5">2.</span>
                  <div>
                    <strong className="text-slate-900">{isAr ? 'تأكيد التسليم (أمانة/كاثيديس):' : 'Confirmation Livraison (Amana/Cathedis) :'}</strong>{' '}
                    {isAr ? 'يتم تحديث الحالة عبر Webhook إلى DELIVERED فور استلام الزبون للطلب.' : 'Mise à jour automatique par webhook en DELIVERED lors de l\'encaissement du colis.'}
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-900 w-5">3.</span>
                  <div>
                    <strong className="text-slate-900">{isAr ? 'إيداع العمولة في المحفظة:' : 'Crédit du Portefeuille :'}</strong>{' '}
                    {isAr ? 'تتحول العمولة تلقائياً إلى الرصيد القابل للسحب بالدرهم.' : 'Transfert automatique de la commission vers le solde disponible en MAD.'}
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-900 w-5">4.</span>
                  <div>
                    <strong className="text-slate-900">{isAr ? 'التحويل البنكي الوطني:' : 'Virement Bancaire Marocain :'}</strong>{' '}
                    {isAr ? 'طلب سحب مباشر إلى حساب الـ RIB (CIH، التجاري، البنك الشعبي، إلخ).' : 'Demande de retrait vers le compte bancaire RIB (CIH, Attijariwafa, Chaabi, etc.).'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEBHOOKS */}
        {activeSubTab === 'webhooks' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                {isAr ? 'مواصفات ربط Webhooks لشركات التوصيل ومنصات المتاجر' : 'Spécification Ingestion Webhook E-Commerce & Transporteurs COD'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'كيف يستقبل نظام RoketLead تحديثات حالة الطرود وتسوية العمولات في الوقت الفعلي.' : 'Comment RoketLead reçoit et réconcilie les statuts de livraison en temps réel.'}
              </p>
            </div>

            <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl font-mono text-xs overflow-x-auto" dir="ltr">
              <div className="text-slate-500 text-[11px] mb-2">// POST https://api.roketlead.ma/api/v1/webhooks/order-status</div>
              <code>{WEBHOOK_PAYLOAD_SAMPLE}</code>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-900 block mb-1">{isAr ? 'منصات YouCan و Shopify' : 'YouCan & Shopify'}</strong>
                <p className="text-slate-600">
                  {isAr ? 'إرسال بيانات الطلب عند إتمام الشراء مع كود الخصم أو رمز تتبع الكوكي.' : 'Envoi des données lors de la commande avec code promo ou token d\'attribution.'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-900 block mb-1">{isAr ? 'تزامن أمانة / كاثيديس' : 'Synchronisation Amana & Cathedis'}</strong>
                <p className="text-slate-600">
                  {isAr ? 'تحديثات دورية لحالة الشحنات وتسليم الطرود عبر المدن المغربية.' : 'Mises à jour automatiques du statut de livraison de Casablanca à Agadir.'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-900 block mb-1">{isAr ? 'توقيع HMAC الآمن' : 'Signature HMAC SHA-256'}</strong>
                <p className="text-slate-600">
                  {isAr ? 'كل إشعار مشفر بتوقيع رقمي موثق مع المفتاح السري للمتجر.' : 'Chaque webhook est validé cryptographiquement via le Secret Key du vendeur.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
