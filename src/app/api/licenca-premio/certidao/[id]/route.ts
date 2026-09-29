import { NextResponse } from 'next/server';
import { db } from '@/db';
import { licencaPremioCertidao } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await db
      .update(licencaPremioCertidao)
      .set({
        numeroCertidao: body.numeroCertidao,
        anoCertidao: parseInt(body.anoCertidao),
        periodoInicial: body.periodoInicial,
        periodoFinal: body.periodoFinal,
        dataDoe: body.dataDoe || null,
        status: body.status || 'ATIVA',
        updatedAt: new Date(),
      })
      .where(eq(licencaPremioCertidao.id, parseInt(id)))
      .returning();

    if (data.length === 0) {
      return NextResponse.json({ error: 'Certidão não encontrada' }, { status: 404 });
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
    await db.delete(licencaPremioCertidao).where(eq(licencaPremioCertidao.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
