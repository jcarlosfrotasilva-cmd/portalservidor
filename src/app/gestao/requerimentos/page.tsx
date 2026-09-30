'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  'RECEBIDO': { cor: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock, label: 'Recebido' },
  'EM_ANALISE': { cor: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'Em Análise' },
  'DEFERIDO': { cor: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, label: 'Deferido' },
  'INDEFERIDO': { cor: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, label: 'Indeferido' },
  'PARCIAL': { cor: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle, label: 'Deferido Parcialmente' },
  'ARQUIVADO': { cor: 'bg-gray-100 text-gray-800 border-gray-300', icon: FileText, label: 'Arquivado' },
};

export default function GestaoRequerimentosPage() {
  const [requerimentos, setRequerimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [showDespachoModal, setShowDespachoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [requerimentoSelecionado, setRequerimentoSelecionado] = useState<any>(null);

  const [despachoForm, setDespachoForm] = useState({
    decisao: '',
    fundamentacaoDecisao: '',
    gestorNome: '',
    observacoes: '',
  });

  const loadRequerimentos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroStatus) params.set('status', filtroStatus);

      const res = await fetch(`/api/requerimentos?${params}`);
      if (res.ok) {
        setRequerimentos(await res.json());
      }
    } catch (error) {
      console.error('Erro ao carregar requerimentos:', error);
    } finally {
      setLoading(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    loadRequerimentos();
  }, [loadRequerimentos]);

  const verDetalhes = async (req: any) => {
    try {
      const res = await fetch(`/api/requerimentos/${req.id}`);
      if (res.ok) {
        const detalhes = await res.json();
        setRequerimentoSelecionado(detalhes);
        setShowDetalhesModal(true);
      }
    } catch (error) {
      toast.error('Erro ao carregar detalhes');
    }
  };

  const abrirDespacho = (req: any) => {
    setRequerimentoSelecionado(req);
    setDespachoForm({
      decisao: '',
      fundamentacaoDecisao: '',
      gestorNome: '',
      observacoes: '',
    });
    setShowDespachoModal(true);
  };

  const handleDespacho = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!despachoForm.decisao) {
      toast.error('Selecione uma decisão');
      return;
    }

    if (despachoForm.decisao === 'INDEFERIDO' && !despachoForm.fundamentacaoDecisao) {
      toast.error('Indeferimento requer fundamentação jurídica');
      return;
    }

    const submitToast = toast.loading('Registrando despacho...');

    try {
      const res = await fetch(`/api/requerimentos/${requerimentoSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(despachoForm),
      });

      if (res.ok) {
        toast.success('Despacho registrado com sucesso', { id: submitToast });
        setShowDespachoModal(false);
        loadRequerimentos();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro ao registrar despacho', { id: submitToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: submitToast });
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR');
  };

  const calcularDiasRestantes = (prazo: string | null) => {
    if (!prazo) return null;
    const hoje = new Date();
    const prazoDate = new Date(prazo);
    const diff = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const requerimentosPendentes = requerimentos.filter(r => ['RECEBIDO', 'EM_ANALISE'].includes(r.status));
  const requerimentosDecididos = requerimentos.filter(r => ['DEFERIDO', 'INDEFERIDO', 'PARCIAL', 'ARQUIVADO'].includes(r.status));

  return (
    <DashboardLayout variant="gestao">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </span>
          Gestão de Requerimentos
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Despache os requerimentos dos servidores com segurança jurídica
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-2xl font-bold text-slate-800">{requerimentos.length}</p>
          <p className="text-xs text-slate-500">Total de Requerimentos</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-2xl font-bold text-orange-600">{requerimentosPendentes.length}</p>
          <p className="text-xs text-slate-500">Pendentes de Despacho</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-2xl font-bold text-green-600">{requerimentosDecididos.length}</p>
          <p className="text-xs text-slate-500">Decididos</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-purple-600" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requerimentos Pendentes */}
      {requerimentosPendentes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200 bg-orange-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Pendentes de Despacho ({requerimentosPendentes.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {requerimentosPendentes.map(req => {
              const statusConfig = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusConfig.icon;
              const diasRestantes = calcularDiasRestantes(req.prazoResposta);
              const urgente = diasRestantes !== null && diasRestantes <= 7;

              return (
                <div key={req.id} className={`p-4 hover:bg-slate-50 ${urgente ? 'bg-red-50' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-slate-600">{req.protocolo}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusConfig.cor}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                        {diasRestantes !== null && (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            urgente ? 'bg-red-100 text-red-800 border border-red-300' :
                            diasRestantes <= 15 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                            'bg-green-100 text-green-800 border border-green-300'
                          }`}>
                            {diasRestantes <= 0 ? 'Prazo vencido!' : `${diasRestantes} dias restantes`}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800 mb-1">{req.tipo}</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{req.objeto}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Servidor ID: {req.servidorId} • Protocolado em {formatDate(req.dataProtocolo)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => verDetalhes(req)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => abrirDespacho(req)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
                      >
                        <FileText className="w-4 h-4" />
                        Despachar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Requerimentos Decididos */}
      {requerimentosDecididos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-green-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Decididos ({requerimentosDecididos.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {requerimentosDecididos.map(req => {
              const statusConfig = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusConfig.icon;
              return (
                <div key={req.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-slate-600">{req.protocolo}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusConfig.cor}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                        {!req.cienciaServidor && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                            Aguardando ciência do servidor
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800 mb-1">{req.tipo}</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{req.objeto}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Protocolado em {formatDate(req.dataProtocolo)} • Decidido em {formatDate(req.dataDecisao)}
                      </p>
                    </div>
                    <button
                      onClick={() => verDetalhes(req)}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Despacho */}
      {showDespachoModal && requerimentoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Despacho do Requerimento</h2>
              <p className="text-sm text-slate-500 mt-1 font-mono">{requerimentoSelecionado.protocolo}</p>
            </div>
            <form onSubmit={handleDespacho} className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">{requerimentoSelecionado.tipo}</p>
                <p className="text-sm text-slate-600 line-clamp-3">{requerimentoSelecionado.objeto}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Decisão *
                </label>
                <select
                  value={despachoForm.decisao}
                  onChange={(e) => setDespachoForm({ ...despachoForm, decisao: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Selecione a decisão</option>
                  <option value="DEFERIDO">✅ Deferido (Aceito integralmente)</option>
                  <option value="INDEFERIDO">❌ Indeferido (Negado)</option>
                  <option value="PARCIAL">⚠️ Deferido Parcialmente</option>
                  <option value="EM_ANALISE">🔍 Em Análise (Aguardando mais informações)</option>
                  <option value="ARQUIVADO">📁 Arquivado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fundamentação da Decisão {despachoForm.decisao === 'INDEFERIDO' && '*'}
                </label>
                <textarea
                  value={despachoForm.fundamentacaoDecisao}
                  onChange={(e) => setDespachoForm({ ...despachoForm, fundamentacaoDecisao: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={5}
                  placeholder="Fundamente juridicamente sua decisão (obrigatório para indeferimento)..."
                  required={despachoForm.decisao === 'INDEFERIDO'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seu Nome (Gestor) *
                </label>
                <input
                  type="text"
                  value={despachoForm.gestorNome}
                  onChange={(e) => setDespachoForm({ ...despachoForm, gestorNome: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nome completo do gestor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  value={despachoForm.observacoes}
                  onChange={(e) => setDespachoForm({ ...despachoForm, observacoes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder="Observações relevantes"
                />
              </div>

              {despachoForm.decisao === 'INDEFERIDO' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800">
                    <strong>Atenção:</strong> O indeferimento deve ser fundamentado conforme o princípio da motivação (art. 50 da Lei 9.784/99). O servidor terá direito a recurso.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDespachoModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all"
                >
                  Registrar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetalhesModal && requerimentoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Detalhes do Requerimento</h2>
                <p className="text-sm text-slate-500 mt-1 font-mono">{requerimentoSelecionado.protocolo}</p>
              </div>
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Dados */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Dados do Requerimento</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Tipo:</span>
                    <span className="text-sm font-medium text-slate-800">{requerimentoSelecionado.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      STATUS_CONFIG[requerimentoSelecionado.status as keyof typeof STATUS_CONFIG]?.cor
                    }`}>
                      {STATUS_CONFIG[requerimentoSelecionado.status as keyof typeof STATUS_CONFIG]?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Servidor ID:</span>
                    <span className="text-sm font-medium text-slate-800">{requerimentoSelecionado.servidorId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Data do Protocolo:</span>
                    <span className="text-sm font-medium text-slate-800">{formatDate(requerimentoSelecionado.dataProtocolo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Prazo para Resposta:</span>
                    <span className="text-sm font-medium text-slate-800">{formatDate(requerimentoSelecionado.prazoResposta)}</span>
                  </div>
                </div>
              </div>

              {/* Objeto */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Objeto</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{requerimentoSelecionado.objeto}</p>
                </div>
              </div>

              {/* Fundamentação */}
              {requerimentoSelecionado.fundamentacao && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Fundamentação do Servidor</h3>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{requerimentoSelecionado.fundamentacao}</p>
                  </div>
                </div>
              )}

              {/* Decisão */}
              {requerimentoSelecionado.decisao && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Decisão</h3>
                  <div className={`rounded-xl p-4 border-2 ${
                    requerimentoSelecionado.decisao === 'DEFERIDO' ? 'bg-green-50 border-green-200' :
                    requerimentoSelecionado.decisao === 'INDEFERIDO' ? 'bg-red-50 border-red-200' :
                    'bg-orange-50 border-orange-200'
                  }`}>
                    <p className="font-bold text-slate-800 mb-2">
                      {requerimentoSelecionado.decisao}
                    </p>
                    {requerimentoSelecionado.fundamentacaoDecisao && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-600 mb-1">Fundamentação:</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {requerimentoSelecionado.fundamentacaoDecisao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Histórico */}
              {requerimentoSelecionado.tramitacoes?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Histórico de Tramitações</h3>
                  <div className="space-y-3">
                    {requerimentoSelecionado.tramitacoes.map((tram: any) => (
                      <div key={tram.id} className="bg-slate-50 rounded-xl p-4 border-l-4 border-purple-500">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-purple-600">{tram.tipoResponsavel}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(tram.dataTramitacao).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {tram.observacao && (
                          <p className="text-sm text-slate-700">{tram.observacao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão Despachar */}
              {['RECEBIDO', 'EM_ANALISE'].includes(requerimentoSelecionado.status) && (
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setShowDetalhesModal(false);
                      abrirDespacho(requerimentoSelecionado);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all"
                  >
                    Despachar Requerimento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
