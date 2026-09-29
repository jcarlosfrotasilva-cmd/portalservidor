import { NextResponse } from 'next/server';
import { db } from '@/db';
import { evolucaoFuncional } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (servidorId) {
      const data = await db
        .select()
        .from(evolucaoFuncional)
        .where(eq(evolucaoFuncional.servidorId, parseInt(servidorId)))
        .orderBy(evolucaoFuncional.dataVigencia);
      return NextResponse.json(data);
    }

    const data = await db
      .select()
      .from(evolucaoFuncional)
      .orderBy(evolucaoFuncional.servidorId, evolucaoFuncional.dataVigencia);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await db
      .insert(evolucaoFuncional)
      .values({
        servidorId: parseInt(body.servidorId),
        tipo: body.tipo,
        transicao: body.transicao,
        nivelOrigem: body.nivelOrigem,
        nivelDestino: body.nivelDestino,
        intersticioAnos: parseInt(body.intersticioAnos),
        dataVigencia: body.dataVigencia,
        dataDoe: body.dataDoe || null,
        observacao: body.observacao || null,
        status: 'ATIVO',
      })
      .returning();

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
