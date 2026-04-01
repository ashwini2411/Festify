import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Download, Users, Ticket, BarChart3, Building2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/analytics");
        setStats(data);
      } catch (err) {
        setError("You are not authorized to view the admin dashboard.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  const handleExportCSV = () => {
      // Mock CSV Export
      const csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Department\n1,John Doe,john@test.com,CS\n2,Jane Smith,jane@test.com,Arts";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "festify_registrations.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (loading) return (
     <div className="flex justify-center items-center py-32">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
     </div>
  );
  
  if (error) return <div className="text-center py-10 text-xl text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
             <BarChart3 className="text-brand-600" /> Executive Analytics View
          </h1>
          <p className="mt-2 text-slate-500 font-medium">Real-time overview of the Festify platform traffic and health.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
           <button 
             onClick={handleExportCSV} 
             className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors border border-slate-300"
           >
             <Download size={18} /> Export Master CSV
           </button>
           <button 
             onClick={() => navigate('/admin/create-event')} 
             className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
           >
             <PlusCircle size={18} /> Launch New Event
           </button>
        </div>
      </div>

      {/* High Impact Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-brand-100 group-hover:text-brand-50 transition-colors">
             <Ticket size={80} />
          </div>
          <div className="relative z-10">
             <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">The Live Counter (Registrations)</p>
             <p className="text-6xl font-black text-slate-900">{stats.totalRegistrations || 0}</p>
             <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                ↑ Trending Up
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-blue-50 group-hover:text-blue-100 transition-colors">
             <Users size={80} />
          </div>
          <div className="relative z-10">
             <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Total Student Base</p>
             <p className="text-6xl font-black text-slate-900">{stats.totalUsers || 0}</p>
             <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Active Ecosystem
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-purple-50 group-hover:text-purple-100 transition-colors">
             <Building2 size={80} />
          </div>
          <div className="relative z-10">
             <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Events Originated</p>
             <p className="text-6xl font-black text-slate-900">{stats.totalEvents || 0}</p>
             <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                Platform Adoption
             </div>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Department Breakdown */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Department Interest Breakdown</h3>
            <div className="h-80 w-full flex items-center justify-center">
               {stats.departmentBreakdown && stats.departmentBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.departmentBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="_id"
                      >
                        {stats.departmentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
               ) : (
                  <p className="text-slate-400 font-medium">Awaiting sufficient department data...</p>
               )}
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
               {stats.departmentBreakdown?.map((entry, index) => (
                  <div key={entry._id} className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                     <span className="text-sm font-medium text-slate-600">{entry._id}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Registration Velocity */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between flex-wrap gap-2 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Registration Velocity</h3>
              <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg">Last 7 Days</span>
            </div>
            <div className="h-80 w-full">
               {stats.registrationVelocity && stats.registrationVelocity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.registrationVelocity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                      <RechartsTooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                         labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                      />
                      <Line 
                         type="monotone" 
                         dataKey="registrations" 
                         stroke="#0d9488" 
                         strokeWidth={4}
                         dot={{ fill: '#0d9488', strokeWidth: 2, r: 6, stroke: '#fff' }} 
                         activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="h-full flex items-center justify-center">
                     <p className="text-slate-400 font-medium">Awaiting sufficient timeline data...</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
