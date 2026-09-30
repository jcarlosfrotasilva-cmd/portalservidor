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
    <div className="flex flex-col h-full">
      <div className="px-4 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0">
            <School className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-white font-bold text-sm leading-tight">Portal do Servidor</p>
              <p className="text-slate-400 text-xs">EE Profª Marlene Frattini</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`hidden lg:flex flex-col bg-slate-900 h-screen fixed left-0 top-0 z-30 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent />
      </aside>

      <aside className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
