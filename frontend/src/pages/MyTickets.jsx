import { useEffect, useState } from "react";
import api from "../api";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, MapPin, Search, Star, MessageSquare } from "lucide-react";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = sessionStorage.getItem("userInfo");
    if (user) setUserInfo(JSON.parse(user));
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/registrations/my-tickets");
      setTickets(data);
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId, isPastEvent) => {
    if(isPastEvent) return;
    if (!window.confirm("Are you sure you want to cancel your ticket? This action cannot be undone.")) return;
    try {
      await api.delete(`/registrations/${registrationId}`);
      setTickets(tickets.filter((t) => t._id !== registrationId));
    } catch (err) {
      alert("Failed to cancel ticket");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center -mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>;
  if (error) return <div className="text-red-500 text-center py-20 font-bold bg-slate-50 min-h-screen">{error}</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-4 pt-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Gamification Card */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
           <div>
             <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">My Virtual Wallet</h1>
             <p className="text-slate-500 font-medium">Manage your event accesses and view earned engagement points.</p>
           </div>

           {/* Engagement Points Mockup */}
           <div className="bg-white p-4 rounded-3xl border border-brand-200 shadow-xl shadow-brand-500/10 flex items-center gap-4 group cursor-help shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-inner group-hover:animate-bounce">
                 <Star className="text-white fill-white" size={24} />
              </div>
              <div className="pr-4">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Campus Leaderboard</p>
                 <p className="text-2xl font-black text-slate-800 leading-none">
                    {userInfo?.engagementPoints || (tickets.filter(t => t.checkedIn).length * 10)} <span className="text-sm font-bold text-amber-500 uppercase">PTS</span>
                 </p>
              </div>
           </div>
        </div>

        {/* Tickets Grid */}
        <div className="space-y-8">
           {tickets.length === 0 ? (
            <div className="bg-white py-24 rounded-3xl border border-dashed border-slate-300 text-center shadow-sm">
                <Search className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Tickets</h3>
                <p className="text-slate-500 max-w-sm mx-auto">You haven't registered for any events yet. Explore the dashboard to find exciting happenings around campus!</p>
                <button onClick={() => window.location.href='/dashboard'} className="mt-6 px-6 py-2.5 bg-brand-50 text-brand-700 font-bold rounded-xl hover:bg-brand-100 transition-colors">Browse Events &rarr;</button>
            </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((ticket) => {
                   const event = ticket.eventId || {};
                   const isPastEvent = new Date(event.date || event.startTime) < new Date();
                   const isCheckedIn = ticket.checkedIn;

                   return (
                      <div key={ticket._id} className={`bg-white rounded-3xl border ${isPastEvent ? 'border-slate-200 opacity-75' : 'border-brand-200 shadow-xl shadow-brand-900/5'} overflow-hidden relative group`}>
                         
                         {/* Card Header Color Ribbon */}
                         <div className={`h-2 w-full ${isPastEvent ? 'bg-slate-300' : 'bg-gradient-to-r from-brand-500 to-blue-500'}`}></div>

                         <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                               <div className="pr-4">
                                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-3 ${isPastEvent ? 'bg-slate-100 text-slate-500' : 'bg-brand-50 text-brand-700'}`}>
                                     {event.category || 'Event'}
                                  </span>
                                  <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-1">{event.title || 'Unknown Event'}</h3>
                                  <p className="text-sm text-slate-500 font-medium">Ticket ID: <span className="font-mono text-slate-800">{ticket.ticketId || ticket._id.slice(-6)}</span></p>
                               </div>
                               
                               {/* Dynamic QR Code Status */}
                               <div className="shrink-0 text-center">
                                  <div className={`p-2 rounded-2xl border-2 ${isCheckedIn ? 'border-emerald-200 bg-emerald-50' : isPastEvent ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white group-hover:border-brand-300 transition-colors'}`}>
                                     <QRCodeSVG 
                                        value={ticket.ticketId || ticket._id} 
                                        size={72} 
                                        fgColor={isCheckedIn ? '#059669' : isPastEvent ? '#94a3b8' : '#0f172a'} 
                                     />
                                  </div>
                                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isCheckedIn ? 'text-emerald-600' : isPastEvent ? 'text-slate-400' : 'text-slate-500'}`}>
                                     {isCheckedIn ? 'Accessed' : isPastEvent ? 'Expired' : 'Scan At Door'}
                                  </p>
                               </div>
                            </div>

                            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                               <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                  <MapPin size={16} className="text-slate-400" /> {event.venue || 'TBD'}
                               </div>
                               <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                  <CalendarDays size={16} className="text-slate-400" /> {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                                  {event.startTime && <span> at {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                               </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                               {isPastEvent && isCheckedIn ? (
                                 <button className="flex-1 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm rounded-xl transition-colors flex justify-center items-center gap-2 border border-blue-200">
                                    <MessageSquare size={16} /> Leave Feedback (+5 pts)
                                 </button>
                               ) : isPastEvent ? (
                                 <button disabled className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed">
                                    Missed Event
                                 </button>
                               ) : (
                                 <button 
                                    onClick={() => handleCancelRegistration(ticket._id, isPastEvent)}
                                    className="px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold text-sm rounded-xl transition-all w-full flex-1"
                                 >
                                    Cancel Registration
                                 </button>
                               )}
                            </div>
                         </div>
                      </div>
                   )
                })}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
