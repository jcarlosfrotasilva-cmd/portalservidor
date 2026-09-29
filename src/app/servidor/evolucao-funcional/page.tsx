'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, Printer, LogOut, Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NIVEIS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export default function ServidorEvolucaoPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [evolucoes, setEvolucoes] = useState<any[]>([]);
  const [calcData, setCalcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cpf = localStorage.getItem('servidor_cpf');
    if (!cpf) { router.push('/servidor'); return; }
    loadData(cpf);
  }, [router]);

  const loadData = async (cpf: string) => {
    setLoading(true);
    try {
      const sRes = await fetch(`/api/servidores/by-cpf?cpf=${cpf}`);
      if (sRes.ok) {
        const s = await sRes.json();
        setServidor(s);
        const [eRes, cRes] = await Promise.all([
          fetch(`/api/evolucao-funcional?servidorId=${s.id}`),
          fetch(`/api/evolucao-funcional/calculo?servidorId=${s.id}`),
        ]);
        if (eRes.ok) setEvolucoes(await eRes.json());
        if (cRes.ok) setCalcData(await cRes.json());
      } else { router.push('/servidor'); }
    } catch { /* */ }
    finally { setLoading(false); }
  };

  const formatDate = (d: string | null) => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };

  if (loading) {
    return (
      <DashboardLayout variant="servidor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor) return null;

  const nivelAtual = calcData?.nivelAtual || servidor.nivel || 'I';
  const nivelIdx = NIVEIS.indexOf(nivelAtual);

  return (
    <DashboardLayout variant="servidor">
      <div id="print-area">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </span>
              Minha Evolução Funcional
            </h1>
            <p className="text-slate-500 text-sm mt-1">{servidor.nome} — {servidor.cargo}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={() => { localStorage.removeItem('servidor_cpf'); router.push('/servidor'); }} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        <div className="hidden print:flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">EE Profª Marlene Frattini</h2>
            <p className="text-slate-500">Evolução Funcional — {servidor.nome}</p>
            <p className="text-slate-400 text-sm">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {!calcData?.elegivel ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-amber-800 text-lg">Não Elegível</h3>
            <p className="text-sm text-amber-700 mt-1 max-w-lg mx-auto">{calcData?.motivo}</p>
            <p className="text-xs text-amber-600 mt-3">Apenas PEB I, PEB II e Diretor de Escola com categoria A-EFETIVO ou ACT-F têm direito à evolução funcional.</p>
          </div>
        ) : (
          <>
            {/* Cards Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-brand-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{evolucoes.length}/7</p>
                    <p className="text-xs text-slate-500">Evoluções Realizadas</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-gradient-brand h-2 rounded-full transition-all" style={{ width: `${(evolucoes.length / 7) * 100}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-purple-600" /></div>
                  <div>
                    <p className="text-lg font-bold text-slate-800">Nível {nivelAtual}</p>
                    <p className="text-xs text-slate-500">Nível Atual</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${calcData?.proximoTipo ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <TrendingUp className={`w-5 h-5 ${calcData?.proximoTipo ? 'text-green-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800">{calcData?.proximoTipo || 'Completo!'}</p>
                    <p className="text-xs text-slate-500">Próxima Evolução</p>
                  </div>
                </div>
                {calcData?.proximoTipo && calcData?.dataProximo && (
                  <p className="text-xs text-green-600 font-medium">Prevista para {formatDate(calcData.dataProximo)}</p>
                )}
              </div>
            </div>

            {/* Mapa de Progressão */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                Progressão de Níveis
              </h3>
              <div className="flex items-center justify-between gap-1">
                {NIVEIS.map((n, i) => {
                  const atingido = evolucoes.some(e => e.nivelDestino === n);
                  const isAtual = nivelAtual === n;
                  return (
                    <div key={n} className="flex items-center flex-1">
                      <div className={`relative rounded-xl p-3 text-center border-2 flex-1 ${
                        atingido ? 'bg-green-50 border-green-300' : isAtual ? 'bg-brand-50 border-brand-400' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}>
                        {atingido && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <p className={`text-xl font-bold ${atingido ? 'text-green-700' : isAtual ? 'text-brand-700' : 'text-slate-400'}`}>{n}</p>
                        {isAtual && !atingido && <p className="text-xs text-brand-500 mt-0.5 font-medium">Atual</p>}
                      </div>
                      {i < NIVEIS.length - 1 && (
                        <div className="w-3 flex-shrink-0 flex justify-center"><ArrowRight className="w-3 h-3 text-slate-300" /></div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-6 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Atingido</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-brand-500" /> Atual</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-300" /> Pendente</span>
              </div>
            </div>

            {/* Lista de Evoluções */}
            {evolucoes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma evolução registrada</h3>
                <p className="text-slate-400 text-sm">Nenhuma evolução funcional foi registrada para o seu perfil.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-600" />
                    Evoluções Realizadas
                  </h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {evolucoes.map((e) => (
                    <div key={e.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-green-600" /></div>
                        <div>
                          <h4 className="font-bold text-slate-800">{e.tipo}</h4>
                          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                            <span>{e.transicao}</span>
                            <span>Interstício: {e.intersticioAnos} anos</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Vigência: {formatDate(e.dataVigencia)}</span>
                            {e.dataDoe && <span>DOE: {formatDate(e.dataDoe)}</span>}
                          </div>
                          {e.observacao && <p className="text-xs text-slate-400 mt-1 italic">{e.observacao}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Realizada</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Print Footer */}
        <div className="hidden print:block text-center text-sm text-slate-400 pt-8">
          <p>Portal do Servidor — EE Profª Marlene Frattini</p>
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
