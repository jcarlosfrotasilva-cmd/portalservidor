'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Users,
  X,
  Save,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function GestaoServidoresPage() {
  const [servidores, setServidores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [form, setForm] = useState({
    nome: '', cpf: '', rgcin: '', dtnasc: '', sexo: '',
    tel: '', email: '', cargo: '', categoria: '',
    faixa: '', nivel: '', jornada: '', lotacao: '', situacao: 'ATIVO',
    senha: '',
    dataAdmissao: new Date().toISOString().split('T')[0],
  });

  const loadServidores = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/servidores?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setServidores(data);
      }
    } catch {
      toast.error('Erro ao carregar servidores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    
    loadServidores();
  }, [loadServidores]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    loadServidores(e.target.value);
  };

  const resetForm = () => {
    setForm({
      nome: '', cpf: '', rgcin: '', dtnasc: '', sexo: '',
      tel: '', email: '', cargo: '', categoria: '',
      faixa: '', nivel: '', jornada: '', lotacao: '', situacao: 'ATIVO',
      senha: '',
      dataAdmissao: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (s: any) => {
    setForm({
      nome: s.nome || '',
      cpf: s.cpf || '',
      rgcin: s.rgcin || '',
      dtnasc: s.dtnasc || '',
      sexo: s.sexo || '',
      tel: s.tel || '',
      email: s.email || '',
      cargo: s.cargo || '',
      categoria: s.categoria || '',
      faixa: s.faixa || '',
      nivel: s.nivel || '',
      jornada: s.jornada || '',
      lotacao: s.lotacao || '',
      situacao: s.situacao || 'ATIVO',
      senha: s.senha || '',
      dataAdmissao: s.dataAdmissao || '',
    });
    setEditingId(s.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.cpf) {
      toast.error('Nome e CPF são obrigatórios');
      return;
    }

    const cpfClean = form.cpf.replace(/[^\d]/g, '');
    if (cpfClean.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    const saveToast = toast.loading(editingId ? 'Atualizando...' : 'Cadastrando...');

    try {
      const url = editingId
        ? `/api/servidores/${editingId}`
        : '/api/servidores';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cpf: cpfClean }),
      });

      if (res.ok) {
        toast.success(editingId ? 'Servidor atualizado!' : 'Servidor cadastrado!', { id: saveToast });
        resetForm();
        loadServidores(search);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro na operação', { id: saveToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: saveToast });
    }
  };

  const handleDelete = async (id: number) => {
    const delToast = toast.loading('Excluindo...');
    try {
      const res = await fetch(`/api/servidores/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Servidor excluído!', { id: delToast });
        setDeleteConfirm(null);
        loadServidores(search);
      } else {
        toast.error('Erro ao excluir', { id: delToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: delToast });
    }
  };

  const SituacaoBadge = ({ s }: { s: string }) => {
    const cls = s === 'ATIVO' ? 'bg-green-100 text-green-700' : s.includes('LICENCA') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{s}</span>;
  };

  return (
    <DashboardLayout variant="gestao">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerenciar Servidores</h1>
          <p className="text-slate-500 text-sm">{servidores.length} servidores cadastrados</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/gestao/upload"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-all text-sm font-medium shadow-lg shadow-accent-600/20"
          >
            <Save className="w-4 h-4" />
            Upload Excel
          </Link>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all text-sm font-medium shadow-lg shadow-brand-600/20"
          >
            <Plus className="w-4 h-4" />
            Novo Servidor
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome, CPF, cargo, lotação..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : servidores.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum servidor encontrado</p>
            <p className="text-slate-400 text-sm mt-1">Cadastre servidores ou faça upload de uma planilha</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">CPF</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Cargo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Lotação</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Situação</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {servidores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{s.cpf}</td>
                    <td className="px-4 py-3 text-slate-600">{s.cargo || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.lotacao || '—'}</td>
                    <td className="px-4 py-3"><SituacaoBadge s={s.situacao || 'ATIVO'} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === s.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(s.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Editar Servidor' : 'Cadastrar Servidor'}
              </h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF *</label>
                  <input
                    required
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value.replace(/[^\d]/g, '').substring(0, 11) })}
                    placeholder="00000000000"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RG-CIN</label>
                  <input
                    value={form.rgcin}
                    onChange={(e) => setForm({ ...form, rgcin: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={form.dtnasc}
                    onChange={(e) => setForm({ ...form, dtnasc: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                  <select
                    value={form.sexo}
                    onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input
                    value={form.tel}
                    onChange={(e) => setForm({ ...form, tel: e.target.value })}
                    placeholder="(XX) XXXXX-XXXX"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                  <input
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <input
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Faixa</label>
                  <input
                    value={form.faixa}
                    onChange={(e) => setForm({ ...form, faixa: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nível</label>
                  <input
                    value={form.nivel}
                    onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jornada</label>
                  <input
                    value={form.jornada}
                    onChange={(e) => setForm({ ...form, jornada: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lotação</label>
                  <input
                    value={form.lotacao}
                    onChange={(e) => setForm({ ...form, lotacao: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Situação</label>
                  <select
                    value={form.situacao}
                    onChange={(e) => setForm({ ...form, situacao: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                    <option value="LICENCA">Licença</option>
                    <option value="aposentado">Aposentado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Admissão</label>
                  <input
                    type="date"
                    value={form.dataAdmissao}
                    onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                  <input
                    type="text"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    placeholder="Senha de acesso"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">Padrão: 123456 ou data de nascimento DDMMAAAA</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                >
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Servidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
