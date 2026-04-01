import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Fingerprint, MonitorSmartphone, GraduationCap, ShieldCheck, Mail } from "lucide-react";

export default function Login() {
  const [activeTab, setActiveTab] = useState("student"); // "student" or "admin"
  const [isLogin, setIsLogin] = useState(true);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [istuNo, setIstuNo] = useState("");
  
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (sessionStorage.getItem("userInfo")) {
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      navigate(userInfo.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const { data } = await api.post("/auth/login", { username, password });
        sessionStorage.setItem("userInfo", JSON.stringify(data));
        navigate(data.role === "admin" ? "/admin" : "/dashboard");
      } else {
        const { data } = await api.post("/auth/register", { email, istuNo, username, password, role: activeTab });
        sessionStorage.setItem("userInfo", JSON.stringify(data));
        navigate(data.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An unknown error occurred.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none"></div>

      {/* Right Login Side */}
      <div className="w-full flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl p-8 transform transition-all hover:shadow-2xl hover:border-brand-200">
          
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">
            {isLogin ? "Enter your details to access your personalized feed." : "Setup your profile in seconds."}
          </p>

          {/* Unified Role Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8 relative border border-slate-200">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out border border-slate-200 ${activeTab === 'admin' ? 'translate-x-full' : 'translate-x-[2px]'}`}></div>
            
            <button 
              type="button"
              onClick={() => { setActiveTab("student"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition-colors relative z-10 ${activeTab === "student" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              <GraduationCap size={16} /> Student
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab("admin"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition-colors relative z-10 ${activeTab === "admin" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              <ShieldCheck size={16} /> Faculty/Admin
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input type="email" required className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-slate-50 focus:bg-white transition-colors" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@university.edu" />
                </div>
                {activeTab === "student" && (
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">University ID / Roll No</label>
                    <input type="text" required className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-slate-50 focus:bg-white transition-colors" value={istuNo} onChange={(e) => setIstuNo(e.target.value)} placeholder="e.g. 2024CS01" />
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <input
                type="text" required
                className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-slate-50 focus:bg-white transition-colors"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input
                type="password" required
                className="w-full border border-slate-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-slate-50 focus:bg-white transition-colors"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 shrink-0"
            >
              {isLogin ? "Authenticate" : "Create Profile"}
            </button>
          </form>

          {isLogin && (
             <></>
          )}

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-sm font-bold text-brand-600 hover:text-brand-500 hover:underline transition-all"
            >
              {isLogin ? "Need an account? Sign up here." : "Already registered? Login here."}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
