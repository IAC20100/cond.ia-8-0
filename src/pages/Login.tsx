import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ArrowRight, Power, Accessibility, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithGoogle } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Login() {
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useStore((state) => state.login);
  const mfaEnabled = useStore((state) => state.mfaEnabled);
  const companyLogo = useStore((state) => state.companyLogo);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      toast.error('Erro ao fazer login com Google: ' + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Windows 8 style login usually has a small delay
    setTimeout(() => {
      // If MFA is enabled, show MFA screen first
      if (mfaEnabled && !showMfa) {
        setShowMfa(true);
        setLoading(false);
        return;
      }

      const success = login('iac', password);
      if (!success) {
        setError(true);
        setLoading(false);
        setPassword('');
        setMfaCode('');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white flex flex-col items-center justify-center font-sans overflow-hidden relative">
      {/* Background Curves (Subtle) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center z-10"
      >
        {/* User Avatar */}
        <div className="w-48 h-48 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center overflow-hidden mb-6 shadow-2xl relative group">
          {companyLogo ? (
            <img src={companyLogo} alt="User" className="w-full h-full object-cover" />
          ) : (
            <User className="w-24 h-24 text-white/40" />
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* User Name */}
        <h1 className="text-4xl font-light mb-8 tracking-tight">Administrador</h1>

        {/* Login Form */}
        <AnimatePresence mode="wait">
          {!showMfa ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-[320px] space-y-4"
            >
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    autoFocus
                    className={`w-full bg-white/10 border-2 ${error ? 'border-red-500' : 'border-white/30'} focus:border-white/60 outline-none px-4 py-2.5 pr-12 text-lg transition-all placeholder:text-white/40`}
                    required
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="absolute right-1 w-10 h-10 bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </form>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-2 bg-[#004a7c] text-[10px] uppercase font-black tracking-widest text-white/40">Ou</span>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white text-black py-3 flex items-center justify-center gap-3 font-bold hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Login com Google
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="mfa-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-[320px] space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold">Verificação em Duas Etapas</h2>
                <p className="text-sm text-white/60">Insira o código de 6 dígitos enviado ao seu dispositivo.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  autoFocus
                  className="w-full bg-white/10 border-2 border-white/30 focus:border-white/60 outline-none px-4 py-3 text-2xl text-center tracking-[0.5em] transition-all placeholder:text-white/20"
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-4 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  Verificar e Entrar
                </button>
                <button 
                  type="button"
                  onClick={() => setShowMfa(false)}
                  className="w-full text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Voltar
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mt-3 text-center font-medium"
          >
            {showMfa ? 'Código inválido. Tente novamente.' : 'A senha está incorreta. Tente novamente.'}
          </motion.p>
        )}

        {/* Hint */}
        <p className="mt-8 text-white/40 text-sm font-medium">Dica: iac / 112213</p>
      </motion.div>

      {/* Bottom Icons */}
      <div className="absolute bottom-10 right-10 flex gap-6 z-10">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Facilidade de Acesso">
          <Accessibility className="w-8 h-8 opacity-60" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Ligar/Desligar">
          <Power className="w-8 h-8 opacity-60" />
        </button>
      </div>

      {/* Date/Time (Bottom Left) */}
      <div className="absolute bottom-10 left-10 text-left z-10">
        <div className="text-7xl font-light mb-2">
          {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-2xl font-light opacity-80">
          {time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </div>
      </div>
    </div>
  );
}
