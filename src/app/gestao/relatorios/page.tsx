'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Printer, Loader2, Calendar, FileText, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

type RelatorioTipo = 'geral' | 'por-cargo' | 'por-categoria' | 'efetivo-act' | 'ot-ausencia-mensal';

const SUBTIPOS_AUSENCIA: Record<string, string> = {
  ORIENTACAO_TECNICA: 'O.T.',
  FALTA_JUSTIFICADA: 'Falta Justificada',
  FALTA_INJUSTIFICADA: 'Falta Injustificada',
  FALTA_MEDICA: 'Falta Médica',
  FALTA_TOTAL: 'Falta Total',
  FALTA_MEDICA_PARCIAL: 'Falta Médica Parcial',
  FALTA_AULA: 'Falta de Aula',
  LICENCA_SAUDE: 'Licença Saúde',
  AUXILIO_DOENCA: 'Auxílio-Doença',
};

export default function RelatoriosPage() {
  const [tipoRelatorio, setTipoRelatorio] = useState<RelatorioTipo>('geral');
  const [dados, setDados] = useState<any[]>([]);
  const [dadosMensal, setDadosMensal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mesFiltro, setMesFiltro] = useState(() => new Date().toISOString().slice(0, 7));

  const loadRelatorio = useCallback(async (tipo: RelatorioTipo) => {
    setLoading(true);
    setTipoRelatorio(tipo);
    try {
      const params = new URLSearchParams({ tipo });
      if (tipo === 'ot-ausencia-mensal') params.set('mes', mesFiltro);
      const res = await fetch(`/api/relatorios?${params}`);
      if (res.ok) {
        if (tipo === 'ot-ausencia-mensal') {
          const data = await res.json();
          setDadosMensal(data);
          setDados([]);
        } else {
          const data = await res.json();
          setDados(data);
          setDadosMensal(null);
        }
      } else {
        toast.error('Erro ao carregar relatório');
      }
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [mesFiltro]);

  useEffect(() => {
    
    loadRelatorio('geral');
  }, [loadRelatorio]);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const p = d.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  const mesNome = (mes: string) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const [ano, m] = mes.split('-');
    return `${meses[parseInt(m) - 1]} de ${ano}`;
  };

  const tituloRelatorio = () => {
    switch (tipoRelatorio) {
      case 'geral': return 'Relatório Geral de Servidores';
      case 'por-cargo': return 'Servidores por Cargo';
      case 'por-categoria': return 'Servidores por Categoria';
      case 'efetivo-act': return 'Servidores A-Efetivo e ACT-F';
      case 'ot-ausencia-mensal': return `O.T. e Ausências — ${mesNome(mesFiltro)}`;
      default: return 'Relatório';
    }
  };

  return (
    <DashboardLayout variant="gestao">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </span>
          Relatórios
        </h1>
        <p className="text-slate-500 text-sm mt-1">Relatórios profissionais para visualização e impressão</p>
      </div>

      {/* Seletor */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="font-bold text-slate-800">Selecionar Relatório</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => loadRelatorio('geral')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tipoRelatorio === 'geral' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Geral (Alfabética)
          </button>
          <button type="button" onClick={() => loadRelatorio('por-cargo')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tipoRelatorio === 'por-cargo' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Por Cargo
          </button>
          <button type="button" onClick={() => loadRelatorio('por-categoria')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tipoRelatorio === 'por-categoria' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Por Categoria
          </button>
          <button type="button" onClick={() => loadRelatorio('efetivo-act')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tipoRelatorio === 'efetivo-act' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            A-Efetivo e ACT-F
          </button>
          <button type="button" onClick={() => loadRelatorio('ot-ausencia-mensal')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tipoRelatorio === 'ot-ausencia-mensal' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            O.T. e Ausências Mensal
          </button>
        </div>

        {tipoRelatorio === 'ot-ausencia-mensal' && (
          <div className="mt-4 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-500" />
            <label className="text-sm text-slate-600">Mês:</label>
            <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
            <button type="button" onClick={() => loadRelatorio('ot-ausencia-mensal')} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
              Filtrar
            </button>
          </div>
        )}
      </div>

      {/* Relatório */}
      <div id="print-area" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{tituloRelatorio()}</h3>
            <p className="text-sm text-slate-500">
              EE Profª Marlene Frattini — Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={() => window.print()} className="no-print flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all text-sm font-medium">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>

        <div className="hidden print:block px-8 py-6 border-b-2 border-slate-800 mb-6">
          <h2 className="text-xl font-bold text-slate-900">{tituloRelatorio()}</h2>
          <p className="text-sm text-slate-600 mt-1">EE Profª Marlene Frattini</p>
          <p className="text-sm text-slate-600">Data: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
          ) : tipoRelatorio === 'ot-ausencia-mensal' ? (
            /* Relatório O.T. e Ausências Mensal - Agrupado por Servidor */
            dadosMensal ? (
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  Total de registros em {mesNome(mesFiltro)}: <strong>{dadosMensal.total}</strong>
                </p>

                {dadosMensal.total === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">Nenhum registro no mês selecionado.</p>
                ) : (
                  <div className="space-y-8">
                    {dadosMensal.porServidor?.map((serv: any, servIdx: number) => (
                      <div key={serv.servidorId} className="border-t-2 border-slate-300 pt-4">
                        {/* Cabeçalho do Servidor */}
                        <div className="mb-3">
                          <h4 className="font-bold text-slate-900 text-base">
                            {servIdx + 1}. {serv.nomeServidor}
                          </h4>
                          <p className="text-xs text-slate-600">
                            Cargo: {serv.cargo || '—'} • Categoria: {serv.categoria || '—'}
                          </p>
                        </div>

                        {/* Resumo do Servidor */}
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <p className="text-xs text-slate-500">O.T.</p>
                            <p className="font-bold text-orange-600">{serv.ot}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Ausências</p>
                            <p className="font-bold text-red-600">{serv.ausencia}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Total</p>
                            <p className="font-bold text-slate-900">{serv.total}</p>
                          </div>
                        </div>

                        {/* Detalhamento dos Registros */}
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-slate-400">
                              <th className="text-left py-1.5 px-2 font-semibold text-slate-700 text-xs">Nº</th>
                              <th className="text-left py-1.5 px-2 font-semibold text-slate-700 text-xs">Data</th>
                              <th className="text-left py-1.5 px-2 font-semibold text-slate-700 text-xs">Tipo</th>
                              <th className="text-left py-1.5 px-2 font-semibold text-slate-700 text-xs">Assunto / Detalhes</th>
                              <th className="text-left py-1.5 px-2 font-semibold text-slate-700 text-xs">Local</th>
                              <th className="text-left py-1.5 px-2 font-semibold text-slate-700 text-xs">Horário</th>
                              <th className="text-left py-1.5 px-2 font-semibold text-slate-700 text-xs">DOE/E-mail</th>
                            </tr>
                          </thead>
                          <tbody>
                            {serv.registros?.map((r: any, i: number) => (
                              <tr key={r.id} className="border-b border-slate-200">
                                <td className="py-1.5 px-2 text-slate-500 text-xs">{i + 1}</td>
                                <td className="py-1.5 px-2 text-slate-600 text-xs">{formatDate(r.data)}</td>
                                <td className="py-1.5 px-2 text-xs">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    r.subtipo === 'ORIENTACAO_TECNICA' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {r.subtipo === 'ORIENTACAO_TECNICA' ? 'O.T.' : SUBTIPOS_AUSENCIA[r.subtipo] || 'Ausência'}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 text-slate-600 text-xs max-w-32 truncate">
                                  {r.subtipo === 'ORIENTACAO_TECNICA' ? r.assunto : (
                                    <>
                                      {r.quantidadeDias && `${r.quantidadeDias} dias `}
                                      {r.quantidadeHoras && `${r.quantidadeHoras}h/aula `}
                                      {r.dataInicio && r.dataFim && `${formatDate(r.dataInicio)} → ${formatDate(r.dataFim)}`}
                                    </>
                                  )}
                                </td>
                                <td className="py-1.5 px-2 text-slate-600 text-xs">{r.local || '—'}</td>
                                <td className="py-1.5 px-2 text-slate-600 text-xs">{r.horaInicio && r.horaTermino ? `${r.horaInicio}-${r.horaTermino}` : '—'}</td>
                                <td className="py-1.5 px-2 text-slate-600 text-xs">{r.dataDoeOuEmail || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}

                    {/* Total Geral no final */}
                    <div className="border-t-2 border-slate-800 pt-4 mt-6">
                      <table className="w-full text-sm">
                        <tfoot>
                          <tr className="bg-slate-50">
                            <td colSpan={2} className="py-2 px-3 font-bold text-slate-800 text-right">TOTAL GERAL:</td>
                            <td className="py-2 px-3 text-center font-bold text-orange-600">
                              O.T.: {dadosMensal.porServidor?.reduce((a: number, b: any) => a + b.ot, 0) || 0}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-red-600">
                              Ausências: {dadosMensal.porServidor?.reduce((a: number, b: any) => a + b.ausencia, 0) || 0}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-900">
                              Total: {dadosMensal.total}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
            )
          ) : (
            /* Relatórios de Servidores */
            dados.length > 0 ? (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800">
                    <th className="text-left py-2 px-3 font-bold text-slate-800">Nº</th>
                    <th className="text-left py-2 px-3 font-bold text-slate-800">Nome</th>
                    <th className="text-left py-2 px-3 font-bold text-slate-800">CPF</th>
                    <th className="text-left py-2 px-3 font-bold text-slate-800">Cargo</th>
                    <th className="text-left py-2 px-3 font-bold text-slate-800">Categoria</th>
                    <th className="text-left py-2 px-3 font-bold text-slate-800">Nível</th>
                    <th className="text-left py-2 px-3 font-bold text-slate-800">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((s: any, i: number) => (
                    <tr key={s.id} className="border-b border-slate-200">
                      <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{s.nome}</td>
                      <td className="py-2 px-3 text-slate-700">{s.cpf}</td>
                      <td className="py-2 px-3 text-slate-700">{s.cargo || '—'}</td>
                      <td className="py-2 px-3 text-slate-700">{s.categoria || '—'}</td>
                      <td className="py-2 px-3 text-slate-700">{s.nivel || '—'}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{s.situacao || 'ATIVO'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-800 bg-slate-50">
                    <td colSpan={6} className="py-2 px-3 font-bold text-slate-800">TOTAL</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">{dados.length}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">Nenhum servidor encontrado.</p>
            )
          )}
        </div>

        <div className="hidden print:flex items-center justify-between px-8 py-4 border-t border-slate-300 mt-8 text-xs text-slate-500">
          <span>Portal do Servidor — EE Profª Marlene Frattini</span>
          <span>Documento gerado automaticamente</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
