import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  query,
  limit
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { MerchantProfile, AffiliateProfile, User, EarlyAccessLead } from '../types';
import { INITIAL_MERCHANTS, INITIAL_AFFILIATE_PROFILE, INITIAL_EARLY_ACCESS_LEADS } from '../data/mockData';

// Collection names
const MERCHANTS_COLLECTION = 'merchants';
const AFFILIATES_COLLECTION = 'affiliates';
const USERS_COLLECTION = 'users';
const WAITLIST_COLLECTION = 'waitlist';

/**
 * Seed initial merchants into Firestore if collection is empty
 */
export async function seedInitialMerchantsIfEmpty(): Promise<void> {
  try {
    const merchantsRef = collection(db, MERCHANTS_COLLECTION);
    const snap = await getDocs(query(merchantsRef, limit(1)));
    if (snap.empty) {
      console.log('Seeding initial merchants into Firestore...');
      for (const merchant of INITIAL_MERCHANTS) {
        await setDoc(doc(db, MERCHANTS_COLLECTION, merchant.id), {
          ...merchant,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }
  } catch (error) {
    console.warn('Could not seed merchants (may already exist or offline):', error);
  }
}

/**
 * Seed initial affiliate profile into Firestore if empty
 */
export async function seedInitialAffiliateIfEmpty(): Promise<void> {
  try {
    const affiliateDocRef = doc(db, AFFILIATES_COLLECTION, INITIAL_AFFILIATE_PROFILE.id);
    const snap = await getDoc(affiliateDocRef);
    if (!snap.exists()) {
      console.log('Seeding initial affiliate profile into Firestore...');
      await setDoc(affiliateDocRef, {
        ...INITIAL_AFFILIATE_PROFILE,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.warn('Could not seed affiliate (may already exist or offline):', error);
  }
}

/**
 * Subscribe to all merchants in Firestore with real-time updates
 */
export function subscribeMerchants(callback: (merchants: MerchantProfile[]) => void): () => void {
  const merchantsRef = collection(db, MERCHANTS_COLLECTION);
  
  // Trigger initial seed if needed
  seedInitialMerchantsIfEmpty();

  const unsubscribe = onSnapshot(merchantsRef, (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_MERCHANTS);
    } else {
      const map = new Map<string, MerchantProfile>();
      // Baseline mock merchants as starting list
      INITIAL_MERCHANTS.forEach(m => map.set(m.id, m));
      // Overlay all live Firestore documents (including all new registrations & status updates)
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as MerchantProfile;
        if (data && data.id) {
          map.set(data.id, { ...(map.get(data.id) || {}), ...data });
        }
      });
      callback(Array.from(map.values()));
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, MERCHANTS_COLLECTION);
    // Fallback to baseline
    callback(INITIAL_MERCHANTS);
  });

  return unsubscribe;
}

/**
 * Save / Update a Merchant Profile in Firestore
 */
export async function saveMerchantProfile(
  merchantId: string, 
  updates: Partial<MerchantProfile>
): Promise<void> {
  const docRef = doc(db, MERCHANTS_COLLECTION, merchantId);
  try {
    await setDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MERCHANTS_COLLECTION}/${merchantId}`);
  }
}

/**
 * Register a new brand / merchant on the platform.
 * Ensures the record is persisted in Firestore with PENDING_APPROVAL status
 * so it immediately appears in the Super Admin Brand Approvals queue.
 */
export async function registerNewMerchant(params: {
  companyName: string;
  storeName?: string;
  website: string;
  category?: 'E-commerce' | 'SaaS' | 'Health & Beauty' | 'Fashion & Artisanal' | 'Electronics' | 'Services';
  city?: string;
  platformType?: 'YouCan' | 'Shopify' | 'WooCommerce' | 'Custom API' | 'Custom React/HTML';
  supportPhone?: string;
  email?: string;
  commissionOffer?: string;
  commissionRate?: number;
  userId?: string;
  description?: string;
  logo?: string;
}): Promise<MerchantProfile> {
  const merchantId = `merch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const cleanStoreName = (params.storeName || params.companyName || 'Nouvelle Marque').trim();
  let cleanWebsite = (params.website || '').trim();
  if (cleanWebsite && !cleanWebsite.startsWith('http://') && !cleanWebsite.startsWith('https://')) {
    cleanWebsite = `https://${cleanWebsite}`;
  }
  if (!cleanWebsite) {
    cleanWebsite = 'https://ma-boutique.ma';
  }

  const slug = cleanStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  const newMerchant: MerchantProfile = {
    id: merchantId,
    userId: params.userId || `usr-${merchantId}`,
    companyName: params.companyName?.trim() || cleanStoreName,
    storeName: cleanStoreName,
    storeUrl: cleanWebsite,
    website: cleanWebsite,
    slug: slug || 'boutique',
    logo: params.logo || '🛍️',
    category: params.category || 'E-commerce',
    city: params.city || 'Casablanca',
    platformType: params.platformType || 'YouCan',
    pixelApiKey: `rkt_live_pk_${merchantId}`,
    integrationSecretKey: `sec_live_${merchantId}`,
    webhookUrl: 'https://roketlead.com/api/v1/pixel/purchase',
    status: 'PENDING_APPROVAL', // Strict requirement: Must appear in Brand Approvals for verification
    totalSalesMAD: 0,
    activeAffiliatesCount: 0,
    commissionOffer: params.commissionOffer || `${params.commissionRate || 15}% par vente confirmée (COD)`,
    commissionType: 'PERCENTAGE',
    commissionRate: params.commissionRate || 15,
    commissionValue: params.commissionRate || 15,
    cookieDurationDays: 30,
    description: params.description || `Boutique marocaine inscrite sur RoketLead - En attente d'approbation`,
    tags: ['Nouveau', params.category || 'E-commerce', 'En attente'],
    email: params.email,
    supportPhone: params.supportPhone || '+212 6 00 00 00 00',
    defaultPayoutMAD: 35,
    holdPeriodHours: 48,
    featured: false
  };

  const docRef = doc(db, MERCHANTS_COLLECTION, merchantId);
  try {
    await setDoc(docRef, {
      ...newMerchant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${MERCHANTS_COLLECTION}/${merchantId}`);
  }

  return newMerchant;
}

/**
 * Approve a pending brand in Firestore
 */
export async function approveMerchant(merchantId: string): Promise<void> {
  await saveMerchantProfile(merchantId, {
    status: 'ACTIVE'
  });
}

/**
 * Fetch all merchants from Firestore merged with baseline mock data
 */
export async function getMerchantsList(): Promise<MerchantProfile[]> {
  try {
    const merchantsRef = collection(db, MERCHANTS_COLLECTION);
    const snap = await getDocs(merchantsRef);
    const map = new Map<string, MerchantProfile>();
    INITIAL_MERCHANTS.forEach(m => map.set(m.id, m));
    snap.forEach(docSnap => {
      const data = docSnap.data() as MerchantProfile;
      if (data && data.id) {
        map.set(data.id, { ...(map.get(data.id) || {}), ...data });
      }
    });
    return Array.from(map.values());
  } catch (err) {
    return INITIAL_MERCHANTS;
  }
}

/**
 * Find merchant by ID or contact Email in Firestore
 */
export async function findMerchantByEmailOrId(search: string): Promise<MerchantProfile | null> {
  const clean = search.trim().toLowerCase();
  const all = await getMerchantsList();
  const found = all.find(m => 
    m.id.toLowerCase() === clean || 
    (m.email && m.email.toLowerCase() === clean) ||
    m.website.toLowerCase().includes(clean.replace('https://', '').replace('http://', ''))
  );
  return found || null;
}

/**
 * Subscribe to an Affiliate Profile in Firestore
 */
export function subscribeAffiliateProfile(
  affiliateId: string,
  callback: (profile: AffiliateProfile) => void
): () => void {
  const docRef = doc(db, AFFILIATES_COLLECTION, affiliateId);

  // Trigger initial seed if needed
  seedInitialAffiliateIfEmpty();

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AffiliateProfile);
    } else {
      callback(INITIAL_AFFILIATE_PROFILE);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${AFFILIATES_COLLECTION}/${affiliateId}`);
  });

  return unsubscribe;
}

/**
 * Save / Update an Affiliate Profile in Firestore
 */
export async function saveAffiliateProfile(
  affiliateId: string,
  updates: Partial<AffiliateProfile>
): Promise<void> {
  const docRef = doc(db, AFFILIATES_COLLECTION, affiliateId);
  try {
    await setDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${AFFILIATES_COLLECTION}/${affiliateId}`);
  }
}

/**
 * Save or update base user account in Firestore
 */
export async function saveUserAccount(user: User): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, user.id);
  try {
    await setDoc(docRef, {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${user.id}`);
  }
}

/**
 * Authenticate with Google
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out of Firebase Auth
 */
export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Listen to auth state
 */
export function onAuthStateListener(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Subscribe to all Early Access / Waitlist Leads from Firestore with real-time updates
 */
export function subscribeEarlyAccessLeads(callback: (leads: EarlyAccessLead[]) => void): () => void {
  const waitlistRef = collection(db, WAITLIST_COLLECTION);

  const unsubscribe = onSnapshot(waitlistRef, (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_EARLY_ACCESS_LEADS);
    } else {
      const list: EarlyAccessLead[] = [];
      const seenIds = new Set<string>();

      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const role = d.role || (d.storeUrl ? 'Merchant' : 'Creator');
        const isSeller = role === 'Merchant' || role === 'Seller' || !!d.storeUrl || !!d.platform;
        const isCreator = role === 'Creator' || role === 'Promoter' || !!d.socialHandle || !!d.niche;

        let createdDateFormatted = 'Récemment';
        if (d.createdAt && typeof d.createdAt.toDate === 'function') {
          try {
            createdDateFormatted = d.createdAt.toDate().toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            createdDateFormatted = 'Récemment';
          }
        } else if (d.createdDateFormatted) {
          createdDateFormatted = d.createdDateFormatted;
        }

        const lead: EarlyAccessLead = {
          id: docSnap.id,
          fullName: d.fullName || d.name || 'Anonyme',
          email: d.email || '—',
          phone: d.phone || d.whatsapp || '—',
          role: role,
          userType: isSeller ? 'SELLER' : (isCreator ? 'CREATOR' : 'OTHER'),
          storeUrl: d.storeUrl || '',
          storeName: d.storeName || (d.storeUrl ? d.storeUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : ''),
          platform: d.platform || '',
          monthlyOrders: d.monthlyOrders || '',
          socialHandle: d.socialHandle || '',
          niche: d.niche || '',
          audienceSize: d.audienceSize || '',
          city: d.city || 'Maroc',
          notes: d.notes || d.description || '',
          status: (d.status as any) || 'PENDING',
          queueNumber: d.queueNumber,
          createdAt: d.createdAt,
          createdDateFormatted
        };

        seenIds.add(lead.id);
        list.push(lead);
      });

      // Also overlay baseline initial leads if not already in Firestore so the admin always has full reference
      INITIAL_EARLY_ACCESS_LEADS.forEach((mockLead) => {
        if (!seenIds.has(mockLead.id)) {
          list.push(mockLead);
        }
      });

      callback(list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, WAITLIST_COLLECTION);
    callback(INITIAL_EARLY_ACCESS_LEADS);
  });

  return unsubscribe;
}

/**
 * Update Early Access Lead status (PENDING, CONTACTED, APPROVED, REJECTED)
 */
export async function updateEarlyAccessLeadStatus(
  leadId: string, 
  status: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED',
  notes?: string
): Promise<void> {
  const docRef = doc(db, WAITLIST_COLLECTION, leadId);
  try {
    const updates: Record<string, any> = { 
      status, 
      updatedAt: new Date().toISOString() 
    };
    if (notes !== undefined) {
      updates.notes = notes;
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    // If it was one of the baseline mock leads that hasn't been written to Firestore yet, setDoc
    try {
      const mock = INITIAL_EARLY_ACCESS_LEADS.find(l => l.id === leadId);
      if (mock) {
        await setDoc(docRef, {
          ...mock,
          status,
          ...(notes ? { notes } : {}),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        handleFirestoreError(error, OperationType.UPDATE, `${WAITLIST_COLLECTION}/${leadId}`);
      }
    } catch (fallbackErr) {
      handleFirestoreError(fallbackErr, OperationType.UPDATE, `${WAITLIST_COLLECTION}/${leadId}`);
    }
  }
}

