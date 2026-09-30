'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus, Edit, Trash2, X, Loader2, Calendar, FileText, User, Search,
  Clock, Filter, TrendingUp, Award, BookOpen, Briefcase, UserX,
  AlertCircle, CheckCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIAS = [
  { value: 'POSSE', label: 'Posse/Admissão', icon: Briefcase, cor: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'PROGRESSAO', label: 'Progressão Funcional', icon: TrendingUp, cor: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'LICENCA', label: 'Licença', icon: Calendar, cor: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'AFASTAMENTO', label: 'Afastamento', icon: UserX, cor: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'EVOLUCAO', label: 'Evolução Funcional', icon: TrendingUp, cor: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'ATS', label: 'ATS (Quinquênio)', icon: Award, cor: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'LOTACAO', label: 'Lotação', icon: Briefcase, cor: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { value: 'CAPACITACAO', label: 'Capacitação', icon: BookOpen, cor: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { value: 'FALTAS', label: 'Faltas/Ausências', icon: UserX, cor: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'OT', label: 'Orientação Técnica', icon: BookOpen, cor: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'OUTROS', label: 'Outros', icon: FileText, cor: 'bg-slate-100 text-slate-700 border-slate-300' },
];

const TIPOS_POR_CATEGORIA: Record<string, string[]> = {
  POSSE: ['Posse em Cargo Efetivo', 'Nomeação', 'Exercício'],
  PROGRESSAO: ['Progressão Horizontal', 'Progressão Vertical', 'Mudança de Nível'],
  LICENCA: ['Licença Prêmio', 'Licença Saúde', 'Licença Maternidade', 'Licença Paternidade', 'Licença para Capacitação'],
  AFASTAMENTO: ['Afastamento para Estudo', 'Afastamento para Tratamento de Saúde', 'Cessão', 'Requisição'],
  EVOLUCAO: ['Evolução Funcional'],
  ATS: ['Quinquênio'],
  LOTACAO: ['Remoção', 'Redistribuição', 'Mudança de Unidade'],
  CAPACITACAO: ['Curso de Capacitação', 'Pós-Graduação', 'Mestrado', 'Doutorado', 'Workshop', 'Seminário'],
  FALTAS: ['Falta Justificada', 'Falta Injustificada', 'Falta Médica', 'Falta Total'],
  OT: ['Orientação Técnica', 'Formação Continuada', 'Reunião Pedagógica'],
  OUTROS: ['Outro'],
};

export default function GestaoHistoricoPage() {
  const [servidores, setServidores] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServidorId, setSelectedServidorId] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [busca, setBusca] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [form, setForm] = useState({
    servidorId: '',
    categoria: '',
    tipo: '',
    descricao: '',
    data: '',
    dataFim: '',
    numeroDocumento: '',
    dataDocumento: '',
    observacoes: '',
    registradoPor: '',
  });

  const loadServidores = useCallback(async () => {
    try {
      const res = await fetch('/api/servidores');
      if (res.ok) setServidores(await res.json());
    } catch { /* */ }
  }, []);

  const loadRegistros = useCallback(async (servId: string, categoria: string, buscaText: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (servId) params.set('servidorId', servId);
      if (categoria && categoria !== 'TODAS') params.set('categoria', categoria);
      if (buscaText) params.set('busca', buscaText);

      const res = await fetch(`/api/historico-funcional?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRegistros(data.registros || []);
        setEstatisticas(data.estatisticas);
      } else {
        setRegistros([]);
        setEstatisticas(null);
      }
    } catch {
      setRegistros([]);
      setEstatisticas(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServidores();
  }, [loadServidores]);

  useEffect(() => {
    loadRegistros(selectedServidorId, filtroCategoria, busca);
  }, [selectedServidorId, filtroCategoria, busca, loadRegistros]);

  const resetForm = () => {
    setForm({
      servidorId: selectedServidorId || '',
      categoria: '',
      tipo: '',
      descricao: '',
      data: '',
      dataFim: '',
      numeroDocumento: '',
      dataDocumento: '',
      observacoes: '',
      registradoPor: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (r: any) => {
    setForm({
      servidorId: String(r.servidorId),
      categoria: r.categoria || '',
      tipo: r.tipo || '',
      descricao: r.descricao || '',
      data: r.data || '',
      dataFim: r.dataFim || '',
      numeroDocumento: r.numeroDocumento || '',
      dataDocumento: r.dataDocumento || '',
      observacoes: r.observacoes || '',
      registradoPor: r.registradoPor || '',
    });
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.servidorId || !form.categoria || !form.tipo || !form.descricao || !form.data) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const saveToast = toast.loading(editingId ? 'Atualizando...' : 'Registrando...');
    try {
      const url = editingId ? `/api/historico-funcional/${editingId}` : '/api/historico-funcional';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editingId ? 'Atualizado!' : 'Registrado!', { id: saveToast });
        resetForm();
        loadRegistros(selectedServidorId, filtroCategoria, busca);
      } else {
        const err = await res.json();
        toast.error(err.error, { id: saveToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: saveToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este registro do histórico?')) return;
    const delToast = toast.loading('Excluindo...');
    try {
      const res = await fetch(`/api/historico-funcional/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Excluído!', { id: delToast });
        loadRegistros(selectedServidorId, filtroCategoria, busca);
      } else {
        toast.error('Erro ao excluir', { id: delToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: delToast });
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const p = d.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  const getCategoriaInfo = (cat: string) =>
    CATEGORIAS.find(c => c.value === cat) || CATEGORIAS[CATEGORIAS.length - 1];

  return (
    <DashboardLayout variant="gestao">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </span>
          Histórico Funcional
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Prontuário funcional completo dos servidores — todas as movimentações em um só lugar
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="font-bold text-slate-800">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Servidor</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <select
                value={selectedServidorId}
                onChange={(e) => setSelectedServidorId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm bg-white appearance-none"
              >
                <option value="">Todos os servidores</option>
                {servidores.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm bg-white"
            >
              <option value="TODAS">Todas as categorias</option>
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Buscar</label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Tipo, descrição ou documento..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-5 mb-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Estatísticas
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(estatisticas.porCategoria || {}).map(([cat, count]) => {
              const info = getCategoriaInfo(cat);
              return (
                <div
                  key={cat}
                  className={`px-3 py-2 rounded-lg border ${info.cor} flex items-center gap-2`}
                >
                  <info.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{info.label}</span>
                  <span className="font-bold">{count as number}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800">Registros ({registros.length})</h3>
        <button
          type="button"
          onClick={() => {
            setForm(p => ({ ...p, servidorId: selectedServidorId || '' }));
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 text-sm font-medium shadow-lg shadow-slate-800/20"
        >
          <Plus className="w-4 h-4" /> Novo Registro
        </button>
      </div>

      {/* Timeline de Registros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum registro encontrado</p>
            <p className="text-slate-400 text-sm mt-1">Registre movimentações funcionais dos servidores</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {registros.map((r) => {
              const catInfo = getCategoriaInfo(r.categoria);
              const CatIcon = catInfo.icon;
              const isExpanded = expandedId === r.id;
              return (
                <div key={r.id} className="relative">
                  {/* Linha da timeline */}
                  <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-200" />

                  <div className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors relative">
                    {/* Ícone da categoria */}
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
                            {r.servidor && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" /> {r.servidor.nome}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(r)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 px-6 py-4 border-b flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                {editingId ? 'Editar' : 'Novo'} Registro de Histórico
              </h2>
              <button type="button" onClick={resetForm} className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Servidor *</label>
                <select required value={form.servidorId} onChange={(e) => setForm({ ...form, servidorId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm bg-white">
                  <option value="">Selecione o servidor</option>
                  {servidores.map(s => (<option key={s.id} value={s.id}>{s.nome} ({s.cargo || 'Sem cargo'})</option>))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
                  <select required value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value, tipo: '' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm bg-white">
                    <option value="">Selecione</option>
                    {CATEGORIAS.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select required value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm bg-white">
                    <option value="">Selecione</option>
                    {form.categoria && (TIPOS_POR_CATEGORIA[form.categoria] || []).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    {form.categoria && (
                      <option value="__outro__">Outro (especificar na descrição)</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Detalhada *</label>
                <textarea required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3}
                  placeholder="Descreva detalhadamente a movimentação..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data do Fato *</label>
                  <input type="date" required value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Final (se aplicável)</label>
                  <input type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nº do Documento</label>
                  <input value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
                    placeholder="Ex: DOE 15/03/2025, Portaria 123"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data do Documento</label>
                  <input type="date" value={form.dataDocumento} onChange={(e) => setForm({ ...form, dataDocumento: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registrado Por</label>
                <input value={form.registradoPor} onChange={(e) => setForm({ ...form, registradoPor: e.target.value })}
                  placeholder="Nome de quem registrou"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-slate-800 rounded-xl hover:bg-slate-700 shadow-lg shadow-slate-800/20">
                  {editingId ? 'Salvar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
