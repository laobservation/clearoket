export type UserRole = 'SUPER_ADMIN' | 'SELLER' | 'PROMOTER' | 'MERCHANT' | 'AFFILIATE';

export type TrackingStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export type PayoutStatus = 'PENDING' | 'PROCESSED' | 'REJECTED' | 'PAID' | 'REQUESTED';

export type CommissionType = 'PERCENTAGE' | 'FIXED_MAD' | 'RECURRING';

export type PromoterRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const MIN_WITHDRAWAL_THRESHOLD_MAD = 200; // 200 DH minimum balance for creators/promoters

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeUrl: string;
  companyName: string;
  slug: string;
  logo: string;
  category: 'E-commerce' | 'SaaS' | 'Health & Beauty' | 'Fashion & Artisanal' | 'Electronics' | 'Services';
  website: string;
  city: string;
  platformType: 'YouCan' | 'Shopify' | 'WooCommerce' | 'Custom API' | 'Custom React/HTML';
  pixelApiKey: string;
  integrationSecretKey: string;
  webhookUrl: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED';
  totalSalesMAD: number;
  activeAffiliatesCount: number;
  commissionOffer: string;
  commissionType: CommissionType;
  commissionRate: number; // percentage (e.g. 10) or fixed amount in MAD (e.g. 30)
  commissionValue: number; // backward compatibility
  cookieDurationDays: number;
  description: string;
  tags: string[];
  email?: string;
  featured?: boolean;
  supportPhone?: string;
  logoUrl?: string;
  defaultPayoutMAD?: number;
  holdPeriodHours?: number;
}

// Alias for backward compatibility
export type MerchantProfile = SellerProfile;

export interface PromoterProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  email?: string;
  niche?: string;
  socialHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  youtubeChannel?: string;
  whatsappNumber?: string;
  bankName: string;
  bankRib: string; // 24-digit Moroccan RIB
  accountHolderName: string;
  walletBalanceMAD: number;
  availableBalanceMAD: number;
  pendingCommissionMAD: number;
  pendingBalanceMAD?: number;
  lifetimePaidMAD: number;
  totalEarnedMAD: number;
  tier: 'Starter' | 'Verified Pro' | 'Elite Partner';
}

// Alias for backward compatibility
export type AffiliateProfile = PromoterProfile;

export interface PromoterRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerLogo: string;
  promoterId: string;
  promoterName: string;
  promoterHandle: string;
  promoterAvatar?: string;
  category: string;
  audienceSize: string;
  message?: string;
  status: PromoterRequestStatus;
  requestedAt: string;
  decidedAt?: string;
}

export interface Campaign {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantLogo: string;
  title: string;
  description: string;
  commissionType: CommissionType;
  commissionRate: string; // e.g. "10% per confirmed sale" or "30 DH fixed per order"
  cookieDuration: number; // in days
  category: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  totalClicks: number;
  totalConversions: number;
  totalPaidOutMAD: number;
  terms: string;
}

export interface TrackingLink {
  id: string;
  sellerId?: string;
  sellerName?: string;
  merchantId?: string;
  merchantName?: string;
  promoterId?: string;
  promoterName?: string;
  affiliateId?: string;
  affiliateName?: string;
  campaignId?: string;
  originalUrl: string;
  shortCode: string; // e.g. "rkt.ma/c/amine" or "rkt.ma/atlas-bio"
  trackingUrl: string;
  channel: 'Instagram' | 'TikTok' | 'WhatsApp' | 'YouTube' | 'Facebook' | 'General';
  clicksCount: number;
  conversionsCount: number;
  totalSalesMAD?: number;
  createdAt: string;
}

// Alias for backward compatibility
export type AffiliateLink = TrackingLink;

export interface PromoCode {
  id: string;
  affiliateId: string;
  campaignId: string;
  merchantName: string;
  code: string;
  discountPercentage: number;
  affiliateCommissionRate: number; // % or MAD
  usesCount: number;
  totalVolumeMAD: number;
  status: 'ACTIVE' | 'EXPIRED';
  createdAt: string;
}

export interface ClickRecord {
  id: string;
  affiliateLinkId: string;
  affiliateName: string;
  merchantName: string;
  ipAddress: string;
  city: string; // e.g. "Casablanca", "Rabat", "Marrakech", "Tangier"
  referrer: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  isFraudSuspect: boolean;
  timestamp: string;
}

