import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

// Custom Pelle Logo - Green P with camera lens in the hole (light theme)
const PelleLogo = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Green P letter */}
    <path
      d="M25 15h30c16.569 0 30 13.431 30 30s-13.431 30-30 30H45v20c0 2.761-2.239 5-5 5H30c-2.761 0-5-2.239-5-5V15z"
      fill="#22c55e"
    />
    {/* Inner cutout for P hole */}
    <path
      d="M45 30h10c8.284 0 15 6.716 15 15s-6.716 15-15 15H45V30z"
      fill="#ffffff"
    />
    {/* Camera lens outer ring */}
    <circle cx="55" cy="45" r="12" fill="#f0fdf4" stroke="#86efac" strokeWidth="2"/>
    {/* Camera lens inner rings */}
    <circle cx="55" cy="45" r="8" fill="#dcfce7"/>
    <circle cx="55" cy="45" r="5" fill="#bbf7d0"/>
    {/* Lens reflection/highlight */}
    <circle cx="52" cy="42" r="2" fill="#22c55e" opacity="0.8"/>
    {/* Outer lens ring detail */}
    <circle cx="55" cy="45" r="10" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white/80 backdrop-blur-sm flex flex-col relative border-x border-green-100 shadow-xl">
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
          {/* Pelle Logo - Green P with camera lens */}
          <div 
            data-testid="app-logo"
            className="w-28 h-28 bg-white rounded-[2rem] border-2 border-green-200 mb-8 flex items-center justify-center shadow-lg shadow-green-200/50"
          >
            <PelleLogo className="w-20 h-20" />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 mb-2 font-sans">
            Pelle
          </h1>
          <p className="text-green-600 font-mono text-xs tracking-widest uppercase mb-12">
            Kameraövervakning
          </p>

          {/* Google Login Button */}
          <button
            data-testid="google-login-btn"
            onClick={handleGoogleLogin}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl px-6 py-4 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-green-500/30"
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
            Fortsätt med Google
          </button>

          {/* Security Note */}
          <div className="mt-10 p-4 bg-green-50 border border-green-200 rounded-2xl max-w-xs">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <p className="text-green-700 text-xs font-semibold uppercase tracking-wide">
                Lokal Nätverkssäkerhet
              </p>
            </div>
            <p className="text-green-600/80 text-xs">
              Kameraströmmar är endast tillgängliga inom ditt hemma-WiFi
            </p>
          </div>

          {/* Footer */}
          <p className="text-green-400 text-[10px] font-mono tracking-widest uppercase mt-10">
            Säker • Privat • Lokalt Nätverk
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
