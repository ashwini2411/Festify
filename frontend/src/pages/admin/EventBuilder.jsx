import { useState } from "react";
import api from "../../api";
import { PlusCircle, Sparkles, AlertTriangle, CheckCircle, Copy, GripVertical, Trash2 } from "lucide-react";

export default function EventBuilder() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successEvent, setSuccessEvent] = useState(null);

  // Core Event Details
  const [eventData, setEventData] = useState({
    title: "", description: "", venue: "", capacity: 100, category: "Technical", 
    date: "", startTime: "", endTime: "", targetAudience: []
  });

  // Dynamic Form Schema Builder
  const [formFields, setFormFields] = useState([]);
  const [formLogic, setFormLogic] = useState({ registrationLimit: "", deadline: "" });

  const handleAddField = (type) => {
    setFormFields([...formFields, {
      id: `field_${Date.now()}`,
      type,
      label: type === 'short_text' ? "New Text Question" : type === 'dropdown' ? "Select an Option" : "Upload Document",
      required: false,
      options: type === 'dropdown' ? ["Option 1", "Option 2"] : []
    }]);
  };

  const updateField = (id, key, value) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => setFormFields(formFields.filter(f => f.id !== id));

  const handleUpdateOptions = (id, optionsString) => {
    const options = optionsString.split(",").map(s => s.trim()).filter(s => s);
    updateField(id, "options", options);
  };

  const submitEvent = async () => {
    setLoading(true);
    setError("");
    try {
      // Validate Smart Scheduling
      const payload = {
         ...eventData,
         date: new Date(eventData.date).toISOString(),
         startTime: new Date(`${eventData.date}T${eventData.startTime}`).toISOString(),
         endTime: new Date(`${eventData.date}T${eventData.endTime}`).toISOString(),
         formFields,
         registrationLimit: formLogic.registrationLimit || null,
         deadline: formLogic.deadline ? new Date(formLogic.deadline).toISOString() : null
      };
      
      const { data } = await api.post("/events", payload);
      setSuccessEvent(data);
      setStep(3); // Success Screen
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event. Please check required fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress header */}
        <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
           {['Event Basics', 'Form Builder', 'Launch'].map((lbl, idx) => (
             <div key={lbl} className="flex items-center gap-2">
               <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-sm ${step > idx ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                 {step > idx ? <CheckCircle size={16}/> : idx + 1}
               </div>
               <span className={`font-semibold hidden sm:block ${step >= idx + 1 ? 'text-slate-900' : 'text-slate-400'}`}>{lbl}</span>
               {idx !== 2 && <div className="w-8 sm:w-16 h-1 bg-slate-100 rounded"></div>}
             </div>
           ))}
        </div>

        {error && (
           <div className="mb-6 bg-red-50 text-red-600 font-medium p-4 rounded-xl flex items-center gap-3 border border-red-200 shadow-sm">
              <AlertTriangle size={20} /> {error}
           </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 relative overflow-hidden">
          
          {step === 1 && (
            <div className="space-y-6">
               <div className="mb-8">
                 <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Core Event Details</h2>
                 <p className="text-slate-500 font-medium mt-1">First, let's configure what the event is and when it happens.</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Title</label>
                   <input type="text" className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 transition-colors" placeholder="e.g. CodeFest 2026" value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} required/>
                 </div>
                 <div className="md:col-span-2 space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                   <textarea rows="3" className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 transition-colors" placeholder="Sell your event!" value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})} required></textarea>
                 </div>

                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Venue / Location</label>
                   <input type="text" className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 transition-colors" placeholder="e.g. Main Auditorium" value={eventData.venue} onChange={e => setEventData({...eventData, venue: e.target.value})} required/>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Capacity</label>
                   <input type="number" min="1" className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 transition-colors" value={eventData.capacity} onChange={e => setEventData({...eventData, capacity: e.target.value})} required/>
                 </div>

                 <div className="md:col-span-2 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 mb-4"><Sparkles size={18}/> Smart Scheduling Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-800 uppercase tracking-wider">Date</label>
                        <input type="date" className="w-full border border-amber-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-amber-500" value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} required/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-800 uppercase tracking-wider">Start Time</label>
                        <input type="time" className="w-full border border-amber-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-amber-500" value={eventData.startTime} onChange={e => setEventData({...eventData, startTime: e.target.value})} required/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-800 uppercase tracking-wider">End Time</label>
                        <input type="time" className="w-full border border-amber-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-amber-500" value={eventData.endTime} onChange={e => setEventData({...eventData, endTime: e.target.value})} required/>
                      </div>
                    </div>
                 </div>
               </div>

               <button onClick={() => setStep(2)} className="mt-8 float-right px-8 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-500 transition-all flex items-center gap-2">
                 Next: Build Form &rarr;
               </button>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6">
                <div className="mb-8">
                 <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dynamic Form Builder</h2>
                 <p className="text-slate-500 font-medium mt-1">Design the registration form. Standard details (Name, Dept) are auto-filled magic!</p>
               </div>

               {/* Field Toolbox */}
               <div className="flex gap-4 p-4 bg-slate-100 rounded-2xl border border-slate-200 mb-8 overflow-x-auto">
                 <span className="font-bold text-slate-500 whitespace-nowrap pt-2">Add Content:</span>
                 <button onClick={() => handleAddField('short_text')} className="px-4 py-2 bg-white text-brand-700 font-bold shadow-sm border border-slate-200 rounded-lg whitespace-nowrap hover:border-brand-300">+ Short Text</button>
                 <button onClick={() => handleAddField('dropdown')} className="px-4 py-2 bg-white text-purple-700 font-bold shadow-sm border border-slate-200 rounded-lg whitespace-nowrap hover:border-purple-300">+ Dropdown</button>
                 <button onClick={() => handleAddField('file_upload')} className="px-4 py-2 bg-white text-orange-700 font-bold shadow-sm border border-slate-200 rounded-lg whitespace-nowrap hover:border-orange-300">+ File Upload</button>
               </div>

               {/* Form Canvas */}
               <div className="space-y-4 min-h-[200px] p-6 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
                  {formFields.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-medium">Form is empty. Add fields from the toolbox above.</div>
                  ) : formFields.map(field => (
                    <div key={field.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 group">
                      <div className="text-slate-300 cursor-move pt-2"><GripVertical /></div>
                      <div className="flex-1 space-y-4">
                         <div className="flex justify-between items-start">
                           <input type="text" className="font-bold text-slate-800 text-lg border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none bg-transparent w-full" value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} />
                           <button onClick={() => removeField(field.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                         </div>
                         <div className="flex items-center gap-4 text-sm mt-2 font-medium text-slate-600">
                           <span className="px-2 py-1 bg-slate-100 rounded uppercase text-xs tracking-wider">{field.type.replace('_', ' ')}</span>
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} className="w-4 h-4 text-brand-600 rounded" />
                             Required
                           </label>
                         </div>
                         {field.type === 'dropdown' && (
                           <input type="text" className="w-full text-sm border-b border-slate-300 py-1 focus:outline-none focus:border-purple-500" placeholder="Comma separated options (e.g. Small, Medium, Large)" value={field.options.join(", ")} onChange={e => handleUpdateOptions(field.id, e.target.value)} />
                         )}
                      </div>
                    </div>
                  ))}
               </div>

               {/* Logic Settings */}
               <div className="grid grid-cols-2 gap-6 mt-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                  <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Limit (Optional)</label>
                   <input type="number" placeholder="Close early after N entries" className="w-full border border-slate-300 rounded-xl py-2 px-4 focus:ring-2 focus:ring-brand-500" value={formLogic.registrationLimit} onChange={e => setFormLogic({...formLogic, registrationLimit: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hard Deadline</label>
                   <input type="datetime-local" className="w-full border border-slate-300 rounded-xl py-2 px-4 focus:ring-2 focus:ring-brand-500" value={formLogic.deadline} onChange={e => setFormLogic({...formLogic, deadline: e.target.value})} />
                 </div>
               </div>

               <div className="mt-8 flex justify-between">
                 <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Back</button>
                 <button onClick={submitEvent} disabled={loading} className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-500 transition-all flex items-center gap-2">
                   {loading ? "Launching Event..." : "Publish Event 🚀"}
                 </button>
               </div>
             </div>
          )}

          {step === 3 && successEvent && (
            <div className="text-center py-12 space-y-6">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle size={48} />
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900">Event Launched!</h2>
              <p className="text-lg text-slate-600 max-w-lg mx-auto font-medium">Your event <span className="text-brand-600">"{successEvent.title}"</span> is now live. Students can begin registering immediately.</p>
              
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl inline-block text-left w-full max-w-md mx-auto shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Shareable Link</label>
                <div className="flex bg-white border border-slate-300 rounded-xl overflow-hidden">
                   <input type="text" readOnly className="w-full py-3 px-4 outline-none text-slate-600 font-medium" value={`https://festify.campus/event/${successEvent.slug}`} />
                   <button onClick={() => navigator.clipboard.writeText(`https://festify.campus/event/${successEvent.slug}`)} className="px-4 bg-brand-50 border-l border-brand-200 text-brand-700 hover:bg-brand-100 font-bold transition-colors flex items-center gap-2">
                     <Copy size={16}/> Copy
                   </button>
                </div>
              </div>

              <div className="pt-8">
                <button onClick={() => window.location.href='/admin'} className="px-8 py-3 text-brand-600 font-extrabold hover:underline">Return to Dashboard</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
