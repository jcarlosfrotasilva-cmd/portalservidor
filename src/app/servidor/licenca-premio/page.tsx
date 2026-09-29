'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Award, Printer, LogOut, Calendar, Clock, AlertCircle, CheckCircle2,
  ChevronRight, ChevronDown, FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServidorLicencaPremioPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [calcData, setCalcData] = useState<any>(null);
  const [fruiçoes, setFruiçoes] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCert, setExpandedCert] = useState<number | null>(null);
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
        const cRes = await fetch(`/api/licenca-premio/calculo?servidorId=${s.id}`);
        if (cRes.ok) {
          const data = await cRes.json();
          setCalcData(data);
          if (data.certidoes) {
            // Load fruições for each certidão
            for (const cert of data.certidoes) {
              const fRes = await fetch(`/api/licenca-premio/fruicao?certidaoId=${cert.id}`);
              if (fRes.ok) {
                const fData = await fRes.json();
                setFruiçoes(prev => ({ ...prev, [cert.id]: fData }));
              }
            }
          }
        }
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
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor) return null;

  const toggleExpand = (certId: number) => {
    setExpandedCert(expandedCert === certId ? null : certId);
  };

  return (
    <DashboardLayout variant="servidor">
      <div id="print-area">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </span>
              Minha Licença Prêmio
            </h1>
            <p className="text-slate-500 text-sm mt-1">{servidor.nome} — {servidor.cargo}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
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
            <p className="text-slate-500">Licença Prêmio — {servidor.nome}</p>
            <p className="text-slate-400 text-sm">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {!calcData?.elegivel ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-amber-800 text-lg">Não Elegível</h3>
            <p className="text-sm text-amber-700 mt-1">Apenas A-EFETIVO ou ACT-F têm direito à licença prêmio.</p>
          </div>
        ) : (
          <>
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

            {/* Próxima Certidão */}
            {calcData.temProximaCertidao && calcData.proximaCertidao && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-purple-900 text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Próxima Certidão de Licença Prêmio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-purple-700 mb-2 font-medium">Período Aquisitivo:</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatDate(calcData.proximaCertidao.periodoInicial)} → {formatDate(calcData.proximaCertidao.periodoFinal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700 mb-2 font-medium">Status:</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                        calcData.proximaCertidao.statusVencimento === 'VENCIDO' ? 'bg-red-100 text-red-700' :
                        calcData.proximaCertidao.statusVencimento === 'VENCENDO_EM_BREVE' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {calcData.proximaCertidao.diasRestantes < 0
                          ? `Vencido há ${Math.abs(calcData.proximaCertidao.diasRestantes)} dias`
                          : calcData.proximaCertidao.diasRestantes === 0
                          ? 'Vence hoje!'
                          : `Faltam ${calcData.proximaCertidao.diasRestantes} dias`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs text-purple-600">
                    Cálculo: período final da última certidão ({formatDate(calcData.ultimaCertidao.periodoFinal)}) + 1 dia + 1824 dias = {formatDate(calcData.proximaCertidao.periodoFinal)}
                  </p>
                </div>
              </div>
            )}

            {/* Certidões */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Minhas Certidões ({calcData.totalCertidoes})
                </h3>
              </div>

              {calcData.certidoes?.length === 0 ? (
                <div className="text-center py-16">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Nenhuma certidão registrada</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {calcData.certidoes.map((c: any) => {
                    const saldo = (c.saldoTotal ?? 90) - (c.saldoUsado ?? 0);
                    const frs = fruiçoes[c.id] || [];
                    const isExpanded = expandedCert === c.id;
                    return (
                      <div key={c.id}>
                        <div className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50">
                          <button onClick={() => toggleExpand(c.id)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 hover:bg-slate-200">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
                          <div className="w-40 hidden md:block">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                              <span>{saldo} dias livres</span>
                              <span>{c.saldoUsado ?? 0}/90</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${((c.saldoUsado ?? 0) / 90) * 100}%` }} />
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.status === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {c.status}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                            <h4 className="font-semibold text-slate-700 mb-3">Fruições ({frs.length})</h4>
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

        <div className="hidden print:block text-center text-sm text-slate-400 pt-8">
          <p>Portal do Servidor — EE Profª Marlene Frattini</p>
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
