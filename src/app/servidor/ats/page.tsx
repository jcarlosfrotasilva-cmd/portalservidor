'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Award,
  Loader2,
  Printer,
  LogOut,
  Clock,
  Calendar,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function ServidorAtsPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [atsList, setAtsList] = useState<any[]>([]);
  const [calcData, setCalcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cpf = localStorage.getItem('servidor_cpf');
    if (!cpf) {
      router.push('/servidor');
      return;
    }
    loadData(cpf);
  }, [router]);

  const loadData = async (cpf: string) => {
    setLoading(true);
    try {
      const [sRes] = await Promise.all([
        fetch(`/api/servidores/by-cpf?cpf=${cpf}`),
      ]);

      if (sRes.ok) {
        const s = await sRes.json();
        setServidor(s);

        const [atsRes, calcRes] = await Promise.all([
          fetch(`/api/ats?servidorId=${s.id}`),
          fetch(`/api/ats/calculo?servidorId=${s.id}`),
        ]);

        if (atsRes.ok) setAtsList(await atsRes.json());
        if (calcRes.ok) setCalcData(await calcRes.json());
      } else {
        router.push('/servidor');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('servidor_cpf');
    router.push('/servidor');
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const diasRestantes = (): number | null => {
    if (!calcData?.dataProximoAts) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const proximo = new Date(calcData.dataProximoAts + 'T00:00:00');
    const diff = proximo.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <DashboardLayout variant="servidor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Carregando seus dados...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor) return null;

  const totalAts = atsList.length;
  const ultimoQuin = calcData?.ultimoAts || null;
  const proximoQuin = calcData?.proximoQuinquenio;
  const dataProximo = calcData?.dataProximoAts;

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
              Meu ATS
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Adicional por Tempo de Serviço — {servidor.nome}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">EE Profª Marlene Frattini</h2>
            <p className="text-slate-500">Ficha de ATS — {servidor.nome}</p>
            <p className="text-slate-400 text-sm">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Resumo Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalAts}/10</p>
                <p className="text-xs text-slate-500">Quinquênios Aquisidos</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-gradient-brand h-2 rounded-full transition-all"
                style={{ width: `${(totalAts / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">
                  {ultimoQuin ? ultimoQuin.tipoDescricao : '—'}
                </p>
                <p className="text-xs text-slate-500">Último ATS</p>
              </div>
            </div>
            {ultimoQuin && (
              <p className="text-xs text-slate-400">Vigência: {formatDate(ultimoQuin.dataVigencia)}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                proximoQuin && proximoQuin <= 10 ? 'bg-green-100' : 'bg-slate-100'
              }`}>
                <TrendingUp className={`w-5 h-5 ${
                  proximoQuin && proximoQuin <= 10 ? 'text-green-600' : 'text-slate-400'
                }`} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">
                  {proximoQuin && proximoQuin <= 10 ? calcData?.descricaoProximo : 'Completo!'}
                </p>
                <p className="text-xs text-slate-500">Próximo ATS</p>
              </div>
            </div>
            {proximoQuin && proximoQuin <= 10 && (() => {
              const dr = diasRestantes();
              return (
                <p className="text-xs text-green-600 font-medium">
                  Em {dr !== null ? `${Math.abs(dr)} dias` : '—'}
                  {dr !== null && dr < 0 ? ' (vencido)' : ''}
                </p>
              );
            })()}
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
              const isNext = proximoQuin === q.num && proximoQuin <= 10;
              return (
                <div
                  key={q.num}
                  className={`relative rounded-xl p-3 text-center border-2 transition-all ${
                    cadastrado
                      ? 'bg-green-50 border-green-300'
                      : isNext
                      ? 'bg-brand-50 border-brand-400'
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
                      <ArrowRight className="w-3 h-3 text-white" />
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
              <span className="w-3 h-3 rounded-full bg-green-500" /> Aquisido
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-brand-500" /> Próximo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-slate-300" /> Pendente
            </span>
          </div>
        </div>

        {/* Lista de ATS */}
        {atsList.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum ATS cadastrado</h3>
            <p className="text-slate-400 text-sm">
              Nenhum quinquênio foi registrado para o seu perfil funcional.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                Quinquênios Adquiridos
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {atsList.map((a) => (
                <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{a.tipoDescricao}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Vigência: {formatDate(a.dataVigencia)}
                        </span>
                        {a.dataDoe && (
                          <span className="flex items-center gap-1">
                            DOE: {formatDate(a.dataDoe)}
                          </span>
                        )}
                      </div>
                      {a.observacao && (
                        <p className="text-xs text-slate-400 mt-1 italic">{a.observacao}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {a.valor && (
                      <p className="font-bold text-green-600">R$ {Number(a.valor).toFixed(2)}</p>
                    )}
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 mt-1">
                      Aquisido
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cálculo Info */}
        {ultimoQuin && proximoQuin && proximoQuin <= 10 && (
          <div className="bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-200 rounded-2xl p-5 no-print">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-brand-800 text-sm">Cálculo do Próximo ATS</h4>
                <p className="text-sm text-brand-700 mt-1">
                  {ultimoQuin.tipoDescricao} vigência em {formatDate(ultimoQuin.dataVigencia)} + 1.825 dias ={' '}
                  <strong>{calcData.descricaoProximo} em {dataProximo ? formatDate(dataProximo) : '—'}</strong>
                </p>
              </div>
            </div>
          </div>
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
