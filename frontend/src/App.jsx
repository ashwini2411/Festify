import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EventBuilder from "./pages/admin/EventBuilder";
import EventDetails from "./pages/EventDetails";
import LostAndFound from "./pages/LostAndFound";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userInfoStr = sessionStorage.getItem("userInfo");
  if (!userInfoStr) {
    return <Navigate to="/" replace />;
  }
  
  if (adminOnly) {
    const userInfo = JSON.parse(userInfoStr);
    if (userInfo.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  }
  return children;
};

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {!isLoginPage && (
        <header className="bg-brand-600 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <span>Festify</span>
              <span className="text-xl">🎓</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link to="/dashboard" className="hover:text-brand-100 transition-colors font-medium">Events Feed</Link>
              <Link to="/lost" className="hover:text-brand-100 transition-colors font-medium">Lost & Found</Link>
              {sessionStorage.getItem("userInfo") && JSON.parse(sessionStorage.getItem("userInfo")).role === "admin" && (
                <>
                   <Link to="/admin" className="text-orange-200 hover:text-white transition-colors font-bold">Admin Panel</Link>
                </>
              )}
              
              <button 
                onClick={() => { sessionStorage.removeItem("userInfo"); window.location.href="/"; }}
                className="text-sm font-semibold bg-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-900 transition"
              >
                Logout
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 ${isLoginPage ? "flex justify-center items-center py-0" : "py-8"}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/lost" element={<ProtectedRoute><LostAndFound /></ProtectedRoute>} />
          <Route path="/event/:slug" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/create-event" element={<ProtectedRoute adminOnly={true}><EventBuilder /></ProtectedRoute>} />
        </Routes>
      </main>


    </div>
  );
}

export default App;
