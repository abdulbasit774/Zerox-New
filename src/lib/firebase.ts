import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  confirmPasswordReset,
  verifyPasswordResetCode,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot
} from 'firebase/firestore';

// Read config from firebase-applet-config.json context
// Since we are running in the browser, we hardcode the config parsed from the JSON
const firebaseConfig = {
  projectId: "mercurial-study-nn50x",
  appId: "1:33188068122:web:9ab674839e2710e6700aa3",
  apiKey: "AIzaSyCTTawNviPLSQa_-HPrwUejshD45af3UG8",
  authDomain: "mercurial-study-nn50x.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-zeroxpremiumluxu-2b1485dd-39d9-4ac9-9df1-c0f395b1272e",
  storageBucket: "mercurial-study-nn50x.firebasestorage.app",
  messagingSenderId: "33188068122"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Authentication Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Collection Reference helpers
export const usersCol = collection(db, 'users');
export const productsCol = collection(db, 'products');
export const ordersCol = collection(db, 'orders');
export const categoriesCol = collection(db, 'categories');
export const couponsCol = collection(db, 'coupons');
export const reviewsCol = collection(db, 'reviews');
export const wishlistCol = collection(db, 'wishlist');
export const cartCol = collection(db, 'cart');
export const inventoryCol = collection(db, 'inventory');
export const notificationsCol = collection(db, 'notifications');
export const paymentsCol = collection(db, 'payments');
export const transactionsCol = collection(db, 'transactions');
export const paymentMethodsCol = collection(db, 'paymentMethods');
export const shippingMethodsCol = collection(db, 'shippingMethods');
export const taxesCol = collection(db, 'taxes');
export const giftCardsCol = collection(db, 'giftCards');
export const returnsCol = collection(db, 'returns');
export const refundsCol = collection(db, 'refunds');
export const adminLogsCol = collection(db, 'adminLogs');
export const brandsCol = collection(db, 'brands');
export const bannersCol = collection(db, 'banners');
export const supportTicketsCol = collection(db, 'supportTickets');
export const rolesCol = collection(db, 'roles');

// User Profile Management Helpers
export async function createUserProfile(uid: string, data: {
  email: string;
  fullName?: string;
  phone?: string;
  photoURL?: string;
  provider: string;
  role?: string;
}) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document with complete schema
      await setDoc(userRef, {
        uid,
        fullName: data.fullName || 'User',
        email: data.email,
        phone: data.phone || '',
        photoURL: data.photoURL || '',
        role: data.role || 'user',
        provider: data.provider,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: 'active',
        identityVerified: false,
        
        // Legacy compatibility fields
        name: data.fullName || 'Collector',
        membershipTier: 'Challenger',
        creatorRank: 999,
        challengerPoints: 100,
      });
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, updates: any) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Payment Processing Helpers
export async function createPayment(paymentData: {
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  cardLast4?: string;
  cardBrand?: string;
}) {
  try {
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await setDoc(doc(db, 'payments', paymentId), {
      ...paymentData,
      paymentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return paymentId;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

export async function createTransaction(transactionData: {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  type: 'payment' | 'refund' | 'adjustment';
  status: 'pending' | 'completed' | 'failed';
}) {
  try {
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await setDoc(doc(db, 'transactions', transactionId), {
      ...transactionData,
      transactionId,
      createdAt: serverTimestamp(),
    });
    return transactionId;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

export async function applyCoupon(couponCode: string) {
  try {
    const couponRef = doc(db, 'coupons', couponCode.toUpperCase());
    const couponSnap = await getDoc(couponRef);
    
    if (!couponSnap.exists()) {
      throw new Error('Coupon not found');
    }
    
    const coupon = couponSnap.data();
    
    if (!coupon.active) {
      throw new Error('Coupon is inactive');
    }
    
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new Error('Coupon has expired');
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }
    
    return coupon;
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
}

export async function validateGiftCard(giftCardCode: string) {
  try {
    const giftCardRef = doc(db, 'giftCards', giftCardCode.toUpperCase());
    const giftCardSnap = await getDoc(giftCardRef);
    
    if (!giftCardSnap.exists()) {
      throw new Error('Gift card not found');
    }
    
    const giftCard = giftCardSnap.data();
    
    if (giftCard.balance <= 0) {
      throw new Error('Gift card balance is zero');
    }
    
    if (giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date()) {
      throw new Error('Gift card has expired');
    }
    
    return giftCard;
  } catch (error) {
    console.error('Error validating gift card:', error);
    throw error;
  }
}

export async function createRefund(refundData: {
  orderId: string;
  paymentId: string;
  userId: string;
  amount: number;
  reason: string;
  type: 'full' | 'partial';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}) {
  try {
    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await setDoc(doc(db, 'refunds', refundId), {
      ...refundData,
      refundId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return refundId;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}

export async function createReturn(returnData: {
  orderId: string;
  userId: string;
  items: Array<{ itemId: string; quantity: number }>;
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'shipped' | 'received' | 'refunded';
}) {
  try {
    const returnId = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await setDoc(doc(db, 'returns', returnId), {
      ...returnData,
      returnId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return returnId;
  } catch (error) {
    console.error('Error creating return:', error);
    throw error;
  }
}

// Seed Helper: Runs only if the products collection is empty
export async function seedInitialDatabase() {
  try {
    const productsSnap = await getDocs(query(productsCol, limit(1)));
    if (!productsSnap.empty) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Seeding initial database collections...');

    // 1. Categories
    const initialCategories = [
      { id: 'cat-perf', name: 'Performance', description: 'Engineered for competitive track performance' },
      { id: 'cat-lux', name: 'Luxury', description: 'Handcrafted premium materials meet street apparel' },
      { id: 'cat-ltd', name: 'Limited Drop', description: 'Highly collectible rare custom creations' },
      { id: 'cat-fut', name: 'Futuristic', description: 'Advanced kinetic propulsion mechanics' }
    ];
    for (const cat of initialCategories) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }

    // 2. Sneakers (Products)
    const initialSneakers = [
      {
        id: 'zrx-01',
        name: 'ZEROX-01 Apex',
        tagline: 'The Ultimate Propulsion Footwear',
        price: 340,
        rating: 4.9,
        reviewsCount: 124,
        description: 'Features carbon fiber Z-Plates, nitrogen cushion pods, and a premium seamless TetherWeave fabric upper calibrated for professional athletes.',
        category: 'Performance',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop',
        sizes: [8, 9, 10, 11, 12],
        specs: {
          weight: '280 grams',
          cushioning: 'Nitrogen Micro-Pods',
          offset: '6.0 mm',
          propulsion: 'Curved Z-Plate Carbon'
        },
        colorways: [
          { name: 'Cosmic Gold', hex: '#C9A227', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop' },
          { name: 'Laser Lime', hex: '#A3E635', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
          { name: 'Quantum Obsidian', hex: '#111111', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop' }
        ],
        features: [
          { title: 'TetherWeave upper mesh', description: 'Breathable, high-tensile custom lock down weave.' },
          { title: 'Nitrogen-infused pods', description: 'Sealed lateral micro-chambers for high shock dissipation.' },
          { title: 'Full-length Carbon Z-Plate', description: 'Saves runner energy with snap-forward propulsion.' }
        ]
      },
      {
        id: 'zrx-lux-monolith',
        name: 'Monolith Silhouette',
        tagline: 'Minimalist Architectural Masterpiece',
        price: 490,
        rating: 4.8,
        reviewsCount: 86,
        description: 'An architectural tribute to physical form. Constructed with premium full-grain Italian leather linings and structured magnetic collar locks.',
        category: 'Luxury',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop',
        sizes: [8.5, 9, 10, 10.5, 11],
        specs: {
          weight: '340 grams',
          cushioning: 'High-Density Gel Core',
          offset: '4.0 mm',
          propulsion: 'Integrated TPU Shank'
        },
        colorways: [
          { name: 'Raw Alabaster', hex: '#F5F5F7', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop' },
          { name: 'Void Black', hex: '#0A0A0A', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop' },
          { name: 'Stardust Silver', hex: '#E2E8F0', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop' }
        ],
        features: [
          { title: 'Full-grain leather', description: 'Ethically sourced, drum-dyed Italian calfskin.' },
          { title: 'Magnetic Collar Seals', description: 'Ultra-fast step-in convenience with micro-magnets.' },
          { title: 'Chambered rubber sole', description: 'Maximum traction with multi-tier hexagonal ribs.' }
        ]
      },
      {
        id: 'zrx-fut-nebula',
        name: 'Nebula Overdrive',
        tagline: 'Cybernetic Visual Statement',
        price: 410,
        rating: 5.0,
        reviewsCount: 42,
        description: 'Engineered with transparent upper filaments, a glow-in-the-dark structural frame, and our proprietary kinetic propulsion compression springs.',
        category: 'Futuristic',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        sizes: [7, 8, 9, 10, 11, 12],
        specs: {
          weight: '295 grams',
          cushioning: 'Helium Air Core',
          offset: '8.0 mm',
          propulsion: 'Recoil spring carbon matrix'
        },
        colorways: [
          { name: 'Neon Nebula', hex: '#D946EF', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
          { name: 'Solar Orange', hex: '#F97316', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop' },
          { name: 'Cryo Teal', hex: '#06B6D4', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop' }
        ],
        features: [
          { title: 'Transparent Filament Upper', description: 'Semi-transparent mesh highlighting inner sock cage.' },
          { title: 'Glow-in-the-dark frame', description: 'Phosphorescent side structure that stores light.' },
          { title: 'Recoil Carbon Springs', description: 'Under-heel compressed arches that push back on strikes.' }
        ]
      }
    ];
    for (const shoe of initialSneakers) {
      await setDoc(doc(db, 'products', shoe.id), shoe);
      // Create corresponding inventory document
      await setDoc(doc(db, 'inventory', shoe.id), {
        productId: shoe.id,
        name: shoe.name,
        stock: 50,
        lastUpdated: serverTimestamp()
      });
    }

    // 3. Coupons / Promo Codes / Gift Cards
    const initialCoupons = [
      { code: 'ZEROX20', discountType: 'percentage', value: 20, description: '20% Off your total order', active: true },
      { code: 'APEXFOUNDER', discountType: 'percentage', value: 35, description: 'Exclusive 35% discount for early adopters', active: true },
      { code: 'GIFT50', discountType: 'fixed', value: 50, description: '$50 Fixed Credit Gift Card', active: true },
      { code: 'FREESHIP', discountType: 'free_shipping', value: 0, description: 'Free Express Delivery worldwide', active: true }
    ];
    for (const coup of initialCoupons) {
      await setDoc(doc(db, 'coupons', coup.code), coup);
    }

    // 4. Dummy Support Chat Tickets
    const initialSupport = [
      { id: 't-101', name: 'James Carter', email: 'james.carter@apex.com', subject: 'Inquiry on sizing standard', message: 'Do the ZEROX-01 shoes run true to size or should I size up?', status: 'Open', date: '2026-07-04' },
      { id: 't-102', name: 'Sophia Loren', email: 'sophia.l@lux.it', subject: 'Exchange request', message: 'I purchased Void Black but wanted Raw Alabaster instead. Is it possible to exchange?', status: 'Open', date: '2026-07-05' }
    ];
    for (const ticket of initialSupport) {
      await setDoc(doc(db, 'support_tickets', ticket.id), ticket);
    }

    // 5. Initial Reviews
    const initialReviews = [
      { id: 'rev-1', productId: 'zrx-01', user: 'Mark K.', rating: 5, comment: 'Phenomenal response times. The Carbon Z-Plate actually cut down my marathon times!', approved: true, date: '2026-07-01' },
      { id: 'rev-2', productId: 'zrx-01', user: 'Elena R.', rating: 4, comment: 'Extreme cushioning, love the cosmic design and custom embroidery details on heel.', approved: true, date: '2026-07-03' },
      { id: 'rev-3', productId: 'zrx-lux-monolith', user: 'Julian S.', rating: 5, comment: 'Unparalleled leather texture. Easily competes with top-tier high luxury brands.', approved: true, date: '2026-07-04' }
    ];
    for (const rev of initialReviews) {
      await setDoc(doc(db, 'reviews', rev.id), rev);
    }

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding initial database: ', error);
  }
}

// Admin Helper Functions
export async function getUserRole(uid: string): Promise<string> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data().role || 'user') : 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
}

export async function setUserRole(uid: string, role: 'admin' | 'manager' | 'user' | 'editor' | 'warehouse' | 'support' | 'marketing') {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role, updatedAt: serverTimestamp() });
    await logAdminAction('role_change', `Changed user ${uid} role to ${role}`, { uid, role });
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
}

export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const role = await getUserRole(uid);
    return ['admin', 'manager'].includes(role);
  } catch (error) {
    return false;
  }
}

export async function logAdminAction(action: string, description: string, details?: any) {
  try {
    await addDoc(adminLogsCol, {
      action,
      description,
      details: details || {},
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

export async function getAdminLogs(limit_count: number = 100) {
  try {
    const q = query(adminLogsCol, orderBy('timestamp', 'desc'), limit(limit_count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }
}
