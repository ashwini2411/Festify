import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Users, Activity, Sparkles } from "lucide-react";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get("/events");
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Trending Ticker */}
      <div className="w-full overflow-hidden bg-brand-900 border-b border-brand-800 py-2 relative">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-10">
          <span className="text-brand-100 font-medium text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" /> 🔥 Trending: Hackathon 2026 spots filling fast!
          </span>
          <span className="text-brand-100 font-medium text-sm">� Register for events and showcase your participation!</span>
          <span className="text-brand-100 font-medium text-sm">🏆 Join the Campus Leaderboard & Earn Points</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-b from-brand-900 to-brand-800 py-20 px-4 mb-16 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Your Campus Events <br className="hidden md:block"/> Awaits You! 🎉
          </h1>
          <p className="text-lg md:text-xl text-brand-100 mb-12 max-w-2xl mx-auto font-light">
            Sports, Celebrations, Performances, Competitions & More! Join thousands of students for unforgettable moments.
          </p>

          {/* College Events Image */}
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-lg">
            <img 
              src="/images/college-events.png" 
              alt="Colorful College Events - Sports, Performances & Celebrations"
              className="w-full h-80 md:h-96 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <button 
            onClick={() => {
              const el = document.getElementById("eventsGrid");
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-white text-brand-900 font-bold rounded-full hover:bg-brand-50 hover:scale-105 transition-all shadow-xl shadow-brand-900/50 flex items-center gap-2 mx-auto"
          >
            Explore Events Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4" id="eventsGrid">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured Events</h2>
            <p className="text-slate-500 mt-1">Don't miss out on what's happening this week.</p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500 font-medium">Loading events gracefully...</div>
          ) : events.length > 0 ? (
            <>
              {events.slice(0, 5).map((event, i) => (
                <div 
                  key={event._id}
                  onClick={() => navigate(`/event/${event.slug || event._id}`)}
                  className={`cursor-pointer group relative overflow-hidden rounded-3xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-2xl transition-all duration-300 ${
                    i === 0 ? "md:col-span-2 md:row-span-2 bg-gradient-to-br from-brand-50 to-white" : // Large Featured Card
                    i === 1 || i === 2 ? "md:col-span-1 md:row-span-1" : // Standard Square
                    "md:col-span-1 md:row-span-1"
                  }`}
                >
                  <div className="p-6 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                          event.category === 'Technical' ? "bg-blue-100 text-blue-700" :
                          event.category === 'Cultural' ? "bg-purple-100 text-purple-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {event.category}
                        </span>
                        {event.seatsFilled >= event.capacity && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wide">Sold Out</span>
                        )}
                      </div>
                      <h3 className={`font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors ${i === 0 ? "text-3xl md:text-4xl" : "text-xl"}`}>
                        {event.title}
                      </h3>
                      <p className={`text-slate-600 line-clamp-2 ${i === 0 ? "text-lg mb-6" : "text-sm mb-4"}`}>
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <MapPin size={16} /> <span className="truncate">{event.venue}</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <CalendarDays size={16} /> <span>{new Date(event.date || event.startTime).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                            <Users size={16} /> {event.seatsFilled || 0} / {event.capacity}
                          </div>
                          <span className="text-brand-600 text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Details &rarr;
                          </span>
                       </div>
                    </div>
                  </div>
                  
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                </div>
              ))}
            </>
          ) : (
             <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50">
               <Activity size={48} className="mx-auto text-slate-400 mb-4" />
               <p className="text-slate-500 font-medium">No exciting events found right now. Check back soon!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
