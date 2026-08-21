import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, MessageSquare, Trash2, FileText, CheckCircle2, XCircle, Clock, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export default function Messages() {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Stanja za modal slanja ponude
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Provjera je li korisnik pružatelj usluga
  const isProvider = userProfile?.role === 'provider' || userProfile?.isProvider || userProfile?.type === 'provider';

  // Skrolanje na dno poruka
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Povlačenje svih razgovora korisnika + praćenje nepročitanih poruka
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoadingChats(false);
      return;
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    let msgUnsubscribes = [];

    const unsubscribeChats = onSnapshot(q, (snapshot) => {
      // Očisti prethodne listenere za nepročitane poruke
      msgUnsubscribes.forEach(unsub => unsub());
      msgUnsubscribes = [];

      const fetchedChats = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      
      setChats(fetchedChats);
      setLoadingChats(false);

      // Postavljanje listenera za nepročitane poruke po razgovoru
      fetchedChats.forEach(chat => {
        const messagesQ = query(
          collection(db, 'chats', chat.id, 'messages'),
          where('read', '==', false)
        );

        const unsubMsg = onSnapshot(messagesQ, (msgSnapshot) => {
          const unreadFromOther = msgSnapshot.docs.filter(
            docSnap => docSnap.data().senderId !== currentUser.uid
          ).length;

          setUnreadCounts(prev => ({
            ...prev,
            [chat.id]: unreadFromOther
          }));
        });

        msgUnsubscribes.push(unsubMsg);
      });
    }, (error) => {
      console.error("Greška pri dohvaćanju razgovora:", error);
      setLoadingChats(false);
    });

    return () => {
      unsubscribeChats();
      msgUnsubscribes.forEach(unsub => unsub());
    };
  }, [currentUser?.uid]);

  // 2. Ako je aktivni chat obrisan, poništi activeChat
  useEffect(() => {
    if (activeChat && (!chats || !chats.some(c => c.id === activeChat.id))) {
      setActiveChat(null);
    }
  }, [chats, activeChat]);

  // 3. Povlačenje poruka za odabrani razgovor i automatsko označenje kao pročitano
  useEffect(() => {
    if (!activeChat?.id || !currentUser?.uid) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setMessages(fetchedMessages);

      // Označi nepročitane poruke drugog korisnika kao pročitane
      snapshot.docs.forEach((messageDoc) => {
        const data = messageDoc.data();
        if (data.senderId !== currentUser.uid && data.read === false) {
          updateDoc(doc(db, 'chats', activeChat.id, 'messages', messageDoc.id), {
            read: true
          }).catch(err => console.error("Greška pri ažuriranju statusa poruke:", err));
        }
      });
    }, (error) => {
      console.error("Greška pri dohvaćanju poruka:", error);
    });

    return () => unsubscribe();
  }, [activeChat?.id, currentUser?.uid]);

  // 4. Slanje obične tekstualne poruke
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat?.id || !currentUser?.uid) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        type: 'text',
        text: textToSend,
        senderId: currentUser.uid,
        senderName: userProfile?.name || currentUser.displayName || 'Korisnik',
        createdAt: serverTimestamp(),
        read: false
      });

      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: textToSend,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Greška pri slanju poruke:", error);
    }
  };

  // 5. Slanje ponude (Zaštićeno za pružatelje)
  const handleSendOffer = async (e) => {
    e.preventDefault();

    if (!isProvider) {
      alert("Samo pružatelji usluga mogu slati ponude.");
      setIsOfferModalOpen(false);
      return;
    }

    if (!offerTitle || !offerPrice || !activeChat?.id || !currentUser?.uid) return;

    setSendingOffer(true);

    try {
      const offerData = {
        title: offerTitle.trim(),
        price: Number(offerPrice),
        date: offerDate || 'Po dogovoru',
        description: offerDesc.trim(),
        status: 'pending' // 'pending' | 'accepted' | 'rejected'
      };

      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        type: 'offer',
        text: `Službena ponuda: ${offerData.title} (${offerData.price} €)`,
        offerDetails: offerData,
        senderId: currentUser.uid,
        senderName: userProfile?.name || currentUser.displayName || 'Pružatelj',
        createdAt: serverTimestamp(),
        read: false
      });

      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: `Službena ponuda: ${offerData.price} €`,
        updatedAt: serverTimestamp()
      });

      setOfferTitle('');
      setOfferPrice('');
      setOfferDate('');
      setOfferDesc('');
      setIsOfferModalOpen(false);
    } catch (error) {
      console.error("Greška pri slanju ponude:", error);
      alert("Došlo je do greške pri slanju ponude.");
    } finally {
      setSendingOffer(false);
    }
  };

  // 6. Prihvaćanje ponude
  // 6. Prihvaćanje ponude
  // Prihvaćanje ponude i automatsko upisivanje u bazu 'bookings'
  const handleAcceptOffer = async (msgId, offerDetails) => {
    if (!activeChat?.id || !currentUser?.uid) {
      alert("Greška: Niste prijavljeni ili chat nije odabran.");
      return;
    }

    try {
      // 1. Ažuriraj status ponude u samoj poruci chata
      const msgRef = doc(db, 'chats', activeChat.id, 'messages', msgId);
      await updateDoc(msgRef, {
        'offerDetails.status': 'accepted'
      });

      // 2. Pronađi ID i ime pružatelja te klijenta
      const participants = activeChat.participants || [];
      const otherParticipantId = participants.find(id => id !== currentUser.uid) || '';
      
      // Pokušaj dohvatiti ime pružatelja iz razgovora ili profila
      const otherParticipantName = activeChat.participantNames?.[otherParticipantId] 
        || activeChat.providerName 
        || 'Pružatelj usluga';

      const currentUserName = userProfile?.name || currentUser.displayName || 'Korisnik';

      // 3. STVORI NOVI DOKUMENT U KOLEKCIJI 'bookings'
      await addDoc(collection(db, 'bookings'), {
        chatId: activeChat.id,
        messageId: msgId,

        // Podaci o klijentu (podržana sva polja radi kompatibilnosti)
        userId: currentUser.uid,
        clientId: currentUser.uid,
        userName: currentUserName,

        // Podaci o pružatelju
        providerId: otherParticipantId,
        providerName: otherParticipantName,

        // Detalji ponude / rezervacije
        title: offerDetails?.title || 'Prihvaćena ponuda',
        price: Number(offerDetails?.price || 0),
        date: offerDetails?.date || 'Po dogovoru',
        description: offerDetails?.description || '',

        // Status rezervacije
        status: 'confirmed',
        createdAt: serverTimestamp()
      });

      alert("Ponuda je uspješno prihvaćena! Rezervacija je dodana na vašu nadzornu ploču.");
    } catch (error) {
      console.error("Greška pri prihvaćanju ponude:", error);
      alert(`Došlo je do greške pri spremanju rezervacije: ${error.message}`);
    }
  };


  // 7. Odbijanje ponude
  const handleRejectOffer = async (msgId) => {
    if (!activeChat?.id) return;

    try {
      const msgRef = doc(db, 'chats', activeChat.id, 'messages', msgId);
      await updateDoc(msgRef, {
        'offerDetails.status': 'rejected'
      });
    } catch (error) {
      console.error("Greška pri odbijanju ponude:", error);
    }
  };

  // 8. Brisanje razgovora
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm("Jeste li sigurni da želite obrisati ovaj razgovor?")) {
      try {
        await deleteDoc(doc(db, 'chats', chatId));
        if (activeChat?.id === chatId) {
          setActiveChat(null);
        }
      } catch (error) {
        console.error("Greška pri brisanju razgovora:", error);
      }
    }
  };

  // Formatiranje vremena
  const formatTime = (createdAt) => {
    if (!createdAt) return 'Šalje se...';
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  };

  if (loading || loadingChats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F2' }}>
        <p className="text-sm font-semibold" style={{ color: '#8A9192' }}>Učitavanje poruka...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F5F2' }}>
      <div className="max-w-screen-xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 flex flex-col">
        <h1 className="text-2xl font-extrabold mb-6" style={{ color: '#2B3132' }}>Poruke</h1>

        {!chats || chats.length === 0 ? (
          <div 
            className="bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center my-auto"
            style={{ border: '1px solid #DDE3DE' }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: '#EEEDF9' }}
            >
              <MessageSquare size={32} style={{ color: '#8886B8' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#2B3132' }}>Nemate aktivnih poruka</h3>
            <p className="text-sm mb-6 max-w-sm" style={{ color: '#505A5B' }}>
              Nemate još započetih razgovora. Poruke možete započeti direktno s profila pružatelja usluga.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition-colors border-none cursor-pointer"
              style={{ background: '#A7A5D0' }}
            >
              Pretraži usluge
            </button>
          </div>
        ) : (
          <div 
            className="bg-white rounded-2xl flex-1 flex flex-col md:flex-row min-h-[550px] overflow-hidden shadow-sm"
            style={{ border: '1px solid #DDE3DE' }}
          >
            {/* LIJEVA STRANA: Popis razgovora */}
            <div className="w-full md:w-1/3 flex flex-col bg-white" style={{ borderRight: '1px solid #DDE3DE' }}>
              <div className="p-4" style={{ borderBottom: '1px solid #DDE3DE', background: '#F9FAF8' }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8A9192' }}>Moji razgovori</p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => {
                  const participantIds = Object.keys(chat.participantNames || {});
                  const otherId = participantIds.find(id => id !== currentUser?.uid);
                  const otherName = chat.participantNames?.[otherId] || 'Razgovor';
                  const isActive = activeChat?.id === chat.id;
                  const unreadCount = unreadCounts[chat.id] || 0;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat)}
                      className="p-4 cursor-pointer transition-colors flex items-center justify-between group relative"
                      style={{ 
                        borderBottom: '1px solid #F4F5F2',
                        background: isActive ? '#EEEDF9' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: '#A7A5D0' }}
                        >
                          {otherName.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold truncate" style={{ color: '#2B3132' }}>{otherName}</h4>
                          <p className="text-xs truncate" style={{ color: '#8A9192' }}>
                            {chat.lastMessage || 'Otvorite razgovor'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <span 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm"
                            style={{ background: '#A7A5D0' }}
                          >
                            {unreadCount}
                          </span>
                        )}

                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-opacity border-none bg-transparent hover:bg-red-50 text-red-500 cursor-pointer"
                          title="Obriši razgovor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DESNA STRANA: Chat prozor */}
            <div className="flex-1 flex flex-col" style={{ background: '#FAFBF9' }}>
              {activeChat ? (
                <>
                  {/* Zaglavlje chata */}
                  <div className="p-4 bg-white flex items-center justify-between" style={{ borderBottom: '1px solid #DDE3DE' }}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: '#A7A5D0' }}
                      >
                        <User size={16} />
                      </div>
                      <h3 className="font-bold text-sm" style={{ color: '#2B3132' }}>
                        {activeChat.participantNames?.[
                          Object.keys(activeChat.participantNames || {}).find(id => id !== currentUser?.uid)
                        ] || 'Razgovor'}
                      </h3>
                    </div>

                    {/* Tipka se prikazuje SAMO pružaocima usluga */}
                    {isProvider && (
                      <button
                        onClick={() => setIsOfferModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors border-none cursor-pointer hover:opacity-90"
                        style={{ background: '#7DA68D' }}
                        title="Napravi službenu ponudu za ovog korisnika"
                      >
                        <Plus size={14} /> Napravi ponudu
                      </button>
                    )}
                  </div>

                  {/* Popis poruka */}
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                    {messages.length === 0 ? (
                      <p className="text-center text-xs my-auto" style={{ color: '#8A9192' }}>
                        Nema poruka. Napišite prvu poruku u nastavku!
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId === currentUser?.uid;

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                              isMe ? 'self-end items-end' : 'self-start items-start'
                            }`}
                          >
                            {msg.type === 'offer' && msg.offerDetails ? (
                              /* Kartica Ponude */
                              <div 
                                className="w-full p-4 rounded-2xl bg-white shadow-sm border"
                                style={{ borderColor: '#DDE3DE' }}
                              >
                                <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2" style={{ borderColor: '#F4F5F2' }}>
                                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: '#8886B8' }}>
                                    <FileText size={14} /> Službena ponuda
                                  </div>
                                  <span className="font-extrabold text-base" style={{ color: '#7DA68D' }}>
                                    {msg.offerDetails.price} €
                                  </span>
                                </div>

                                <h4 className="font-bold text-sm mb-1" style={{ color: '#2B3132' }}>
                                  {msg.offerDetails.title}
                                </h4>

                                {msg.offerDetails.date && (
                                  <p className="text-xs mb-1 flex items-center gap-1" style={{ color: '#8A9192' }}>
                                    <span>📅 Datum:</span> <span className="font-medium text-gray-700">{msg.offerDetails.date}</span>
                                  </p>
                                )}

                                {msg.offerDetails.description && (
                                  <p className="text-xs leading-relaxed my-2 p-2 rounded-lg" style={{ background: '#FAFBF9', color: '#505A5B' }}>
                                    {msg.offerDetails.description}
                                  </p>
                                )}

                                <div className="mt-3 pt-2 border-t" style={{ borderColor: '#F4F5F2' }}>
                                  {msg.offerDetails.status === 'pending' && (
                                    !isMe ? (
                                      <div className="flex gap-2 mt-1">
                                        <button
                                          onClick={() => handleAcceptOffer(msg.id, msg.offerDetails)}
                                          className="flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white border-none cursor-pointer flex items-center justify-center gap-1 transition-colors hover:opacity-90"
                                          style={{ background: '#7DA68D' }}
                                        >
                                          <CheckCircle2 size={14} /> Prihvati ponudu
                                        </button>
                                        <button
                                          onClick={() => handleRejectOffer(msg.id)}
                                          className="py-2 px-3 rounded-xl font-bold text-xs border-none cursor-pointer flex items-center justify-center gap-1 transition-colors hover:bg-gray-200"
                                          style={{ background: '#EAECE9', color: '#505A5B' }}
                                        >
                                          <XCircle size={14} /> Odbij
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#D97706' }}>
                                        <Clock size={13} /> Čeka se odgovor korisnika...
                                      </div>
                                    )
                                  )}

                                  {msg.offerDetails.status === 'accepted' && (
                                    <div className="p-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1" style={{ background: '#E8F0EA', color: '#7DA68D' }}>
                                      <CheckCircle2 size={14} /> Ponuda prihvaćena i prebačena u rezervacije
                                    </div>
                                  )}

                                  {msg.offerDetails.status === 'rejected' && (
                                    <div className="p-2 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                                      <XCircle size={14} /> Ponuda je odbijena
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              /* Obična poruka */
                              <div
                                className="p-3 rounded-2xl text-sm"
                                style={{
                                  background: isMe ? '#A7A5D0' : '#FFFFFF',
                                  color: isMe ? '#FFFFFF' : '#2B3132',
                                  border: isMe ? 'none' : '1px solid #DDE3DE',
                                  borderBottomRightRadius: isMe ? '2px' : '16px',
                                  borderBottomLeftRadius: isMe ? '16px' : '2px',
                                }}
                              >
                                {msg.text}
                              </div>
                            )}

                            <span className="text-[10px] mt-1 px-1" style={{ color: '#8A9192' }}>
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Unos poruke */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-white flex gap-2" style={{ borderTop: '1px solid #DDE3DE' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Napišite poruku..."
                      className="flex-1 px-4 py-2 rounded-xl text-sm outline-none border focus:border-[#A7A5D0]"
                      style={{ borderColor: '#DDE3DE' }}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-white transition-colors border-none cursor-pointer flex items-center justify-center hover:opacity-90"
                      style={{ background: '#A7A5D0' }}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center" style={{ color: '#8A9192' }}>
                  <MessageSquare size={40} className="mb-3 opacity-40" />
                  <p className="text-sm font-semibold">Odaberite razgovor s lijeve strane za prikaz poruka.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL ZA IZRADU PONUDE */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative" style={{ border: '1px solid #DDE3DE' }}>
            <button 
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold mb-4" style={{ color: '#2B3132' }}>Izradi ponudu za klijenta</h3>

            <form onSubmit={handleSendOffer} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: '#505A5B' }}>Naziv usluge / paketa *</label>
                <input
                  type="text"
                  required
                  placeholder="npr. Fotografiranje vjenčanja - Premium"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs outline-none border focus:border-[#A7A5D0]"
                  style={{ borderColor: '#DDE3DE' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: '#505A5B' }}>Cijena (€) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="npr. 500"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs outline-none border focus:border-[#A7A5D0]"
                    style={{ borderColor: '#DDE3DE' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: '#505A5B' }}>Datum održavanja</label>
                  <input
                    type="date"
                    value={offerDate}
                    onChange={(e) => setOfferDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs outline-none border focus:border-[#A7A5D0]"
                    style={{ borderColor: '#DDE3DE' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: '#505A5B' }}>Opis ponude i detalji</label>
                <textarea
                  rows="3"
                  placeholder="Navedite što je sve uključeno u cijenu..."
                  value={offerDesc}
                  onChange={(e) => setOfferDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs outline-none border focus:border-[#A7A5D0] resize-none"
                  style={{ borderColor: '#DDE3DE' }}
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-gray-200"
                  style={{ background: '#EAECE9', color: '#505A5B' }}
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={sendingOffer}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white border-none cursor-pointer transition-colors disabled:opacity-50 hover:opacity-90"
                  style={{ background: '#7DA68D' }}
                >
                  {sendingOffer ? 'Slanje...' : 'Pošalji ponudu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}