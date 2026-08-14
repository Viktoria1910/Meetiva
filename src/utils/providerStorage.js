import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const COLL = 'providers';

export async function getProviders() {
  const snap = await getDocs(collection(db, COLL));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function getProviderByUserId(uid) {
  const snap = await getDoc(doc(db, COLL, uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

export async function getApprovedProviders(category) {
  const q = query(collection(db, COLL), where('category', '==', category), where('status', '==', 'approved'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function upsertProvider(provider) {
  const { uid, ...data } = provider;
  await setDoc(doc(db, COLL, uid), data, { merge: true });
}

export async function updateProviderStatus(uid, status) {
  const updates = { status };
  if (status === 'approved') updates.approvedAt = serverTimestamp();
  await updateDoc(doc(db, COLL, uid), updates);
}
