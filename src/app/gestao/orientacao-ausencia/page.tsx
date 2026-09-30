'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus, Edit, Trash2, X, Loader2, Calendar, MapPin, Clock,
  User, Search, BookOpen, UserX,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Todos os tipos unificados (O.T. + Ausências)
const SUBTIPOS = [
  { value: 'ORIENTACAO_TECNICA', label: 'Orientação Técnica', tipo: 'OT' },
  { value: 'FALTA_JUSTIFICADA', label: 'Falta Justificada', tipo: 'AUSENCIA' },
  { value: 'FALTA_INJUSTIFICADA', label: 'Falta Injustificada', tipo: 'AUSENCIA' },
  { value: 'FALTA_MEDICA', label: 'Falta Médica', tipo: 'AUSENCIA' },
  { value: 'FALTA_TOTAL', label: 'Falta Total', tipo: 'AUSENCIA' },
  { value: 'FALTA_MEDICA_PARCIAL', label: 'Falta Médica Parcial', tipo: 'AUSENCIA' },
  { value: 'FALTA_AULA', label: 'Falta de Aula (por hora/aula)', tipo: 'AUSENCIA' },
  { value: 'LICENCA_SAUDE', label: 'Licença Saúde', tipo: 'AUSENCIA' },
  { value: 'AUXILIO_DOENCA', label: 'Auxílio-Doença', tipo: 'AUSENCIA' },
];

const precisaDataInicioFim = (subtipo: string) =>
  subtipo === 'LICENCA_SAUDE' || subtipo === 'AUXILIO_DOENCA';
const precisaQtdHoras = (subtipo: string) =>
  subtipo === 'FALTA_AULA';
const precisaHoraInicioTermino = (subtipo: string) =>
  subtipo === 'ORIENTACAO_TECNICA';

