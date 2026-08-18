import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPendingProviders() {
  const { userProfile, loading } = useAuth();
  const [providers, setProviders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Ako se profil još učitava, pričekaj
    if (loading) return;

    // Ako profil nije admin, prekini i nemoj slati upit
    if (!userProfile || userProfile.role !== 'admin') {
      setFetching(false);
      return;
    }

    const fetchPendingProviders = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'provider'),
          where('approved', '==', false)
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProviders(list);
      } catch (error) {
        console.error('Greška pri dohvaćanju:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchPendingProviders();
  }, [userProfile, loading]);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, 'users', id), { approved: true });
      setProviders(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Greška pri odobravanju:', error);
    }
  };

  if (loading || fetching) return <div className="p-8 text-center">Učitavanje...</div>;

  if (userProfile?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Nemate ovlasti za pristup ovoj stranici.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#2B3132' }}>Zahtjevi za registraciju obrtnika</h1>
      {providers.length === 0 ? (
        <p className="text-gray-500">Trenutno nema zahtjeva na čekanju.</p>
      ) : (
        <div className="space-y-4">
          {providers.map(p => (
            <div key={p.id} className="p-4 bg-white border rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <p className="font-semibold">{p.name || p.email}</p>
                <p className="text-sm text-gray-500">{p.email}</p>
              </div>
              <button
                onClick={() => handleApprove(p.id)}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all"
                style={{ background: '#A7A5D0' }}
              >
                Odobri obrt
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}