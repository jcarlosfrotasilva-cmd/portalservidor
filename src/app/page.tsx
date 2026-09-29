'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  School,
  Users,
  Shield,
  ArrowRight,
  Zap,
  BarChart3,
  FileText,
  Printer,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const features = [
    { icon: BarChart3, title: 'Vida Funcional Completa', desc: 'Acompanhe toda sua trajetória profissional em um só lugar' },
    { icon: FileText, title: 'Vantagens e Direitos', desc: 'Visualize todas as vantagens adquiridas durante sua carreira' },
    { icon: Printer, title: 'Relatórios Imprimíveis', desc: 'Gere relatórios profissionais para impressão' },
    { icon: Clock, title: 'Em Tempo Real', desc: 'Dados sempre atualizados e sincronizados' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Portal do Servidor</h1>
                <p className="text-slate-400 text-sm">EE Profª Marlene Frattini</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-slate-400 text-sm">Sistema Online</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className={`text-center mb-16 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-brand-400" />
              <span className="text-brand-300 text-sm font-medium">Sistema Integrado de Gestão de Pessoas</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Bem-vindo ao{' '}
              <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-accent-400 bg-clip-text text-transparent">
                Portal do Servidor
              </span>
            </h2>

            <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
              Acesse sua vida funcional completa, visualize vantagens, gere relatórios e mantenha-se conectado com a gestão da escola.
            </p>
          </div>

          {/* Access Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Servidor Card */}
            <Link
              href="/servidor"
              className={`group relative block p-8 rounded-3xl glass card-hover transition-all duration-700 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mb-6 shadow-lg shadow-accent-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Sou Servidor</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Acesse sua vida funcional completa, visualize suas vantagens e gere relatórios profissionais.
                </p>
                <div className="flex items-center gap-2 text-accent-400 font-medium group-hover:gap-4 transition-all">
                  <span>Acessar Portal</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* Gestão Card */}
            <Link
              href="/gestao"
              className={`group relative block p-8 rounded-3xl glass card-hover transition-all duration-700 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.4s' }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mb-6 shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Sou Gestor</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Gerencie servidores, cadastre vantagens, faça upload de dados e administre o sistema completo.
                </p>
                <div className="flex items-center gap-2 text-brand-400 font-medium group-hover:gap-4 transition-all">
                  <span>Acessar Painel</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 ${
                  loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${0.6 + i * 0.1}s` }}
              >
                <feature.icon className="w-8 h-8 text-brand-400 mb-4" />
                <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 EE Profª Marlene Frattini — Portal do Servidor
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <ChevronRight className="w-4 h-4" />
              <span>Desenvolvido com excelência</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
