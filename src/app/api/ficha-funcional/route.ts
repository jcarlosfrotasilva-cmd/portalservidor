import { db } from '@/db';
import { servidores, ats, evolucaoFuncional, licencaPremioCertidao, licencaPremioFruicao, orientacaoEausencia } from '@/db/schema';
import { eq, asc, desc, and, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Ficha Funcional Consolidada
 * Busca e unifica todos os registros funcionais de um servidor em uma única timeline
 */

// Mapeamento dos subtipos de O.T./Ausência para labels
const SUBTIPOS_AUSENCIA: Record<string, string> = {
  ORIENTACAO_TECNICA: 'Orientação Técnica',
  FALTA_JUSTIFICADA: 'Falta Justificada',
  FALTA_INJUSTIFICADA: 'Falta Injustificada',
  FALTA_MEDICA: 'Falta Médica',
  FALTA_TOTAL: 'Falta Total',
  FALTA_MEDICA_PARCIAL: 'Falta Médica Parcial',
  FALTA_AULA: 'Falta de Aula',
  LICENCA_SAUDE: 'Licença Saúde',
  AUXILIO_DOENCA: 'Auxílio-Doença',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (!servidorId) {
      return NextResponse.json({ error: 'servidorId é obrigatório' }, { status: 400 });
    }

    const sid = parseInt(servidorId);

    // Buscar dados do servidor
    const servidorData = await db
      .select()
      .from(servidores)
      .where(eq(servidores.id, sid))
      .limit(1);

    if (servidorData.length === 0) {
      return NextResponse.json({ error: 'Servidor não encontrado' }, { status: 404 });
    }

    const servidor = servidorData[0];

    // Buscar todos os registros do servidor em paralelo
    const [
      atsRegistros,
      evolucoes,
      certidoesLP,
      registrosOA,
    ] = await Promise.all([
      db.select().from(ats).where(eq(ats.servidorId, sid)).orderBy(asc(ats.dataVigencia)),
      db.select().from(evolucaoFuncional).where(eq(evolucaoFuncional.servidorId, sid)).orderBy(asc(evolucaoFuncional.dataVigencia)),
      db.select().from(licencaPremioCertidao).where(eq(licencaPremioCertidao.servidorId, sid)).orderBy(asc(licencaPremioCertidao.anoCertidao)),
      db.select().from(orientacaoEausencia).where(eq(orientacaoEausencia.servidorId, sid)).orderBy(asc(orientacaoEausencia.data)),
    ]);

    // Buscar fruições de licença prêmio para as certidões do servidor
    const certidaoIds = certidoesLP.map(c => c.id);
    const fruicoesLP = certidaoIds.length > 0
      ? await db.select().from(licencaPremioFruicao).where(or(...certidaoIds.map(id => eq(licencaPremioFruicao.certidaoId, id))))
      : [];

    // Consolidar tudo em uma única timeline
    const timeline: any[] = [];

    // 1. ATS - Quinquênios
    atsRegistros.forEach(ats => {
      timeline.push({
        id: `ats-${ats.id}`,
        data: ats.dataVigencia,
        dataFim: null,
        categoria: 'ATS',
        tipo: ats.tipoDescricao,
        descricao: `${ats.tipoDescricao} - Vigência em ${formatDateBR(ats.dataVigencia)}`,
        detalhes: {
          valor: ats.valor,
          dataDoe: ats.dataDoe,
          proximaVigencia: ats.proximaVigencia,
          observacao: ats.observacao,
        },
        documento: ats.dataDoe,
        moduloOrigem: 'ATS',
      });
    });

    // 2. Evolução Funcional
    evolucoes.forEach(evo => {
      timeline.push({
        id: `evo-${evo.id}`,
        data: evo.dataVigencia,
        dataFim: null,
        categoria: 'EVOLUCAO',
        tipo: evo.tipo,
        descricao: `${evo.tipo}: ${evo.transicao} (Interstício: ${evo.intersticioAnos} anos)`,
        detalhes: {
          transicao: evo.transicao,
          nivelOrigem: evo.nivelOrigem,
          nivelDestino: evo.nivelDestino,
          intersticioAnos: evo.intersticioAnos,
          dataDoe: evo.dataDoe,
          observacao: evo.observacao,
        },
        documento: evo.dataDoe,
        moduloOrigem: 'EVOLUCAO_FUNCIONAL',
      });
    });

    // 3. Licença Prêmio - Certidões
    certidoesLP.forEach(cert => {
      timeline.push({
        id: `lp-cert-${cert.id}`,
        data: cert.periodoInicial,
        dataFim: cert.periodoFinal,
        categoria: 'LICENCA_PREMIO',
        tipo: 'Certidão de Licença Prêmio',
        descricao: `Certidão nº ${cert.numeroCertidao}/${cert.anoCertidao} - Período Aquisitivo`,
        detalhes: {
          numeroCertidao: cert.numeroCertidao,
          anoCertidao: cert.anoCertidao,
          periodoInicial: cert.periodoInicial,
          periodoFinal: cert.periodoFinal,
          dataDoe: cert.dataDoe,
          saldoTotal: cert.saldoTotal,
          saldoUsado: cert.saldoUsado,
          saldoDisponivel: (cert.saldoTotal || 90) - (cert.saldoUsado || 0),
          status: cert.status,
        },
        documento: cert.dataDoe,
        moduloOrigem: 'LICENCA_PREMIO',
      });

      // Adicionar fruições desta certidão
      const fruicoesDaCertidao = fruicoesLP.filter(f => f.certidaoId === cert.id);
      fruicoesDaCertidao.forEach(fruc => {
        timeline.push({
          id: `lp-fruc-${fruc.id}`,
          data: fruc.dataInicio || cert.periodoInicial,
          dataFim: fruc.dataFinal || null,
          categoria: 'LICENCA_PREMIO_FRUICAO',
          tipo: fruc.tipo === 'GOZO' ? 'Fruição em Gozo' : 'Fruição em Pecúnia',
          descricao: fruc.tipo === 'GOZO'
            ? `Fruição em Gozo: ${fruc.dias} dias (${formatDateBR(fruc.dataInicio)} → ${formatDateBR(fruc.dataFinal)})`
            : `Fruição em Pecúnia: ${fruc.dias} dias (Ano ${fruc.anoPecunia})`,
          detalhes: {
            tipo: fruc.tipo,
            dias: fruc.dias,
            dataInicio: fruc.dataInicio,
            dataFinal: fruc.dataFinal,
            dataDoeAprovacao: fruc.dataDoeAprovacao,
            anoPecunia: fruc.anoPecunia,
            observacao: fruc.observacao,
            certidaoNumero: cert.numeroCertidao,
            certidaoAno: cert.anoCertidao,
          },
          documento: fruc.dataDoeAprovacao,
          moduloOrigem: 'LICENCA_PREMIO',
        });
      });
    });

    // 4. O.T. e Ausências
    registrosOA.forEach(reg => {
      const subtipoLabel = SUBTIPOS_AUSENCIA[reg.subtipo || ''] || reg.subtipo || 'Ausência';
      const isOT = reg.subtipo === 'ORIENTACAO_TECNICA' || reg.tipo === 'OT';

      let descricao = '';
      if (isOT) {
        descricao = `Orientação Técnica: ${reg.assunto || 'Sem assunto'}`;
        if (reg.local) descricao += ` - Local: ${reg.local}`;
        if (reg.horaInicio && reg.horaTermino) descricao += ` (${reg.horaInicio} - ${reg.horaTermino})`;
      } else {
        descricao = subtipoLabel;
        if (reg.quantidadeDias) descricao += ` - ${reg.quantidadeDias} dias`;
        if (reg.quantidadeHoras) descricao += ` - ${reg.quantidadeHoras}h/aula`;
        if (reg.dataInicio && reg.dataFim) descricao += ` (${formatDateBR(reg.dataInicio)} → ${formatDateBR(reg.dataFim)})`;
      }

      timeline.push({
        id: `oa-${reg.id}`,
        data: reg.data,
        dataFim: reg.dataFim || null,
        categoria: isOT ? 'OT' : 'AUSENCIA',
        tipo: isOT ? 'Orientação Técnica' : subtipoLabel,
        descricao,
        detalhes: {
          subtipo: reg.subtipo,
          assunto: reg.assunto,
          local: reg.local,
          horaInicio: reg.horaInicio,
          horaTermino: reg.horaTermino,
          quantidadeDias: reg.quantidadeDias,
          quantidadeHoras: reg.quantidadeHoras,
          dataInicio: reg.dataInicio,
          dataFim: reg.dataFim,
          dataDoeOuEmail: reg.dataDoeOuEmail,
          observacao: reg.observacao,
        },
        documento: reg.dataDoeOuEmail,
        moduloOrigem: 'OT_AUSENCIA',
      });
    });

    // 5. Dados básicos do servidor (Posse/Admissão)
    if (servidor.dataAdmissao) {
      timeline.push({
        id: `servidor-admissao`,
        data: servidor.dataAdmissao,
        dataFim: null,
        categoria: 'POSSE',
        tipo: 'Admissão/Posse',
        descricao: `Admissão no cargo de ${servidor.cargo || 'servidor'} na EE Profª Marlene Frattini`,
        detalhes: {
          cargo: servidor.cargo,
          categoria: servidor.categoria,
          nivel: servidor.nivel,
          lotacao: servidor.lotacao,
          jornada: servidor.jornada,
          situacao: servidor.situacao,
        },
        documento: null,
        moduloOrigem: 'SERVIDOR',
      });
    }

    // Ordenar cronologicamente (decrescente - mais recente primeiro)
    timeline.sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    // Estatísticas gerais
    const estatisticas = {
      totalRegistros: timeline.length,
      ats: atsRegistros.length,
      evolucoes: evolucoes.length,
      certidoesLP: certidoesLP.length,
      fruicoesLP: fruicoesLP.length,
      ot: registrosOA.filter(r => r.subtipo === 'ORIENTACAO_TECNICA' || r.tipo === 'OT').length,
      ausencias: registrosOA.filter(r => r.subtipo !== 'ORIENTACAO_TECNICA' && r.tipo !== 'OT').length,
      porAno: {} as Record<number, number>,
    };

    timeline.forEach(r => {
      if (r.data) {
        const ano = new Date(r.data + 'T00:00:00').getFullYear();
        estatisticas.porAno[ano] = (estatisticas.porAno[ano] || 0) + 1;
      }
    });

    return NextResponse.json({
      servidor,
      timeline,
      estatisticas,
      totalRegistros: timeline.length,
    });
  } catch (error: any) {
    console.error('Erro ao gerar ficha funcional:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatDateBR(d: string | null): string {
  if (!d) return '—';
  const p = d.split('-');
  return `${p[2]}/${p[1]}/${p[0]}`;
}
