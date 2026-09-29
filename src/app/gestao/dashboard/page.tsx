'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Users, UserCheck, Loader2, ArrowUpRight, Briefcase, GraduationCap, Award, FileUp, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function GestaoDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('gestor_logged') !== 'true') {
      router.push('/gestao');
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) setStats(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout variant="gestao">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Painel de Gestão</h1>
        <p className="text-slate-500">Visão geral do sistema de servidores — EE Profª Marlene Frattini</p>
      </div>

      {/* Cards Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users} label="Total de Servidores" value={stats?.totalServidores ?? 0} bgLight="bg-brand-50" iconColor="text-brand-600" />
        <StatCard icon={UserCheck} label="Servidores Ativos" value={stats?.servidoresAtivos ?? 0} bgLight="bg-accent-50" iconColor="text-accent-600" />
        <StatCard icon={GraduationCap} label="A-Efetivo (Ativos)" value={stats?.aEfetivo ?? 0} bgLight="bg-amber-50" iconColor="text-amber-600" />
        <StatCard icon={Briefcase} label="ACT-F (Ativos)" value={stats?.actF ?? 0} bgLight="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Cargos e Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Por Cargo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              Totais por Cargo
            </h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
          ) : stats?.porCargo?.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Nenhum dado</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats?.porCargo?.map((c: any) => (
                <div key={c.cargo} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                  <span className="text-sm text-slate-700 font-medium">{c.cargo || 'Sem cargo'}</span>
                  <span className="px-3 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Por Categoria */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Totais por Categoria
            </h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
          ) : stats?.porCategoria?.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Nenhum dado</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats?.porCategoria?.map((c: any) => (
                <div key={c.categoria} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                  <span className="text-sm text-slate-700 font-medium">{c.categoria || 'Sem categoria'}</span>
                  <span className="px-3 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <QuickAction href="/gestao/servidores" icon={Users} label="Servidores" desc="Gerenciar servidores" gradient="from-brand-500 to-brand-600" shadow="shadow-brand-500/20" />
        <QuickAction href="/gestao/upload" icon={FileUp} label="Upload Excel" desc="Importar planilha" gradient="from-accent-500 to-accent-600" shadow="shadow-accent-500/20" />
        <QuickAction href="/gestao/relatorios" icon={Award} label="Relatórios" desc="Gerar relatórios" gradient="from-slate-600 to-slate-800" shadow="shadow-slate-600/20" />
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, bgLight, iconColor }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 card-hover">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${bgLight} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, desc, gradient, shadow }: any) {
  return (
    <Link href={href} className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-all card-hover">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">{label}</h3>
          <p className="text-sm text-slate-500">{desc}</p>
        </div>
        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-all" />
      </div>
    </Link>
  );
}
