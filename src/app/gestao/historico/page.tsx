'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { History, Loader2, Search } from 'lucide-react';

export default function GestaoHistoricoPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  return (
    <DashboardLayout variant="gestao">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Histórico Funcional</h1>
        <p className="text-slate-500">Registros de eventos funcionais dos servidores</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar no histórico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">Em breve</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          O módulo de histórico funcional estará disponível em breve. Aqui você poderá registrar e acompanhar todas as movimentações funcionais dos servidores.
        </p>
      </div>
    </DashboardLayout>
  );
}
