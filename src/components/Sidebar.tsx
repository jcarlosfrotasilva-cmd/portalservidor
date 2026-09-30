'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, FileUp, Award, History, Settings,
  ChevronLeft, ChevronRight, School, LogOut, Briefcase,
  Menu, X, TrendingUp, FileText, BookOpen, Printer,
} from 'lucide-react';

interface SidebarProps {
  variant: 'gestao' | 'servidor';
}

export default function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const gestaoItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/gestao/dashboard' },
    { icon: Users, label: 'Servidores', href: '/gestao/servidores' },
    { icon: FileUp, label: 'Upload Excel', href: '/gestao/upload' },
    { icon: TrendingUp, label: 'ATS', href: '/gestao/ats' },
    { icon: Award, label: 'Evolução Funcional', href: '/gestao/evolucao-funcional' },
    { icon: FileText, label: 'Licença Prêmio', href: '/gestao/licenca-premio' },
    { icon: BookOpen, label: 'O.T. e Ausência', href: '/gestao/orientacao-ausencia' },
    { icon: FileText, label: 'Requerimentos', href: '/gestao/requerimentos' },
    { icon: Printer, label: 'Relatórios', href: '/gestao/relatorios' },
    { icon: History, label: 'Histórico', href: '/gestao/historico' },
    { icon: FileText, label: 'Ficha Funcional', href: '/gestao/ficha-funcional' },
    { icon: Settings, label: 'Configurações', href: '/gestao/Configuracoes' },
  ];

  const servidorItems = [
    { icon: LayoutDashboard, label: 'Meu Painel', href: '/servidor/vida-funcional' },
    { icon: Briefcase, label: 'Vida Funcional', href: '/servidor/vida-funcional' },
    { icon: TrendingUp, label: 'Meu ATS', href: '/servidor/ats' },
    { icon: Award, label: 'Evolução Funcional', href: '/servidor/evolucao-funcional' },
    { icon: FileText, label: 'Licença Prêmio', href: '/servidor/licenca-premio' },
    { icon: BookOpen, label: 'O.T. e Ausência', href: '/servidor/orientacao-ausencia' },
    { icon: FileText, label: 'Requerimentos', href: '/servidor/requerimentos' },
    { icon: History, label: 'Histórico', href: '/servidor/historico' },
    { icon: FileText, label: 'Ficha Funcional', href: '/servidor/ficha-funcional' },
  ];

  const items = variant === 'gestao' ? gestaoItems : servidorItems;

  const handleLogout = () => {
    if (variant === 'gestao') {
      localStorage.removeItem('gestor_logged');
      router.push('/gestao');
    } else {
      localStorage.removeItem('servidor_cpf');
      localStorage.removeItem('servidor_logged');
      router.push('/servidor');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative">
      {/* Efeito de luz no fundo - Tons de azul royal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Logo - Premium com Glassmorphism Azul Royal */}
      <div className="relative px-4 py-6">
        <div className="relative rounded-2xl p-0.5 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
          <div className="rounded-[14px] bg-[#0a1929]/90 backdrop-blur-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-md opacity-60 animate-pulse" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <School className="w-6 h-6 text-white drop-shadow" />
                </div>
              </div>
              {!collapsed && (
                <div className="animate-fade-in flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">Portal do Servidor</p>
                  <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200 font-medium mt-0.5">EE Profª Marlene Frattini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divisor sutil */}
      <div className="relative px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent" />
      </div>

      {/* Navegação */}
      <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'text-white'
                  : 'text-blue-100/70 hover:text-white hover:translate-x-1'
              }`}
            >
              {/* Item ativo - fundo gradiente azul royal premium */}
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 blur-md opacity-50" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                </>
              )}
              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-blue-400/10 transition-all duration-300" />
              )}
              <item.icon className={`relative w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                isActive
                  ? 'text-white drop-shadow-lg'
                  : 'group-hover:text-white group-hover:scale-110'
              }`} />
              {!collapsed && (
                <span className="relative truncate">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <div className="relative ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white animate-pulse" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divisor sutil */}
      <div className="relative px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent" />
      </div>

      {/* Footer com ações */}
      <div className="relative px-3 py-4 space-y-1">
        <button
          onClick={handleLogout}
          className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-100/70 hover:text-red-300 transition-all duration-300 w-full hover:translate-x-1"
        >
          <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-red-500/10 transition-all duration-300" />
          <LogOut className="relative w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="relative">Sair</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-100/70 hover:text-white transition-all duration-300 w-full"
        >
          <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-blue-400/10 transition-all duration-300" />
          <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
            {collapsed ? (
              <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </div>
          {!collapsed && <span className="relative">Recolher</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Fundo com gradiente azul marinho profissional */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1929] via-[#0f2847] to-[#1a365d]" />
        {/* Textura sutil */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        {/* Borda lateral direita com gradiente */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent" />
        {/* Conteúdo */}
        <div className="relative flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1929] via-[#0f2847] to-[#1a365d]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent" />
        <div className="relative flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
