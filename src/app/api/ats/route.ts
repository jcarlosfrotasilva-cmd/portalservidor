import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ats } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Calcula próxima vigência: data da vigência + 1 dia + 1824 dias = 1825 dias contínuos
function calcularProximaVigencia(dataVigencia: string): string {
  const data = new Date(dataVigencia + 'T00:00:00');
  data.setDate(data.getDate() + 1); // 1 dia após
  data.setDate(data.getDate() + 1824); // +1824 dias = total 1825 dias contínuos
  return data.toISOString().split('T')[0];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proximaVigencia = body.dataVigencia ? calcularProximaVigencia(body.dataVigencia) : null;

    const data = await db
      .insert(ats)
      .values({
        servidorId: parseInt(body.servidorId),
        numeroQuinquenio: parseInt(body.numeroQuinquenio),
        tipoDescricao: body.tipoDescricao || `${body.numeroQuinquenio}º Quinquênio`,
        dataVigencia: body.dataVigencia,
        dataDoe: body.dataDoe || null,
        valor: body.valor ? String(body.valor) : null,
        proximaVigencia,
        observacao: body.observacao || null,
        status: 'ATIVO',
      })
      .returning();

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (servidorId) {
      const data = await db
        .select()
        .from(ats)
        .where(eq(ats.servidorId, parseInt(servidorId)))
        .orderBy(ats.numeroQuinquenio);
      return NextResponse.json(data);
    }

    const data = await db.select().from(ats).orderBy(ats.servidorId, ats.numeroQuinquenio);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
