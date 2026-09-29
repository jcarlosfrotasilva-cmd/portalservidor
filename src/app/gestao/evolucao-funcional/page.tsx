'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus, Edit, Trash2, X, Loader2, TrendingUp, Calendar, FileText,
  ArrowRight, AlertCircle, CheckCircle2, User, Search, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NIVEIS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const ORDINAIS = ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª'];

const REGRAS_DOCENTE = [
  { de: 'I', para: 'II', anos: 4 },
  { de: 'II', para: 'III', anos: 4 },
  { de: 'III', para: 'IV', anos: 5 },
  { de: 'IV', para: 'V', anos: 5 },
  { de: 'V', para: 'VI', anos: 4 },
  { de: 'VI', para: 'VII', anos: 4 },
  { de: 'VII', para: 'VIII', anos: 4 },
];

const REGRAS_DIRETOR = [
  { de: 'I', para: 'II', anos: 4 },
  { de: 'II', para: 'III', anos: 5 },
  { de: 'III', para: 'IV', anos: 6 },
  { de: 'IV', para: 'V', anos: 6 },
  { de: 'V', para: 'VI', anos: 5 },
  { de: 'VI', para: 'VII', anos: 5 },
  { de: 'VII', para: 'VIII', anos: 4 },
];

export default function GestaoEvolucaoPage() {
  const [servidores, setServidores] = useState<any[]>([]);
  const [evolucoes, setEvolucoes] = useState<any[]>([]);
  const [calcData, setCalcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedServidorId, setSelectedServidorId] = useState<number | null>(null);

  const [form, setForm] = useState({
    servidorId: '', tipo: '', transicao: '', nivelOrigem: '', nivelDestino: '',
    intersticioAnos: '', dataVigencia: '', dataDoe: '', observacao: '',
  });

  const loadServidores = useCallback(async () => {
    try {
      const res = await fetch('/api/servidores');
      if (res.ok) setServidores(await res.json());
    } catch { /* */ }
  }, []);

  const loadEvolucoes = useCallback(async (servidorId: number | null) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/evolucao-funcional?servidorId=${servidorId || '0'}`);
      if (res.ok) setEvolucoes(servidorId ? await res.json() : []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const loadCalculo = useCallback(async (servidorId: number) => {
    try {
      const res = await fetch(`/api/evolucao-funcional/calculo?servidorId=${servidorId}`);
      if (res.ok) setCalcData(await res.json());
    } catch { /* */ }
  }, []);

  useEffect(() => {
     loadServidores(); }, [loadServidores]);

  const handleServidorChange = (id: string) => {
    if (!id) { setSelectedServidorId(null); setEvolucoes([]); setCalcData(null); return; }
    const sid = parseInt(id);
    setSelectedServidorId(sid);
    loadEvolucoes(sid);
    loadCalculo(sid);
  };

  const resetForm = () => {
    setForm({
      servidorId: '', tipo: '', transicao: '', nivelOrigem: '', nivelDestino: '',
      intersticioAnos: '', dataVigencia: '', dataDoe: '', observacao: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handlePreencherProximo = () => {
    if (!calcData?.proximoTipo || !calcData?.dataProximo) return;
    const regra = calcData.regras.find((r: any) => r.de === calcData.nivelAtual);
    setForm({
      servidorId: String(selectedServidorId || ''),
      tipo: calcData.proximoTipo,
      transicao: calcData.proximaTransicao,
      nivelOrigem: calcData.nivelAtual,
      nivelDestino: regra?.para || '',
      intersticioAnos: String(calcData.proximoIntersticio || ''),
      dataVigencia: calcData.dataProximo,
      dataDoe: '',
      observacao: `Calculado: ${calcData.descricaoProximo}`,
    });
    setShowModal(true);
  };

  const handleEdit = (e: any) => {
    setForm({
      servidorId: String(e.servidorId),
      tipo: e.tipo || '', transicao: e.transicao || '',
      nivelOrigem: e.nivelOrigem || '', nivelDestino: e.nivelDestino || '',
      intersticioAnos: String(e.intersticioAnos || ''),
      dataVigencia: e.dataVigencia || '', dataDoe: e.dataDoe || '',
      observacao: e.observacao || '',
    });
    setEditingId(e.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.servidorId || !form.tipo || !form.dataVigencia) {
      toast.error('Servidor, tipo e data de vigência são obrigatórios');
      return;
    }
    if (!form.transicao || !form.nivelOrigem || !form.nivelDestino) {
      toast.error('Preencha o tipo de evolução corretamente (campos automáticos)');
      return;
    }
    const intersticio = parseInt(form.intersticioAnos);
    if (isNaN(intersticio) || intersticio <= 0) {
      toast.error('Interstício inválido. Verifique o tipo de evolução selecionado.');
      return;
    }
    const saveToast = toast.loading(editingId ? 'Atualizando...' : 'Cadastrando...');
    try {
      const url = editingId ? `/api/evolucao-funcional/${editingId}` : '/api/evolucao-funcional';
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        ...form,
        intersticioAnos: String(intersticio),
      };
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingId ? 'Atualizado!' : 'Cadastrado!', { id: saveToast });
        resetForm();
        if (selectedServidorId) { loadEvolucoes(selectedServidorId); loadCalculo(selectedServidorId); }
      } else { const err = await res.json(); toast.error(err.error, { id: saveToast }); }
    } catch { toast.error('Erro de conexão', { id: saveToast }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta evolução?')) return;
    const delToast = toast.loading('Excluindo...');
    try {
      const res = await fetch(`/api/evolucao-funcional/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Excluído!', { id: delToast });
        if (selectedServidorId) { loadEvolucoes(selectedServidorId); loadCalculo(selectedServidorId); }
      } else { toast.error('Erro ao excluir', { id: delToast }); }
    } catch { toast.error('Erro de conexão', { id: delToast }); }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const p = d.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  const selectedServidor = servidores.find((s) => s.id === selectedServidorId);
  const diasRestantes = (): number | null => {
    if (!calcData?.dataProximo) return null;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const prox = new Date(calcData.dataProximo + 'T00:00:00');
    return Math.ceil((prox.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Filtrar servidores elegíveis para o select
  const isDocente = (cargo: string) => { if (!cargo) return false; const c = cargo.toUpperCase(); return c.includes('PEB I') || c.includes('PEB II'); };
  const isDiretor = (cargo: string) => { if (!cargo) return false; const c = cargo.toUpperCase(); return c.includes('DIRETOR'); };
  const isElegivel = (cargo: string, cat: string) => {
    if (!isDocente(cargo) && !isDiretor(cargo)) return false;
    if (!cat) return false;
    const c = cat.toUpperCase();
    return c.includes('A-EFETIVO') || c.includes('ACT-F') || c.includes('AEFETIVO');
  };
  const servidoresElegiveis = servidores.filter(s => isElegivel(s.cargo || '', s.categoria || ''));

  return (
    <DashboardLayout variant="gestao">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </span>
          Evolução Funcional
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Gestão de evoluções de nível (I a VIII) — PEB I, PEB II e Diretor de Escola
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-brand-50 border border-purple-200 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-purple-800 text-sm mb-2">📚 Regras para DOCENTES (PEB I / PEB II)</h3>
            <div className="grid grid-cols-2 gap-1 text-xs text-purple-700">
              <span>I → II: <strong>4 anos</strong></span><span>II → III: <strong>4 anos</strong></span>
              <span>III → IV: <strong>5 anos</strong></span><span>IV → V: <strong>5 anos</strong></span>
              <span>V → VI: <strong>4 anos</strong></span><span>VI → VII: <strong>4 anos</strong></span>
              <span>VII → VIII: <strong>4 anos</strong></span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-brand-800 text-sm mb-2">🏫 Regras para DIRETOR DE ESCOLA</h3>
            <div className="grid grid-cols-2 gap-1 text-xs text-brand-700">
              <span>I → II: <strong>4 anos</strong></span><span>II → III: <strong>5 anos</strong></span>
              <span>III → IV: <strong>6 anos</strong></span><span>IV → V: <strong>6 anos</strong></span>
              <span>V → VI: <strong>5 anos</strong></span><span>VI → VII: <strong>5 anos</strong></span>
              <span>VII → VIII: <strong>4 anos</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Seleção de Servidor Elegível */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-brand-600" />
          <h2 className="font-bold text-slate-800">Selecionar Servidor Elegível</h2>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <select
            value={selectedServidorId || ''}
            onChange={(e) => handleServidorChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white appearance-none"
          >
            <option value="">Selecione um servidor elegível...</option>
            {servidoresElegiveis.map((s) => (
              <option key={s.id} value={s.id}>{s.nome} — {s.cargo} — {s.categoria}</option>
            ))}
          </select>
        </div>
        {servidoresElegiveis.length === 0 && (
          <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Nenhum servidor elegível encontrado. Apenas PEB I, PEB II e Diretor com A-EFETIVO ou ACT-F.
          </p>
        )}
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
                  {selectedServidor.cargo} • {selectedServidor.categoria} • Nível atual: <strong>{calcData?.nivelAtual || selectedServidor.nivel || 'I'}</strong>
                </p>
              </div>
            </div>
          </div>

          {!calcData?.elegivel ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-amber-800">Servidor não elegível</h3>
              <p className="text-sm text-amber-700 mt-1">{calcData?.motivo}</p>
            </div>
          ) : (
            <>
              {/* Painel Cálculo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Última Evolução */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-900">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      Última Evolução
                    </h3>
                  </div>
                  <div className="p-5">
                    {calcData?.ultimaEvolucao ? (
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-sm text-slate-500">Tipo</span><span className="font-bold text-brand-600">{calcData.ultimaEvolucao.tipo}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-slate-500">Transição</span><span className="font-medium text-slate-800">{calcData.ultimaEvolucao.transicao}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-slate-500">Interstício</span><span className="font-medium text-slate-800">{calcData.ultimaEvolucao.intersticioAnos} anos</span></div>
                        <div className="flex justify-between"><span className="text-sm text-slate-500">Vigência</span><span className="font-medium text-slate-800">{formatDate(calcData.ultimaEvolucao.dataVigencia)}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-slate-500">DOE</span><span className="font-medium text-slate-800">{formatDate(calcData.ultimaEvolucao.dataDoe)}</span></div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">Nenhuma evolução cadastrada</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Próxima Evolução */}
                <div className={`rounded-2xl shadow-sm border overflow-hidden ${
                  calcData?.proximoTipo
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className={`px-5 py-4 ${
                    calcData?.proximoTipo
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                      : 'bg-gradient-to-r from-slate-200 to-slate-300'
                  }`}>
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Próxima Evolução
                    </h3>
                  </div>
                  <div className="p-5">
                    {calcData?.proximoTipo ? (
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-sm text-slate-500">Tipo</span><span className="font-bold text-green-600 text-lg">{calcData.proximoTipo}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-slate-500">Transição</span><span className="font-bold text-slate-800">{calcData.proximaTransicao}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-slate-500">Interstício</span><span className="font-medium text-slate-800">{calcData.proximoIntersticio} anos</span></div>
                        <div className="flex justify-between"><span className="text-sm text-slate-500">Vencimento</span><span className="font-bold text-slate-800">{formatDate(calcData.dataProximo)}</span></div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Dias restantes</span>
                          <span className={`font-bold ${diasRestantes() !== null && diasRestantes()! < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {diasRestantes() !== null ? `${diasRestantes()} dias` : '—'}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-green-200">
                          <p className="text-xs text-slate-500 mb-3">
                            Cálculo: {calcData.ultimaEvolucao?.dataVigencia ? formatDate(calcData.ultimaEvolucao.dataVigencia) : '—'} + {calcData.proximoIntersticio} anos = {formatDate(calcData.dataProximo)}
                          </p>
                          <button onClick={handlePreencherProximo}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-lg">
                            <Plus className="w-4 h-4" /> Cadastrar {calcData.proximoTipo} <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <p className="text-green-700 font-bold">Nível VIII atingido!</p>
                        <p className="text-sm text-slate-500 mt-1">Este servidor completou todas as evoluções.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mapa de Níveis */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                  Progressão de Níveis
                </h3>
                <div className="flex items-center justify-between gap-1">
                  {NIVEIS.map((n, i) => {
                    const evolucoesDoServidor = evolucoes;
                    const atingido = evolucoesDoServidor.some(e => e.nivelDestino === n);
                    const isNext = calcData?.nivelAtual === n && i < NIVEIS.length - 1;
                    return (
                      <div key={n} className="flex items-center flex-1">
                        <div className={`relative rounded-xl p-3 text-center border-2 transition-all flex-1 ${
                          atingido
                            ? 'bg-green-50 border-green-300'
                            : isNext
                            ? 'bg-brand-50 border-brand-400'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}>
                          {atingido && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {isNext && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                              <ChevronRight className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <p className={`text-xl font-bold ${atingido ? 'text-green-700' : isNext ? 'text-brand-700' : 'text-slate-400'}`}>{n}</p>
                        </div>
                        {i < NIVEIS.length - 1 && (
                          <div className="w-4 flex-shrink-0 flex justify-center">
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-6 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Atingido</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-brand-500" /> Nível Atual</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-300" /> Pendente</span>
                </div>
              </div>

              {/* Tabela */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-600" />
                    Evoluções ({evolucoes.length})
                  </h3>
                  <button onClick={() => { setForm(p => ({ ...p, servidorId: String(selectedServidorId) })); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 text-sm font-medium shadow-lg shadow-brand-600/20">
                    <Plus className="w-4 h-4" /> Nova Evolução
                  </button>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>
                ) : evolucoes.length === 0 ? (
                  <div className="text-center py-16">
                    <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Nenhuma evolução cadastrada</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Tipo</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Transição</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Interstício</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">Vigência</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600">DOE</th>
                          <th className="text-center px-4 py-3 font-semibold text-slate-600">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {evolucoes.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-brand-600">{e.tipo}</td>
                            <td className="px-4 py-3 text-slate-800">{e.transicao}</td>
                            <td className="px-4 py-3 text-slate-600">{e.intersticioAnos} anos</td>
                            <td className="px-4 py-3 text-slate-800 font-medium">{formatDate(e.dataVigencia)}</td>
                            <td className="px-4 py-3 text-slate-600">{formatDate(e.dataDoe)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEdit(e)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(e.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
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
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Editar Evolução' : 'Nova Evolução'}</h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Servidor *</label>
                <select required value={form.servidorId} onChange={(e) => setForm({ ...form, servidorId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white">
                  <option value="">Selecione</option>
                  {servidoresElegiveis.map((s) => (<option key={s.id} value={s.id}>{s.nome} ({s.cargo})</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <select required value={form.tipo} onChange={(e) => {
                  // Auto-preenche todos os campos dependentes ao selecionar o tipo
                  const tipoLabel = e.target.value;
                  const ordinalIdx = ORDINAIS.findIndex(o => tipoLabel.startsWith(o));
                  if (ordinalIdx >= 0 && ordinalIdx < NIVEIS.length - 1) {
                    const nivelOrigem = NIVEIS[ordinalIdx];
                    const nivelDestino = NIVEIS[ordinalIdx + 1];
                    // Determinar regras baseado no cargo do servidor selecionado
                    const servSelecionado = servidores.find(s => String(s.id) === form.servidorId);
                    const c = servSelecionado?.cargo?.toUpperCase() || '';
                    const regras = (c.includes('DIRETOR') ? REGRAS_DIRETOR : REGRAS_DOCENTE).find(r => r.de === nivelOrigem);
                    setForm({
                      ...form,
                      tipo: tipoLabel,
                      transicao: `${nivelOrigem} → ${nivelDestino}`,
                      nivelOrigem,
                      nivelDestino,
                      intersticioAnos: String(regras?.anos || 0),
                    });
                  } else {
                    setForm({ ...form, tipo: tipoLabel, transicao: '', nivelOrigem: '', nivelDestino: '', intersticioAnos: '' });
                  }
                }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white">
                  <option value="">Selecione</option>
                  {ORDINAIS.map((o, i) => (<option key={i} value={`${o} Evolução`}>{o} Evolução (Nível {NIVEIS[i]} → {NIVEIS[i + 1]})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transição</label>
                  <input value={form.transicao} onChange={(e) => setForm({ ...form, transicao: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interstício (anos)</label>
                  <input value={form.intersticioAnos} onChange={(e) => setForm({ ...form, intersticioAnos: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50" readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data da Vigência *</label>
                  <input type="date" required value={form.dataVigencia} onChange={(e) => setForm({ ...form, dataVigencia: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data do DOE</label>
                  <input type="date" value={form.dataDoe} onChange={(e) => setForm({ ...form, dataDoe: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-600/20">
                  {editingId ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
