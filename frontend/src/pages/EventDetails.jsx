import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { CalendarDays, MapPin, Users, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";

export default function EventDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  
  // Dynamic Form State
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch event using the slug endpoint we added in Phase 1
        // Wait, did we map the route using /events/slug/:slug ?
        // If not, we might need to fallback to ID. In our route: router.route("/slug/:slug").get(getEventBySlug);
        const { data } = await api.get(`/events/slug/${slug}`);
        setEvent(data);
      } catch (err) {
        try {
           // Fallback to ID if passed an ID directly
           const { data } = await api.get(`/events/${slug}`);
           setEvent(data);
        } catch(fallbackErr) {
           setError("Event could not be found.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const handleDynamicChange = (fieldId, value) => {
     setAnswers({ ...answers, [fieldId]: value });
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    const userInfo = sessionStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/");
      return;
    }

    setRegistering(true);
    setError("");

    try {
      await api.post(`/registrations/${event._id}`, {
         dynamicAnswers: answers
      });
      // Redirect to My Tickets on success
      navigate("/my-tickets");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finalize registration.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>;
  if (error || !event) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><div className="text-center font-bold text-red-500">{error}</div></div>;

  const isFull = event.seatsFilled >= event.capacity;
  const userInfo = sessionStorage.getItem("userInfo") ? JSON.parse(sessionStorage.getItem("userInfo")) : null;

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
       <div className="w-full h-[40vh] bg-gradient-to-br from-brand-900 to-slate-900 border-b border-brand-800 relative">
          <div className="absolute inset-0 bg-white/5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="max-w-4xl mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
             <span className="inline-block px-3 py-1 bg-brand-500/20 border border-brand-500/50 text-brand-300 font-bold uppercase tracking-widest text-xs rounded-full mb-4 w-max shadow-sm backdrop-blur-md">
               {event.category}
             </span>
             <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">{event.title}</h1>
             <p className="text-lg md:text-xl text-brand-100 font-light max-w-2xl">{event.description}</p>
          </div>
       </div>

       <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             
             {/* Main Form Area */}
             <div className="md:col-span-2">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                   
                   <div className="border-b border-slate-100 pb-6 mb-8 flex gap-4 items-center bg-brand-50 rounded-2xl p-4">
                      <div className="bg-white p-3 rounded-full shadow-sm text-brand-600">
                         <Sparkles size={24} className="animate-pulse" />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800 text-lg">Auto-Fill Magic Activated</h3>
                         <p className="text-slate-500 text-sm">We've pre-filled your verified University details to save you time.</p>
                      </div>
                   </div>

                   <form onSubmit={submitRegistration} className="space-y-6">
                      
                      {/* Standard Auto-filled Details */}
                      <div className="grid grid-cols-2 gap-4">
                         <div className="col-span-2 md:col-span-1 border border-slate-200 rounded-xl p-3 bg-slate-50">
                            <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                            <div className="font-medium text-slate-800 flex items-center justify-between">
                               {userInfo?.username || "Guest User"}
                               <ShieldCheck size={16} className="text-emerald-500" />
                            </div>
                         </div>
                         <div className="col-span-2 md:col-span-1 border border-slate-200 rounded-xl p-3 bg-slate-50">
                            <label className="text-xs font-bold text-slate-400 uppercase">Roll Number</label>
                            <div className="font-medium text-slate-800 flex items-center justify-between">
                               {userInfo?.rollNumber || "Not Linked"}
                               <ShieldCheck size={16} className="text-emerald-500" />
                            </div>
                         </div>
                      </div>

                      {/* Dynamic Form Schema Questions */}
                      {event.formSchemaId && event.formSchemaId.fields && event.formSchemaId.fields.length > 0 && (
                         <div className="mt-8 pt-6 border-t border-slate-100">
                            <h3 className="font-extrabold text-slate-900 text-xl mb-6">Additional Questions</h3>
                            <div className="space-y-5">
                               {event.formSchemaId.fields.map(field => (
                                  <div key={field.id} className="space-y-1">
                                     <label className="text-sm font-bold text-slate-700 block">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                     </label>
                                     
                                     {field.type === 'short_text' && (
                                        <input type="text" required={field.required} className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 text-sm transition-colors bg-white hover:bg-slate-50" onChange={(e) => handleDynamicChange(field.id, e.target.value)} />
                                     )}
                                     
                                     {field.type === 'long_text' && (
                                        <textarea required={field.required} rows="3" className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 text-sm transition-colors bg-white hover:bg-slate-50" onChange={(e) => handleDynamicChange(field.id, e.target.value)} />
                                     )}

                                     {field.type === 'dropdown' && (
                                        <select required={field.required} className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 text-sm bg-white" onChange={(e) => handleDynamicChange(field.id, e.target.value)}>
                                           <option value="">Select an option</option>
                                           {field.options.map(opt => (
                                              <option key={opt} value={opt}>{opt}</option>
                                           ))}
                                        </select>
                                     )}

                                     {field.type === 'file_upload' && (
                                        <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-brand-400 transition-colors cursor-pointer bg-slate-50">
                                           <input type="file" required={field.required} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" onChange={(e) => handleDynamicChange(field.id, "FILE_UPLOADED_MOCK")} />
                                        </div>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}

                      {error && (
                         <div className="bg-red-50 text-red-600 font-medium p-4 rounded-xl flex items-center gap-3 border border-red-200 mt-6">
                            <AlertCircle size={20} /> {error}
                         </div>
                      )}

                      <button 
                         type="submit" 
                         disabled={isFull || registering} 
                         className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl shrink-0 transition-all ${
                            isFull 
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none' 
                            : 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-[1.02] active:scale-[0.98]'
                         }`}
                      >
                         {registering ? 'Processing...' : isFull ? 'Event Sold Out' : 'Confirm Registration'}
                      </button>
                   </form>
                </div>
             </div>

             {/* Right Sidebar */}
             <div className="md:col-span-1 space-y-6">
                 {/* Detail Card */}
                 <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <h3 className="font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-2">Event Brief</h3>
                    
                    <div className="space-y-5">
                       <div className="flex items-start gap-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><MapPin size={24}/></div>
                          <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                             <p className="font-medium text-slate-800">{event.venue}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-start gap-4">
                          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0"><CalendarDays size={24}/></div>
                          <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Timing</p>
                             <p className="font-medium text-slate-800">{new Date(event.date || event.startTime).toLocaleDateString()}</p>
                             {event.startTime && (
                               <p className="text-sm text-slate-500 mt-1">
                                 {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </p>
                             )}
                          </div>
                       </div>

                       <div className="flex items-start gap-4">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0"><Users size={24}/></div>
                          <div className="w-full">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Capacity</p>
                             <p className="font-medium text-slate-800 flex justify-between">
                               <span>{event.seatsFilled || 0} / {event.capacity} Filled</span>
                               {isFull && <span className="text-red-500 font-bold text-sm">Full</span>}
                             </p>
                             <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                               <div className={`h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-brand-500'}`} style={{width: `${Math.min(((event.seatsFilled||0)/event.capacity)*100, 100)}%`}}></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Organizer Info */}
                 <div className="bg-slate-800 rounded-3xl p-6 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full mix-blend-multiply opacity-20 filter blur-xl"></div>
                    <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">Hosted By</p>
                    <p className="font-bold text-lg relative z-10">{event.organizer?.name || "College Administration"}</p>
                    <p className="text-xs text-brand-300 relative z-10 mt-1 tracking-widest uppercase">Verified Organizer</p>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
}
