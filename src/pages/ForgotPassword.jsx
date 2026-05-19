import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import forgotPasswordImg from "../assets/Forget_password.png";
import { API_ENDPOINTS } from "../config/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD_GENERATE_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`Your OTP is: ${data.otp}`); // Testing popup
        setStep(2);
        setTimer(30);
        setOtp(["", "", "", "", ""]);
      } else {
        setError(data.message || "Failed to generate OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 5) {
      setError("Please enter a valid 5-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD_VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otpValue }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStep(3);
      } else {
        setError("Enter a valid OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD_RESET, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.join(""),
          newPassword
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setPopup({ show: true, message: "Password has been successfully changed" });
        setTimeout(() => {
          setPopup({ show: false, message: "" });
          navigate("/login");
        }, 4000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const resendOtp = async () => {
    setError("");
    setOtp(["", "", "", "", ""]);
    
    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD_GENERATE_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`Your new OTP is: ${data.otp}`);
        setTimer(30);
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans relative">
      {/* Toast Notification */}
      {popup.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#062B4F] text-white px-6 py-3 rounded-lg shadow-lg font-medium transition-all duration-300">
          {popup.message}
        </div>
      )}

      {/* Left Side */}
      <div className="relative flex w-full flex-col items-center justify-center bg-white px-6 py-10 md:w-[75%] md:px-10 md:py-0">
        <div className="absolute top-4 left-4 md:top-6 md:left-8">
          <img src={logo} alt="logo" className="h-12" />
        </div>
        
        <img src={forgotPasswordImg} alt="Forget Password Illustration" className="w-[85%] max-w-md mb-6" />

        <div className="text-center mt-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Forget Password ?</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
            No,worries your email address and we'll send you a link change your password
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="relative flex w-full items-center justify-center bg-[#062B4F] py-10 md:w-[50%] md:py-0">
        <div className="relative w-[90%] rounded-[24px] bg-white p-8 shadow-2xl sm:w-[460px] md:absolute md:top-1/2 md:left-0 md:-translate-y-1/2 md:-translate-x-1/4">
          
          <h2 className="text-center text-xl md:text-2xl font-bold text-black mb-6">
            Forget Password
          </h2>
          {error && <p className="text-red-500 text-sm font-medium mb-4 text-center">{error}</p>}

          {step === 1 && (
            <form onSubmit={handleVerifyEmail}>
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">Enter your email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#062B4F]"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-medium transition duration-200 text-white ${
                  email && !loading ? "bg-[#062B4F] hover:bg-[#041f39]" : "bg-[#B0B6C4] cursor-not-allowed"
                }`}
                disabled={!email || loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-[#3A5E77] hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>



              <div className="mb-2">
                <label className="block text-sm text-gray-700 mb-1">Enter OTP</label>
                <p className="text-xs text-gray-400 mb-4">
                  The OTP sent via email id on this <span className="font-semibold text-gray-600">{email}</span>
                </p>
                <div className="flex justify-between mb-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      name={`otp-digit-${index}`}
                      type="text"
                      maxLength={1}
                      autoComplete="new-password"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-[3.2rem] h-[3.2rem] border border-gray-300 rounded-lg text-center text-xl focus:outline-none focus:border-[#062B4F]"
                    />
                  ))}
                </div>
                
                <div className="text-right text-xs mb-6 h-4">
                  {timer > 0 ? (
                    <span className="text-gray-500 font-medium">Resend OTP {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')} min</span>
                  ) : (
                    <button type="button" onClick={resendOtp} disabled={loading} className="text-[#2563EB] hover:underline font-medium">
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#062B4F] text-white py-3 rounded-lg hover:bg-[#041f39] transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-[#3A5E77] hover:underline">
                  Back
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#062B4F]"
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-sm text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#062B4F]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#062B4F] text-white py-3 rounded-lg hover:bg-[#041f39] transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="mt-6 text-center">
                <button type="button" onClick={() => { setStep(2); setOtp(["", "", "", "", ""]); }} className="text-sm text-[#3A5E77] hover:underline">
                  Back
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
