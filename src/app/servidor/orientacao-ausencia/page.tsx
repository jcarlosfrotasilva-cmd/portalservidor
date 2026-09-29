'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  BookOpen, UserX, Printer, LogOut, Calendar, MapPin, Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SUBTIPOS = [
  { value: 'ORIENTACAO_TECNICA', label: 'Orientação Técnica', tipo: 'OT' },
  { value: 'FALTA_JUSTIFICADA', label: 'Falta Justificada', tipo: 'AUSENCIA' },
  { value: 'FALTA_INJUSTIFICADA', label: 'Falta Injustificada', tipo: 'AUSENCIA' },
  { value: 'FALTA_MEDICA', label: 'Falta Médica', tipo: 'AUSENCIA' },
  { value: 'FALTA_TOTAL', label: 'Falta Total', tipo: 'AUSENCIA' },
  { value: 'FALTA_MEDICA_PARCIAL', label: 'Falta Médica Parcial', tipo: 'AUSENCIA' },
  { value: 'FALTA_AULA', label: 'Falta de Aula' },
  { value: 'LICENCA_SAUDE', label: 'Licença Saúde', tipo: 'AUSENCIA' },
  { value: 'AUXILIO_DOENCA', label: 'Auxílio-Doença', tipo: 'AUSENCIA' },
];

export default function ServidorOrientacaoPage() {
  const [servidor, setServidor] = useState<any>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'TODOS' | 'OT' | 'AUSENCIA'>('TODOS');
  const router = useRouter();

  const loadRegistros = useCallback(async (servidorId: number, tipo: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('servidorId', String(servidorId));
      if (tipo && tipo !== 'TODOS') params.set('tipo', tipo);
      const rRes = await fetch(`/api/orientacao-ausencia?${params}`);
      if (rRes.ok) {
        const data = await rRes.json();
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
    const cpf = localStorage.getItem('servidor_cpf');
    if (!cpf) { router.push('/servidor'); return; }
    setLoading(true);
    fetch(`/api/servidores/by-cpf?cpf=${cpf}`).then(async (res) => {
      if (res.ok) {
        const s = await res.json();
        setServidor(s);
        await loadRegistros(s.id, filtro);
      } else {
        router.push('/servidor');
      }
    });
  }, [router, loadRegistros]);

  // Reload when filtro changes
  useEffect(() => {
    if (servidor) {
      loadRegistros(servidor.id, filtro);
    }
  }, [filtro, servidor, loadRegistros]);

  const formatDate = (d: string | null) => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };
  const getSubtipoLabel = (s: string) => SUBTIPOS.find(x => x.value === s)?.label || s;
  const isOT = (s: string) => SUBTIPOS.find(x => x.value === s)?.tipo === 'OT';

  const otCount = registros.filter(r => isOT(r.subtipo)).length;
  const ausenciaCount = registros.filter(r => !isOT(r.subtipo)).length;

  if (loading) {
    return (
      <DashboardLayout variant="servidor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!servidor) return null;

  return (
    <DashboardLayout variant="servidor">
      <div id="print-area">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </span>
              O.T. e Ausências
            </h1>
            <p className="text-slate-500 text-sm mt-1">{servidor.nome} — {servidor.cargo}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20">
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
            <p className="text-slate-500">Orientação Técnica e Ausências — {servidor.nome}</p>
            <p className="text-slate-400 text-sm">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <button type="button" onClick={() => setFiltro('TODOS')}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'TODOS' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            <p className="text-2xl font-bold">{registros.length}</p>
            <p className="text-xs mt-1">Total Registros</p>
          </button>
          <button type="button" onClick={() => setFiltro('OT')}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'OT' ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}>
            <BookOpen className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{otCount}</p>
            <p className="text-xs mt-1">Orientações Técnicas</p>
          </button>
          <button type="button" onClick={() => setFiltro('AUSENCIA')}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${filtro === 'AUSENCIA' ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'}`}>
            <UserX className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{ausenciaCount}</p>
            <p className="text-xs mt-1">Ausências</p>
          </button>
        </div>

        {/* Registros (ordenados por data crescente) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {registros.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...registros]
                .sort((a, b) => (a.data || '').localeCompare(b.data || ''))
                .map(r => {
                  // Destaque do assunto/detalhes principal
                  const destaquePrincipal = isOT(r.subtipo)
                    ? r.assunto
                    : [
                        r.quantidadeDias && `${r.quantidadeDias} dias`,
                        r.quantidadeHoras && `${r.quantidadeHoras} hora(s)/aula`,
                        r.dataInicio && r.dataFim && `${formatDate(r.dataInicio)} → ${formatDate(r.dataFim)}`,
                      ].filter(Boolean).join(' • ');
                  return (
                    <div key={r.id} className={`px-6 py-5 ${isOT(r.subtipo) ? 'bg-gradient-to-r from-orange-50/50 to-transparent' : 'bg-gradient-to-r from-red-50/50 to-transparent'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isOT(r.subtipo) ? 'bg-orange-100' : 'bg-red-100'
                        }`}>
                          {isOT(r.subtipo) ? <BookOpen className="w-6 h-6 text-orange-600" /> : <UserX className="w-6 h-6 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isOT(r.subtipo) ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isOT(r.subtipo) ? 'Orientação Técnica' : getSubtipoLabel(r.subtipo || '')}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" /> {formatDate(r.data)}
                            </span>
                          </div>

                          {/* ASSUNTO/DETALHES DESTACADO */}
                          {destaquePrincipal && (
                            <p className="font-bold text-slate-900 text-base mb-2 print-assunto-destaque">
                              {destaquePrincipal}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                            {r.local && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.local}</span>}
                            {r.horaInicio && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.horaInicio}{r.horaTermino ? ` - ${r.horaTermino}` : ''}</span>}
                            {r.dataDoeOuEmail && <span>DOE/E-mail: {r.dataDoeOuEmail}</span>}
                          </div>
                          {r.observacao && <p className="text-xs text-slate-400 mt-1 italic">{r.observacao}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="hidden print:block text-center text-sm text-slate-400 pt-8">
          <p>Portal do Servidor — EE Profª Marlene Frattini</p>
          <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
