'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Printer, LogOut, Search, Award, TrendingUp, Calendar, FileText,
  BookOpen, Briefcase, UserX, Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIA_CONFIG: Record<string, { label: string; icon: any; cor: string; bgCard: string }> = {
  POSSE: { label: 'Posse/Admissão', icon: Briefcase, cor: 'bg-blue-100 text-blue-700 border-blue-300', bgCard: 'bg-blue-50/30 border-l-4 border-blue-500' },
  ATS: { label: 'ATS - Quinquênio', icon: Award, cor: 'bg-amber-100 text-amber-700 border-amber-300', bgCard: 'bg-amber-50/30 border-l-4 border-amber-500' },
  EVOLUCAO: { label: 'Evolução Funcional', icon: TrendingUp, cor: 'bg-emerald-100 text-emerald-700 border-emerald-300', bgCard: 'bg-emerald-50/30 border-l-4 border-emerald-500' },
  LICENCA_PREMIO: { label: 'Licença Prêmio', icon: Calendar, cor: 'bg-purple-100 text-purple-700 border-purple-300', bgCard: 'bg-purple-50/30 border-l-4 border-purple-500' },
  LICENCA_PREMIO_FRUICAO: { label: 'Fruição LP', icon: Clock, cor: 'bg-indigo-100 text-indigo-700 border-indigo-300', bgCard: 'bg-indigo-50/30 border-l-4 border-indigo-500' },
  OT: { label: 'Orientação Técnica', icon: BookOpen, cor: 'bg-orange-100 text-orange-700 border-orange-300', bgCard: 'bg-orange-50/30 border-l-4 border-orange-500' },
  AUSENCIA: { label: 'Ausência', icon: UserX, cor: 'bg-red-100 text-red-700 border-red-300', bgCard: 'bg-red-50/30 border-l-4 border-red-500' },
};

export default function ServidorFichaFuncionalPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [ficha, setFicha] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroAno, setFiltroAno] = useState<string>('TODOS');
  const router = useRouter();

  useEffect(() => {
    const cpf = localStorage.getItem('servidor_cpf');
    if (!cpf) { router.push('/servidor'); return; }
    loadFicha(cpf);
  }, [router]);

  const loadFicha = async (cpf: string) => {
    setLoading(true);
    try {
      const sRes = await fetch(`/api/servidores/by-cpf?cpf=${cpf}`);
      if (!sRes.ok) { router.push('/servidor'); return; }
      const s = await sRes.json();
      setServidor(s);

      const fRes = await fetch(`/api/ficha-funcional?servidorId=${s.id}`);
      if (fRes.ok) setFicha(await fRes.json());
    } catch { /* */ }
    finally { setLoading(false); }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const p = d.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  // Filtragem
  const timelineFiltrada = ficha?.timeline?.filter((item: any) => {
    if (filtroCategoria !== 'TODAS' && item.categoria !== filtroCategoria) return false;
    if (filtroAno !== 'TODOS') {
      const ano = item.data ? new Date(item.data + 'T00:00:00').getFullYear() : null;
      if (ano !== parseInt(filtroAno)) return false;
    }
    return true;
  }) || [];

  const anosDisponiveis = ficha?.estatisticas?.porAno
    ? Object.keys(ficha.estatisticas.porAno).sort((a, b) => parseInt(b) - parseInt(a))
    : [];

  if (loading) {
    return (
      <DashboardLayout variant="servidor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor || !ficha) return null;

  const { estatisticas } = ficha;
  const catConfig = (cat: string) => CATEGORIA_CONFIG[cat] || CATEGORIA_CONFIG.OT;

  // Calcular tempo de serviço
  const primeiroRegistro = [...(ficha.timeline || [])].sort((a, b) => (a.data || '').localeCompare(b.data || ''))[0];
  let tempoServico = null;
  if (primeiroRegistro?.data) {
    const inicio = new Date(primeiroRegistro.data + 'T00:00:00');
    const hoje = new Date();
    const diff = hoje.getTime() - inicio.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    tempoServico = {
      anos: Math.floor(dias / 365),
      meses: Math.floor((dias % 365) / 30),
      dias: dias % 30,
    };
  }

  return (
    <DashboardLayout variant="servidor">
      <div id="print-area">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </span>
              Minha Ficha Funcional
            </h1>
            <p className="text-slate-500 text-sm mt-1">{servidor.nome} — Prontuário completo</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={() => { localStorage.removeItem('servidor_cpf'); localStorage.removeItem('servidor_logged'); router.push('/servidor'); }} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{servidor.nome}</h2>
              <p className="text-indigo-100 text-sm mt-1">{servidor.cargo || '—'} • {servidor.categoria || '—'}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-indigo-100">
                <span>CPF: {servidor.cpf}</span>
                {servidor.nivel && <span>• Nível: {servidor.nivel}</span>}
                {servidor.lotacao && <span>• Lotação: {servidor.lotacao}</span>}
              </div>
            </div>
            {tempoServico && (
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center min-w-32">
                <p className="text-xs text-indigo-100">Tempo de Serviço</p>
                <p className="text-2xl font-bold mt-1">{tempoServico.anos}a {tempoServico.meses}m</p>
                <p className="text-xs text-indigo-100">{tempoServico.dias}d</p>
              </div>
            )}
          </div>
        </div>

        {/* Cabeçalho impressão */}
        <div className="hidden print:block mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">FICHA FUNCIONAL</h2>
          <p className="text-slate-600">EE Profª Marlene Frattini</p>
          <div className="mt-4 space-y-1 text-sm text-slate-700">
            <p><strong>Servidor:</strong> {servidor.nome}</p>
            <p><strong>CPF:</strong> {servidor.cpf} • <strong>Cargo:</strong> {servidor.cargo || '—'}</p>
            <p><strong>Categoria:</strong> {servidor.categoria || '—'} • <strong>Nível:</strong> {servidor.nivel || '—'}</p>
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 no-print">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFiltroCategoria('TODAS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filtroCategoria === 'TODAS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Todas ({estatisticas.totalRegistros})
            </button>
            {Object.entries(CATEGORIA_CONFIG).map(([key, cfg]) => {
              const count = ficha.timeline.filter((r: any) => r.categoria === key).length;
              if (count === 0) return null;
              return (
                <button key={key} onClick={() => setFiltroCategoria(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${filtroCategoria === key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <cfg.icon className="w-3 h-3" /> {cfg.label} ({count})
                </button>
              );
            })}
          </div>
          {anosDisponiveis.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
              <button onClick={() => setFiltroAno('TODOS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filtroAno === 'TODOS' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                Todos os anos
              </button>
              {anosDisponiveis.map(ano => (
                <button key={ano} onClick={() => setFiltroAno(ano)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filtroAno === ano ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {ano} ({estatisticas.porAno[ano]})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
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
            <div>
              {timelineFiltrada.map((item: any) => {
                const cfg = catConfig(item.categoria);
                const Icon = cfg.icon;
                return (
                  <div key={item.id} className={`px-6 py-4 ${cfg.bgCard}`}>
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
                        {renderDetalhes(item, formatDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden print:block text-center text-sm text-slate-400 pt-8 mt-8 border-t border-slate-300">
          <p>Portal do Servidor — EE Profª Marlene Frattini</p>
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
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

function renderDetalhes(item: any, formatDate: (d: string | null) => string) {
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
