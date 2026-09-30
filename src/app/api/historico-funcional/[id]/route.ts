import { db } from '@/db';
import { historicoFuncional } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// PUT - Atualizar registro de histórico
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      categoria,
      tipo,
      descricao,
      data,
      dataFim,
      numeroDocumento,
      dataDocumento,
      observacoes,
      registradoPor,
    } = body;

    if (!categoria || !tipo || !descricao || !data) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: categoria, tipo, descricao, data' },
        { status: 400 }
      );
    }

    const registroAtualizado = await db
      .update(historicoFuncional)
      .set({
        categoria,
        tipo,
        descricao,
        data,
        dataFim: dataFim || null,
        numeroDocumento: numeroDocumento || null,
        dataDocumento: dataDocumento || null,
        observacoes: observacoes || null,
        registradoPor: registradoPor || null,
        updatedAt: new Date(),
      })
      .where(eq(historicoFuncional.id, parseInt(id)))
      .returning();

    if (registroAtualizado.length === 0) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    return NextResponse.json(registroAtualizado[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar registro de histórico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Excluir registro de histórico
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registroExcluido = await db
      .delete(historicoFuncional)
      .where(eq(historicoFuncional.id, parseInt(id)))
      .returning();

    if (registroExcluido.length === 0) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Registro excluído com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir registro de histórico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
