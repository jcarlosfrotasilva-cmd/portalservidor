import { db } from '@/db';
import { requerimentos, requerimentoTramitacoes, servidores } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * API para despacho de requerimentos (gestor)
 * Permite: DEFERIR, INDEFERIR, ou colocar EM_ANALISE
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { decisao, fundamentacaoDecisao, gestorNome, observacoes } = body;

    // Validar decisão
    if (!['DEFERIDO', 'INDEFERIDO', 'PARCIAL', 'EM_ANALISE', 'ARQUIVADO'].includes(decisao)) {
      return NextResponse.json(
        { error: 'Decisão inválida. Use: DEFERIDO, INDEFERIDO, PARCIAL, EM_ANALISE ou ARQUIVADO' },
        { status: 400 }
      );
    }

    // Se indeferido, fundamentação é obrigatória (princípio da motivação)
    if (decisao === 'INDEFERIDO' && !fundamentacaoDecisao) {
      return NextResponse.json(
        { error: 'Decisão de indeferimento deve conter fundamentação jurídica' },
        { status: 400 }
      );
    }

    // Buscar requerimento atual
    const requerimentoAtual = await db
      .select()
      .from(requerimentos)
      .where(eq(requerimentos.id, parseInt(id)))
      .limit(1);

    if (requerimentoAtual.length === 0) {
      return NextResponse.json({ error: 'Requerimento não encontrado' }, { status: 404 });
    }

    const statusAnterior = requerimentoAtual[0].status;

    // Mapear decisão para status
    const statusMap: Record<string, string> = {
      'DEFERIDO': 'DEFERIDO',
      'INDEFERIDO': 'INDEFERIDO',
      'PARCIAL': 'PARCIAL',
      'EM_ANALISE': 'EM_ANALISE',
      'ARQUIVADO': 'ARQUIVADO',
    };

    const novoStatus = statusMap[decisao];
    const dataDecisao = ['DEFERIDO', 'INDEFERIDO', 'PARCIAL', 'ARQUIVADO'].includes(decisao)
      ? new Date()
      : null;

    // Atualizar requerimento
    const atualizado = await db
      .update(requerimentos)
      .set({
        status: novoStatus,
        decisao,
        fundamentacaoDecisao: fundamentacaoDecisao || null,
        dataDecisao,
        observacoes: observacoes || requerimentoAtual[0].observacoes,
        updatedAt: new Date(),
      })
      .where(eq(requerimentos.id, parseInt(id)))
      .returning();

    // Registrar tramitação
    await db.insert(requerimentoTramitacoes).values({
      requerimentoId: parseInt(id),
      statusAnterior,
      statusNovo: novoStatus,
      observacao: fundamentacaoDecisao || `Decisão: ${decisao}`,
      responsavel: gestorNome || 'Gestor',
      tipoResponsavel: 'GESTOR',
    });

    return NextResponse.json(atualizado[0]);
  } catch (error: any) {
    console.error('Erro ao despachar requerimento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Buscar requerimento específico com histórico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requerimento = await db
      .select()
      .from(requerimentos)
      .where(eq(requerimentos.id, parseInt(id)))
      .limit(1);

    if (requerimento.length === 0) {
      return NextResponse.json({ error: 'Requerimento não encontrado' }, { status: 404 });
    }

    // Buscar histórico de tramitações
    const tramitacoes = await db
      .select()
      .from(requerimentoTramitacoes)
      .where(eq(requerimentoTramitacoes.requerimentoId, parseInt(id)))
      .orderBy(requerimentoTramitacoes.dataTramitacao);

    // Buscar dados do servidor
    const servidor = await db
      .select()
      .from(servidores)
      .where(eq(servidores.id, requerimento[0].servidorId))
      .limit(1);

    return NextResponse.json({
      ...requerimento[0],
      servidor: servidor[0],
      tramitacoes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
