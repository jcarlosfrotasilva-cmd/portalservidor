'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Printer, User, Search, Award, TrendingUp, Calendar, FileText,
  BookOpen, Briefcase, UserX, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIA_CONFIG: Record<string, { label: string; icon: any; cor: string; bgCard: string }> = {
  POSSE: { label: 'Posse/Admissão', icon: Briefcase, cor: 'bg-blue-100 text-blue-700 border-blue-300', bgCard: 'bg-blue-50/30 border-blue-200' },
  ATS: { label: 'ATS - Quinquênio', icon: Award, cor: 'bg-amber-100 text-amber-700 border-amber-300', bgCard: 'bg-amber-50/30 border-amber-200' },
  EVOLUCAO: { label: 'Evolução Funcional', icon: TrendingUp, cor: 'bg-emerald-100 text-emerald-700 border-emerald-300', bgCard: 'bg-emerald-50/30 border-emerald-200' },
  LICENCA_PREMIO: { label: 'Licença Prêmio', icon: Calendar, cor: 'bg-purple-100 text-purple-700 border-purple-300', bgCard: 'bg-purple-50/30 border-purple-200' },
  LICENCA_PREMIO_FRUICAO: { label: 'Fruição LP', icon: Clock, cor: 'bg-indigo-100 text-indigo-700 border-indigo-300', bgCard: 'bg-indigo-50/30 border-indigo-200' },
  OT: { label: 'Orientação Técnica', icon: BookOpen, cor: 'bg-orange-100 text-orange-700 border-orange-300', bgCard: 'bg-orange-50/30 border-orange-200' },
  AUSENCIA: { label: 'Ausência', icon: UserX, cor: 'bg-red-100 text-red-700 border-red-300', bgCard: 'bg-red-50/30 border-red-200' },
};