export default function GestaoOrientacaoPage() {
  const [servidores, setServidores] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServidorId, setSelectedServidorId] = useState<string>('');
  const [filtro, setFiltro] = useState<'TODOS' | 'OT' | 'AUSENCIA'>('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    servidorId: '', subtipo: '', data: '',
    dataInicio: '', dataFim: '', quantidadeHoras: '',
    assunto: '', local: '', horaInicio: '', horaTermino: '',
    dataDoeOuEmail: '', observacao: '',
  });

  const loadServidores = useCallback(async () => {
    try {
      const res = await fetch('/api/servidores');
      if (res.ok) setServidores(await res.json());
    } catch { /* */ }
  }, []);

  const loadRegistros = useCallback(async (servId: string, tipo: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (servId && servId !== '') params.set('servidorId', servId);
      if (tipo && tipo !== 'TODOS') params.set('tipo', tipo);
      const res = await fetch(`/api/orientacao-ausencia?${params}`);
      if (res.ok) {
        const data = await res.json();
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
    loadServidores();
  }, [loadServidores]);

  useEffect(() => {
    loadRegistros(selectedServidorId, filtro);
  }, [selectedServidorId, filtro, loadRegistros]);

  const handleServidorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServidorId(e.target.value);
  };

  const handleFiltroChange = (f: 'TODOS' | 'OT' | 'AUSENCIA') => {
    setFiltro(f);
  };

  const resetForm = () => {
    setForm({
      servidorId: selectedServidorId || '',
      subtipo: '', data: '',
      dataInicio: '', dataFim: '', quantidadeHoras: '',
      assunto: '', local: '', horaInicio: '', horaTermino: '',
      dataDoeOuEmail: '', observacao: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const calularDias = useCallback(() => {
    if (!form.dataInicio || !form.dataFim) return 0;
    const d1 = new Date(form.dataInicio + 'T00:00:00');
    const d2 = new Date(form.dataFim + 'T00:00:00');
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff;
  }, [form.dataInicio, form.dataFim]);

  const handleEdit = (r: any) => {
    setForm({
      servidorId: String(r.servidorId),
      subtipo: r.subtipo || '',
      data: r.data || '',
      dataInicio: r.dataInicio || '',
      dataFim: r.dataFim || '',
      quantidadeHoras: r.quantidadeHoras ? String(r.quantidadeHoras) : '',
      assunto: r.assunto || '',
      local: r.local || '',
      horaInicio: r.horaInicio || '',
      horaTermino: r.horaTermino || '',
      dataDoeOuEmail: r.dataDoeOuEmail || '',
      observacao: r.observacao || '',
    });
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.servidorId || !form.data) {
      toast.error('Servidor e data são obrigatórios');
      return;
    }
    if (!form.subtipo) {
      toast.error('Selecione o tipo');
      return;
    }
    if (precisaDataInicioFim(form.subtipo)) {
      if (!form.dataInicio || !form.dataFim) {
        toast.error('Data de início e fim são obrigatórias para este tipo');
        return;
      }
    }
    if (form.subtipo === 'ORIENTACAO_TECNICA') {
      if (!form.assunto) {
        toast.error('Assunto é obrigatório para Orientação Técnica');
        return;
      }
      if (!form.horaInicio || !form.horaTermino) {
        toast.error('Hora de início e hora de término são obrigatórias para Orientação Técnica');
        return;
      }
    }
    if (precisaQtdHoras(form.subtipo)) {
      if (!form.quantidadeHoras || parseInt(form.quantidadeHoras) <= 0) {
        toast.error('Informe a quantidade de horas/aulas');
        return;
      }
    }

    const saveToast = toast.loading(editingId ? 'Atualizando...' : 'Cadastrando...');
    try {
      const url = editingId ? `/api/orientacao-ausencia/${editingId}` : '/api/orientacao-ausencia';
      const method = editingId ? 'PUT' : 'POST';
      const body: any = {
        ...form,
        tipo: SUBTIPOS.find(s => s.value === form.subtipo)?.tipo || 'AUSENCIA',
      };
      if (precisaDataInicioFim(form.subtipo)) {
        body.quantidadeDias = calularDias();
      }
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingId ? 'Atualizado!' : 'Cadastrado!', { id: saveToast });
        resetForm();
      } else {
        const err = await res.json();
        toast.error(err.error, { id: saveToast });
      }
    } catch { toast.error('Erro de conexão', { id: saveToast }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este registro?')) return;
    const delToast = toast.loading('Excluindo...');
    try {
      const res = await fetch(`/api/orientacao-ausencia/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Excluído!', { id: delToast });
      } else { toast.error('Erro ao excluir', { id: delToast }); }
    } catch { toast.error('Erro de conexão', { id: delToast }); }
  };

  const formatDate = (d: string | null) => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };
  const getSubtipoLabel = (s: string) => SUBTIPOS.find(x => x.value === s)?.label || s;
  const isOT = (s: string) => SUBTIPOS.find(x => x.value === s)?.tipo === 'OT';

  const otCount = registros.filter(r => isOT(r.subtipo)).length;
  const ausenciaCount = registros.filter(r => !isOT(r.subtipo)).length;

  return (
    <DashboardLayout variant="gestao">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
            <UserX className="w-5 h-5 text-white" />
          </span>
          O.T. e Ausências
        </h1>
        <p className="text-slate-500 text-sm mt-1">Registro unificado de Orientações Técnicas e Ausências</p>
      </div>

      {/* Select Server */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-orange-600" />
          <h2 className="font-bold text-slate-800">Filtrar por Servidor</h2>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <select value={selectedServidorId} onChange={handleServidorChange}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white appearance-none">
            <option value="">Todos os servidores</option>
            {servidores.map(s => (<option key={s.id} value={s.id}>{s.nome} — {s.cargo || 'Sem cargo'}</option>))}
          </select>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button type="button" onClick={() => handleFiltroChange('TODOS')}
          className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'TODOS' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          <p className="text-2xl font-bold">{registros.length}</p>
          <p className="text-xs mt-1">Total Registros</p>
        </button>
        <button type="button" onClick={() => handleFiltroChange('OT')}
          className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'OT' ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}>
          <BookOpen className="w-5 h-5 mx-auto mb-1" />
          <p className="text-2xl font-bold">{otCount}</p>
          <p className="text-xs mt-1">Orientações Técnicas</p>
        </button>
        <button type="button" onClick={() => handleFiltroChange('AUSENCIA')}
          className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'AUSENCIA' ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'}`}>
          <UserX className="w-5 h-5 mx-auto mb-1" />
          <p className="text-2xl font-bold">{ausenciaCount}</p>
          <p className="text-xs mt-1">Ausências</p>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800">Registros ({registros.length})</h3>
        <button type="button" onClick={() => { setForm(p => ({ ...p, servidorId: selectedServidorId || '' })); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 text-sm font-medium shadow-lg shadow-orange-600/20">
          <Plus className="w-4 h-4" /> Novo Registro
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
        ) : registros.length === 0 ? (
          <div className="text-center py-16">
            <UserX className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Servidor</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Detalhes</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Local/Horário</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">DOE/E-mail</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registros.map(r => {
                  const servidor = servidores.find(s => s.id === r.servidorId);
                  let detalhes = getSubtipoLabel(r.subtipo || '');
                  if (isOT(r.subtipo)) {
                    detalhes = r.assunto || detalhes;
                  } else {
                    if (r.quantidadeDias) detalhes += ` (${r.quantidadeDias} dias)`;
                    if (r.quantidadeHoras) detalhes += ` (${r.quantidadeHoras}h/aula)`;
                  }
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isOT(r.subtipo) ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isOT(r.subtipo) ? <BookOpen className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {isOT(r.subtipo) ? 'O.T.' : 'Ausência'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{servidor?.nome || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(r.data)}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-48 truncate">{detalhes}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {r.local && <span>{r.local}</span>}
                        {r.horaInicio && r.horaTermino && <span> {r.horaInicio}-{r.horaTermino}</span>}
                        {r.dataInicio && r.dataFim && <span className="block">{formatDate(r.dataInicio)} → {formatDate(r.dataFim)}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{r.dataDoeOuEmail || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => handleEdit(r)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"><Edit className="w-4 h-4" /></button>
                          <button type="button" onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Unificado */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 px-6 py-4 border-b flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserX className="w-5 h-5 text-orange-600" />
                {editingId ? 'Editar' : 'Novo'} Registro
              </h2>
              <button type="button" onClick={resetForm} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Servidor *</label>
                <select required value={form.servidorId} onChange={(e) => setForm({ ...form, servidorId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white">
                  <option value="">Selecione o servidor</option>
                  {servidores.map(s => (<option key={s.id} value={s.id}>{s.nome} ({s.cargo || 'Sem cargo'})</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
                <input type="date" required value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <select required value={form.subtipo} onChange={(e) => {
                  setForm(prev => ({ ...prev, subtipo: e.target.value, dataInicio: '', dataFim: '', quantidadeHoras: '' }));
                }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white">
                  <option value="">Selecione o tipo</option>
                  <optgroup label="Orientação Técnica">
                    <option value="ORIENTACAO_TECNICA">Orientação Técnica</option>
                  </optgroup>
                  <optgroup label="Ausências">
                    {SUBTIPOS.filter(s => s.tipo === 'AUSENCIA').map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </optgroup>
                </select>
              </div>

              {/* Campos para Orientação Técnica: Assunto e Local */}
              {form.subtipo === 'ORIENTACAO_TECNICA' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assunto *</label>
                    <input required value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                      placeholder="Ex: Formação continuada em matemática"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Local</label>
                    <input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })}
                      placeholder="Ex: Escola sede, Sala de professores"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  </div>
                </>
              )}

              {/* Campos para Falta de Aula */}
              {precisaQtdHoras(form.subtipo) && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade de Hora/Aula *</label>
                  <input type="number" min="1" required value={form.quantidadeHoras} onChange={(e) => setForm({ ...form, quantidadeHoras: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
              )}

              {/* Campos para Licença Saúde / Auxílio-Doença (período) */}
              {precisaDataInicioFim(form.subtipo) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início *</label>
                      <input type="date" required value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data Final *</label>
                      <input type="date" required value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                    </div>
                  </div>
                  {form.dataInicio && form.dataFim && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700 font-medium text-center">
                      {formatDate(form.dataInicio)} até {formatDate(form.dataFim)} = <strong>{calularDias()} dias</strong>
                    </div>
                  )}
                </>
              )}

              {/* Campos para Orientação Técnica (hora início e hora término) */}
              {precisaHoraInicioTermino(form.subtipo) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário da Orientação Técnica
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Hora de Início *</label>
                      <input type="time" required value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Hora de Término *</label>
                      <input type="time" required value={form.horaTermino} onChange={(e) => setForm({ ...form, horaTermino: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data do DOE ou Data do E-mail</label>
                <input value={form.dataDoeOuEmail} onChange={(e) => setForm({ ...form, dataDoeOuEmail: e.target.value })}
                  placeholder="Ex: 15/03/2025"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/20">
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