export interface Conversion {
  id: string;
  orderId?: string;
  orderNumber?: string;
  merchantId?: string;
  sellerId?: string;
  merchantName?: string;
  sellerName?: string;
  affiliateId?: string;
  promoterId?: string;
  affiliateName?: string;
  promoterName?: string;
  channel: string;
  promoCode?: string;
  orderAmountMAD: number;
  commissionAmountMAD?: number;
  commissionMAD?: number; // backward compat
  saasCutMAD?: number; // 5% SaaS platform fee
  status: TrackingStatus;
  customerCity: string;
  courier: 'Amana Express' | 'Cathedis' | 'Aramex' | 'Sendit' | 'Ozone' | 'Self' | 'Pending Dispatch';
  trackingNumber: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  promoterId?: string;
  promoterName?: string;
  affiliateId?: string;
  affiliateName?: string;
  sellerId?: string;
  sellerName?: string;
  amountMAD: number;
  bankName: string;
  bankRib: string; // 24 digits
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
  paidAt?: string;
  transactionReference?: string;
  notes?: string;
}

// Alias for backward compatibility
export type PayoutRequest = WithdrawalRequest;

export interface CreatorDiscoveryItem {
  id: string;
  fullName: string;
  handle: string;
  avatarUrl: string;
  niche: 'Beauty & Skincare' | 'Tech & Electronics' | 'Fashion & Caftan' | 'Home & Artisanal' | 'Fitness & Nutrition' | 'Food & Gourmet';
  primaryPlatform: 'Instagram' | 'TikTok' | 'YouTube' | 'WhatsApp';
  audienceSize: string;
  followersCount: number;
  fraudQualityScore: number; // 0-100 score
  avgConversionRate: number; // e.g. 4.2%
  suggestedPayoutMAD: number; // e.g. 35 MAD per lead
  bio: string;
  topCities: string[];
  recentBrandCollabs: string[];
  isVerified: boolean;
}

export interface ContentAsset {
  id: string;
  merchantId: string;
  title: string;
  category: 'High-Res Photos' | 'Ad Scripts (Darija/FR)' | 'Brand Guidelines' | 'UGC Video Hooks' | 'B-Roll Packs';
  fileFormat: string;
  fileSize: string;
  downloadUrl: string;
  previewUrl?: string;
  description: string;
  downloadsCount: number;
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  type: string;
  title: string;
  details: string;
  timestamp: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  adminEmail?: string;
  ipAddress?: string;
}

export interface UGCSubmission {
  id: string;
  promoterId: string;
  promoterName: string;
  promoterHandle?: string;
  promoterAvatar?: string;
  merchantId: string;
  merchantName: string;
  campaignTitle?: string;
  contentType: 'Reel Draft' | 'TikTok Video' | 'Story Sequence' | 'Unboxing Video' | 'TikTok Reel' | string;
  videoLink?: string;
  contentUrl?: string;
  notes: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'CHANGES_REQUESTED';
  bountyRewardMAD?: number;
  feedback?: string;
  submittedAt: string;
  publishedUrl?: string;
}

export interface EscrowWallet {
  merchantId: string;
  availableEscrowMAD: number;
  lockedInHoldMAD: number;
  totalPaidOutMAD: number;
  nextScheduledPayout: string;
  autoPayoutFrequency: 'Weekly (Mondays)' | 'Bi-Weekly' | 'Monthly';
  payoutMethod: 'RIB Transfer (CIH, Attijariwafa, BMCE)';
}

export interface LeadValidationItem {
  id: string;
  leadReference: string;
  merchantId: string;
  promoterId: string;
  promoterName: string;
  promoterHandle: string;
  trackingLinkCode: string;
  channel: string;
  customerPhoneMasked: string;
  customerCity: string;
  ipAddress: string;
  orderValueMAD: number;
  commissionMAD: number;
  holdPeriodHours: number;
  holdExpiresAt: string;
  status: 'PENDING_HOLD' | 'APPROVED' | 'FLAGGED_FAKE';
  fraudRiskScore: number; // 0 (safe) to 100 (high risk)
  fraudFlags: string[];
  createdAt: string;
}

export type EarlyAccessRole = 'Merchant' | 'Creator' | 'Seller' | 'Promoter' | 'Service Provider' | 'Referrer';

export interface EarlyAccessLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: EarlyAccessRole | string;
  userType: 'SELLER' | 'CREATOR' | 'OTHER';
  // Specific to Sellers / Merchants
  storeUrl?: string;
  storeName?: string;
  platform?: string; // 'YouCan' | 'Shopify' | 'WooCommerce' | string
  monthlyOrders?: string;
  // Specific to Creators / Promoters
  socialHandle?: string;
  niche?: string;
  audienceSize?: string;
  // Common metadata
  city?: string;
  notes?: string;
  status: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED';
  queueNumber?: number;
  createdAt?: any;
  createdDateFormatted?: string;
}

