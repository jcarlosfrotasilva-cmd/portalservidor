'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus, Edit, Trash2, X, Loader2, Calendar, FileText, User, Search,
  AlertCircle, CheckCircle2, Award, Clock, ChevronRight, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GestaoLicencaPremioPage() {
  const [servidores, setServidores] = useState<any[]>([]);
  const [certidoes, setCertidoes] = useState<any[]>([]);
  const [fruiçoes, setFruiçoes] = useState<Record<number, any[]>>({});
  const [calcData, setCalcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServidorId, setSelectedServidorId] = useState<number | null>(null);

  // Modal certidão
  const [showCertidaoModal, setShowCertidaoModal] = useState(false);
  const [editingCertidaoId, setEditingCertidaoId] = useState<number | null>(null);
  const [certForm, setCertForm] = useState({
    servidorId: '', numeroCertidao: '', anoCertidao: '', periodoInicial: '', periodoFinal: '', dataDoe: '',
  });

  // Modal fruição
  const [showFruicaoModal, setShowFruicaoModal] = useState(false);
  const [selectedCertidaoId, setSelectedCertidaoId] = useState<number | null>(null);
  const [frucForm, setFrucForm] = useState({
    certidaoId: '', tipo: 'GOZO', dias: '', dataInicio: '', dataFinal: '', dataDoeAprovacao: '', anoPecunia: '', observacao: '',
  });

  // Expanded certidao for fruicoes
  const [expandedCert, setExpandedCert] = useState<number | null>(null);

  const loadServidores = useCallback(async () => {
    try {
      const res = await fetch('/api/servidores');
      if (res.ok) setServidores(await res.json());
    } catch { /* */ }
  }, []);

  const loadCertidoes = useCallback(async (servidorId: number | null) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/licenca-premio/certidao?servidorId=${servidorId || '0'}`);
      if (res.ok) {
        const data = await res.json();
        setCertidoes(servidorId ? data : []);
      }
      if (servidorId) {
        const cRes = await fetch(`/api/licenca-premio/calculo?servidorId=${servidorId}`);
        if (cRes.ok) setCalcData(await cRes.json());
      } else {
        setCalcData(null);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const loadFruiçoes = useCallback(async (certidaoId: number) => {
    try {
      const res = await fetch(`/api/licenca-premio/fruicao?certidaoId=${certidaoId}`);
      if (res.ok) {
        const data = await res.json();
        setFruiçoes(prev => ({ ...prev, [certidaoId]: data }));
      }
    } catch { /* */ }
  }, []);

  useEffect(() => {
     loadServidores(); }, [loadServidores]);

  const handleServidorChange = (id: string) => {
    if (!id) { setSelectedServidorId(null); setCertidoes([]); setCalcData(null); return; }
    setSelectedServidorId(parseInt(id));
    loadCertidoes(parseInt(id));
  };

  const toggleExpand = (certId: number) => {
    if (expandedCert === certId) {
      setExpandedCert(null);
    } else {
      setExpandedCert(certId);
      if (!fruiçoes[certId]) loadFruiçoes(certId);
    }
  };

  const resetCertForm = () => {
    setCertForm({ servidorId: '', numeroCertidao: '', anoCertidao: '', periodoInicial: '', periodoFinal: '', dataDoe: '' });
    setEditingCertidaoId(null);
    setShowCertidaoModal(false);
  };

  const handleEditCertidao = (c: any) => {
    setCertForm({
      numeroCertidao: c.numeroCertidao || '',
      anoCertidao: String(c.anoCertidao || ''),
      periodoInicial: c.periodoInicial || '',
      periodoFinal: c.periodoFinal || '',
      dataDoe: c.dataDoe || '',
      servidorId: String(c.servidorId),
    });
    setEditingCertidaoId(c.id);
    setShowCertidaoModal(true);
  };

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.numeroCertidao || !certForm.anoCertidao || !certForm.periodoInicial || !certForm.periodoFinal) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const saveToast = toast.loading(editingCertidaoId ? 'Atualizando...' : 'Cadastrando certidão...');
    try {
      const url = editingCertidaoId ? `/api/licenca-premio/certidao/${editingCertidaoId}` : '/api/licenca-premio/certidao';
      const method = editingCertidaoId ? 'PUT' : 'POST';
      const body = editingCertidaoId ? certForm : { ...certForm, servidorId: String(selectedServidorId) };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success('Certidão salva!', { id: saveToast });
        resetCertForm();
        if (selectedServidorId) loadCertidoes(selectedServidorId);
      } else {
        const err = await res.json();
        toast.error(err.error, { id: saveToast });
      }
    } catch { toast.error('Erro de conexão', { id: saveToast }); }
  };

  const handleDeleteCertidao = async (id: number) => {
    if (!confirm('Excluir esta certidão?')) return;
    const delToast = toast.loading('Excluindo...');
    try {
      const res = await fetch(`/api/licenca-premio/certidao/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Certidão excluída!', { id: delToast });
        if (selectedServidorId) loadCertidoes(selectedServidorId);
      } else { toast.error('Erro ao excluir', { id: delToast }); }
    } catch { toast.error('Erro de conexão', { id: delToast }); }
  };

  const resetFrucForm = () => {
    setFrucForm({ certidaoId: '', tipo: 'GOZO', dias: '', dataInicio: '', dataFinal: '', dataDoeAprovacao: '', anoPecunia: '', observacao: '' });
    setShowFruicaoModal(false);
    setSelectedCertidaoId(null);
  };

  const handleOpenFruicao = (certId: number, tipo: 'GOZO' | 'PECUNIA' = 'GOZO') => {
    setSelectedCertidaoId(certId);
    setFrucForm({
      certidaoId: String(certId),
      tipo,
      dias: tipo === 'PECUNIA' ? '30' : '',
      dataInicio: '', dataFinal: '', dataDoeAprovacao: '',
      anoPecunia: '', observacao: '',
    });
    setShowFruicaoModal(true);
  };

  const handleFrucSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dias = parseInt(frucForm.dias);
    if (!frucForm.certidaoId || isNaN(dias) || dias <= 0) {
      toast.error('Dias inválidos');
      return;
    }

    if (frucForm.tipo === 'GOZO') {
      if (!frucForm.dataInicio || !frucForm.dataFinal) {
        toast.error('Data de início e fim são obrigatórias para Gozo');
        return;
      }
      if (![15, 30, 45, 60, 75, 90].includes(dias)) {
        toast.error('Gozo deve ser: 15, 30, 45, 60, 75 ou 90 dias');
        return;
      }
    }

    if (frucForm.tipo === 'PECUNIA') {
      if (dias !== 30) {
        toast.error('Pecúnia deve ser 30 dias');
        return;
      }
      if (!frucForm.anoPecunia) {
        toast.error('Ano da pecúnia é obrigatório');
        return;
      }
    }

    const saveToast = toast.loading('Registrando fruição...');
    try {
      const res = await fetch('/api/licenca-premio/fruicao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(frucForm),
      });
      if (res.ok) {
        toast.success('Fruição registrada!', { id: saveToast });
        resetFrucForm();
        if (selectedServidorId) loadCertidoes(selectedServidorId);
        if (frucForm.certidaoId) loadFruiçoes(parseInt(frucForm.certidaoId));
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro ao registrar', { id: saveToast });
      }
    } catch { toast.error('Erro de conexão', { id: saveToast }); }
  };

  const formatDate = (d: string | null) => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };

  const servidoresElegiveis = servidores.filter(s => {
    const cat = (s.categoria || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return cat.includes('A-EFETIVO') || cat.includes('ACT-F') || cat.includes('AEFETIVO');
  });

  return (
    <DashboardLayout variant="gestao">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </span>
          Licença Prêmio
        </h1>
        <p className="text-slate-500 text-sm mt-1">Gestão de certidões, fruções em gozo e pecúnia</p>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-teal-800 text-sm">Regras da Licença Prêmio</h3>
            <p className="text-sm text-teal-700 mt-1 leading-relaxed">
              Cada certidão concede <strong>90 dias</strong> de saldo. Fruções em <strong>Gozo</strong> podem ser de 15, 30, 45, 60, 75 ou 90 dias.
              Fruções em <strong>Pecúnia</strong> são de 30 dias. Gozo e Pecúnia são abatidos do mesmo saldo.
              Apenas categorias <strong>A-EFETIVO</strong> e <strong>ACT-F</strong> são elegíveis.
            </p>
          </div>
        </div>
      </div>

      {/* Select Server */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-slate-800">Selecionar Servidor Elegível</h2>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <select
            value={selectedServidorId || ''}
            onChange={(e) => handleServidorChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white appearance-none"
          >
            <option value="">Selecione um servidor elegível...</option>
            {servidoresElegiveis.map(s => (
              <option key={s.id} value={s.id}>{s.nome} — {s.cargo} — {s.categoria}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedServidorId && calcData && !calcData.elegivel && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-amber-800">Servidor não elegível</h3>
          <p className="text-sm text-amber-700 mt-1">Apenas A-EFETIVO ou ACT-F.</p>
        </div>
      )}

      {selectedServidorId && calcData?.elegivel && (
        <>
          {/* Server Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <User className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{calcData.nome}</h3>
                <p className="text-sm text-slate-500">{calcData.cargo} • {calcData.categoria}</p>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-center">
              <p className="text-2xl font-bold text-slate-800">{calcData.totalCertidoes}</p>
              <p className="text-xs text-slate-500">Certidões</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-center">
              <p className="text-2xl font-bold text-emerald-600">{calcData.totalPotencial}</p>
              <p className="text-xs text-slate-500">Dias Totais</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-center">
              <p className="text-2xl font-bold text-amber-600">{calcData.totalUsado}</p>
              <p className="text-xs text-slate-500">Dias Usados</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-center">
              <p className="text-2xl font-bold text-green-600">{calcData.totalSaldo}</p>
              <p className="text-xs text-slate-500">Dias Disponíveis</p>
            </div>
          </div>

          {/* Certidões */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Certidões ({certidoes.length})
              </h3>
              <button onClick={() => { setCertForm(p => ({ ...p, servidorId: String(selectedServidorId) })); setShowCertidaoModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-medium shadow-lg shadow-teal-600/20">
                <Plus className="w-4 h-4" /> Nova Certidão
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
            ) : certidoes.length === 0 ? (
              <div className="text-center py-16">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Nenhuma certidão cadastrada</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {certidoes.map(c => {
                  const saldo = (c.saldoTotal ?? 90) - (c.saldoUsado ?? 0);
                  const frs = fruiçoes[c.id] || [];
                  const isExpanded = expandedCert === c.id;
                  return (
                    <div key={c.id}>
                      {/* Certidão Row */}
                      <div className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <button onClick={() => toggleExpand(c.id)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 hover:bg-slate-200 transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800">{c.numeroCertidao}</span>
                            <span className="text-sm text-slate-500">{c.anoCertidao}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(c.periodoInicial)} → {formatDate(c.periodoFinal)}</span>
                            {c.dataDoe && <span>DOE: {formatDate(c.dataDoe)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Saldo Bar */}
                          <div className="w-40 hidden md:block">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                              <span>Saldo: {saldo} dias</span>
                              <span>{c.saldoUsado ?? 0}/90</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${((c.saldoUsado ?? 0) / 90) * 100}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleOpenFruicao(c.id, 'GOZO')} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center" title="Gozo">
                              <Clock className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleOpenFruicao(c.id, 'PECUNIA')} className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center" title="Pecúnia">
                              <Award className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditCertidao(c)} className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteCertidao(c.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>

                      {/* Fruições */}
                      {isExpanded && (
                        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <ChevronDown className="w-4 h-4" /> Fruições ({frs.length})
                          </h4>
                          {frs.length === 0 ? (
                            <p className="text-sm text-slate-400">Nenhuma fruição registrada</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {frs.map(f => (
                                <div key={f.id} className={`rounded-xl p-3 border ${f.tipo === 'GOZO' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`font-bold text-sm ${f.tipo === 'GOZO' ? 'text-blue-700' : 'text-purple-700'}`}>
                                      {f.tipo === 'GOZO' ? '🏖️ Gozo' : '💰 Pecúnia'} — {f.dias} dias
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${f.status === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{f.status}</span>
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                                    {f.tipo === 'GOZO' && f.dataInicio && (
                                      <p>Início: {formatDate(f.dataInicio)} → Fim: {formatDate(f.dataFinal)}</p>
                                    )}
                                    {f.dataDoeAprovacao && <p>DOE: {formatDate(f.dataDoeAprovacao)}</p>}
                                    {f.tipo === 'PECUNIA' && f.anoPecunia && <p>Ano: {f.anoPecunia}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Certidão */}
      {showCertidaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">{editingCertidaoId ? 'Editar Certidão' : 'Nova Certidão'}</h2>
              <button onClick={resetCertForm} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCertSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nº da Certidão *</label>
                <input required value={certForm.numeroCertidao} onChange={(e) => setCertForm({ ...certForm, numeroCertidao: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ano da Certidão *</label>
                <input type="number" required value={certForm.anoCertidao} onChange={(e) => setCertForm({ ...certForm, anoCertidao: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Período Inicial *</label>
                  <input type="date" required value={certForm.periodoInicial} onChange={(e) => setCertForm({ ...certForm, periodoInicial: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Período Final *</label>
                  <input type="date" required value={certForm.periodoFinal} onChange={(e) => setCertForm({ ...certForm, periodoFinal: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data do DOE</label>
                <input type="date" value={certForm.dataDoe} onChange={(e) => setCertForm({ ...certForm, dataDoe: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-700">
                <CheckCircle2 className="w-4 h-4 inline mr-1" /> Saldo: <strong>90 dias</strong> (Gozo: 15/30/45/60/75/90 dias | Pecúnia: 30 dias)
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetCertForm} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20">{editingCertidaoId ? 'Salvar' : 'Cadastrar Certidão'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fruição */}
      {showFruicaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">Nova Fruição</h2>
              <button onClick={resetFrucForm} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleFrucSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <select required value={frucForm.tipo} onChange={(e) => {
                  const t = e.target.value as 'GOZO' | 'PECUNIA';
                  setFrucForm({ ...frucForm, tipo: t, dias: t === 'PECUNIA' ? '30' : '' });
                }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white">
                  <option value="GOZO">🏖️ Gozo (15/30/45/60/75/90 dias)</option>
                  <option value="PECUNIA">💰 Pecúnia (30 dias)</option>
                </select>
              </div>

              {frucForm.tipo === 'GOZO' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gozo de Dias *</label>
                    <select required value={frucForm.dias} onChange={(e) => setFrucForm({ ...frucForm, dias: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white">
                      <option value="">Selecione</option>
                      {[15, 30, 45, 60, 75, 90].map(d => (<option key={d} value={d}>{d} dias</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data Início *</label>
                      <input type="date" required value={frucForm.dataInicio} onChange={(e) => setFrucForm({ ...frucForm, dataInicio: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data Final *</label>
                      <input type="date" required value={frucForm.dataFinal} onChange={(e) => setFrucForm({ ...frucForm, dataFinal: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                    </div>
                  </div>
                </>
              )}

              {frucForm.tipo === 'PECUNIA' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dias (fixo)</label>
                    <input value="30" readOnly className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ano da Pecúnia *</label>
                    <input type="number" required value={frucForm.anoPecunia} onChange={(e) => setFrucForm({ ...frucForm, anoPecunia: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Autorização do DOE</label>
                <input type="date" value={frucForm.dataDoeAprovacao} onChange={(e) => setFrucForm({ ...frucForm, dataDoeAprovacao: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>

              {/* Saldo Warning */}
              {selectedCertidaoId && (() => {
                const cert = certidoes.find(c => c.id === selectedCertidaoId);
                if (!cert) return null;
                const saldo = (cert.saldoTotal ?? 90) - (cert.saldoUsado ?? 0);
                const dias = parseInt(frucForm.dias) || 0;
                const insuficiente = dias > saldo;
                return (
                  <div className={`rounded-xl p-3 text-sm flex items-center gap-2 ${insuficiente ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-teal-50 border border-teal-200 text-teal-700'}`}>
                    {insuficiente ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                    {insuficiente
                      ? <span>⚠️ Saldo insuficiente! Saldo: <strong>{saldo} dias</strong>, solicitado: <strong>{dias} dias</strong></span>
                      : <span>Saldo disponível: <strong>{saldo} dias</strong>. Após fruição: <strong>{saldo - dias} dias</strong></span>
                    }
                  </div>
                );
              })()}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
                <textarea value={frucForm.observacao} onChange={(e) => setFrucForm({ ...frucForm, observacao: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetFrucForm} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20">Registrar Fruição</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