export default function GestaoFichaFuncionalPage() {
  const [servidores, setServidores] = useState<any[]>([]);
  const [selectedServidorId, setSelectedServidorId] = useState<string>('');
  const [ficha, setFicha] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroAno, setFiltroAno] = useState<string>('TODOS');
  const [busca, setBusca] = useState<string>('');

  useEffect(() => {
    fetch('/api/servidores').then(res => res.ok ? res.json() : []).then(setServidores);
  }, []);

  const loadFicha = async (servidorId: string) => {
    if (!servidorId) { setFicha(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/ficha-funcional?servidorId=${servidorId}`);
      if (res.ok) {
        setFicha(await res.json());
      } else {
        toast.error('Erro ao carregar ficha funcional');
      }
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleServidorChange = (id: string) => {
    setSelectedServidorId(id);
    loadFicha(id);
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const p = d.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  // Aplicar filtros
  const timelineFiltrada = ficha?.timeline?.filter((item: any) => {
    if (filtroCategoria !== 'TODAS' && item.categoria !== filtroCategoria) return false;
    if (filtroAno !== 'TODOS') {
      const ano = item.data ? new Date(item.data + 'T00:00:00').getFullYear() : null;
      if (ano !== parseInt(filtroAno)) return false;
    }
    if (busca) {
      const termo = busca.toLowerCase();
      const match = (
        item.tipo?.toLowerCase().includes(termo) ||
        item.descricao?.toLowerCase().includes(termo) ||
        item.documento?.toLowerCase().includes(termo)
      );
      if (!match) return false;
    }
    return true;
  }) || [];

  // Anos disponíveis
  const anosDisponiveis = ficha?.estatisticas?.porAno
    ? Object.keys(ficha.estatisticas.porAno).sort((a, b) => parseInt(b) - parseInt(a))
    : [];

  if (!ficha) {
    return (
      <DashboardLayout variant="gestao">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </span>
            Ficha Funcional Consolidada
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Prontuário completo do servidor — consolida ATS, Licença Prêmio, Evolução, O.T. e Ausências
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800">Selecionar Servidor</h2>
          </div>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
            <select
              value={selectedServidorId}
              onChange={(e) => handleServidorChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white appearance-none"
            >
              <option value="">Selecione um servidor...</option>
              {servidores.map(s => (
                <option key={s.id} value={s.id}>{s.nome} — {s.cpf} — {s.cargo || 'Sem cargo'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 text-center">
          <FileText className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
          <h3 className="font-bold text-indigo-800 text-lg mb-2">Nenhum servidor selecionado</h3>
          <p className="text-indigo-600 text-sm">
            Selecione um servidor acima para visualizar sua Ficha Funcional completa
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { servidor, estatisticas } = ficha;
  const catConfig = (cat: string) => CATEGORIA_CONFIG[cat] || CATEGORIA_CONFIG.OT;

  return (
    <DashboardLayout variant="gestao">
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </span>
          Ficha Funcional Consolidada
        </h1>
        <p className="text-slate-500 text-sm mt-1">Prontuário completo — ATS, Licença Prêmio, Evolução, O.T. e Ausências</p>
      </div>

      {/* Cabeçalho do Servidor */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 mb-6 text-white no-print">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{servidor.nome}</h2>
              <p className="text-indigo-100 text-sm mt-1">{servidor.cargo || '—'} • {servidor.categoria || '—'}</p>
              <p className="text-indigo-100 text-xs mt-1">CPF: {servidor.cpf} • Situação: {servidor.situacao || 'ATIVO'}</p>
            </div>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all">
            <Printer className="w-4 h-4" /> Imprimir Ficha
          </button>
        </div>
      </div>

      {/* Cabeçalho para impressão */}
      <div className="hidden print:block mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">FICHA FUNCIONAL</h2>
        <p className="text-slate-600 mt-1">EE Profª Marlene Frattini</p>
        <div className="mt-4 space-y-1 text-sm text-slate-700">
          <p><strong>Servidor:</strong> {servidor.nome}</p>
          <p><strong>CPF:</strong> {servidor.cpf} • <strong>Cargo:</strong> {servidor.cargo || '—'}</p>
          <p><strong>Categoria:</strong> {servidor.categoria || '—'} • <strong>Situação:</strong> {servidor.situacao || 'ATIVO'}</p>
          <p className="text-xs text-slate-500 mt-2">Gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6 no-print">
        <StatCard label="Total" value={estatisticas.totalRegistros} cor="bg-slate-800 text-white" />
        <StatCard label="ATS" value={estatisticas.ats} cor="bg-amber-500 text-white" icon={Award} />
        <StatCard label="Evoluções" value={estatisticas.evolucoes} cor="bg-emerald-500 text-white" icon={TrendingUp} />
        <StatCard label="Certidões LP" value={estatisticas.certidoesLP} cor="bg-purple-500 text-white" icon={Calendar} />
        <StatCard label="O.T." value={estatisticas.ot} cor="bg-orange-500 text-white" icon={BookOpen} />
        <StatCard label="Ausências" value={estatisticas.ausencias} cor="bg-red-500 text-white" icon={UserX} />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 no-print">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-800">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Categoria</label>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="TODAS">Todas as categorias</option>
              {Object.entries(CATEGORIA_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ano</label>
            <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="TODOS">Todos os anos</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano} ({estatisticas.porAno[ano]} registros)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Buscar</label>
            <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
              placeholder="Tipo, descrição ou documento..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      {/* Ficha Funcional - Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600 uppercase">
              Timeline Funcional — {timelineFiltrada.length} registro(s)
            </p>
          </div>

          {timelineFiltrada.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {timelineFiltrada.map((item: any) => {
                const cfg = catConfig(item.categoria);
                const Icon = cfg.icon;
                return (
                  <div key={item.id} className={`px-6 py-4 hover:bg-slate-50/50 ${cfg.bgCard} border-l-4`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${cfg.cor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.cor}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{item.tipo}</span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm mb-2">{item.descricao}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(item.data)}
                            {item.dataFim && ` → ${formatDate(item.dataFim)}`}
                          </span>
                          {item.documento && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Doc: {item.documento}
                            </span>
                          )}
                        </div>

                        {/* Detalhes extras */}
                        {renderDetalhes(item)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Rodapé de impressão */}
      <div className="hidden print:block text-center text-sm text-slate-400 pt-8 mt-8 border-t border-slate-300">
        <p>Portal do Servidor — EE Profª Marlene Frattini</p>
        <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, cor, icon: Icon }: any) {
  return (
    <div className={`rounded-xl p-3 ${cor} text-center shadow-sm`}>
      {Icon && <Icon className="w-4 h-4 mx-auto mb-1 opacity-80" />}
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-90">{label}</p>
    </div>
  );
}

function renderDetalhes(item: any) {
  const detalhes = item.detalhes;
  if (!detalhes) return null;

  const extras: string[] = [];

  if (item.categoria === 'ATS') {
    if (detalhes.valor) extras.push(`Valor: R$ ${Number(detalhes.valor).toFixed(2)}`);
    if (detalhes.proximaVigencia) extras.push(`Próxima vigência: ${formatDate(detalhes.proximaVigencia)}`);
  } else if (item.categoria === 'EVOLUCAO') {
    extras.push(`Nível: ${detalhes.nivelOrigem} → ${detalhes.nivelDestino}`);
    extras.push(`Interstício: ${detalhes.intersticioAnos} anos`);
  } else if (item.categoria === 'LICENCA_PREMIO') {
    extras.push(`Saldo: ${detalhes.saldoDisponivel}/${detalhes.saldoTotal} dias`);
  } else if (item.categoria === 'LICENCA_PREMIO_FRUICAO') {
    if (detalhes.certidaoNumero) extras.push(`Ref. Certidão: ${detalhes.certidaoNumero}/${detalhes.certidaoAno}`);
  } else if (item.categoria === 'OT') {
    if (detalhes.local) extras.push(`Local: ${detalhes.local}`);
    if (detalhes.horaInicio && detalhes.horaTermino) extras.push(`${detalhes.horaInicio} - ${detalhes.horaTermino}`);
  } else if (item.categoria === 'AUSENCIA') {
    if (detalhes.quantidadeDias) extras.push(`${detalhes.quantidadeDias} dias`);
    if (detalhes.quantidadeHoras) extras.push(`${detalhes.quantidadeHoras}h/aula`);
  }

  if (extras.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {extras.map((e, i) => (
        <span key={i} className="px-2 py-0.5 bg-white/70 border border-slate-200 rounded text-xs text-slate-600">
          {e}
        </span>
      ))}
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return '—';
  const p = d.split('-');
  return `${p[2]}/${p[1]}/${p[0]}`;
}
