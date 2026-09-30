'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  BookOpen, UserX, Printer, LogOut, Calendar, MapPin, Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SUBTIPOS = [
  { value: 'ORIENTACAO_TECNICA', label: 'Orientação Técnica', tipo: 'OT' },
  { value: 'FALTA_JUSTIFICADA', label: 'Falta Justificada', tipo: 'AUSENCIA' },
  { value: 'FALTA_INJUSTIFICADA', label: 'Falta Injustificada', tipo: 'AUSENCIA' },
  { value: 'FALTA_MEDICA', label: 'Falta Médica', tipo: 'AUSENCIA' },
  { value: 'FALTA_TOTAL', label: 'Falta Total', tipo: 'AUSENCIA' },
  { value: 'FALTA_MEDICA_PARCIAL', label: 'Falta Médica Parcial', tipo: 'AUSENCIA' },
  { value: 'FALTA_AULA', label: 'Falta de Aula' },
  { value: 'LICENCA_SAUDE', label: 'Licença Saúde', tipo: 'AUSENCIA' },
  { value: 'AUXILIO_DOENCA', label: 'Auxílio-Doença', tipo: 'AUSENCIA' },
];

export default function ServidorOrientacaoPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'TODOS' | 'OT' | 'AUSENCIA'>('TODOS');
  const [anoFiltro, setAnoFiltro] = useState<number>(new Date().getFullYear());
  const [visualizacao, setVisualizacao] = useState<'cards' | 'tabela'>('cards');
  const router = useRouter();

  const loadRegistros = useCallback(async (servidorId: number, tipo: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('servidorId', String(servidorId));
      if (tipo && tipo !== 'TODOS') params.set('tipo', tipo);
      const rRes = await fetch(`/api/orientacao-ausencia?${params}`);
      if (rRes.ok) {
        const data = await rRes.json();
        setRegistros(Array.isArray(data) ? data : []);
      } else {
        setRegistros([]);
      }
    } catch {
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cpf = localStorage.getItem('servidor_cpf');
    if (!cpf) { router.push('/servidor'); return; }
    setLoading(true);
    fetch(`/api/servidores/by-cpf?cpf=${cpf}`).then(async (res) => {
      if (res.ok) {
        const s = await res.json();
        setServidor(s);
        await loadRegistros(s.id, filtro);
      } else {
        router.push('/servidor');
      }
    });
  }, [router, loadRegistros]);

  // Reload when filtro changes
  useEffect(() => {
    if (servidor) {
      loadRegistros(servidor.id, filtro);
    }
  }, [filtro, servidor, loadRegistros]);

  const formatDate = (d: string | null) => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };
  const getSubtipoLabel = (s: string) => SUBTIPOS.find(x => x.value === s)?.label || s;
  const isOT = (s: string) => SUBTIPOS.find(x => x.value === s)?.tipo === 'OT';

  // Filtrar registros pelo ano selecionado
  const registrosDoAno = registros.filter(r => {
    if (!r.data) return false;
    const anoRegistro = new Date(r.data + 'T00:00:00').getFullYear();
    return anoRegistro === anoFiltro;
  });

  // Filtrar por tipo (OT ou Ausência)
  const registrosFiltrados = registrosDoAno.filter(r => {
    if (filtro === 'OT') return isOT(r.subtipo);
    if (filtro === 'AUSENCIA') return !isOT(r.subtipo);
    return true;
  });

  const otCount = registrosDoAno.filter(r => isOT(r.subtipo)).length;
  const ausenciaCount = registrosDoAno.filter(r => !isOT(r.subtipo)).length;

  // Estatísticas por mês
  const estatisticasPorMes = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const registrosDoMes = registrosDoAno.filter(r => {
      if (!r.data) return false;
      const mesRegistro = new Date(r.data + 'T00:00:00').getMonth() + 1;
      return mesRegistro === mes;
    });
    return {
      mes,
      nomeMes: new Date(anoFiltro, i).toLocaleDateString('pt-BR', { month: 'long' }),
      total: registrosDoMes.length,
      ot: registrosDoMes.filter(r => isOT(r.subtipo)).length,
      ausencia: registrosDoMes.filter(r => !isOT(r.subtipo)).length,
    };
  }).filter(e => e.total > 0);

  // Anos disponíveis para filtro
  const anosDisponiveis = [...new Set(
    registros.map(r => r.data ? new Date(r.data + 'T00:00:00').getFullYear() : null)
  )].filter((ano): ano is number => ano !== null).sort((a, b) => b - a);

  // Estatísticas por subtipo
  const estatisticasPorSubtipo = SUBTIPOS.map(subtipo => {
    const registrosDoSubtipo = registrosDoAno.filter(r => r.subtipo === subtipo.value);
    return {
      ...subtipo,
      total: registrosDoSubtipo.length,
    };
  }).filter(e => e.total > 0);

  if (loading) {
    return (
      <DashboardLayout variant="servidor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor) return null;

  return (
    <DashboardLayout variant="servidor">
      <div id="print-area">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </span>
              O.T. e Ausências
            </h1>
            <p className="text-slate-500 text-sm mt-1">{servidor.nome} — {servidor.cargo}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={() => { localStorage.removeItem('servidor_cpf'); localStorage.removeItem('servidor_logged'); router.push('/servidor'); }} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        <div className="hidden print:flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">EE Profª Marlene Frattini</h2>
            <p className="text-slate-500">Orientação Técnica e Ausências — {servidor.nome}</p>
            <p className="text-slate-400 text-sm">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 no-print">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Filtro de Ano */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Ano</label>
              <select
                value={anoFiltro}
                onChange={(e) => setAnoFiltro(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {anosDisponiveis.length > 0 ? (
                  anosDisponiveis.map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))
                ) : (
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                )}
              </select>
            </div>

            {/* Toggle de Visualização */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Visualização</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisualizacao('cards')}
                  className={`flex-1 px-4 py-2 rounded-xl border transition-all ${
                    visualizacao === 'cards'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setVisualizacao('tabela')}
                  className={`flex-1 px-4 py-2 rounded-xl border transition-all ${
                    visualizacao === 'tabela'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300'
                  }`}
                >
                  Tabela
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas do Ano */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 p-5 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Estatísticas de {anoFiltro}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Total de Registros</p>
              <p className="text-3xl font-bold text-slate-800">{registrosDoAno.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-orange-200">
              <p className="text-sm text-orange-600 mb-1">Orientações Técnicas</p>
              <p className="text-3xl font-bold text-orange-600">{otCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-200">
              <p className="text-sm text-red-600 mb-1">Ausências</p>
              <p className="text-3xl font-bold text-red-600">{ausenciaCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Meses com Registros</p>
              <p className="text-3xl font-bold text-slate-800">{estatisticasPorMes.length}</p>
            </div>
          </div>

          {/* Distribuição por Subtipo */}
          {estatisticasPorSubtipo.length > 0 && (
            <div className="mt-4 pt-4 border-t border-orange-200">
              <p className="text-sm font-medium text-slate-700 mb-3">Distribuição por Tipo</p>
              <div className="flex flex-wrap gap-2">
                {estatisticasPorSubtipo.map(subtipo => (
                  <div
                    key={subtipo.value}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      subtipo.tipo === 'OT' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-xs font-medium text-slate-700">{subtipo.label}</span>
                    <span className="text-xs font-bold text-slate-900">({subtipo.total})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <button type="button" onClick={() => setFiltro('TODOS')}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'TODOS' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            <p className="text-2xl font-bold">{registrosFiltrados.length}</p>
            <p className="text-xs mt-1">Total de Registros em {anoFiltro}</p>
          </button>
          <button type="button" onClick={() => setFiltro('OT')}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'OT' ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}>
            <BookOpen className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{otCount}</p>
            <p className="text-xs mt-1">Orientações Técnicas em {anoFiltro}</p>
          </button>
          <button type="button" onClick={() => setFiltro('AUSENCIA')}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'AUSENCIA' ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'}`}>
            <UserX className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{ausenciaCount}</p>
            <p className="text-xs mt-1">Ausências em {anoFiltro}</p>
          </button>
        </div>

        {/* Registros (ordenados por data crescente) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">
              Registros de {anoFiltro} ({registrosFiltrados.length})
            </h2>
          </div>
          {registrosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum registro encontrado para {anoFiltro}</p>
            </div>
          ) : visualizacao === 'tabela' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Assunto/Detalhes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Local</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Horário</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">DOE/E-mail</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...registrosFiltrados]
                    .sort((a, b) => (a.data || '').localeCompare(b.data || ''))
                    .map(r => {
                      const destaquePrincipal = isOT(r.subtipo)
                        ? r.assunto
                        : [
                            r.quantidadeDias && `${r.quantidadeDias} dias`,
                            r.quantidadeHoras && `${r.quantidadeHoras} hora(s)/aula`,
                            r.dataInicio && r.dataFim && `${formatDate(r.dataInicio)} → ${formatDate(r.dataFim)}`,
                          ].filter(Boolean).join(' • ');
                      return (
                        <tr key={r.id} className={`${isOT(r.subtipo) ? 'bg-orange-50/30' : 'bg-red-50/30'}`}>
                          <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">{formatDate(r.data)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isOT(r.subtipo) ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isOT(r.subtipo) ? 'O.T.' : getSubtipoLabel(r.subtipo || '')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 font-semibold">{destaquePrincipal || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{r.local || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                            {r.horaInicio && r.horaTermino ? `${r.horaInicio} - ${r.horaTermino}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">{r.dataDoeOuEmail || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{r.observacao || '—'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...registrosFiltrados]
                .sort((a, b) => (a.data || '').localeCompare(b.data || ''))
                .map(r => {
                  // Destaque do assunto/detalhes principal
                  const destaquePrincipal = isOT(r.subtipo)
                    ? r.assunto
                    : [
                        r.quantidadeDias && `${r.quantidadeDias} dias`,
                        r.quantidadeHoras && `${r.quantidadeHoras} hora(s)/aula`,
                        r.dataInicio && r.dataFim && `${formatDate(r.dataInicio)} → ${formatDate(r.dataFim)}`,
                      ].filter(Boolean).join(' • ');
                  return (
                    <div key={r.id} className={`px-6 py-5 ${isOT(r.subtipo) ? 'bg-gradient-to-r from-orange-50/50 to-transparent' : 'bg-gradient-to-r from-red-50/50 to-transparent'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isOT(r.subtipo) ? 'bg-orange-100' : 'bg-red-100'
                        }`}>
                          {isOT(r.subtipo) ? <BookOpen className="w-6 h-6 text-orange-600" /> : <UserX className="w-6 h-6 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isOT(r.subtipo) ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isOT(r.subtipo) ? 'Orientação Técnica' : getSubtipoLabel(r.subtipo || '')}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" /> {formatDate(r.data)}
                            </span>
                          </div>

                          {/* ASSUNTO/DETALHES DESTACADO */}
                          {destaquePrincipal && (
                            <p className="font-bold text-slate-900 text-base mb-2 print-assunto-destaque">
                              {destaquePrincipal}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                            {r.local && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.local}</span>}
                            {r.horaInicio && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.horaInicio}{r.horaTermino ? ` - ${r.horaTermino}` : ''}</span>}
                            {r.dataDoeOuEmail && <span>DOE/E-mail: {r.dataDoeOuEmail}</span>}
                          </div>
                          {r.observacao && <p className="text-xs text-slate-400 mt-1 italic">{r.observacao}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Estatísticas Mensais */}
        {estatisticasPorMes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 no-print">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Distribuição Mensal - {anoFiltro}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {estatisticasPorMes.map(est => (
                <div key={est.mes} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2 capitalize">{est.nomeMes}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">O.T.</span>
                      <span className="font-bold text-orange-600">{est.ot}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Ausências</span>
                      <span className="font-bold text-red-600">{est.ausencia}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-slate-200">
                      <span className="font-semibold text-slate-700">Total</span>
                      <span className="font-bold text-slate-900">{est.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="hidden print:block text-center text-sm text-slate-400 pt-8">
          <p>Portal do Servidor — EE Profª Marlene Frattini</p>
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
