import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { STATIC_CREDENTIALS } from "./auth";
import login from "./assets/Login.png";
import logo from "./assets/Logo.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail === STATIC_CREDENTIALS.email &&
      password === STATIC_CREDENTIALS.password
    ) {
      // ✅ STORE TOKEN (must match isAuthenticated)
      localStorage.setItem("token", "admin_token");

      setError("");

      // ✅ FORCE RELOAD → ensures ProtectedLayout works
      window.location.href = "/";
      return;
    }

    setError("Use admin@gmail.com and admin@123 to sign in.");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">

      {/* LEFT SIDE */}
      <div className="relative flex w-full flex-col items-center justify-center bg-[#f3f3f3] px-6 py-10 md:w-[60%] md:px-10 md:py-0">

        <div className="absolute top-4 left-4 md:top-6 md:left-8">
          <img src={logo} alt="logo" className="h-25 md:h-18" />
        </div>

        <img
          src={login}
          alt="illustration"
          className="w-[85%] sm:w-[70%] md:w-[75%] max-w-md"
        />

        <div className="text-center mt-6 md:mt-8 max-w-md px-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Work Better, Together
          </h2>
          <p className="text-gray-500 mt-2 md:mt-3 text-sm md:text-base leading-relaxed">
            Manage your projects effortlessly, track every task in real time,
            and keep your entire workflow organized.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex w-full items-center justify-center bg-[#062B4F] py-10 md:w-[40%] md:py-0">

        <form
          onSubmit={handleSubmit}
          className="w-[90%] rounded-2xl bg-white p-6 shadow-2xl sm:w-[420px] md:absolute md:top-1/2 md:left-0 md:-translate-y-1/2 md:-translate-x-1/4 md:rounded-3xl md:p-8"
        >

          <h2 className="text-center text-base md:text-lg font-semibold text-gray-800">
            Sign In
          </h2>

          <h3 className="text-center text-xl md:text-2xl font-bold text-[#1C2B4A] mt-1">
            Welcome
          </h3>

          {/* EMAIL */}
          <div className="mt-6">
            <label className="text-sm text-gray-600">
              Enter your email address
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username or email address"
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* PASSWORD */}
          <div className="mt-5">
            <label className="text-sm text-gray-600">
              Enter your Password
            </label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right mt-2">
              <span className="text-sm text-gray-400 cursor-pointer">
                Forget Password?
              </span>
            </div>
          </div>

          {/* DEMO */}
          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Demo login:{" "}
            <span className="font-medium text-slate-700">
              admin@gmail.com
            </span>{" "}
            /{" "}
            <span className="font-medium text-slate-700">
              admin@123
            </span>
          </div>

          {/* ERROR */}
          {error && (
            <p className="mt-3 text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button className="w-full mt-6 bg-[#062B4F] text-white py-3 rounded-lg shadow-md hover:bg-[#041f39] transition">
            Sign In
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;   