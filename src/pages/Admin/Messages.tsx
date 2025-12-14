import { useEffect, useState } from 'react';
import { endpoints } from '../../services/api';
import { HiMail, HiTrash, HiClock, HiChatAlt, HiReply, HiX, HiPaperAirplane } from 'react-icons/hi';
import { format, parseISO } from 'date-fns';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply Modal State
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await endpoints.contact.getAll();
      setMessages(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this message permanently?")) {
      try {
        await endpoints.contact.delete(id);
        fetchMessages();
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo) return;
    
    setSendingReply(true);
    try {
      await endpoints.contact.reply(replyingTo._id, replyText);
      alert(`Reply sent to ${replyingTo.email}!`);
      setReplyingTo(null); // Close modal
      setReplyText('');    // Clear text
    } catch (err) {
      console.error(err);
      alert("Failed to send email. Check backend logs.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-800">Inbox</h1>
        <p className="text-sm text-gray-500">Read and reply to inquiries.</p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-sm">
            <HiChatAlt className="text-4xl text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400">No new messages.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cafe-100 flex items-center justify-center text-cafe-600 font-bold text-lg">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{msg.name}</h3>
                    <a href={`mailto:${msg.email}`} className="text-xs text-cafe-500 hover:underline">{msg.email}</a>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1 mr-4">
                    <HiClock /> {format(parseISO(msg.createdAt), 'MMM d, h:mm a')}
                  </span>
                  
                  {/* REPLY BUTTON */}
                  <button 
                    onClick={() => setReplyingTo(msg)}
                    className="flex items-center gap-1 text-cafe-600 bg-cafe-50 hover:bg-cafe-100 px-3 py-1.5 rounded-sm text-xs font-bold uppercase transition-colors"
                  >
                    <HiReply /> Reply
                  </button>

                  <button 
                    onClick={() => handleDelete(msg._id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    title="Delete Message"
                  >
                    <HiTrash className="text-lg" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-sm text-sm text-gray-700 leading-relaxed border-l-4 border-cafe-200">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* REPLY MODAL */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-cafe-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HiReply /> 
                <span className="font-serif font-bold tracking-wide">Reply to {replyingTo.name}</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-white/70 hover:text-white"><HiX className="text-xl"/></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendReply} className="p-6">
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">To</label>
                <input disabled value={replyingTo.email} className="w-full bg-gray-100 border border-gray-200 p-2 text-gray-500 rounded-sm" />
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Message</label>
                <textarea 
                  required
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border p-3 rounded-sm outline-none focus:border-cafe-500 text-sm resize-none"
                  placeholder="Type your reply here..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setReplyingTo(null)} 
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={sendingReply}
                  className="bg-cafe-500 text-white px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-cafe-600 shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingReply ? 'Sending...' : <><HiPaperAirplane className="rotate-90"/> Send Email</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;