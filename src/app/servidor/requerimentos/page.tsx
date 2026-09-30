'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const TIPOS_REQUERIMENTO = [
  'Licença Prêmio',
  'Licença Saúde',
  'Licença para Tratamento de Saúde',
  'Licença Maternidade',
  'Licença Paternidade',
  'Afastamento para Capacitação',
  'Retificação Funcional',
  'Declaração de Vínculo',
  'Declaração de Rendimentos',
  'Certidão de Tempo de Contribuição',
  'Progressão Funcional',
  'Adicional por Tempo de Serviço',
  'Outros',
];

const STATUS_CONFIG = {
  'RECEBIDO': { cor: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock, label: 'Recebido' },
  'EM_ANALISE': { cor: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'Em Análise' },
  'DEFERIDO': { cor: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, label: 'Deferido' },
  'INDEFERIDO': { cor: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, label: 'Indeferido' },
  'PARCIAL': { cor: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle, label: 'Deferido Parcialmente' },
  'ARQUIVADO': { cor: 'bg-gray-100 text-gray-800 border-gray-300', icon: FileText, label: 'Arquivado' },
};

export default function ServidorRequerimentosPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [requerimentos, setRequerimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [requerimentoSelecionado, setRequerimentoSelecionado] = useState<any>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    tipo: '',
    objeto: '',
    fundamentacao: '',
    observacoes: '',
  });

  useEffect(() => {
    const cpf = localStorage.getItem('servidor_cpf');
    if (!cpf) {
      router.push('/servidor');
      return;
    }
    loadData(cpf);
  }, [router]);

  const loadData = async (cpf: string) => {
    setLoading(true);
    try {
      const sRes = await fetch(`/api/servidores/by-cpf?cpf=${cpf}`);
      if (sRes.ok) {
        const s = await sRes.json();
        setServidor(s);

        const rRes = await fetch(`/api/requerimentos?servidorId=${s.id}`);
        if (rRes.ok) {
          setRequerimentos(await rRes.json());
        }
      } else {
        router.push('/servidor');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo || !form.objeto) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const submitToast = toast.loading('Protocolando requerimento...');

    try {
      const res = await fetch('/api/requerimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servidorId: servidor.id,
          tipo: form.tipo,
          objeto: form.objeto,
          fundamentacao: form.fundamentacao,
          observacoes: form.observacoes,
        }),
      });

      if (res.ok) {
        const novo = await res.json();
        toast.success(`Requerimento protocolado! Nº ${novo.protocolo}`, { id: submitToast });
        setForm({ tipo: '', objeto: '', fundamentacao: '', observacoes: '' });
        setShowModal(false);
        loadData(servidor.cpf);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro ao protocolar', { id: submitToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: submitToast });
    }
  };

  const handleDarCiencia = async (reqId: number) => {
    if (!confirm('Confirmar ciência da decisão?')) return;

    const toastId = toast.loading('Registrando ciência...');
    try {
      const res = await fetch(`/api/requerimentos/${reqId}/ciencia`, { method: 'POST' });
      if (res.ok) {
        toast.success('Ciência registrada com sucesso', { id: toastId });
        loadData(servidor.cpf);
      } else {
        toast.error('Erro ao registrar ciência', { id: toastId });
      }
    } catch {
      toast.error('Erro de conexão', { id: toastId });
    }
  };

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

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <DashboardLayout variant="servidor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor) return null;

  const requerimentosAbertos = requerimentos.filter(r => !['DEFERIDO', 'INDEFERIDO', 'PARCIAL', 'ARQUIVADO'].includes(r.status));
  const requerimentosFinalizados = requerimentos.filter(r => ['DEFERIDO', 'INDEFERIDO', 'PARCIAL', 'ARQUIVADO'].includes(r.status));

  return (
    <DashboardLayout variant="servidor">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </span>
          Meus Requerimentos
        </h1>
        <p className="text-slate-500 text-sm mt-1">{servidor.nome}</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-2xl font-bold text-slate-800">{requerimentos.length}</p>
          <p className="text-xs text-slate-500">Total de Requerimentos</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-2xl font-bold text-blue-600">{requerimentosAbertos.length}</p>
          <p className="text-xs text-slate-500">Em Andamento</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-2xl font-bold text-green-600">{requerimentosFinalizados.length}</p>
          <p className="text-xs text-slate-500">Finalizados</p>
        </div>
      </div>

      {/* Botão Novo Requerimento */}
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-5 h-5" />
          Novo Requerimento
        </button>
      </div>

      {/* Requerimentos em Andamento */}
      {requerimentosAbertos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200 bg-blue-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Em Andamento
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {requerimentosAbertos.map(req => {
              const statusConfig = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['RECEBIDO'];
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
                      </div>
                      <p className="font-semibold text-slate-800 mb-1">{req.tipo}</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{req.objeto}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Protocolado em {formatDate(req.dataProtocolo)} • Prazo: {formatDate(req.prazoResposta)}
                      </p>
                    </div>
                    <button
                      onClick={() => verDetalhes(req)}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Requerimentos Finalizados */}
      {requerimentosFinalizados.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-green-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Finalizados
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {requerimentosFinalizados.map(req => {
              const statusConfig = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['RECEBIDO'];
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
                        {!req.cienciaServidor && ['DEFERIDO', 'INDEFERIDO', 'PARCIAL'].includes(req.status) && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                            Aguardando ciência
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800 mb-1">{req.tipo}</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{req.objeto}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Protocolado em {formatDate(req.dataProtocolo)} • Decidido em {formatDate(req.dataDecisao)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => verDetalhes(req)}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Detalhes
                      </button>
                      {!req.cienciaServidor && ['DEFERIDO', 'INDEFERIDO', 'PARCIAL'].includes(req.status) && (
                        <button
                          onClick={() => handleDarCiencia(req.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Dar Ciência
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Novo Requerimento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Novo Requerimento</h2>
              <p className="text-sm text-slate-500 mt-1">
                Preencha os dados abaixo para protocolar seu requerimento
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Requerimento *
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {TIPOS_REQUERIMENTO.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Objeto do Requerimento *
                </label>
                <textarea
                  value={form.objeto}
                  onChange={(e) => setForm({ ...form, objeto: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Descreva detalhadamente o que está requerendo..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fundamentação (opcional)
                </label>
                <textarea
                  value={form.fundamentacao}
                  onChange={(e) => setForm({ ...form, fundamentacao: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Fundamente juridicamente seu pedido (se desejar)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder="Informações adicionais relevantes"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Após o protocolo, o requerimento terá prazo de 30 dias para resposta.
                  Você será notificado quando houver decisão.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all"
                >
                  Protocolar Requerimento
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
              {/* Dados do Requerimento */}
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
                    <span className="text-sm text-slate-600">Data do Protocolo:</span>
                    <span className="text-sm font-medium text-slate-800">
                      {formatDate(requerimentoSelecionado.dataProtocolo)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Prazo para Resposta:</span>
                    <span className="text-sm font-medium text-slate-800">
                      {formatDate(requerimentoSelecionado.prazoResposta)}
                    </span>
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
                  <h3 className="font-semibold text-slate-800 mb-2">Fundamentação</h3>
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
                      {requerimentoSelecionado.decisao === 'DEFERIDO' && '✅ DEFERIDO'}
                      {requerimentoSelecionado.decisao === 'INDEFERIDO' && '❌ INDEFERIDO'}
                      {requerimentoSelecionado.decisao === 'PARCIAL' && '⚠️ DEFERIDO PARCIALMENTE'}
                    </p>
                    {requerimentoSelecionado.fundamentacaoDecisao && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-600 mb-1">Fundamentação:</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {requerimentoSelecionado.fundamentacaoDecisao}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 mt-3">
                      Decisão proferida em {formatDate(requerimentoSelecionado.dataDecisao)}
                    </p>
                  </div>
                </div>
              )}

              {/* Histórico de Tramitações */}
              {requerimentoSelecionado.tramitacoes?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Histórico de Tramitações</h3>
                  <div className="space-y-3">
                    {requerimentoSelecionado.tramitacoes.map((tram: any, idx: number) => (
                      <div key={tram.id} className="bg-slate-50 rounded-xl p-4 border-l-4 border-purple-500">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-purple-600">
                              {tram.tipoResponsavel}
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">{tram.responsavel}</span>
                          </div>
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
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
