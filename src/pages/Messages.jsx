import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, MessageSquare, Trash2 } from 'lucide-react';
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
  
  const messagesEndRef = useRef(null);

  // Skrolanje na dno poruka
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Povlačenje svih razgovora korisnika + praćenje nepročitanih poruka za svaki chat
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoadingChats(false);
      return;
    }

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribes = [];

    const unsubscribeChats = onSnapshot(q, (snapshot) => {
      const fetchedChats = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setChats(fetchedChats);
      setLoadingChats(false);

      // Postavljanje listenera za nepročitane poruke za svaki pojedini chat
      fetchedChats.forEach(chat => {
        const messagesQ = query(
          collection(db, 'chats', chat.id, 'messages'),
          where('read', '==', false)
        );

        const unsubMsg = onSnapshot(messagesQ, (msgSnapshot) => {
          // Brojimo samo poruke koje je poslala druga osoba
          const unreadFromOther = msgSnapshot.docs.filter(
            docSnap => docSnap.data().senderId !== currentUser.uid
          ).length;

          setUnreadCounts(prev => ({
            ...prev,
            [chat.id]: unreadFromOther
          }));
        });

        unsubscribes.push(unsubMsg);
      });
    }, (error) => {
      console.error("Greška pri dohvaćanju razgovora:", error);
      setLoadingChats(false);
    });

    return () => {
      unsubscribeChats();
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentUser]);

  // 2. Ako je aktivni chat obrisan ili više ne postoji, poništi activeChat
  useEffect(() => {
    if (activeChat && (!chats || !chats.some(c => c.id === activeChat.id))) {
      setActiveChat(null);
    }
  }, [chats, activeChat]);

  // 3. Povlačenje poruka za odabrani razgovor i automatsko označenje kao pročitano
  useEffect(() => {
    if (!activeChat?.id) {
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

      // Označi sve pristigle nepročitane poruke drugog korisnika kao pročitane
      snapshot.docs.forEach(async (messageDoc) => {
        const data = messageDoc.data();
        if (data.senderId !== currentUser?.uid && data.read === false) {
          try {
            await updateDoc(doc(db, 'chats', activeChat.id, 'messages', messageDoc.id), {
              read: true
            });
          } catch (err) {
            console.error("Greška pri ažuriranju statusa poruke:", err);
          }
        }
      });
    }, (error) => {
      console.error("Greška pri dohvaćanju poruka:", error);
    });

    return () => unsubscribe();
  }, [activeChat, currentUser]);

  // 4. Slanje poruke
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat?.id || !currentUser?.uid) return;

    const textToSend = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        text: textToSend,
        senderId: currentUser.uid,
        senderName: userProfile?.name || currentUser.displayName || 'Korisnik',
        createdAt: serverTimestamp(),
        read: false // Nova poruka je po defaultu nepročitana
      });
    } catch (error) {
      console.error("Greška pri slanju poruke:", error);
    }
  };

  // 5. Brisanje razgovora
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

  // Sigurno formatiranje vremena
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
              className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition-colors border-none"
              style={{ background: '#A7A5D0', cursor: 'pointer' }}
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
                          <p className="text-xs truncate" style={{ color: '#8A9192' }}>Otvorite razgovor</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Ljubičasti krug s brojem nepročitanih poruka */}
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
                  <div className="p-4 bg-white flex items-center gap-3" style={{ borderBottom: '1px solid #DDE3DE' }}>
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
                            className={`flex flex-col max-w-[70%] ${
                              isMe ? 'self-end items-end' : 'self-start items-start'
                            }`}
                          >
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
                      className="px-4 py-2 rounded-xl text-white transition-colors border-none cursor-pointer flex items-center justify-center"
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
    </div>
  );
}