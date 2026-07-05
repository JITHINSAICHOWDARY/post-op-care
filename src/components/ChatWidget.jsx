import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function ChatWidget({ role, userName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // This ref helps us auto-scroll to the newest message
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // We use a query to make sure messages load in chronological order
    const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      
      // Scroll to the bottom whenever a new message arrives
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText(''); // Clear input instantly for snappy UI feel

    try {
      await addDoc(collection(db, 'chat_messages'), {
        text: textToSend,
        senderRole: role,
        senderName: userName,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* THE CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 flex h-96 w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <h3 className="font-bold text-sm">
              {role === 'doctor' ? 'Chat with Patient' : 'Chat with Doctor'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white font-bold">
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderRole === role;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                    {msg.senderName}
                  </span>
                  <div className={`rounded-2xl px-4 py-2 text-sm max-w-[85%] ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-3 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700">
              ➤
            </button>
          </form>
        </div>
      )}

      {/* THE FLOATING BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-xl transition-transform hover:scale-110 hover:bg-blue-700"
        >
          💬
        </button>
      )}
    </div>
  );
}