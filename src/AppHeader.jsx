import { Bell, UserCircle2, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 bg-[#0d2646]">
      <div className="flex items-center justify-between px-4 py-2.5 text-white">

        <h1 className="text-[2.05rem] font-semibold tracking-tight text-white">
          Hello, {userData?.firstName || 'Admin'} <span className="text-[1rem] font-medium text-slate-400">({userData?.role || 'Admin'})</span>
        </h1>

        <div className="flex items-center gap-2 relative" ref={dropdownRef}>

          <HeaderIconButton label="Notifications">
            <Bell size={16} strokeWidth={1.9} />
          </HeaderIconButton>

          <HeaderIconButton
            label="Profile"
            onClick={() => setOpen((prev) => !prev)}
          >
            {userData?.image ? (
              <img src={userData.image} alt="Profile" className="h-[25px] w-[25px] rounded-full object-cover" />
            ) : (
              <UserCircle2 size={18} strokeWidth={1.9} />
            )}
          </HeaderIconButton>

          <AnimatePresence>
            {open && (
              <MotionDiv
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-10 w-52 rounded-md border border-slate-200 bg-white shadow-md overflow-hidden origin-top-right"
              >

                {/* USER INFO */}
                <div className="flex flex-col items-center justify-center px-4 py-4 border-b border-slate-100">

                  {userData?.image ? (
                    <img
                      src={userData.image}
                      alt="profile"
                      className="h-14 w-14 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 shadow-sm">
                      <UserCircle2 size={32} className="text-slate-400" />
                    </div>
                  )}

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {userData ? `${userData.firstName} ${userData.lastName}` : 'Admin'}
                  </p>

                  <p className="text-xs text-slate-500">
                    {userData?.email || 'admin@email.com'}
                  </p>
                </div>

                {/* PROFILE */}
                <button
                  onClick={() => {
                    navigate('/profile');
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <User size={16} />
                  Profile
                </button>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>

              </MotionDiv>
            )}
          </AnimatePresence>

        </div>
      </div>
    </header>
  );
}

export default AppHeader;
