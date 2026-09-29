'use client';

import Sidebar from '@/components/Sidebar';
import { LogOut, User, Shield } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  variant: 'gestao' | 'servidor';
}

export default function DashboardLayout({ children, variant }: DashboardLayoutProps) {
  const isGestao = variant === 'gestao';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar variant={variant} />

      {/* Main Content Area */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isGestao ? 'bg-brand-100' : 'bg-accent-100'
              }`}>
                {isGestao ? (
                  <Shield className="w-4 h-4 text-brand-600" />
                ) : (
                  <User className="w-4 h-4 text-accent-600" />
                )}
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800">
                  {isGestao ? 'Painel de Gestão' : 'Portal do Servidor'}
                </h1>
                <p className="text-xs text-slate-500">EE Profª Marlene Frattini</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
