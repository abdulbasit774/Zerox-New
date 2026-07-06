import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup
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
