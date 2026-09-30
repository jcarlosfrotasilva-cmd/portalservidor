'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  FileText, Printer, LogOut, Calendar, Clock, TrendingUp, Award,
  BookOpen, Briefcase, UserX, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIAS = [
  { value: 'POSSE', label: 'Posse/Admissão', icon: Briefcase, cor: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'PROGRESSAO', label: 'Progressão', icon: TrendingUp, cor: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'LICENCA', label: 'Licença', icon: Calendar, cor: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'AFASTAMENTO', label: 'Afastamento', icon: UserX, cor: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'EVOLUCAO', label: 'Evolução', icon: TrendingUp, cor: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'ATS', label: 'ATS', icon: Award, cor: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'LOTACAO', label: 'Lotação', icon: Briefcase, cor: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { value: 'CAPACITACAO', label: 'Capacitação', icon: BookOpen, cor: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { value: 'FALTAS', label: 'Faltas', icon: UserX, cor: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'OT', label: 'O.T.', icon: BookOpen, cor: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'OUTROS', label: 'Outros', icon: FileText, cor: 'bg-slate-100 text-slate-700 border-slate-300' },
];

export default function ServidorHistoricoPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const router = useRouter();

  const loadHistorico = useCallback(async (servidorId: number, categoria: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        servidorId: String(servidorId),
        ordenacao: 'desc',
      });
      if (categoria && categoria !== 'TODAS') params.set('categoria', categoria);

      const res = await fetch(`/api/historico-funcional?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRegistros(data.registros || []);
        setEstatisticas(data.estatisticas);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const cpf = localStorage.getItem('servidor_cpf');
    if (!cpf) { router.push('/servidor'); return; }
    setLoading(true);
    fetch(`/api/servidores/by-cpf?cpf=${cpf}`).then(async (res) => {
      if (res.ok) {
        const s = await res.json();
        setServidor(s);
        await loadHistorico(s.id, filtroCategoria);
      } else {
        router.push('/servidor');
      }
    });
  }, [router, loadHistorico]);

  useEffect(() => {
    if (servidor) {
      loadHistorico(servidor.id, filtroCategoria);
    }
  }, [filtroCategoria, servidor, loadHistorico]);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const p = d.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  const getCategoriaInfo = (cat: string) =>
    CATEGORIAS.find(c => c.value === cat) || CATEGORIAS[CATEGORIAS.length - 1];

  // Calcular tempo de serviço a partir do primeiro registro
  const calcularTempoServico = () => {
    if (registros.length === 0) return null;
    const sorted = [...registros].sort((a, b) => (a.data || '').localeCompare(b.data || ''));
    const primeiroRegistro = sorted[0];
    if (!primeiroRegistro?.data) return null;
    const inicio = new Date(primeiroRegistro.data + 'T00:00:00');
    const hoje = new Date();
    const diff = hoje.getTime() - inicio.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const anos = Math.floor(dias / 365);
    const meses = Math.floor((dias % 365) / 30);
    const diasRestantes = dias % 30;
    return { anos, meses, dias: diasRestantes, totalDias: dias };
  };

  if (loading) {
    return (
      <DashboardLayout variant="servidor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor) return null;

  const tempoServico = calcularTempoServico();

  return (
    <DashboardLayout variant="servidor">
      <div id="print-area">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </span>
              Meu Histórico Funcional
            </h1>
            <p className="text-slate-500 text-sm mt-1">{servidor.nome} — {servidor.cargo}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-800/20">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={() => { localStorage.removeItem('servidor_cpf'); localStorage.removeItem('servidor_logged'); router.push('/servidor'); }} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        {/* Cabeçalho para impressão */}
        <div className="hidden print:block mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Histórico Funcional</h2>
          <p className="text-slate-700 font-medium mt-2">{servidor.nome}</p>
          <p className="text-slate-600 text-sm">CPF: {servidor.cpf} • Cargo: {servidor.cargo || '—'}</p>
          <p className="text-slate-600 text-sm">EE Profª Marlene Frattini</p>
          <p className="text-slate-400 text-xs mt-2">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Resumo do Histórico */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-6 text-white">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Resumo da Trajetória Funcional
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-xs">Total de Registros</p>
              <p className="text-3xl font-bold">{estatisticas?.total || 0}</p>
            </div>
            {tempoServico && (
              <div>
                <p className="text-slate-400 text-xs">Tempo de Serviço</p>
                <p className="text-xl font-bold">
                  {tempoServico.anos}a {tempoServico.meses}m {tempoServico.dias}d
                </p>
              </div>
            )}
            <div>
              <p className="text-slate-400 text-xs">Categorias</p>
              <p className="text-3xl font-bold">{Object.keys(estatisticas?.porCategoria || {}).length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Primeiro Registro</p>
              <p className="text-sm font-semibold">
                {registros.length > 0 ? formatDate([...registros].sort((a, b) => (a.data || '').localeCompare(b.data || ''))[0].data) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Filtro por categoria */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 no-print">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroCategoria('TODAS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filtroCategoria === 'TODAS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            {CATEGORIAS.map(cat => {
              const count = estatisticas?.porCategoria?.[cat.value] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={cat.value}
                  onClick={() => setFiltroCategoria(cat.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    filtroCategoria === cat.value ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                  <span className="font-bold">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {registros.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum registro no histórico</p>
            </div>
          ) : (
            <div>
              {/* Cabeçalho da timeline */}
              <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
                <p className="text-xs font-semibold text-slate-600 uppercase">
                  {registros.length} registro(s) encontrado(s) — ordenado por data (mais recente primeiro)
                </p>
              </div>
              <div>
                {registros.map((r) => {
                  const catInfo = getCategoriaInfo(r.categoria);
                  const CatIcon = catInfo.icon;
                  const isExpanded = expandedId === r.id;
                  return (
                    <div key={r.id} className="relative">
                      {/* Linha vertical */}
                      <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-200" />

                      <div className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors relative">
                        {/* Ícone */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${catInfo.cor} relative z-10`}>
                          <CatIcon className="w-5 h-5" />
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${catInfo.cor}`}>
                                  {catInfo.label}
                                </span>
                                <span className="text-sm font-semibold text-slate-800">{r.tipo}</span>
                              </div>
                              <p className="font-bold text-slate-900 text-sm mb-1">{r.descricao}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {formatDate(r.data)}
                                  {r.dataFim && ` → ${formatDate(r.dataFim)}`}
                                </span>
                                {r.numeroDocumento && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Doc: {r.numeroDocumento}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center flex-shrink-0"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Detalhes expandidos */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-sm">
                              {r.observacoes && (
                                <div>
                                  <span className="font-semibold text-slate-700">Observações: </span>
                                  <span className="text-slate-600">{r.observacoes}</span>
                                </div>
                              )}
                              {r.registradoPor && (
                                <div>
                                  <span className="font-semibold text-slate-700">Registrado por: </span>
                                  <span className="text-slate-600">{r.registradoPor}</span>
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-slate-700">Data do registro: </span>
                                <span className="text-slate-600">
                                  {r.dataRegistro ? new Date(r.dataRegistro).toLocaleString('pt-BR') : '—'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="hidden print:block text-center text-sm text-slate-400 pt-8">
          <p>Portal do Servidor — EE Profª Marlene Frattini</p>
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
