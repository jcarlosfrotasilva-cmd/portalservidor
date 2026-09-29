'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Printer,
  User,
  Shield,
  Award,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  GraduationCap,
  Clock,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ServidorVidaFuncionalPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 
  useEffect(() => {
    const cpf = localStorage.getItem('servidor_cpf');
    if (!cpf) {
      router.push('/servidor');
      return;
    }
    loadServidor(cpf);
  }, [router]);
 
  const loadServidor = async (cpf: string) => {
    setLoading(true);
    try {
      const servRes = await fetch(`/api/servidores/by-cpf?cpf=${cpf}`);
      if (servRes.ok) {
        setServidor(await servRes.json());
      } else {
        router.push('/servidor');
      }
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem('servidor_cpf');
    router.push('/servidor');
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const SituacaoBadge = ({ situacao }: { situacao: string }) => {
    const cls = situacao === 'ATIVO'
      ? 'bg-green-100 text-green-700'
      : situacao.includes('LICENCA') || situacao.includes('LICENÇA')
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{situacao}</span>;
  };

  if (loading) {
    return (
      <DashboardLayout variant="servidor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Carregando seus dados...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor) return null;

  return (
    <DashboardLayout variant="servidor">
      <div id="print-area">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Vida Funcional</h1>
            <p className="text-slate-500 text-sm">Informações completas do servidor</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-xl bg-brand-600 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">EE Profª Marlene Frattini</h2>
            <p className="text-slate-500">Ficha Funcional do Servidor — {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Servidor Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-gradient-brand p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{servidor.nome}</h2>
                <p className="text-brand-200">{servidor.cargo} • {servidor.categoria}</p>
              </div>
              <SituacaoBadge situacao={servidor.situacao || 'ATIVO'} />
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoItem icon={Shield} label="CPF" value={servidor.cpf || '—'} />
              <InfoItem icon={User} label="RG-CIN" value={servidor.rgcin || '—'} />
              <InfoItem icon={Calendar} label="Data de Nascimento" value={formatDate(servidor.dtnasc)} />
              <InfoItem icon={Mail} label="E-mail" value={servidor.email || '—'} />
              <InfoItem icon={Phone} label="Telefone" value={servidor.tel || '—'} />
              <InfoItem icon={Briefcase} label="Cargo" value={servidor.cargo || '—'} />
              <InfoItem icon={GraduationCap} label="Categoria" value={servidor.categoria || '—'} />
              <InfoItem icon={MapPin} label="Faixa" value={servidor.faixa || '—'} />
              <InfoItem icon={Building2} label="Nível" value={servidor.nivel || '—'} />
              <InfoItem icon={Clock} label="Jornada" value={servidor.jornada || '—'} />
              <InfoItem icon={Building2} label="Lotação" value={servidor.lotacao || '—'} />
              <InfoItem icon={Calendar} label="Data Admissão" value={formatDate(servidor.dataAdmissao)} />
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center text-sm text-slate-400 pt-8">
          <p>Portal do Servidor — EE Profª Marlene Frattini</p>
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-brand-600" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
