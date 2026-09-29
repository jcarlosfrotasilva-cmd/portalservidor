'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { History } from 'lucide-react';

export default function ServidorHistoricoPage() {
  return (
    <DashboardLayout variant="servidor">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Meu Histórico</h1>
        <p className="text-slate-500">Histórico funcional completo</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">Em breve</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          O seu histórico funcional completo estará disponível em breve, incluindo progressões, promoções e todas as movimentações de carreira.
        </p>
      </div>
    </DashboardLayout>
  );
}
