import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ats } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Recalcular próxima vigência
    let proximaVigencia: string | null = null;
    if (body.dataVigencia) {
      const dataVigencia = new Date(body.dataVigencia + 'T00:00:00');
      const proxima = new Date(dataVigencia);
      proxima.setDate(proxima.getDate() + 1825);
      proximaVigencia = proxima.toISOString().split('T')[0];
    }

    const data = await db
      .update(ats)
      .set({
        servidorId: parseInt(body.servidorId),
        numeroQuinquenio: parseInt(body.numeroQuinquenio),
        tipoDescricao: body.tipoDescricao || `${body.numeroQuinquenio}º Quinquênio`,
        dataVigencia: body.dataVigencia,
        dataDoe: body.dataDoe || null,
        valor: body.valor ? String(body.valor) : null,
        proximaVigencia,
        observacao: body.observacao || null,
        status: body.status || 'ATIVO',
        updatedAt: new Date(),
      })
      .where(eq(ats.id, parseInt(id)))
      .returning();

    if (data.length === 0) {
      return NextResponse.json({ error: 'ATS não encontrado' }, { status: 404 });
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
    await db.delete(ats).where(eq(ats.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
