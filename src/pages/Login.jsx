import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { gsap, Expo, Quad } from "gsap";
import { signIn } from "../utils/auth";
import { API_ENDPOINTS } from "../config/api";
import login from "../assets/Login.png";
import logo from "../assets/Logo.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const armL = useRef(null);
  const armR = useRef(null);
  const eyeL = useRef(null);
  const eyeR = useRef(null);
  const eyeClosedL = useRef(null);
  const eyeClosedR = useRef(null);
  const nose = useRef(null);
  const mouth = useRef(null);
  const blushL = useRef(null);
  const blushR = useRef(null);

  const isCovered = useRef(false);

  useEffect(() => {
    // Retract arms off-screen to their respective sides on mount
    gsap.set(armL.current, { x: -180, rotation: 0 });
    gsap.set(armR.current, { x: 180, rotation: 0 });
    // Hide closed eyes initially
    gsap.set([eyeClosedL.current, eyeClosedR.current], { opacity: 0 });

    // Infinite organic idle blink loop
    const blinkTimeline = () => {
      if (isCovered.current) return;
      gsap.timeline()
        .to([eyeL.current, eyeR.current], { duration: 0.08, opacity: 0 })
        .to([eyeClosedL.current, eyeClosedR.current], { duration: 0.08, opacity: 1 }, "<")
        .to([eyeL.current, eyeR.current], { duration: 0.08, opacity: 1, delay: 0.12 })
        .to([eyeClosedL.current, eyeClosedR.current], { duration: 0.08, opacity: 0 }, "<");
    };

    const blinkInterval = setInterval(() => {
      if (!isCovered.current) {
        blinkTimeline();
      }
    }, 5000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (isPasswordFocused) {
      if (showPassword) {
        uncoverEyes();
      } else {
        coverEyes();
      }
    } else {
      uncoverEyes();
    }
  }, [isPasswordFocused, showPassword]);

  const handleEmailInput = (e) => {
    const val = e.target.value;
    setEmail(val);
    const length = val.length;
    const targetX = length === 0 ? -10 : Math.min(-10 + (length * 1.1), 16);
    const targetY = 3;
    gsap.to([eyeL.current, eyeR.current, eyeClosedL.current, eyeClosedR.current], { duration: 0.45, x: targetX, y: targetY, ease: "power2.out" });
    gsap.to(nose.current,  { duration: 0.45, x: targetX * 0.8, y: targetY * 1.1, ease: "power2.out" });
    gsap.to(mouth.current, { duration: 0.45, x: targetX * 0.5, y: targetY * 1.2, ease: "power2.out" });
    gsap.to([blushL.current, blushR.current], { duration: 0.45, x: targetX * 0.7, y: targetY, ease: "power2.out" });
  };

  const handleEmailFocus = () => {
    const targetX = email.length === 0 ? -10 : Math.min(-10 + (email.length * 1.1), 16);
    const targetY = 3;
    gsap.to([eyeL.current, eyeR.current, eyeClosedL.current, eyeClosedR.current], { duration: 0.45, x: targetX, y: targetY, ease: "power2.out" });
    gsap.to(nose.current,  { duration: 0.45, x: targetX * 0.8, y: targetY * 1.1, ease: "power2.out" });
    gsap.to(mouth.current, { duration: 0.45, x: targetX * 0.5, y: targetY * 1.2, ease: "power2.out" });
    gsap.to([blushL.current, blushR.current], { duration: 0.45, x: targetX * 0.7, y: targetY, ease: "power2.out" });
  };

  const handleEmailBlur = () => {
    gsap.to([eyeL.current, eyeR.current, eyeClosedL.current, eyeClosedR.current, nose.current, mouth.current, blushL.current, blushR.current], {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: "power2.out"
    });
  };

  const coverEyes = () => {
    if (isCovered.current) return;
    isCovered.current = true;
    gsap.to(armL.current, { duration: 0.45, x: 0, rotation: 1.5, ease: "back.out(1.1)" });
    gsap.to(armR.current, { duration: 0.45, x: 0, rotation: -1.5, ease: "back.out(1.1)", delay: 0.06 });
    
    gsap.to(eyeL.current, { duration: 0.1, opacity: 0, delay: 0.22 });
    gsap.to(eyeClosedL.current, { duration: 0.1, opacity: 1, delay: 0.22 });

    gsap.to(eyeR.current, { duration: 0.1, opacity: 0, delay: 0.28 });
    gsap.to(eyeClosedR.current, { duration: 0.1, opacity: 1, delay: 0.28 });

    gsap.to([blushL.current, blushR.current], { duration: 0.45, scale: 1.4, opacity: 0.8, transformOrigin: "center center", ease: "power2.out" });
  };

  const uncoverEyes = () => {
    if (!isCovered.current) return;
    isCovered.current = false;
    gsap.to(armL.current, { duration: 0.45, x: -180, rotation: 0, ease: "power2.inOut" });
    gsap.to(armR.current, { duration: 0.45, x: 180, rotation: 0, ease: "power2.inOut", delay: 0.06 });
    
    gsap.to(eyeL.current, { duration: 0.1, opacity: 1, delay: 0.05 });
    gsap.to(eyeClosedL.current, { duration: 0.1, opacity: 0, delay: 0.05 });

    gsap.to(eyeR.current, { duration: 0.1, opacity: 1, delay: 0.11 });
    gsap.to(eyeClosedR.current, { duration: 0.1, opacity: 0, delay: 0.11 });

    gsap.to([blushL.current, blushR.current], { duration: 0.45, scale: 1, opacity: 0.45, transformOrigin: "center center", ease: "power2.out" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        setError(data?.message || "Login failed. Please try again.");
        return;
      }
      const fullName = (data.user?.name || "").trim();
      const [firstName = "User", ...lastParts] = fullName.split(" ");
      signIn({ token: data.token, user: data.user });
      localStorage.setItem("user_profile", JSON.stringify({
        firstName,
        lastName: lastParts.join(" "),
        email: data.user?.email || "",
        role: data.user?.role || "User",
        phone: data.user?.mobile || "",
        image: data.user?.image || "",
      }));
      window.location.href = "/";
    } catch {
      setError("Unable to reach server. Please check your connection.");
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans">
      <div className="relative flex w-full flex-col items-center justify-center bg-[#f3f3f3] px-6 py-10 md:w-[60%] md:px-10 md:py-0">
        <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10">
          <img src={logo} alt="logo" className="h-8 md:h-12 w-auto" />
        </div>
        <img src={login} alt="illustration" className="w-[85%] max-w-md" />
        <div className="text-center mt-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Work Better, Together</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">Manage projects effortlessly.</p>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center bg-[#062B4F] py-10 md:w-[40%] md:py-0">
        <form
          onSubmit={handleSubmit}
          className="relative w-[90%] rounded-2xl bg-white p-6 shadow-2xl sm:w-[420px] md:absolute md:top-1/2 md:left-0 md:-translate-y-1/2 md:-translate-x-1/4 md:rounded-3xl md:p-8"
        >
          <div className="mx-auto mb-4 w-32 h-32 relative overflow-hidden rounded-full border-2 border-[#3A5E77] shadow-md hover:scale-105 transition-transform duration-300 ease-out">
            <svg
              viewBox="0 0 200 200"
              className="absolute top-0 left-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <clipPath id="yeti-clip">
                  <circle cx="100" cy="100" r="100" />
                </clipPath>
                <filter id="arm-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#3a5e77" floodOpacity="0.18" />
                </filter>
              </defs>
              <circle cx="100" cy="100" r="100" fill="#a9ddf3" />
              <path
                fill="#ffffff"
                stroke="#3a5e77"
                strokeWidth="2.5"
                strokeLinecap="round"
                d="M193.3,135.9c-5.8-8.4-15.5-13.9-26.5-13.9H151V72
                   c0-27.6-22.4-50-50-50S51,44.4,51,72v50H32.1
                   c-10.6,0-20,5.1-25.8,13l0,78h187L193.3,135.9z"
              />

              <circle ref={blushL} cx="78" cy="85" r="5" fill="#ffccd5" opacity="0.45" />
              <circle ref={blushR} cx="122" cy="85" r="5" fill="#ffccd5" opacity="0.45" />

              <g ref={eyeL}><circle cx="85.5" cy="78.5" r="3.5" fill="#3a5e77" /></g>
              <g ref={eyeR}><circle cx="114.5" cy="78.5" r="3.5" fill="#3a5e77" /></g>

              <path ref={eyeClosedL} d="M82,78.5 L89,78.5" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" />
              <path ref={eyeClosedR} d="M111,78.5 L118,78.5" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" />

              <path ref={nose} fill="#3a5e77"
                d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3
                   c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z"
              />

              <path ref={mouth} fill="#617E92"
                d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5
                   c-0.7-0.3-0.9-1.2-0.6-1.8c0.2-0.5,0.7-0.7,1.2-0.7
                   c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3
                   c0.2-0.1,0.4-0.2,0.6-0.2c0.5,0,1,0.3,1.2,0.7
                   c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5
                   c-1.5,0.2-2.7,0.2-3,0.2z"
              />

              <g clipPath="url(#yeti-clip)" filter="url(#arm-shadow)">
                <g ref={armL}>
                  <path
                    fill="#ffffff"
                    stroke="#3a5e77"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    d="
                      M -5,130
                      L -5,108
                      C 10,106  35,103  60,100
                      C 72,98   82,95   90,91
                      C 96,88  100,86  106,87
                      C 113,88  118,92  119,98
                      C 120,104 116,110 108,113
                      C 96,117  76,120  52,123
                      C 32,126  10,128  -5,130
                      Z
                    "
                  />
                  <path fill="none" stroke="#3a5e77" strokeWidth="1.5" strokeLinecap="round"
                    d="M104,87 Q112,82 118,86" />
                  <path fill="none" stroke="#3a5e77" strokeWidth="1.5" strokeLinecap="round"
                    d="M111,93 Q120,90 122,95" />
                  <path fill="none" stroke="#3a5e77" strokeWidth="1.5" strokeLinecap="round"
                    d="M112,102 Q121,101 121,107" />
                </g>

                <g ref={armR}>
                  <path
                    fill="#ffffff"
                    stroke="#3a5e77"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    d="
                      M 205,130
                      L 205,108
                      C 190,106 165,103  140,100
                      C 128,98  118,95   110,91
                      C 104,88  100,86   94,87
                      C  87,88   82,92   81,98
                      C  80,104  84,110  92,113
                      C 104,117 124,120  148,123
                      C 168,126 190,128  205,130
                      Z
                    "
                  />
                  <path fill="none" stroke="#3a5e77" strokeWidth="1.5" strokeLinecap="round"
                    d="M96,87 Q88,82 82,86" />
                  <path fill="none" stroke="#3a5e77" strokeWidth="1.5" strokeLinecap="round"
                    d="M89,93 Q80,90 78,95" />
                  <path fill="none" stroke="#3a5e77" strokeWidth="1.5" strokeLinecap="round"
                    d="M88,102 Q79,101 79,107" />
                </g>

              </g>
            </svg>
          </div>

          <h2 className="text-center text-base md:text-lg font-semibold text-gray-800">Sign In</h2>
          <h3 className="text-center text-xl md:text-2xl font-bold text-[#1C2B4A] mt-1">Welcome</h3>

          <div className="mt-6">
            <label className="text-sm text-gray-600">Enter your email address</label>
            <input
              type="text"
              value={email}
              onChange={handleEmailInput}
              onFocus={(e) => {
                e.target.parentElement.classList.add("focusWithText");
                handleEmailFocus();
              }}
              onBlur={(e) => {
                if (email === "") {
                  e.target.parentElement.classList.remove("focusWithText");
                }
                handleEmailBlur();
              }}
              placeholder="Username or email address"
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm text-gray-600">Enter your Password</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-sm text-[#3A5E77] hover:underline font-medium">Forgot Password?</Link>
            </div>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

          <button className="w-full mt-6 bg-[#062B4F] text-white py-3 rounded-lg shadow-md hover:bg-[#041f39] transition">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;