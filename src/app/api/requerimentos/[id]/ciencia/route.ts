import { db } from '@/db';
import { requerimentos, requerimentoTramitacoes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * API para servidor dar ciência do requerimento
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar requerimento
    const requerimento = await db
      .select()
      .from(requerimentos)
      .where(eq(requerimentos.id, parseInt(id)))
      .limit(1);

    if (requerimento.length === 0) {
      return NextResponse.json({ error: 'Requerimento não encontrado' }, { status: 404 });
    }

    // Atualizar ciência do servidor
    const atualizado = await db
      .update(requerimentos)
      .set({
        cienciaServidor: true,
        dataCienciaServidor: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requerimentos.id, parseInt(id)))
      .returning();

    // Registrar tramitação
    await db.insert(requerimentoTramitacoes).values({
      requerimentoId: parseInt(id),
      statusAnterior: requerimento[0].status,
      statusNovo: requerimento[0].status,
      observacao: 'Servidor deu ciência da decisão',
      responsavel: requerimento[0].status, // nome não disponível aqui
      tipoResponsavel: 'SERVIDOR',
    });

    return NextResponse.json(atualizado[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
