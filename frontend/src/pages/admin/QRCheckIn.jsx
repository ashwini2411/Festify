import { useState } from "react";
import api from "../../api";
import { Scan, CheckCircle, AlertOctagon, UserCheck } from "lucide-react";

export default function QRCheckIn() {
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success' | 'error', msg: string, student?: any }

  const handleScanSimulation = async (e) => {
    e.preventDefault();
    if(!ticketId) return;

    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post(`/registrations/checkin/${ticketId}`);
      setResult({ type: 'success', msg: data.message, student: data.student });
    } catch (err) {
      setResult({ type: 'error', msg: err.response?.data?.message || "Invalid or Unrecognized QR Code" });
    } finally {
      setLoading(false);
      setTicketId(""); // Reset for next scan
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cool scanning laser background effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-500 shadow-[0_0_20px_rgba(20,184,166,1)] animate-pulse z-0 hidden lg:block" style={{ top: '50%'}}></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-xl">
              <Scan className="text-brand-400" size={32} />
           </div>
           <h1 className="text-3xl font-extrabold text-white tracking-tight">QR Check-In Kiosk</h1>
           <p className="text-slate-400 font-medium mt-2">Aim scanner at student ticket or enter ID manually below.</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
           <form onSubmit={handleScanSimulation} className="space-y-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ticket ID</label>
                 <div className="relative">
                    <input 
                       type="text" 
                       value={ticketId}
                       onChange={e => setTicketId(e.target.value)}
                       placeholder="e.g. TKT-B4F2-10A9"
                       className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 flex pl-5 pr-24 text-white font-mono uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                       autoFocus
                       required
                    />
                    <button 
                       type="submit" 
                       disabled={loading}
                       className="absolute right-2 top-2 bottom-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg px-4 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                       {loading ? "..." : "Scan"}
                    </button>
                 </div>
              </div>
           </form>

           {/* Result Block */}
           <div className={`mt-8 transition-all duration-300 ${result ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              {result?.type === 'success' ? (
                 <div className="bg-emerald-900/40 border border-emerald-500/50 rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
                    <CheckCircle className="text-emerald-400 mx-auto mb-3" size={48} />
                    <h3 className="text-xl font-bold text-white mb-1">Check-In Successful</h3>
                    <p className="text-emerald-300 font-medium mb-4">{result.msg}</p>
                    
                    <div className="bg-emerald-950/50 rounded-xl p-4 flex items-center gap-4 text-left border border-emerald-800/50">
                       <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200"><UserCheck size={24}/></div>
                       <div>
                          <p className="text-white font-bold">{result.student?.name}</p>
                          <p className="text-emerald-400 text-sm font-mono">{result.student?.email}</p>
                       </div>
                    </div>
                 </div>
              ) : result?.type === 'error' ? (
                 <div className="bg-red-900/40 border border-red-500/50 rounded-2xl p-6 text-center animate-shake">
                    <AlertOctagon className="text-red-400 mx-auto mb-3 animate-pulse" size={48} />
                    <h3 className="text-xl font-bold text-white mb-1">Access Denied</h3>
                    <p className="text-red-300 font-medium">{result.msg}</p>
                 </div>
              ) : null}
           </div>
        </div>

        <div className="text-center mt-8">
           <button onClick={() => window.location.href='/admin'} className="text-slate-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-xs">← Back to Command Center</button>
        </div>
      </div>
    </div>
  );
}
