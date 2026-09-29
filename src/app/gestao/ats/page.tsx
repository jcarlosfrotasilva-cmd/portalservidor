'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Calculator,
  TrendingUp,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Award,
  User,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Quinquênios disponíveis
const QUINQUENIOS = [
  { num: 1, label: '1º Quinquênio' },
  { num: 2, label: '2º Quinquênio' },
  { num: 3, label: '3º Quinquênio' },
  { num: 4, label: '4º Quinquênio' },
  { num: 5, label: '5º Quinquênio' },
  { num: 6, label: '6º Quinquênio' },
  { num: 7, label: '7º Quinquênio' },
  { num: 8, label: '8º Quinquênio' },
  { num: 9, label: '9º Quinquênio' },
  { num: 10, label: '10º Quinquênio' },
];

export default function GestaoAtsPage() {
  const [servidores, setServidores] = useState<any[]>([]);
  const [atsList, setAtsList] = useState<any[]>([]);
  const [calcData, setCalcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedServidorId, setSelectedServidorId] = useState<number | null>(null);

  const [form, setForm] = useState({
    servidorId: '',
    numeroQuinquenio: '',
    tipoDescricao: '',
    dataVigencia: '',
    dataDoe: '',
    valor: '',
    observacao: '',
  });

  const loadServidores = useCallback(async () => {
    try {
      const res = await fetch('/api/servidores');
      if (res.ok) setServidores(await res.json());
    } catch { /* ignore */ }
  }, []);

  const loadAts = useCallback(async (servidorId: number | null) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ats?servidorId=${servidorId || '0'}`);
      if (res.ok) {
        const data = await res.json();
        setAtsList(servidorId ? data : []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const loadCalculo = useCallback(async (servidorId: number) => {
    try {
      const res = await fetch(`/api/ats/calculo?servidorId=${servidorId}`);
      if (res.ok) {
        const data = await res.json();
        setCalcData(data);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    
    loadServidores();
  }, [loadServidores]);

  const handleServidorChange = (id: string) => {
    if (!id) {
      setSelectedServidorId(null);
      setAtsList([]);
      setCalcData(null);
      return;
    }
    const sid = parseInt(id);
    setSelectedServidorId(sid);
    loadAts(sid);
    loadCalculo(sid);
  };

  const resetForm = () => {
    setForm({
      servidorId: '', numeroQuinquenio: '', tipoDescricao: '',
      dataVigencia: '', dataDoe: '', valor: '', observacao: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  // Preencher formulário para novo ATS baseado no cálculo
  const handlePreencherProximo = () => {
    if (!calcData || !calcData.proximoQuinquenio || !dataProximoAts) return;
    const quinNum = calcData.proximoQuinquenio;
    const quinLabel = calcData.descricaoProximo;
    setForm({
      servidorId: String(selectedServidorId || ''),
      numeroQuinquenio: String(quinNum),
      tipoDescricao: quinLabel,
      dataVigencia: dataProximoAts,
      dataDoe: '',
      valor: '',
      observacao: `Calculado automaticamente: ${quinLabel} (vigência após 1825 dias do último ATS)`,
    });
    setShowModal(true);
  };

  const handleEdit = (a: any) => {
    setForm({
      servidorId: String(a.servidorId),
      numeroQuinquenio: String(a.numeroQuinquenio),
      tipoDescricao: a.tipoDescricao || '',
      dataVigencia: a.dataVigencia || '',
      dataDoe: a.dataDoe || '',
      valor: a.valor || '',
      observacao: a.observacao || '',
    });
    setEditingId(a.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.servidorId || !form.numeroQuinquenio || !form.dataVigencia) {
      toast.error('Servidor, quinquênio e data de vigência são obrigatórios');
      return;
    }

    const saveToast = toast.loading(editingId ? 'Atualizando...' : 'Cadastrando ATS...');

    try {
      const url = editingId ? `/api/ats/${editingId}` : '/api/ats';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editingId ? 'ATS atualizado!' : 'ATS cadastrado!', { id: saveToast });
        resetForm();
        if (selectedServidorId) {
          loadAts(selectedServidorId);
          loadCalculo(selectedServidorId);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro na operação', { id: saveToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: saveToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este ATS?')) return;
    const delToast = toast.loading('Excluindo...');
    try {
      const res = await fetch(`/api/ats/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ATS excluído!', { id: delToast });
        if (selectedServidorId) {
          loadAts(selectedServidorId);
          loadCalculo(selectedServidorId);
        }
      } else {
        toast.error('Erro ao excluir', { id: delToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: delToast });
    }
  };

  // Helpers
  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const getServidorNome = (id: number) => {
    return servidores.find((s) => s.id === id)?.nome || `Servidor #${id}`;
  };

  const selectedServidor = servidores.find((s) => s.id === selectedServidorId);
  const ultimoQuinNum = calcData?.ultimoAts?.numeroQuinquenio || 0;
  const dataProximoAts = calcData?.dataProximoAts || null;

  const isQuinquenioDisponivel = (num: number) => {
    return !atsList.some((a) => a.numeroQuinquenio === num);
  };

  // Calcular dias restantes para o próximo ATS
  const diasRestantes = (): number | null => {
    if (!dataProximoAts) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const proximo = new Date(dataProximoAts + 'T00:00:00');
    const diff = proximo.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <DashboardLayout variant="gestao">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </span>
            ATS — Adicional por Tempo de Serviço
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-13">
            Gestão de quinquênios com cálculo inteligente de vigências
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Calculator className="w-6 h-6 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-brand-800 text-sm">Cálculo de Quinquênio</h3>
            <p className="text-sm text-brand-700 mt-1 leading-relaxed">
              Cada quinquênio corresponde a <strong>1.825 dias</strong> (5 anos). O próximo ATS vence automaticamente
              <strong> 1 dia depois da data da vigência + 1.824 dias</strong> = <strong>1.825 dias totais</strong>
              de serviço contínuo.
            </p>
          </div>
        </div>
      </div>

      {/* Seleção de Servidor */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-brand-600" />
          <h2 className="font-bold text-slate-800">Selecionar Servidor</h2>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedServidorId || ''}
            onChange={(e) => handleServidorChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white appearance-none"
          >
            <option value="">Selecione um servidor...</option>
            {servidores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome} — {s.cpf} — {s.cargo || 'Sem cargo'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedServidor && (
        <>
          {/* Info do Servidor */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                <User className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{selectedServidor.nome}</h3>
                <p className="text-sm text-slate-500">
                  {selectedServidor.cargo} • {selectedServidor.categoria || 'Sem categoria'} • CPF: {selectedServidor.cpf}
                </p>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedServidor.situacao === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedServidor.situacao}
                </span>
              </div>
            </div>
          </div>

          {/* Painel de Cálculo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Último ATS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-900">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  Último ATS Cadastrado
                </h3>
              </div>
              <div className="p-5">
                {calcData?.ultimoAts ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Quinquênio</span>
                      <span className="font-bold text-brand-600 text-lg">
                        {calcData.ultimoAts.tipoDescricao}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Data da Vigência</span>
                      <span className="font-medium text-slate-800">{formatDate(calcData.ultimoAts.dataVigencia)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Data do DOE</span>
                      <span className="font-medium text-slate-800">{formatDate(calcData.ultimoAts.dataDoe)}</span>
                    </div>
                    {calcData.ultimoAts.valor && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Valor</span>
                        <span className="font-bold text-green-600">R$ {Number(calcData.ultimoAts.valor).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Nenhum ATS cadastrado para este servidor</p>
                  </div>
                )}
              </div>
            </div>

            {/* Próximo ATS */}
            <div className={`rounded-2xl shadow-sm border overflow-hidden ${
              calcData?.proximoQuinquenio
                ? 'bg-gradient-to-br from-brand-50 to-purple-50 border-brand-200'
                : 'bg-white border-slate-200'
            }`}>
              <div className={`px-5 py-4 ${
                calcData?.proximoQuinquenio
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600'
                  : 'bg-gradient-to-r from-slate-200 to-slate-300'
              }`}>
                <h3 className="text-white font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Próximo ATS
                </h3>
              </div>
              <div className="p-5">
                {calcData?.proximoQuinquenio ? (
                  <>
                    {calcData.proximoQuinquenio <= 10 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Quinquênio</span>
                          <span className="font-bold text-brand-600 text-lg">
                            {calcData.descricaoProximo}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Vencimento</span>
                          <span className="font-bold text-slate-800">{dataProximoAts && formatDate(dataProximoAts)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Dias restantes</span>
                          <span className={`font-bold ${diasRestantes() !== null && diasRestantes()! < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {diasRestantes() !== null ? `${diasRestantes()} dias` : '—'}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-brand-200">
                          <p className="text-xs text-slate-500 mb-3">
                            Cálculo: {calcData.ultimoAts?.dataVigencia ? formatDate(calcData.ultimoAts.dataVigencia) : '—'} + 1.825 dias = {dataProximoAts && formatDate(dataProximoAts)}
                          </p>
                          <button
                            onClick={handlePreencherProximo}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-brand text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-lg shadow-brand-600/20"
                          >
                            <Plus className="w-4 h-4" />
                            Cadastrar {calcData.descricaoProximo}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <p className="text-green-700 font-bold">Todos os 10 quinquênios completados!</p>
                        <p className="text-sm text-slate-500 mt-1">Este servidor atingiu o limite de ATS</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Calculator className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Selecione um servidor para calcular</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mapa de Quinquênios */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-600" />
              Mapa de Quinquênios
            </h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {QUINQUENIOS.map((q) => {
                const cadastrado = atsList.some((a) => a.numeroQuinquenio === q.num);
                const isNext = calcData?.proximoQuinquenio === q.num;
                return (
                  <div
                    key={q.num}
                    className={`relative rounded-xl p-3 text-center border-2 transition-all ${
                      cadastrado
                        ? 'bg-green-50 border-green-300'
                        : isNext
                        ? 'bg-brand-50 border-brand-400 animate-pulse'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    {cadastrado && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {isNext && !cadastrado && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <p className={`text-lg font-bold ${cadastrado ? 'text-green-700' : isNext ? 'text-brand-700' : 'text-slate-400'}`}>
                      {q.label.split(' ')[0]}
                    </p>
                    <p className={`text-xs mt-1 ${cadastrado ? 'text-green-600' : isNext ? 'text-brand-600' : 'text-slate-400'}`}>
                      {cadastrado ? '✓' : isNext ? 'Próximo' : '—'}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500" /> Cadastrado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-brand-500" /> Próximo
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-300" /> Pendente
              </span>
            </div>
          </div>

          {/* Tabela de ATS Cadastrados */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                ATS Cadastrados ({atsList.length})
              </h3>
              <button
                onClick={() => {
                  if (selectedServidorId) {
                    setForm(prev => ({ ...prev, servidorId: String(selectedServidorId) }));
                  }
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all text-sm font-medium shadow-lg shadow-brand-600/20"
              >
                <Plus className="w-4 h-4" />
                Novo ATS
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            ) : atsList.length === 0 ? (
              <div className="text-center py-16">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Nenhum ATS cadastrado</p>
                <p className="text-slate-400 text-sm mt-1">Cadastre o primeiro quinquênio deste servidor</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Quinquênio</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Data da Vigência</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Data do DOE</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Valor</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Próx. Vigência</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {atsList.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-brand-600">{a.tipoDescricao}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-medium">{formatDate(a.dataVigencia)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(a.dataDoe)}</td>
                        <td className="px-4 py-3">
                          {a.valor ? (
                            <span className="font-bold text-green-600">R$ {Number(a.valor).toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-brand-600 font-medium">{formatDate(a.proximaVigencia)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(a)}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(a.id)}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Editar ATS' : 'Cadastrar ATS'}
              </h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Servidor *</label>
                <select
                  required
                  value={form.servidorId}
                  onChange={(e) => setForm({ ...form, servidorId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                >
                  <option value="">Selecione o servidor</option>
                  {servidores.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome} ({s.cpf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de ATS *</label>
                <select
                  required
                  value={form.numeroQuinquenio}
                  onChange={(e) => {
                    const num = parseInt(e.target.value);
                    const q = QUINQUENIOS.find((q) => q.num === num);
                    setForm({ ...form, numeroQuinquenio: e.target.value, tipoDescricao: q?.label || '' });
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                >
                  <option value="">Selecione o quinquênio</option>
                  {QUINQUENIOS.map((q) => (
                    <option key={q.num} value={q.num} disabled={isQuinquenioDisponivel(q.num) ? false : true}>
                      {q.label} {isQuinquenioDisponivel(q.num) ? '' : '(cadastrado)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Tipo</label>
                <input
                  value={form.tipoDescricao}
                  onChange={(e) => setForm({ ...form, tipoDescricao: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data da Vigência *</label>
                  <input
                    type="date"
                    required
                    value={form.dataVigencia}
                    onChange={(e) => setForm({ ...form, dataVigencia: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data do DOE</label>
                  <input
                    type="date"
                    value={form.dataDoe}
                    onChange={(e) => setForm({ ...form, dataDoe: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <textarea
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                />
              </div>

              {/* Cálculo automático info */}
              {form.dataVigencia && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Calculator className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-brand-800">Cálculo do próximo ATS</p>
                      <p className="text-xs text-brand-700 mt-1">
                        Data da vigência: <strong>{formatDate(form.dataVigencia)}</strong><br/>
                        + 1.825 dias = <strong>{(() => {
                          const d = new Date(form.dataVigencia + 'T00:00:00');
                          d.setDate(d.getDate() + 1825);
                          return formatDate(d.toISOString().split('T')[0]);
                        })()}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-600/20"
                >
                  {editingId ? 'Salvar' : 'Cadastrar ATS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
