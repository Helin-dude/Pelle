import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

const LoginPage = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-zinc-950 flex flex-col relative border-x border-zinc-900 shadow-2xl">
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
          {/* Logo */}
          <div 
            data-testid="app-logo"
            className="w-20 h-20 bg-zinc-900 rounded-[2rem] border border-zinc-800 mb-8 flex items-center justify-center text-white shadow-2xl shadow-zinc-900/50"
          >
            <Camera className="w-10 h-10 text-zinc-300" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 font-sans">
            CCTV Monitor
          </h1>
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">
            Surveillance Dashboard
          </p>
          <p className="text-zinc-600 text-sm mb-12 max-w-xs">
            Monitor your cameras in real-time with motion and sound alerts
          </p>

          {/* Google Login Button */}
          <button
            data-testid="google-login-btn"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-zinc-950 font-bold rounded-2xl px-6 py-4 flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-zinc-700 text-[10px] font-mono tracking-widest uppercase mt-12">
            Secure • Private • Real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
