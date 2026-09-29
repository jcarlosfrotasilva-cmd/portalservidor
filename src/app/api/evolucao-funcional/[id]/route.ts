import { NextResponse } from 'next/server';
import { db } from '@/db';
import { evolucaoFuncional } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await db
      .update(evolucaoFuncional)
      .set({
        servidorId: parseInt(body.servidorId),
        tipo: body.tipo,
        transicao: body.transicao,
        nivelOrigem: body.nivelOrigem,
        nivelDestino: body.nivelDestino,
        intersticioAnos: parseInt(body.intersticioAnos),
        dataVigencia: body.dataVigencia,
        dataDoe: body.dataDoe || null,
        observacao: body.observacao || null,
        status: body.status || 'ATIVO',
        updatedAt: new Date(),
      })
      .where(eq(evolucaoFuncional.id, parseInt(id)))
      .returning();

    if (data.length === 0) {
      return NextResponse.json({ error: 'Evolução não encontrada' }, { status: 404 });
    }
    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(evolucaoFuncional).where(eq(evolucaoFuncional.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
