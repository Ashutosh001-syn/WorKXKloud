import { Bell, UserCircle2, LogOut, User, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../utils/auth";
import logo from '../../assets/Logo.png';

const profileImage = "";
const MotionDiv = motion.div;

function HeaderIconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-100 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function AppHeader() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('user_profile');
      setUserData(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 bg-[#0d2646] md:bg-[#0d2646]">
      <div className="px-5 py-3 md:py-2.5 text-white">
        
        {/* Top Row: Navigation & Actions */}
        <div className="flex items-center justify-between relative">
          
          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center z-10">
            <button
              type="button"
              onClick={() => document.dispatchEvent(new Event('open-sidebar'))}
              className="rounded-xl bg-white/5 p-2 transition hover:bg-white/10 text-white flex-shrink-0"
              aria-label="Open sidebar"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Desktop Greeting (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-3 relative z-10">
            <h1 className="text-[2.05rem] font-semibold tracking-tight text-white truncate max-w-[70vw]">
              Hello, {userData?.firstName || 'Admin'} <span className="text-[1rem] font-medium text-slate-400 whitespace-nowrap ml-1">({userData?.role || 'Admin'})</span>
            </h1>
          </div>

          {/* Center: Logo (Mobile Only) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
            <img src={logo} alt="XPM.ai logo" className="h-[22px] w-auto object-contain" />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 relative z-10" ref={dropdownRef}>
            <HeaderIconButton label="Notifications">
              <Bell size={18} strokeWidth={2} />
            </HeaderIconButton>

            <HeaderIconButton
              label="Profile"
              onClick={() => setOpen((prev) => !prev)}
            >
              {userData?.image ? (
                <img src={userData.image} alt="Profile" className="h-[28px] w-[28px] rounded-full object-cover ring-2 ring-white/10" />
              ) : (
                <UserCircle2 size={20} strokeWidth={2} />
              )}
            </HeaderIconButton>

            <AnimatePresence>
              {open && (
                <MotionDiv
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-12 w-64 rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden origin-top-right z-50"
                >
                  {/* USER INFO */}
                  <div className="flex flex-col items-center justify-center px-6 py-6 bg-slate-50/50 border-b border-slate-100">
                    {userData?.image ? (
                      <img
                        src={userData.image}
                        alt="profile"
                        className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm border-2 border-white">
                        <UserCircle2 size={32} />
                      </div>
                    )}
                    <p className="mt-3 text-[15px] font-bold text-slate-800 tracking-tight">
                      {userData ? `${userData.firstName} ${userData.lastName}` : 'Admin'}
                    </p>
                    <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                      {userData?.email || 'admin@email.com'}
                    </p>
                    {userData?.role && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-0.5 text-[11px] font-bold text-blue-600 tracking-wide uppercase">
                        {userData.role}
                      </span>
                    )}
                  </div>

                  {/* PROFILE */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <User size={16} strokeWidth={2.5} />
                      My Profile
                    </button>

                    {/* LOGOUT */}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-1"
                    >
                      <LogOut size={16} strokeWidth={2.5} />
                      Logout
                    </button>
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Greeting Hero */}
        <div className="md:hidden mt-6 mb-2 flex flex-col items-start px-1">
          <p className="text-[10px] font-bold tracking-[0.15em] text-blue-200/80 uppercase mb-1.5">Welcome back</p>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-black tracking-tight text-white leading-none">
              {userData?.firstName || 'Admin'}
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/5 text-[10px] font-bold tracking-wide text-white backdrop-blur-sm shadow-sm">
              {userData?.role || 'Admin'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}

export default AppHeader;
