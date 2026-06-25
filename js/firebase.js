/**
 * Firebase initialization + helper functions.
 *
 * SETUP (one-time):
 *  1. Go to https://console.firebase.google.com
 *  2. Create a project → Add Web App → copy the config below
 *  3. Enable Firestore Database (Start in test mode, then add rules)
 *  4. Enable Authentication → Email/Password
 *  5. Enable Storage (optional — for real product images)
 *
 * FIRESTORE SECURITY RULES (paste in Firebase Console → Firestore → Rules):
 * ─────────────────────────────────────────────────────────────────────────
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Products — public read, admin write
 *     match /products/{id} {
 *       allow read: if true;
 *       allow write: if request.auth != null && request.auth.token.admin == true;
 *     }
 *     // Orders — any authenticated user can create; only their own orders readable
 *     match /orders/{id} {
 *       allow create: if true;
 *       allow read:   if request.auth != null &&
 *                        resource.data.uid == request.auth.uid;
 *       allow write:  if request.auth != null && request.auth.token.admin == true;
 *     }
 *     // Users — each user can read/write their own doc
 *     match /users/{uid} {
 *       allow read, write: if request.auth != null && request.auth.uid == uid;
 *     }
 *   }
 * }
 */

import { initializeApp }              from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth }                    from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { getStorage }                 from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js';

// ── CONFIG — replace these values with your project's config ─────────────────
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// Admin email — only this account can access the admin panel
export const ADMIN_EMAIL = "admin@thesnickerlab.com";

// ── Init ──────────────────────────────────────────────────────────────────────
let app, auth, db, storage;
let _configured = false;

try {
  // Check if config has been filled in
  if (!FIREBASE_CONFIG.apiKey.startsWith('YOUR_')) {
    app       = initializeApp(FIREBASE_CONFIG);
    auth      = getAuth(app);
    db        = getFirestore(app);
    storage   = getStorage(app);
    _configured = true;
  }
} catch (e) {
  console.warn('[SnickerLab] Firebase init failed — running in offline mode.', e);
}

export { auth, db, storage };
export const isConfigured = () => _configured;

// ── Firestore helpers ─────────────────────────────────────────────────────────

/** Fetch all products from Firestore. Returns null if unconfigured. */
export async function fetchProducts() {
  if (!db) return null;
  try {
    const snap = await getDocs(collection(db, 'products'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('[SnickerLab] fetchProducts failed:', e);
    return null;
  }
}

/** Fetch single product by Firestore doc ID. */
export async function fetchProduct(id) {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'products', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    return null;
  }
}

/** Save a product (upsert). Pass id to update, omit to create. */
export async function saveProduct(data, id = null) {
  if (!db) throw new Error('Firebase not configured');
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await updateDoc(doc(db, 'products', id), payload);
    return id;
  } else {
    payload.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, 'products'), payload);
    return ref.id;
  }
}

/** Delete a product by ID. */
export async function deleteProduct(id) {
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'products', id));
}

/** Save an order. Returns the Firestore doc ID. */
export async function saveOrder(order) {
  if (!db) return null;
  try {
    const payload = {
      ...order,
      createdAt: serverTimestamp(),
      status: 'confirmed',
    };
    const ref = await addDoc(collection(db, 'orders'), payload);
    return ref.id;
  } catch (e) {
    console.warn('[SnickerLab] saveOrder failed:', e);
    return null;
  }
}

/** Fetch all orders (admin only). */
export async function fetchAllOrders() {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}

/** Fetch orders for a specific user UID. */
export async function fetchUserOrders(uid) {
  if (!db) return [];
  try {
    const q    = query(collection(db, 'orders'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}

/** Save / update user profile doc. */
export async function saveUserProfile(uid, data) {
  if (!db) return;
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}
