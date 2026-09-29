import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orientacaoEausencia } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await db
      .update(orientacaoEausencia)
      .set({
        servidorId: parseInt(body.servidorId),
        tipo: body.tipo,
        subtipo: body.subtipo || null,
        data: body.data,
        dataInicio: body.dataInicio || null,
        dataFim: body.dataFim || null,
        quantidadeDias: body.quantidadeDias ? parseInt(body.quantidadeDias) : null,
        quantidadeHoras: body.quantidadeHoras ? parseInt(body.quantidadeHoras) : null,
        assunto: body.assunto || null,
        local: body.local || null,
        horaInicio: body.horaInicio || null,
        horaTermino: body.horaTermino || null,
        dataDoeOuEmail: body.dataDoeOuEmail || null,
        observacao: body.observacao || null,
        updatedAt: new Date(),
      })
      .where(eq(orientacaoEausencia.id, parseInt(id)))
      .returning();

    if (data.length === 0) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
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
    await db.delete(orientacaoEausencia).where(eq(orientacaoEausencia.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
