import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2, Mail, Lock, Key } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const { forgotPassword, resetPasswordWithOtp } = useAuthStore();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await forgotPassword(email);
    if (success) setStep(2);
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return;
    setLoading(true);
    try {
      await resetPasswordWithOtp({ email, otp, newPassword });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md border space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                className="input input-bordered w-full pl-10"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin size-5" /> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                className="input input-bordered w-full pl-10"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-success w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin size-5" /> : "Reset Password"}
            </button>
          </form>
        )}

        <p className="text-center">
          Back to{" "}
          <Link to="/login" className="link link-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;