'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSearch, Loader2, Eye, EyeOff, School, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ServidorLoginPage() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const cpfStored = localStorage.getItem('servidor_cpf');
    const loggedIn = localStorage.getItem('servidor_logged');
    if (cpfStored && loggedIn === 'true') {
      router.push('/servidor/vida-funcional');
    }
  }, [router]);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cpfClean = cpf.replace(/[^\d]/g, '');

    if (cpfClean.length !== 11) {
      setError('CPF deve ter 11 dígitos');
      return;
    }
    if (!senha) {
      setError('Senha é obrigatória');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/servidor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfClean, senha }),
      });

      if (res.ok) {
        localStorage.setItem('servidor_cpf', cpfClean);
        localStorage.setItem('servidor_logged', 'true');
        router.push('/servidor/vida-funcional');
      } else {
        const data = await res.json();
        setError(data.error || 'CPF ou senha incorretos');
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar ao Portal</span>
        </Link>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-500/20">
              <UserSearch className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Acesso do Servidor</h1>
            <p className="text-slate-400 text-sm">EE Profª Marlene Frattini</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-center text-lg tracking-wider"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || cpf.replace(/[^\d]/g, '').length !== 11 || !senha}
              className="w-full py-3 px-6 rounded-xl bg-gradient-accent text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-slate-500 text-xs text-center leading-relaxed">
              Insira seu CPF e senha para acessar suas informações funcionais.
              <br />
              <span className="text-accent-400">Senha padrão: 123456</span> (se não alterada)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
