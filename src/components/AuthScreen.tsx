import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Flame, Sparkles, Key, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }

    if (cleanPassword.length < 6) {
      setAuthError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        onAuthSuccess(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        onAuthSuccess(userCredential.user);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let translateMsg = 'Ocorreu um erro ao autenticar. Tente novamente.';
      if (error.code === 'auth/wrong-password') {
        translateMsg = 'Senha incorreta. Verifique suas credenciais.';
      } else if (error.code === 'auth/user-not-found') {
        translateMsg = 'Nenhum usuário encontrado com este email.';
      } else if (error.code === 'auth/email-already-in-use') {
        translateMsg = 'Este email já está sendo utilizado por outra conta.';
      } else if (error.code === 'auth/invalid-email') {
        translateMsg = 'O formato do email fornecido é inválido.';
      } else if (error.code === 'auth/weak-password') {
        translateMsg = 'A senha fornecida é muito fraca.';
      }
      setAuthError(translateMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-pink-600/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-850 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-rose-600/10 border border-rose-500/30 p-3 rounded-2xl mb-4 flex items-center justify-center shadow-lg shadow-rose-500/5">
            <Flame className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">
            HotFunnel Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium uppercase tracking-widest">
            Acesso Restrito ao Co-piloto Hot
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 bg-slate-950 rounded-lg p-1 mb-6 border border-slate-850">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setAuthError(''); }}
            className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              authMode === 'login'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setAuthError(''); }}
            className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar</span>
          </button>
        </div>

        {/* Error Box */}
        {authError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-lg text-xs font-medium mb-5 flex items-start space-x-2 leading-relaxed">
            <span className="shrink-0 mt-0.5 font-bold">⚠️</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Corporativo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none transition duration-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Min. 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none transition duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:from-rose-800 disabled:to-pink-800 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-lg shadow-rose-600/15 cursor-pointer flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Processando...</span>
              </span>
            ) : (
              <span>{authMode === 'login' ? 'ENTRAR NO DASHBOARD' : 'CRIAR CONTA GRÁTIS'}</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-850/50 text-center flex flex-col items-center space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
            <Key className="w-3 h-3 text-emerald-400" />
            <span>Banco de dados integrado ao Firebase Firestore de forma privada</span>
          </div>
          <p className="text-[9px] text-slate-600 leading-normal">
            Seus perfis e estratégias são armazenados individualmente e protegidos de forma criptografada.
          </p>
        </div>
      </div>
    </div>
  );
}
