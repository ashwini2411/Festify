import { useEffect, useState } from "react";
import api from "../api";
import { Search, MapPin, CalendarDays, Camera, Info } from "lucide-react";

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    itemName: "", description: "", location: "", dateLost: "", imageUrl: ""
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/lost-items");
      setItems(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError("Failed to load lost items");
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, dateLost: new Date(formData.dateLost).toISOString() };
      await api.post("/lost-items", payload);
      setShowModal(false);
      setFormData({ itemName: "", description: "", location: "", dateLost: "", imageUrl: "" });
      fetchItems();
    } catch (err) {
       alert("Failed to report item.");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 px-4 pt-8">
      <div className="max-w-6xl mx-auto">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
            <div>
               <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  <Search className="text-brand-600" /> Virtual Lost & Found
               </h1>
               <p className="mt-2 text-slate-500 font-medium">Lost something during the fest? Check here or report it.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="mt-6 md:mt-0 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:scale-105 flex items-center gap-2">
               <Camera size={18} /> Report Lost Item
            </button>
         </div>

         {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-8 font-bold text-center border border-red-200">{error}</div>}

         {loading ? (
             <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div></div>
         ) : items.length === 0 ? (
             <div className="bg-white py-24 rounded-3xl border border-dashed border-slate-300 text-center shadow-sm">
                 <Info className="mx-auto text-slate-300 mb-4" size={48} />
                 <h3 className="text-xl font-bold text-slate-900 mb-2">No Items Reported</h3>
                 <p className="text-slate-500 max-w-sm mx-auto">Luckily, nothing has been reported lost recently!</p>
             </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {items.map(item => (
                  <div key={item._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                     {item.imageUrl ? (
                        <div className="h-48 bg-slate-100 overflow-hidden relative">
                           <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                     ) : (
                        <div className="h-48 bg-slate-100 flex items-center justify-center">
                           <Camera size={48} className="text-slate-300" />
                        </div>
                     )}
                     
                     <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{item.itemName}</h3>
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${item.status === 'lost' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {item.status}
                           </span>
                        </div>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4">{item.description}</p>
                        
                        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                           <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                              <MapPin size={16} className="text-slate-400" /> {item.location}
                           </div>
                           <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                              <CalendarDays size={16} className="text-slate-400" /> {new Date(item.dateLost).toLocaleDateString()}
                           </div>
                        </div>

                        <button className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition-colors">
                           I Found This
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {showModal && (
         <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
               <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Report Lost Item</h2>
               <form onSubmit={handleReport} className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Item Name</label>
                     <input type="text" required value={formData.itemName} onChange={e=>setFormData({...formData, itemName: e.target.value})} className="w-full border border-slate-300 rounded-xl py-2 px-3 focus:ring-2 focus:ring-brand-500" placeholder="e.g. Blue Hydroflask" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                     <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-xl py-2 px-3 focus:ring-2 focus:ring-brand-500" placeholder="Any distinguishing features?" rows="2"></textarea>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Expected Location Lost</label>
                     <input type="text" required value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full border border-slate-300 rounded-xl py-2 px-3 focus:ring-2 focus:ring-brand-500" placeholder="e.g. CS Block 3rd Floor" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date Lost</label>
                     <input type="date" required value={formData.dateLost} onChange={e=>setFormData({...formData, dateLost: e.target.value})} className="w-full border border-slate-300 rounded-xl py-2 px-3 focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Image URL (Optional)</label>
                     <input type="url" value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} className="w-full border border-slate-300 rounded-xl py-2 px-3 focus:ring-2 focus:ring-brand-500" placeholder="https://..." />
                  </div>
                  
                  <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                     <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                     <button type="submit" className="flex-1 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-500 transition-all">Report</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
